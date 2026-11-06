#!/usr/bin/env python3
"""
Synthesises the documentary's whole non-voice soundtrack with numpy (no samples, no downloads):

  music     evolving D-minor pad score (additive voices), bell arpeggios, sub drone, heartbeat pulse
  ambience  deep-space bed: shaped noise + slow whistles
  sfx       cue-timed: chapter stingers (riser + boom), transition whooshes, ball bounces, clock ticks, GPS pings

Cue times come from src/shots.ts so the sound always follows the picture.
Writes WAV stems to build/audio/ and the compressed mix + stems to public/audio/.
"""
import json, math, os, re, subprocess, wave
import numpy as np

SR = 44100
TOTAL = 240.0
N = int(SR * (TOTAL + 4))
rng = np.random.default_rng(1915)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(f'{ROOT}/build/audio', exist_ok=True)
os.makedirs(f'{ROOT}/public/audio', exist_ok=True)


def midi(m):
    return 440.0 * 2 ** ((np.asarray(m, dtype=float) - 69) / 12)


def smooth(x):
    x = np.clip(x, 0, 1)
    return 0.5 - 0.5 * np.cos(np.pi * x)


# ── shot table from the registry ──
src = open(f'{ROOT}/src/shots.ts', encoding='utf8').read()
defs = re.findall(r"\['(hook|newton|einstein|orbits|time|finale)', ([\d.]+), (?:'((?:[^'\\]|\\.)*)'|\"([^\"]*)\")", src)
shots, cur = [], 0.0
for i, (sec, dur, t1, t2) in enumerate(defs):
    shots.append(dict(id=f's{i+1:02d}', section=sec, start=cur, dur=float(dur), title=t1 or t2))
    cur += float(dur)
assert abs(cur - TOTAL) < 1e-6, cur
CHAPTERS = [s for s in shots if s['title'].startswith('Chapter')]


