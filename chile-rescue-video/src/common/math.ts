export type Pt = [number, number];

export const FPS = 30;
export const W = 1080;
export const H = 1920;
/** Screen y of the camera centre: sits above middle so art clears the Shorts caption zone. */
export const CY = Math.round(H * 0.42);

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
/** Progress 0..1 of time t between a and b, eased. */
export const prog = (t: number, a: number, b: number, ease = easeInOut) => ease((t - a) / (b - a));

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

