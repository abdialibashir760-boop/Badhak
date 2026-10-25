import React from 'react';
import {deg, rng} from '../lib/anim';
import {Face, NEUTRAL, Pose, STAND} from '../lib/pose';

export const INK = '#ece8e1';
export const DIM = '#8a867f';
export const RED = '#b2403d';

const HEAD_R = 58;
const TORSO = 104;
const THIGH = 62;
const SHIN = 62;
const UPPER = 52;
const FORE = 50;
const STROKE = 6;

const seg = (a: number, len: number) => [Math.sin(deg(a)) * len, Math.cos(deg(a)) * len] as const;

export type StickFigureProps = {
  x: number;
  /** y of the ground under the feet. */
  y: number;
  scale?: number;
  /** 1 = faces right, -1 = faces left. */
  facing?: 1 | -1;
  pose?: Pose;
  face?: Face;
  /** Head scale multiplier ("oversized head" swell). */
  headScale?: number;
  color?: string;
  opacity?: number;
  frame: number;
  seed?: number;
  /** Idle breathing/sway amount (0 disables). */
  idle?: number;
  /** Extra fast tremble in px at scale 1. */
  tremble?: number;
  /** Breath speed multiplier. */
  breath?: number;
  /** Adds a red outline pass behind the figure (0..1). */
  redGlow?: number;
  /** Fraction (0..1) of the figure that has been drawn (hand-drawn reveal). */
  draw?: number;
  /** Disables auto-blink. */
  noBlink?: boolean;
};

const blinkAmount = (frame: number, seed: number) => {
  const r = rng(seed * 997 + Math.floor(frame / 96))();
  const at = 30 + r * 50;
  const f = frame % 96;
  const d = f - at;
  return d >= 0 && d < 5 ? Math.sin((d / 5) * Math.PI) : 0;
};

