#!/usr/bin/env node
/**
 * Drop-in narration step.
 *   1. Put one audio file per beat in public/audio/narration/  (b01.mp3 … b15.mp3; .wav/.m4a also fine)
 *      The text of each beat is in docs/beats.json (generate them in one voice, one take each).
 *   2. node scripts/sync-narration.mjs
 *        - measures every file, places beats section by section (same layout rules as src/timeline.ts)
 *        - if a section's speech doesn't fit, speeds that section up (atempo, max 1.12) and says so
 *        - writes src/generated/narration.json  → captions and beat timings follow the real voice
 *        - mixes voice + the music/ambience/SFX bed (ducked under speech) → public/audio/mix.mp3
 *   Options:  --dir <narration dir>   --out <mix mp3>   --no-mix
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const dir = path.resolve(arg('--dir', `${root}/public/audio/narration`));
const outMix = path.resolve(arg('--out', `${root}/public/audio/mix.mp3`));
const beats = JSON.parse(fs.readFileSync(`${root}/docs/beats.json`, 'utf8'));
const SECTIONS = [
  ['hook', 0, 25, 0.8, 0.5], ['newton', 25, 65, 1.4, 0.6], ['einstein', 65, 115, 1.4, 0.6],
  ['orbits', 115, 160, 1.2, 0.6], ['time', 160, 205, 1.2, 0.6], ['finale', 205, 240, 0.8, 3.5],
];
const GAP = 0.45, MAX_TEMPO = 1.12;

const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
const find = (id) => files.find((f) => f.startsWith(id + '.'));
const missing = beats.filter((b) => !find(b.id)).map((b) => b.id);
if (missing.length) { console.error(`Missing narration files for: ${missing.join(', ')}\nExpected ${dir}/<id>.mp3`); process.exit(1); }
const dur = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

const timings = {}, plan = [];
for (const [sec, from, to, lead, tail] of SECTIONS) {
  const bs = beats.filter((b) => b.section === sec).map((b) => ({ ...b, file: `${dir}/${find(b.id)}`, d: dur(`${dir}/${find(b.id)}`) }));
  const window = to - from - lead - tail - GAP * (bs.length - 1);
  const total = bs.reduce((n, b) => n + b.d, 0);
  const tempo = Math.max(1, total / window);
  if (tempo > MAX_TEMPO) console.warn(`⚠ ${sec}: speech is ${total.toFixed(1)}s but only ${window.toFixed(1)}s fits (needs ×${tempo.toFixed(2)}) — shorten the text of this section.`);
  else if (tempo > 1) console.log(`  ${sec}: sped up ×${tempo.toFixed(3)} to fit`);
  const t = Math.min(tempo, MAX_TEMPO);
  // spread any spare time evenly into the gaps so beats breathe
  const used = total / t;
  const slack = Math.max(0, window - used);
  const gap = GAP + slack / Math.max(1, bs.length - 1) * 0.6;
  let cur = from + lead;
  for (const b of bs) {
    const d = b.d / t;
    timings[b.id] = { start: +cur.toFixed(3), end: +(cur + d).toFixed(3), tempo: +t.toFixed(4) };
    plan.push({ ...b, start: cur, tempo: t });
    cur += d + gap;
  }
}
fs.writeFileSync(`${root}/src/generated/narration.json`, JSON.stringify(timings, null, 1));
console.log('✔ wrote src/generated/narration.json (captions now follow the real voice)');
if (process.argv.includes('--no-mix')) process.exit(0);

// ── mix: voice track (adelay + atempo per beat) over the bed, ducked ──
const bed = `${root}/build/audio/bed.wav`;
if (!fs.existsSync(bed)) { console.error('Run `npm run audio` first (build/audio/bed.wav is missing).'); process.exit(1); }
const inputs = ['-i', bed];
const chains = [];
plan.forEach((b, i) => {
  inputs.push('-i', b.file);
  const ms = Math.round(b.start * 1000);
  const tempo = b.tempo > 1.0005 ? `atempo=${b.tempo.toFixed(4)},` : '';
  chains.push(`[${i + 1}:a]${tempo}aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms}|${ms}[v${i}]`);
});
const vlabels = plan.map((_, i) => `[v${i}]`).join('');
const graph = [
  ...chains,
  `${vlabels}amix=inputs=${plan.length}:normalize=0:dropout_transition=0,volume=1.0,asplit=2[vo][vosc]`,
  `[0:a]volume=0.9[bedv]`,
  `[bedv][vosc]sidechaincompress=threshold=0.02:ratio=8:attack=40:release=500:makeup=1[ducked]`,
  `[ducked][vo]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=9[out]`,
].join(';');
execFileSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', graph, '-map', '[out]', '-t', '240', '-c:a', 'libmp3lame', '-q:a', '2', outMix], { stdio: 'inherit' });
console.log(`✔ mixed narration over the bed → ${outMix}`);
