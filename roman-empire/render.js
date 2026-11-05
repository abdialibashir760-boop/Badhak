#!/usr/bin/env node
/*
 * Headless export: draws every frame with node-canvas and pipes raw pixels into ffmpeg.
 *   node render.js                          -> output.mp4  (1920x1080, 30 fps, 10 s, H.264)
 *   node render.js --frames 0-89 --out test.mp4
 *   node render.js --png stills --times 0.5,3,8   write PNG stills instead of video
 *   options: --fps 30  --crf 16  --preset medium  --out output.mp4
 */
const { createCanvas } = require('canvas');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const Scene = require('./src/scene.js');
const { CFG } = Scene;

const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > -1 ? process.argv[i + 1] : def; };
const FPS = parseInt(arg('fps', CFG.FPS), 10), CRF = arg('crf', '16'), PRESET = arg('preset', 'medium'), OUT = arg('out', 'output.mp4');
const total = Math.round(CFG.DURATION * FPS);
let [from, to] = arg('frames', `0-${total - 1}`).split('-').map(Number);
to = Math.min(to, total - 1);

const canvas = createCanvas(CFG.W, CFG.H), ctx = canvas.getContext('2d');
process.stdout.write('building map… ');
const t0 = Date.now();
const scene = Scene.create({ makeCanvas: (w, h) => createCanvas(w, h), W: CFG.W, H: CFG.H, quality: 1 });
console.log(((Date.now() - t0) / 1000).toFixed(1) + ' s');

async function stills() {
  const dir = arg('png', 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const s of arg('times', '0.5,3,8').split(',').map(Number)) {
    scene.draw(ctx, s); const f = path.join(dir, `t${s.toFixed(2)}.png`);
    fs.writeFileSync(f, canvas.toBuffer('image/png')); console.log('wrote', f);
  }
}

async function video() {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', `${CFG.W}x${CFG.H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', PRESET, '-crf', CRF, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-r', String(FPS), OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => { ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exited with ' + c)))); ff.on('error', rej); });
  const start = Date.now();
  for (let n = from; n <= to; n++) {
    scene.draw(ctx, n / FPS);
    if (!ff.stdin.write(canvas.toBuffer('raw'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (n % 10 === 0 || n === to) {
      const k = n - from + 1, el = (Date.now() - start) / 1000;
      process.stdout.write(`\rframe ${k}/${to - from + 1}  ${(k / el).toFixed(1)} fps  eta ${((to - from + 1 - k) / (k / el)).toFixed(0)}s   `);
    }
  }
  ff.stdin.end(); await done;
  console.log(`\nsaved ${OUT} (${((to - from + 1) / FPS).toFixed(1)} s @ ${FPS} fps, ${CFG.W}x${CFG.H})`);
}

(arg('png') ? stills() : video()).catch((e) => { console.error(e); process.exit(1); });
