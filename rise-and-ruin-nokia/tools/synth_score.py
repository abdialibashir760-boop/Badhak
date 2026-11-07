#!/usr/bin/env python3
"""Synthesise the score + SFX for 'How Nokia Lost the Smartphone War' (no samples, no licensed music).
usage: python3 synth_score.py shots.json out.wav total_seconds vo_end_seconds"""
import json, sys
import numpy as np
SR = 48000
shots = {s["id"]: s for s in json.load(open(sys.argv[1]))}
TOTAL = float(sys.argv[3]); VO_END = float(sys.argv[4])
n = int(TOTAL * SR); t = np.arange(n) / SR
rng = np.random.default_rng(42)
L = np.zeros(n); R = np.zeros(n)

def env(t0, t1, a, r):
    e = np.zeros(n); i0, i1 = int(t0 * SR), min(n, int(t1 * SR))
    if i1 <= i0: return e
    x = np.arange(i1 - i0) / SR; d = t1 - t0
    e[i0:i1] = np.minimum(1, x / a) * np.minimum(1, (d - x) / r)
    return e
def mid(note):  # midi -> hz
    return 440.0 * 2 ** ((note - 69) / 12)
def add(sig, pan=0.0, gain=1.0):
    global L, R
    L += sig * gain * (1 - max(0, pan)); R += sig * gain * (1 + min(0, pan))
def pad(notes, t0, t1, amp, a=3.0, r=3.5, bright=1.0):
    for k, m in enumerate(notes):
        f = mid(m)
        for det, pan in ((0.997, -0.5), (1.003, 0.5)):
            ph = rng.uniform(0, 6.28)
            s = np.sin(2 * np.pi * f * det * t + ph) + 0.45 * bright * np.sin(4 * np.pi * f * det * t + ph) + 0.2 * bright * np.sin(6 * np.pi * f * det * t)
            s *= 1 + 0.12 * np.sin(2 * np.pi * (0.11 + 0.03 * k) * t + ph)
            add(s * env(t0, t1, a, r), pan, amp)
def pluck(m, t0, amp, dec=1.6, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= n: return
    x = np.arange(min(n - i0, int(dec * 4 * SR))) / SR; f = mid(m)
    s = (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x)) * np.exp(-x / dec) * np.minimum(1, x / 0.005)
    sig = np.zeros(n); sig[i0:i0 + len(s)] = s; add(sig, pan, amp)
def hit(t0, amp=1.0):
    i0 = int(t0 * SR)
    if i0 >= n: return
    x = np.arange(min(n - i0, int(2.6 * SR))) / SR
    f = 30 + 55 * np.exp(-x * 7); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-x / 0.8)
    nz = rng.normal(0, 1, len(x)); k = np.ones(160) / 160; nz = np.convolve(nz, k, "same") * np.exp(-x / 0.25) * 0.5
    sig = np.zeros(n); sig[i0:i0 + len(x)] = s + nz; add(sig, 0, amp)
def tick(t0, amp=0.3):
    i0 = int(t0 * SR)
    if i0 >= n: return
    x = np.arange(int(0.05 * SR)) / SR
    s = np.sin(2 * np.pi * 1800 * x) * np.exp(-x / 0.008)
    sig = np.zeros(n); sig[i0:i0 + len(x)] = s; add(sig, 0, amp)
def crackle(t0, t1, amp=0.18, density=14):
    for _ in range(int((t1 - t0) * density)):
        i0 = int(rng.uniform(t0, t1) * SR)
        if i0 >= n - 3000: continue
        ln = int(rng.uniform(0.002, 0.012) * SR)
        sig = np.zeros(n); sig[i0:i0 + ln] = rng.normal(0, 1, ln) * np.exp(-np.arange(ln) / (ln / 4)); add(sig, rng.uniform(-.8, .8), amp * rng.uniform(.3, 1))
def S(i): return shots[i]["start"]
def E(i): return shots[i]["end"]

# ---- harmony (D minor world) ----
Dm = [38, 45, 50, 53, 57]; Bb = [34, 46, 50, 53, 58]; F = [41, 48, 53, 57, 60]; C = [36, 48, 52, 55, 60]; Gm = [43, 50, 55, 58, 62]; Am = [45, 52, 57, 60, 64]; A7 = [45, 52, 55, 61, 64]
def section(chords, t0, t1, amp, bright=1.0, a=3.0):
    d = (t1 - t0) / len(chords)
    for i, c in enumerate(chords): pad(c, t0 + i * d - (1.5 if i else 0), t0 + (i + 1) * d + 2.0, amp, a=a, r=3.0, bright=bright)
