import React from 'react';
import { CX, CY, F, NEAR, toView, type V3, type View } from './camera';
import { clamp } from './math';
import { WELL_PALETTE } from './theme';

/** Collects projected segments into a few SVG paths, bucketed by (depth layer, style). */
export class Batch {
  private d = new Map<string, string>();
  private last = new Map<string, string>();

  segment(layer: number, style: string, a: V3, b: V3) {
    let [ax, ay, az] = a;
    let [bx, by, bz] = b;
    if (az < NEAR && bz < NEAR) return;
    if (az < NEAR) {
      const k = (NEAR - az) / (bz - az);
      ax += (bx - ax) * k; ay += (by - ay) * k; az = NEAR;
    } else if (bz < NEAR) {
      const k = (NEAR - az) / (bz - az);
      bx = ax + (bx - ax) * k; by = ay + (by - ay) * k; bz = NEAR;
    }
    const p = `${(CX + (F * ax) / az).toFixed(1)},${(CY - (F * ay) / az).toFixed(1)}`;
    const q = `${(CX + (F * bx) / bz).toFixed(1)},${(CY - (F * by) / bz).toFixed(1)}`;
    const key = `${layer}|${style}`;
    this.d.set(key, (this.d.get(key) ?? '') + (this.last.get(key) === p ? `L${q}` : `M${p}L${q}`));
    this.last.set(key, q);
  }

  paths(layer: number, styles: Record<string, LineStyle>): React.ReactNode[] {
    const out: React.ReactNode[] = [];
    this.d.forEach((d, key) => {
      const [l, s] = key.split('|');
      if (Number(l) !== layer) return;
      const st = styles[s];
      if (!st) return;
      const common = { d, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
      if (st.glow) out.push(<path key={`${key}g`} {...common} stroke={st.stroke} strokeOpacity={st.opacity * 0.16} strokeWidth={st.glow} />);
      out.push(<path key={key} {...common} stroke={st.stroke} strokeOpacity={st.opacity} strokeWidth={st.width} strokeDasharray={st.dash} />);
    });
    return out;
  }
}

export type LineStyle = { stroke: string; opacity: number; width: number; dash?: string; glow?: number };

export type Well = { x: number; z: number; gm: number; s: number; amp?: number; /** retarded start time (s) and speed for travelling curvature */ t0?: number };
export type HeightFn = (x: number, z: number) => number;

/** Height field of superposed softened potentials Φ = −GM/√(r²+s²). */
export const wellHeight = (wells: Well[], retard?: { t: number; speed: number; response: (u: number) => number }): HeightFn => (x, z) => {
  let h = 0;
  for (const w of wells) {
    const d = Math.hypot(x - w.x, z - w.z);
    let a = w.amp ?? 1;
    if (retard && w.t0 !== undefined) a *= retard.response(retard.t - w.t0 - d / retard.speed);
    h -= (w.gm * a) / Math.sqrt(d * d + w.s * w.s);
  }
  return h;
};

export type SurfaceBody = {
  id: string;
  x: number; y: number; z: number;
  /** world radius – the projected pixel radius is F·radius/depth */
  radius: number;
  render: (sx: number, sy: number, rpx: number, depth: number) => React.ReactNode;
};

export type SurfaceLine = { pts: { x: number; z: number }[]; style: string; lift?: number };

type Props = {
  view: View;
  height: HeightFn;
  wells?: { x: number; z: number }[];
  bodies?: SurfaceBody[];
  lines?: SurfaceLine[];
  lineStyles?: Record<string, LineStyle>;
  half?: number;
  spacing?: number;
  depthScale?: number;
  gridOpacity?: number;
  /** distance from origin at which the grid starts to fade, then ends */
  fade?: [number, number, number];
  palette?: string[];
  flat?: boolean;
};

const ALPHA = [0.85, 0.5, 0.22];
const WIDTH = [1.7, 1.4, 1.1];

/** A 3D perspective grid that sags into potential wells, with painter-sorted bodies and surface lines. */
export const Surface: React.FC<Props> = ({
  view, height, wells = [], bodies = [], lines = [], lineStyles = {}, half = 75, spacing = 1.5, depthScale = 5.2,
  gridOpacity = 1, fade = [34, 52, 72], palette = WELL_PALETTE, flat = false,
}) => {
  const sorted = [...bodies].map((b) => ({ b, v: toView(view, b.x, b.y, b.z) })).sort((a, c) => c.v[2] - a.v[2]);
  const layerOf = (depth: number) => sorted.filter((s) => s.v[2] > depth).length;
  const batch = new Batch();

  const styles: Record<string, LineStyle> = { ...lineStyles };
  palette.forEach((stroke, ci) =>
    ALPHA.forEach((a, ai) => {
      styles[`g${ci}_${ai}`] = { stroke, opacity: Math.min(1, a * (0.8 + 0.08 * ci)) * gridOpacity, width: WIDTH[ai], glow: ci >= 3 && ai === 0 ? 6 : undefined };
    }),
  );

  const n = Math.round(half / spacing);
  type Node = { v: V3; h: number; x: number; z: number };
  for (let axis = 0; axis < 2; axis++) {
    for (let i = -n; i <= n; i++) {
      const c = i * spacing;
      let p = -half;
      let prev: Node | null = null;
      while (p <= half + 1e-6) {
        const x = axis === 0 ? c : p;
        const z = axis === 0 ? p : c;
        const h = flat ? 0 : height(x, z);
        const cur: Node = { v: toView(view, x, h, z), h, x, z };
        if (prev) {
          const r0 = Math.hypot((prev.x + x) / 2, (prev.z + z) / 2);
          const ai = r0 < fade[0] ? 0 : r0 < fade[1] ? 1 : r0 < fade[2] ? 2 : -1;
          if (ai >= 0) {
            const f = Math.pow(clamp(-(prev.h + h) / 2 / depthScale), 0.7);
            const ci = Math.min(palette.length - 1, Math.floor(f * palette.length));
            batch.segment(layerOf((prev.v[2] + cur.v[2]) / 2), `g${ci}_${ai}`, prev.v, cur.v);
          }
        }
        prev = cur;
        let step = 2;
        for (const w of wells) step = Math.min(step, 0.18 + 0.1 * Math.hypot(x - w.x, z - w.z));
        p += Math.max(0.2, step);
      }
    }
  }

  lines.forEach((ln) => {
    let prev: V3 | null = null;
    ln.pts.forEach((pt) => {
      const v = toView(view, pt.x, (flat ? 0 : height(pt.x, pt.z)) + (ln.lift ?? 0.05), pt.z);
      if (prev) batch.segment(layerOf((prev[2] + v[2]) / 2), ln.style, prev, v);
      prev = v;
    });
  });

  return (
    <g>
      {Array.from({ length: sorted.length + 1 }, (_, k) => (
        <g key={k}>
          {batch.paths(k, styles)}
          {k < sorted.length &&
            (() => {
              const { b, v } = sorted[k];
              const sc = { x: CX + (F * v[0]) / v[2], y: CY - (F * v[1]) / v[2] };
              return <g key={b.id}>{b.render(sc.x, sc.y, (F * b.radius) / v[2], v[2])}</g>;
            })()}
        </g>
      ))}
    </g>
  );
};
