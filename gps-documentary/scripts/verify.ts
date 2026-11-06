// Quality-control checks on the film's geometry and numbers.  node scripts/verify.mjs  (bundles this file)
import { SATS, satPos, PHONE_POS, PHONE_UP, EAST, NORTH, elevationDeg, CONSTELLATION, satAt } from "../src/engine/world";
import { len, sub, dot, norm } from "../src/engine/math3d";
import { R_EARTH, R_ORBIT, C_KM_S, INCLINATION, DEG, vecToLatLon } from "../src/engine/geo";
import { solve3, BIAS_KM } from "../src/scenes/trilat";
import { analyse, buildCity } from "../src/scenes/cityModel";
import { SHOTS, SLOTS, TOTAL_S } from "../src/timeline";
import { BEATS, wordCount } from "../src/narration";

const lines: string[] = [];
let failures = 0;
const check = (name: string, ok: boolean, detail = "") => { lines.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`); if (!ok) failures++; };
const fmt = (v: number, d = 1) => v.toFixed(d);

// 1 · orbits
const ref = SATS.map((s) => satPos(s, 6));
check("orbit radius = 26,560 km (altitude ≈ 20,189 km)", ref.every((S) => Math.abs(len(S) - R_ORBIT) < 1e-6), `alt ${fmt(len(ref[0]) - R_EARTH, 0)} km`);
check("orbit inclination 55° (max |latitude| over a full orbit)", SATS.every((s) => { let mx = 0; for (let i = 0; i < 720; i++) mx = Math.max(mx, Math.abs(vecToLatLon(satAt(s, (i / 720) * 2 * Math.PI)).lat)); return Math.abs(mx - 55) < 0.2; }));
// Kepler: T = 2π·sqrt(a³/μ), μ = 398,600.4418 km³/s²  → should be half a sidereal day (11 h 58 min)
const T = 2 * Math.PI * Math.sqrt(R_ORBIT ** 3 / 398600.4418);
check("orbital period = 11 h 58 min (Kepler, a = 26,560 km) → two orbits per sidereal day", Math.abs(T / 3600 - 11.967) < 0.02 && Math.abs(86164.1 / T - 2) < 0.01, `${Math.floor(T / 3600)} h ${Math.round((T % 3600) / 60)} min, ${fmt(86164.1 / T, 3)} laps/day`);

// 2 · what the phone sees
for (const s of SATS) {
  let minEl = 90;
  for (let t = 0; t <= 12; t += 0.5) minEl = Math.min(minEl, elevationDeg(satPos(s, 6 + (t - 5) * 0.6)));
  check(`${s.name} stays above the horizon during the shots`, minEl > 25, `min elevation ${fmt(minEl, 0)}°`);
}
const ranges = ref.map((S) => len(sub(S, PHONE_POS)));
check("slant ranges ≈ 21,000 km (narration example)", ranges.every((r) => r > 20000 && r < 22500), ranges.map((r) => fmt(r, 0)).join(", ") + " km");
const ms = ranges.map((r) => (r / C_KM_S) * 1000);
check("travel times ≈ 0.07 s", ms.every((m) => m > 66 && m < 75), ms.map((m) => fmt(m, 1)).join(", ") + " ms");
check("travel time bounds: 67 ms overhead … 86 ms at the horizon", Math.abs((20189 / C_KM_S) * 1000 - 67.3) < 0.2 && Math.abs((Math.sqrt(R_ORBIT ** 2 - R_EARTH ** 2) / C_KM_S) * 1000 - 86.0) < 0.3);
check("light laps the Earth ≈ 7.5×/s", Math.abs(C_KM_S / 40075 - 7.48) < 0.01, fmt(C_KM_S / 40075, 2));
check("1 ns ≈ 30 cm", Math.abs(C_KM_S * 1e-9 * 1e5 - 29.98) < 0.01);
check("1 ms ≈ 300 km", Math.abs(BIAS_KM - 299.79) < 0.01);

// 3 · trilateration
const sol = solve3(ref.slice(0, 3), ranges.slice(0, 3))!;
check("three spheres recover the phone exactly (lower solution)", len(sub(sol[0], PHONE_POS)) < 1e-6, `error ${len(sub(sol[0], PHONE_POS)).toExponential(1)} km`);
check("the other solution is far from Earth", len(sol[1]) - R_EARTH > 5000, `${fmt(len(sol[1]) - R_EARTH, 0)} km above the surface`);
const b = 0.35 * BIAS_KM;
const q = solve3(ref.slice(0, 3), ranges.slice(0, 3).map((r) => r + b))!;
check("a common range bias displaces the 3-sphere solution", len(sub(q[0], PHONE_POS)) > 100, `${fmt(b, 0)} km bias → ${fmt(len(sub(q[0], PHONE_POS)), 0)} km off`);
const gap = Math.abs(len(sub(ref[3], q[0])) - (ranges[3] + b));
check("…and the fourth sphere then disagrees", gap > 5, `${fmt(gap, 0)} km mismatch`);
const fixed = solve3(ref.slice(0, 3), ranges.slice(0, 3).map((r) => r + b - b))!;
check("removing the bias makes four spheres meet at one point", len(sub(fixed[0], PHONE_POS)) < 1e-6 && Math.abs(len(sub(ref[3], fixed[0])) - ranges[3]) < 1e-6);

// 4 · constellation
check("constellation: 24 satellites in 6 planes (4 each)", CONSTELLATION.length === 24 && new Set(CONSTELLATION.map((s) => s.plane)).size === 6);
check("all constellation satellites at orbit radius", CONSTELLATION.every((s) => Math.abs(len(satAt(s, 0.7)) - R_ORBIT) < 1e-6));
let visible = 0; for (const s of CONSTELLATION) if (dot(norm(sub(satAt(s, 0.9), PHONE_POS)), PHONE_UP) > Math.sin(5 * DEG)) visible++;
check("a phone sees a sensible number of the 24 satellites", visible >= 4 && visible <= 14, `${visible} above 5°`);

// 5 · city
const city = buildCity("c");
const a = analyse(city, 36);
check("city: at least one satellite clear, at least one blocked", a.some((s) => s.visible) && a.some((s) => !s.visible), a.map((s) => `${s.name}:${s.visible ? "clear" : s.refl ? `bounce +${fmt(s.refl.extra, 0)} m` : "blocked"}`).join("  "));
check("city: a blocked satellite has a valid single-bounce path", a.some((s) => !s.visible && s.refl && s.refl.extra > 0 && s.refl.extra < 40));

// 6 · timeline
check("narration length 500–540 words", (() => { const w = BEATS.reduce((x, y) => x + wordCount(y.text), 0); return w >= 500 && w <= 540; })(), `${BEATS.reduce((x, y) => x + wordCount(y.text), 0)} words`);
check("film length 4:00", Math.abs(SLOTS[SLOTS.length - 1].start + SLOTS[SLOTS.length - 1].dur - TOTAL_S) < 1e-6);
check("45–60 unique shots", SHOTS.length >= 45 && SHOTS.length <= 60, `${SHOTS.length} shots`);
check("shots tile the timeline without gaps", SHOTS.every((s, i) => i === 0 || Math.abs(s.start - SHOTS[i - 1].end) < 1e-6) && Math.abs(SHOTS[SHOTS.length - 1].end - TOTAL_S) < 1e-6);
check("shortest shot ≥ 1.5 s", Math.min(...SHOTS.map((s) => s.dur)) >= 1.5, `min ${fmt(Math.min(...SHOTS.map((s) => s.dur)))} s`);

console.log(lines.join("\n"));
console.log(failures ? `\n${failures} check(s) FAILED` : "\nall checks passed");
process.exit(failures ? 1 : 0);
