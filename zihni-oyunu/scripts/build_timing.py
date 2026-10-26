"""Write src/data/timing.json and the assembled narration track work/vo.wav (+ vo.npy)."""
import json, os, wave
import numpy as np
from timeline import *

def main():
    sb, al, ev = load()
    placed, total, frames, out_ev, scenes, sfx = resolve(sb, al, ev)
    import align_cfg
    srcs = [decode(os.path.join(ROOT, f)) for f in align_cfg.FILES]
    n = int((total + 1) * SR)
    vo = np.zeros(n, dtype=np.float32)
    pad = int(0.18 * SR)  # keep a little natural room tone around each sentence
    for s, (a, b) in zip(al["sentences"], placed):
        src = srcs[s["file"]]
        f = int(0.02 * SR)
        if TRIM:
            t = a
            parts = s["parts"]
            for qi, (pa, pb) in enumerate(parts):
                i0 = max(0, int((pa - 0.04) * SR)); i1 = min(len(src), int((pb + 0.04) * SR))
                chunk = src[i0:i1].copy()
                chunk[:f] *= np.linspace(0, 1, f); chunk[-f:] *= np.linspace(1, 0, f)
                o = max(int((t - 0.04) * SR), 0)
                vo[o:o + len(chunk)] += chunk[: max(0, n - o)]
                nxt = parts[qi + 1][0] - pb if qi + 1 < len(parts) else 0
                t += (pb - pa) + min(nxt, TRIM["inner"])
            continue
        i0 = max(0, int((s["start"] - 0.18) * SR)); i1 = min(len(src), int((s["end"] + 0.18) * SR))
        chunk = src[i0:i1].copy()
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
