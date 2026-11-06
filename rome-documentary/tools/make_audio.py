#!/usr/bin/env python3
"""Original audio for the documentary — all synthesised here (no samples, no third-party music):
   • orchestral-style score (strings, brass, choir pad, harp, timpani/taiko) composed to the film's sections
   • sound design (marching, market, battle, wind, sea, fire, crowd, river, hammering, birds, whooshes, impacts)
   • narration track (Kokoro TTS sentences placed on the master timeline), with music ducking under the voice
Writes audio/stems/*.mp3 and public/audio/mix.mp3.   Usage: python3 tools/make_audio.py"""
import json, os, subprocess, numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SR = 48000
TL = json.load(open(f'{ROOT}/audio/timeline.json'))
TOTAL = TL['total']; N = int((TOTAL + 1.0) * SR)
rng = np.random.default_rng(2026)
T = lambda n: np.arange(n) / SR
mid2f = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def env(n, a, r, curve=1.0):
    e = np.ones(n); na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na) ** curve
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e
def mix_into(buf, sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR);
    if i >= buf.shape[0] or i + len(sig) <= 0: return
    a = max(0, -i); i = max(0, i); sig = sig[a:]; j = min(buf.shape[0], i + len(sig)); sig = sig[: j - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:j, 0] += sig * l * gain; buf[i:j, 1] += sig * r * gain
def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** 4)
    if hi: m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))
def noise(n, lo=None, hi=None): return fft_filter(rng.standard_normal(n), lo, hi)

# ───────────────────────── instruments ─────────────────────────
def additive(f, n, amps, vib=0.0, det=0.0, ph=0.0):
    t = T(n); v = 1 + vib * np.sin(2 * np.pi * 5.2 * t + ph) * np.minimum(1, t / 1.2); out = np.zeros(n)
    for h, a in enumerate(amps, 1):
        if f * h > 14000: break
        out += a * np.sin(2 * np.pi * f * h * (1 + det) * np.cumsum(v) / SR + ph * h)
    return out
def strings(m, dur, amp=0.1, bright=1.0):
    n = int(dur * SR); f = mid2f(m); amps = [1 / (h ** (1.15 / bright)) for h in range(1, 14)]
    s = additive(f, n, amps, 0.0035, 0.0, rng.random() * 6) + additive(f, n, amps, 0.0035, 0.004, rng.random() * 6) + additive(f, n, amps, 0.0035, -0.004, rng.random() * 6)
    return s / 3 * env(n, min(1.6, dur * 0.4), min(2.2, dur * 0.5), 1.3) * amp
def cello(m, dur, amp=0.12):
    n = int(dur * SR); f = mid2f(m); s = additive(f, n, [1 / h ** 0.95 for h in range(1, 18)], 0.004)
    return s * env(n, 0.03, min(0.25, dur * 0.6)) * np.exp(-T(n) * 1.4) * amp
def brass(m, dur, amp=0.1, swell=0.25):
    n = int(dur * SR); f = mid2f(m); t = T(n); br = np.minimum(1, t / max(swell, 0.05))
    s = additive(f, n, [1 / h ** 0.8 for h in range(1, 16)], 0.003) * (0.5 + 0.5 * br)
    return fft_filter(s, hi=600 + 2600 * 1.0) * env(n, swell, min(0.6, dur * 0.35)) * amp * 1.6
def choir(m, dur, amp=0.07):
    n = int(dur * SR); f = mid2f(m); s = additive(f, n, [1 / h for h in range(1, 40)], 0.004, 0.0, rng.random() * 6)
    S = np.fft.rfft(s); fr = np.fft.rfftfreq(n, 1 / SR); form = np.exp(-((fr - 700) / 220) ** 2) + 0.7 * np.exp(-((fr - 1150) / 260) ** 2) + 0.3 * np.exp(-((fr - 2600) / 500) ** 2) + 0.15
    return np.fft.irfft(S * form, n) * env(n, 1.8, 2.4, 1.3) * amp * 3
def harp(m, dur=2.4, amp=0.12):
    n = int(dur * SR); f = mid2f(m); t = T(n); s = sum(a * np.exp(-t * d) * np.sin(2 * np.pi * f * h * t) for h, a, d in [(1, 1, 2.2), (2, 0.45, 3.2), (3, 0.25, 4.4), (4, 0.12, 6), (5, 0.06, 8)])
    return s * env(n, 0.002, 0.2) * amp
