// Procedurally synthesises the royalty-free background drone and sound effects used by the film.
// No external assets or APIs: `npm run audio` regenerates everything in public/audio.
import {mkdirSync, writeFileSync} from 'node:fs';

const SR = 22050;
const OUT = new URL('../public/audio/', import.meta.url);
mkdirSync(OUT, {recursive: true});

let seed = 12345;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296 - 0.5;
};

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
  console.log(`wrote public/audio/${name} (${(samples.length / SR).toFixed(1)}s)`);
};

const make = (sec, fn) => Float64Array.from({length: Math.floor(sec * SR)}, (_, i) => fn(i / SR, i));

// Ambient drone: every frequency is a multiple of 1/40 Hz and every LFO divides 40 s, so it loops seamlessly.
{
  const L = 40;
  const tones = [
    [55, 0.5], [55.025, 0.35], [54.975, 0.35], [82.5, 0.28], [110, 0.2], [130.8, 0.12], [164.8, 0.08], [220.025, 0.05], [329.6, 0.025],
  ];
  const lfo = (t, k, ph) => 0.5 + 0.5 * Math.sin((2 * Math.PI * t * k) / L + ph);
  wav(
    'ambient.wav',
    make(L, (t) => {
      let s = 0;
      tones.forEach(([f, a], i) => {
        s += a * Math.sin(2 * Math.PI * f * t) * (0.55 + 0.45 * lfo(t, 1 + (i % 4), i));
      });
      return s * (0.75 + 0.25 * lfo(t, 2, 1.3));
    }),
    0.5,
  );
}

// Heartbeat: "lub-dub".
wav(
  'heartbeat.wav',
  make(0.9, (t) => {
    const thump = (t0, a, f) => (t >= t0 ? a * Math.exp(-(t - t0) * 24) * Math.sin(2 * Math.PI * (f - (t - t0) * 90) * (t - t0)) : 0);
    return thump(0, 1, 62) + thump(0.2, 0.65, 54);
  }),
);

// Whoosh: swept, low-passed noise.
{
  let lp = 0;
  wav(
    'whoosh.wav',
    make(1.3, (t) => {
      const env = Math.pow(Math.sin(Math.PI * Math.min(1, t / 1.3)), 2.2);
      const k = 0.02 + 0.3 * env;
      lp += (rand() - lp) * k;
      return lp * env * 2;
    }),
    0.7,
  );
}

// Boom: falling sub sine + short noise.
{
  let lp = 0;
  wav(
    'boom.wav',
    make(2.8, (t) => {
      lp += (rand() - lp) * 0.08;
      return Math.sin(2 * Math.PI * (34 + 70 * Math.exp(-t * 5)) * t) * Math.exp(-t * 1.5) + lp * 2.2 * Math.exp(-t * 14);
    }),
  );
}

// Tick: small dry click.
wav('tick.wav', make(0.12, (t) => (Math.sin(2 * Math.PI * 1500 * t) * 0.6 + rand()) * Math.exp(-t * 90)), 0.6);

// Chime: soft bell partials.
wav(
  'chime.wav',
  make(4, (t) =>
    [[523.25, 1, 1.4], [784, 0.5, 1.8], [1046.5, 0.3, 2.4], [1568, 0.12, 3.2]].reduce((s, [f, a, d]) => s + a * Math.sin(2 * Math.PI * f * t) * Math.exp(-t * d), 0) * Math.min(1, t * 80),
  ),
  0.6,
);
