import { Easing } from "remotion";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeOut = Easing.out(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);

/** 0→1 progress between `start` and `start+dur` frames. */
export const prog = (frame: number, start: number, dur: number, ease: (t: number) => number = smooth) =>
  ease(clamp((frame - start) / Math.max(1, dur)));

/** Piecewise interpolation through [frame, value] keys (clamped outside the range). */
export function kf(frame: number, keys: ReadonlyArray<readonly [number, number]>, ease: (t: number) => number = smooth): number {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (frame <= keys[i][0]) {
      const [f0, v0] = keys[i - 1];
      const [f1, v1] = keys[i];
      return lerp(v0, v1, ease(clamp((frame - f0) / Math.max(1, f1 - f0))));
    }
  }
  return keys[keys.length - 1][1];
}

/** Deterministic pseudo-random in [0,1). */
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Smooth 1-D value noise in [-1,1]. */
export function noise(x: number, seed = 0): number {
  const i = Math.floor(x);
  const f = x - i;
  const a = hash(i + seed * 91.7) * 2 - 1;
  const b = hash(i + 1 + seed * 91.7) * 2 - 1;
  return lerp(a, b, smooth(f));
}

/** Pulse: 0 → 1 → 0 around frame `at` (attack/release in frames). */
export const pulse = (frame: number, at: number, attack: number, release: number) =>
  frame < at ? prog(frame, at - attack, attack) : 1 - prog(frame, at, release);

/** Soft envelope that is 1 between a and b, easing in/out. */
export const window = (frame: number, a: number, b: number, fi = 12, fo = 12) =>
  Math.min(prog(frame, a, fi), 1 - prog(frame, b - fo, fo));

export const rad = (d: number) => (d * Math.PI) / 180;
