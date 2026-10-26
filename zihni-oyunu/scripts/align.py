"""Align the supplied narration recordings to the script.

The supplied TTS files contain a uniform ~0.45s pause between sentences. We detect those
pauses with ffmpeg, then use dynamic programming to assign contiguous speech segments to the
script's sentences (matching expected duration from word count). Output: work/alignment.json
"""
import json, re, subprocess, math, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ["public/audio/vo1.mp3", "public/audio/vo2.mp3"]

def sentences():
    out = []
    for line in open(os.path.join(ROOT, "scripts/narration.txt"), encoding="utf-8").read().splitlines():
        for p in re.findall(r"[^.?:]+[.?:]?[’‘]?", line):
            if p.strip():
                out.append(p.strip())
    return out

def duration(f):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True)
    return float(r.stdout)

def speech_segments(f):
    dur = duration(f)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "silencedetect=noise=-35dB:d=0.35", "-f", "null", "-"], capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", r.stderr)]
    segs, cur = [], 0.0
    for s, e in zip(starts, ends):
        if s - cur > 0.15:
            segs.append((cur, s))
        cur = e
    if dur - cur > 0.15:
        segs.append((cur, dur))
    return segs, dur

def main():
    sents = sentences()
    words = [len(re.findall(r"\w+", s)) + 0.0 for s in sents]
    segs, durs = [], []
    boundary = None
    for k, f in enumerate(FILES):
        s, d = speech_segments(os.path.join(ROOT, f))
        if k == 1:
            boundary = len(segs)
        segs += [(a, b, k) for a, b in s]
        durs.append(d)
    n, m = len(sents), len(segs)
    speech = sum(b - a for a, b, _ in segs)
    rate = speech / sum(words)  # seconds per word
    print(f"{n} sentences, {m} segments, {rate:.3f}s/word")
    INF = 1e18
    # dp[i][j]: best cost assigning first i sentences to first j segments
    dp = [[INF] * (m + 1) for _ in range(n + 1)]
    bk = [[None] * (m + 1) for _ in range(n + 1)]
    dp[0][0] = 0
    for i in range(1, n + 1):
        exp = words[i - 1] * rate + 0.25
        for j in range(1, m + 1):
            for c in range(1, 5):
                a = j - c
                if a < 0 or dp[i - 1][a] >= INF:
                    continue
                if a < boundary < j:  # may not straddle the file boundary
                    continue
                act = segs[j - 1][1] - segs[a][0] if segs[a][2] == segs[j - 1][2] else INF
                if act >= INF:
                    continue
                cost = math.log(max(act, 0.2) / exp) ** 2 + 0.04 * (c - 1)
                if dp[i - 1][a] + cost < dp[i][j]:
                    dp[i][j] = dp[i - 1][a] + cost
                    bk[i][j] = a
    assert dp[n][m] < INF, "alignment failed"
    j, assign = m, []
    for i in range(n, 0, -1):
        a = bk[i][j]
        assign.append((a, j))
        j = a
    assign.reverse()
    out = []
    for i, (a, b) in enumerate(assign):
        out.append({"i": i, "text": sents[i], "file": segs[a][2], "start": segs[a][0], "end": segs[b - 1][1], "segs": b - a})
        print(f"{i:3d} f{segs[a][2]} {segs[a][0]:7.2f}-{segs[b-1][1]:7.2f} ({segs[b-1][1]-segs[a][0]:5.2f}s, {words[i]:.0f}w, {b-a}seg) {sents[i][:50]}")
    os.makedirs(os.path.join(ROOT, "work"), exist_ok=True)
    json.dump({"durations": durs, "sentences": out}, open(os.path.join(ROOT, "work/alignment.json"), "w"), ensure_ascii=False, indent=1)

main()
