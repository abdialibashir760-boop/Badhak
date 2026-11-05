import { C_KM_S, destination, INCLINATION, latLonToVec, PHONE, R_EARTH, R_ORBIT, DEG } from "./geo";
import { add, cross, dot, len, mul, norm, rotateAbout, sub, type V3 } from "./math3d";

/** Earth-fixed position of the phone, km. */
export const PHONE_POS: V3 = latLonToVec(PHONE.lat, PHONE.lon, R_EARTH);
export const PHONE_UP: V3 = norm(PHONE_POS);

/**
 * Orbits are shown time-lapsed. The real period is 11 h 58 min (ω ≈ 0.000146 rad/s);
 * here a satellite sweeps ω = 0.03 rad/s (≈ 205× faster).
 */
export const OMEGA = 0.03;
/** Reference instant at which each satellite is at its "design" position above the phone's sky. */
export const T_REF = 6;

/** Time-lapsed wavefront speed (real: 299,792 km/s — a 20,000 km trip takes 67 ms). */
export const WAVE_SPEED = 6800;
/** Seconds between successive broadcast wavefronts. */
export const WAVE_GAP = 0.8;

export type Sat = {
  id: number;
  name: string;
  color: string;
  /** bearing (°) and arc distance (°) from the phone to the sub-satellite point at T_REF */
  az: number;
  gamma: number;
  p0: V3; // unit position at T_REF
  n: V3; // unit orbit normal (angular-momentum direction)
  launch: number; // s: first wavefront leaves the antenna
  arrive: number; // s: first wavefront reaches the phone
};

/** Orbit-plane normal for a prograde orbit of inclination i passing through unit vector p. */
function orbitNormal(p: V3, sign: 1 | -1): V3 {
  const z: V3 = [0, 0, 1];
  const zp = sub(z, mul(p, dot(z, p)));
  const zpn = norm(zp);
  const w = norm(cross(p, zpn));
  const a = Math.cos(INCLINATION) / len(zp);
  if (a > 1) throw new Error("Satellite latitude exceeds orbital inclination");
  return add(mul(zpn, a), mul(w, sign * Math.sqrt(1 - a * a)));
}

export function satPosition(s: Sat, t: number): V3 {
  return mul(rotateAbout(s.p0, s.n, OMEGA * (t - T_REF)), R_ORBIT);
}

export const slantRange = (s: Sat, t: number): number => len(sub(satPosition(s, t), PHONE_POS));

export function elevationDeg(s: Sat, t: number): number {
  const d = sub(satPosition(s, t), PHONE_POS);
  return Math.asin(dot(d, PHONE_UP) / len(d)) / DEG;
}

const DEFS = [
  { name: "GPS 1", color: "#4fd8ff", az: 158, gamma: 33 },
  { name: "GPS 2", color: "#c39bff", az: 222, gamma: 22 },
  { name: "GPS 3", color: "#ffc85c", az: 288, gamma: 36 },
];

function build(def: (typeof DEFS)[number], id: number): Sat {
  const sub0 = destination(PHONE.lat, PHONE.lon, def.az, def.gamma);
  const p0 = latLonToVec(sub0.lat, sub0.lon);
  // Of the two possible prograde planes through p0, keep the one that stays highest in the phone's sky.
  const make = (sign: 1 | -1): Sat => ({
    id,
    name: def.name,
    color: def.color,
    az: def.az,
    gamma: def.gamma,
    p0,
    n: orbitNormal(p0, sign),
    launch: 2.0 + 0.35 * id,
    arrive: 0,
  });
  const score = (s: Sat) => Math.min(...[2, 4, 6, 8, 10].map((t) => elevationDeg(s, t)));
  const a = make(1);
  const b = make(-1);
  const best = score(a) >= score(b) ? a : b;
  // First wavefront reaches the phone: t = launch + range(t) / v (range changes slowly, so iterate).
  let t = best.launch;
  for (let k = 0; k < 6; k++) t = best.launch + slantRange(best, t) / WAVE_SPEED;
  best.arrive = t;
  return best;
}

export const SATS: Sat[] = DEFS.map(build);

/** One-way signal travel time in milliseconds for a given slant range. */
export const travelMs = (km: number) => (km / C_KM_S) * 1000;
