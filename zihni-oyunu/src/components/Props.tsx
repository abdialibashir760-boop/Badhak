import React from "react";
import { C } from "../theme";
import { prog } from "../utils/animation";

/** Floor line with a soft pool of shade; spans well beyond the frame for side-scrolling shots. */
export const Floor: React.FC<{ y?: number; x0?: number; x1?: number; dark?: boolean }> = ({ y = 830, x0 = -2400, x1 = 12000, dark = false }) => (
  <g>
    <path d={`M ${x0} ${y} L ${x1} ${y}`} stroke={dark ? "#1a1a18" : C.ink} strokeWidth={2.2} opacity={0.55} />
    <path d={`M ${x0} ${y + 16} L ${x1} ${y + 16}`} stroke={dark ? "#1a1a18" : C.ink} strokeWidth={1} opacity={0.18} />
  </g>
);

export const Clock: React.FC<{ x: number; y: number; r?: number; frame: number; speed?: number; start?: number; color?: string }> = ({ x, y, r = 80, frame, speed = 0.5, start = 0, color = C.ink }) => {
  const m = (start + frame * speed) % 360, h = (m / 12) % 360;
  const a = (deg: number, len: number) => [x + Math.sin((deg * Math.PI) / 180) * len, y - Math.cos((deg * Math.PI) / 180) * len];
  const [mx, my] = a(m * 6, r * 0.78), [hx, hy] = a(h * 6, r * 0.5);
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#f6f3ea" stroke={color} strokeWidth={5} />
      {Array.from({ length: 12 }, (_, i) => {
        const [x0, y0] = a(i * 30, r * 0.86), [x1, y1] = a(i * 30, r * 0.95);
        return <path key={i} d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke={color} strokeWidth={3} />;
      })}
      <path d={`M ${x} ${y} L ${hx} ${hy}`} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <path d={`M ${x} ${y} L ${mx} ${my}`} stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={x} cy={y} r={5} fill={color} />
    </g>
  );
};

export const Chair: React.FC<{ x: number; y: number; w?: number; color?: string }> = ({ x, y, w = 150, color = C.ink }) => (
  <g stroke={color} strokeWidth={7} strokeLinecap="round" fill="none">
    <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y}`} />
    <path d={`M ${x - w / 2 + 8} ${y} L ${x - w / 2 + 8} ${y + 84} M ${x + w / 2 - 8} ${y} L ${x + w / 2 - 8} ${y + 84}`} />
    <path d={`M ${x - w / 2} ${y} L ${x - w / 2 - 6} ${y - 150}`} />
  </g>
);

export const Phone: React.FC<{ x: number; y: number; ring?: number; frame: number }> = ({ x, y, ring = 0, frame }) => {
  const shake = ring > 0 ? Math.sin(frame * 2.4) * 2.5 * ring : 0;
  return (
    <g transform={`translate(${x + shake} ${y}) rotate(${shake})`}>
      {ring > 0 && [0, 1, 2].map((i) => {
        const p = ((frame * 0.03 + i / 3) % 1);
        return <circle key={i} cx={0} cy={-20} r={40 + p * 90} fill="none" stroke={C.ink} strokeWidth={2} opacity={(1 - p) * 0.45 * ring} />;
      })}
      <rect x={-30} y={-60} width={60} height={104} rx={10} fill="#1a1a1a" />
      <rect x={-24} y={-52} width={48} height={86} rx={5} fill={ring > 0 ? "#fdf1c8" : "#34332f"} />
      {ring > 0 && <circle cx={0} cy={-8} r={11} fill="none" stroke="#333" strokeWidth={3} />}
    </g>
  );
};

/** A to-do list pinned in mid-air with unticked boxes (some ticked with `done`). */
export const TodoList: React.FC<{ x: number; y: number; frame: number; born: number; done?: number; w?: number; rot?: number; opacity?: number }> = ({ x, y, frame, born, done = 0, w = 210, rot = -3, opacity = 1 }) => {
  const a = prog(frame, born, 18) * opacity;
  if (a <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={a}>
      <rect x={-w / 2} y={-130} width={w} height={260} rx={5} fill="#f1eee4" stroke={C.ink} strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={-w / 2 + 18} y={-98 + i * 46} width={20} height={20} fill="none" stroke={C.ink} strokeWidth={2.4} />
          <path d={`M ${-w / 2 + 52} ${-88 + i * 46} L ${w / 2 - 20 - (i % 3) * 22} ${-88 + i * 46}`} stroke={C.ink} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
          {i < done && <path d={`M ${-w / 2 + 20} ${-88 + i * 46} l 7 9 l 14 -18`} stroke={C.ink} strokeWidth={3.4} fill="none" strokeLinecap="round" />}
        </g>
      ))}
    </g>
  );
};

/** Thought / speech cloud. */
export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; tail?: [number, number]; opacity?: number; children?: React.ReactNode; dots?: boolean }> = ({ x, y, w, h, tail, opacity = 1, children, dots = false }) => (
  <g opacity={opacity}>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2.2} fill="#f8f6ee" stroke={C.ink} strokeWidth={3} />
    {tail && <path d={`M ${x + tail[0] * 0.3 - 14} ${y + h / 2 - 1} L ${x + tail[0]} ${y + tail[1]} L ${x + tail[0] * 0.3 + 18} ${y + h / 2 - 1}`} fill="#f8f6ee" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />}
    {tail && <path d={`M ${x + tail[0] * 0.3 - 12} ${y + h / 2 - 1.5} L ${x + tail[0] * 0.3 + 16} ${y + h / 2 - 1.5}`} stroke="#f8f6ee" strokeWidth={5} />}
    {dots && [-1, 0, 1].map((i) => <circle key={i} cx={x + i * 22} cy={y} r={5} fill={C.ink} />)}
    {children}
  </g>
);
