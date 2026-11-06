import { DEG, latLonToVec, R_EARTH } from "./geo";
import { add, clamp01, len, lookAt, mixV, mul, norm, rotateAbout, slerp, sub, type Cam, type V3 } from "./math3d";
import { EAST, NORTH, PHONE_POS, PHONE_UP } from "./world";
import { HEIGHT, WIDTH } from "../timeline";

export const FOV = 30;

/** A camera described by what it looks at, from which direction and how far. */
export type Pose = { target: V3; dir: V3; D: number; up: V3; roll: number };

export const poseWide = (lat: number, lon: number, D: number, roll = 0): Pose => ({
  target: [0, 0, 0],
  dir: latLonToVec(lat, lon),
  D,
  up: [0, 0, 1],
  roll: roll * DEG,
});

/** Camera at `g` km of ground distance from the phone toward bearing `az`, `h` km up, looking at the phone. */
export function poseNear(az: number, g: number, h: number, targetLift = 0): Pose {
  const w = add(mul(NORTH, Math.cos(az * DEG)), mul(EAST, Math.sin(az * DEG)));
  const th = g / R_EARTH;
  const q = add(mul(PHONE_UP, Math.cos(th)), mul(w, Math.sin(th)));
  const pos = mul(q, R_EARTH + h);
  const target = add(PHONE_POS, mul(PHONE_UP, targetLift));
  const d = sub(pos, target);
  return { target, dir: norm(d), D: len(d), up: PHONE_UP, roll: 0 };
}

/** Generic: look at `target` from direction (lat, lon of the camera as seen from Earth's centre) at distance D. */
export const poseAt = (target: V3, dir: V3, D: number, up: V3 = [0, 0, 1], roll = 0): Pose => ({ target, dir: norm(dir), D, up, roll: roll * DEG });

/**
 * A dive between a close pose and a wide pose, zf: 0 = wide, 1 = close. The look-at point slides toward the
 * close target ahead of the zoom so the subject stays framed; D is interpolated exponentially.
 */
export function dive(zf: number, near: Pose, wide: Pose): Pose {
  const z = clamp01(zf);
  const L = Math.log(wide.D / near.D);
  return {
    target: mixV(wide.target, near.target, 1 - Math.pow(1 - z, 2.4)),
    dir: slerp(wide.dir, near.dir, z),
    D: wide.D * Math.exp(-L * z),
    up: norm(mixV(wide.up, near.up, z)),
    roll: wide.roll * (1 - z) + near.roll * z,
  };
}

/** Camera looking at the phone (lifted by `lift` km) from bearing `az`, elevation `el` (degrees above the local horizon), distance D. */
export function poseLocal(az: number, el: number, D: number, lift = 0): Pose {
  const w = add(mul(NORTH, Math.cos(az * DEG)), mul(EAST, Math.sin(az * DEG)));
  const dir = norm(add(mul(w, Math.cos(el * DEG)), mul(PHONE_UP, Math.sin(el * DEG))));
  return { target: add(PHONE_POS, mul(PHONE_UP, lift)), dir, D, up: PHONE_UP, roll: 0 };
}

export function mixPose(a: Pose, b: Pose, u: number): Pose {
  const x = clamp01(u);
  return {
    target: mixV(a.target, b.target, x),
    dir: slerp(a.dir, b.dir, x),
    D: Math.exp(Math.log(a.D) + (Math.log(b.D) - Math.log(a.D)) * x),
    up: norm(mixV(a.up, b.up, x)),
    roll: a.roll + (b.roll - a.roll) * x,
  };
}

export function camFromPose(p: Pose): { cam: Cam; D: number } {
  let pos = add(p.target, mul(p.dir, p.D));
  if (len(pos) < R_EARTH + 120) pos = mul(norm(pos), R_EARTH + 120);
  const fwd = norm(sub(p.target, pos));
  const up = p.roll ? rotateAbout(p.up, fwd, p.roll) : p.up;
  return { cam: lookAt(pos, p.target, up, FOV, WIDTH, HEIGHT), D: p.D };
}
