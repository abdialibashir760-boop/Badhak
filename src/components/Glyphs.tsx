import React from 'react';
import {clamp, wob} from '../lib/anim';
import {INK, RED} from './StickFigure';
import {SANS, SERIF} from './Overlays';

/** An almond "watching" eye whose iris tracks a world-space target. */
export const WatchingEye: React.FC<{
  x: number;
  y: number;
  size?: number;
  look?: {x: number; y: number};
  open?: number;
  color?: string;
  opacity?: number;
  rot?: number;
}> = ({x, y, size = 60, look, open = 1, color = INK, opacity = 1, rot = 0}) => {
  const w = size;
  const h = size * 0.5 * open;
  let ix = 0;
  let iy = 0;
  if (look) {
    const dx = look.x - x;
    const dy = look.y - y;
    const d = Math.hypot(dx, dy) || 1;
    ix = (dx / d) * w * 0.28;
    iy = (dy / d) * h * 0.55;
  }
  const lid = `M ${-w} 0 Q 0 ${-h * 2} ${w} 0 Q 0 ${h * 2} ${-w} 0 Z`;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={opacity}>
      <clipPath id={`eye-clip-${Math.round(x)}-${Math.round(y)}`}>
        <path d={lid} />
      </clipPath>
      <path d={lid} fill="#050505" stroke={color} strokeWidth={size * 0.06} strokeLinejoin="round" />
      <g clipPath={`url(#eye-clip-${Math.round(x)}-${Math.round(y)})`}>
        <circle cx={ix} cy={iy} r={w * 0.38} fill="none" stroke={color} strokeWidth={size * 0.05} />
        <circle cx={ix} cy={iy} r={w * 0.17} fill={color} />
      </g>
    </g>
  );
};

/** Blobby thought cloud with text, growth, distortion and a trail of bubbles. */
export const ThoughtBubble: React.FC<{
  x: number;
  y: number;
  rx?: number;
  ry?: number;
  lines?: string[];
  grow?: number;
  distort?: number;
  frame: number;
  seed?: number;
  tail?: {x: number; y: number};
  color?: string;
  textColor?: string;
  dashed?: boolean;
  fontSize?: number;
  opacity?: number;
  fill?: string;
}> = ({x, y, rx = 150, ry = 80, lines = [], grow = 1, distort = 0.04, frame, seed = 1, tail, color = INK, textColor, dashed, fontSize = 30, opacity = 1, fill = '#030303'}) => {
  if (grow <= 0.01) return null;
  const N = 56;
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const lobe = 1 + 0.07 * Math.sin(a * 7 + seed) + 0.035 * Math.sin(a * 11 + seed * 2);
    const jitter = 1 + distort * wob(frame * 0.13 + a * 3, seed + i * 0.01) * 2;
    const r = lobe * jitter;
    pts.push(`${(Math.cos(a) * rx * r * grow).toFixed(1)},${(Math.sin(a) * ry * r * grow).toFixed(1)}`);
  }
  const d = `M ${pts.join(' L ')} Z`;
  const tailDots = tail
    ? [0.18, 0.38, 0.62].map((k, i) => ({
        cx: tail.x + (x - tail.x) * (1 - k) * 0.96,
        cy: tail.y + (y + ry * grow - tail.y) * (1 - k) * 0.96 + (k < 0.5 ? 0 : 0),
        r: 6 + i * 6,
      }))
    : [];
  return (
    <g opacity={opacity}>
      {tailDots.map((t, i) => (
        <circle key={i} cx={t.cx} cy={t.cy} r={t.r * grow} fill={fill} stroke={color} strokeWidth={4} />
      ))}
      <g transform={`translate(${x},${y})`}>
        <path d={d} fill={fill} stroke={color} strokeWidth={5} strokeLinejoin="round" strokeDasharray={dashed ? '14 10' : undefined} />
        {grow > 0.7 ? (
          <text textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={fontSize} fill={textColor ?? color} opacity={clamp((grow - 0.7) / 0.3)}>
            {lines.map((l, i) => (
              <tspan key={i} x={0} y={(i - (lines.length - 1) / 2) * fontSize * 1.18 + fontSize * 0.3}>
                {l}
              </tspan>
            ))}
          </text>
        ) : null}
      </g>
    </g>
  );
};

