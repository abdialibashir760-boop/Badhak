#!/usr/bin/env node
/*
 * Headless export:  Puppeteer draws every frame of index.html?render=1 (frame-exact: t = n / 60),
 * the PNG frames are streamed into FFmpeg, and the synthesised sound effects are muxed in.
 *
 *   npm run export                     → brain_tabs.mp4   (1080x1920, 60 fps, 57 s, H.264 + AAC)
 *   npm run export:test                → test.mp4             (first 4 s only)
 *   node render.js --silent            no audio track
 *   node render.js --crf 14 --preset slow --out final.mp4
 *   node render.js --frames 840-1320   render only a frame range (e.g. just scene 3)
 *
 * Requires FFmpeg on your PATH. Puppeteer downloads its own Chromium on `npm install`;
 * set PUPPETEER_EXECUTABLE_PATH to use an existing Chrome/Chromium instead.
 */
const puppeteer = require('puppeteer');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const { pathToFileURL } = require('url');
const { CFG, EVENTS } = require('./src/scene.js');
const Sfx = require('./src/sfx.js');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const flag = (n) => process.argv.includes('--' + n);
const FPS = CFG.FPS, TOTAL = Math.round(CFG.DURATION * FPS);
const OUT = arg('out', 'brain_tabs.mp4'), CRF = arg('crf', '16'), PRESET = arg('preset', 'medium');
let [from, to] = arg('frames', `0-${TOTAL - 1}`).split('-').map(Number);
to = Math.min(to, TOTAL - 1);

async function main() {
  // 1) audio: your voice-over + synthesised sound effects (ducked under the speech), mixed to one track
  let wav = null;
  if (!flag('silent')) {
    const sr = 44100, N = Math.ceil(CFG.DURATION * sr);
    const sfx = Sfx.renderSfx(EVENTS, CFG.DURATION, sr);
    const mix = new Float32Array(N);
    const voiceFile = path.join(__dirname, 'vo', 'voiceover.wav');
    if (fs.existsSync(voiceFile)) {
      const dec = spawnSync('ffmpeg', ['-v', 'error', '-i', voiceFile, '-f', 'f32le', '-ac', '1', '-ar', String(sr), '-'], { maxBuffer: 1 << 29 });
      const raw = dec.stdout, vo = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.length / 4));
      let peak = 1e-6; for (let i = 0; i < vo.length; i++) peak = Math.max(peak, Math.abs(vo[i]));
      const vg = 0.88 / peak;
      // envelope follower @100 Hz: fast attack (look-ahead), ~0.5 s release → duck the effects while he speaks
      const blk = sr / 100, nb = Math.ceil(N / blk), duck = new Float32Array(nb);
      for (let b = 0; b < nb; b++) { let m = 0; for (let i = b * blk; i < Math.min(N, (b + 1) * blk) && i < vo.length; i++) m = Math.max(m, Math.abs(vo[i]) * vg); duck[b] = Math.min(1, m / 0.12); }
      for (let b = 1; b < nb; b++) duck[b] = Math.max(duck[b], duck[b - 1] * 0.97);
      for (let b = nb - 2; b >= 0; b--) duck[b] = Math.max(duck[b], duck[b + 1] * 0.85);
      for (let i = 0; i < N; i++) mix[i] = (i < vo.length ? vo[i] * vg : 0) + (sfx[i] || 0) * 0.55 * (1 - 0.62 * duck[Math.min(nb - 1, Math.floor(i / blk))]);
    } else {
      for (let i = 0; i < N; i++) mix[i] = sfx[i] || 0;
      console.log('(no vo/voiceover.wav found: exporting sound effects only)');
    }
    for (let i = 0; i < N; i++) mix[i] = Math.tanh(mix[i] * 1.05) * 0.95;   // soft limiter
    wav = path.join(os.tmpdir(), `brain_tabs_${process.pid}.wav`);
    fs.writeFileSync(wav, Sfx.toWav(mix, sr));
  }

  // 2) browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb', `--window-size=${CFG.W},${CFG.H}`],
    defaultViewport: { width: CFG.W, height: CFG.H, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => { console.error('page error:', e); process.exit(1); });
  await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href + '?render=1');
  await page.waitForFunction('window.__ready === true');

  // 3) ffmpeg
  const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-'];
  if (wav) args.push('-ss', String(from / FPS), '-t', String((to - from + 1) / FPS), '-i', wav);
  args.push('-c:v', 'libx264', '-preset', PRESET, '-crf', CRF, '-pix_fmt', 'yuv420p', '-r', String(FPS));
  if (wav) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push('-movflags', '+faststart', OUT);
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => { ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exited with code ' + c)))); ff.on('error', rej); });

  // 4) frames
  const t0 = Date.now(), count = to - from + 1;
  for (let n = from; n <= to; n++) {
    const b64 = await page.evaluate((i) => { window.renderFrame(i); return document.getElementById('c').toDataURL('image/png').slice(22); }, n);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    const k = n - from + 1;
    if (k % 20 === 0 || k === count) {
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(`\rframe ${k}/${count}  ${(k / el).toFixed(1)} fps  eta ${Math.round((count - k) / (k / el))}s   `);
    }
  }
  ff.stdin.end(); await done; await browser.close();
  if (wav) fs.unlinkSync(wav);
  console.log(`\nsaved ${OUT}  (${(count / FPS).toFixed(1)} s, ${CFG.W}x${CFG.H} @ ${FPS} fps${wav ? ', with voice-over + sound' : ''})`);
}
main().catch((e) => { console.error(e); process.exit(1); });
