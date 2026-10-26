import { LINES } from "./timeline";

export const FPS = 30;
export const W = 1080;
export const H = 1440;

export type Pt = [number, number];

/** Time helpers keyed by narration line id (seconds). */
export const T = (id: string): number => {
  const l = LINES.find((x) => x.id === id);
  if (!l) throw new Error(`unknown line ${id}`);
  return l.start;
};
export const E = (id: string): number => LINES.find((x) => x.id === id)!.end;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
/** Progress 0..1 of time t between a and b, eased. */
export const prog = (t: number, a: number, b: number, ease = easeInOut) => ease((t - a) / (b - a));

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Terrain -------------------------------------------------------------
export const SURF: Pt[] = [
  [-1200, -340],
  [-300, -300],
  [200, -200],
  [480, -70],
  [600, 0],
  [2600, 0],
];
export const groundY = (x: number): number => {
  if (x <= SURF[0][0]) return SURF[0][1];
  for (let i = 1; i < SURF.length; i++) {
    if (x <= SURF[i][0]) {
      const [x0, y0] = SURF[i - 1];
      const [x1, y1] = SURF[i];
      return lerp(y0, y1, (x - x0) / (x1 - x0));
    }
  }
  return 0;
};
export const BOTTOM = 3400;

// ---- Tunnel: one long switchback ramp down to the shelter --------------------
export const PATH: Pt[] = [
  [60, -228],
  [1000, 170],
  [150, 520],
  [1000, 880],
  [150, 1230],
  [1000, 1773],
  [770, 1773],
];
const segLen = PATH.slice(1).map((p, i) => Math.hypot(p[0] - PATH[i][0], p[1] - PATH[i][1]));
export const PATH_LEN = segLen.reduce((a, b) => a + b, 0);

/** Point + heading along the tunnel at fraction f (0..1). */
export function pathAt(f: number): { p: Pt; ang: number } {
  let d = clamp(f) * PATH_LEN;
  for (let i = 0; i < segLen.length; i++) {
    if (d <= segLen[i] || i === segLen.length - 1) {
      const u = clamp(d / segLen[i]);
      const a = PATH[i];
      const b = PATH[i + 1];
      return { p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
    }
    d -= segLen[i];
  }
  return { p: PATH[0], ang: 0 };
}

export const TUNNEL_W = 46;
export const FLOOR_OFF = 17; // floor sits this far below the tunnel centreline

// ---- Fixed places -------------------------------------------------------------
export const SHELTER = { x0: 380, x1: 760, y0: 1700, y1: 1790 };
export const SHAFT = { x: 1000, y0: 880, y1: 1773, w: 24, ladderTop: 1260 }; // ladder missing above ladderTop
export const BLOCK = { x0: 380, x1: 860, y0: 1100, y1: 1560, slide: 70 };
export const RUBBLE: Pt = [560, 1492];

export const RIGS = [700, 900, 1100, 1300];
export const HOLE_TARGET = [1766, 1650, 1450, 1900]; // final depths; hole 0 reaches the shelter
export const HOLE_STALL0 = 1500; // hole 0 before the breakthrough

export const RULER_X = 1420;
export const SHELTER_CAM: Pt = [570, 1745];
