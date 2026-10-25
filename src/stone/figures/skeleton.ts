import {deg} from '../../lib/anim';
import type {Pose} from '../../lib/pose';

/** Segment lengths in source-art pixels (measured from the supplied character). */
export type Dims = {torso: number; thigh: number; shin: number; upper: number; fore: number; headUp: number};
export const HERO_DIMS: Dims = {torso: 140, thigh: 85, shin: 85, upper: 72, fore: 72, headUp: 36};

const seg = (a: number, len: number) => [Math.sin(deg(a)) * len, Math.cos(deg(a)) * len] as const;
type P = {x: number; y: number};

export type Skeleton = {
  hip: P;
  neck: P;
  shoulder: P;
  kneeL: P;
  footL: P;
  kneeR: P;
  footR: P;
  elbowA: P;
  handA: P;
  elbowB: P;
  handB: P;
  head: P;
  lean: number;
  forearmA: number;
  forearmB: number;
};

/**
 * Solves the stick skeleton in figure space: +x is the facing direction, y = 0 is the ground under the
 * lowest foot. Angles follow lib/pose.ts (degrees from straight down, positive toward the facing side).
 */
export const solveSkeleton = (
  pose: Pose,
  d: Dims,
  o: {frame: number; seed?: number; idle?: number; tremble?: number; breath?: number},
): Skeleton => {
  const {frame, seed = 1, idle = 1, tremble = 0, breath = 1} = o;
  const t = frame / 30;
  const br = Math.sin(t * Math.PI * 2 * 0.28 * breath + seed);
  const sway = Math.sin(t * 0.9 + seed * 3) * idle;
  const trem = (k: number) => Math.sin(frame * 2.7 + k * 5.1 + seed) * tremble;

  const legExt = (th: number, sh: number) => Math.cos(deg(th)) * d.thigh + Math.cos(deg(sh)) * d.shin;
  const hipH = Math.max(0, legExt(pose.lT, pose.lS), legExt(pose.rT, pose.rS));
  const hip = {x: 0, y: -hipH};
  const lean = pose.lean + sway * 1.2 + br * 0.5 * idle;
  const [tx, ty] = seg(180 - lean, d.torso + br * 1.6 * idle);
  const neck = {x: hip.x + tx + trem(1) * 0.4, y: hip.y + ty};
  const shoulder = {x: neck.x - Math.sin(deg(lean)) * 14, y: neck.y + 14 - pose.shrug + br * 1.8 * idle};

  const add = (p: P, a: number, len: number): P => {
    const [x, y] = seg(a, len);
    return {x: p.x + x, y: p.y + y};
  };
  const kneeL = add(hip, pose.lT, d.thigh);
  const footL = add(kneeL, pose.lS, d.shin);
  const kneeR = add(hip, pose.rT, d.thigh);
  const footR = add(kneeR, pose.rS, d.shin);
  const aU = pose.aU + trem(2);
  const aF = pose.aF + trem(3);
  const bU = pose.bU + trem(4);
  const bF = pose.bF + trem(5);
  const elbowA = add(shoulder, aU, d.upper);
  const handA = add(elbowA, aF, d.fore);
  const elbowB = add(shoulder, bU, d.upper);
  const handB = add(elbowB, bF, d.fore);
  const [hdx, hdy] = seg(180 - (lean + pose.tilt), d.headUp + 8 - pose.headDrop * 0.5);
  const head = {x: neck.x + hdx + trem(6) * 0.5, y: neck.y + hdy + pose.headDrop * 0.4 + br * 0.8 * idle};
  return {hip, neck, shoulder, kneeL, footL, kneeR, footR, elbowA, handA, elbowB, handB, head, lean, forearmA: aF, forearmB: bF};
};

export const pt = (p: P) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;

/** Extra poses used by the Stone Age film (same angle convention). */
export const POSES = {
  stand: {lean: 0, tilt: 0, headDrop: 0, shrug: 0, aU: 10, aF: 6, bU: -10, bF: -6, lT: 4, lS: 4, rT: -4, rS: -4} as Pose,
  lying: {lean: 84, tilt: -4, headDrop: 0, shrug: 0, aU: 40, aF: 60, bU: -10, bF: -20, lT: -88, lS: -90, rT: -92, rS: -90} as Pose,
  /** Seated on the ground, knees up — the pose of the supplied artwork. */
  sit: {lean: 6, tilt: 4, headDrop: 4, shrug: 4, aU: -150, aF: -165, bU: 150, bF: 165, lT: 112, lS: 68, rT: 104, rS: 78} as Pose,
  sitCalm: {lean: 6, tilt: 2, headDrop: 2, shrug: 0, aU: 40, aF: 100, bU: 20, bF: 110, lT: 112, lS: 70, rT: 100, rS: 80} as Pose,
  crouch: {lean: 18, tilt: 4, headDrop: 6, shrug: 2, aU: 40, aF: 100, bU: 20, bF: 85, lT: 70, lS: -10, rT: 55, rS: -15} as Pose,
  shrug: {lean: -2, tilt: 8, headDrop: 0, shrug: 18, aU: 55, aF: 105, bU: -55, bF: -105, lT: 4, lS: 4, rT: -4, rS: -4} as Pose,
  freeze: {lean: -6, tilt: 0, headDrop: 4, shrug: 14, aU: 32, aF: 25, bU: -32, bF: -25, lT: 8, lS: 8, rT: -8, rS: -8} as Pose,
  wave: {lean: 2, tilt: 4, headDrop: 0, shrug: 0, aU: 135, aF: 165, bU: -8, bF: -4, lT: 4, lS: 4, rT: -4, rS: -4} as Pose,
  point: {lean: 4, tilt: 0, headDrop: 0, shrug: 0, aU: 82, aF: 88, bU: -8, bF: -4, lT: 4, lS: 4, rT: -4, rS: -4} as Pose,
  both: {lean: 4, tilt: 6, headDrop: 0, shrug: 4, aU: 100, aF: 128, bU: -100, bF: -128, lT: 4, lS: 4, rT: -4, rS: -4} as Pose,
  hold: {lean: 10, tilt: 0, headDrop: 6, shrug: 2, aU: 56, aF: 98, bU: 40, bF: 92, lT: 6, lS: 6, rT: -6, rS: -6} as Pose,
  work: {lean: 24, tilt: 2, headDrop: 8, shrug: 0, aU: 50, aF: 96, bU: 28, bF: 92, lT: 40, lS: -6, rT: 22, rS: -8} as Pose,
};
