// Synthesises the Stone Age film's ambience + sound effects (no samples, no network). `npm run audio:stone`
import {mkdirSync, writeFileSync} from 'node:fs';

const SR = 22050;
const OUT = new URL('../public/stone/audio/', import.meta.url);
mkdirSync(OUT, {recursive: true});
let seed = 987654321;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rand() * 2 - 1;
const TAU = Math.PI * 2;

const wav = (name, samples, peak = 0.9) => {
  let max = 1e-9;
  for (const s of samples) max = Math.max(max, Math.abs(s));
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.round((s / max) * peak * 32767), 44 + i * 2));
  writeFileSync(new URL(name, OUT), buf);
  console.log(`wrote public/stone/audio/${name} (${(samples.length / SR).toFixed(1)}s)`);
};
const make = (sec, fn) => Float64Array.from({length: Math.floor(sec * SR)}, (_, i) => fn(i / SR, i));
const lp = (k) => {
  let y = 0;
  return (x) => (y += (x - y) * k);
};
const bp = (kl, kh) => {
  const a = lp(kl);
  const b = lp(kh);
  return (x) => a(x) - b(x);
};
/** Make a buffer loop seamlessly by cross-fading its tail into its head. */
const loopable = (buf, fade = 1.5) => {
  const n = Math.floor(fade * SR);
  const out = buf.slice(0, buf.length - n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    out[i] = out[i] * t + buf[buf.length - n + i] * (1 - t);
  }
  return out;
};
const chirp = (buf, t0, dur, f0, f1, amp, vib = 0) => {
  const i0 = Math.floor(t0 * SR);
  for (let i = 0; i < dur * SR && i0 + i < buf.length; i++) {
    const t = i / SR;
    const u = t / dur;
    const f = f0 + (f1 - f0) * u + Math.sin(t * 50) * vib;
    buf[i0 + i] += Math.sin(TAU * f * t) * amp * Math.sin(Math.PI * u) ** 1.5;
  }
};

// Daytime forest: breathing wind + scattered birdsong + leaf hush.
{
  const L = 34;
  const wind = bp(0.02, 0.003);
  const hush = bp(0.25, 0.04);
  const buf = make(L, (t) => wind(noise()) * 9 * (0.55 + 0.45 * Math.sin(t * 0.37) ** 2) + hush(noise()) * 0.9 * (0.5 + 0.5 * Math.sin(t * 0.9 + 1)));
  const r = rand;
  for (let k = 0; k < 26; k++) {
    const t0 = 0.5 + r() * (L - 2);
    const f = 2200 + r() * 2400;
    const n = 2 + Math.floor(r() * 4);
    for (let j = 0; j < n; j++) chirp(buf, t0 + j * 0.13, 0.09, f, f * (1.1 + r() * 0.4), 0.16, 60);
  }
  wav('amb-forest.wav', loopable(buf), 0.5);
}

// Night: crickets, a slow wind and one far owl.
{
  const L = 30;
  const wind = bp(0.015, 0.002);
  const buf = make(L, (t) => wind(noise()) * 6 * (0.5 + 0.5 * Math.sin(t * 0.3) ** 2) + Math.sin(TAU * 4300 * t) * (Math.sin(TAU * 17 * t) > 0.2 ? 0.05 : 0) * (Math.sin(TAU * 0.4 * t) > -0.2 ? 1 : 0.2) + Math.sin(TAU * 4700 * t) * (Math.sin(TAU * 13 * t + 1) > 0.3 ? 0.04 : 0));
  for (const t0 of [6, 19]) {
    chirp(buf, t0, 0.4, 420, 380, 0.22);
    chirp(buf, t0 + 0.55, 0.7, 380, 320, 0.22);
  }
  wav('amb-night.wav', loopable(buf), 0.45);
}

// Fire: low roar and random crackle.
{
  const L = 18;
  const roar = bp(0.07, 0.01);
  const buf = make(L, () => roar(noise()) * 0.8);
  for (let k = 0; k < 160; k++) {
    const i0 = Math.floor(rand() * (L - 0.3) * SR);
    const amp = 0.2 + rand() * 0.9;
    const f = lp(0.2 + rand() * 0.6);
    for (let i = 0; i < 0.03 * SR; i++) buf[i0 + i] += f(noise()) * amp * Math.exp(-i / (0.006 * SR));
  }
  wav('fire.wav', loopable(buf, 1), 0.6);
}

// Footstep on leaf litter.
wav('footstep.wav', (() => {
  const f = lp(0.12);
  const g = bp(0.5, 0.2);
  return make(0.3, (t) => (f(noise()) * Math.exp(-t * 26) * 1.4 + Math.sin(TAU * (90 - t * 120) * t) * Math.exp(-t * 28) * 0.7 + g(noise()) * Math.exp(-(t - 0.03) * 20) * 0.35 * (t > 0.03 ? 1 : 0)));
})(), 0.7);

// Twig snap + foliage rustle.
wav('twig.wav', make(0.3, (t) => (noise() * Math.exp(-t * 120) + Math.sin(TAU * 1800 * t) * Math.exp(-t * 90) * 0.4) * 0.9), 0.8);
{
  const f = bp(0.4, 0.05);
  wav('rustle.wav', make(1.0, (t) => f(noise()) * Math.sin(Math.PI * Math.min(1, t)) ** 2 * (0.6 + 0.4 * Math.sin(t * 40))), 0.6);
}

