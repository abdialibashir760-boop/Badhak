#!/usr/bin/env node
/*
 * Headless export: draws every frame with node-canvas and pipes raw pixels into ffmpeg.
 *   node render.js                         -> output.mp4  (1080x1920, 60 fps, 14 s, H.264)
 *   node render.js --frames 0-180 --out test.mp4     quick test of the first 3 s
 *   node render.js --png stills --times 0.5,6,11.7   write PNG stills instead of video
 *   options: --fps 60  --crf 16  --preset medium  --out output.mp4
 */
const { createCanvas, registerFont } = require('canvas');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const { CFG, drawFrame } = require('./src/scene.js');

const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > -1 ? process.argv[i + 1] : def; };
const FPS = parseInt(arg('fps', CFG.FPS), 10), CRF = arg('crf', '16'), PRESET = arg('preset', 'medium'), OUT = arg('out', 'output.mp4');
const total = Math.round(CFG.DURATION * FPS);
let [from, to] = (arg('frames', `0-${total - 1}`)).split('-').map(Number);
to = Math.min(to, total - 1);

// Optional: drop a .ttf in ./fonts named like the font you want (e.g. JetBrainsMono-Bold.ttf).
const fontDir = path.join(__dirname, 'fonts');
if (fs.existsSync(fontDir)) fs.readdirSync(fontDir).filter((f) => /\.(ttf|otf)$/i.test(f)).forEach((f) => {
  const family = f.replace(/-.*$/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
  registerFont(path.join(fontDir, f), { family, weight: /bold/i.test(f) ? '700' : '400' });
});

const canvas = createCanvas(CFG.W, CFG.H), ctx = canvas.getContext('2d');

async function stills() {
  const dir = arg('png', 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const s of arg('times', '0.5,6,11.7').split(',').map(Number)) {
    drawFrame(ctx, s); const f = path.join(dir, `t${s.toFixed(2)}.png`);
    fs.writeFileSync(f, canvas.toBuffer('image/png')); console.log('wrote', f);
  }
}

async function video() {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', `${CFG.W}x${CFG.H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', PRESET, '-crf', CRF, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-r', String(FPS), OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => { ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exited with ' + c)))); ff.on('error', rej); });
  const t0 = Date.now();
  for (let n = from; n <= to; n++) {
    drawFrame(ctx, n / FPS);
    // cairo's raw buffer is BGRA on little-endian machines, which is what ffmpeg is told above
    if (!ff.stdin.write(canvas.toBuffer('raw'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (n % 30 === 0 || n === to) {
      const k = n - from + 1, el = (Date.now() - t0) / 1000;
      process.stdout.write(`\rframe ${k}/${to - from + 1}  ${(k / el).toFixed(1)} fps  eta ${(((to - from + 1 - k) / (k / el))).toFixed(0)}s   `);
    }
  }
  ff.stdin.end(); await done;
  console.log(`\nsaved ${OUT} (${((to - from + 1) / FPS).toFixed(1)} s @ ${FPS} fps, ${CFG.W}x${CFG.H})`);
}

(arg('png') ? stills() : video()).catch((e) => { console.error(e); process.exit(1); });
