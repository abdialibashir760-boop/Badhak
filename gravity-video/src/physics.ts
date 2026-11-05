/**
 * Physics of the scene. Everything on screen is derived from `sceneAt(t)`.
 *
 * Height of the sheet = gravitational potential  Φ(r) = −GM / √(r² + s²)
 * (Newtonian limit of GR: g₀₀ ≈ −(1 + 2Φ/c²)). The softening length s
 * stands in for the finite size of the body. Depth is hugely exaggerated.
 *
 *  • Curvature changes propagate outward at a finite speed (WAVE_SPEED) —
 *    the "retarded" amplitude below makes a ring of bending spread out.
 *  • The Moon follows a true Kepler ellipse (Kepler's equation solved by
 *    Newton iteration), so it is fast at periapsis and slow at apoapsis.
 *  • Earth and Moon orbit their common barycentre: Earth wobbles by
 *    m/(M+m) ≈ 1/82 of the separation.
 */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Smooth 0→1 ramp (cosine ease-in-out) between a and b. */
export const smooth = (t: number, a: number, b: number) => {
  const u = clamp01((t - a) / (b - a));
  return 0.5 - 0.5 * Math.cos(Math.PI * u);
};

export const EARTH_R = 1.5;
export const MOON_R = 0.41; // 0.273 × Earth radius (true ratio)
export const MOON_MASS_RATIO = 1 / 81.3; // m_Moon / m_Earth (true ratio)
const Q = MOON_MASS_RATIO / (1 + MOON_MASS_RATIO); // Earth's share of the barycentre offset

const EARTH_DEPTH = 5.5; // sheet depth under Earth, in grid units
export const EARTH_S = 2.3;
export const EARTH_GM = EARTH_DEPTH * EARTH_S;
export const MOON_S = 0.45;
export const MOON_GM = EARTH_GM * MOON_MASS_RATIO;
export const DEPTH_MAX = 5.2; // used to colour the grid by depth

/** Display speed of the curvature wavefront (grid units / s). */
export const WAVE_SPEED = 11;
/** When Earth's curvature switches on (just as it comes to rest). */
export const MASS_START = 3.0;

export const EARTH_ENTRY = { from: 1.9, to: 3.9, startZ: -17 };

export const ORBIT = {
  a: 12,
  e: 0.55,
  period: 7, // time-lapsed
  t0: 4.7, // moon becomes active
  M0: Math.PI + 0.4, // mean anomaly at t0 (just past apoapsis)
  omega: Math.PI, // apoapsis on the +x side → enters from the right
};

export type Vec2 = { x: number; z: number };

export type SceneState = {
  t: number;
  earth: Vec2;
  moon: Vec2;
  moonAmp: number; // 0 → moon not present, 1 → fully present
  earthY: number;
  moonY: number;
  earthMass: number; // 0..1 (with overshoot) – how "switched on" Earth's curvature is
};

/** Damped second-order step response (ζ = 0.55): settles with a little ringing. */
export function massStep(u: number): number {
  if (u <= 0) return 0;
  const zeta = 0.55;
  const w = 4.2;
  const a = zeta * w;
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-a * u) * (Math.cos(wd * u) + (a / wd) * Math.sin(wd * u));
}

/** Solve Kepler's equation E − e·sin E = M. */
export function keplerE(M: number, e: number): number {
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 24; i++) {
    const d = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-10) break;
  }
  return E;
}

/** Position on the orbit for eccentric anomaly E (world x/z, relative to focus). */
export function orbitPointFromE(E: number): Vec2 {
  const { a, e, omega } = ORBIT;
  const b = a * Math.sqrt(1 - e * e);
  const xo = a * (Math.cos(E) - e);
  const yo = b * Math.sin(E);
  const X = xo * Math.cos(omega) - yo * Math.sin(omega);
  const Y = xo * Math.sin(omega) + yo * Math.cos(omega);
  return { x: X, z: -Y }; // screen "up" is −z, so +Y is counter-clockwise from above
}

/** Moon–Earth separation vector at time t. */
export function moonRel(t: number): Vec2 {
  const n = (2 * Math.PI) / ORBIT.period;
  const M = ORBIT.M0 + n * (t - ORBIT.t0);
  return orbitPointFromE(keplerE(M, ORBIT.e));
}

/** Moon position in the barycentric frame (barycentre = origin once Earth has settled). */
export function moonBary(t: number): Vec2 {
  const r = moonRel(t);
  return { x: (1 - Q) * r.x, z: (1 - Q) * r.z };
}

export function orbitPointBary(E: number): Vec2 {
  const p = orbitPointFromE(E);
  return { x: (1 - Q) * p.x, z: (1 - Q) * p.z };
}

type HeightState = Pick<SceneState, 't' | 'earth' | 'moon' | 'moonAmp'>;

/** Height of the sheet at (x, z). Negative = pulled down. */
export function surfaceHeight(x: number, z: number, s: HeightState): number {
  const dE = Math.hypot(x - s.earth.x, z - s.earth.z);
  const mE = massStep(s.t - MASS_START - dE / WAVE_SPEED);
  let h = (-EARTH_GM * mE) / Math.sqrt(dE * dE + EARTH_S * EARTH_S);
  if (s.moonAmp > 0) {
    const dM = Math.hypot(x - s.moon.x, z - s.moon.z);
    h -= (MOON_GM * s.moonAmp) / Math.sqrt(dM * dM + MOON_S * MOON_S);
  }
  return h;
}

export function sceneAt(t: number): SceneState {
  const { from, to, startZ } = EARTH_ENTRY;
  const p = clamp01((t - from) / (to - from));
  const ease = 1 - Math.pow(1 - p, 3); // decelerating arrival
  const base: Vec2 = { x: 0, z: startZ * (1 - ease) };

  const moonAmp = smooth(t, ORBIT.t0, ORBIT.t0 + 0.4);
  const rel = moonRel(t);
  const earth: Vec2 = { x: base.x - Q * rel.x * moonAmp, z: base.z - Q * rel.z * moonAmp };
  const moon: Vec2 = { x: base.x + (1 - Q) * rel.x, z: base.z + (1 - Q) * rel.z };

  const partial = { t, earth, moon, moonAmp };
  const earthMass = massStep(t - MASS_START);
  return {
    ...partial,
    earthMass,
    earthY: surfaceHeight(earth.x, earth.z, partial) + EARTH_R * 0.92,
    moonY: surfaceHeight(moon.x, moon.z, partial) + MOON_R * 0.9,
  };
}
