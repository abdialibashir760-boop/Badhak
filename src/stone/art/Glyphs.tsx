import React from 'react';
import {wob} from '../../lib/anim';
import {SINK} from './Nature';

/** Speech bubble for a language the hero cannot read: pictographs instead of words. */
export const Glyph: React.FC<{kind: 'sun' | 'paw' | 'spear' | 'eye' | 'q' | 'hand' | 'fish'; x: number; y: number; s?: number; color?: string}> = ({kind, x, y, s = 1, color = '#2a1d14'}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    {kind === 'sun' ? (
      <>
        <circle r={13} />
        {Array.from({length: 8}, (_, i) => (
          <path key={i} d={`M ${Math.cos((i * Math.PI) / 4) * 20},${Math.sin((i * Math.PI) / 4) * 20} l ${Math.cos((i * Math.PI) / 4) * 10},${Math.sin((i * Math.PI) / 4) * 10}`} />
        ))}
      </>
    ) : kind === 'paw' ? (
      <>
        <ellipse cx={0} cy={8} rx={13} ry={10} fill={color} />
        {[-16, -6, 6, 16].map((dx, i) => (
          <ellipse key={i} cx={dx} cy={-10 - (i === 1 || i === 2 ? 5 : 0)} rx={4} ry={6} fill={color} />
        ))}
      </>
    ) : kind === 'spear' ? (
      <path d="M -26,22 L 26,-22 M 26,-22 l -4,16 M 26,-22 l -16,4" />
    ) : kind === 'eye' ? (
      <>
        <path d="M -26,0 Q 0,-24 26,0 Q 0,24 -26,0 Z" />
        <circle r={7} fill={color} />
      </>
    ) : kind === 'hand' ? (
      <path d="M -12,22 L -14,-4 M -6,-8 L -6,-26 M 2,-10 L 2,-30 M 10,-8 L 12,-24 M 18,0 L 24,-10 M -12,22 Q 4,30 18,10" />
    ) : kind === 'fish' ? (
      <path d="M -26,0 Q -6,-16 16,0 Q -6,16 -26,0 M 16,0 L 30,-12 M 16,0 L 30,12" />
    ) : (
      <>
        <path d="M -12,-14 Q -12,-30 2,-30 Q 16,-30 16,-16 Q 16,-6 4,0 L 4,8" />
        <circle cx={4} cy={22} r={2.5} fill={color} />
      </>
    )}
  </g>
);

export const PictoBubble: React.FC<{x: number; y: number; frame: number; glyphs: Array<'sun' | 'paw' | 'spear' | 'eye' | 'q' | 'hand' | 'fish'>; grow?: number; tailTo?: {x: number; y: number}; seed?: number}> = ({
  x,
  y,
  frame,
  glyphs,
  grow = 1,
  tailTo,
  seed = 1,
}) => {
  if (grow <= 0.02) return null;
  const w = 38 + glyphs.length * 42;
  const h = 62;
  const wobble = (i: number) => wob(frame * 0.05 + i, seed) * 2;
  const pts = Array.from({length: 28}, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    const rr = 1 + wobble(i) * 0.02;
    return `${(Math.cos(a) * w * rr * grow).toFixed(1)},${(Math.sin(a) * h * rr * grow).toFixed(1)}`;
  }).join(' L ');
  return (
    <g>
      {tailTo ? (
        <>
          <circle cx={x + (tailTo.x - x) * 0.55} cy={y + h * grow + (tailTo.y - y - h) * 0.3} r={8 * grow} fill="#efe6d2" stroke={SINK} strokeWidth={3} />
          <circle cx={x + (tailTo.x - x) * 0.82} cy={y + h * grow + (tailTo.y - y - h) * 0.62} r={5 * grow} fill="#efe6d2" stroke={SINK} strokeWidth={3} />
        </>
      ) : null}
      <g transform={`translate(${x},${y})`}>
        <path d={`M ${pts} Z`} fill="#efe6d2" stroke={SINK} strokeWidth={4} strokeLinejoin="round" />
        {grow > 0.8
          ? glyphs.map((g, i) => <Glyph key={i} kind={g} x={(i - (glyphs.length - 1) / 2) * 72} y={0} s={0.9} />)
          : null}
      </g>
    </g>
  );
};

/** The hero's own imagination: dashed pencil sketches. */
export const Sketch: React.FC<{x: number; y: number; s?: number; opacity?: number; kind: 'plate' | 'shop' | 'bag' | 'phone' | 'fridge'; frame?: number}> = ({x, y, s = 1, opacity = 1, kind, frame = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity} fill="none" stroke="#f2ead8" strokeWidth={5} strokeDasharray="14 9" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'plate' ? (
      <>
        <ellipse rx={64} ry={20} />
        <ellipse rx={38} ry={11} />
        <path d="M 96,-30 l 0,56 M 90,-30 l 0,18 M 102,-30 l 0,18 M -100,-30 l 0,56 M -100,-30 q 14,10 0,28" />
      </>
    ) : kind === 'shop' ? (
      <>
        <rect x={-70} y={-30} width={140} height={86} />
        <path d="M -78,-30 L -62,-62 L 62,-62 L 78,-30 M -40,-30 l 6,-32 M 0,-30 l 0,-32 M 40,-30 l -6,-32" />
        <rect x={-18} y={4} width={36} height={52} />
        <path d="M -52,-8 l 22,0 M 30,-8 l 22,0" />
      </>
    ) : kind === 'bag' ? (
      <>
        <path d="M -44,-54 L 44,-54 L 52,52 L -52,52 Z" />
        <path d="M -44,-54 l 8,-10 l 10,10 l 10,-10 l 10,10 l 10,-10 l 10,10 l 10,-10 l 8,10" />
        <circle cx={0} cy={0} r={18} />
      </>
    ) : kind === 'phone' ? (
      <>
        <rect x={-34} y={-62} width={68} height={124} rx={12} />
        <path d="M -14,-48 l 28,0" />
        <path d={`M -16,-12 q 16,-${14 + Math.sin(frame * 0.2) * 3} 32,0 M -8,-2 q 8,-7 16,0`} />
        <circle cx={0} cy={44} r={7} />
      </>
    ) : (
      <>
        <rect x={-58} y={-110} width={116} height={220} rx={10} />
        <path d="M -58,-30 L 58,-30 M -46,-80 l 0,34 M -46,10 l 0,48" />
      </>
    )}
  </g>
);
