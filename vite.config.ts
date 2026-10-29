import {defineConfig, type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import {spawn, type ChildProcess} from 'node:child_process';
import {createReadStream, existsSync, mkdirSync, statSync, writeFileSync} from 'node:fs';
import {basename, join, resolve} from 'node:path';
import type {IncomingMessage, ServerResponse} from 'node:http';

/**
 * Dev-only studio API:
 *  POST /api/upload?name=x.wav   -> saves narration/music into public/uploads
 *  POST /api/render              -> writes out/props.json and runs `remotion render` with it
 *  GET  /api/render/status       -> progress of the running / last render
 *  GET  /api/download?file=x.mp4 -> streams a finished MP4 from out/
 */
const studioApi = (): Plugin => {
  const root = process.cwd();
  const outDir = resolve(root, 'out');
  const uploadDir = resolve(root, 'public/uploads');
  type Job = {state: 'idle' | 'running' | 'done' | 'error'; progress: number; message: string; file: string | null; log: string[]};
  const job: Job = {state: 'idle', progress: 0, message: '', file: null, log: []};
  let child: ChildProcess | null = null;

  const readBody = (req: IncomingMessage, limit = 512 * 1024 * 1024) =>
    new Promise<Buffer>((ok, fail) => {
      const chunks: Buffer[] = [];
      let size = 0;
      req.on('data', (c: Buffer) => {
        size += c.length;
        if (size > limit) {
          fail(new Error('File too large'));
          req.destroy();
          return;
        }
        chunks.push(c);
      });
      req.on('end', () => ok(Buffer.concat(chunks)));
      req.on('error', fail);
    });
  const json = (res: ServerResponse, code: number, body: unknown) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  };
  /** Streams a file with HTTP Range support (browsers need it to seek in audio/video). */
  const sendFile = (req: IncomingMessage, res: ServerResponse, p: string, type: string, extra: Record<string, string> = {}) => {
    const size = statSync(p).size;
    const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
    let start = 0;
    let end = size - 1;
    if (m && (m[1] || m[2])) {
      if (m[1]) start = Number(m[1]);
      if (m[2]) end = Math.min(size - 1, Number(m[2]));
      if (!m[1]) {
        start = Math.max(0, size - Number(m[2]));
        end = size - 1;
      }
      if (start > end) {
        res.statusCode = 416;
        res.setHeader('Content-Range', `bytes */${size}`);
        return void res.end();
      }
      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
    }
    res.setHeader('Content-Type', type);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', end - start + 1);
    Object.entries(extra).forEach(([k, v]) => res.setHeader(k, v));
    createReadStream(p, {start, end}).pipe(res);
  };
  const safe = (n: string) => basename(n).replace(/[^\w.-]+/g, '_').slice(0, 80) || 'file';

  return {
    name: 'zihni-studio-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        try {
          if (req.method === 'POST' && url.pathname === '/api/upload') {
            const name = safe(url.searchParams.get('name') ?? 'upload.bin');
            if (!/\.(wav|mp3|m4a|aac|ogg|flac)$/i.test(name)) return json(res, 400, {error: 'Only audio files (wav, mp3, m4a, aac, ogg, flac) are accepted.'});
            mkdirSync(uploadDir, {recursive: true});
            const body = await readBody(req);
            if (body.length === 0) return json(res, 400, {error: 'Empty file.'});
            writeFileSync(join(uploadDir, name), body);
            return json(res, 200, {src: `uploads/${name}`, bytes: body.length});
          }
          if (req.method === 'POST' && url.pathname === '/api/render') {
            if (job.state === 'running') return json(res, 409, {error: 'A render is already running.'});
            const body = JSON.parse((await readBody(req, 5 * 1024 * 1024)).toString('utf8'));
            // Accepts {composition, props} or a bare props object (legacy: the first film).
            const composition: string = body?.props ? body.composition : 'ZihniOyunu';
            const props = body?.props ?? body;
            if (!['ZihniOyunu', 'StoneAge', 'StoneAgeTR', 'FiveMinuteRule', 'TimeFlies'].includes(composition)) return json(res, 400, {error: `Unknown composition "${composition}".`});
            if (!Array.isArray(props?.scenes) || props.scenes.length < 1) return json(res, 400, {error: 'Invalid project props (expected a list of scenes).'});
            if (typeof props.narrationSrc === 'string' && props.narrationSrc.startsWith('blob:')) return json(res, 400, {error: 'Narration is only loaded in the browser (blob URL). Re-import it so it can be uploaded.'});
            mkdirSync(outDir, {recursive: true});
            const propsFile = join(outDir, `${composition}-props.json`);
            writeFileSync(propsFile, JSON.stringify(props, null, 2));
            const file = `${composition === 'StoneAgeTR' ? 'tas-devri' : composition === 'StoneAge' ? 'stone-age' : 'zihni-oyunu'}-${Date.now()}.mp4`;
            Object.assign(job, {state: 'running', progress: 0, message: 'Bundling…', file: null, log: []});
            child = spawn('npx', ['remotion', 'render', 'src/index.ts', composition, join('out', file), `--props=${propsFile}`], {cwd: root, env: process.env, shell: false});
            const onData = (d: Buffer) => {
              const text = d.toString();
              job.log = [...job.log, ...text.split(/[\r\n]+/).filter(Boolean)].slice(-30);
              const m = [...text.matchAll(/Rendered (\d+)\/(\d+)/g)].pop();
              if (m) {
                job.progress = Number(m[1]) / Number(m[2]);
                job.message = `Rendering frame ${m[1]} / ${m[2]}`;
              } else if (/Encoding|Stitching/i.test(text)) job.message = 'Encoding video…';
            };
            child.stdout?.on('data', onData);
            child.stderr?.on('data', onData);
            child.on('error', (e) => Object.assign(job, {state: 'error', message: `Could not start Remotion: ${e.message}`}));
            child.on('close', (code) => {
              if (job.state === 'error') return;
              if (code === 0 && existsSync(join(outDir, file))) Object.assign(job, {state: 'done', progress: 1, message: 'Render complete.', file});
              else {
                const tail = job.log.join(' ');
                const hint = /getaddrinfo|ENOTFOUND|remotion\.media|Chrome/i.test(tail) && !process.env.REMOTION_BROWSER
                  ? ' Remotion could not download its headless browser. Start the studio with REMOTION_BROWSER=/path/to/chrome-or-chromium set.'
                  : '';
                Object.assign(job, {state: 'error', message: `Render failed (exit ${code}).${hint} ${job.log.slice(-3).join(' ')}`});
              }
              child = null;
            });
            return json(res, 200, {started: true, file});
          }
          if (req.method === 'POST' && url.pathname === '/api/render/cancel') {
            child?.kill('SIGTERM');
            Object.assign(job, {state: 'error', message: 'Render cancelled.'});
            return json(res, 200, {ok: true});
          }
          if (req.method === 'GET' && url.pathname.startsWith('/uploads/')) {
            // Vite snapshots /public at start-up, so files uploaded later are served here.
            const p = join(uploadDir, safe(decodeURIComponent(url.pathname.slice(9))));
            if (!existsSync(p)) return json(res, 404, {error: 'Not found'});
            return sendFile(req, res, p, /\.mp3$/i.test(p) ? 'audio/mpeg' : /\.wav$/i.test(p) ? 'audio/wav' : 'application/octet-stream');
          }
          if (req.method === 'GET' && url.pathname === '/api/render/status') return json(res, 200, job);
          if (req.method === 'GET' && url.pathname === '/api/download') {
            const file = safe(url.searchParams.get('file') ?? '');
            const p = join(outDir, file);
            if (!file.endsWith('.mp4') || !existsSync(p)) return json(res, 404, {error: 'Not found'});
            return sendFile(req, res, p, 'video/mp4', {'Content-Disposition': `attachment; filename="${file}"`});
          }
        } catch (e) {
          return json(res, 500, {error: e instanceof Error ? e.message : String(e)});
        }
        next();
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), studioApi()],
  server: {port: 5173, host: '127.0.0.1'},
  build: {outDir: 'dist'},
});
