"""Build the global narration timeline (shared by audio synthesis and the Remotion project)."""
import json, os, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100

def load():
    sb = json.load(open(os.path.join(ROOT, "src/data/storyboard.json")))
    al = json.load(open(os.path.join(ROOT, "work/alignment.json")))
    ev = json.load(open(os.path.join(ROOT, "src/data/events.json")))
    return sb, al, ev

def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

LANG = os.environ.get("LANG_ID", "en")
# Turkish recordings have ~1.1 s of dead air between sentences: trim to a natural length.
TRIM = {"tr": {"gap": 0.42, "inner": 0.28}}.get(LANG)

def place(sb, al):
    """Return placed (start,end) seconds for every sentence on the final timeline."""
    sents = al["sentences"]
    placed, t, prev = [], sb["lead"], None
    for s in sents:
        if prev is None:
            start = t
        else:
            gap = TRIM["gap"] if TRIM else (sb["fileGap"] if s["file"] != prev["file"] else s["start"] - prev["end"])
            start = placed[-1][1] + gap
        start += sb["extraPause"].get(str(s["i"]), 0.0)
        if TRIM:
            ps = s["parts"]
            dur = sum(b - a for a, b in ps) + sum(min(ps[q + 1][0] - ps[q][1], TRIM["inner"]) for q in range(len(ps) - 1))
        else:
            dur = s["end"] - s["start"]
        placed.append((start, start + dur))
        prev = s
    return placed

def resolve(sb, al, ev):
    placed = place(sb, al)
    total = placed[-1][1] + sb["tail"]
    fps = sb["fps"]
    frames = int(round(total * fps))
    out_ev, sfx = {}, []
    for scene, items in ev.items():
        for name, e in items.items():
            base = placed[e["s"]][1] if e.get("end") else placed[e["s"]][0]
            t = base + e.get("o", 0.0)
            out_ev[f"{scene}.{name}"] = t
            if e.get("sfx"):
                sfx.append({"t": t, "kind": e["sfx"], "g": e.get("g", 1.0), "id": f"{scene}.{name}"})
    sfx.sort(key=lambda x: x["t"])
    scenes = []
    for k, sc in enumerate(sb["scenes"]):
        start = 0.0 if k == 0 else placed[sc["sentence"]][0] - sc["preroll"]
        scenes.append({"id": sc["id"], "start": start})
    return placed, total, frames, out_ev, scenes, sfx
