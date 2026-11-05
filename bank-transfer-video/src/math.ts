import { interpolate } from "remotion";

export type Pt = { x: number; y: number };

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0→1 progress between frames a and b, clamped. */
export const prog = (
  f: number,
  a: number,
  b: number,
  easing?: (t: number) => number,
) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Gaussian bump centred on frame c. */
export const bell = (f: number, c: number, w: number) =>
  Math.exp(-((f - c) ** 2) / (2 * w * w));

export const money = (n: number) =>
  "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** Catmull-Rom spline through pts, expressed as cubic Béziers. */
const segment = (pts: Pt[], i: number) => {
  const p0 = pts[Math.max(i - 1, 0)];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[Math.min(i + 2, pts.length - 1)];
  const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
  const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
  return { p1, c1, c2, p2 };
};

export const splinePath = (pts: Pt[]) => {
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const s = segment(pts, i);
    d += ` C${s.c1.x} ${s.c1.y} ${s.c2.x} ${s.c2.y} ${s.p2.x} ${s.p2.y}`;
  }
  return d;
};

/** Point and tangent angle (deg) at u∈[0,1] along the spline. */
export const splineAt = (pts: Pt[], u: number) => {
  const segs = pts.length - 1;
  const s = clamp(u) * segs;
  const i = Math.min(Math.floor(s), segs - 1);
  const t = s - i;
  const { p1, c1, c2, p2 } = segment(pts, i);
  const m = 1 - t;
  const x = m ** 3 * p1.x + 3 * m * m * t * c1.x + 3 * m * t * t * c2.x + t ** 3 * p2.x;
  const y = m ** 3 * p1.y + 3 * m * m * t * c1.y + 3 * m * t * t * c2.y + t ** 3 * p2.y;
  const dx =
    3 * m * m * (c1.x - p1.x) + 6 * m * t * (c2.x - c1.x) + 3 * t * t * (p2.x - c2.x);
  const dy =
    3 * m * m * (c1.y - p1.y) + 6 * m * t * (c2.y - c1.y) + 3 * t * t * (p2.y - c2.y);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
};
