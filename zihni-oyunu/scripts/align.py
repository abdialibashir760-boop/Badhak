"""Align the supplied narration recordings to the script.

The supplied TTS files contain a uniform ~0.45s pause between sentences. We detect those
pauses with ffmpeg, then use dynamic programming to assign contiguous speech segments to the
script's sentences (matching expected duration from word count). Output: work/alignment.json
"""
import json, re, subprocess, math, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANG = os.environ.get("LANG_ID", "en")
CFG = {
    "en": {"files": ["public/audio/vo1.mp3", "public/audio/vo2.mp3"], "script": "scripts/narration.txt", "lines": False},
    "tr": {"files": ["tr/audio/a2.mp3", "tr/audio/a3.mp3", "tr/audio/a4.mp3"], "script": "tr/narration_tr.txt", "lines": True},
}[LANG]
FILES = CFG["files"]
MERGE = 0.0
HARD_GAP = 99  # a pause this long always separates two sentences

def sentences():
    out = []
    for line in open(os.path.join(ROOT, CFG["script"]), encoding="utf-8").read().splitlines():
        if CFG["lines"]:
            if line.strip():
                out.append(line.strip())
            continue
        for p in re.findall(r"[^.?:]+[.?:]?[’‘]?", line):
            if p.strip():
                out.append(p.strip())
    return out

def duration(f):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True)
    return float(r.stdout)

def speech_segments(f):
    dur = duration(f)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "silencedetect=" + ("noise=-32dB:d=0.18" if LANG == "tr" else "noise=-35dB:d=0.35"), "-f", "null", "-"], capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", r.stderr)]
    segs, cur = [], 0.0
    for s, e in zip(starts, ends):
        if s - cur > 0.1:
            segs.append((cur, s))
        cur = e
    if dur - cur > 0.15:
        segs.append((cur, dur))
    if MERGE:  # short gaps are pauses *inside* a sentence
        out = [segs[0]]
        for a, b in segs[1:]:
            if a - out[-1][1] < MERGE:
                out[-1] = (out[-1][0], b)
            else:
                out.append((a, b))
        segs = out
    return segs, dur

def main():
    sents = sentences()
    words = [len(re.findall(r"[aeıioöuüAEIİOÖUÜâî]", s)) / 2.2 + 0.0 if LANG == "tr" else len(re.findall(r"\w+", s)) + 0.0 for s in sents]
    segs, durs = [], []
    bounds = []
    for k, f in enumerate(FILES):
        s, d = speech_segments(os.path.join(ROOT, f))
        if k >= 1:
            bounds.append(len(segs))
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
            for c in range(1, 9 if LANG == "tr" else 5):
                a = j - c
                if a < 0 or dp[i - 1][a] >= INF:
                    continue
                if any(a < bd < j for bd in bounds):  # may not straddle a file boundary
                    continue
                if any(segs[q][0] - segs[q - 1][1] >= HARD_GAP for q in range(a + 1, j)):
                    continue
                act = segs[j - 1][1] - segs[a][0] if segs[a][2] == segs[j - 1][2] else INF
                if act >= INF:
                    continue
                gaps = sum(segs[q][0] - segs[q - 1][1] for q in range(a + 1, j)) if LANG == "tr" else 0
                cost = math.log(max(act - (0.6 * gaps if LANG == "tr" else 0), 0.2) / exp) ** 2 + 0.04 * (c - 1) + (1.2 * gaps * gaps if LANG == "tr" else 0)
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
        out.append({"i": i, "text": sents[i], "file": segs[a][2], "start": segs[a][0], "end": segs[b - 1][1], "segs": b - a, "parts": [[x[0], x[1]] for x in segs[a:b]]})
        print(f"{i:3d} f{segs[a][2]} {segs[a][0]:7.2f}-{segs[b-1][1]:7.2f} ({segs[b-1][1]-segs[a][0]:5.2f}s, {words[i]:.0f}w, {b-a}seg) {sents[i][:50]}")
    os.makedirs(os.path.join(ROOT, "work"), exist_ok=True)
    json.dump({"durations": durs, "sentences": out}, open(os.path.join(ROOT, "work/alignment.json"), "w"), ensure_ascii=False, indent=1)

main()
