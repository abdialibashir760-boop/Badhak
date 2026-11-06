// Regenerates docs/narration.md, docs/storyboard.md and docs/seo.md from the single source of truth in src/.
//   node scripts/gen-docs.mjs
import { build } from "esbuild";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = await build({ entryPoints: [join(root, "scripts/_docs_entry.ts")], bundle: true, write: false, format: "esm", platform: "node", loader: { ".json": "json" }, logLevel: "error" });
const code = out.outputFiles[0].text;
const m = await import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
const { BEATS, SECTIONS, wordCount, SHOTS, SLOTS, TOTAL_S } = m;
mkdirSync(join(root, "docs"), { recursive: true });
const ts = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const words = BEATS.reduce((a, b) => a + wordCount(b.text), 0);

// ── narration.md
let md = `# Narration script — "How GPS Knows Exactly Where You Are"\n\n**${words} words** · target read ≈ 150 wpm · one line per beat (\`Bnn\`). Each beat is its own audio clip so picture and voice stay in sync (see README → "Adding your voice-over").\n\n`;
for (const s of SECTIONS) {
  const first = SLOTS.find((x) => BEATS.find((b) => b.id === x.id && b.section === s.n));
  md += `## ${s.n} · ${s.title}  _(from ${ts(first.start)})_\n\n`;
  for (const b of BEATS.filter((b) => b.section === s.n)) md += `- **${b.id}** ${b.text}\n`;
  md += "\n";
}
md += `---\n\n### Plain text (for a teleprompter)\n\n${BEATS.map((b) => b.text).join(" ")}\n`;
writeFileSync(join(root, "docs/narration.md"), md);

// ── storyboard.md
let sb = `# Storyboard — ${SHOTS.length} shots · ${ts(TOTAL_S)} · 1920×1080 · 30 fps\n\nTimes are generated from \`src/timeline.ts\`; they re-flow automatically when the recorded voice-over is measured (\`npm run retime\`).\n\n`;
for (const s of SECTIONS) {
  const slots = SLOTS.filter((x) => x.section === s.n);
  const t0 = slots[0].start, t1 = slots[slots.length - 1].start + slots[slots.length - 1].dur;
  sb += `## Chapter ${s.n} — ${s.title}  (${ts(t0)}–${ts(t1)})\n\n| # | Time | Dur | Shot | What you see | How it explains the narration | Sound |\n|---|---|---|---|---|---|---|\n`;
  for (const sh of SHOTS.filter((x) => slots.some((q) => q.id === x.beat))) {
    const sfx = (sh.sfx ?? []).map((q) => q[0]).join(", ") || "—";
    sb += `| ${sh.id} | ${ts(sh.start)}.${String(Math.floor((sh.start % 1) * 10))} | ${sh.dur.toFixed(1)} s | **${sh.name}** | ${sh.visual} | ${sh.explains} | ${sfx} |\n`;
  }
  sb += "\n";
}
sb += `## Reusable components\n\n| Component | File | Used for |\n|---|---|---|\n| Earth (dot-matrix land, day/night terminator, atmosphere, LOD) | \`src/components/Earth.tsx\` | every globe shot |\n| Satellite model + orbit rings + mini constellation icons | \`src/components/SatModel.tsx\` | satellites, orbits, constellation |\n| Radio signals: broadcast cones, range circles, beams, packets | \`src/components/Signals.tsx\` | broadcast, travel time, trilateration |\n| Smartphone (3-D slab with map screen) and lock marker | \`src/components/Phone3D.tsx\`, \`Marker.tsx\` | every phone shot |\n| Digital map (procedural, level of detail) | \`src/components/MapView.tsx\` | hook, fix, multipath |\n| Distance spheres, intersection circle, two-point solver | \`src/scenes/trilat.tsx\` | trilateration |\n| Urban environment + ray tracing (line of sight, sky plot, reflections) | \`src/scenes/cityModel.ts\`, \`city.tsx\` | failure modes |\n| HUD kit (callouts, altitude ruler, stat cards) | \`src/components/Hud.tsx\` | all |\n`;
writeFileSync(join(root, "docs/storyboard.md"), sb);

// ── seo.md
const chapters = SECTIONS.map((s) => { const f = SLOTS.find((x) => BEATS.find((b) => b.id === x.id && b.section === s.n)); return `${ts(s.n === 1 ? 0 : f.start)} ${s.title}`; });
const seo = `# SEO package

## Title (pick one)
1. **How GPS Knows Exactly Where You Are** *(the film's title; ≤ 60 characters, keyword first)*
2. How Does GPS Actually Work? Satellites, Atomic Clocks & Trilateration Explained
3. Your Phone Knows Where You Are. Here's How (GPS Explained in 4 Minutes)

## Description
Your phone can find your position in seconds, using satellites about 20,000 km away that have no idea you exist. In four minutes, this film explains how GPS really works: what the satellites broadcast, why atomic clocks matter, how a 0.07-second delay becomes a distance, how trilateration (and a fourth satellite) pins down your position, and why GPS sometimes fails in cities.

${chapters.join("\n")}

What you'll learn
• What GPS satellites actually transmit (time and orbit data, not "your location")
• How radio signals and the speed of light turn time into distance
• Why one nanosecond of timing error equals about 30 cm
• How trilateration works, and why four satellites are needed (clock error)
• Why buildings, reflections, satellite geometry and the atmosphere cause errors

Sources and technical notes are in the pinned comment / project docs (GPS.gov, IS-GPS-200, Natural Earth).

#GPS #HowItWorks #Technology #Satellites #Science #Trilateration #Explainer

## Tags
how gps works, gps explained, how does gps work, gps satellites, trilateration, atomic clock, gnss, speed of light, how phone location works, gps accuracy, why gps fails, multipath, urban canyon, relativity gps, technology explained, science explainer

## Thumbnail
\`out/thumbnail.png\` (1920×1080): lock-on marker + three beams, headline "HOW GPS KNOWS WHERE YOU ARE". Render with \`npm run thumbnail\`.

## Pinned comment
"Nothing here is tracked from space: GPS satellites only broadcast. Your phone does the maths. Corrections, sources and the simplifications used for the animation: see the description."

## Honest-visuals note (add to description)
Satellites and the phone are enlarged and time is slowed so you can see them; the maths and orbit geometry are to scale.
`;
writeFileSync(join(root, "docs/seo.md"), seo);
console.log(`docs written: ${words} words, ${SHOTS.length} shots, ${ts(TOTAL_S)}`);
