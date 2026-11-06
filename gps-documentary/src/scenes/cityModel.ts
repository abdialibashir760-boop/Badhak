// A small procedural city (metres) with real ray tracing: line-of-sight, skyline mask and mirror-image reflections.
import { random } from "remotion";
import type { V3 } from "../engine/math3d";
import { add, dot, len, mul, norm, sub } from "../engine/math3d";
import { SATS, satPos, PHONE_POS, PHONE_UP, EAST, NORTH, CONSTELLATION, satAt } from "../engine/world";

export type Box = { x0: number; x1: number; y0: number; y1: number; h: number; tower: boolean };
const BLOCK = 72;
const STREET = 24;
const PITCH = BLOCK + STREET;
const N = 3; // blocks each way from the origin

export function buildCity(seed = "c"): Box[] {
  const out: Box[] = [];
  for (let i = -N; i <= N; i++)
    for (let j = -N; j <= N; j++) {
      const cx = (i + 0.5) * PITCH;
      const cy = (j + 0.5) * PITCH;
      const split = random(`${seed}sp${i}_${j}`) > 0.55;
      const parts = split ? 2 : 1;
      for (let k = 0; k < parts; k++) {
        const w = split ? BLOCK / 2 - 3 : BLOCK - 8;
        const ox = split ? (k === 0 ? -BLOCK / 4 : BLOCK / 4) : 0;
        const tower = random(`${seed}tw${i}_${j}_${k}`) > 0.8;
        const h = tower ? 130 + random(`${seed}th${i}_${j}_${k}`) * 90 : 28 + random(`${seed}h${i}_${j}_${k}`) * 70;
        out.push({ x0: cx + ox - w / 2, x1: cx + ox + w / 2, y0: cy - (BLOCK - 8) / 2, y1: cy + (BLOCK - 8) / 2, h, tower });
      }
    }
  return out;
}

/** Entry distance of ray o + t·d into the box, or null. */
export function rayBox(o: V3, d: V3, b: Box): number | null {
  let tmin = 1e-3;
  let tmax = 1e9;
  const lo: V3 = [b.x0, b.y0, 0];
  const hi: V3 = [b.x1, b.y1, b.h];
  for (let a = 0; a < 3; a++) {
    if (Math.abs(d[a]) < 1e-9) {
      if (o[a] < lo[a] || o[a] > hi[a]) return null;
    } else {
      let t1 = (lo[a] - o[a]) / d[a];
      let t2 = (hi[a] - o[a]) / d[a];
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
  }
  return tmin;
}

export function firstHit(city: Box[], o: V3, d: V3): { t: number; box: Box } | null {
  let best: { t: number; box: Box } | null = null;
  for (const b of city) {
    const t = rayBox(o, d, b);
    if (t !== null && (!best || t < best.t)) best = { t, box: b };
  }
  return best;
}

/** Unit direction (east, north, up) from the phone to a point, in city axes rotated by `theta` degrees. */
export function dirToCity(S: V3, theta: number): { dir: V3; az: number; el: number } {
  const d = norm(sub(S, PHONE_POS));
  const e = dot(d, EAST), n = dot(d, NORTH), u = dot(d, PHONE_UP);
  const az = Math.atan2(e, n);
  const el = Math.asin(u);
  const a = az - (theta * Math.PI) / 180;
  return { dir: [Math.sin(a) * Math.cos(el), Math.cos(a) * Math.cos(el), Math.sin(el)], az: a, el };
}

export type Reflection = { W: V3; wall: "x0" | "x1" | "y0" | "y1"; extra: number; box: Box };

/** Single-bounce reflection off a vertical wall that carries the satellite's signal to the receiver (image method). */
export function findReflection(city: Box[], R: V3, d: V3): Reflection | null {
  let best: Reflection | null = null;
  for (const b of city) {
    const walls: { wall: Reflection["wall"]; axis: 0 | 1; at: number; n: number }[] = [
      { wall: "x0", axis: 0, at: b.x0, n: -1 }, { wall: "x1", axis: 0, at: b.x1, n: 1 },
      { wall: "y0", axis: 1, at: b.y0, n: -1 }, { wall: "y1", axis: 1, at: b.y1, n: 1 },
    ];
    for (const w of walls) {
      if ((R[w.axis] - w.at) * w.n <= 0) continue; // receiver must be on the outside of the wall
      const Rp: V3 = [R[0], R[1], R[2]];
      Rp[w.axis] = 2 * w.at - R[w.axis];
      if (Math.abs(d[w.axis]) < 1e-6) continue;
      const s = (w.at - Rp[w.axis]) / d[w.axis];
      if (s <= 0) continue;
      const W = add(Rp, mul(d, s));
      const inFace = w.axis === 0 ? W[1] >= b.y0 && W[1] <= b.y1 : W[0] >= b.x0 && W[0] <= b.x1;
      if (!inFace || W[2] < 1 || W[2] > b.h) continue;
      const toR = norm(sub(R, W));
      const hitR = firstHit(city, add(W, mul(toR, 0.05)), toR);
      if (hitR && hitR.t < len(sub(R, W)) - 0.1) continue;
      const hitS = firstHit(city, add(W, mul(d, 0.05)), d);
      if (hitS) continue;
      const v = sub(W, R);
      const extra = len(v) - dot(v, d);
      if (!best || extra < best.extra) best = { W, wall: w.wall, extra, box: b };
    }
  }
  return best;
}

export const RECEIVER: V3 = [0, 0, 1.5];

export type SatCity = { id: number; name: string; color: string; dir: V3; az: number; el: number; visible: boolean; hit: { t: number; box: Box } | null; refl: Reflection | null };

export function analyse(city: Box[], theta: number, orbitT = 6): SatCity[] {
  return SATS.map((s) => {
    const { dir, az, el } = dirToCity(satPos(s, orbitT), theta);
    const hit = firstHit(city, RECEIVER, dir);
    return { id: s.id, name: s.name, color: s.color, dir, az, el, visible: !hit, hit, refl: hit ? findReflection(city, RECEIVER, dir) : null };
  });
}

/** All constellation satellites above 5° elevation for the sky plot. */
export function skyPlotSats(city: Box[], theta: number) {
  return CONSTELLATION.map((s) => {
    const S = satAt(s, 0.9);
    const { dir, az, el } = dirToCity(S, theta);
    return { id: s.id, color: s.color, az, el, visible: !firstHit(city, RECEIVER, dir) };
  }).filter((s) => s.el > (5 * Math.PI) / 180);
}

/** Skyline mask: lowest unobstructed elevation for each azimuth. */
export function skyline(city: Box[], step = 4): { az: number; el: number }[] {
  const out: { az: number; el: number }[] = [];
  for (let a = 0; a < 360; a += step) {
    const az = (a * Math.PI) / 180;
    let free = 90;
    for (let e = 0; e <= 90; e += 1.5) {
      const el = (e * Math.PI) / 180;
      const dir: V3 = [Math.sin(az) * Math.cos(el), Math.cos(az) * Math.cos(el), Math.sin(el)];
      if (!firstHit(city, RECEIVER, dir)) { free = e; break; }
    }
    out.push({ az, el: (free * Math.PI) / 180 });
  }
  return out;
}
