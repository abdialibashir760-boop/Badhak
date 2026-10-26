"""Original, license-free music bed + sound effects, synthesised with numpy.

Reads src/data/timing.json (scene starts + sfx cues) and work/vo.npy (narration) and writes
work/music.wav (ducked under the narration), work/sfx.wav, work/narration.wav and a QA mix.
"""
import json, os, wave
import numpy as np
from timeline import ROOT, SR

rng = np.random.default_rng(11)
T = json.load(open(os.path.join(ROOT, "src/data/timing.json")))
vo = np.load(os.path.join(ROOT, "work/vo.npy"))
TOTAL = T["totalSeconds"]
N = int((TOTAL + 1.0) * SR)
tt = np.arange(N) / SR
scene = {s["id"]: s["start"] for s in T["scenes"]}
EV = T["events"]
def ev(k): return EV[k]

def env(points):
    xs, ys = zip(*points)
    return np.interp(tt, xs, ys)

def smooth_env(x, win):
    k = int(win * SR)
    c = np.cumsum(np.insert(np.abs(x), 0, 0))
    out = np.zeros_like(x)
    out[k - 1:] = (c[k:] - c[: len(x) + 1 - k]) / k
    return out

def fft_band(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.clip(np.minimum((f - lo) / (lo * 0.4 + 1), (hi - f) / (hi * 0.4 + 1)), 0, 1)
    return np.fft.irfft(X * g, len(x))

def noise(n): return rng.normal(0, 1, n)
def sine(f, n, ph=0.0): return np.sin(2 * np.pi * f * np.arange(n) / SR + ph)
def adsr(n, a, r, curve=2.0):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na) ** curve
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e
def expdec(n, tau): return np.exp(-np.arange(n) / SR / tau)
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

# ------------------------------------------------------------------------------------------ music
def pad(freqs, dur, gain=1.0, attack=3.0, release=3.0, bright=0.6, vib=0.2):
    n = int(dur * SR)
    out = np.zeros(n)
    tn = np.arange(n) / SR
    for f0 in freqs:
        for det in (-0.004, 0.0, 0.0035):
            f = f0 * (1 + det)
            ph = rng.uniform(0, 6.28)
            v = 1 + vib * 0.012 * np.sin(2 * np.pi * (4.6 + rng.uniform(-0.5, 0.5)) * tn + ph)
            for h in range(1, 7):
                out += np.sin(2 * np.pi * f * h * tn * v + ph * h) * (bright ** (h - 1)) / h
    return out * adsr(n, attack, release) * gain / (len(freqs) * 3)