def timpani(f0=62, dur=2.2, amp=0.5):
    n = int(dur * SR); t = T(n); f = f0 * (1 + 0.9 * np.exp(-t * 26)); ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 2.4) + 0.4 * np.sin(2 * ph * 1.5) * np.exp(-t * 5); thump = noise(n, hi=380) * np.exp(-t * 36) * 0.9
    return (body + thump) * amp

# ───────────────────────── score ─────────────────────────
SEC = {}
for s in TL['sentences']: SEC.setdefault(s['section'], s['start'])
SEC['end'] = TOTAL; BEAT = 60 / 66.0; BAR = BEAT * 4
music = np.zeros((N, 2))
def chords(prog, t0, t1, bars_per=2, strings_oct=0, amp=0.1, with_choir=False, bright=1.0):
    t = t0; i = 0
    while t < t1 - 0.5:
        notes = prog[i % len(prog)]; d = min(BAR * bars_per + 1.2, t1 - t + 1.5)
        for k, m in enumerate(notes): mix_into(music, strings(m + strings_oct, d, amp, bright), t, pan=-0.5 + k * 0.33)
        mix_into(music, strings(notes[0] - 12, d, amp * 1.2, bright), t, pan=0)
        if with_choir:
            for k, m in enumerate(notes[1:]): mix_into(music, choir(m + 12, d, 0.06), t, pan=-0.3 + k * 0.4)
        t += BAR * bars_per; i += 1
Dm, Bb, Gm, A_, F_, C_, Am = [50, 57, 62, 65], [46, 58, 62, 65], [43, 55, 62, 65], [45, 57, 61, 64], [53, 57, 60, 65], [48, 55, 60, 64], [45, 57, 60, 64]
Dmaj, Gmaj, Amaj, Bm = [50, 57, 62, 66], [43, 55, 62, 67], [45, 57, 64, 69], [47, 59, 62, 66]
def ostinato(t0, t1, pattern, step, amp=0.13, accent=True):
    t = t0; i = 0
    while t < t1:
        m = pattern[i % len(pattern)]; mix_into(music, cello(m, step * 0.9, amp * (1.25 if (accent and i % 4 == 0) else 1.0)), t, pan=-0.2); t += step; i += 1
def drums(t0, t1, pattern, step, amp=0.5, f0=52):
    t = t0; i = 0
    while t < t1:
        v = pattern[i % len(pattern)]
        if v: mix_into(music, timpani(f0 + (6 if v > 1 else 0), 1.8, amp * (0.6 + 0.4 * (v > 1))), t, pan=0.0)
        t += step; i += 1
def theme(t0, notes, amp=0.1, inst='brass', beat=BEAT):
    t = t0
    for m, b in notes:
        if m: mix_into(music, (brass if inst == 'brass' else strings)(m, b * beat * 1.05, amp), t, pan=0.15)
        t += b * beat

