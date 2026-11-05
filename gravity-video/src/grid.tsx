import React from 'react';
import { CX, CY, F, NEAR, toView, type View } from './camera';
import { ORBIT, clamp01, orbitPointBary, surfaceHeight, type SceneState, type Vec2 } from './physics';

type V3 = [number, number, number];

export type StyleDef = { stroke: string; opacity: number; width: number; dash?: string; glow?: number };

/**
 * Collects projected line segments into a handful of SVG path strings,
 * bucketed by (depth layer, style) so the whole grid is ~20 <path> elements.
 */
export class Batch {
  private d = new Map<string, string>();
  private last = new Map<string, string>();

  segment(layer: number, style: string, a: V3, b: V3) {
    let [ax, ay, az] = a;
    let [bx, by, bz] = b;
    if (az < NEAR && bz < NEAR) return;
    if (az < NEAR) {
      const k = (NEAR - az) / (bz - az);
      ax += (bx - ax) * k;
      ay += (by - ay) * k;
      az = NEAR;
    } else if (bz < NEAR) {
      const k = (NEAR - az) / (bz - az);
      bx = ax + (bx - ax) * k;
      by = ay + (by - ay) * k;
      bz = NEAR;
    }
    const p = `${(CX + (F * ax) / az).toFixed(1)},${(CY - (F * ay) / az).toFixed(1)}`;
    const q = `${(CX + (F * bx) / bz).toFixed(1)},${(CY - (F * by) / bz).toFixed(1)}`;
    const key = `${layer}|${style}`;
    this.d.set(key, (this.d.get(key) ?? '') + (this.last.get(key) === p ? `L${q}` : `M${p}L${q}`));
    this.last.set(key, q);
  }

