import React from 'react';
import {rng} from '../../lib/anim';
import {SINK} from './Nature';

/** Wild wolf (right-facing). `walk` is a gait phase in radians, `head` lowers the head for a watchful look. */
export const Wolf: React.FC<{
  x: number;
  y: number;
  s?: number;
  facing?: 1 | -1;
  walk?: number;
  head?: number;
  frame: number;
  fur?: string;
  eyes?: number;
  opacity?: number;
  breath?: boolean;
}> = ({x, y, s = 1, facing = 1, walk = 0, head = 0, frame, fur = '#6c6a66', eyes = 0, opacity = 1, breath = false}) => {
  const leg = (bx: number, ph: number, back: boolean) => {
    const sw = Math.sin(walk + ph) * 22;
    const lift = Math.max(0, Math.cos(walk + ph)) * 12 * (walk ? 1 : 0);
    const kx = bx + sw * 0.5 + (back ? -8 : 6);
    return `M ${bx},-70 L ${kx},-36 L ${bx + sw},${-lift}`;
  };
  const body = Math.sin(frame * 0.07) * (breath ? 2.5 : 0.6);
  return (
    <g transform={`translate(${x},${y}) scale(${s * facing},${s})`} opacity={opacity}>
      <ellipse cx={0} cy={4} rx={120} ry={10} fill="#000" opacity={0.25} />
      {[
        [-66, 0, true, '#4f4d4a'],
        [48, Math.PI, false, '#4f4d4a'],
      ].map(([bx, ph, back, c], i) => (
        <g key={i}>
          <path d={leg(bx as number, ph as number, back as boolean)} stroke={SINK} strokeWidth={19} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={leg(bx as number, ph as number, back as boolean)} stroke={c as string} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <g transform={`translate(0,${body})`}>
        <path d="M -100,-82 C -130,-72 -150,-50 -160,-24 C -140,-40 -120,-56 -96,-64 Z" fill={fur} stroke={SINK} strokeWidth={3.5} strokeLinejoin="round" />
        <path d="M -84,-96 C -40,-128 50,-128 88,-100 C 108,-90 106,-68 84,-60 C 44,-50 -44,-50 -86,-64 C -104,-72 -102,-90 -84,-96 Z" fill={fur} stroke={SINK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -60,-104 C -20,-118 30,-118 60,-104" stroke="#a8a6a1" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5} />
        <path d="M 70,-104 L 98,-84 M 56,-96 L 74,-78 M -30,-70 q 20,6 40,0" stroke="#3a3836" strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round" />
        {/* head */}
        <g transform={`translate(96,${-102 + head * 26}) rotate(${head * 14})`}>
          <path d="M -8,-18 C 6,-36 36,-34 58,-16 L 84,-8 C 90,-2 86,6 76,8 L 40,10 C 14,14 -6,6 -10,-8 Z" fill={fur} stroke={SINK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 4,-26 L 12,-52 L 28,-30 Z" fill="#55524e" stroke={SINK} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M 40,6 Q 60,12 76,6" stroke="#cfcdc7" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
          <circle cx={78} cy={-3} r={4.5} fill="#050403" />
          <ellipse cx={34} cy={-14} rx={5.5} ry={3.4} fill={eyes > 0 ? '#ffd15a' : '#1a1512'} />
          {eyes > 0 ? <ellipse cx={34} cy={-14} rx={13} ry={9} fill="#ffcc4d" opacity={0.35 * eyes} /> : null}
        </g>
      </g>
      {[
        [-42, Math.PI * 1.5],
        [70, Math.PI * 0.5],
      ].map(([bx, ph], i) => (
        <g key={i}>
          <path d={leg(bx as number, ph as number, false)} stroke={SINK} strokeWidth={19} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={leg(bx as number, ph as number, false)} stroke={fur} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
    </g>
  );
};

export const Mammoth: React.FC<{x: number; y: number; s?: number; walk?: number; color?: string; rim?: string; frame?: number; opacity?: number}> = ({
  x,
  y,
  s = 1,
  walk = 0,
  color = '#4a3b33',
  rim = '#8a6f5e',
  frame = 0,
  opacity = 1,
}) => {
  const bob = Math.sin(walk * 2) * 3;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${s})`} opacity={opacity}>
      <ellipse cx={0} cy={4} rx={290} ry={14} fill="#000" opacity={0.2} />
      <path
        d="M -230,0 L -236,-110 C -250,-170 -240,-250 -190,-300 C -120,-345 -20,-360 60,-340 C 130,-345 180,-320 200,-270 C 215,-235 222,-200 230,-170 C 246,-130 248,-80 236,-40 C 232,-20 244,-10 238,2 L 210,0 C 214,-30 212,-70 200,-110 C 185,-100 170,-80 150,-70 L 148,0 L 90,0 L 92,-90 C 40,-80 0,-80 -30,-90 L -40,0 L -100,0 L -104,-90 C -130,-80 -170,-70 -190,-90 L -190,0 Z"
        fill={color}
        stroke={SINK}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M -230,-130 q 20,40 8,90 M -190,-92 q 12,34 0,72 M -130,-80 q 8,30 -4,64 M -60,-82 q 8,26 -2,60 M 20,-80 q 10,26 0,56 M 100,-84 q 8,30 -2,64" fill="none" stroke={SINK} strokeWidth={4} strokeLinecap="round" opacity={0.65} />
      <path d="M -150,-320 C -60,-350 30,-352 100,-338" stroke={rim} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.55} />
      <path d="M 204,-200 C 250,-170 276,-170 282,-220 C 278,-184 250,-150 206,-176" fill="#d9ccb2" stroke={SINK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={196} cy={-232} r={5} fill="#0b0908" />
      <path d={`M 212,-250 q 14,${Math.sin(frame * 0.05) * 3 - 6} 22,10`} stroke={SINK} strokeWidth={3} fill="none" opacity={0.7} />
    </g>
  );
};

/** Tiny silhouetted reindeer herd on a ridge. */
export const Herd: React.FC<{x: number; y: number; s?: number; count?: number; seed?: number; frame: number; color?: string}> = ({x, y, s = 1, count = 7, seed = 9, frame, color = '#4c5a5c'}) => {
  const r = rng(seed);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {Array.from({length: count}, (_, i) => {
        const dx = i * 52 + r() * 24;
        const dy = r() * 12;
        const gait = Math.sin(frame * 0.12 + i) * 4;
        const bend = r() < 0.4 ? 8 : 0;
        return (
          <g key={i} transform={`translate(${dx},${dy})`} fill={color} stroke={color}>
            <path d={`M -14,-16 L 14,-16 Q 18,-8 12,-4 L -12,-4 Q -18,-10 -14,-16 Z M -10,-4 l ${gait * 0.4},12 M 10,-4 l ${-gait * 0.4},12 M -6,-4 l ${-gait * 0.3},12 M 6,-4 l ${gait * 0.3},12 M 14,-14 l 8,${-10 + bend} l 6,3 l -4,6 l -8,0`} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M 22,${-24 + bend} l 0,-10 l 6,-4 M 22,${-30 + bend} l -6,-6 M 26,${-30 + bend} l 8,-4`} fill="none" strokeWidth={1.6} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
};
