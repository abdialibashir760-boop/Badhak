// Offline placeholder voice-over: synthesises every scene's narration with espeak-ng (+ MBROLA voice),
// re-times the scenes to the spoken length, and assembles public/audio/narration.wav.
// Requires: espeak-ng, mbrola + mbrola-us1 (apt), ffmpeg. Replace the result with a real recording any time.
// Usage: node scripts/make-narration.mjs [voice=mb-us1] [wpm=135]
import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';

const voice = process.argv[2] ?? 'mb-us1';
const wpm = process.argv[3] ?? '135';
const r = await build({entryPoints: ['src/config/defaults.ts'], bundle: true, write: false, format: 'esm', platform: 'node'});
const {DEFAULT_SCENES} = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString('base64')}`);
mkdirSync('out/narration', {recursive: true});
mkdirSync('public/audio', {recursive: true});

const run = (cmd, args) => {
  const p = spawnSync(cmd, args, {encoding: 'utf8'});
  if (p.status !== 0) throw new Error(`${cmd} failed: ${p.stderr}`);
  return p.stdout;
};
const durOf = (f) => parseFloat(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));

const scenes = DEFAULT_SCENES.map((s, i) => {
  const wav = `out/narration/s${i}.wav`;
  run('espeak-ng', ['-v', voice, '-s', wpm, '-g', '3', '-w', wav, s.narration.replace(/\*/g, '')]);
  const speech = durOf(wav);
  const durationSec = Math.ceil((s.leadSec + speech + s.tailSec) * 10) / 10;
  return {...s, speech, durationSec};
});

// Place each clip at scene start + lead-in, mix into one track.
let t = 0;
const inputs = [];
const filters = [];
scenes.forEach((s, i) => {
  inputs.push('-i', `out/narration/s${i}.wav`);
  filters.push(`[${i}:a]adelay=${Math.round((t + s.leadSec) * 1000)}|${Math.round((t + s.leadSec) * 1000)},volume=1.6[a${i}]`);
  t += s.durationSec;
});
const mix = `${filters.join(';')};${scenes.map((_, i) => `[a${i}]`).join('')}amix=inputs=${scenes.length}:normalize=0,apad=whole_dur=${t},aresample=44100[out]`;
run('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', mix, '-map', '[out]', '-ac', '1', 'public/audio/narration.wav']);
writeFileSync('out/narration/durations.json', JSON.stringify(scenes.map((s) => ({id: s.id, durationSec: s.durationSec, speech: +s.speech.toFixed(2)})), null, 2));
console.log(scenes.map((s) => `${s.id}: speech ${s.speech.toFixed(1)}s -> scene ${s.durationSec}s`).join('\n'), `\ntotal ${t.toFixed(1)}s`);