h0, b0, r0, c0, e0, l0, end = 0.0, SEC['beginning'], SEC['republic'], SEC['caesar'], SEC['empire'], SEC['legacy'], TOTAL + 1.0
# HOOK — a slow, rising dawn
chords([Dm, Bb, Gm, A_], 0.0, b0 + 1.0, 2, 0, 0.08, False, 0.9)
mix_into(music, strings(26, b0 + 2, 0.16, 0.6), 0.0, 0); mix_into(music, strings(33, b0 + 2, 0.12, 0.6), 0.0, 0)
for i, m in enumerate([62, 65, 69, 74]): mix_into(music, harp(m + 12, 3.0, 0.1), 2.0 + i * BEAT * 2, pan=-0.3 + 0.2 * i)
mix_into(music, timpani(55, 3.0, 0.55), 19.2)                                               # as the map swoops to Italy
# BEGINNING — gentle, curious
chords([Dm, F_, C_, Am], b0, r0 + 1.0, 2, 0, 0.07, True, 0.8)
for k in range(int((r0 - b0) / (BEAT * 2))): mix_into(music, harp([62, 65, 69, 67, 65, 62, 60, 64][k % 8] + 12, 2.4, 0.09), b0 + k * BEAT * 2, pan=-0.4 + (k % 4) * 0.27)
theme(b0 + BAR * 2, [(62, 2), (65, 1), (69, 1), (67, 2), (65, 2), (62, 4)], 0.07, 'strings')
mix_into(music, timpani(55, 3.0, 0.5), SEC['republic'] - 1.0)
# REPUBLIC — rising military drive
chords([Dm, Bb, F_, C_], r0, c0 + 1.0, 2, 0, 0.09, False, 1.1)
ostinato(r0, c0, [38, 38, 45, 38, 41, 38, 45, 41], BEAT / 2, 0.14)
drums(r0, c0, [2, 0, 1, 0, 2, 0, 1, 1], BEAT / 2, 0.5)
theme(r0 + BAR * 2, [(62, 1.5), (65, 0.5), (69, 2), (70, 2), (69, 1.5), (65, 0.5), (62, 4)], 0.1)
theme(r0 + BAR * 7, [(69, 1.5), (72, 0.5), (74, 2), (77, 2), (76, 1.5), (72, 0.5), (69, 4)], 0.11)
mix_into(music, strings(26, 8, 0.2, 0.6), r0 + 24, 0)
# CAESAR — tense, faster, with a heartbeat; silence before the Ides
chords([Dm, [46, 58, 62, 69], Gm, [45, 57, 61, 67]], c0, e0 - 3.0, 2, 0, 0.085, False, 1.3)
ostinato(c0, e0 - 3.0, [38, 45, 38, 44, 38, 45, 38, 43], BEAT / 4 * 1.5, 0.12, False)
drums(c0, e0 - 3.0, [2, 0, 0, 1, 0, 1, 0, 0], BEAT / 2, 0.55, 46)
ides = [s for s in TL['shots'] if s['scene'] == 'ides'][0]; mix_into(music, timpani(40, 4.0, 0.8), ides['start'] + 0.4)
mix_into(music, strings(38, 9.0, 0.22, 0.5), e0 - 6.0, 0)
# EMPIRE — triumph: the key turns to D major
chords([Dmaj, Gmaj, Amaj, Bm], e0, l0 + 1.0, 2, 0, 0.1, True, 1.2)
theme(e0 + BAR * 0.5, [(62, 2), (66, 1), (69, 1), (74, 3), (73, 1), (71, 2), (69, 2), (66, 4)], 0.13)
theme(e0 + BAR * 4, [(69, 2), (73, 1), (76, 1), (81, 3), (79, 1), (78, 2), (76, 2), (74, 4)], 0.13)
ostinato(e0 + 2.0, l0, [38, 45, 50, 45], BEAT, 0.1, True); drums(e0, l0, [2, 0, 1, 0], BEAT, 0.5)
# LEGACY — the great reprise, then resolution
chords([Bm, Gmaj, Dmaj, Amaj], l0, end - 8.0, 2, 0, 0.12, True, 1.3)
theme(l0 + 0.5, [(74, 3), (78, 1), (81, 4), (79, 2), (78, 2), (74, 6)], 0.15)
theme(l0 + BAR * 3, [(81, 2), (83, 2), (86, 4), (85, 2), (83, 2), (81, 6)], 0.16)
ostinato(l0, end - 12.0, [38, 45, 50, 45, 38, 45, 54, 45], BEAT / 2, 0.11); drums(l0, end - 10.0, [2, 1, 1, 0, 2, 1, 1, 1], BEAT / 2, 0.55)
fin = end - 9.0
for k, m in enumerate([38, 50, 57, 62, 66, 69, 74]): mix_into(music, strings(m, 12.0, 0.14, 1.2), fin, pan=-0.6 + k * 0.2); mix_into(music, choir(m + 12 if m > 50 else m, 12.0, 0.08), fin, pan=-0.3 + k * 0.1)
mix_into(music, brass(62, 9.0, 0.13, 1.6), fin, 0.1); mix_into(music, brass(69, 9.0, 0.12, 1.6), fin + 0.2, -0.1); mix_into(music, timpani(50, 5.0, 0.8), fin + 0.05)
# section boundaries: a deep boom with a reverse swell leading in
for k in ['beginning', 'republic', 'caesar', 'empire', 'legacy']:
    t = SEC[k] - 0.4; sw = noise(int(2.2 * SR), 500, 5000) * np.linspace(0, 1, int(2.2 * SR)) ** 2.5 * 0.2; mix_into(music, sw, t - 2.2, 0); mix_into(music, timpani(44, 3.0, 0.7), t)
# reverb (synthetic hall impulse response) on the score
def reverb(x, secs=3.2, wet=0.32):
    n = int(secs * SR); t = T(n); outs = []
    for c in range(2):
        ir = fft_filter(rng.standard_normal(n), hi=5200) * np.exp(-t * 2.3) * (1 - np.exp(-t * 90)); ir /= np.sqrt((ir ** 2).sum()); L = len(x) + n; F = 1 << (L - 1).bit_length()
        outs.append(np.fft.irfft(np.fft.rfft(x[:, c], F) * np.fft.rfft(ir, F), F)[: len(x)])
    return x * (1 - wet) + np.stack(outs, 1) * wet * 1.6
