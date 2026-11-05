import {Easing} from 'remotion';

export const W = 1920;
export const H = 1080;
export const FPS = 30;
export const DURATION = 300; // exactly 10 seconds at 30 FPS
export const FREEZE_T = 7; // seconds: everything freezes

export const INK = '#17120f';
export const PAPER = '#fffdf7';
export const CREAM = '#fff4de';
export const WARM = '#f0b987';

export type Vec = {x: number; y: number};

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const smooth = Easing.inOut(Easing.cubic);
export const easeOutBack = Easing.out(Easing.back(2.2));
export const add = (a: Vec, b: Vec): Vec => ({x: a.x + b.x, y: a.y + b.y});
export const mix = (a: Vec, b: Vec, t: number): Vec => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});

/** Deterministic pseudo random in [0,1) */
export const rand = (n: number): number => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Rotate vector (x,y) clockwise (screen coordinates) by deg */
export const rot = (x: number, y: number, deg: number): Vec => {
  const r = (deg * Math.PI) / 180;
  return {x: x * Math.cos(r) - y * Math.sin(r), y: x * Math.sin(r) + y * Math.cos(r)};
};

/** Hand-drawn looking closed cloud/pill (superellipse + wobble, Catmull-Rom -> cubic Bezier). */
export const blobPath = (
  rx: number,
  ry: number,
  seed: number,
  bump = 0.01,
  n = 28,
): string => {
  const pts: Vec[] = [];
  const e = 2 / 3.2;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const f = 1 + (k % 2 === 0 ? bump : -bump) + (rand(seed + k * 7.31) - 0.5) * 0.025;
    pts.push({
      x: Math.sign(c) * Math.pow(Math.abs(c), e) * rx * f,
      y: Math.sign(s) * Math.pow(Math.abs(s), e) * ry * f,
    });
  }
  const p = (i: number): Vec => pts[((i % n) + n) % n] as Vec;
  let d = `M${p(0).x.toFixed(1)} ${p(0).y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p(i - 1);
    const p1 = p(i);
    const p2 = p(i + 1);
    const p3 = p(i + 2);
    const c1 = {x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6};
    const c2 = {x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6};
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d + ' Z';
};