# S1 hook: low, tense
section([Dm, Dm, A7], 0, S("2.1"), 0.075, bright=0.5)
# S2-S3 empire/golden years: warmer, moving
section([Dm, Bb, F, C, Dm, Bb, F, C], S("2.1"), S("4.1"), 0.09, bright=1.0)
for i, m in enumerate([62, 65, 69, 72, 69, 65]):  # soft piano-ish line in the golden years
    pluck(m, S("3.1") + i * 2.4, 0.07, 2.0, pan=-0.3 if i % 2 else 0.3)
# S4 key drop: darker
section([Gm, Dm, A7, Dm], S("4.1"), S("5.1"), 0.1, bright=0.6)
# S5-S6 platform / inside: sparse, pulsing
section([Dm, Gm, Dm, A7, Dm, Gm], S("5.1"), S("7.1"), 0.09, bright=0.5)
for tt in np.arange(S("5.1"), S("7.1"), 1.9): hit(tt, 0.10)
# S7 wrong turn: low drone, fire crackle
pad([26, 38, 45], S("7.1"), S("8.1"), 0.11, a=2.5, r=3.0, bright=0.4)
pad([50, 53], S("7.4"), S("8.1"), 0.05, bright=0.3)
crackle(S("7.2"), S("7.4"), 0.16)
# S8 sale: cold
section([Am, Dm, Am], S("8.1"), S("9.1"), 0.08, bright=0.35)
# S9 lesson: light, then silence beat, piano only, strings return, final swell
section([F, C], S("9.1"), S("9.2") - 0.1, 0.085, bright=0.9)
SIL0, SIL1 = S("9.2") - 0.3, S("9.2") + 1.4            # the 1-second silence beat before "So what does the story teach?"
for i, m in enumerate([62, 65, 69, 65, 62, 57]): pluck(m, S("9.3") + 0.4 + i * 1.9, 0.09, 2.4)
pad(Dm, S("9.5") - 0.5, S("9.6") + 9, 0.12, a=2.0, r=2.0, bright=1.1)
pad(Bb, S("9.6") + 4, VO_END + 4.5, 0.12, a=4.0, r=2.5, bright=1.1)
pad(Dm, VO_END - 0.5, TOTAL, 0.10, a=1.5, r=4.5, bright=0.8)
# music-only duck for the silence beat
mus_gate = np.ones(n)
a0, a1 = int(SIL0 * SR), int(SIL1 * SR)
mus_gate[a0:a1] = 0; ramp = int(0.25 * SR)
mus_gate[max(0, a0 - ramp):a0] = np.linspace(1, 0, a0 - max(0, a0 - ramp)); mus_gate[a1:a1 + ramp] = np.linspace(0, 1, ramp)
L *= mus_gate; R *= mus_gate
# global fade in/out
fade = np.minimum(1, t / 3.0) * np.minimum(1, (TOTAL - t) / 4.0); L *= fade; R *= fade
# room tone for the corridor shots
for sid in ("6.5", "9.4"):
    i0, i1 = int(S(sid) * SR), int(E(sid) * SR); nz = rng.normal(0, 1, i1 - i0); nz = np.convolve(nz, np.ones(400) / 400, "same")
    g = np.minimum(1, np.arange(i1 - i0) / (SR * 0.5)) * np.minimum(1, (i1 - i0 - np.arange(i1 - i0)) / (SR * 0.5))
    sig = np.zeros(n); sig[i0:i1] = nz * g * 0.35; add(sig, 0, 0.12)
# ---- SFX (added after the gate so they are not muted) ----
for sid in ["1.5"]: hit(S(sid), 0.55)
hit(S("5.4") + 5.5, 0.6)                 # CANCELLED stamp
hit(S("8.3") + 3.4, 0.6)                 # the phones slice lifts away
hit(E("9.6") - 4.6, 0.7)                 # final lights go out
hit(VO_END + 0.4, 0.35)                  # end card
crackle(S("4.5") + 6, S("4.5") + 11, 0.10, 8)   # crack-line
crackle(S("5.6") + 4, S("5.6") + 6.5, 0.10, 8)
crackle(S("9.5"), E("9.5"), 0.12)
for sid in ["1.1", "1.3", "2.2", "2.6", "3.1", "3.2", "3.7", "4.3", "4.4", "4.5", "5.1", "5.3", "5.5", "5.7", "6.3", "7.4", "7.6", "7.7", "8.1", "8.2", "9.1"]: tick(S(sid) + 0.2)
for i in range(1, 4): tick(S("9.1") + 1 + 4.5 * i + 0.1)
for i in range(3): tick(S("1.1") + 0.5 + i * 0.9)
# ---- master: soft clip, normalise to about -3 dBFS peak ----
for ch in (L, R):
    np.tanh(ch * 1.0, out=ch)
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk; R /= pk
out = (np.stack([L, R], 1) * 0.7 * 32767).astype("<i2")
import wave
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print("wrote", sys.argv[2], round(TOTAL, 1), "s")
