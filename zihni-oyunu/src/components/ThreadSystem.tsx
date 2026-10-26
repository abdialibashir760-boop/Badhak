import React from "react";
import { C } from "../theme";
import { clamp, hash, noise, prog } from "../utils/animation";
import type { Pt } from "../utils/rig";

export type ThreadDef = {
  from: Pt; to: Pt;
  born: number; // global frame
  dur?: number;
  tension?: number; // 0 slack … 1 taut
  sag?: number;
  width?: number;
  color?: string;
  opacity?: number;
  /** progress 0..1 of the thread being drawn out; overrides born/dur */
  draw?: number;
};

/** Black strings that run from the world to the character; slack when loose, straight when taut. */
export const Threads: React.FC<{ frame: number; defs: ThreadDef[]; seed?: number }> = ({ frame, defs, seed = 0 }) => (
  <g fill="none" strokeLinecap="round">
    {defs.map((t, i) => {
      const p = t.draw ?? prog(frame, t.born, t.dur ?? 20);
      if (p <= 0) return null;
      const tension = clamp(t.tension ?? 0.4);
      const sag = (t.sag ?? 90) * (1 - tension * 0.92);
      const sway = noise(frame * 0.02 + i * 3.1, seed + i) * (10 - tension * 8);
      const mx = (t.from[0] + t.to[0]) / 2 + sway, my = (t.from[1] + t.to[1]) / 2 + sag;
      const tremor = tension > 0.7 ? Math.sin(frame * 1.9 + i) * (tension - 0.7) * 4 : 0;
      return (
        <path
          key={i}
          d={`M ${t.from[0]} ${t.from[1]} Q ${mx} ${my + tremor} ${t.to[0]} ${t.to[1]}`}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - p}
          stroke={t.color ?? C.ink}
          strokeWidth={(t.width ?? 2.2) + tension * 1.1}
          opacity={t.opacity ?? 0.92}
        />
      );
    })}
  </g>
);

/** Thread wound round a limb: paper-coloured bands with an ink strand, so they read on black limbs. */
export const Wrap: React.FC<{ a: Pt; b: Pt; at?: number; turns?: number; born: number; frame: number; tight?: number; r?: number; dark?: boolean }> = ({
  a, b, at = 0.55, turns = 4, born, frame, tight = 0.4, r = 11, dark = false,
}) => {
  const p = prog(frame, born, 16);
  if (p <= 0) return null;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  const cx = a[0] + dx * at, cy = a[1] + dy * at;
  const rr = r * (1 - tight * 0.18);
  const shown = Math.ceil(turns * p);
  return (
    <g strokeLinecap="round" fill="none">
      {Array.from({ length: shown }, (_, k) => {
        const o = (k - (turns - 1) / 2) * 5.2;
        const px = cx + ux * o, py = cy + uy * o;
        const d = `M ${px - nx * rr - ux * 3} ${py - ny * rr - uy * 3} Q ${px + ux * 1} ${py + uy * 1 + 0} ${px + nx * rr + ux * 3} ${py + ny * rr + uy * 3}`;
        return (
          <g key={k}>
            <path d={d} stroke={dark ? "#d8d4c8" : C.paper} strokeWidth={4.8} />
            <path d={d} stroke={dark ? "#0b0b0b" : C.ink} strokeWidth={2} />
          </g>
        );
      })}
    </g>
  );
};

/** Scribbled tangle of threads — grows with `amount` (0..1). */
export const Tangle: React.FC<{ cx: number; cy: number; rx: number; ry: number; lines?: number; amount: number; seed?: number; frame: number; color?: string; width?: number }> = ({
  cx, cy, rx, ry, lines = 46, amount, seed = 1, frame, color = C.ink, width = 1.8,
}) => {
  const n = Math.floor(lines * clamp(amount));
  return (
    <g fill="none" strokeLinecap="round" stroke={color} strokeWidth={width} opacity={0.88}>
      {Array.from({ length: n }, (_, i) => {
        const r = (k: number) => hash(seed * 100 + i * 7.13 + k);
        const pt = (k: number): Pt => {
          const a = r(k) * Math.PI * 2, d = Math.sqrt(r(k + 0.5));
          return [cx + Math.cos(a) * rx * d + noise(frame * 0.015 + i + k, seed) * 3, cy + Math.sin(a) * ry * d + noise(frame * 0.017 + i * 2 + k, seed + 2) * 3];
        };
        const [p0, p1, p2, p3] = [pt(1), pt(2), pt(3), pt(4)];
        return <path key={i} d={`M ${p0[0]} ${p0[1]} C ${p1[0]} ${p1[1]}, ${p2[0]} ${p2[1]}, ${p3[0]} ${p3[1]}`} opacity={0.5 + r(9) * 0.5} />;
      })}
    </g>
  );
};

/** A loose thread resting on the floor (used when the strings fall away). */
export const FloorThread: React.FC<{ x: number; y: number; len?: number; seed?: number; appear: number; frame: number; color?: string }> = ({ x, y, len = 160, seed = 1, appear, frame, color = C.ink }) => {
  const p = prog(frame, appear, 40);
  if (p <= 0) return null;
  const pts = Array.from({ length: 7 }, (_, i): Pt => [x + (i / 6) * len, y + Math.sin(i * 1.7 + seed) * 7 + (hash(seed + i) - 0.5) * 6]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) d += ` Q ${pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * 0.5} ${pts[i - 1][1] + (hash(seed * 5 + i) - 0.5) * 20} ${pts[i][0]} ${pts[i][1]}`;
  return <path d={d} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.85} />;
};
