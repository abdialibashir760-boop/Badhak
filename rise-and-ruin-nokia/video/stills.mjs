import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
const shots = JSON.parse(fs.readFileSync('src/shots.json', 'utf8'));
const frac = parseFloat(process.argv[2] ?? '0.6');
const only = process.argv[3] ? process.argv[3].split(',') : null;
const out = 'out/stills';
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const comp = await selectComposition({serveUrl, id: 'Film'});
for (const s of shots) {
  if (only && !only.includes(s.id)) continue;
  const d = s.end - s.start;
  const t = s.start + Math.min(d * frac, Math.max(d - 0.3, 0.1));
  const frame = Math.min(Math.round(t * 30), comp.durationInFrames - 1);
  await renderStill({composition: comp, serveUrl, frame, output: `${out}/${s.id}.jpg`, imageFormat: 'jpeg', jpegQuality: 80});
  process.stdout.write(s.id + ' ');
}
console.log('\ndone');
