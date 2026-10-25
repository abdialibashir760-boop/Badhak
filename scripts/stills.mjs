// QA helper: bundle once and render many stills. Usage: node scripts/stills.mjs 100 400 900 [--props=out/props.json]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {existsSync, mkdirSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const args = process.argv.slice(2);
const frames = args.filter((a) => /^\d+$/.test(a)).map(Number);
const compId = (args.find((a) => a.startsWith('--comp=')) ?? '--comp=ZihniOyunu').slice(7);
const propsArg = args.find((a) => a.startsWith('--props='));
const inputProps = propsArg ? JSON.parse(readFileSync(propsArg.slice(8), 'utf8')) : undefined;
const browserExecutable = process.env.REMOTION_BROWSER || undefined;

mkdirSync('out/s', {recursive: true});
const serveUrl = await bundle({entryPoint: resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: compId, inputProps, browserExecutable});
console.log(`composition: ${comp.durationInFrames} frames @ ${comp.fps}fps`);
for (const frame of frames) {
  const output = `out/s/f${String(frame).padStart(4, '0')}.png`;
  await renderStill({composition: comp, serveUrl, output, frame, inputProps, browserExecutable});
  console.log('wrote', output, existsSync(output));
}
