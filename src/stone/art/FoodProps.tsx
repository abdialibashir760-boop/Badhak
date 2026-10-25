import React from 'react';
import {SINK} from './Nature';

export const GrindStone: React.FC<{x: number; y: number; s?: number; rub?: number}> = ({x, y, s = 1, rub = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M -70,0 Q -78,-22 -40,-28 L 50,-28 Q 82,-22 72,0 Z" fill="#6c675f" stroke={SINK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -34,-26 l 80,0" stroke="#99948a" strokeWidth={3} opacity={0.6} />
    <g transform={`translate(${rub * 26},0)`}>
      <ellipse cx={0} cy={-38} rx={30} ry={13} fill="#80796f" stroke={SINK} strokeWidth={3.5} />
    </g>
    {[-40, -26, -10, 6, 20, 34].map((dx, i) => (
      <circle key={i} cx={dx - rub * 6} cy={-27 - (i % 2) * 2} r={2.4} fill="#d2c3a0" />
    ))}
  </g>
);

export const Spit: React.FC<{x: number; y: number; s?: number; turn?: number}> = ({x, y, s = 1, turn = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M -86,16 L -80,-92 M -96,-74 L -80,-92 L -66,-74 M 86,16 L 80,-92 M 70,-74 L 80,-92 L 94,-74" stroke="#5a3e27" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1={-98} y1={-90} x2={98} y2={-90} stroke="#6b4a2d" strokeWidth={8} strokeLinecap="round" />
    <g transform={`translate(0,-90) rotate(${turn})`}>
      <path d="M -52,-6 C -62,-34 -10,-50 34,-36 C 66,-26 62,16 30,28 C -10,40 -44,30 -52,-6 Z" fill="#a24f35" stroke={SINK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -30,-16 Q 0,-30 30,-14 M -34,8 Q 0,22 34,10" stroke="#5a2517" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
      <path d="M 36,-30 l 28,-26 l 10,10 l -30,26 z" fill="#e6dcc3" stroke={SINK} strokeWidth={3} />
    </g>
  </g>
);

/** A hollow standing stump: the world's only "fridge". */
export const HollowStump: React.FC<{x: number; y: number; s?: number; open?: number; beetle?: number; frame?: number}> = ({x, y, s = 1, open = 0, beetle = 0, frame = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M -90,0 L -78,-210 Q -40,-250 0,-246 Q 50,-250 82,-206 L 96,0 Z" fill="#4c3925" stroke={SINK} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M -50,-10 Q -60,-120 -40,-206 M 20,-6 Q 30,-100 14,-214 M 60,-10 Q 70,-90 60,-200" stroke="#2c1f13" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
    <path d="M -34,-6 C -52,-60 -40,-130 0,-140 C 40,-130 54,-60 36,-6 Z" fill="#0b0705" stroke={SINK} strokeWidth={3.5} />
    <ellipse cx={0} cy={-232} rx={78} ry={18} fill="#6d5436" stroke={SINK} strokeWidth={3.5} />
    {open > 0.05 ? <ellipse cx={0} cy={-70} rx={30 * open} ry={52 * open} fill="#fff6cf" opacity={0.65 * open} /> : null}
    {beetle > 0 ? (
      <g transform={`translate(${-30 + beetle * 60},${-14 + Math.sin(frame * 0.8) * 1.5})`}>
        <ellipse rx={13} ry={9} fill="#181410" stroke="#000" strokeWidth={2} />
        <path d="M -10,-4 l -8,-8 M -4,-8 l -2,-12 M 8,-6 l 8,-8 M -10,4 l -10,6 M 10,4 l 10,6" stroke="#181410" strokeWidth={2.4} strokeLinecap="round" />
      </g>
    ) : null}
  </g>
);

export const Berries: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[[-8, 0], [6, -6], [14, 4], [-2, 8], [20, -4], [-16, 6]].map(([dx, dy], i) => (
      <circle key={i} cx={dx} cy={dy} r={7.5} fill={i % 2 ? '#a3304a' : '#c23b4f'} stroke={SINK} strokeWidth={2.4} />
    ))}
  </g>
);
