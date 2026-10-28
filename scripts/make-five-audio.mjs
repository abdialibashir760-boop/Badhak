// Synthesises THE 5-MINUTE RULE sound track (piano score + Foley + ambience) into public/five/audio/mix.wav.
// Foley hit times come from src/five/timeline.ts, the same events that drive the picture.
import {build} from 'esbuild';
import {mkdirSync, writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

await build({entryPoints: ['src/five/timeline.ts'], bundle: true, format: 'esm', outfile: 'out/_timeline.mjs', logLevel: 'error'});
const T = await import(pathToFileURL(process.cwd() + '/out/_timeline.mjs').href);
const {S, DOC_KEYS, NOTE_STEPS, SWIPES, TOTAL} = T;

const SR = 44100;
const N = TOTAL * SR;
const L = new Float32Array(N);
const R = new Float32Array(N);
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const noise = () => rnd() * 2 - 1;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const add = (t0, len, fn, gain = 1, pan = 0) => {
  const i0 = Math.max(0, Math.floor(t0 * SR));
  const n = Math.min(Math.floor(len * SR), N - i0);
  const gl = gain * (1 - Math.max(0, pan)), gr = gain * (1 + Math.min(0, pan));
  for (let i = 0; i < n; i++) {
    const v = fn(i / SR, i);
    L[i0 + i] += v * gl;
    R[i0 + i] += v * gr;
  }
};
const D = {D1: 26, D2: 38, A2: 45, D3: 50, A3: 57, D4: 62, F4: 65, Fs4: 66, A4: 69, D5: 74, Eb4: 63, C4: 60, Bb3: 58, F3: 53, C3: 48, Bb2: 46, Fs3: 54, E4: 64, G3: 55, D6: 86, A5: 81, Fs5: 78, G4: 67};

/** felt piano: soft attack, a few partials, long decay */
const piano = (t0, midi, vel = 0.5, dur = 4, gain = 1) => {
  const f = hz(midi);
  const dec = 1.1 + (midi - 40) * 0.012;
  add(t0, dur + 1, (t) => {
    let s = 0;
    for (let h = 1; h <= 6; h++) s += (Math.sin(2 * Math.PI * f * h * (1 + 0.0004 * h * h) * t) / Math.pow(h, 1.35)) * Math.exp(-t * dec * (1 + h * 0.35));
    const att = Math.min(1, t / 0.006);
    const rel = Math.min(1, Math.max(0, (dur + 1 - t) / 0.8));
    return s * att * rel * vel * 0.3;
  }, gain);
};
const chord = (t0, ms, vel, dur, gain = 1) => ms.forEach((m, i) => piano(t0 + i * 0.03, m, vel, dur, gain));
const pad = (t0, dur, ms, vol = 0.05, attack = 2) =>
  add(t0, dur, (t) => {
    const e = Math.min(1, t / attack) * Math.min(1, (dur - t) / 2);
    let s = 0;
    for (const m of ms) s += Math.sin(2 * Math.PI * hz(m) * t) + 0.4 * Math.sin(2 * Math.PI * hz(m) * 2.003 * t);
    return (s / ms.length) * e * vol;
  });

/* ---------------------------------------------------------------- Foley */

const click = (t0, f = 2400, vol = 0.3, len = 0.035, pan = 0) =>
  add(t0, len, (t) => (noise() * 0.6 + Math.sin(2 * Math.PI * f * t) * 0.5) * Math.exp(-t * 130) * vol, 1, pan);
const thud = (t0, f = 90, vol = 0.6, len = 0.35) => add(t0, len, (t) => Math.sin(2 * Math.PI * f * (1 - t * 0.5) * t) * Math.exp(-t * 14) * vol);
const swish = (t0, len = 0.22, vol = 0.12, f = 0.25) => {
  let lp = 0;
  add(t0, len, (t) => {
    lp += (noise() - lp) * f;
    return lp * Math.sin((Math.PI * t) / len) * vol;
  });
};
const tap = (t0, vol = 0.2) => add(t0, 0.06, (t) => Math.sin(2 * Math.PI * 520 * t) * Math.exp(-t * 90) * vol + noise() * Math.exp(-t * 200) * vol * 0.4);
const buzz = (t0, len = 0.45, vol = 0.22) => add(t0, len, (t) => (Math.sin(2 * Math.PI * 160 * t) * 0.6 + Math.sign(Math.sin(2 * Math.PI * 80 * t)) * 0.25 + noise() * 0.1) * Math.min(1, t / 0.01) * Math.min(1, (len - t) / 0.02) * vol);
const tick = (t0, vol = 0.22) => {
  click(t0, 1700, vol, 0.03);
  click(t0 + 0.03, 900, vol * 0.5, 0.04);
};
const key = (t0, vol = 0.3) => {
  const f = 1800 + rnd() * 900;
  click(t0, f, vol, 0.03, (rnd() - 0.5) * 0.4);
  click(t0 + 0.045, 700, vol * 0.4, 0.03);
};
const bell = (t0, midi, vol = 0.5) =>
  add(t0, 6, (t) => {
    const f = hz(midi);
    return (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 3) + 0.25 * Math.sin(2 * Math.PI * f * 5.4 * t) * Math.exp(-t * 6)) * Math.exp(-t * 0.9) * vol * Math.min(1, t / 0.003);
  });
