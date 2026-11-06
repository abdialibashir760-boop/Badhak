#!/usr/bin/env python3
"""Join aligned narration parts into the Turkish video timeline.

usage: assemble_tr.py PROJECT_DIR OUT_DIR PART1.wav PART1.json [PART2.wav PART2.json ...]
Writes OUT_DIR/timeline_tr.json, OUT_DIR/vo_tr.m4a, OUT_DIR/chapters_tr.txt
(then copy them to PROJECT_DIR/src and PROJECT_DIR/public, or pass OUT_DIR=PROJECT_DIR to place them directly).
Needs only ffmpeg and python3."""
import json, os, subprocess, sys, tempfile

PART_GAP, LEAD, LAST_TAIL = 0.6, 0.4, 2.5
proj, out = sys.argv[1], sys.argv[2]
pairs = list(zip(sys.argv[3::2], sys.argv[4::2]))
script = json.load(open(os.path.join(proj, "src", "script_tr.json"), encoding="utf8"))
order = list(script["scenes"].keys())

def dur(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True)
    return float(r.stdout.strip())

# absolute sentence times on the joined track
sent = []; offset = 0.0; work = tempfile.mkdtemp(prefix="asm_"); wavs = []
for i, (audio, aj) in enumerate(pairs):
    d = json.load(open(aj, encoding="utf8"))
    for s in d["sentences"]:
        sent.append({**s, "a": s["start"] + offset, "b": s["end"] + offset})
    w = os.path.join(work, f"p{i}.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", audio, "-ac", "1", "-ar", "44100", w], check=True)
    wavs.append(w); offset += dur(w)
    if i < len(pairs) - 1:
        sil = os.path.join(work, f"gap{i}.wav")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(PART_GAP), sil], check=True)
        wavs.append(sil); offset += PART_GAP

by = {}
for s in sent: by.setdefault(s["scene"], []).append(s)
present = [sid for sid in order if sid in by]
missing = [sid for sid in order if sid not in by]
if missing: print("WARNING: scenes without narration:", ", ".join(missing))
for sid in present:
    if len(by[sid]) != len(script["scenes"][sid]): sys.exit(f"scene {sid}: {len(by[sid])} aligned vs {len(script['scenes'][sid])} script sentences")

# scene boundaries: just before the first sentence, never inside the previous scene's last sentence
starts = {}
prev_end = 0.0
for sid in present:
    starts[sid] = max(prev_end + 0.05, by[sid][0]["a"] - LEAD)
    prev_end = by[sid][-1]["b"]
timeline = {"total": 0.0, "scenes": []}
for k, sid in enumerate(present):
    st = starts[sid]
    en = starts[present[k + 1]] if k + 1 < len(present) else by[sid][-1]["b"] + LAST_TAIL
    sc = {"id": sid, "title": script["titles"][sid], "start": round(st, 3), "dur": round(en - st, 3), "sentences": []}
    for s in by[sid]:
        sc["sentences"].append({"text": s["text"], "start": round(s["a"] - st, 3), "dur": round(s["b"] - s["a"], 3)})
    timeline["scenes"].append(sc)
timeline["total"] = round(timeline["scenes"][-1]["start"] + timeline["scenes"][-1]["dur"], 3)

os.makedirs(out, exist_ok=True)
lst = os.path.join(work, "list.txt"); open(lst, "w").write("".join(f"file '{p}'\n" for p in wavs))
full = os.path.join(work, "full.wav")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", full], check=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", full, "-af", "highpass=f=60,loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "128k", os.path.join(out, "vo_tr.m4a")], check=True)
json.dump(timeline, open(os.path.join(out, "timeline_tr.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
ch = "\n".join(f"{int(s['start'])//60}:{int(s['start'])%60:02d} {s['title']}" for s in timeline["scenes"])
open(os.path.join(out, "chapters_tr.txt"), "w", encoding="utf8").write(ch + "\n")
print(f"{len(present)} scenes, narration {timeline['total']/60:.1f} min")
for s in timeline["scenes"]: print(f"  {s['id']:>3}  start {s['start']:7.1f}s  dur {s['dur']:6.1f}s  {len(s['sentences'])} sentences")
