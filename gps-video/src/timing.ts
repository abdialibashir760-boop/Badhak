export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION_S = 10;
export const TOTAL_FRAMES = FPS * DURATION_S;

/** Story beats, in seconds. */
export const BEAT = {
  /** 0–2 s: Earth and satellites */
  orbit: 0,
  /** 2–5 s: satellites transmit */
  transmit: 2,
  /** the phone appears on the surface */
  phoneIn: 4.3,
  /** 5–8 s: signals reach the phone */
  receive: 5,
  /** 8–10 s: location marker locks */
  lock: 8,
  end: 10,
} as const;