def piano(f0, dur=4.0, gain=1.0):
    n = int(dur * SR)
    tn = np.arange(n) / SR
    out = np.zeros(n)
    for h, a in enumerate([1, 0.55, 0.3, 0.18, 0.1, 0.06], start=1):
        fh = f0 * h * np.sqrt(1 + 0.0004 * h * h)
        out += a * np.sin(2 * np.pi * fh * tn) * np.exp(-tn / (2.6 / (0.6 + 0.35 * h)))
    out[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
    click = fft_band(noise(n), 800, 3000) * np.exp(-tn / 0.012) * 0.05
    return (out + click) * gain * 0.5

def put(buf, x, t, pan=0.0):
    i = int(t * SR)
    if i >= buf.shape[1] or i < 0: return
    x = x[: buf.shape[1] - i]
    buf[0, i:i + len(x)] += x * (1 - max(0, pan))
    buf[1, i:i + len(x)] += x * (1 + min(0, pan))

music = np.zeros((2, N))
# drone: A1 + E2 with slow beating; the unease is a held minor second added in the dark sections
base = np.zeros(N)
for f0, a in [(55.0, 1.0), (55.35, 0.8), (82.4, 0.5), (110.2, 0.35), (165.0, 0.12)]:
    base += a * np.sin(2 * np.pi * f0 * tt + rng.uniform(0, 6))
base *= (0.85 + 0.15 * np.sin(2 * np.pi * 0.07 * tt))
tension = np.sin(2 * np.pi * 58.3 * tt) * 0.5 + np.sin(2 * np.pi * 116.6 * tt) * 0.2
s = scene
drone_env = env([
    (0, 0), (1.5, 0.55), (ev("opening.freeze"), 0.6), (ev("opening.freeze") + 0.3, 0.12), (ev("opening.title") + 2, 0.5),
    (s["response"] + 3, 0.34), (s["approval"], 0.28), (s["disappearing"] - 2, 0.3), (s["disappearing"] + 20, 0.55),
    (s["firstNo"] - 1, 0.5), (ev("firstNo.pause"), 0.3), (ev("firstNo.say") - 0.6, 0.05), (ev("firstNo.say") + 1.0, 0.0),
    (ev("firstNo.calm"), 0.06), (s["resolution"], 0.08), (s["resolution"] + 6, 0.0), (TOTAL, 0),
])
tens_env = env([(0, 0), (ev("opening.freeze") - 3, 0), (ev("opening.freeze") - 0.2, 0.5), (ev("opening.freeze") + 0.2, 0.0),
                (s["disappearing"], 0), (s["disappearing"] + 25, 0.5), (s["firstNo"], 0.3), (ev("firstNo.pause"), 0.0), (TOTAL, 0)])
mono_drone = base * drone_env * 0.22 + tension * tens_env * 0.07
music[0] += mono_drone; music[1] += mono_drone

# strings / pad chords per section   (start, dur, midi notes, gain, attack, release)
CH = [
    (3.0, 26, [57, 58], 0.05, 6, 4),                              # opening: A + Bb, a held second
    (ev("opening.title") + 0.2, 5, [45, 57, 64, 69], 0.2, 1.4, 2.5),
    (s["response"], 30, [45, 57, 60, 64], 0.2, 5, 3),
    (s["response"] + 30, 32, [41, 53, 60, 65], 0.2, 5, 3),
    (s["approval"], 24, [45, 57, 60, 64], 0.2, 4, 3),
    (s["approval"] + 24, 25, [38, 50, 57, 62], 0.2, 4, 3),
    (s["disappearing"], 22, [38, 50, 56, 62], 0.22, 4, 3),         # D, F, Ab: diminished
    (s["disappearing"] + 20, 24, [36, 48, 55, 60], 0.2, 5, 4),
    (ev("firstNo.calm"), 20, [50, 57, 62], 0.12, 5, 5),            # open fifth returns, very soft
    (s["resolution"], 16, [50, 57, 62, 66], 0.24, 5, 3),           # D major
    (s["resolution"] + 16, 16, [47, 54, 59, 66], 0.22, 4, 3),      # Bm
    (s["final"], 22, [50, 57, 62, 66, 69], 0.26, 5, 3),
    (s["final"] + 22, TOTAL - s["final"] - 22, [43, 50, 59, 66, 69], 0.26, 4, 6),
]
for t0, dur, notes, g, a, r in CH:
    p = pad([midi(m) for m in notes], dur, g, a, r)
    put(music, p, t0, 0.0)
    # slight stereo width: a second detuned copy panned the other way
    put(music, np.roll(p, 40) * 0.5, t0, -0.6)

# heartbeat / low percussion for the approval chase
def thump(f_start=95, f_end=42, dur=0.4, gain=1.0):
    n = int(dur * SR)
    tn = np.arange(n) / SR
    f = f_end + (f_start - f_end) * np.exp(-tn / 0.05)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tn / 0.11) * gain

hb_start, hb_end = ev("approval.l1") - 0.5, ev("approval.slow") + 3.0
t = hb_start
while t < hb_end:
    prog = (t - hb_start) / (ev("approval.flood") - hb_start)
    prog = min(1.0, max(0.0, prog))
    period = 1.05 - 0.55 * prog                     # speeds up
    amp = 0.2 + 0.25 * prog
    if t > ev("approval.slow"): amp *= max(0, 1 - (t - ev("approval.slow")) / 3.0)
    put(music, thump(gain=amp), t)
    put(music, thump(90, 40, 0.35, amp * 0.6), t + 0.2 * period)
    t += period

# piano: sparse and warm, resolution + final
D = [62, 66, 69, 74, 73, 69, 66, 71, 64, 69]
for k, t0 in enumerate(np.arange(s["resolution"] + 3, s["final"] + 28, 1.9)):
    m = D[k % len(D)] - (12 if k % 5 == 4 else 0)
    put(music, piano(midi(m), 4.5, 0.55 if t0 < s["final"] else 0.5), t0 + 0.05 * (k % 3), 0.15 * ((k % 3) - 1))
for t0, m in [(ev("firstNo.calm") + 1.2, 62), (ev("firstNo.calm") + 4.2, 69), (ev("firstNo.maybe1") + 1, 66), (ev("firstNo.danger") + 0.5, 74), (ev("firstNo.loosen") + 0.6, 69)]:
    put(music, piano(midi(m), 5.0, 0.5), t0)
put(music, piano(midi(50), 9.0, 0.7), ev("final.textIn"))
put(music, piano(midi(62), 9.0, 0.5), ev("final.textIn") + 0.6)

