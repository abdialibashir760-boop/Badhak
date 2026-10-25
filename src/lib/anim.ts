export type Ease = (t: number) => number;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const linear: Ease = (t) => t;
export const easeIn: Ease = (t) => t * t * t;
export const easeOut: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOut: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutQuint: Ease = (t) => 1 - Math.pow(1 - t, 5);
export const easeInOutSine: Ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const easeOutBack: Ease = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const easeOutElastic: Ease = (t) => {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -9 * t) * Math.sin(((t * 10 - 0.75) * (2 * Math.PI)) / 3) + 1;
};

/** Progress of `v` between a and b, clamped to 0..1 and eased. */
export const seg = (v: number, a: number, b: number, ease: Ease = easeInOut) =>
  b === a ? (v >= b ? 1 : 0) : ease(clamp((v - a) / (b - a)));

/** Piecewise keyframes: kf(v, [[0, 10], [0.5, 40], [1, 0]]) with eased segments. */
export const kf = (v: number, pts: Array<[number, number]>, ease: Ease = easeInOut) => {
  if (v <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (v <= pts[i][0]) {
      const [t0, v0] = pts[i - 1];
      const [t1, v1] = pts[i];
      return lerp(v0, v1, ease(clamp((v - t0) / (t1 - t0))));
    }
  }
  return pts[pts.length - 1][1];
};

/** Deterministic PRNG (mulberry32). */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Smooth, deterministic 1-D "organic" noise in roughly -1..1. */
export const wob = (t: number, seed = 0) =>
  (Math.sin(t * 1.0 + seed * 12.9898) * 0.5 +
    Math.sin(t * 2.3 + seed * 78.233) * 0.3 +
    Math.sin(t * 4.1 + seed * 37.719) * 0.2);

export const deg = (d: number) => (d * Math.PI) / 180;
