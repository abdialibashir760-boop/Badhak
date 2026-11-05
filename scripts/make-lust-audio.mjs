// Dark ambient bed + a soft whoosh on every cut for the lust film. Voice-over is mixed in with ffmpeg afterwards.
import {build} from 'esbuild';
import {mkdirSync, writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

await build({entryPoints: ['src/lust/config.ts'], bundle: true, format: 'esm', outfile: 'out/_lust.mjs', logLevel: 'error'});
const {LUST_STARTS, LUST_END} = await import(pathToFileURL(process.cwd() + '/out/_lust.mjs').href);
const SR = 44100;
const N = Math.ceil(LUST_END * SR);
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 99;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const hz = (m) => 440 * Math.pow(2, (m - 57) / 12);
// pad: A minor add9, slow drift; lifts to a warm major chord for the last scene
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const warm = Math.min(1, Math.max(0, (t - 144.7) / 3));
  const notes = warm > 0 ? [45, 52, 57, 61, 64] : [45, 52, 57, 60, 64];
  let s = 0;
  notes.forEach((m, k) => (s += Math.sin(2 * Math.PI * hz(m + 0) * t + k) * (0.6 + 0.4 * Math.sin(t * 0.3 + k))));
  s += 0.9 * Math.sin(2 * Math.PI * 55 * t); // sub
  const pulse = 0.55 + 0.45 * Math.pow(Math.max(0, Math.sin(2 * Math.PI * 1.2 * t)), 6); // slow heartbeat swell
  const v = s * 0.035 * pulse * Math.min(1, t / 3) * Math.min(1, (LUST_END - t) / 3);
  L[i] += v;
  R[i] += v * 0.96;
}
// whoosh on each cut
LUST_STARTS.forEach((t0, n) => {
  if (n === 0) return;
  const len = 0.3;
  let lp = 0;
  const i0 = Math.floor((t0 - 0.08) * SR);
  for (let i = 0; i < len * SR; i++) {
    const k = i / (len * SR);
    lp += ((rnd() * 2 - 1) - lp) * (0.05 + k * 0.4);
    const v = lp * Math.sin(Math.PI * k) * 0.14;
    if (i0 + i >= 0 && i0 + i < N) { L[i0 + i] += v; R[i0 + i] += v; }
  }
  // soft low thump
  for (let i = 0; i < 0.22 * SR; i++) {
    const t = i / SR;
    const v = Math.sin(2 * Math.PI * 70 * (1 - t) * t) * Math.exp(-t * 18) * 0.2;
    const j = Math.floor(t0 * SR) + i;
    if (j < N) { L[j] += v; R[j] += v; }
  }
});
const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVEfmt ', 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
}
mkdirSync('out', {recursive: true});
writeFileSync('out/lust-bed.wav', out);
console.log('bed written');