export const StickFigure: React.FC<StickFigureProps> = ({
  x,
  y,
  scale = 1,
  facing = 1,
  pose = STAND,
  face = NEUTRAL,
  headScale = 1,
  color = INK,
  opacity = 1,
  frame,
  seed = 1,
  idle = 1,
  tremble = 0,
  breath = 1,
  redGlow = 0,
  draw = 1,
  noBlink = false,
}) => {
  const t = frame / 30;
  const br = Math.sin(t * Math.PI * 2 * 0.28 * breath + seed);
  const sway = Math.sin(t * 0.9 + seed * 3) * idle;
  const trem = (k: number) => Math.sin(frame * 2.7 + k * 5.1 + seed) * tremble;

  // Skeleton (figure space: feet on y = 0, +x = facing direction).
  const legY = (th: number, sh: number) => Math.cos(deg(th)) * THIGH + Math.cos(deg(sh)) * SHIN;
  const hipH = Math.max(legY(pose.lT, pose.lS), legY(pose.rT, pose.rS));
  const hip = {x: 0, y: -hipH};
  const lean = pose.lean + sway * 1.2 + br * 0.5 * idle;
  const [tx, ty] = seg(180 - lean, TORSO + br * 1.4 * idle); // pointing up
  const neck = {x: hip.x + tx + trem(1) * 0.4, y: hip.y + ty};
  const shoulder = {x: neck.x - Math.sin(deg(lean)) * 12, y: neck.y + 12 - pose.shrug + br * 1.5 * idle};

  const kneeL = {x: hip.x + seg(pose.lT, THIGH)[0], y: hip.y + seg(pose.lT, THIGH)[1]};
  const footL = {x: kneeL.x + seg(pose.lS, SHIN)[0], y: kneeL.y + seg(pose.lS, SHIN)[1]};
  const kneeR = {x: hip.x + seg(pose.rT, THIGH)[0], y: hip.y + seg(pose.rT, THIGH)[1]};
  const footR = {x: kneeR.x + seg(pose.rS, SHIN)[0], y: kneeR.y + seg(pose.rS, SHIN)[1]};

  const armA = (() => {
    const [ex, ey] = seg(pose.aU + trem(2), UPPER);
    const elbow = {x: shoulder.x + ex, y: shoulder.y + ey};
    const [hx, hy] = seg(pose.aF + trem(3), FORE);
    return {elbow, hand: {x: elbow.x + hx, y: elbow.y + hy}};
  })();
  const armB = (() => {
    const [ex, ey] = seg(pose.bU + trem(4), UPPER);
    const elbow = {x: shoulder.x + ex, y: shoulder.y + ey};
    const [hx, hy] = seg(pose.bF + trem(5), FORE);
    return {elbow, hand: {x: elbow.x + hx, y: elbow.y + hy}};
  })();

  const hr = HEAD_R * headScale;
  const [hdx, hdy] = seg(180 - (lean + pose.tilt), hr + 6 - pose.headDrop * 0.5);
  const head = {x: neck.x + hdx + trem(6) * 0.5, y: neck.y + hdy + pose.headDrop * 0.4 + br * 0.8 * idle};

  const P = (p: {x: number; y: number}) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  const body = `M ${P(neck)} L ${P(hip)}`;
  const legL = `M ${P(hip)} L ${P(kneeL)} L ${P(footL)}`;
  const legR = `M ${P(hip)} L ${P(kneeR)} L ${P(footR)}`;
  const arms = `M ${P(shoulder)} L ${P(armA.elbow)} L ${P(armA.hand)} M ${P(shoulder)} L ${P(armB.elbow)} L ${P(armB.hand)}`;
  const limbs = `${legL} ${legR} ${arms}`;

  // Face
  const blink = noBlink ? 0 : blinkAmount(frame, seed);
  const eyeOpen = Math.max(0.05, face.eye * (1 - blink));
  const er = 10.5 * headScale;
  const eyeDx = 22 * headScale;
  const eyeY = -2 * headScale;
  const gx = face.gx * 4.2 * headScale;
  const gy = face.gy * 3.4 * headScale;
  const faceRot = lean + pose.tilt;

  const mouthY = 25 * headScale;
  const mw = 17 * headScale;
  const curve = face.mouth * 11 * headScale;
  const open = face.mouthOpen * 12 * headScale;
  const mouth =
    open > 1.5
      ? `M ${-mw},${mouthY} Q 0,${mouthY + curve + open * 1.6} ${mw},${mouthY} Q 0,${mouthY + curve * 0.3 - open * 0.3} ${-mw},${mouthY}`
      : `M ${-mw},${mouthY} Q 0,${mouthY + curve * 1.8} ${mw},${mouthY}`;

  const browY = eyeY - er - 8 * headScale;
  const bl = face.brow;
  const inner = browY + bl * 6 * headScale;
  const outer = browY - bl * 4 * headScale;
  const bw = 11 * headScale;
  const browL = `M ${-eyeDx - bw},${outer} L ${-eyeDx + bw},${inner}`;
  const browR = `M ${eyeDx - bw},${inner} L ${eyeDx + bw},${outer}`;

  const gDash = draw < 1 ? {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw} : {};

  const strokeProps = {
    fill: 'none',
    stroke: color,
    strokeWidth: STROKE,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <g transform={`translate(${x + trem(0) * scale * 0.3},${y}) scale(${scale * facing},${scale})`} opacity={opacity}>
      {redGlow > 0 ? (
        <g opacity={redGlow * 0.7} stroke={RED} strokeWidth={STROKE + 9} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={body} />
          <path d={limbs} />
          <circle cx={head.x} cy={head.y} r={hr} />
        </g>
      ) : null}
      <path d={body} {...strokeProps} {...gDash} />
      <path d={limbs} {...strokeProps} {...gDash} />
      <circle cx={head.x} cy={head.y} r={hr} fill="#000" stroke={color} strokeWidth={STROKE} {...gDash} />
      <g transform={`translate(${head.x},${head.y}) rotate(${faceRot})`} opacity={draw > 0.85 ? 1 : 0}>
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * eyeDx},${eyeY})`}>
            <ellipse rx={er} ry={er * eyeOpen} fill={color} />
            <ellipse cx={gx} cy={gy} rx={er * 0.46} ry={Math.min(er * 0.46, er * eyeOpen)} fill="#050505" />
          </g>
        ))}
        <path d={browL} {...strokeProps} strokeWidth={4 * Math.max(0.8, headScale * 0.9)} />
        <path d={browR} {...strokeProps} strokeWidth={4 * Math.max(0.8, headScale * 0.9)} />
        <path d={mouth} {...strokeProps} strokeWidth={4.5 * Math.max(0.8, headScale * 0.9)} fill={open > 1.5 ? '#050505' : 'none'} />
      </g>
    </g>
  );
};

/** Position of the head centre in world space, useful for thought bubbles and cameras. */
export const headPosition = (x: number, y: number, scale: number, headScale = 1) => ({
  x,
  y: y - (THIGH * 2 + TORSO + 6 + HEAD_R * headScale) * scale,
});
