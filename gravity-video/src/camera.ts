import { smooth } from './physics';

export const W = 1920;
export const H = 1080;
export const F = 1000; // focal length in px
export const CX = W / 2;
export const CY = 500; // principal point sits a little high → room for captions
export const NEAR = 0.5;

export type Cam = { pitch: number; yaw: number; dist: number; ty: number };

const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Overlapping eased moves (each one starts before the previous ends) so the
 * camera never comes to a dead stop between phases.
 *   0–2 s   straight down on the flat grid, slow push-in
 *   2–5 s   tilts down while Earth bends the grid
 *   5–8 s   keeps tilting, begins to swing round
 *   8–10 s  pulls back to reveal the whole system
 */
export function cameraAt(t: number): Cam {
  const pitch = 90 - 36 * smooth(t, 2.0, 5.0) - 12 * smooth(t, 5.0, 8.0) - 14 * smooth(t, 7.6, 10);
  const yaw = 0.12 * smooth(t, 2.0, 5.0) + 0.3 * smooth(t, 5.0, 8.0) + 0.5 * smooth(t, 7.8, 10);
  const dist =
    19 - 1.6 * smooth(t, 0, 2.2) + 0.8 * smooth(t, 2.0, 5.0) + 3.5 * smooth(t, 5.0, 8.0) + 18.3 * smooth(t, 7.8, 10);
  const ty = -2.4 * smooth(t, 2.0, 6.0);
  return { pitch: rad(pitch), yaw, dist, ty };
}

export type View = {
  px: number; py: number; pz: number;
  rx: number; ry: number; rz: number;
  ux: number; uy: number; uz: number;
  fx: number; fy: number; fz: number;
};

export function makeView(c: Cam): View {
  const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
  const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw);
  const px = c.dist * cp * sy;
  const py = c.ty + c.dist * sp;
  const pz = c.dist * cp * cy;
  // forward = normalize(target − pos)
  const tx = 0, ty = c.ty, tz = 0;
  let fx = tx - px, fy = ty - py, fz = tz - pz;
  const fl = Math.hypot(fx, fy, fz);
  fx /= fl; fy /= fl; fz /= fl;
  // right is horizontal, perpendicular to the yaw direction
  const rx = cy, ry = 0, rz = -sy;
  // up = right × forward
  const ux = ry * fz - rz * fy;
  const uy = rz * fx - rx * fz;
  const uz = rx * fy - ry * fx;
  return { px, py, pz, rx, ry, rz, ux, uy, uz, fx, fy, fz };
}

export function toView(v: View, x: number, y: number, z: number): [number, number, number] {
  const dx = x - v.px, dy = y - v.py, dz = z - v.pz;
  return [
    dx * v.rx + dy * v.ry + dz * v.rz,
    dx * v.ux + dy * v.uy + dz * v.uz,
    dx * v.fx + dy * v.fy + dz * v.fz,
  ];
}

export function screenOf(p: [number, number, number]) {
  return { x: CX + (F * p[0]) / p[2], y: CY - (F * p[1]) / p[2], depth: p[2] };
}
