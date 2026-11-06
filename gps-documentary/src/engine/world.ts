import { DEG, destination, INCLINATION, latLonToVec, PHONE, R_EARTH, R_ORBIT } from "./geo";
import { add, cross, dot, len, mul, norm, rotateAbout, sub, type V3 } from "./math3d";

/** Earth-fixed position of the phone (Istanbul), km. */
export const PHONE_POS: V3 = latLonToVec(PHONE.lat, PHONE.lon, R_EARTH);
export const PHONE_UP: V3 = norm(PHONE_POS);
export const EAST: V3 = norm(cross([0, 0, 1], PHONE_UP));
export const NORTH: V3 = cross(PHONE_UP, EAST);
/** Direction from Earth's centre toward the Sun (fixed; the scene is a time-lapse). */
export const SUN: V3 = latLonToVec(16, -48);

/** Orbit time-lapse: real ω ≈ 0.000146 rad/s; here 0.03 rad/s (≈ 205×). */
export const OMEGA = 0.03;
export const T_REF = 6;

export type Sat = { id: number; name: string; color: string; p0: V3; n: V3 };

/** Prograde orbit plane (inclination 55°) through unit vector p. */
function orbitNormal(p: V3, sign: 1 | -1): V3 {
  const zp = sub([0, 0, 1], mul(p, p[2]));
  const zpn = norm(zp);
  const w = norm(cross(p, zpn));
  const a = Math.cos(INCLINATION) / len(zp);
  if (a > 1) throw new Error("Satellite latitude exceeds orbital inclination");
  return add(mul(zpn, a), mul(w, sign * Math.sqrt(1 - a * a)));
}

/** Position after sweeping `theta` radians along the orbit from the reference position. */
export const satAt = (s: Pick<Sat, "p0" | "n">, theta: number): V3 => mul(rotateAbout(s.p0, s.n, theta), R_ORBIT);
export function satPos(s: Sat, orbitT: number): V3 {
  return satAt(s, OMEGA * (orbitT - T_REF));
}
export const elevationDeg = (S: V3) => {
  const d = sub(S, PHONE_POS);
  return Math.asin(dot(d, PHONE_UP) / len(d)) / DEG;
};

const DEFS = [
  { name: "GPS 1", color: "#4fd8ff", az: 158, gamma: 33 },
  { name: "GPS 2", color: "#c39bff", az: 222, gamma: 22 },
  { name: "GPS 3", color: "#ffc85c", az: 288, gamma: 36 },
  { name: "GPS 4", color: "#ff7ab8", az: 100, gamma: 38 },
];

function build(d: (typeof DEFS)[number], id: number): Sat {
  const g = destination(PHONE.lat, PHONE.lon, d.az, d.gamma);
  const p0 = latLonToVec(g.lat, g.lon);
  const mk = (sign: 1 | -1): Sat => ({ id, name: d.name, color: d.color, p0, n: orbitNormal(p0, sign) });
  const worst = (s: Sat) => Math.min(...[0, 4, 8, 12, 16].map((t) => elevationDeg(satPos(s, t))));
  const a = mk(1);
  const b = mk(-1);
  return worst(a) >= worst(b) ? a : b;
}
/** The four satellites over the phone's sky (GPS 1–3 reproduce the first film). */
export const SATS: Sat[] = DEFS.map(build);

// ── 24-satellite constellation: six planes 60° apart, 55° inclination, four per plane (schematic phasing)
export type ConSat = Sat & { plane: number };
export const PLANE_COLORS = ["#4fd8ff", "#c39bff", "#ffc85c", "#ff7ab8", "#7dffc0", "#8fa8ff"];
export const CONSTELLATION: ConSat[] = (() => {
  const out: ConSat[] = [];
  for (let k = 0; k < 6; k++) {
    const Ω = k * 60 * DEG;
    const inc = INCLINATION;
    const p0n: V3 = [Math.cos(Ω), Math.sin(Ω), 0]; // ascending node
    const n: V3 = [Math.sin(Ω) * Math.sin(inc), -Math.cos(Ω) * Math.sin(inc), Math.cos(inc)];
    const q = cross(n, p0n);
    for (let j = 0; j < 4; j++) {
      const M = (j * 90 + k * 15) * DEG;
      const p = add(mul(p0n, Math.cos(M)), mul(q, Math.sin(M)));
      out.push({ id: k * 4 + j, name: `P${k + 1}-${j + 1}`, color: PLANE_COLORS[k], p0: p, n, plane: k });
    }
  }
  return out;
})();
export const PLANE_NORMALS: V3[] = Array.from({ length: 6 }, (_, k) => CONSTELLATION[k * 4].n);
export { R_EARTH, R_ORBIT };
