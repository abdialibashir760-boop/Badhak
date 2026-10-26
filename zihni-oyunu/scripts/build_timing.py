"""Write src/data/timing.json and the assembled narration track work/vo.wav (+ vo.npy)."""
import json, os, wave
import numpy as np
from timeline import *

def main():
    sb, al, ev = load()
    placed, total, frames, out_ev, scenes, sfx = resolve(sb, al, ev)
    srcs = [decode(os.path.join(ROOT, f)) for f in ["public/audio/vo1.mp3", "public/audio/vo2.mp3"]]
    n = int((total + 1) * SR)
    vo = np.zeros(n, dtype=np.float32)
    pad = int(0.18 * SR)  # keep a little natural room tone around each sentence
    for s, (a, b) in zip(al["sentences"], placed):
        src = srcs[s["file"]]
        i0 = max(0, int((s["start"] - 0.18) * SR)); i1 = min(len(src), int((s["end"] + 0.18) * SR))
        chunk = src[i0:i1].copy()
        f = int(0.02 * SR)
        chunk[:f] *= np.linspace(0, 1, f); chunk[-f:] *= np.linspace(1, 0, f)
        o = int((a - (s["start"] - i0 / SR)) * SR)
        o = max(o, 0)
        vo[o:o + len(chunk)] += chunk[: max(0, n - o)]
    peak = np.abs(vo).max()
    vo = vo / peak * 0.89
    os.makedirs(os.path.join(ROOT, "work"), exist_ok=True)
    with wave.open(os.path.join(ROOT, "work/vo.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(vo, -1, 1) * 32767).astype(np.int16).tobytes())
    np.save(os.path.join(ROOT, "work/vo.npy"), vo)
    timing = {
        "fps": sb["fps"], "totalSeconds": total, "totalFrames": frames,
        "sentences": [{"i": s["i"], "text": s["text"], "start": round(a, 3), "end": round(b, 3)} for s, (a, b) in zip(al["sentences"], placed)],
        "events": {k: round(v, 3) for k, v in out_ev.items()},
        "scenes": [{"id": s["id"], "start": round(s["start"], 3)} for s in scenes],
        "sfx": [{**c, "t": round(c["t"], 3)} for c in sfx],
    }
    json.dump(timing, open(os.path.join(ROOT, "src/data/timing.json"), "w"), ensure_ascii=False, indent=1)
    print(f"total {total:.2f}s = {frames} frames; narration ends {placed[-1][1]:.2f}s")
    for s in scenes: print(s)

main()