const creak = (t0, len, vol = 0.08, f0 = 300) =>
  add(t0, len, (t) => Math.sin(2 * Math.PI * (f0 + 90 * Math.sin(t * 17) + t * 60) * t) * (0.5 + 0.5 * Math.sin(t * 29)) * Math.sin((Math.PI * t) / len) * vol);
const step = (t0, vol = 0.25) => {
  thud(t0, 110, vol, 0.12);
  click(t0, 600, vol * 0.5, 0.05);
};
const bird = (t0, base, vol = 0.05) => {
  const n = 3 + Math.floor(rnd() * 4);
  for (let k = 0; k < n; k++) add(t0 + k * 0.13, 0.1, (t) => Math.sin(2 * Math.PI * (base + 700 * Math.sin(t * 40) + 500 * t) * t) * Math.sin((Math.PI * t) / 0.1) * vol, 1, rnd() - 0.5);
};

/* ---------------------------------------------------------------- ambience */
const rainLevel = (t) => (t < S(21) + 3 ? 1 : t < S(23) ? Math.max(0.25, 1 - (t - S(21) - 3) / 8) : 0) * (t > S(11) + 0.3 && t < S(11) + 2.6 ? 0.5 : 1) * (t < 0.5 ? t / 0.5 : 1);
{
  let a = 0, b = 0, ha = 0, hb = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const lv = rainLevel(t) * 0.05;
    if (lv <= 0.0001) continue;
    const na = noise(), nb = noise();
    a += (na - a) * 0.3; b += (nb - b) * 0.3;
    ha += (a - ha) * 0.02; hb += (b - hb) * 0.02;
    L[i] += (a - ha) * lv * 2.2;
    R[i] += (b - hb) * lv * 2.2;
  }
}
// city hum / fridge
add(0, TOTAL, (t) => Math.sin(2 * Math.PI * 58 * t) * 0.006 + Math.sin(2 * Math.PI * 116 * t) * 0.003);

