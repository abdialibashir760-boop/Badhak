// Builds the Stone Age voice-over track from a recording whose sentences follow the script, and measures
// every sentence so subtitles + visuals land exactly on the spoken words.
//   node scripts/make-stone-voice.mjs [assets/voice/stone-voiceover-source.mp3]
// 1. finds the sentence-sized speech segments (skipping any spoken preamble before "Imagine waking up…")
// 2. re-lays them on the storyboard timeline with the film's designed pauses ([pause:x] in src/stone/config.ts)
// 3. writes public/stone/audio/voiceover.mp3 and src/stone/voice-timing.json
import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';

const src = process.argv[2] ?? 'assets/voice/stone-voiceover-source.mp3';
const DEFAULT_GAP = 0.8; // between sentences with no explicit [pause:x]
const PAD_IN = 0.08;
const PAD_OUT = 0.14;
/** Silence kept at the end of each scene (title cards, closing gags). Spare time beyond this widens the gaps between sentences. */
const TAIL_TARGET = {wake: 3.3, wrong: 2.5, locals: 2.5, food: 6, wolf: 4.5, learn: 3.5, night: 8};
const MAX_STRETCH = 3.2;
const run = (cmd, args) => {
  const p = spawnSync(cmd, args, {encoding: 'utf8', maxBuffer: 1 << 28});
  if (p.status !== 0) throw new Error(`${cmd} failed: ${p.stderr}`);
  return p.stdout + p.stderr;
};

const r = await build({entryPoints: ['src/stone/config.ts'], bundle: true, write: false, format: 'esm', platform: 'node', loader: {'.json': 'json'}});
const {STONE_SCENES} = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString('base64')}`);

// sentences per scene, with the pause that follows each (seconds)
const scenes = STONE_SCENES.map((s) => {
  const sentences = [];
  const re = /([^.!?]*[.!?]+\*?)\s*(\[pause:([\d.]+)\])?/g;
  let m;
  while ((m = re.exec(s.narration))) if (m[1].trim()) sentences.push({text: m[1].replace(/\*/g, '').trim(), gap: m[3] ? parseFloat(m[3]) : DEFAULT_GAP});
  return {id: s.id, durationSec: s.durationSec, leadSec: s.leadSec, sentences};
});
const total = scenes.reduce((n, s) => n + s.sentences.length, 0);

// 1. speech segments
const dur = parseFloat(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]));
const log = run('ffmpeg', ['-hide_banner', '-i', src, '-af', 'silencedetect=n=-38dB:d=0.45', '-f', 'null', '-']);
const sil = [];
for (const line of log.split('\n')) {
  const a = /silence_start: ([\d.]+)/.exec(line);
  const b = /silence_end: ([\d.]+)/.exec(line);
  if (a) sil.push({s: parseFloat(a[1]), e: dur});
  if (b && sil.length) sil[sil.length - 1].e = parseFloat(b[1]);
}
let segs = [];
let cursor = 0;
for (const x of sil) {
  if (x.s - cursor > 0.2) segs.push([cursor, x.s]);
  cursor = x.e;
}
if (dur - cursor > 0.2) segs.push([cursor, dur]);
if (segs.length > total) segs = segs.slice(segs.length - total); // drop a spoken preamble
if (segs.length !== total) throw new Error(`Found ${segs.length} sentence segments, the script has ${total}. Check the recording follows NARRATION.md.`);

// 2. lay out on the storyboard timeline
mkdirSync('out/stone-voice', {recursive: true});
mkdirSync('public/stone/audio', {recursive: true});
const inputs = [];
const filters = [];
const timing = {};
let k = 0;
let sceneStart = 0;
const problems = [];
for (const sc of scenes) {
  const clips = sc.sentences.map((_, i) => {
    const [a, b] = segs[k + i];
    const A = Math.max(0, a - PAD_IN);
    const B = Math.min(dur, b + PAD_OUT);
    return {a, b, A, B, len: B - A};
  });
  const sumLen = clips.reduce((n, c) => n + c.len, 0);
  const baseGaps = sc.sentences.slice(0, -1).map((x) => x.gap);
  const baseTotal = baseGaps.reduce((n, g) => n + g, 0) || 1;
  const slack = sc.durationSec - sc.leadSec - (TAIL_TARGET[sc.id] ?? 2.5) - sumLen;
  const stretch = Math.min(MAX_STRETCH, Math.max(1, slack / baseTotal));
  let t = sc.leadSec;
  const sentenceSec = [];
  clips.forEach((c, i) => {
    const startAbs = sceneStart + t;
    inputs.push('-ss', c.A.toFixed(3), '-t', c.len.toFixed(3), '-i', src);
    const ms = Math.round(startAbs * 1000);
    filters.push(`[${k}:a]afade=t=in:d=0.04,afade=t=out:st=${(c.len - 0.1).toFixed(3)}:d=0.1,adelay=${ms}|${ms}[a${k}]`);
    sentenceSec.push([+(t + PAD_IN).toFixed(2), +(t + PAD_IN + (c.b - c.a)).toFixed(2)]);
    t += c.len + (baseGaps[i] ?? 0) * stretch;
    k++;
  });
  const lastEnd = sentenceSec[sentenceSec.length - 1][1];
  const tail = +(sc.durationSec - lastEnd).toFixed(2);
  if (tail < 0.4) problems.push(`${sc.id}: narration overruns the scene by ${(0.4 - tail).toFixed(1)}s — lengthen it in src/stone/config.ts`);
  timing[sc.id] = {leadSec: sc.leadSec, tailSec: Math.max(0.4, tail), sentenceSec};
  sceneStart += sc.durationSec;
}
if (problems.length) throw new Error(problems.join('\n'));
const mix = `${filters.join(';')};${filters.map((_, i) => `[a${i}]`).join('')}amix=inputs=${filters.length}:normalize=0:duration=longest,apad=whole_dur=${sceneStart},atrim=0:${sceneStart},loudnorm=I=-16:TP=-1.5,aresample=44100[out]`;
run('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', mix, '-map', '[out]', '-ac', '1', '-b:a', '160k', 'public/stone/audio/voiceover.mp3']);
writeFileSync('src/stone/voice-timing.json', JSON.stringify(timing, null, 1));
for (const [id, v] of Object.entries(timing)) console.log(`${id.padEnd(7)} lead ${v.leadSec}s  tail ${v.tailSec}s  ${v.sentenceSec.length} sentences`);
console.log(`voice-over: ${sceneStart}s, ${total} sentences laid on the storyboard timeline`);
