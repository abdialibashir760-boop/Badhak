"""Build narration + sound bed + timeline for the San José rescue short.

Usage:
  python3 -I scripts/make_audio.py <kokoro.onnx> <voices.bin>

Writes: public/voiceover.mp3, src/timeline.ts, out/captions.srt
Needs: pip install kokoro-onnx soundfile numpy ; ffmpeg on PATH.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
VOICE = "am_michael"
SPEED = 1.03
SR = 24000
LEAD = 0.5
TAIL = 4.5  # end card

# (id, spoken text, on-screen caption, pause after in seconds)
LINES = [
    ("h1", "Thirty-three miners were trapped two thousand three hundred feet underground.", "33 MINERS WERE TRAPPED 2,300 FEET UNDERGROUND", 0.25),
    ("h2", "The mine had collapsed above them.", "THE MINE HAD COLLAPSED ABOVE THEM", 0.2),
    ("h3", "Their only way out was blocked.", "THEIR ONLY WAY OUT WAS BLOCKED", 0.25),
    ("h4", "And for seventeen days, nobody knew if they were alive.", "FOR 17 DAYS, NOBODY KNEW IF THEY WERE ALIVE", 0.6),
    ("s1", "This is the San José mine incident.", "THIS IS THE SAN JOSÉ MINE INCIDENT", 0.3),
    ("s2", "It began on the afternoon of August fifth, twenty ten.", "IT BEGAN ON THE AFTERNOON OF AUGUST 5, 2010", 0.25),
    ("s3", "Deep in the Atacama Desert, in Chile.", "DEEP IN THE ATACAMA DESERT, IN CHILE", 0.25),
    ("s4", "It was a copper and gold mine.", "IT WAS A COPPER AND GOLD MINE", 0.25),
    ("s5", "Its only way in and out was one long tunnel, winding down into the mountain.", "ITS ONLY WAY IN AND OUT WAS ONE LONG TUNNEL", 0.25),
    ("s6", "All the way down to about two thousand three hundred feet.", "ABOUT 2,300 FEET DOWN", 0.6),
    ("c1", "Then, above the miners, a block of rock as tall as a forty-five-story building broke loose.", "THEN A BLOCK OF ROCK AS TALL AS A 45-STORY BUILDING BROKE LOOSE", 0.25),
    ("c2", "It slid down and cut through the tunnel.", "IT SLID DOWN AND CUT THROUGH THE TUNNEL", 0.35),
    ("c3", "There was a huge blast.", "THERE WAS A HUGE BLAST", 0.4),
    ("c4", "Dust filled the mine.", "DUST FILLED THE MINE", 0.3),
    ("c5", "The only way out was blocked.", "THE ONLY WAY OUT WAS BLOCKED", 0.6),
    ("l1", "Some of the men climbed up a ventilation shaft.", "SOME OF THE MEN CLIMBED UP A VENTILATION SHAFT", 0.25),
    ("l2", "But part of its emergency ladder had never been installed.", "BUT PART OF ITS EMERGENCY LADDER HAD NEVER BEEN INSTALLED", 0.25),
    ("l3", "So they could not go on.", "SO THEY COULD NOT GO ON", 0.6),
    ("sh1", "Their shift boss, Luis Urzúa, took charge.", "THEIR SHIFT BOSS, LUIS URZÚA, TOOK CHARGE", 0.25),
    ("sh2", "They gathered in the shelter.", "THEY GATHERED IN THE SHELTER", 0.25),
    ("sh3", "A small room, deep in the mine.", "A SMALL ROOM DEEP IN THE MINE", 0.4),
    ("f1", "Its emergency food was meant to last two days.", "ITS EMERGENCY FOOD WAS MEANT TO LAST 2 DAYS", 0.3),
    ("f2", "They made it last.", "THEY MADE IT LAST", 0.3),
    ("f3", "Every other day, each man got a tiny bite of tuna, a sip of milk, and half a cracker.", "EVERY OTHER DAY: A BITE OF TUNA, A SIP OF MILK, HALF A CRACKER", 0.6),
    ("u1", "Up on the surface, their families camped outside the mine.", "UP ON THE SURFACE, THEIR FAMILIES CAMPED OUTSIDE", 0.3),
    ("u2", "They called it Camp Hope.", "THEY CALLED IT CAMP HOPE", 0.4),
    ("u3", "Rescuers tried to reach the men.", "RESCUERS TRIED TO REACH THE MEN", 0.25),
    ("u4", "But on August seventh, the mountain moved again.", "BUT ON AUGUST 7, THE MOUNTAIN MOVED AGAIN", 0.5),
    ("d1", "Now the only way to reach them was to drill.", "NOW THE ONLY WAY TO REACH THEM WAS TO DRILL", 0.3),
    ("d2", "Down into the mountain.", "DOWN INTO THE MOUNTAIN", 0.3),
    ("d3", "Toward the shelter.", "TOWARD THE SHELTER", 0.5),
    ("d4", "Underground, the food ran out.", "UNDERGROUND, THE FOOD RAN OUT", 0.3),
    ("d5", "The men had only sips of dirty water.", "THE MEN HAD ONLY SIPS OF DIRTY WATER", 0.3),
    ("d6", "And days went by with almost nothing to eat.", "AND DAYS WENT BY WITH ALMOST NOTHING TO EAT", 0.6),
    ("b1", "On August twenty-second, before dawn.", "ON AUGUST 22, BEFORE DAWN", 0.3),
    ("b2", "Right next to the shelter, a drill broke through.", "RIGHT NEXT TO THE SHELTER, A DRILL BROKE THROUGH", 0.3),
    ("b3", "Two thousand two hundred fifty-seven feet down.", "2,257 FEET DOWN", 0.4),
    ("b4", "The men knocked on the drill pipe.", "THE MEN KNOCKED ON THE DRILL PIPE", 0.4),
    ("b5", "Then they tied a note to its tip.", "THEN THEY TIED A NOTE TO ITS TIP", 0.4),
    ("b6", "On the surface, the drill was pulled up.", "ON THE SURFACE, THE DRILL WAS PULLED UP", 0.3),
    ("b7", "And at its tip was a note.", "AT ITS TIP WAS A NOTE", 0.3),
    ("b8", "Written in red.", "WRITTEN IN RED", 0.4),
    ("b9", "It said: we are fine in the shelter, the thirty-three.", "“WE ARE FINE IN THE SHELTER, THE 33.”", 0.5),
    ("b10", "That afternoon, Chile's president held it up for the cameras.", "THAT AFTERNOON, CHILE'S PRESIDENT HELD IT UP FOR THE CAMERAS", 0.4),
    ("b11", "All thirty-three were alive.", "ALL 33 WERE ALIVE", 0.5),
    ("b12", "But they were still two thousand three hundred feet down.", "BUT THEY WERE STILL 2,300 FEET DOWN", 0.3),
    ("b13", "And officials warned it could take months to get them out.", "OFFICIALS WARNED IT COULD TAKE MONTHS TO GET THEM OUT", 0.7),
    ("b14", "Follow for part two.", "FOLLOW FOR PART 2", 0.0),
]


def srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def main(model: str, voices: str) -> None:
    k = Kokoro(model, voices)
    clips = []
    for lid, say, cap, gap in LINES:
        s, sr = k.create(say, voice=VOICE, speed=SPEED, lang="en-us")
        assert sr == SR
        # trim leading/trailing silence so line timing is tight
        idx = np.where(np.abs(s) > 0.01)[0]
        s = s[max(0, idx[0] - int(0.03 * SR)) : idx[-1] + int(0.08 * SR)]
        clips.append((lid, s.astype(np.float32), cap, gap))

    t = LEAD
    timeline = []
    for lid, s, cap, gap in clips:
        dur = len(s) / SR
        timeline.append({"id": lid, "cap": cap, "start": round(t, 3), "end": round(t + dur, 3)})
        t += dur + gap
    narration_end = timeline[-1]["end"]
    total = narration_end + TAIL

    n = int(total * SR)
    voice = np.zeros(n, dtype=np.float32)
    for (lid, s, _, _), tl in zip(clips, timeline):
        a = int(tl["start"] * SR)
        voice[a : a + len(s)] += s
    peak = np.abs(voice).max()
    voice *= 0.89 / peak

    at = {tl["id"]: tl for tl in timeline}
    rng = np.random.default_rng(7)
    tt = np.arange(n) / SR

    def env(start, dur, a=0.05, r=0.4):
        e = np.zeros(n, dtype=np.float32)
        i0, i1 = int(start * SR), min(n, int((start + dur) * SR))
        m = i1 - i0
        x = np.ones(m, dtype=np.float32)
        na, nr = int(a * SR), int(r * SR)
        x[:na] = np.linspace(0, 1, na)
        x[-nr:] *= np.linspace(1, 0, nr)
        e[i0:i1] = x
        return e

    def lowpass_noise(cut_hz):
        w = rng.standard_normal(n).astype(np.float32)
        k_ = int(SR / cut_hz)
        return np.convolve(w, np.ones(k_) / k_, mode="same").astype(np.float32)

    # ambient: low drone + slow movement of filtered noise, ducked softly under voice
    drone = (np.sin(2 * np.pi * 55 * tt) * 0.5 + np.sin(2 * np.pi * 82.4 * tt + 1.3) * 0.3
             + np.sin(2 * np.pi * 110.3 * tt) * 0.12).astype(np.float32)
    drone *= (0.8 + 0.2 * np.sin(2 * np.pi * 0.07 * tt)).astype(np.float32)
    air = lowpass_noise(900)
    air /= np.abs(air).max()
    bed = drone * 0.055 + air * 0.05
    bed *= np.minimum(1, tt / 2.0) * np.minimum(1, (total - tt) / 2.5)

    fx = np.zeros(n, dtype=np.float32)
    # collapse rumble, blast thump, dust hiss
    rb = lowpass_noise(220); rb /= np.abs(rb).max()
    fx += rb * env(at["c1"]["start"] + 0.4, 5.5, 0.8, 2.5) * 0.45
    th = (np.sin(2 * np.pi * 45 * tt) * np.exp(-(tt - at["c3"]["start"]) * 5) * (tt >= at["c3"]["start"])).astype(np.float32)
    fx += th * 0.7
    ht = lowpass_noise(3000); ht /= np.abs(ht).max()
    fx += ht * env(at["c3"]["start"], 3.0, 0.02, 2.5) * 0.12
    # another smaller rumble when the mountain moves again
    fx += rb * env(at["u4"]["start"] + 0.3, 2.6, 0.4, 1.5) * 0.35
    # drill hum while drilling
    hum = (np.sin(2 * np.pi * 98 * tt) + 0.5 * np.sin(2 * np.pi * 196 * tt + 0.7)).astype(np.float32)
    hum *= (0.7 + 0.3 * np.sin(2 * np.pi * 7.3 * tt)).astype(np.float32)
    fx += hum * env(at["d1"]["start"], at["d3"]["end"] - at["d1"]["start"] + 1.5, 1.0, 1.2) * 0.05
    fx += hum * env(at["d6"]["end"], at["b2"]["end"] - at["d6"]["end"], 1.0, 0.2) * 0.07
    # knocks on the drill pipe
    for k_i in range(5):
        kt = at["b4"]["start"] + 0.35 + k_i * 0.42
        a = int(kt * SR)
        m = int(0.35 * SR)
        x = np.arange(m) / SR
        knock = (np.sin(2 * np.pi * 420 * x) * np.exp(-x * 14) + 0.5 * np.sin(2 * np.pi * 910 * x) * np.exp(-x * 22)).astype(np.float32)
        fx[a : a + m] += knock * 0.22
    # soft rising swell under the reveal
    swell = (np.sin(2 * np.pi * 220 * tt) + np.sin(2 * np.pi * 277.2 * tt) + np.sin(2 * np.pi * 329.6 * tt)).astype(np.float32)
    fx += swell * env(at["b11"]["start"] - 0.2, at["b13"]["end"] - at["b11"]["start"] + 0.8, 1.2, 1.2) * 0.012

    # duck bed + fx a little where narration plays
    vm = np.convolve(np.abs(voice), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same")
    duck = 1.0 - 0.35 * np.clip(vm / 0.08, 0, 1)
    mix = voice + (bed + fx) * duck
    mix = np.tanh(mix * 1.05) * 0.95

    wav = ROOT / "out" / "voiceover.wav"
    wav.parent.mkdir(exist_ok=True)
    sf.write(wav, mix, SR)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-ac", "1", "-b:a", "128k", str(ROOT / "public" / "voiceover.mp3")], check=True)

    ts = "// Generated by scripts/make_audio.py — do not edit by hand.\n"
    ts += "export type Line = { id: string; cap: string; start: number; end: number };\n"
    ts += f"export const NARRATION_END = {narration_end};\nexport const TOTAL_SECONDS = {round(total, 3)};\n"
    ts += "export const LINES: Line[] = " + json.dumps(timeline, ensure_ascii=False, indent=2) + ";\n"
    (ROOT / "src" / "timeline.ts").write_text(ts)

    srt = ""
    for i, tl in enumerate(timeline, 1):
        srt += f"{i}\n{srt_time(tl['start'])} --> {srt_time(tl['end'])}\n{tl['cap']}\n\n"
    (ROOT / "out" / "captions.srt").write_text(srt)
    print(f"narration ends {narration_end:.1f}s, total {total:.1f}s, {len(timeline)} lines")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