/* ---------------------------------------------------------------- the score */
const P = (t, m, v, d, g) => piano(t, D[m], v, d, g);
P(2.0, 'D4', 0.55, 6); // 0:02 hope
// scene 2: open fifths, 60 bpm
for (let k = 0; k < 3; k++) {
  P(S(2) + 1 + k * 2, 'D2', 0.45, 3);
  P(S(2) + 1.5 + k * 2, 'A2', 0.35, 3);
}
P(S(3) + 0.6, 'Eb4', 0.45, 5); // the unresolved minor second
// scene 4: sub drone + clock tick as tempo
add(S(4), S(11) - S(4), (t) => {
  const e = Math.min(1, t / 3) * (t > 60 && t < 68 ? 1 + (t - 60) / 12 : 1);
  return (Math.sin(2 * Math.PI * 36.7 * t) + 0.3 * Math.sin(2 * Math.PI * 73.4 * t)) * 0.16 * e;
});
P(S(5) + 2, 'A3', 0.4, 3); P(S(5) + 4, 'C4', 0.4, 2);
P(S(6) + 3, 'D6', 0.18, 4);
P(S(7) + 5, 'A3', 0.4, 2); P(S(7) + 5.8, 'F4', 0.4, 2); P(S(7) + 6.6, 'D4', 0.4, 4);
P(S(7) + 6.9, 'D2', 0.6, 6);
// scene 8: the phrase repeated, one note removed each time
const phrase = ['D4', 'F4', 'A4', 'D5', 'A4'];
for (let r = 0; r < 5; r++) phrase.slice(0, 5 - r).forEach((m, i) => P(S(8) + r * 2 + i * 0.35, m, 0.32, 1.2));
// scene 9: faint heartbeat
for (let t = S(9); t < S(10); t += 1) { thud(t, 55, 0.2, 0.25); thud(t + 0.28, 50, 0.12, 0.2); }
// scene 10: riser then cut to silence (drone ends at S(11))
{
  let lp = 0;
  add(S(10), 9, (t) => {
    lp += (noise() - lp) * (0.02 + t * 0.012);
    return lp * Math.pow(Math.min(1, t / 6.2), 2) * (t < 6.3 ? 1 : 0) * 0.45;
  });
}
P(S(11) + 5.3, 'D3', 0.3, 5); // far-away note in the silence
P(S(12) + 5, 'D4', 0.5, 5);
['D4', 'F4', 'A4'].forEach((m, i) => P(S(13) + 2 + i * 1.3, m, 0.4, 3));
P(S(13) + 6.6, 'A4', 0.4, 2); P(S(13) + 7.6, 'C4', 0.4, 4);
P(S(14), 'D2', 0.5, 7);
// ostinato from the moment the timer starts
const ost = (from, to, bpm, extra) => {
  const beat = 60 / bpm;
  let i = 0;
  for (let t = from; t < to; t += beat, i++) {
    P(t, i % 2 ? 'A3' : 'D3', 0.28, 1.6);
    if (extra && i % 4 === 2) P(t + beat * 0.5, 'F4', 0.22, 1.5);
  }
};
ost(S(14) + 5.5, S(15) + 1, 60, false);
ost(S(15) + 1, S(16), 66, true);
P(S(16) + 3.6, 'D6', 0.2, 4);
ost(S(16), S(18), 66, true);
for (let t = S(17); t < S(18); t += 3.6) P(t, 'D2', 0.35, 3.5);
P(S(18) + 0.6, 'Eb4', 0.4, 3.2);
P(S(18) + 4.0, 'D4', 0.55, 4); // resolves
// scene 19: Bb - F - C - Dm
const prog = [['Bb2', 'F3', 'Bb3', 'D4'], ['F3', 'C4', 'F4'], ['C3', 'G3', 'E4'], ['D3', 'A3', 'F4', 'A4']];
for (let t = S(19), i = 0; t < S(20) + 2.7; t += 2, i++) chord(t, prog[i % 4].map((m) => D[m]), 0.3, 2.1);
bell(S(20) + 2.7, 74, 0.45); // the bell, D5
// scene 20 → major
const maj = [['Bb2', 'F3', 'A3', 'D4'], ['F3', 'A3', 'C4', 'F4'], ['C3', 'G3', 'C4', 'E4'], ['D3', 'A3', 'D4', 'Fs4']];
for (let t = S(20) + 4.6, i = 0; t < S(21) + 2; t += 1.8, i++) chord(t, maj[i % 4].map((m) => D[m]), 0.34, 2);
// scene 21: arpeggios, warm pad
pad(S(21), 14, [50, 57, 62, 66], 0.05, 2.5);
['D3', 'A3', 'Fs4', 'A4', 'D5', 'A4', 'Fs4', 'A3'].forEach((m, i) => { for (let r = 0; r < 4; r++) P(S(21) + 1.5 + r * 1.6 + i * 0.2, m, 0.22, 1.2); });
chord(S(22), [D.D3, D.A3, D.D4, D.Fs4, D.A4], 0.4, 6); // resolved, sustained
pad(S(22), 8, [50, 57, 62, 66], 0.05, 1.5);
// scene 23: the theme in D major with strings
pad(S(23), 13, [50, 57, 62, 66, 69], 0.06, 2);
['D4', 'Fs4', 'A4', 'D5', 'A4', 'Fs4', 'G4', 'E4', 'D4'].forEach((m, i) => P(S(23) + 0.4 + i * 0.62, m, 0.4, 1.6));
['A3', 'Fs4', 'A4', 'D5', 'Fs5', 'A4'].forEach((m, i) => P(S(24) + 0.2 + i * 0.5, m, 0.3, 1.5));
P(S(24) + 3.2, 'D3', 0.35, 4);
P(S(24) + 3.6, 'D4', 0.6, 5.2); // the first note of the film, resolved
chord(S(24) + 3.6, [D.A3, D.Fs4], 0.25, 4);

