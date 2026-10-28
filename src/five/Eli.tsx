import React from 'react';
import type {Pose} from '../lib/pose';
import {POSES, pt, solveSkeleton, type Dims} from '../stone/figures/skeleton';
import {C} from './palette';

export const ELI_DIMS: Dims = {torso: 118, thigh: 66, shin: 66, upper: 54, fore: 54, headUp: 34};

/** Poses in the shared angle convention (degrees from straight down, + toward facing). */
export const ELI = {
  stand: {...POSES.stand, aU: 6, aF: 4, bU: -6, bF: -4} as Pose,
  /** seated on a chair: thighs level, shins down */
  sit: {lean: 4, tilt: 0, headDrop: 0, shrug: 0, aU: 28, aF: 76, bU: 20, bF: 70, lT: 90, lS: 4, rT: 88, rS: 2} as Pose,
  /** seated on a bed edge, hands on knees */
  sitEdge: {lean: 14, tilt: 6, headDrop: 8, shrug: 4, aU: 30, aF: 90, bU: 20, bF: 100, lT: 92, lS: 6, rT: 88, rS: 2} as Pose,
  lying: {...POSES.lying, aU: 8, aF: 4, bU: -8, bF: -3} as Pose,
};

/** `slump` 0 = upright, 1 = collapsed. Applied on top of any seated/standing pose. */
export const withSlump = (p: Pose, slump: number): Pose => ({
  ...p,
  lean: p.lean + 30 * slump,
  headDrop: p.headDrop + 18 * slump,
  shrug: p.shrug + 12 * slump,
  tilt: p.tilt + 10 * slump,
});

export type EliProps = {
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  pose: Pose;
  frame: number;
  rim?: string;
  rimStrength?: number;
  /** side the light comes from in figure space (+1 = the front, -1 = behind) */
  rimSide?: 1 | -1;
  glint?: number;
  hairUp?: number;
  breath?: number;
  tremble?: number;
  opacity?: number;
  shadow?: boolean;
};

const LIMB = 19;

/** The protagonist: a solid silhouette with a lit rim, glasses glint and a hair tuft that reports mood. */
export const Eli: React.FC<EliProps> = ({x, y, scale = 1, facing = 1, pose, frame, rim = C.rimCold, rimStrength = 1, rimSide = 1, glint = 1, hairUp = 0, breath = 1, tremble = 0, opacity = 1, shadow = true}) => {
  const k = solveSkeleton(pose, ELI_DIMS, {frame, seed: 4, idle: 0.8, tremble, breath});
  const leanR = (k.lean * Math.PI) / 180;
  void leanR;
  const U = (() => {
    const dx = k.hip.x - k.neck.x;
    const dy = k.hip.y - k.neck.y;
    const l = Math.hypot(dx, dy) || 1;
    return {x: dx / l, y: dy / l};
  })();
  const V = {x: -U.y, y: U.x}; // toward the figure's front
  const at = (u: number, v: number) => ({x: k.neck.x + U.x * u + V.x * v, y: k.neck.y + U.y * u + V.y * v});
  const sh = k.shoulder;
  const sway = Math.sin(frame / 30 * 1.7) * 3 * hairUp;
  // hoodie: shoulders -> waist, slightly oversized, with a hood bulge behind the neck
  const hoodie = `M ${pt({x: sh.x - V.x * 27, y: sh.y - V.y * 27})} C ${pt(at(40, -38))} ${pt(at(90, -36))} ${pt(at(132, -34))} L ${pt(at(134, 32))} C ${pt(at(90, 36))} ${pt(at(40, 38))} ${pt({x: sh.x + V.x * 27, y: sh.y + V.y * 27})} Q ${pt(at(-4, 0))} ${pt({x: sh.x - V.x * 27, y: sh.y - V.y * 27})} Z`;
  const hood = `M ${pt(at(-2, -30))} Q ${pt(at(-28, -44))} ${pt(at(14, -52))} Q ${pt(at(32, -22))} ${pt(at(18, 6))} Z`;
  const head = k.head;
  const R = 34;
  const tuft = (up: number) => {
    const a = (-90 + (1 - up) * 80 + sway) * (Math.PI / 180);
    const bx = head.x + 10;
    const by = head.y - R + 4;
    return `M ${bx - 14},${by + 6} Q ${bx + Math.cos(a) * 26 - 6},${by + Math.sin(a) * 30} ${bx + Math.cos(a) * 30 + 6},${by + Math.sin(a) * 26 + 6} Q ${bx + 6},${by - 2} ${bx + 12},${by + 8} Z`;
  };
  const limbs = (color: string) => (
    <g stroke={color} strokeWidth={LIMB} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M ${pt(k.hip)} L ${pt(k.kneeR)} L ${pt(k.footR)} l 14,2`} />
      <path d={`M ${pt(k.hip)} L ${pt(k.kneeL)} L ${pt(k.footL)} l 14,2`} />
      <path d={`M ${pt(k.shoulder)} L ${pt(k.elbowB)} L ${pt(k.handB)}`} />
      <path d={`M ${pt(k.shoulder)} L ${pt(k.elbowA)} L ${pt(k.handA)}`} />
    </g>
  );
  const shapes = (color: string) => (
    <g fill={color}>
      {limbs(color)}
      <path d={hood} />
      <path d={hoodie} />
      <circle cx={head.x} cy={head.y} r={R} />
      <path d={tuft(hairUp)} />
      <circle cx={k.handA.x} cy={k.handA.y} r={11} />
      <circle cx={k.handB.x} cy={k.handB.y} r={11} />
    </g>
  );
  const off = 4.5 * rimSide;
  const gl = Math.max(0, glint);
  return (
    <g transform={`translate(${x},${y}) scale(${scale * facing},${scale})`} opacity={opacity}>
      {shadow ? <ellipse cx={k.hip.x + 6} cy={4} rx={86} ry={9} fill="#000" opacity={0.35} /> : null}
      {rimStrength > 0.02 ? <g opacity={rimStrength} transform={`translate(${off},${-off * 0.4})`}>{shapes(rim)}</g> : null}
      {shapes(C.sil)}
      {/* glasses: lit ring + glint, the character's main micro-expression */}
      <g transform={`translate(${head.x + 13},${head.y - 2})`}>
        <circle r={13} fill="none" stroke={rim} strokeWidth={3.2} opacity={0.5 + 0.5 * rimStrength} />
        <path d="M -7,-4 A 9.5,9.5 0 0 1 4,-9" stroke={C.white} strokeWidth={3.4} strokeLinecap="round" fill="none" opacity={gl} />
        <circle cx={5} cy={4} r={1.8} fill={C.white} opacity={gl * 0.8} />
      </g>
    </g>
  );
};