def add(buf, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= buf.shape[0] or i + len(sig) <= 0:
        return
    j = min(buf.shape[0], i + len(sig))
    seg = sig[: j - i] * gain
    l, r = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    buf[i:j, 0] += seg * l * math.sqrt(2)
    buf[i:j, 1] += seg * r * math.sqrt(2)


def tvec(d):
    return np.arange(int(d * SR)) / SR


# ───────────────────────── MUSIC ─────────────────────────
music = np.zeros((N, 2))

PROG = [  # (start, end, midi notes, level)
    (0, 12.5, [38, 45, 53, 57, 64], 0.32), (12.5, 25, [34, 53, 57, 62, 65], 0.34),
    (25, 35, [38, 50, 53, 57, 62], 0.5), (35, 45, [34, 46, 53, 58, 62], 0.5), (45, 55, [31, 43, 50, 55, 58], 0.52), (55, 65, [33, 45, 52, 57, 61], 0.52),
    (65, 77.5, [31, 43, 50, 55, 58, 62], 0.66), (77.5, 90, [27, 39, 46, 50, 55, 58], 0.7), (90, 102.5, [34, 46, 53, 58, 62, 65], 0.7), (102.5, 115, [29, 41, 48, 53, 57, 60], 0.72),
    (115, 126.25, [38, 50, 57, 62, 65, 69], 0.78), (126.25, 137.5, [34, 46, 53, 58, 62, 65], 0.78), (137.5, 148.75, [36, 48, 55, 60, 64, 67], 0.8), (148.75, 160, [31, 43, 50, 55, 58, 62], 0.8),
    (160, 171.25, [38, 45, 53, 57, 64], 0.5), (171.25, 182.5, [34, 46, 53, 57, 62], 0.52), (182.5, 193.75, [31, 43, 53, 58, 62, 65], 0.55), (193.75, 205, [33, 45, 52, 57, 61, 64], 0.58),
    (205, 213, [31, 43, 50, 55, 58, 62], 0.7), (213, 221, [34, 46, 53, 58, 62, 65], 0.85), (221, 229, [38, 50, 57, 62, 65, 69, 74], 1.0), (229, 244, [38, 50, 57, 62, 66, 69, 76], 0.95),
]
FADE = 3.0
for (a, b, notes, lvl) in PROG:
    a0, b0 = max(0, a - FADE), b + FADE
    t = tvec(b0 - a0) + a0
    env = np.minimum(smooth((t - a0) / (2 * FADE)), smooth((b0 - t) / (2 * FADE)))
    if a == 0:
        env = smooth((b0 - t) / (2 * FADE)) * smooth(t / 5.0)
    if b >= 244:
        env = smooth((b0 - t) / 12.0) * smooth((t - a0) / (2 * FADE))
    voices = np.zeros((len(t), 2))
    for ni, m in enumerate(notes):
        f = float(midi(m))
        pan = (ni / max(1, len(notes) - 1) - 0.5) * 0.9
        lowness = 1.0 if m < 48 else 0.8
        for dv, ph in ((-0.0012, 0.0), (0.0, 1.3), (0.0014, 2.6)):
            sig = np.zeros(len(t))
            for k in range(1, 7):
                sig += np.sin(2 * np.pi * f * (1 + dv) * k * t + ph * k + 0.3 * np.sin(2 * np.pi * 0.07 * t + ni)) / (k ** 1.55)
            amp = 0.06 * lowness * (1.0 + 0.25 * np.sin(2 * np.pi * (0.05 + 0.013 * ni) * t + ph))
            l = math.cos((pan + 1) * math.pi / 4); r = math.sin((pan + 1) * math.pi / 4)
            voices[:, 0] += sig * amp * l; voices[:, 1] += sig * amp * r
    i0 = int(a0 * SR)
    j0 = min(N, i0 + len(t))
    music[i0:j0] += (voices * (env * lvl)[:, None])[: j0 - i0]

# sub drone (D1 + D2) swelling with the story
t = np.arange(N) / SR
swell = 0.25 + 0.75 * smooth((t - 60) / 60) * (1 - 0.35 * smooth((t - 160) / 10)) + 0.4 * smooth((t - 205) / 20)
drone = (np.sin(2 * np.pi * 36.71 * t) * 0.5 + np.sin(2 * np.pi * 73.42 * t + 0.4 * np.sin(2 * np.pi * 0.05 * t)) * 0.3) * 0.22 * swell * smooth(t / 6)
drone *= 1 - smooth((t - 236) / 3.5)
music[:, 0] += drone; music[:, 1] += drone

# bell arpeggios
PENT = [62, 65, 67, 69, 72, 74, 77, 79, 81]


def bell(f, d=2.6):
    tt = tvec(d)
    mod = 3.5 * f
    idx = 2.2 * np.exp(-tt / 0.35)
    return np.sin(2 * np.pi * f * tt + idx * np.sin(2 * np.pi * mod * tt)) * np.exp(-tt / 0.9) * (1 - np.exp(-tt / 0.004))


def arp(t0, t1, step, level, lo, hi, seed, accent=None):
    g = np.random.default_rng(seed)
    t_ = t0
    k = 0
    while t_ < t1:
        m = PENT[g.integers(lo, hi)]
        lv = level * (1.4 if accent and k % accent == 0 else 1.0) * (0.6 + 0.4 * g.random())
        add(music, bell(float(midi(m))), t_, lv, pan=g.uniform(-0.6, 0.6))
        t_ += step
        k += 1


arp(30, 65, 0.75, 0.05, 0, 6, 11)
arp(70, 115, 1.5, 0.05, 2, 8, 12)
arp(117, 160, 0.375, 0.04, 0, 7, 13, accent=4)
arp(161, 205, 2.0, 0.045, 4, 9, 14)
arp(209, 240, 0.5, 0.05, 1, 9, 15, accent=4)
arp(2, 24, 3.0, 0.035, 3, 8, 16)

# heartbeat pulse (orbits & finale build)


def thump(d=0.7):
    tt = tvec(d)
    f = 48 + 40 * np.exp(-tt / 0.06)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt / 0.16) * (1 - np.exp(-tt / 0.004))


TH = thump()
beat = 60 / 90
for k in range(int(115 / beat), int(160 / beat)):
    add(music, TH, k * beat, 0.30 if k % 2 == 0 else 0.18)
for k in range(int(213 / beat), int(230 / beat)):
    lvl = 0.2 + 0.3 * smooth((k * beat - 213) / 8)
    add(music, TH, k * beat, lvl if k % 2 == 0 else lvl * 0.6)

music = np.tanh(music * 1.1)

# ───────────────────────── AMBIENCE ─────────────────────────


