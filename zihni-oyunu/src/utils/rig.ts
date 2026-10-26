import { lerp, rad, smooth, clamp } from "./animation";

/**
 * Stickman rig. Every limb angle is absolute, in degrees, measured from "straight down"
 * towards screen-right (0 = down, 90 = right, 180 = up, -90 = left).
 */
export type Pose = {
  lean: number; // torso lean from vertical (+ = to the right)
  head: number; // extra head tilt
  aL1: number; aL2: number; // left arm (screen left): upper arm, forearm
  aR1: number; aR2: number;
  lL1: number; lL2: number; // left leg: thigh, shin
  lR1: number; lR2: number;
  dy: number; // raises the whole body (jump / rise)
  smile: number; // -1 frown … 1 wide smile
  eyes: number; // 0 closed … 1 open
  brow: number; // -1 angry … 1 worried
  mouthO: number; // open mouth
  gaze: number; // -1 look left … 1 look right
  joy: number; // happy-arc eyes (genuine smile)
  mask: number; // 0..1 smiling mask over the face
};

export const STAND: Pose = {
  lean: 0, head: 0, aL1: -9, aL2: -5, aR1: 9, aR2: 5,
  lL1: -5, lL2: -2, lR1: 5, lR2: 2, dy: 0,
  smile: 0.1, eyes: 1, brow: 0, mouthO: 0, gaze: 0, joy: 0, mask: 0,
};

export const P = (p: Partial<Pose> = {}): Pose => ({ ...STAND, ...p });

export const blendPose = (a: Pose, b: Pose, t: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => { o[k] = lerp(a[k], b[k], t); });
  return o;
};

/** Pose animated through [frame, pose] keys with smooth easing. */
export function poseTrack(frame: number, keys: ReadonlyArray<readonly [number, Partial<Pose>]>, base: Pose = STAND): Pose {
  const full = keys.map(([f, p]) => [f, { ...base, ...p }] as const);
  if (frame <= full[0][0]) return full[0][1];
  for (let i = 1; i < full.length; i++) {
    if (frame <= full[i][0]) {
      const [f0, p0] = full[i - 1];
      const [f1, p1] = full[i];
      return blendPose(p0, p1, smooth(clamp((frame - f0) / Math.max(1, f1 - f0))));
    }
  }
  return full[full.length - 1][1];
}

/** Walking cycle limb angles for a given phase (radians). */
export function walk(phase: number, amp = 1): Partial<Pose> {
  const s = Math.sin(phase), c = Math.cos(phase);
  return {
    lL1: -5 + 26 * s * amp, lL2: -5 + 26 * s * amp - 20 * amp * Math.max(0, c),
    lR1: 5 - 26 * s * amp, lR2: 5 - 26 * s * amp - 20 * amp * Math.max(0, -c),
    aL1: -9 - 22 * s * amp, aL2: -9 - 22 * s * amp - 8,
    aR1: 9 + 22 * s * amp, aR2: 9 + 22 * s * amp + 8,
    dy: Math.abs(c) * 3 * amp,
  };
}

export type Pt = readonly [number, number];
export type Joints = {
  hip: Pt; neck: Pt; shoulder: Pt; head: Pt;
  elbowL: Pt; handL: Pt; elbowR: Pt; handR: Pt;
  hipL: Pt; hipR: Pt; kneeL: Pt; footL: Pt; kneeR: Pt; footR: Pt;
  chest: Pt; headR: number;
};

export const LEN = { torso: 100, shoulder: 84, neck: 36, head: 30, upper: 60, fore: 56, thigh: 70, shin: 66 };

const down = (a: number): Pt => [Math.sin(rad(a)), Math.cos(rad(a))];
const up = (a: number): Pt => [Math.sin(rad(a)), -Math.cos(rad(a))];
const add = (p: Pt, d: Pt, l: number): Pt => [p[0] + d[0] * l, p[1] + d[1] * l];

/** Joints in world space. `ground` is the y the lowest foot rests on. */
export function joints(pose: Pose, x: number, ground: number, scale: number, breath = 0): Joints {
  const L: Pt = [0, 0];
  const u = up(pose.lean);
  const hipL: Pt = [-7, 0], hipR: Pt = [7, 0];
  const kneeL = add(hipL, down(pose.lL1), LEN.thigh), footL = add(kneeL, down(pose.lL2), LEN.shin);
  const kneeR = add(hipR, down(pose.lR1), LEN.thigh), footR = add(kneeR, down(pose.lR2), LEN.shin);
  const lowest = Math.max(footL[1], footR[1]);
  const shoulder = add(L, u, LEN.shoulder - breath);
  const neck = add(L, u, LEN.torso - breath);
  const head = add(neck, up(pose.lean + pose.head), LEN.neck);
  const elbowL = add(shoulder, down(pose.aL1), LEN.upper), handL = add(elbowL, down(pose.aL2), LEN.fore);
  const elbowR = add(shoulder, down(pose.aR1), LEN.upper), handR = add(elbowR, down(pose.aR2), LEN.fore);
  const chest = add(L, u, LEN.shoulder * 0.62);
  const oy = ground - (lowest - pose.dy) * scale;
  const T = (p: Pt): Pt => [x + p[0] * scale, oy + p[1] * scale];
  return {
    hip: T(L), neck: T(neck), shoulder: T(shoulder), head: T(head),
    elbowL: T(elbowL), handL: T(handL), elbowR: T(elbowR), handR: T(handR),
    hipL: T(hipL), hipR: T(hipR), kneeL: T(kneeL), footL: T(footL), kneeR: T(kneeR), footR: T(footR),
    chest: T(chest), headR: LEN.head * scale,
  };
}

/** Handy poses. */
export const POSES = {
  stand: STAND,
  smileFixed: P({ smile: 1, eyes: 1, brow: 0.15 }),
  nodDown: P({ head: 14, lean: 3, smile: 1 }),
  tired: P({ lean: 7, head: 10, smile: -0.25, eyes: 0.35, brow: 0.5, aL1: -4, aL2: 0, aR1: 4, aR2: 0 }),
  sit: P({ lL1: 88, lL2: 4, lR1: 88, lR2: 4, aL1: -10, aL2: 28, aR1: 10, aR2: -28 }),
  sitSlump: P({ lL1: 88, lL2: 4, lR1: 88, lR2: 4, lean: 12, head: 14, aL1: 10, aL2: 62, aR1: -10, aR2: -62, smile: -0.3, eyes: 0.4, brow: 0.5 }),
};
