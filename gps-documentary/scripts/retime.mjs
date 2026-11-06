// Re-times the film to a recorded voice-over.
//
//   1. Record (or generate) one audio clip per beat, named B01.* … B29.* (wav/mp3/m4a), in one folder.
//   2. node scripts/retime.mjs path/to/clips
//
// It measures each clip, writes src/beats.override.json (so every shot re-flows to the real pace),
// mixes the clips into public/narration/narration.wav at the right moments, and switches CONFIG.narration on.
// Then: npm run docs && bash scripts/render_chunks.sh
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = resolve(process.argv[2] ?? "");
if (!process.argv[2]) { console.error("usage: node scripts/retime.mjs <folder with B01.* … B29.*>"); process.exit(1); }
const ffprobe = (f) => parseFloat(execFileSync("npx", ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { cwd: root }).toString().trim());
const clips = Object.fromEntries(readdirSync(dir).filter((f) => /^B\d\d\./i.test(f)).map((f) => [f.slice(0, 3).toUpperCase(), join(dir, f)]));
if (Object.keys(clips).length < 29) console.warn(`found ${Object.keys(clips).length}/29 clips; missing beats keep the estimated pace`);
const speech = {};
for (const [id, f] of Object.entries(clips)) speech[id] = Math.round(ffprobe(f) * 1000) / 1000;
writeFileSync(join(root, "src/beats.override.json"), JSON.stringify({ speech }, null, 2));

const entry = `export { SLOTS } from "../src/timeline";`;
writeFileSync(join(root, "scripts/_retime_entry.ts"), entry);
const out = await build({ entryPoints: [join(root, "scripts/_retime_entry.ts")], bundle: true, write: false, format: "esm", platform: "node", loader: { ".json": "json" }, logLevel: "error" });
const { SLOTS } = await import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));

mkdirSync(join(root, "public/narration"), { recursive: true });
const inputs = [], filters = [];
let n = 0;
for (const s of SLOTS) {
  if (!clips[s.id]) continue;
  inputs.push("-i", clips[s.id]);
  filters.push(`[${n}:a]adelay=${Math.round(s.speechStart * 1000)}|${Math.round(s.speechStart * 1000)},apad[a${n}]`);
  n++;
}
const mix = filters.map((_, i) => `[a${i}]`).join("") + `amix=inputs=${n}:normalize=0:duration=longest[o]`;
execFileSync("npx", ["remotion", "ffmpeg", "-y", "-v", "error", ...inputs, "-filter_complex", filters.join(";") + ";" + mix, "-map", "[o]", "-ar", "44100", "-t", "240", join(root, "public/narration/narration.wav")], { cwd: root, stdio: "inherit" });

const cfgPath = join(root, "src/config.ts");
writeFileSync(cfgPath, readFileSync(cfgPath, "utf8").replace(/narration: [^,]+ as string \| null,/, 'narration: "narration.wav" as string | null,'));
console.log(`retimed ${n} beats → src/beats.override.json, public/narration/narration.wav; CONFIG.narration enabled`);