def shaped_noise(d, lo, hi, slope=0.0, seed=0):
    g = np.random.default_rng(seed)
    n = int(d * SR)
    spec = np.fft.rfft(g.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    shape = np.where((f >= lo) & (f <= hi), (np.maximum(f, 1.0) / 100.0) ** slope, 0.0)
    shape *= 1.0 / (1 + (f / hi) ** 4)
    y = np.fft.irfft(spec * shape, n)
    return y / (np.max(np.abs(y)) + 1e-9)


amb = np.zeros((N, 2))
for ch, seed in ((0, 3), (1, 4)):
    amb[:, ch] = shaped_noise(N / SR, 25, 520, slope=-1.0, seed=seed) * 0.16
t = np.arange(N) / SR
amb *= (0.75 + 0.25 * np.sin(2 * np.pi * t / 23.0))[:, None]
for k in range(14):  # slow whistles
    t0 = rng.uniform(5, 232)
    d = rng.uniform(4, 8)
    tt = tvec(d)
    f0 = rng.uniform(900, 2400)
    f = f0 * (1 + 0.15 * np.sin(2 * np.pi * rng.uniform(0.1, 0.3) * tt))
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) ** 2 * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(2, 5) * tt))
    add(amb, sig, t0, 0.012, pan=rng.uniform(-0.8, 0.8))
amb *= smooth(t / 3)[:, None] * (1 - smooth((t - 237) / 3))[:, None]

# ───────────────────────── SFX ─────────────────────────
sfx = np.zeros((N, 2))


def whoosh(d=1.0, f0=250, f1=3500, seed=0, up=True):
    g = np.random.default_rng(seed)
    n = int(d * SR)
    noise = g.standard_normal(n)
    out = np.zeros(n)
    hop, size = 1024, 2048
    win = np.hanning(size)
    fr = np.fft.rfftfreq(size, 1 / SR)
    for s in range(0, n - size, hop):
        u = s / n
        fc = f0 * (f1 / f0) ** (u if up else 1 - u)
        shape = np.exp(-0.5 * (np.log2(np.maximum(fr, 1) / fc) / 0.8) ** 2)
        out[s:s + size] += np.fft.irfft(np.fft.rfft(noise[s:s + size] * win) * shape, size) * win
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    out *= env
    return out / (np.max(np.abs(out)) + 1e-9)


def boom(d=3.0):
    tt = tvec(d)
    f = 42 + 50 * np.exp(-tt / 0.18)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-tt / 0.95)
    burst = shaped_noise(d, 30, 900, slope=-0.5, seed=21) * np.exp(-tt / 0.22)
    return (body * 0.9 + burst * 0.5) * (1 - np.exp(-tt / 0.003))


def riser(d=2.2):
    tt = tvec(d)
    u = tt / d
    n = whoosh(d, 200, 7000, seed=5, up=True) * (u ** 1.8)
    tone = np.sin(2 * np.pi * np.cumsum(150 * (8 ** u)) / SR) * (u ** 2.4) * 0.25
    return (n + tone) * (1 - np.exp(-tt / 0.2))


def click(d=0.05, f=2800, level=1.0):
    tt = tvec(d)
    return (np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.006) + 0.5 * np.sin(2 * np.pi * f * 0.5 * tt) * np.exp(-tt / 0.01)) * level


def thud(level=1.0):
    tt = tvec(0.35)
    f = 85 + 60 * np.exp(-tt / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.09) * level


def ping(f, d=1.6):
    tt = tvec(d)
    return np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.5) * (1 - np.exp(-tt / 0.003))


W_UP, W_DN = whoosh(1.1, 250, 3800, 31, True), whoosh(1.1, 3200, 260, 32, False)
RISE, BOOM = riser(2.2), boom(3.2)
chapter_starts = {c['start'] for c in CHAPTERS}
chapter_starts.add(0.0)
for i, s in enumerate(shots):
    t0 = s['start']
    if t0 in chapter_starts and t0 > 0:
        add(sfx, RISE, t0 - 2.1, 0.55)
        add(sfx, BOOM, t0 + 0.1, 0.8)
        add(sfx, whoosh(1.4, 120, 1200, 40 + i, True), t0 - 0.3, 0.4)
    elif t0 > 0:
        add(sfx, W_UP if i % 2 else W_DN, t0 - 0.4, 0.12 if s['section'] != 'finale' else 0.16, pan=(-0.3 if i % 2 else 0.3))
