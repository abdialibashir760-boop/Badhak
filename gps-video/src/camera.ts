import { Easing } from "remotion";
import { DEG, latLonToVec, R_EARTH } from "./geo";
import { add, clamp01, cross, easeInOut, len, lookAt, mixV, mul, norm, rotateAbout, slerp, sub, type Cam, type V3 } from "./math3d";
import { PHONE_POS, PHONE_UP } from "./orbit";
import { BEAT, HEIGHT, WIDTH } from "./timing";

export const FOV = 30;

/** Zoom easing: slow start (already drifting), violent middle, soft landing. */
export const ZOOM_EASE = Easing.bezier(0.6, 0, 0.16, 1);
const ZOOM_START = 4.4;
const D_WIDE = 67000;
const ROLL0 = 20 * DEG; // the wide shot is rolled a little for a dynamic diagonal; it levels out during the dive
const DRIFT_SHARE = 0.07; // share of the log-zoom spent on the slow dolly-in before the big move

export const EAST: V3 = norm(cross([0, 0, 1], PHONE_UP));
export const NORTH: V3 = cross(PHONE_UP, EAST);

/** Camera placed `g` km (ground arc) from the phone toward bearing `az`, `h` km above the surface. */
function poseNear(az: number, g: number, h: number): V3 {
  const w = add(mul(NORTH, Math.cos(az * DEG)), mul(EAST, Math.sin(az * DEG)));
  const th = g / R_EARTH;
  const q = add(mul(PHONE_UP, Math.cos(th)), mul(w, Math.sin(th)));
  return mul(q, R_EARTH + h);
}

/** Final shot: slowly drifts after the lock. s ∈ [0,1]. */
export const CAM_AZ = 35; // camera sits north-east of the phone, looking south-west toward the satellites
function finalPose(s: number): V3 {
  const e = easeInOut(s);
  return poseNear(CAM_AZ + 14 * e, 1250 - 110 * e, 640 - 70 * e);
}

const END_POSE = finalPose(0);
const D_END = len(sub(END_POSE, PHONE_POS));
const DIR_END = norm(sub(END_POSE, PHONE_POS));
const LOG_RANGE = Math.log(D_WIDE / D_END);

export type CameraState = {
  cam: Cam;
  /** distance from camera to its look-at target, km */
  D: number;
  /** 0 = wide, 1 = fully zoomed (eased) */
  zoom: number;
  /** raw 0..1 progress of the big zoom move */
  u: number;
};

export function cameraAt(t: number): CameraState {
  if (t >= BEAT.lock) {
    const pos = finalPose(clamp01((t - BEAT.lock) / (BEAT.end - BEAT.lock)));
    const cam = lookAt(pos, PHONE_POS, PHONE_UP, FOV, WIDTH, HEIGHT);
    return { cam, D: len(sub(pos, PHONE_POS)), zoom: 1, u: 1 };
  }
  const u = clamp01((t - ZOOM_START) / (BEAT.lock - ZOOM_START));
  const z = ZOOM_EASE(u);
  const drift = clamp01(t / BEAT.lock);
  const D = D_WIDE * Math.exp(-LOG_RANGE * (DRIFT_SHARE * drift + (1 - DRIFT_SHARE) * z));

  // Wide view direction: above Africa and the Mediterranean, slowly orbiting east.
  const dir0 = latLonToVec(25, 20 + 5 * drift);
  const dir = slerp(dir0, DIR_END, z);
  // The look-at point slides from Earth's centre to the phone ahead of the zoom, keeping the phone framed.
  const target = mul(PHONE_POS, 1 - Math.pow(1 - z, 2.4));
  let pos = add(target, mul(dir, D));
  const rr = len(pos);
  if (rr < R_EARTH + 150) pos = mul(norm(pos), R_EARTH + 150);
  const fwd = norm(sub(target, pos));
  const up = rotateAbout(norm(mixV([0, 0, 1], PHONE_UP, z)), fwd, ROLL0 * (1 - z));
  return { cam: lookAt(pos, target, up, FOV, WIDTH, HEIGHT), D, zoom: z, u };
}
