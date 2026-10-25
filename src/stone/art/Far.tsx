import React from 'react';
import {Parallax} from '../../components/Stage';
import {CaveMouth} from './Camp';
import {Herd, Mammoth} from './Animals';
import {mix} from './Nature';
import {useLook} from './Backdrop';

/** Smoke column rising from a distant hearth. */
export const Smoke: React.FC<{x: number; y: number; frame: number; h?: number; opacity?: number; color?: string}> = ({x, y, frame, h = 420, opacity = 0.5, color = '#b7bcc0'}) => (
  <g>
    {Array.from({length: 9}, (_, i) => {
      const t = (((frame * 0.6 + i * 46) % 410) / 410);
      const rr = 14 + t * 60;
      return <ellipse key={i} cx={x + Math.sin(t * 6 + i) * 26 * t + t * 70} cy={y - t * h} rx={rr} ry={rr * 0.8} fill={color} opacity={(1 - t) * opacity * (0.4 + 0.6 * Math.min(1, t * 6))} />;
    })}
  </g>
);

/** A far-off cave with a smoking hearth, a mammoth and a reindeer herd: the "somewhere to go" of the valley. */
export const DistantCave: React.FC<{frame: number; tod: number; x?: number; y?: number; mammoth?: boolean}> = ({frame, tod, x = 1750, y = 790, mammoth = true}) => {
  const L = useLook(tod);
  const haze = (c: string, k: number) => mix(c, L.hor, k);
  return (
    <>
      <Parallax depth={0.52}>
        <CaveMouth x={x} y={y} s={0.46} glow={0.5} frame={frame} lw={3} rock={haze('#6f6b66', 0.35)} rockDark={haze('#4a4640', 0.3)} />
        <Smoke x={x - 20} y={y - 200} frame={frame} />
        <Herd x={x - 1100} y={y - 6} s={0.9} frame={frame} count={9} color={haze('#4c5a5c', 0.35)} />
      </Parallax>
      {mammoth ? (
        <Parallax depth={0.62}>
          <Mammoth x={x - 700 + frame * 0.1} y={y + 18} s={0.34} walk={frame * 0.05} color={haze('#4a3b33', 0.4)} rim={haze('#8a6f5e', 0.4)} frame={frame} opacity={0.95} />
        </Parallax>
      ) : null}
    </>
  );
};