add(sfx, BOOM, 0.0, 0.45)                         # soft opening
add(sfx, RISE, 205 - 3.0, 0.5)                    # the finale lifts off
add(sfx, boom(5.0), 221.0, 0.7)                   # climax hit as Dm opens
add(sfx, boom(6.0), 229.0, 0.5)                   # resolve
add(sfx, boom(5.0), 235.0, 0.7)                   # end title

by_id = {s['id']: s for s in shots}
# ball: release click + bounces (shot 1: slow-mo physics), shot 3 bounces
s1, s3 = by_id['s01'], by_id['s03']
add(sfx, click(0.04, 1800, 0.35), s1['start'] + 1.5, 0.5)
for t_, lv in ((2.6, 1.0), (3.6, 0.6), (4.05, 0.3)):
    add(sfx, thud(lv), s1['start'] + t_ - 0.0, 0.5)
for t_, lv in ((0.476, 0.9), (1.365, 0.6), (1.855, 0.4), (2.12, 0.25), (2.3, 0.15)):
    add(sfx, thud(lv), s3['start'] + t_, 0.35)
# rumble as the grid sags (shot 18)
s18 = by_id['s18']
add(sfx, boom(4.0) * 0.8, s18['start'] + 1.2, 0.45)
# Wheeler line chimes (shot 19)
s19 = by_id['s19']
add(sfx, bell(float(midi(81))), s19['start'] + 0.4, 0.07)
add(sfx, bell(float(midi(86))), s19['start'] + 2.0, 0.07)
# clocks: 1 Hz ticks (shots 34), 3 Hz (36), lattice shimmer (37), GPS pings (38)
for sid, hz, lv in (('s34', 1, 0.35), ('s36', 3, 0.2), ('s33', 1, 0.15), ('s35', 2, 0.15)):
    s = by_id[sid]
    for k in range(int(s['dur'] * hz)):
        add(sfx, click(0.05, 2600 if k % 2 == 0 else 2100, 1.0), s['start'] + k / hz, lv, pan=0.0)
s38 = by_id['s38']
g = np.random.default_rng(38)
for k in range(10):
    add(sfx, ping(float(midi(int(g.choice([81, 84, 88, 91])))), 1.2), s38['start'] + 0.8 + k * 0.6, 0.05, pan=g.uniform(-0.7, 0.7))
# budget bars (shot 39): rising / falling tones
s39 = by_id['s39']
add(sfx, ping(float(midi(84)), 1.5), s39['start'] + 1.0, 0.08)
add(sfx, ping(float(midi(72)), 1.5), s39['start'] + 2.2, 0.08)
add(sfx, ping(float(midi(79)), 2.0), s39['start'] + 4.0, 0.1)

# ───────────────────────── mix & export ─────────────────────────


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    pcm = (x * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def peak_norm(x, peak):
    return x * (peak / (np.max(np.abs(x)) + 1e-9))


music = peak_norm(music, 0.5)
amb = peak_norm(amb, 0.2)
sfx = peak_norm(np.tanh(sfx), 0.55)
for name, buf in (('music', music), ('ambience', amb), ('sfx', sfx)):
    write_wav(f'{ROOT}/build/audio/{name}.wav', buf[: int(TOTAL * SR)])

# music-only mix (narration is added later by scripts/mix-final.sh, which ducks this bed under the voice)
bed = (music * 0.9 + amb * 1.0 + sfx * 0.8)[: int(TOTAL * SR)]
write_wav(f'{ROOT}/build/audio/bed.wav', bed)


def enc(wav, mp3, extra=()):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav, *extra, '-c:a', 'libmp3lame', '-q:a', '2', mp3], check=True)


for name in ('music', 'ambience', 'sfx'):
    enc(f'{ROOT}/build/audio/{name}.wav', f'{ROOT}/public/audio/{name}.mp3')
enc(f'{ROOT}/build/audio/bed.wav', f'{ROOT}/public/audio/mix.mp3', ('-af', 'loudnorm=I=-18:TP=-1.5:LRA=9',))

with open(f'{ROOT}/src/generated/audio.ts', 'w') as f:
    f.write("// Written by scripts/synth_audio.py (and scripts/mix-final.sh once narration exists).\nexport const AUDIO_FILE: string | null = 'audio/mix.mp3';\n")
json.dump({'chapters': [dict(id=c['id'], start=c['start']) for c in CHAPTERS], 'shots': shots}, open(f'{ROOT}/docs/audio-cues.json', 'w'), indent=1)
print('audio written:', os.listdir(f'{ROOT}/public/audio'))
