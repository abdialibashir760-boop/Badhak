import {lerp} from './anim';

/**
 * Angles are degrees measured from "straight down", positive = toward the
 * direction the figure faces. Arm segments and shins use absolute angles.
 */
export type Pose = {
  lean: number; // torso lean from vertical
  tilt: number; // head tilt
  headDrop: number; // head sinks toward the chest (px at scale 1)
  shrug: number; // shoulders raised (px)
  aU: number; // arm A upper
  aF: number; // arm A forearm
  bU: number;
  bF: number;
  lT: number; // leg L thigh
  lS: number; // leg L shin
  rT: number;
  rS: number;
};

export type Face = {
  eye: number; // 0 closed .. 1 open
  brow: number; // -1 worried(inner up) .. 0 neutral .. 1 stern
  mouth: number; // -1 frown .. 1 smile
  mouthOpen: number; // 0..1
  gx: number; // gaze -1..1
  gy: number;
};

export const STAND: Pose = {lean: 0, tilt: 0, headDrop: 0, shrug: 0, aU: 8, aF: 4, bU: -8, bF: -4, lT: 4, lS: 4, rT: -4, rS: -4};
export const GUARDED: Pose = {...STAND, lean: -3, headDrop: 6, shrug: 8, aU: 22, aF: 118, bU: -14, bF: 104};
export const HUG: Pose = {...STAND, lean: -4, headDrop: 8, shrug: 10, aU: 30, aF: 125, bU: -4, bF: 100};
export const SLUMP: Pose = {...STAND, lean: 10, tilt: 8, headDrop: 12, shrug: -2, aU: 4, aF: 8, bU: -2, bF: -2};
export const RELAXED: Pose = {...STAND, lean: -1, tilt: -3, headDrop: 0, shrug: -5, aU: 6, aF: 10, bU: -6, bF: -8};
export const TALK: Pose = {...STAND, lean: 2, aU: 10, aF: 70, bU: -10, bF: -2};
export const WAVE: Pose = {...STAND, aU: 128, aF: 160, bU: -6, bF: -4};
export const REACH: Pose = {...STAND, lean: 6, aU: 80, aF: 92, bU: -8, bF: -4};
export const HEAD_HOLD: Pose = {...STAND, lean: 6, headDrop: 4, shrug: 6, aU: 60, aF: 150, bU: -58, bF: -150};

export const lerpPose = (a: Pose, b: Pose, t: number): Pose => {
  const out = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    out[k] = lerp(a[k], b[k], t);
  });
  return out;
};

export const NEUTRAL: Face = {eye: 1, brow: 0, mouth: 0, mouthOpen: 0, gx: 0, gy: 0};
export const FACES = {
  neutral: NEUTRAL,
  blank: {eye: 0.9, brow: 0, mouth: 0, mouthOpen: 0, gx: 0, gy: 0} as Face,
  worried: {eye: 1, brow: -0.9, mouth: -0.6, mouthOpen: 0, gx: 0, gy: 0} as Face,
  anxious: {eye: 1, brow: -1, mouth: -0.9, mouthOpen: 0.25, gx: 0, gy: 0} as Face,
  calm: {eye: 0.82, brow: -0.1, mouth: 0.15, mouthOpen: 0, gx: 0, gy: 0} as Face,
  smile: {eye: 0.88, brow: -0.1, mouth: 0.8, mouthOpen: 0, gx: 0, gy: 0} as Face,
  talk: {eye: 1, brow: 0, mouth: 0.1, mouthOpen: 0.5, gx: 0, gy: 0} as Face,
};

export const lerpFace = (a: Face, b: Face, t: number): Face => {
  const out = {} as Face;
  (Object.keys(a) as (keyof Face)[]).forEach((k) => {
    out[k] = lerp(a[k], b[k], t);
  });
  return out;
};

/** Procedural walk. `dist` is distance travelled in figure-space px; stride is the cycle length. */
export const walkPose = (dist: number, base: Pose = STAND, amp = 1): Pose => {
  const ph = (dist / 190) * Math.PI * 2;
  const swing = (p: number) => ({t: Math.sin(p) * 30 * amp, s: Math.sin(p) * 30 * amp - 40 * amp * Math.max(0, Math.cos(p))});
  const l = swing(ph);
  const r = swing(ph + Math.PI);
  return {
    ...base,
    lT: l.t,
    lS: l.s,
    rT: r.t,
    rS: r.s,
    aU: base.aU + -Math.sin(ph) * 24 * amp,
    aF: base.aF + -Math.sin(ph) * 24 * amp + 8,
    bU: base.bU + Math.sin(ph) * 24 * amp,
    bF: base.bF + Math.sin(ph) * 24 * amp + 8,
    lean: base.lean + 3 * amp,
  };
};

