// Tiny 3D toolkit: vectors, a perspective camera and clipped polyline projection.
// Everything in the scene is real 3D (kilometres, Earth-centred); SVG only draws the result.

export type V3 = [number, number, number];
export type Pt = [number, number];

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: V3): V3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const mixV = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
/** a + b*s */
export const addScaled = (a: V3, b: V3, s: number): V3 => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];

export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const clamp01 = (x: number) => clamp(x, 0, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
/** Damped spring-like overshoot used for the "lock" snap (0 → 1 with a small bounce). */
export const easeOutBack = (t: number) => {
  const x = clamp01(t);
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** Rodrigues rotation of v about a unit axis. */
export function rotateAbout(v: V3, axis: V3, ang: number): V3 {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const kv = cross(axis, v);
  const kd = dot(axis, v) * (1 - c);
  return [v[0] * c + kv[0] * s + axis[0] * kd, v[1] * c + kv[1] * s + axis[1] * kd, v[2] * c + kv[2] * s + axis[2] * kd];
}

/** Spherical interpolation between two unit vectors. */
export function slerp(a: V3, b: V3, t: number): V3 {
  const d = clamp(dot(a, b), -1, 1);
  const om = Math.acos(d);
  if (om < 1e-5) return a;
  const s = Math.sin(om);
  return norm(add(mul(a, Math.sin((1 - t) * om) / s), mul(b, Math.sin(t * om) / s)));
}

/** Any two unit vectors perpendicular to unit vector n (and to each other). */
export function basisFrom(n: V3): [V3, V3] {
  const helper: V3 = Math.abs(n[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const e1 = norm(cross(helper, n));
  const e2 = cross(n, e1);
  return [e1, e2];
}

// ---------------------------------------------------------------- camera

export type Cam = {
  pos: V3;
  r: V3; // screen-right
  u: V3; // screen-up
  f: V3; // forward
  F: number; // focal length in px
  cx: number;
  cy: number;
  near: number;
};

export function lookAt(pos: V3, target: V3, upHint: V3, fovDeg: number, w: number, h: number): Cam {
  const f = norm(sub(target, pos));
  let r = cross(f, upHint);
  if (len(r) < 1e-6) r = cross(f, [0, 1, 0]);
  r = norm(r);
  const u = cross(r, f);
  return { pos, r, u, f, F: h / 2 / Math.tan((fovDeg * Math.PI) / 360), cx: w / 2, cy: h / 2, near: 120 };
}

export type CamPt = { x: number; y: number; z: number };

export function toCam(c: Cam, p: V3): CamPt {
  const dx = p[0] - c.pos[0];
  const dy = p[1] - c.pos[1];
  const dz = p[2] - c.pos[2];
  return {
    x: dx * c.r[0] + dy * c.r[1] + dz * c.r[2],
    y: dx * c.u[0] + dy * c.u[1] + dz * c.u[2],
    z: dx * c.f[0] + dy * c.f[1] + dz * c.f[2],
  };
}

export const camToScreen = (c: Cam, p: CamPt): Pt => [c.cx + (c.F * p.x) / p.z, c.cy - (c.F * p.y) / p.z];

export type Proj = { x: number; y: number; z: number; ok: boolean };
export function project(c: Cam, p: V3): Proj {
  const q = toCam(c, p);
  const s = camToScreen(c, q.z > 1e-6 ? q : { x: q.x, y: q.y, z: 1e-6 });
  return { x: s[0], y: s[1], z: q.z, ok: q.z > c.near };
}

function clipNear(c: Cam, a: CamPt, b: CamPt): Pt {
  const t = (c.near - a.z) / (b.z - a.z);
  return camToScreen(c, { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: c.near });
}

/**
 * Projects a 3D polyline, clipping it against the near plane and splitting it wherever
 * `visible` says a vertex is hidden (e.g. behind the Earth). Returns screen-space runs.
 */
export function projectRuns(cam: Cam, pts: V3[], visible?: (p: V3) => boolean): Pt[][] {
  const runs: Pt[][] = [];
  let run: Pt[] = [];
  let prev: { c: CamPt; vis: boolean; front: boolean } | null = null;
  for (const p of pts) {
    const c = toCam(cam, p);
    const vis = visible ? visible(p) : true;
    const front = c.z > cam.near;
    if (vis && front) {
      if (run.length === 0 && prev && prev.vis && !prev.front) run.push(clipNear(cam, c, prev.c));
      run.push(camToScreen(cam, c));
    } else if (run.length > 0) {
      if (vis && !front && prev) run.push(clipNear(cam, prev.c, c));
      runs.push(run);
      run = [];
    }
    prev = { c, vis, front };
  }
  if (run.length) runs.push(run);
  return runs;
}

export function pathD(runs: Pt[][]): string {
  let d = "";
  for (const run of runs) {
    if (run.length < 2) continue;
    d += "M" + run.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L");
  }
  return d;
}

/** True when the straight line from the camera to X passes through the sphere (radius R, at the origin) first. */
export function hiddenByEarth(camPos: V3, X: V3, R: number): boolean {
  const dx = X[0] - camPos[0];
  const dy = X[1] - camPos[1];
  const dz = X[2] - camPos[2];
  const a = dx * dx + dy * dy + dz * dz;
  const b = camPos[0] * dx + camPos[1] * dy + camPos[2] * dz;
  const c = camPos[0] * camPos[0] + camPos[1] * camPos[1] + camPos[2] * camPos[2] - R * R;
  const disc = b * b - a * c;
  if (disc <= 0) return false;
  const t = (-b - Math.sqrt(disc)) / a;
  return t > 0 && t < 1;
}
