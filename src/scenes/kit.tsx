import React from 'react';
import {HEIGHT, WIDTH} from '../config/types';
import {INK} from '../components/StickFigure';

export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{position: 'absolute', inset: 0, ...style}}>
    {children}
  </svg>
);

/** Sound arcs emanating from a speaker; `dir` 1 = rightwards, -1 = leftwards. */
export const SpeechArcs: React.FC<{x: number; y: number; dir: 1 | -1; phase: number; opacity?: number; color?: string; size?: number}> = ({
  x,
  y,
  dir,
  phase,
  opacity = 1,
  color = INK,
  size = 1,
}) => (
  <g opacity={opacity}>
    {[0, 1, 2, 3].map((i) => {
      const p = (((phase - i * 0.25) % 1) + 1) % 1;
      const r = (24 + p * 150) * size;
      const a = 0.9 * (1 - p);
      const sx = Math.sin(0.9) * r * dir;
      const sy = Math.cos(0.9) * r;
      return (
        <path
          key={i}
          d={`M ${x + sx} ${y - sy} A ${r} ${r} 0 0 ${dir === 1 ? 1 : 0} ${x + sx} ${y + sy}`}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={a}
        />
      );
    })}
  </g>
);

/** A distant cluster of dim figures (simple, no faces) for crowds. */
export const Silhouette: React.FC<{x: number; y: number; s: number; opacity?: number; color?: string; frame: number; seed?: number; wave?: number}> = ({
  x,
  y,
  s,
  opacity = 1,
  color = '#6c6862',
  frame,
  seed = 0,
  wave = 0,
}) => {
  const sway = Math.sin(frame * 0.04 + seed * 2) * 2;
  const arm = wave * Math.sin(frame * 0.2 + seed) * 16;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity} stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M ${sway} -228 L 0 -124 L -28 0 M 0 -124 L 28 0`} />
      <path d={`M ${sway} -208 L ${-38 + arm * 0.3} -150 M ${sway} -208 L ${40 + arm} ${-170 - Math.abs(arm) * 1.2}`} />
      <circle cx={sway} cy={-268} r={42} fill="#000" />
    </g>
  );
};
