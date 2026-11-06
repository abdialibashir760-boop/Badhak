#!/usr/bin/env python3
"""Procedurally generates the film's sound effects and background score (no samples, no downloads).

  python3 scripts/make_audio.py            -> public/audio/sfx/*.wav  and  public/audio/music.mp3  (takes ~5 min: pure-numpy synthesis)

Chapter timing mirrors src/timeline.ts (hook 0-21 s, satellites 21-57, time 57-104, trilateration 104-155,
failure 155-200, reveal 200-240).
"""
import os, subprocess, sys, wave
import numpy as np
from scipy.signal import butter, lfilter

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
os.makedirs(os.path.join(OUT, "sfx"), exist_ok=True)
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(d * SR)) / SR


def env_exp(n, a=0.005, d=0.5):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


def bp(x, lo, hi, order=2):
    b, a = butter(order, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], btype="band")
    return lfilter(b, a, x)


def lp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), btype="low")
    return lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), btype="high")
    return lfilter(b, a, x)


def echo(x, delay, fb, mix=0.5):
    D = int(delay * SR)
    a = np.zeros(D + 1); a[0] = 1; a[D] = -fb
    wet = lfilter([1.0], a, x)
    return x * (1 - mix * 0.5) + wet * mix


def save_wav(path, x, stereo=False):
    x = np.clip(x, -1, 1)
    if x.ndim == 1 and stereo:
        x = np.stack([x, x], 1)
    pcm = (x * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(pcm.shape[1] if pcm.ndim == 2 else 1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def norm(x, peak=0.9):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def fade(x, ms=8):
    n = int(SR * ms / 1000)
    x = x.copy(); x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n)
    return x


# ───────────────────────────── sound effects
def sfx_blip():
    t = t_(0.14); f = np.linspace(1300, 1900, len(t))
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(len(t), 0.002, 0.04))


def sfx_lock():
    out = np.zeros(int(1.8 * SR))
    for start, f, g in [(0.0, 659.25, 1.0), (0.13, 987.77, 0.9), (0.13, 1318.5, 0.35)]:
        t = t_(1.5)
        tone = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)) * env_exp(len(t), 0.004, 0.45) * g
        i = int(start * SR); out[i:i + len(tone)] += tone
    shimmer = hp(rng.standard_normal(len(out)), 6000) * env_exp(len(out), 0.01, 0.25) * 0.05
    return norm(echo(out + shimmer, 0.17, 0.35, 0.4), 0.85)


def sfx_whoosh(d=0.9):
    n = int(d * SR); x = rng.standard_normal(n)
    out = np.zeros(n); seg = 24
    for i in range(seg):
        lo = 300 * (1 + i * 0.35); a, b = i * n // seg, (i + 1) * n // seg
        out[a:b] = bp(x, lo, lo * 2.2)[a:b]
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    return fade(norm(out * e, 0.8), 20)


def sfx_whoosh_big():
    d = 2.6; n = int(d * SR); x = rng.standard_normal(n)
    out = np.zeros(n); seg = 40
    for i in range(seg):
        lo = 120 * (1 + i * 0.28); a, b = i * n // seg, (i + 1) * n // seg
        out[a:b] = bp(x, lo, lo * 2.6)[a:b]
    t = t_(d); sub = np.sin(2 * np.pi * np.cumsum(np.linspace(110, 34, n)) / SR) * 0.7
    e = np.sin(np.pi * np.linspace(0, 1, n) ** 0.8) ** 1.4
    return fade(norm((out * 0.8 + sub) * e, 0.9), 30)


def sfx_chirp():
    d = 0.5; t = t_(d); f = np.linspace(900, 2800, len(t)) ** 1.0
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(t / 0.01, 1) * np.exp(-t / 0.22)
    crackle = bp(rng.standard_normal(len(t)), 2000, 8000) * (rng.random(len(t)) > 0.985) * 3 * np.exp(-t / 0.2)
    return fade(norm(tone + crackle * 0.5, 0.75))