# global music envelope (quieter in the refusal, softer overall in the resolution)
m_env = env([
    (0, 0.0), (1.0, 0.9), (s["response"], 0.85), (s["disappearing"] + 30, 1.0), (s["firstNo"], 0.95), (ev("firstNo.pause"), 0.7),
    (ev("firstNo.say") - 0.8, 0.0), (ev("firstNo.say") + 3.0, 0.0), (ev("firstNo.calm") - 2, 0.5), (s["resolution"], 0.8),
    (s["final"], 0.9), (ev("final.white") + 2, 0.9), (TOTAL - 1.5, 0.55), (TOTAL, 0.0),
])
music *= m_env

# duck the music under the narration
vo_pad = np.zeros(N); vo_pad[: min(N, len(vo))] = vo[:N]
# envelope follower at 100 Hz (fast attack look-ahead, ~0.7 s release)
HZ = 100
blk = SR // HZ
nb = N // blk
lvl = np.abs(vo_pad[: nb * blk]).reshape(nb, blk).max(axis=1)
speech = np.clip(lvl / 0.06, 0, 1)
duck_b = speech.copy()
a_rel = np.exp(-1 / (0.7 * HZ)); y = 0.0
for i in range(nb):
    y = max(duck_b[i], y * a_rel); duck_b[i] = y
a_att = np.exp(-1 / (0.15 * HZ)); y = 0.0
for i in range(nb - 1, -1, -1):
    y = max(duck_b[i], y * a_att); duck_b[i] = y
duck = np.interp(np.arange(N) / SR, (np.arange(nb) + 0.5) / HZ, duck_b)
gain = 1 - 0.62 * duck
music *= gain

# --------------------------------------------------------------------------------------------- sfx
def whoosh(dur=0.8, lo=300, hi=2200):
    n = int(dur * SR)
    x = fft_band(noise(n), lo, hi)
    sweep = np.sin(np.linspace(0, np.pi, n)) ** 2
    return x / (np.abs(x).max() + 1e-9) * sweep * 0.7
def nod():
    n = int(0.25 * SR); tn = np.arange(n) / SR
    return (np.sin(2 * np.pi * 170 * tn) * np.exp(-tn / 0.05) + fft_band(noise(n), 1200, 4000) * np.exp(-tn / 0.01) * 0.1) * 0.9
def pluck(f0, dur=1.6):
    n = int(dur * SR); tn = np.arange(n) / SR
    out = sum(a * np.sin(2 * np.pi * f0 * h * tn) * np.exp(-tn / (0.55 / h ** 0.6)) for h, a in [(1, 1), (2, 0.5), (3, 0.3), (4, 0.2), (5, 0.1)])
    return out * 0.5
def creak(dur=0.7, f0=520, f1=760, g=0.4):
    n = int(dur * SR); tn = np.arange(n) / SR
    f = np.linspace(f0, f1, n) * (1 + 0.02 * np.sin(2 * np.pi * 19 * tn))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + fft_band(noise(n), 2000, 5000) * 0.25
    return x * np.sin(np.linspace(0, np.pi, n)) ** 1.5 * g
def bell(f0, dur=1.6, g=0.5):
    n = int(dur * SR); tn = np.arange(n) / SR
    x = np.sin(2 * np.pi * f0 * tn) + 0.5 * np.sin(2 * np.pi * f0 * 2.76 * tn) * np.exp(-tn / 0.3) + 0.3 * np.sin(2 * np.pi * f0 * 1.5 * tn)
    return x * np.exp(-tn / (dur / 4)) * g * adsr(n, 0.003, 0.05, 1)
def pop(f0=620):
    n = int(0.16 * SR); tn = np.arange(n) / SR
    return np.sin(2 * np.pi * (f0 + 300 * np.exp(-tn / 0.02)) * tn) * np.exp(-tn / 0.03) * 0.5
def thud(f0=120, dur=0.5, g=0.8):
    n = int(dur * SR); tn = np.arange(n) / SR
    f = 45 + (f0 - 45) * np.exp(-tn / 0.06)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tn / (dur / 5)) * g
def airy(dur, lo=300, hi=2500, g=0.4, shape=1.0):
    n = int(dur * SR)
    x = fft_band(noise(n), lo, hi)
    e = np.sin(np.linspace(0, np.pi, n)) ** (2 * shape)
    return x / (np.abs(x).max() + 1e-9) * e * g
def swell_tone(f0, dur, g=0.3, up=0.0):
    n = int(dur * SR); tn = np.arange(n) / SR
    f = f0 * (1 + up * tn / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, n)) ** 2 * g
