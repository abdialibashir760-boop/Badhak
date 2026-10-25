// Bundles the TypeScript tests with esbuild (shipped with Vite) and runs them with node:test.
import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'zihni-tests-'));
const entries = readdirSync('tests').filter((f) => f.endsWith('.test.ts')).map((f) => join('tests', f));
await build({entryPoints: entries, outdir: dir, bundle: true, platform: 'node', format: 'esm', outExtension: {'.js': '.mjs'}, logLevel: 'error'});
const files = readdirSync(dir).filter((f) => f.endsWith('.mjs')).map((f) => join(dir, f));
process.exit(spawnSync(process.execPath, ['--test', ...files], {stdio: 'inherit'}).status ?? 1);