music = reverb(music)
music /= max(1e-6, np.abs(music).max()); music *= 0.8

# ───────────────────────── sound design ─────────────────────────
sfx = np.zeros((N, 2))
def amb(tag, dur):
    n = int(dur * SR); t = T(n)
    if tag == 'wind': e = 0.5 + 0.5 * np.sin(2 * np.pi * (0.11 * t + 0.3) + 2 * np.sin(2 * np.pi * 0.05 * t)); return noise(n, 180, 1400) * (0.3 + 0.7 * e) * 0.9
    if tag == 'city': return noise(n, 90, 700) * 0.55 + noise(n, 400, 2200) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.17 * t)) * 0.25
    if tag == 'sea': sw = 0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t); return noise(n, 60, 800) * (0.3 + 0.7 * sw) * 1.1 + noise(n, 1500, 6000) * sw ** 3 * 0.35
    if tag == 'river': return noise(n, 350, 3200) * (0.7 + 0.3 * np.sin(2 * np.pi * 3.1 * t + 3 * noise(n, hi=3))) * 0.7
    if tag in ('market', 'crowd'):
        out = np.zeros(n)
        for k in range(14): out += noise(n, 250 + 40 * k, 900 + 130 * k) * np.clip(np.sin(2 * np.pi * (2.2 + 0.4 * k) * t + k * 1.7) * np.sin(2 * np.pi * (0.4 + 0.07 * k) * t + k), 0, 1) ** 1.5 * 0.2
        if tag == 'market':
            for _ in range(int(dur * 2.2)):
                i = rng.integers(0, max(1, n - 4000)); f = rng.uniform(1800, 4200); tt = T(4000); out[i:i + 4000] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 70) * 0.35
        else: out += noise(n, 150, 1300) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t + 1)) ** 2 * 0.5
        return out
    if tag == 'march':
        out = np.zeros(n); step = 60 / 112; k = 0; tt = step * 0.0
        while tt < dur - 0.2:
            i = int((tt + rng.normal(0, 0.012)) * SR); L = int(0.16 * SR); tl = T(L)
            if 0 <= i < n - L: out[i:i + L] += (noise(L, 60, 700) * np.exp(-tl * 40) * 1.2 + noise(L, 2500, 7000) * np.exp(-tl * 90) * 0.35 + np.sin(2 * np.pi * 95 * tl) * np.exp(-tl * 50) * 0.5) * (0.8 + 0.4 * rng.random())
            tt += step; k += 1
        return out * 0.9
    if tag == 'battle':
        out = noise(n, 50, 500) * 0.5 + noise(n, 200, 1600) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.31 * t)) ** 2 * 0.5
        for _ in range(int(dur * 3.2)):
            i = rng.integers(0, max(1, n - 12000)); L = rng.integers(3000, 12000); tl = T(L); f = rng.uniform(900, 3200)
            out[i:i + L] += (noise(L, 1500, 8000) * np.exp(-tl * 45) * 0.5 + np.sin(2 * np.pi * f * tl) * np.exp(-tl * 30) * 0.35)
        return out
    if tag == 'fire':
        out = noise(n, 60, 500) * 0.35
        for _ in range(int(dur * 28)):
            i = rng.integers(0, max(1, n - 1500)); L = rng.integers(200, 1500); tl = T(L); out[i:i + L] += noise(L, 1200, 7000) * np.exp(-tl * 150) * rng.uniform(0.3, 1.0)
        return out
    if tag == 'hammer':
        out = np.zeros(n); tt = rng.uniform(0, 0.5)
        while tt < dur - 0.3:
            i = int(tt * SR); L = int(0.25 * SR); tl = T(L); f = rng.choice([620, 780, 940, 1180]); out[i:i + L] += (np.sin(2 * np.pi * f * tl) * np.exp(-tl * 40) * 0.5 + noise(L, 1500, 7000) * np.exp(-tl * 160) * 0.5) * rng.uniform(0.5, 1); tt += rng.choice([0.38, 0.38, 0.75, 1.1])
        return out
    if tag == 'birds':
        out = np.zeros(n)
        for _ in range(int(dur * 1.1)):
            i = rng.integers(0, max(1, n - 12000)); L = 9000; tl = T(L); f = rng.uniform(2400, 4200) * (1 + 0.15 * np.sin(2 * np.pi * rng.uniform(8, 22) * tl)); out[i:i + L] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tl / tl[-1]) ** 2 * 0.25
        return out
    if tag == 'horn': m = brass(50, min(dur, 3.5), 0.4, 0.9); o = np.zeros(n); o[: len(m)] = m[:n]; return fft_filter(o, hi=1800) * 2.0
    return np.zeros(n)
