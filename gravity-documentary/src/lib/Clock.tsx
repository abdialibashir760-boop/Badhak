import React from 'react';
import { CYAN, FONT, INK } from './theme';
import { TAU } from './math';

/** Analog clock. `seconds` is the elapsed reading; hands are driven only by that number. */
export const Clock: React.FC<{
  cx: number; cy: number; r: number; seconds: number; color?: string; label?: string; sub?: string; opacity?: number; ticking?: boolean;
}> = ({ cx, cy, r, seconds, color = CYAN, label, sub, opacity = 1, ticking = true }) => {
  const s = ticking ? Math.floor(seconds) + Math.min(1, Math.max(0, (seconds % 1) * 6)) * 0 + (1 - Math.exp(-((seconds % 1) * 22))) * 0.92 : seconds;
  const sa = (s / 60) * TAU;
  const ma = (seconds / 3600) * TAU;
  const ha = (seconds / 43200) * TAU;
  const hand = (a: number, len: number, w: number, c: string) => (
    <line x1={-Math.sin(a) * -r * 0.12} y1={Math.cos(a) * -r * 0.12 * -1} x2={Math.sin(a) * r * len} y2={-Math.cos(a) * r * len} stroke={c} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <g transform={`translate(${cx} ${cy})`} opacity={opacity}>
      <circle r={r * 1.1} fill="rgba(6,12,28,.8)" stroke={color} strokeWidth={r * 0.04} />
      <circle r={r * 1.1} fill="none" stroke={color} strokeOpacity={0.18} strokeWidth={r * 0.16} />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * TAU;
        const major = i % 5 === 0;
        const r1 = r * (major ? 0.82 : 0.9), r2 = r * 0.98;
        return <line key={i} x1={Math.sin(a) * r1} y1={-Math.cos(a) * r1} x2={Math.sin(a) * r2} y2={-Math.cos(a) * r2} stroke={INK} strokeOpacity={major ? 0.9 : 0.4} strokeWidth={major ? r * 0.035 : r * 0.015} />;
      })}
      {hand(ha, 0.5, r * 0.05, INK)}
      {hand(ma, 0.75, r * 0.035, INK)}
      {hand(sa, 0.88, r * 0.02, '#ff6b6b')}
      <circle r={r * 0.045} fill="#ff6b6b" />
      {label && <text y={r * 1.1 + r * 0.42} textAnchor="middle" fill={INK} fontFamily={FONT} fontSize={Math.max(24, r * 0.2)} fontWeight={700}>{label}</text>}
      {sub && <text y={r * 1.1 + r * 0.7} textAnchor="middle" fill="#8ea6c8" fontFamily={FONT} fontSize={Math.max(20, r * 0.15)}>{sub}</text>}
    </g>
  );
};