def steps(count=4, gap=0.5, g=0.3):
    out = np.zeros(int((count * gap + 0.3) * SR))
    for i in range(count):
        n = int(0.12 * SR); tn = np.arange(n) / SR
        x = fft_band(noise(n), 90, 700) * np.exp(-tn / 0.025)
        out[int(i * gap * SR): int(i * gap * SR) + n] += x / (np.abs(x).max() + 1e-9) * g * (1 if i % 2 else 0.8)
    return out
def buzz():
    out = np.zeros(int(1.3 * SR))
    for st in (0.0, 0.5):
        n = int(0.32 * SR); tn = np.arange(n) / SR
        x = np.sign(np.sin(2 * np.pi * 150 * tn)) * 0.25 * (np.sin(2 * np.pi * 21 * tn) > 0)
        out[int(st * SR): int(st * SR) + n] += fft_band(x, 80, 900)
    return out
def ticks(count=8, gap=0.5, g=0.35):
    out = np.zeros(int((count * gap + 0.3) * SR))
    for i in range(count):
        n = int(0.05 * SR); tn = np.arange(n) / SR
        x = np.sin(2 * np.pi * (1800 if i % 2 else 1400) * tn) * np.exp(-tn / 0.006)
        out[int(i * gap * SR): int(i * gap * SR) + n] += x * g
    return out
def heartbeats(count=3, gap=1.0, g=0.8):
    out = np.zeros(int((count * gap + 0.8) * SR))
    for i in range(count):
        a = thump(gain=g); b = thump(90, 40, 0.35, g * 0.6)
        o = int(i * gap * SR); out[o:o + len(a)] += a
        o2 = o + int(0.22 * SR); out[o2:o2 + len(b)] += b
    return out
def scratch(dur=0.9, g=0.25):
    n = int(dur * SR)
    x = fft_band(noise(n), 1500, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * np.arange(n) / SR))
    return x / (np.abs(x).max() + 1e-9) * np.sin(np.linspace(0, np.pi, n)) * g
def chord_swell(notes, dur, g=0.3):
    p = pad([midi(m) for m in notes], dur, g * 2.5, dur * 0.4, dur * 0.5, 0.5, 0.1)
    return p

def A(*xs):
    n = max(len(x) for x in xs)
    o = np.zeros(n)
    for x in xs: o[: len(x)] += x
    return o

