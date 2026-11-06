/** Minimal perspective camera for projecting world points to the 1920×1080 frame. */
export const W = 1920;
export const H = 1080;
export const F = 1000;
export const CX = W / 2;
export const CY = 500;
export const NEAR = 0.5;

export type Cam = { pitch: number; yaw: number; dist: number; tx?: number; ty?: number; tz?: number };
export type V3 = [number, number, number];

export type View = {
  px: number; py: number; pz: number;
  rx: number; ry: number; rz: number;
  ux: number; uy: number; uz: number;
  fx: number; fy: number; fz: number;
};

/** pitch: radians above the horizon (π/2 = looking straight down); yaw: swing about the vertical axis. */
export function makeView(c: Cam): View {
  const tx = c.tx ?? 0, ty = c.ty ?? 0, tz = c.tz ?? 0;
  const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
  const cyw = Math.cos(c.yaw), syw = Math.sin(c.yaw);
  const px = tx + c.dist * cp * syw;
  const py = ty + c.dist * sp;
  const pz = tz + c.dist * cp * cyw;
  let fx = tx - px, fy = ty - py, fz = tz - pz;
  const fl = Math.hypot(fx, fy, fz);
  fx /= fl; fy /= fl; fz /= fl;
  const rx = cyw, ry = 0, rz = -syw;
  return {
    px, py, pz, rx, ry, rz, fx, fy, fz,
    ux: ry * fz - rz * fy,
    uy: rz * fx - rx * fz,
    uz: rx * fy - ry * fx,
  };
}

export function toView(v: View, x: number, y: number, z: number): V3 {
  const dx = x - v.px, dy = y - v.py, dz = z - v.pz;
  return [
    dx * v.rx + dy * v.ry + dz * v.rz,
    dx * v.ux + dy * v.uy + dz * v.uz,
    dx * v.fx + dy * v.fy + dz * v.fz,
  ];
}

export function screenOf(p: V3, f = F) {
  return { x: CX + (f * p[0]) / p[2], y: CY - (f * p[1]) / p[2], depth: p[2] };
}

export function project(v: View, x: number, y: number, z: number, f = F) {
  return screenOf(toView(v, x, y, z), f);
}
