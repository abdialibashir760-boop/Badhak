#!/usr/bin/env python3
"""Turn the narrator's Turkish recordings into the video timeline.

Usage:
  python3 tools/ingest_tr.py RECORDINGS_DIR [--dry-run]

RECORDINGS_DIR holds one audio file per scene, named after the scene id:
  01, 02, 03, 04, 05, 05B, 06, 07, 08, 09, 09B, 10, 10B, 11, 12, 13   (.wav .mp3 .m4a .aac .ogg .flac)
Leave a clear pause (about 1 second of silence) between sentences; the tool finds the sentence
boundaries from those pauses and checks the count against src/script_tr.json.

Fallback for a noisy scene: instead of 05.wav, make a folder 05/ with one file per sentence
(01.wav, 02.wav, ...), in order.

Writes: src/timeline_tr.json, public/vo_tr.m4a, chapters_tr.txt.   Needs only ffmpeg + python3.
"""
import json, os, re, subprocess, sys, tempfile, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXT = (".wav", ".mp3", ".m4a", ".aac", ".ogg", ".flac", ".aiff", ".aif", ".opus", ".webm")
GAP, SCENE_TAIL, LAST_TAIL, PAD = 0.30, 1.1, 2.5, 0.10   # seconds
SR = 24000

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
    return float(r.stdout.strip())

def silences(path, thr, mind):
    r = run(["ffmpeg", "-hide_banner", "-i", path, "-af", f"silencedetect=n={thr}dB:d={mind}", "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return starts, ends

def speech_segments(path, thr, mind, total):
    starts, ends = silences(path, thr, mind)
    segs, cur = [], 0.0
    for i, s in enumerate(starts):
        if s - cur > 0.15: segs.append((cur, s))
        cur = ends[i] if i < len(ends) else total
    if total - cur > 0.15: segs.append((cur, total))
    return segs

def find_segments(path, n):
    total = duration(path)
    tried = {}
    for thr in (-38, -42, -34, -46, -30, -50):
        for mind in (0.9, 0.8, 0.7, 0.6, 0.5, 0.42, 0.35):
            segs = speech_segments(path, thr, mind, total)
            tried[(thr, mind)] = len(segs)
            if len(segs) == n: return segs, tried
    return None, tried

def scene_files(rec):
    found = {}
    for name in sorted(os.listdir(rec)):
        full = os.path.join(rec, name)
        base = os.path.splitext(name)[0] if os.path.isfile(full) else name
        if os.path.isfile(full) and not name.lower().endswith(EXT): continue
        m = re.match(r"^(?:scene[_ -]?|s)?0*(\d+)\s*([bB]?)$", base.strip())
        if m: found[m.group(1) + m.group(2).upper()] = full
    return found

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    if not args: print(__doc__); sys.exit(1)
    rec = args[0]
    script = json.load(open(os.path.join(ROOT, "src", "script_tr.json"), encoding="utf8"))
    order = list(script["scenes"].keys())
    files = scene_files(rec)
    missing = [s for s in order if s not in files]
    if missing:
        print("Missing recordings for scene(s):", ", ".join(missing)); sys.exit(2)
    work = tempfile.mkdtemp(prefix="ingest_")
    timeline = {"total": 0.0, "scenes": []}
    scene_wavs, cursor = [], 0.0
    for sid in order:
        sentences = script["scenes"][sid]; n = len(sentences)
        src = files[sid]
        pieces = []   # list of (wav path, start, end) per sentence
        if os.path.isdir(src):
            parts = sorted(f for f in os.listdir(src) if f.lower().endswith(EXT))
            if len(parts) != n:
                print(f"Scene {sid}: folder has {len(parts)} files but the script has {n} sentences."); sys.exit(2)
            for p in parts:
                full = os.path.join(src, p); pieces.append((full, 0.0, duration(full)))
        else:
            segs, tried = find_segments(src, n)
            if segs is None:
                counts = sorted(set(tried.values()))
                print(f"Scene {sid}: expected {n} sentences but the pauses give {counts}. "
                      f"Re-record with a clear 1-second pause between sentences, or use the per-sentence folder fallback.")
                sys.exit(2)
            pieces = [(src, max(0, a - PAD), b + PAD) for a, b in segs]
        sc = {"id": sid, "title": script["titles"][sid], "start": round(cursor, 3), "sentences": []}
        t = 0.0; clips = []
        for i, (path, a, b) in enumerate(pieces):
            d = b - a
            sc["sentences"].append({"text": sentences[i], "start": round(t, 3), "dur": round(d, 3)})
            clips.append((path, a, b, t)); t += d + GAP
        dur = t - GAP + (LAST_TAIL if sid == order[-1] else SCENE_TAIL)
        sc["dur"] = round(dur, 3); timeline["scenes"].append(sc)
        print(f"Scene {sid:>3}: {n:2d} sentences, {dur:5.1f} s")
        if not dry:
            ins, flt, mix = [], [], ""
            for k, (path, a, b, st) in enumerate(clips):
                ins += ["-i", path]
                d = int(st * 1000)
                flt.append(f"[{k}:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,aresample={SR},aformat=channel_layouts=mono,adelay={d}|{d}[a{k}]")
                mix += f"[a{k}]"
            fc = ";".join(flt) + f";{mix}amix=inputs={len(clips)}:normalize=0,apad=whole_dur={dur:.3f}[o]"
            out = os.path.join(work, f"scene_{sid}.wav")
            r = run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", fc, "-map", "[o]", "-t", f"{dur:.3f}", out])
            if r.returncode: print(r.stderr); sys.exit(3)
            scene_wavs.append(out)
        cursor += dur
    timeline["total"] = round(cursor, 3)
    print(f"Total narration: {cursor/60:.1f} min")
    chapters = "\n".join(f"{int(s['start'])//60}:{int(s['start'])%60:02d} {s['title']}" for s in timeline["scenes"])
    if dry: print(chapters); return
    lst = os.path.join(work, "list.txt")
    open(lst, "w").write("".join(f"file '{p}'\n" for p in scene_wavs))
    full = os.path.join(work, "full.wav")
    r = run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", full])
    if r.returncode: print(r.stderr); sys.exit(3)
    out = os.path.join(ROOT, "public", "vo_tr.m4a")
    r = run(["ffmpeg", "-y", "-v", "error", "-i", full, "-af", "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-c:a", "aac", "-b:a", "128k", out])
    if r.returncode: print(r.stderr); sys.exit(3)
    json.dump(timeline, open(os.path.join(ROOT, "src", "timeline_tr.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
    open(os.path.join(ROOT, "chapters_tr.txt"), "w", encoding="utf8").write(chapters + "\n")
    shutil.rmtree(work, ignore_errors=True)
    print("Wrote src/timeline_tr.json, public/vo_tr.m4a, chapters_tr.txt")

main()