// Distant wolf howl (reconstruction: a rising-falling tone with vibrato and breath).
{
  const br = bp(0.3, 0.1);
  wav('howl.wav', make(4.6, (t) => {
    const u = t / 4.6;
    const env = Math.sin(Math.PI * u) ** 1.4;
    const f = 330 + 260 * Math.sin(Math.PI * Math.min(1, u * 1.15)) - 90 * u + Math.sin(t * 38) * 7 * u;
    return (Math.sin(TAU * f * t) * 0.6 + Math.sin(TAU * f * 2 * t) * 0.2 + br(noise()) * 0.08) * env;
  }), 0.55);
}

// Comedy: sad trombone ("womp womp"), boing, ding, pop, stomach growl, stone clack.
{
  const notes = [[233, 0.0, 0.45], [220, 0.5, 0.45], [208, 1.0, 0.45], [196, 1.5, 1.1]];
  const f = lp(0.18);
  wav('womp.wav', make(2.8, (t) => {
    let s = 0;
    for (const [fr, t0, d] of notes) {
      if (t >= t0 && t < t0 + d) {
        const u = (t - t0) / d;
        const w = fr * (1 - 0.04 * (fr === 196 ? Math.sin((t - t0) * 24) : 0));
        s += f(((t * w) % 1) * 2 - 1) * (u < 0.05 ? u / 0.05 : 1 - u * 0.4) * Math.min(1, (t0 + d - t) * 30);
      }
    }
    return s;
  }), 0.7);
}
wav('boing.wav', make(0.7, (t) => Math.sin(TAU * (260 + 380 * Math.sin(t * 9) * Math.exp(-t * 3.5)) * t + 8 * Math.sin(t * 40) * Math.exp(-t * 6)) * Math.exp(-t * 4.5)), 0.6);
wav('ding.wav', make(1.4, (t) => (Math.sin(TAU * 1568 * t) + 0.5 * Math.sin(TAU * 2349 * t) + 0.25 * Math.sin(TAU * 3136 * t)) * Math.exp(-t * 3.4) * Math.min(1, t * 400)), 0.55);
wav('pop.wav', make(0.15, (t) => Math.sin(TAU * (900 - t * 4200) * t) * Math.exp(-t * 36)), 0.6);
{
  const f = lp(0.04);
  wav('stomach.wav', make(2.2, (t) => f(noise()) * 14 * (0.5 + 0.5 * Math.sin(TAU * (3 + 4 * Math.sin(t * 2)) * t)) ** 2 * Math.sin(Math.PI * Math.min(1, t / 2.2)) + Math.sin(TAU * (70 + 30 * Math.sin(t * 5)) * t) * 0.5 * Math.sin(Math.PI * Math.min(1, t / 2.2))), 0.7);
}
wav('clack.wav', make(0.2, (t) => (noise() * Math.exp(-t * 140) * 0.8 + Math.sin(TAU * 1450 * t) * Math.exp(-t * 70) * 0.7 + Math.sin(TAU * 620 * t) * Math.exp(-t * 50) * 0.4)), 0.8);

// Bone flute (pentatonic, vibrato + breath). Reconstruction of timbre only; no surviving tune is known.
{
  const D = (s) => 293.66 * 2 ** (s / 12);
  const seq = [[D(0), 1.0], [D(3), 0.6], [D(5), 1.4], [D(7), 0.8], [D(5), 0.6], [D(3), 1.0], [D(0), 1.6], [0, 0.9], [D(7), 0.9], [D(10), 0.6], [D(12), 1.6], [D(10), 0.7], [D(7), 0.7], [D(5), 1.2], [D(3), 0.8], [D(0), 2.4], [0, 1.0], [D(5), 0.8], [D(7), 1.2], [D(3), 0.8], [D(5), 0.7], [D(0), 3.0]];
  const total = seq.reduce((n, [, d]) => n + d, 0) + 1;
  const buf = new Float64Array(Math.floor(total * SR));
  const breath = bp(0.35, 0.12);
  let t0 = 0.3;
  for (const [f, d] of seq) {
    if (f) {
      const i0 = Math.floor(t0 * SR);
      for (let i = 0; i < (d + 0.15) * SR; i++) {
        const t = i / SR;
        const env = Math.min(1, t / 0.07) * Math.min(1, Math.max(0, (d + 0.15 - t) / 0.18)) * (0.85 + 0.15 * Math.sin(t * 5));
        const fr = f * (1 + 0.006 * Math.sin(TAU * 5.2 * t) * Math.min(1, t * 2));
        buf[i0 + i] += (Math.sin(TAU * fr * t) * 0.7 + Math.sin(TAU * fr * 2 * t) * 0.14 + Math.sin(TAU * fr * 3 * t) * 0.05 + breath(noise()) * 0.18) * env;
      }
    }
    t0 += d;
  }
  // a touch of cave reverb
  const out = Float64Array.from(buf);
  for (const [delay, g] of [[0.19, 0.35], [0.37, 0.22], [0.61, 0.14]]) {
    const n = Math.floor(delay * SR);
    for (let i = n; i < out.length; i++) out[i] += buf[i - n] * g;
  }
  wav('flute.wav', out, 0.6);
}
