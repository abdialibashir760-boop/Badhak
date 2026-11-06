#!/usr/bin/env node
// Generates docs/narration.md and docs/storyboard.md from docs/beats.json + src/shots.ts (so they never drift from the video).
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const beats = JSON.parse(fs.readFileSync(`${root}docs/beats.json`, 'utf8'));
const src = fs.readFileSync(`${root}src/shots.ts`, 'utf8');
const re = /\['(hook|newton|einstein|orbits|time|finale)', ([\d.]+), (?:'((?:[^'\\]|\\.)*)'|"([^"]*)"), (?:'((?:[^'\\]|\\.)*)'|"([^"]*)"), (\w+)\]/g;
let cur = 0;
const shots = [...src.matchAll(re)].map((m, i) => { const s = { id: `s${String(i + 1).padStart(2, '0')}`, section: m[1], start: cur, dur: +m[2], title: m[3] ?? m[4], desc: (m[5] ?? m[6]).replace(/\\'/g, "'"), comp: m[7] }; cur += s.dur; return s; });
const SECTIONS = { hook: ['The Hook', 0, 25, 0.8, 0.5], newton: ["Newton's Explanation", 25, 65, 1.4, 0.6], einstein: ['Einstein Changes the Picture', 65, 115, 1.4, 0.6], orbits: ['Why Planets Orbit', 115, 160, 1.2, 0.6], time: ['Gravity and Time', 160, 205, 1.2, 0.6], finale: ['The Big Picture', 205, 240, 0.8, 3.5] };
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const words = (s) => s.split(/\s+/).filter(Boolean).length;
// estimated beat windows (words-proportional) — replaced by real timings once narration exists
const win = {};
for (const [id, [, from, to, lead, tail]] of Object.entries(SECTIONS)) {
  const bs = beats.filter((b) => b.section === id), gap = 0.45;
  const usable = to - tail - (from + lead) - gap * (bs.length - 1), tw = bs.reduce((n, b) => n + words(b.text), 0);
  let c = from + lead;
  for (const b of bs) { const d = (words(b.text) / tw) * usable; win[b.id] = [c, c + d]; c += d + gap; }
}
const total = beats.reduce((n, b) => n + words(b.text), 0);

// ── narration.md ──
let n = `# Narration script — *What Gravity Actually Is – And Why Einstein Changed Everything*\n\n**${total} words** · voice: warm, deliberate documentary baritone · one take per beat (file names \`b01…b15\`)\n\n`;
for (const [id, [title, from, to]] of Object.entries(SECTIONS)) {
  n += `## ${mmss(from)}–${mmss(to)} — ${title}\n\n`;
  for (const b of beats.filter((x) => x.section === id)) n += `**${b.id}** *(≈${mmss(win[b.id][0])}, ${words(b.text)} words)*  \n${b.text}\n\n`;
}
n += `---\n### Fact notes\n- Newton, *Principia*, 1687; "Hypotheses non fingo" is from the General Scholium (added 1713) and refers to the *cause* of gravity.\n- General relativity: Einstein, November 1915. Wheeler's summary is a paraphrase of his well-known formulation.\n- Mercury's perihelion advance not explained by Newtonian perturbations: ≈43 arc-seconds per century.\n- Optical-clock test: NIST aluminium-ion clocks, 33 cm height difference, 2010 (Chou et al., *Science*).\n- GPS: ≈20,200 km altitude; relativistic gain ≈ +45.7 µs/day (gravity) and −7.2 µs/day (speed) → ≈ +38.5 µs/day; c × 38.5 µs ≈ 11.5 km.\n`;
fs.writeFileSync(`${root}docs/narration.md`, n);

// ── storyboard.md ──
let s = `# Storyboard — ${shots.length} shots · 4:00 · 1920×1080 · 30 fps\n\nGenerated from \`src/shots.ts\`. Each row: time · shot · what is on screen · narration playing (estimated until real voice-over is synced).\n\n`;
for (const [id, [title, from, to]] of Object.entries(SECTIONS)) {
  s += `## ${mmss(from)}–${mmss(to)} · ${title}\n\n| # | Time | Shot | On screen | Narration (beat) | Component |\n|---|---|---|---|---|---|\n`;
  for (const sh of shots.filter((x) => x.section === id)) {
    const mid = sh.start + sh.dur / 2;
    const b = beats.find((x) => mid >= win[x.id][0] - 0.3 && mid <= win[x.id][1] + 0.3);
    s += `| ${sh.id} | ${mmss(sh.start)}–${mmss(sh.start + sh.dur)} | **${sh.title}** | ${sh.desc} | ${b ? b.id : '—'} | \`${sh.comp}\` |\n`;
  }
  s += '\n';
}
s += `## Audio plan\n- **Music**: D-minor pad score that grows with the story (sparse → warm → grand → driven → tense/ticking → climax at 3:41 → resolve in D major). Bell arpeggios and a heartbeat pulse (orbits, finale).\n- **Ambience**: shaped-noise deep-space bed with slow whistles.\n- **SFX**: chapter stingers (riser + boom) at 0:25/1:05/1:55/2:40; soft whooshes on every cut; ball release + bounces; grid-sag rumble; Wheeler chimes; clock ticks; GPS pings; end-title boom.\n- **Mix**: stems in \`public/audio/\`; narration ducks the bed (sidechain) and the master targets −16 LUFS.\n`;
fs.writeFileSync(`${root}docs/storyboard.md`, s);
console.log(`docs written: ${shots.length} shots, ${total} words`);
