// Render stills for review: node tools/stills.mjs outDir [shotIdFilter|frame,frame,...]
import { bundle } from '@remotion/bundler'; import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs'; import path from 'node:path';
const out = process.argv[2], arg = process.argv[3] || ''; fs.mkdirSync(out, { recursive: true });
const tl = JSON.parse(fs.readFileSync('audio/timeline.json', 'utf8'));
const browserExecutable = ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'].find((p) => fs.existsSync(p));
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), webpackOverride: (c) => c });
const comp = await selectComposition({ serveUrl, id: 'Documentary', browserExecutable });
let jobs;
if (/^[\d,]+$/.test(arg)) jobs = arg.split(',').map((f) => ({ name: `f${f}`, frame: +f }));
else jobs = tl.shots.filter((s) => !arg || arg.split(',').includes(s.id)).map((s) => ({ name: `${s.id}_${s.scene}`, frame: Math.round((s.start + s.dur * 0.55) * 30) }));
for (const j of jobs) { await renderStill({ composition: comp, serveUrl, output: path.join(out, `${j.name}.jpg`), frame: j.frame, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable }); console.log('✓', j.name, j.frame); }