def make(kind):
    k = kind
    if k == "whoosh": return whoosh(0.8) * 0.8
    if k == "swish": return whoosh(0.55, 500, 3500)
    if k == "swish_soft": return whoosh(0.9, 250, 1600) * 0.6
    if k == "nod": return nod()
    if k == "nodthread": return A(np.pad(nod(), (0, int(1.6 * SR) - len(nod()))), np.pad(pluck(rng.choice([392, 440, 523, 587]) * 2, 1.6), (int(0.12 * SR), 0))[: int(1.6 * SR)] * 0.45)
    if k == "thread": return creak(0.8, 500, 800)
    if k == "loosen": return A(creak(1.4, 800, 380, 0.4), airy(1.8, 300, 1400, 0.12))
    if k == "steps": return steps()
    if k == "buzz": return buzz()
    if k == "hurt": return A(swell_tone(150, 1.4, 0.35), swell_tone(158, 1.4, 0.25))
    if k == "bubble": return pop(rng.choice([560, 640, 720])) * 0.5
    if k == "scribble": return scratch(1.0)
    if k == "light": return A(bell(1568, 1.8, 0.5), bell(2349, 1.2, 0.18))
    if k == "light_soft": return A(bell(1175, 1.8, 0.28), bell(1760, 1.4, 0.1))
    if k == "lightoff": return A(np.pad(airy(0.5, 200, 1200, 0.3, 0.6), (0, 0)), swell_tone(520, 0.6, 0.15, -0.6))
    if k == "why": return A(swell_tone(110, 3.0, 0.4, 0.4), bell(880, 2.4, 0.15))
    if k == "zap": return fft_band(noise(int(0.3 * SR)), 2000, 6000) * np.exp(-np.arange(int(0.3 * SR)) / SR / 0.06) * 0.5
    if k == "loop": return A(swell_tone(400, 2.0, 0.15), swell_tone(403, 2.0, 0.15))
    if k == "chase": return whoosh(2.0, 300, 2400) * 0.5
    if k == "hit": return A(thud(90, 1.2, 0.9), fft_band(noise(int(1.2 * SR)), 60, 500) * np.exp(-np.arange(int(1.2 * SR)) / SR / 0.15) * 0.4)
    if k == "flood":
        out = np.zeros(int(3.5 * SR))
        for i in range(24):
            b = bell(rng.choice([1047, 1319, 1568, 1976, 2349]), 1.6, 0.14)
            o = int((i / 24) ** 1.6 * 2.4 * SR); out[o:o + len(b)] += b[: len(out) - o]
        return out
    if k == "freeze": return A(thud(70, 1.6, 0.8), swell_tone(700, 1.2, 0.12, -0.7))
    if k == "title": return A(thud(60, 2.8, 0.9), swell_tone(98, 4.0, 0.3))
    if k == "drone_shift": return swell_tone(60, 3.0, 0.25, -0.2)
    if k == "drop": return A(thud(160, 0.4, 0.5), airy(0.4, 800, 3000, 0.1))
    if k == "tick_start": return ticks(7)
    if k == "mirror": return A(airy(1.6, 2000, 6000, 0.12), bell(2637, 2.0, 0.12))
    if k == "mask": return A(np.sin(2 * np.pi * 300 * np.arange(int(0.2 * SR)) / SR) * np.exp(-np.arange(int(0.2 * SR)) / SR / 0.04) * 0.5, airy(0.2, 1000, 4000, 0.12))
    if k == "weight": return A(thud(100, 1.6, 0.7), swell_tone(70, 2.0, 0.2, -0.3))
    if k == "release": return A(airy(2.5, 600, 4000, 0.18, 1.5), bell(1319, 2.5, 0.16))
    if k == "low_hit": return thud(75, 1.2, 0.8)
    if k == "heartbeat": return heartbeats(4, 1.15, 0.7)
    if k == "rise": return swell_tone(260, 2.6, 0.12, 0.8)
    if k in ("say", "breath"): return airy(2.6, 300, 1800, 0.22 if k == "breath" else 0.14, 1.0)
    if k == "settle": return A(thud(80, 1.0, 0.45), airy(1.8, 200, 1200, 0.12))
    if k == "chord": return chord_swell([50, 57, 62, 66], 4.5, 0.4)
    if k == "lift": return A(whoosh(0.6, 200, 1200) * 0.5, thud(100, 0.3, 0.4))
    if k == "line": return scratch(1.0, 0.3)
    if k == "chord_final": return chord_swell([50, 57, 62, 66, 69], 7.0, 0.45)
    if k == "swell_white": return A(airy(3.5, 400, 8000, 0.28, 1.2), swell_tone(880, 3.5, 0.08, 0.5))
    if k == "logo": return A(bell(293.7, 6.0, 0.6), bell(587.3, 5.0, 0.2), airy(2.0, 3000, 9000, 0.05))
    if k == "pulse_start": return np.zeros(10)
    return np.zeros(10)

sfx = np.zeros((2, N))
for c in T["sfx"]:
    x = make(c["kind"]) * c["g"]
    pan = float(np.clip(rng.normal(0, 0.25), -0.5, 0.5))
    put(sfx, x, c["t"], pan)
# opening: quiet thread-string sounds under the first hands (strings, not drums)
for i, t0 in enumerate([2.2, 5.9, 8.4, 11.5, 14.2, 16.8]):
    put(sfx, pluck(midi(81 - (i % 3) * 5), 2.0) * 0.18, t0, rng.uniform(-0.4, 0.4))
# room tone: a very faint airy bed so silence never goes dead (not during the refusal)
room = fft_band(noise(N), 80, 600) * 0.012 * env([(0, 0), (2, 1), (ev("firstNo.pause"), 1), (ev("firstNo.say") - 0.5, 0.15), (ev("firstNo.say") + 4, 0.15), (ev("firstNo.calm"), 1), (TOTAL - 2, 1), (TOTAL, 0)])
sfx[0] += room; sfx[1] += room

# ------------------------------------------------------------------------------------- mix + save
def to16(a): return (np.clip(a, -1, 1).T * 32767).astype(np.int16)
def write(path, a):
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(to16(a).tobytes())

voS = np.zeros((2, N)); voS[0, : len(vo_pad)] = vo_pad; voS[1] = voS[0]
SFXG = 0.7
mix = voS + music * 1.0 + sfx * SFXG
peak = np.abs(mix).max()
print(f"raw peak {peak:.2f}")
# loudness: aim narration around -17 LUFS-ish by trimming everything with one gain, leave headroom
scale = 0.85 / peak if peak > 0.85 else 1.0
write(os.path.join(ROOT, "work/music.wav"), music * scale)
write(os.path.join(ROOT, "work/sfx.wav"), sfx * SFXG * scale)
write(os.path.join(ROOT, "work/narration.wav"), voS * scale)
write(os.path.join(ROOT, "work/mix_preview.wav"), mix * scale)
print("music/sfx written; scale", round(scale, 3))