def sfx_boom():
    d = 2.2; t = t_(d)
    f = 38 + 90 * np.exp(-t / 0.18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(len(t), 0.003, 0.7)
    thud = lp(rng.standard_normal(len(t)), 220) * env_exp(len(t), 0.001, 0.12) * 1.4
    return fade(norm(body + thud, 0.95), 20)


def sfx_riser():
    d = 3.2; n = int(d * SR); x = rng.standard_normal(n)
    out = np.zeros(n); seg = 48
    for i in range(seg):
        lo = 180 * (1 + i * 0.5); a, b = i * n // seg, (i + 1) * n // seg
        out[a:b] = bp(x, lo, lo * 1.8)[a:b]
    t = t_(d); f = np.linspace(220, 1100, n)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    e = np.linspace(0, 1, n) ** 2.2
    return fade(norm((out * 0.9 + tone) * e, 0.8), 40)


def sfx_data():
    n = int(0.9 * SR); out = np.zeros(n)
    for _ in range(46):
        s = int(rng.random() * (n - 900)); f = rng.choice([1200, 1700, 2300, 3100, 3900]); L = int(SR * 0.012)
        out[s:s + L] += np.sin(2 * np.pi * f * np.arange(L) / SR) * np.hanning(L)
    return fade(norm(out * np.linspace(1, 0.4, n), 0.65))


def sfx_tick():
    d = 0.12; t = t_(d)
    return norm(np.sin(2 * np.pi * 1700 * t) * env_exp(len(t), 0.0006, 0.012) + 0.4 * np.sin(2 * np.pi * 480 * t) * env_exp(len(t), 0.0006, 0.03), 0.8)


def sfx_ping():
    d = 1.4; t = t_(d)
    x = (np.sin(2 * np.pi * 880 * t) + 0.25 * np.sin(2 * np.pi * 1760 * t)) * env_exp(len(t), 0.003, 0.35)
    return norm(echo(x, 0.28, 0.4, 0.45), 0.8)


def sfx_error():
    d = 0.6; t = t_(d)
    x = (np.sign(np.sin(2 * np.pi * 110 * t)) * 0.4 + np.sin(2 * np.pi * 98 * t)) * np.exp(-t / 0.3) * np.minimum(t / 0.01, 1)
    return fade(norm(lp(x, 900), 0.7))


def sfx_reflect():
    d = 1.3; t = t_(d)
    p1 = np.sin(2 * np.pi * 1320 * t) * env_exp(len(t), 0.002, 0.12)
    x = np.zeros(len(t)); x += p1
    s = int(0.2 * SR); x[s:] += 0.6 * np.sin(2 * np.pi * 990 * t[:-s]) * env_exp(len(t) - s, 0.002, 0.18)
    return norm(echo(x, 0.22, 0.45, 0.5), 0.75)


SFX = dict(blip=sfx_blip, lock=sfx_lock, whoosh=sfx_whoosh, whoosh_big=sfx_whoosh_big, chirp=sfx_chirp, boom=sfx_boom, riser=sfx_riser, data=sfx_data, tick=sfx_tick, ping=sfx_ping, error=sfx_error, reflect=sfx_reflect)


# ───────────────────────────── score
NOTE = lambda name: 440 * 2 ** ((dict(C=-9, D=-7, E=-5, F=-4, G=-2, A=0, B=2)[name[0]] + 12 * (int(name[-1]) - 4)) / 12)
CH = dict(
    Am=["A2", "E3", "A3", "C4", "E4"], F=["F2", "C3", "F3", "A3", "C4"], C=["C3", "G3", "C4", "E4", "G4"], G=["G2", "D3", "G3", "B3", "D4"],
    Dm=["D3", "A3", "D4", "F4", "A4"], E=["E2", "B2", "E3", "G#3".replace("#", ""), "B3"],
)
CH["E"] = ["E2", "B2", "E3", "B3", "E4"]

BPM = 96
BEAT = 60 / BPM
TOTAL = 240.0
N = int(TOTAL * SR)


def pad_note(f, dur, detune=0.003):
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros(len(t)); out2 = np.zeros(len(t))
    for k in range(1, 7):
        a = 1 / k ** 1.15
        out += a * np.sin(2 * np.pi * f * k * (1 - detune) * t + k)
        out2 += a * np.sin(2 * np.pi * f * k * (1 + detune) * t + 2 * k)
    return out, out2


def prog_for(sec_start):
    if 155 <= sec_start < 200:
        return ["Am", "Dm", "Am", "E"]
    if sec_start >= 200:
        return ["F", "C", "G", "Am"]
    return ["Am", "F", "C", "G"]


def curve(points):
    xs, ys = zip(*points)
    return np.interp(np.arange(N) / SR, xs, ys)


def build_music():
    L = np.zeros(N); R = np.zeros(N)
    CH_LEN = 8.0
    # pad with overlapping chords
    pad_g = curve([(0, 0.0), (3, 0.5), (21, 0.65), (104, 0.8), (155, 0.6), (200, 0.85), (236, 0.7), (240, 0)])
    t0 = 0.0; i = 0
    while t0 < TOTAL:
        name = prog_for(t0)[i % 4]
        dur = CH_LEN + 3.0
        a_l = np.zeros(int(dur * SR)); a_r = np.zeros(int(dur * SR))
        for nname in CH[name]:
            l, r = pad_note(NOTE(nname), dur)
            a_l += l; a_r += r
        env = np.minimum(np.arange(len(a_l)) / SR / 2.5, 1) * np.minimum((dur - np.arange(len(a_l)) / SR) / 2.5, 1)
        s = int(t0 * SR); e = min(N, s + len(a_l))
        L[s:e] += (a_l * env)[: e - s] * 0.05; R[s:e] += (a_r * env)[: e - s] * 0.05
        t0 += CH_LEN; i += 1
    L *= pad_g; R *= pad_g
    L = lp(L, 3800); R = lp(R, 3800)

    # sub bass + arp + pulse
    bass = np.zeros(N); arp_l = np.zeros(N); arp_r = np.zeros(N); pulse = np.zeros(N)
    bass_g = curve([(0, 0), (20, 0), (24, 0.5), (104, 0.7), (155, 0.55), (200, 0.7), (240, 0)])
    arp_g = curve([(0, 0), (20, 0), (24, 0.5), (57, 0.65), (104, 0.8), (155, 0.55), (196, 0.45), (200, 0.85), (236, 0.7), (240, 0)])
    pulse_g = curve([(0, 0), (104, 0), (108, 0.8), (153, 0.8), (155, 0), (199, 0), (202, 0.8), (236, 0.7), (240, 0)])
    k = 0
    t0 = 0.0
    while t0 < TOTAL:
        name = prog_for(t0)[int(t0 // CH_LEN) % 4]
        notes = CH[name]
        step = int(round(t0 / (BEAT / 2)))
        # 8th-note arp
        if arp_g[min(N - 1, int(t0 * SR))] > 0.01:
            pat = [2, 3, 4, 3, 2, 4, 3, 4][step % 8]
            f = NOTE(notes[pat]) * (2 if (step % 16) >= 8 else 1)
            L_ = int(0.9 * SR); t = np.arange(L_) / SR
            pl = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / 0.22) * np.minimum(t / 0.003, 1)
            s = int(t0 * SR); e = min(N, s + L_)
            pan = 0.5 + 0.35 * np.sin(step * 0.7)
            arp_l[s:e] += (pl * (1 - pan))[: e - s] * 0.16; arp_r[s:e] += (pl * pan)[: e - s] * 0.16
        # bass on beats
        if step % 2 == 0:
            f = NOTE(notes[0]) / 2
            L_ = int(BEAT * 1.6 * SR); t = np.arange(L_) / SR
            b = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.9) * np.minimum(t / 0.01, 1)
            s = int(t0 * SR); e = min(N, s + L_); bass[s:e] += b[: e - s] * 0.30
        # soft kick-like pulse each beat
        if step % 2 == 0:
            L_ = int(0.25 * SR); t = np.arange(L_) / SR
            kk = np.sin(2 * np.pi * np.cumsum(55 + 70 * np.exp(-t / 0.04)) / SR) * np.exp(-t / 0.09)
            s = int(t0 * SR); e = min(N, s + L_); pulse[s:e] += kk[: e - s] * 0.35
        t0 += BEAT / 2
    arp_l = echo(arp_l, BEAT * 0.75, 0.42, 0.5) * arp_g; arp_r = echo(arp_r, BEAT * 1.0, 0.42, 0.5) * arp_g
    L += arp_l + bass * bass_g + pulse * pulse_g; R += arp_r + bass * bass_g + pulse * pulse_g

    # chapter swells / hits
    def swell(at, dur=3.0, g=0.12):
        n = int(dur * SR); x = rng.standard_normal(n)
        out = np.zeros(n); seg = 30
        for j in range(seg):
            lo = 250 * (1 + j * 0.3); a, b = j * n // seg, (j + 1) * n // seg
            out[a:b] = bp(x, lo, lo * 2)[a:b]
        out *= np.linspace(0, 1, n) ** 2.5 * g
        s = int(at * SR); e = min(N, s + n); L[s:e] += out[: e - s]; R[s:e] += out[: e - s]
    for at in (18.5, 54.0, 101.0, 152.0, 197.0):
        swell(at)

    m = np.stack([L, R], 1)
    m = np.tanh(m * 1.4) / 1.4                 # gentle glue
    m *= np.minimum(np.arange(N) / SR / 1.5, 1)[:, None] * np.minimum((TOTAL - np.arange(N) / SR) / 3.0, 1)[:, None]
    return m / np.max(np.abs(m)) * 0.9


def main():
    for name, fn in SFX.items():
        save_wav(os.path.join(OUT, "sfx", f"{name}.wav"), fn(), stereo=True)
        print("sfx", name)
    m = build_music()
    wav = os.path.join(OUT, "music.wav")
    save_wav(wav, m)
    mp3 = os.path.join(OUT, "music.mp3")
    ff = ["npx", "remotion", "ffmpeg"] if len(sys.argv) < 2 else [sys.argv[1]]
    subprocess.run(ff + ["-y", "-v", "error", "-i", wav, "-c:a", "libmp3lame", "-b:a", "192k", mp3], check=True, cwd=os.path.join(os.path.dirname(__file__), ".."))
    os.remove(wav)
    print("music", mp3, f"{os.path.getsize(mp3)/1e6:.1f} MB")


if __name__ == "__main__":
    main()