/* ---------------------------------------------------------------- Foley placement */
// clock tick: the film's metronome
for (let t = S(4); t < S(11); t += 1) {
  if (t >= S(10) && t < S(11)) continue;
  tick(t, 0.18);
}
for (let t = S(10); t < S(11); t += 1) { tick(t, 0.4); tick(t + 0.5, 0.28); thud(t, 60, 0.15, 0.2); } // ghost tick-tock
for (let t = S(12) + 5.5; t < S(21) + 1; t += 1) tick(t, 0.15);
tick(S(13) + 8.4, 0.2);
// scene 1
[0.5, 1.3, 1.9, 2.7, 3.3].forEach((x) => tap(S(1) + x, 0.18));
add(S(1) + 3.6, 0.35, (t) => (Math.sin(2 * Math.PI * 660 * t) + Math.sin(2 * Math.PI * 880 * Math.max(0, t - 0.1)) * (t > 0.1 ? 1 : 0)) * Math.exp(-t * 9) * 0.1);
// scene 2
[1.7, 2.4].forEach((x) => { click(S(2) + x, 900, 0.5, 0.02); thud(S(2) + x, 140, 0.18, 0.08); });
creak(S(2) + 0.6, 0.7, 0.05); add(S(2) + 4.0, 1.8, (t) => noise() * Math.sin((Math.PI * t) / 1.8) * 0.02);
// scene 3: buzz buzz buzz
[1.6, 2.2, 2.8].forEach((x, i) => buzz(S(3) + x, i === 2 ? 0.2 : 0.45, 0.24));
// scene 4, 9: swipes with rising pitch + likes
SWIPES.forEach((x, i) => { swish(x, 0.16, 0.14, 0.18 + i * 0.012); if (i % 5 === 3) tap(x + 0.1, 0.1); });
for (let t = S(9) + 0.5; t < S(9) + 4.5; t += 0.8) swish(t, 0.3, 0.05);
// scene 6: card chime and thud on Ignore
bell(S(6) + 0.5, 81, 0.07); thud(S(6) + 5, 120, 0.3, 0.12);
// scene 7
buzz(S(7) + 3.2, 0.3, 0.12); thud(S(7) + 3.4, 70, 0.4, 0.4); creak(S(7) + 5, 1.2, 0.05, 200);
// scene 8: the same sound pitched down each repeat
for (let r = 0; r < 5; r++) { creak(S(8) + r * 2 + 0.2, 0.5, 0.05, 300 - r * 18); buzz(S(8) + r * 2 + 1.1, 0.3, 0.12); }
// scene 9: sheet rustle, slap
swish(S(9) + 1.2, 1.2, 0.04, 0.05); thud(S(9) + 5.2, 85, 0.5, 0.25); creak(S(9) + 5.4, 1, 0.04, 180);
// scene 10: fabric drag
swish(S(10) + 5.5, 1.8, 0.07, 0.04);
// scene 11: warning chirp, power-off clunk, then true silence
[0.3, 0.6].forEach((x) => add(S(11) + x, 0.2, (t) => Math.sin(2 * Math.PI * (x < 0.5 ? 880 : 660) * t) * Math.exp(-t * 6) * 0.14));
thud(S(11) + 2.5, 70, 0.55, 0.3); click(S(11) + 2.5, 400, 0.3, 0.06);
// scene 12: charger, boot chime
click(S(12) + 2.7, 1200, 0.4, 0.03); thud(S(12) + 2.72, 150, 0.2, 0.08);
bell(S(12) + 3.2, 79, 0.06);
// scene 13: note typing and backspaces
NOTE_STEPS.forEach((s) => key(s.t, s.kind === 'back' ? 0.14 : 0.18));
// scene 14: wheel detents slowing, warm tap
for (let k = 0, t = S(14) + 0.8; t < S(14) + 3.6; k++) { click(t, 3000, 0.18, 0.015); t += 0.05 + k * 0.02 + 0.0015 * k * k; }
tap(S(14) + 5.5, 0.28);
// scene 15: sheet drag, steps, chair
swish(S(15) + 0.4, 1.4, 0.06, 0.05);
[2.8, 3.5, 4.2, 4.9, 5.6].forEach((x, i) => step(S(15) + x, i < 2 ? 0.3 : 0.2));
creak(S(15) + 6.3, 0.9, 0.06);
// scene 16: hinge, fan spin-up, trackpad click
creak(S(16) + 1.4, 1.2, 0.09, 520); creak(S(16) + 2.6, 0.9, 0.09, 600);
add(S(16) + 3.4, 3.6, (t) => noise() * Math.min(1, t / 1.5) * 0.015);
click(S(16) + 5.6, 1500, 0.3, 0.04);
// scene 17–21: keyboard = percussion
DOC_KEYS.forEach((k) => key(k.t, k.kind === 'back' ? 0.22 : 0.3));
click(S(17) + 0.6, 1500, 0.3, 0.04); click(S(17) + 0.75, 1500, 0.3, 0.04);
// scene 18: buzz x2, rattle, thunk
[0.3, 0.9].forEach((x) => buzz(S(18) + x, 0.45, 0.26)); thud(S(18) + 3.2, 100, 0.7, 0.25); click(S(18) + 3.2, 700, 0.5, 0.05);
// scene 20: tap Stop
tap(S(20) + 4.2, 0.25);
// scene 21: lamp click, time-lapse whir, stretch, lid
click(S(21) + 1.4, 900, 0.55, 0.03); thud(S(21) + 1.42, 200, 0.2, 0.06);
add(S(21) + 2.8, 3, (t) => Math.sin(2 * Math.PI * (200 + 400 * Math.sin(t * 2)) * t) * Math.sin((Math.PI * t) / 3) * 0.015);
swish(S(21) + 3.2, 1.4, 0.04, 0.06); click(S(21) + 4.2, 500, 0.2, 0.05);
thud(S(21) + 6.8, 80, 0.2, 0.15);
// scene 22: steps, duvet, exhale
[0.8, 1.35, 1.9, 2.45].forEach((x) => step(S(22) + x, 0.12));
swish(S(22) + 3, 1.6, 0.05, 0.04); swish(S(22) + 4.6, 1.2, 0.025, 0.03);
// scene 23–24: birds, mug, keys
for (let t = S(23) + 0.4; t < TOTAL - 0.6; t += 0.9 + rnd() * 1.4) bird(t, 2800 + rnd() * 1800, 0.05);
thud(S(23) + 4.0, 160, 0.14, 0.06); click(S(23) + 4.0, 1800, 0.15, 0.03);
for (let t = S(23) + 1.6; t < S(24) + 4.5; t += 0.2 + rnd() * 0.12) if (rnd() < 0.7) key(t, 0.14);
tick(S(24) + 3.0, 0.15); tap(S(24) + 4.9, 0.25);

/* ---------------------------------------------------------------- master */
// a light shared reverb: two feedback taps
const verb = (buf, d1, d2, g) => { for (let i = Math.max(d1, d2); i < N; i++) buf[i] += buf[i - d1] * g * 0.5 + buf[i - d2] * g * 0.35; };
verb(L, Math.floor(0.043 * SR), Math.floor(0.097 * SR), 0.45);
verb(R, Math.floor(0.051 * SR), Math.floor(0.113 * SR), 0.45);
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const k = 0.89 / peak;
const fade = (i) => Math.min(1, i / (SR * 0.05), (N - i) / (SR * 1.2));
const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVEfmt ', 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const f = fade(i) * k;
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, Math.tanh(L[i] * f * 1.1) / Math.tanh(1.1))) * 32767), 44 + i * 4);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, Math.tanh(R[i] * f * 1.1) / Math.tanh(1.1))) * 32767), 46 + i * 4);
}
mkdirSync('public/five/audio', {recursive: true});
writeFileSync('public/five/audio/mix.wav', out);
console.log('wrote public/five/audio/mix.wav', (out.length / 1e6).toFixed(1), 'MB, peak', peak.toFixed(2));
