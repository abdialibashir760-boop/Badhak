// Offline placeholder voice-over for the Stone Age film (espeak-ng + MBROLA). Replace with a real recording any time:
// import it in the studio and use "Fit scene durations to audio", or set narrationSrc in src/stone/config.ts.
// Usage: node scripts/make-stone-narration.mjs [voice=mb-us2] [wpm=165]
import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';

const voice = process.argv[2] ?? 'mb-us2';
const wpm = process.argv[3] ?? '165';
const r = await build({entryPoints: ['src/stone/config.ts'], bundle: true, write: false, format: 'esm', platform: 'node'});
const {STONE_SCENES} = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString('base64')}`);
mkdirSync('out/stone-narration', {recursive: true});
mkdirSync('public/stone/audio', {recursive: true});
const run = (cmd, args) => {
  const p = spawnSync(cmd, args, {encoding: 'utf8'});
  if (p.status !== 0) throw new Error(`${cmd} failed: ${p.stderr}`);
  return p.stdout;
};
const dur = (f) => parseFloat(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));

const info = [];
STONE_SCENES.forEach((s, i) => {
  // split on [pause:x]; synth each text part; stitch with silences
  const parts = s.narration.split(/(\[pause:[\d.]+\])/).map((x) => x.trim()).filter(Boolean);
  const files = [];
  parts.forEach((p, j) => {
    const m = /^\[pause:([\d.]+)\]$/.exec(p);
    const f = `out/stone-narration/s${i}-${j}.wav`;
    if (m) run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=22050:cl=mono', '-t', m[1], f]);
    else run('espeak-ng', ['-v', voice, '-s', wpm, '-g', '4', '-w', f, p.replace(/\*/g, '')]);
    files.push(f);
  });
  const list = `out/stone-narration/s${i}.txt`;
  writeFileSync(list, files.map((f) => `file '${f.replace('out/stone-narration/', '')}'`).join('\n'));
  const clip = `out/stone-narration/s${i}.wav`;
  run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-ar', '44100', '-ac', '1', clip]);
  const speech = dur(clip);
  info.push({id: s.id, speech, lead: s.leadSec, durationSec: s.durationSec, tail: +(s.durationSec - s.leadSec - speech).toFixed(2)});
});

let t = 0;
const inputs = [];
const filters = [];
info.forEach((s, i) => {
  inputs.push('-i', `out/stone-narration/s${i}.wav`);
  const ms = Math.round((t + s.lead) * 1000);
  filters.push(`[${i}:a]adelay=${ms}|${ms},volume=1.7[a${i}]`);
  t += s.durationSec;
});
run('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', `${filters.join(';')};${info.map((_, i) => `[a${i}]`).join('')}amix=inputs=${info.length}:normalize=0,apad=whole_dur=${t},aresample=44100[out]`, '-map', '[out]', '-ac', '1', 'public/stone/audio/narration.wav']);
writeFileSync('out/stone-narration/timing.json', JSON.stringify(info, null, 2));
for (const s of info) console.log(`${s.id.padEnd(8)} speech ${s.speech.toFixed(1)}s  lead ${s.lead}s  tail ${s.tail}s  ${s.tail < 0.4 ? '<-- TOO LONG: lengthen the scene' : ''}`);
console.log('total', t.toFixed(1), 's');
