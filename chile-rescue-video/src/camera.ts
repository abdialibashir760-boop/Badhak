import { Pt, RUBBLE, SHELTER_CAM, T, clamp, easeInOut, lerp, pathAt } from "./geo";
import { bitX, holeDepth, truckF } from "./state";

type Focus = Pt | ((t: number) => Pt);
type Cam = { c: Focus; s: number };

const truck: Focus = (t) => pathAt(truckF(t)).p;
const bit0: Focus = (t) => [bitX(0, t), clamp(holeDepth(0, t), -60, 1800)];

// [line id, camera that starts easing in just before that line]
const KEYS: [string, Cam][] = [
  ["h1", { c: SHELTER_CAM, s: 2.0 }],
  ["h2", { c: [620, 1440], s: 1.0 }],
  ["h3", { c: RUBBLE, s: 1.8 }],
  ["h4", { c: [700, 860], s: 0.47 }],
  ["s1", { c: [250, -200], s: 0.95 }],
  ["s2", { c: [520, -110], s: 0.72 }],
  ["s3", { c: [800, -190], s: 0.6 }],
  ["s4", { c: [130, -225], s: 1.7 }],
  ["s5", { c: truck, s: 0.95 }],
  ["s6", { c: [700, 860], s: 0.47 }],
  ["c1", { c: [620, 1330], s: 0.9 }],
  ["c2", { c: [620, 1340], s: 0.97 }],
  ["c3", { c: RUBBLE, s: 1.3 }],
  ["c4", { c: RUBBLE, s: 1.0 }],
  ["c5", { c: [640, 1440], s: 0.8 }],
  ["l1", { c: [1000, 1500], s: 0.95 }],
  ["l2", { c: [1000, 1290], s: 1.7 }],
  ["l3", { c: [1000, 1500], s: 1.1 }],
  ["sh1", { c: [880, 1735], s: 1.8 }],
  ["sh2", { c: [740, 1735], s: 1.6 }],
  ["sh3", { c: SHELTER_CAM, s: 2.0 }],
  ["f1", { c: [500, 1735], s: 2.8 }],
  ["f2", { c: [560, 1735], s: 2.4 }],
  ["f3", { c: [480, 1730], s: 3.0 }],
  ["u1", { c: [1500, -120], s: 1.0 }],
  ["u2", { c: [1560, -150], s: 1.25 }],
  ["u3", { c: [1000, 1010], s: 1.1 }],
  ["u4", { c: [1000, 1050], s: 1.2 }],
  ["d1", { c: [1000, -120], s: 0.95 }],
  ["d2", { c: bit0, s: 0.9 }],
  ["d3", { c: bit0, s: 0.8 }],
  ["d4", { c: SHELTER_CAM, s: 1.9 }],
  ["d5", { c: [560, 1745], s: 2.6 }],
  ["d6", { c: SHELTER_CAM, s: 1.6 }],
  ["b1", { c: [800, 1180], s: 0.7 }],
  ["b2", { c: [710, 1700], s: 1.8 }],
  ["b3", { c: [780, 930], s: 0.5 }],
  ["b4", { c: [690, 1745], s: 2.8 }],
  ["b5", { c: [690, 1740], s: 3.2 }],
  ["b6", { c: bit0, s: 2.2 }],
  ["b7", { c: bit0, s: 2.6 }],
  ["b8", { c: [774, -64], s: 8 }],
  ["b9", { c: [774, -64], s: 8 }],
  ["b10", { c: [1260, -80], s: 2.0 }],
  ["b11", { c: SHELTER_CAM, s: 1.8 }],
  ["b12", { c: [700, 860], s: 0.47 }],
  ["b13", { c: [700, 870], s: 0.48 }],
  ["b14", { c: [700, 880], s: 0.49 }],
];

const LEAD = 0.25;
const DUR = 1.15;
const resolve = (f: Focus, t: number): Pt => (typeof f === "function" ? f(t) : f);

export function camera(t: number): { cx: number; cy: number; s: number } {
  let idx = 0;
  for (let i = 0; i < KEYS.length; i++) {
    if (t >= T(KEYS[i][0]) - LEAD) idx = i;
  }
  const cur = KEYS[idx][1];
  const prev = KEYS[Math.max(0, idx - 1)][1];
  const t0 = T(KEYS[idx][0]) - LEAD;
  const u = idx === 0 ? 1 : easeInOut((t - t0) / DUR);
  const a = resolve(prev.c, t);
  const b = resolve(cur.c, t);
  const s = Math.exp(lerp(Math.log(prev.s), Math.log(cur.s), u)) * (1 + 0.012 * Math.max(0, t - t0));
  return { cx: lerp(a[0], b[0], u), cy: lerp(a[1], b[1], u), s };
}