/** Concentric pulse rings (heartbeat, calm). */
export const PulseRings: React.FC<{x: number; y: number; phase: number; color?: string; maxR?: number; width?: number; opacity?: number; count?: number}> = ({
  x,
  y,
  phase,
  color = RED,
  maxR = 360,
  width = 3,
  opacity = 1,
  count = 3,
}) => (
  <g>
    {Array.from({length: count}, (_, i) => {
      const p = (((phase - i / count) % 1) + 1) % 1;
      const e = 1 - Math.pow(1 - p, 2.2);
      return <circle key={i} cx={x} cy={y} r={20 + e * maxR} fill="none" stroke={color} strokeWidth={width * (1 - p * 0.6)} opacity={(1 - p) * 0.8 * opacity} />;
    })}
  </g>
);

/** Judgement glyphs that haunt scenes 1–10: ?, x, tick, eye. */
export const JudgeMark: React.FC<{kind: 'q' | 'x' | 'tick'; x: number; y: number; size?: number; color?: string; opacity?: number; rot?: number}> = ({
  kind,
  x,
  y,
  size = 40,
  color = RED,
  opacity = 1,
  rot = 0,
}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={opacity}>
    {kind === 'q' ? (
      <text textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={size * 1.6} fill={color} y={size * 0.5}>
        ?
      </text>
    ) : kind === 'x' ? (
      <path d={`M ${-size / 2} ${-size / 2} L ${size / 2} ${size / 2} M ${size / 2} ${-size / 2} L ${-size / 2} ${size / 2}`} stroke={color} strokeWidth={size * 0.12} strokeLinecap="round" />
    ) : (
      <path d={`M ${-size / 2} 0 L ${-size / 6} ${size / 2.4} L ${size / 2} ${-size / 2}`} stroke={color} strokeWidth={size * 0.12} strokeLinecap="round" fill="none" />
    )}
  </g>
);

/** Thin brackets forming a rectangular examination frame. */
export const GeoFrame: React.FC<{cx: number; cy: number; w: number; h: number; progress?: number; opacity?: number; color?: string; width?: number; rot?: number}> = ({
  cx,
  cy,
  w,
  h,
  progress = 1,
  opacity = 1,
  color = INK,
  width = 2,
  rot = 0,
}) => {
  const L = Math.min(w, h) * 0.22 * progress;
  const x0 = -w / 2;
  const x1 = w / 2;
  const y0 = -h / 2;
  const y1 = h / 2;
  const d = `M ${x0} ${y0 + L} V ${y0} H ${x0 + L} M ${x1 - L} ${y0} H ${x1} V ${y0 + L} M ${x1} ${y1 - L} V ${y1} H ${x1 - L} M ${x0 + L} ${y1} H ${x0} V ${y1 - L}`;
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rot})`} opacity={opacity}>
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="square" />
    </g>
  );
};

export const Label: React.FC<{text: string; x: number; y: number; size?: number; color?: string; opacity?: number; align?: 'start' | 'middle' | 'end'; italic?: boolean; family?: string; spacing?: number}> = ({
  text,
  x,
  y,
  size = 30,
  color = INK,
  opacity = 1,
  align = 'middle',
  italic = true,
  family = SERIF,
  spacing = 0,
}) => (
  <text x={x} y={y} fontFamily={family === 'sans' ? SANS : family} fontStyle={italic ? 'italic' : 'normal'} fontSize={size} fill={color} opacity={opacity} textAnchor={align} letterSpacing={spacing}>
    {text}
  </text>
);
