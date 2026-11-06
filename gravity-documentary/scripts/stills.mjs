// Render one still per shot (default: 60% through the shot) for visual QC.  usage: node scripts/stills.mjs [frac] [ids...]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition, openBrowser } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const frac = parseFloat(process.argv[2] ?? '0.6');
const only = process.argv.slice(3);
const entry = path.resolve('src/index.ts');
const exe = process.env.BROWSER_EXE || '/opt/pw-browsers/chromium';
// shot start/dur table without bundling TS: parse the registry via a tiny regex over durations
const src = fs.readFileSync('src/shots.ts', 'utf8');
const defs = [...src.matchAll(/\['(hook|newton|einstein|orbits|time|finale)', ([\d.]+), (?:'(?:[^'\\]|\\.)*'|"[^"]*")/g)];
let cur = 0;
const shots = defs.map((m, i) => { const s = { id: `s${String(i + 1).padStart(2, '0')}`, start: cur, dur: parseFloat(m[2]) }; cur += s.dur; return s; });
const serveUrl = await bundle({ entryPoint: entry, onProgress: () => {} });
const browser = await openBrowser('chrome', { browserExecutable: exe, chromiumOptions: { gl: 'swangle' } });
const comp = await selectComposition({ serveUrl, id: 'Documentary', puppeteerInstance: browser });
fs.mkdirSync('out/stills', { recursive: true });
for (const s of shots) {
  if (only.length && !only.includes(s.id)) continue;
  const frame = Math.min(comp.durationInFrames - 1, Math.round((s.start + s.dur * frac) * 30));
  await renderStill({ composition: comp, serveUrl, output: `out/stills/${s.id}.png`, frame, puppeteerInstance: browser, scale: 0.5 });
  process.stdout.write(`${s.id} `);
}
await browser.close({ silent: true });
console.log('\ndone');
