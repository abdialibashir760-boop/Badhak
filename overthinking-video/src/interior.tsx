import React from 'react';
import {CREAM, INK, WARM, blobPath} from './utils';
import {Font} from './font';
import {MAIN_THOUGHT} from './bubbles';

const R = 400; // head radius in interior units
const BODY = blobPath(350, 95, 7);
const ECHOES = 5;
const PERIOD = 30; // frames between "the same thought, again"

const Thought: React.FC<{fill: string; shadow?: boolean; sw?: number}> = ({fill, shadow = true, sw = 7}) => (
  <g>
    {shadow ? <path d={BODY} fill={WARM} opacity={0.45} transform="translate(8 10)" /> : null}
    <path d={BODY} fill={fill} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    <text textAnchor="middle" dy="0.35em" fontSize={46} fontFamily={Font} fill={INK}>
      {MAIN_THOUGHT}
    </text>
  </g>
);

/** Inside the head: the same thought, repeating endlessly. */
export const Interior: React.FC<{frame: number; scale: number; opacity: number}> = ({frame, scale, opacity}) => {
  const t = frame / 30;
  const cyc = (frame % PERIOD) / PERIOD;
  // the central thought "re-fires" every cycle: quick pop, then settles
  const kick = Math.exp(-cyc * 7) * Math.cos(cyc * 18);
  const centerScale = 0.88 + 0.07 * kick;
  const echoes = Array.from({length: ECHOES}, (_, i) => {
    const a = t * 1.9 + (i / ECHOES) * Math.PI * 2; // radians, clockwise
    const x = Math.cos(a) * 225;
    const y = Math.sin(a) * 290;
    const depth = Math.sin(a); // >0: lower half (in front), <0: upper half
    return {i, x, y, depth, s: 0.4 + 0.05 * Math.sin(a - Math.PI / 2)};
  });
  return (
    <g opacity={opacity} transform={`translate(960 540) scale(${scale.toFixed(4)})`}>
      <defs>
        <clipPath id="mind"><circle r={R} /></clipPath>
        <radialGradient id="mindFill" cx="0.4" cy="0.36" r="0.8">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.65" stopColor={CREAM} />
          <stop offset="1" stopColor={WARM} />
        </radialGradient>
      </defs>
      <circle r={R} fill="url(#mindFill)" />
      <g clipPath="url(#mind)">
        {/* looping arrow ring */}
        <g transform={`rotate(${(t * 70).toFixed(2)})`}>
          <circle r={352} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="46 30" strokeLinecap="round" opacity={0.8} />
          {[0, 120, 240].map((a) => (
            <g key={a} transform={`rotate(${a}) translate(352 0) rotate(90)`}>
              <polygon points="-20,-24 20,0 -20,24" fill={INK} />
            </g>
          ))}
        </g>
        {/* echoes circling behind, then the central thought, then echoes in front */}
        {echoes.filter((e) => e.depth < 0).map((e) => (
          <g key={e.i} opacity={0.85} transform={`translate(${e.x.toFixed(1)} ${e.y.toFixed(1)}) scale(${e.s.toFixed(3)})`}>
            <Thought fill="#fbe8c8" sw={9} />
          </g>
        ))}
        <g transform={`scale(${centerScale.toFixed(4)}) rotate(${(Math.sin(t * 3) * 0.8).toFixed(2)})`}>
          <Thought fill="#ffffff" />
        </g>
        {echoes.filter((e) => e.depth >= 0).map((e) => (
          <g key={e.i} transform={`translate(${e.x.toFixed(1)} ${e.y.toFixed(1)}) scale(${(e.s * 1.12).toFixed(3)})`}>
            <Thought fill={CREAM} sw={8} />
          </g>
        ))}
      </g>
      <circle r={R} fill="none" stroke={INK} strokeWidth={15} />
    </g>
  );
};