  paths(layer: number, styles: Record<string, StyleDef>): React.ReactNode[] {
    const out: React.ReactNode[] = [];
    this.d.forEach((d, key) => {
      const [l, s] = key.split('|');
      if (Number(l) !== layer) return;
      const st = styles[s];
      if (!st) return;
      const common = { d, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
      if (st.glow) {
        out.push(<path key={`${key}g`} {...common} stroke={st.stroke} strokeOpacity={st.opacity * 0.16} strokeWidth={st.glow} />);
      }
      out.push(
        <path key={key} {...common} stroke={st.stroke} strokeOpacity={st.opacity} strokeWidth={st.width} strokeDasharray={st.dash} />,
      );
    });
    return out;
  }
}

export type LayerOf = (depth: number) => number;

// ---------- grid ----------

const SPACING = 1.5;
const HALF = 75;
const PALETTE = ['#4f7cb0', '#5aa6e0', '#6fd9ea', '#d3ec9c', '#ffc96b', '#ff8a50'];
const ALPHA = [0.85, 0.5, 0.22];
const WIDTH = [1.7, 1.4, 1.1];

export const GRID_STYLES: Record<string, StyleDef> = {};
PALETTE.forEach((stroke, ci) =>
  ALPHA.forEach((a, ai) => {
    GRID_STYLES[`g${ci}_${ai}`] = {
      stroke,
      opacity: Math.min(1, a * (0.8 + 0.08 * ci)),
      width: WIDTH[ai],
      glow: ci >= 3 && ai === 0 ? 6 : undefined,
    };
  }),
);

type Node = { v: V3; h: number; x: number; z: number };

export function buildGrid(batch: Batch, view: View, s: SceneState, layerOf: LayerOf) {
  const n = Math.round(HALF / SPACING);
  for (let axis = 0; axis < 2; axis++) {
    for (let i = -n; i <= n; i++) {
      const c = i * SPACING;
      let p = -HALF;
      let prev: Node | null = null;
      while (p <= HALF + 1e-6) {
        const x = axis === 0 ? c : p;
        const z = axis === 0 ? p : c;
        const h = surfaceHeight(x, z, s);
        const cur: Node = { v: toView(view, x, h, z), h, x, z };
        if (prev) {
          const mx = (prev.x + x) / 2;
          const mz = (prev.z + z) / 2;
          const r0 = Math.hypot(mx, mz);
          const ai = r0 < 34 ? 0 : r0 < 52 ? 1 : r0 < 72 ? 2 : -1;
          if (ai >= 0) {
            const f = Math.pow(clamp01(-(prev.h + h) / 2 / 5.2), 0.7);
            const ci = Math.min(5, Math.floor(f * 6));
            const layer = layerOf((prev.v[2] + cur.v[2]) / 2);
            batch.segment(layer, `g${ci}_${ai}`, prev.v, cur.v);
          }
        }
        prev = cur;
        // adaptive step: fine near the bodies, coarse far away
        const dE = Math.hypot(x - s.earth.x, z - s.earth.z);
        let step = 0.25 + 0.1 * dE;
        if (s.moonAmp > 0) step = Math.min(step, 0.15 + 0.2 * Math.hypot(x - s.moon.x, z - s.moon.z));
        p += Math.min(2, step);
      }
    }
  }
}

// ---------- lines lying on the sheet (trail, predicted orbit, wavefront) ----------

export const LINE_STYLES = (t: number, waveOpacity: number, orbitOpacity: number): Record<string, StyleDef> => {
  const styles: Record<string, StyleDef> = {
    orbit: { stroke: '#cfe4ff', opacity: orbitOpacity, width: 1.6, dash: '2 8' },
    wave: { stroke: '#7fe3ff', opacity: waveOpacity, width: 2.4, glow: 9 },
  };
  const op = [0.1, 0.22, 0.38, 0.6, 0.9];
  op.forEach((o, i) => {
    styles[`trail${i}`] = { stroke: '#ffdca3', opacity: o, width: 2 + i * 0.6, glow: i >= 3 ? 8 : undefined };
  });
  void t;
  return styles;
};

function onSurface(
  batch: Batch,
  view: View,
  s: SceneState,
  pts: Vec2[],
  styleOf: (i: number, total: number) => string,
  layerOf: LayerOf,
  lift = 0.05,
) {
  let prev: V3 | null = null;
  pts.forEach((pt, i) => {
    const v = toView(view, pt.x, surfaceHeight(pt.x, pt.z, s) + lift, pt.z);
    if (prev) batch.segment(layerOf((prev[2] + v[2]) / 2), styleOf(i, pts.length), prev, v);
    prev = v;
  });
}

export function buildTrail(batch: Batch, view: View, s: SceneState, layerOf: LayerOf, moonAt: (t: number) => Vec2) {
  if (s.moonAmp <= 0) return;
  const pts: Vec2[] = [];
  const steps = Math.max(2, Math.ceil((s.t - ORBIT.t0) * 45));
  for (let k = 0; k <= steps; k++) pts.push(moonAt(ORBIT.t0 + ((s.t - ORBIT.t0) * k) / steps));
  onSurface(batch, view, s, pts, (i, n) => `trail${Math.min(4, Math.floor((i / n) * 5))}`, layerOf);
}

export function buildOrbit(batch: Batch, view: View, s: SceneState, layerOf: LayerOf) {
  const pts: Vec2[] = [];
  for (let k = 0; k <= 180; k++) pts.push(orbitPointBary((k / 180) * Math.PI * 2));
  onSurface(batch, view, s, pts, () => 'orbit', layerOf);
}

export function buildWave(batch: Batch, view: View, s: SceneState, layerOf: LayerOf, radius: number) {
  const pts: Vec2[] = [];
  for (let k = 0; k <= 120; k++) {
    const a = (k / 120) * Math.PI * 2;
    pts.push({ x: s.earth.x + radius * Math.cos(a), z: s.earth.z + radius * Math.sin(a) });
  }
  onSurface(batch, view, s, pts, () => 'wave', layerOf, 0.02);
}