GAIN = {'wind': 0.20, 'city': 0.2, 'sea': 0.26, 'river': 0.2, 'market': 0.3, 'crowd': 0.28, 'march': 0.45, 'battle': 0.34, 'fire': 0.3, 'hammer': 0.32, 'birds': 0.18, 'horn': 0.35}
for sh in TL['shots']:
    for tag in sh.get('sfx', []):
        if tag in ('quiet', 'sting') or tag not in GAIN: continue
        a, b = max(0, sh['start'] - 0.5), sh['start'] + sh['dur'] + 0.5; d = b - a; x = amb(tag, d) * GAIN[tag] * env(int(d * SR), 0.5, 0.6)
        mix_into(sfx, x, a, pan=rng.uniform(-0.3, 0.3))
    if 'sting' in sh.get('sfx', []): mix_into(sfx, timpani(46, 3.0, 0.55), sh['start'] + 0.05)
    if sh['i'] > 0:                                                              # transition whoosh at every cut
        d = 0.7; n = int(d * SR); e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2; sw = fft_filter(rng.standard_normal(n), 300, 1800) * e
        mix_into(sfx, sw, sh['start'] - 0.38, pan=rng.uniform(-0.5, 0.5), gain=0.55 if sh.get('tr') in ('wipe', 'iris') else 0.3)
        if sh.get('tr') == 'flash': mix_into(sfx, timpani(60, 1.6, 0.4) + noise(int(1.6 * SR), 500, 4000) * np.exp(-T(int(1.6 * SR)) * 9) * 0.3, sh['start'] - 0.02)
sfx /= max(1e-6, np.abs(sfx).max()); sfx *= 0.8

# ───────────────────────── voice + ducking + master ─────────────────────────
voice = np.zeros((N, 2))
for s in TL['sentences']:
    w, sr = sf.read(f"{ROOT}/audio/voice/{s['id']}.wav"); w = np.interp(np.arange(int(len(w) * SR / sr)) / (SR / sr), np.arange(len(w)), w)
    mix_into(voice, w * env(len(w), 0.01, 0.04), s['start'], 0.0, 1.0)
voice = fft_filter(voice[:, 0], 75, None)[:, None].repeat(2, 1) * 1.0
voice /= max(1e-6, np.abs(voice).max()); voice *= 0.9
vabs = np.abs(voice[:, 0]); k = int(0.25 * SR); sm = np.convolve(vabs, np.ones(k) / k, 'same'); vact = np.clip(sm / 0.045, 0, 1)
kk = int(0.5 * SR); vact = np.maximum.accumulate(np.convolve(vact, np.ones(kk) / kk, 'same')[:: 1]) * 0 + np.convolve(vact, np.ones(kk) / kk, 'same')
duck_m = 1 - 0.62 * np.clip(vact * 1.6, 0, 1); duck_s = 1 - 0.45 * np.clip(vact * 1.6, 0, 1)
master = voice * 1.0 + music * duck_m[:, None] * 0.62 + sfx * duck_s[:, None] * 0.55
fade = np.ones(N); fi = int(1.0 * SR); fo = int(2.2 * SR); fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
master = np.tanh(master * 1.25) / np.tanh(1.25) * fade[:, None]; master /= max(1e-6, np.abs(master).max()); master *= 0.89

os.makedirs(f'{ROOT}/audio/stems', exist_ok=True); os.makedirs(f'{ROOT}/public/audio', exist_ok=True)
def save(name, x, br='192k'):
    sf.write(f'/tmp/_{name}.wav', x.astype(np.float32), SR); subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'/tmp/_{name}.wav', '-b:a', br, name_out(name)], check=True); os.remove(f'/tmp/_{name}.wav')
name_out = lambda n: f'{ROOT}/public/audio/mix.mp3' if n == 'mix' else f'{ROOT}/audio/stems/{n}.mp3'
sf.write('/tmp/_mix.wav', master.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '/tmp/_mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=9', '-ar', '48000', '-b:a', '192k', f'{ROOT}/public/audio/mix.mp3'], check=True); os.remove('/tmp/_mix.wav')
for n, x in [('music', music * 0.9), ('sound_design', sfx * 0.9), ('narration', voice)]: save(n, x)
print('audio done:', round(TOTAL, 1), 's')
