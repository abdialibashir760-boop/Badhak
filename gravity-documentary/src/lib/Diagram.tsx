import React from 'react';
import { CYAN, DIM, FONT, GOLD, INK, SERIF } from './theme';
import { clamp } from './math';

/** Animated vector arrow. `p` (0‥1) grows it from the tail. */
export const Arrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; p?: number; label?: string;
  labelOffset?: [number, number]; opacity?: number; head?: number;
}> = ({ x1, y1, x2, y2, color = GOLD, width = 4, p = 1, label, labelOffset = [12, -12], opacity = 1, head = 16 }) => {
  p = clamp(p);
  const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
  const len = Math.hypot(x2 - x1, y2 - y1) * p;
  if (len < 2) return null;
  const a = Math.atan2(ey - y1, ex - x1);
  const hx = Math.min(head, len * 0.6);
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={ex - Math.cos(a) * hx * 0.8} y2={ey - Math.sin(a) * hx * 0.8} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon
        points={`${ex},${ey} ${ex - Math.cos(a - 0.4) * hx},${ey - Math.sin(a - 0.4) * hx} ${ex - Math.cos(a + 0.4) * hx},${ey - Math.sin(a + 0.4) * hx}`}
        fill={color}
      />
      {label && p > 0.8 && (
        <text x={ex + labelOffset[0]} y={ey + labelOffset[1]} fill={color} fontFamily={FONT} fontSize={28} fontWeight={600}>{label}</text>
      )}
    </g>
  );
};

export const Tag: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; align?: 'start' | 'middle' | 'end'; opacity?: number; weight?: number }> = ({
  x, y, text, color = INK, size = 30, align = 'middle', opacity = 1, weight = 600,
}) => (
  <text x={x} y={y} textAnchor={align} fill={color} fontFamily={FONT} fontSize={size} fontWeight={weight} opacity={opacity}
    style={{ paintOrder: 'stroke', stroke: 'rgba(2,4,11,.85)', strokeWidth: 6 }}>{text}</text>
);

/** Floating glass card for equations or short statements. */
export const Card: React.FC<{ x: number; y: number; w?: number; opacity?: number; label?: string; children: React.ReactNode; size?: number; serif?: boolean; align?: 'left' | 'center' }> = ({
  x, y, w, opacity = 1, label, children, size = 46, serif = true, align = 'left',
}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: w, opacity, transform: `translateY(${(1 - opacity) * 14}px)`,
    background: 'rgba(8,16,34,.66)', border: '1px solid rgba(140,190,255,.30)', borderRadius: 20, padding: '16px 32px 22px',
    fontFamily: FONT, textAlign: align,
  }}>
    {label && <div style={{ color: '#8fb0de', fontSize: 22, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>}
    <div style={{ color: '#f2f7ff', fontFamily: serif ? SERIF : FONT, fontStyle: serif ? 'italic' : 'normal', fontSize: size }}>{children}</div>
  </div>
);

export const Sub: React.FC<{ up?: string; down?: string }> = ({ up, down }) => (
  <span style={{ display: 'inline-flex', flexDirection: 'column', verticalAlign: 'middle', fontSize: '0.6em', lineHeight: 1, margin: '0 0.08em' }}>
    <span style={{ minHeight: '1em' }}>{up ?? ''}</span>
    <span style={{ minHeight: '1em' }}>{down ?? ''}</span>
  </span>
);

/** Axis-aligned graph box with an animated polyline/curve. */
export const Graph: React.FC<{
  x: number; y: number; w: number; h: number; xLabel: string; yLabel: string; fn: (u: number) => number; p: number;
  color?: string; points?: { u: number; label?: string; color?: string }[]; yMax?: number;
}> = ({ x, y, w, h, xLabel, yLabel, fn, p, color = CYAN, points = [], yMax = 1 }) => {
  const N = 120;
  const pts: string[] = [];
  for (let i = 0; i <= N * clamp(p); i++) {
    const u = i / N;
    pts.push(`${x + u * w},${y + h - clamp(fn(u) / yMax) * h}`);
  }
  return (
    <g>
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={DIM} strokeWidth={2.5} />
      <line x1={x} y1={y} x2={x} y2={y + h} stroke={DIM} strokeWidth={2.5} />
      <Tag x={x + w / 2} y={y + h + 52} text={xLabel} color={DIM} size={26} />
      <text transform={`translate(${x - 28} ${y + h / 2}) rotate(-90)`} textAnchor="middle" fill={DIM} fontFamily={FONT} fontSize={26} fontWeight={600}>{yLabel}</text>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((pt, i) => {
        if (clamp(p) < pt.u) return null;
        const px = x + pt.u * w, py = y + h - clamp(fn(pt.u) / yMax) * h;
        return (
          <g key={i}>
            <line x1={px} y1={py} x2={px} y2={y + h} stroke={pt.color ?? GOLD} strokeWidth={2} strokeDasharray="6 6" opacity={0.7} />
            <circle cx={px} cy={py} r={9} fill={pt.color ?? GOLD} />
            {pt.label && <Tag x={px + 16} y={py - 18} text={pt.label} color={pt.color ?? GOLD} size={28} align="start" />}
          </g>
        );
      })}
    </g>
  );
};

/** Diagonal "ANALOGY"-style stamp. */
export const Stamp: React.FC<{ x: number; y: number; text: string; color?: string; opacity?: number; rot?: number; size?: number }> = ({
  x, y, text, color = GOLD, opacity = 1, rot = -6, size = 38,
}) => (
  <div style={{
    position: 'absolute', left: x, top: y, opacity, transform: `rotate(${rot}deg) scale(${0.9 + 0.1 * opacity})`, border: `3px solid ${color}`,
    color, padding: '6px 22px', borderRadius: 10, fontFamily: FONT, fontWeight: 800, letterSpacing: 6, fontSize: size, background: 'rgba(2,4,11,.55)',
  }}>{text}</div>
);
