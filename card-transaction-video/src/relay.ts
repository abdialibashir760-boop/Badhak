import { Easing, interpolate } from "remotion";
import { ARRIVE, DEPART, HOP_LINE, NODES, VISIT_NODES, type Pt } from "./network";

/**
 * Scene 3 timeline. All frames are local to the scene (0 = absolute frame 3600).
 * Each run sends one ISO 8583 packet around the loop and back. Early runs are
 * slow so each step can be explained; the last run takes 60 frames = 2 seconds.
 */
export interface Cycle {
  start: number;
  dur: number;
  label: string;
}

export const CYCLES: Cycle[] = [
  { start: 90, dur: 1800, label: "Run 1 · 30× slower" },
  { start: 1990, dur: 600, label: "Run 2 · 10× slower" },
  { start: 2690, dur: 360, label: "Run 3 · 6× slower" },
  { start: 3130, dur: 180, label: "Run 4 · 3× slower" },
  { start: 3380, dur: 90, label: "Run 5 · 1.5× slower" },
  { start: 3520, dur: 60, label: "Run 6 · real time" },
];

const DWELL = [0.06, 0.09, 0.07, 0.14, 0.07, 0.09, 0.06]; // time spent at each of the 7 visits
const HOP = 0.07; // time spent on each of the 6 hops
export const ROUND_TRIP_MS = 1980;

export interface Phase {
  cycle: number;
  kind: "dwell" | "hop";
  /** Visit index 0-6 for a dwell, hop index 0-5 for a hop. */
  index: number;
  t0: number;
  t1: number;
}

export interface Visit {
  cycle: number;
  v: number;
  node: number;
  t0: number;
  t1: number;
  ms: number;
  reply: boolean;
}

export const PHASES: Phase[] = [];
export const VISITS: Visit[] = [];

CYCLES.forEach((c, ci) => {
  let t = c.start;
  for (let v = 0; v < 7; v++) {
    const d = DWELL[v] * c.dur;
    PHASES.push({ cycle: ci, kind: "dwell", index: v, t0: t, t1: t + d });
    const node = VISIT_NODES[v];
    const reply = v > 3;
    VISITS.push({ cycle: ci, v, node, t0: t, t1: t + d, ms: reply ? NODES[node].replyMs : NODES[node].ms, reply });
    t += d;
    if (v < 6) {
      const h = HOP * c.dur;
      PHASES.push({ cycle: ci, kind: "hop", index: v, t0: t, t1: t + h });
      t += h;
    }
  }
});

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const hopEase = Easing.inOut(Easing.cubic);

export interface PacketState {
  x: number;
  y: number;
  scale: number;
  /** Direction of travel for the little MTI label. */
  reply: boolean;
  /** Cable currently being used, or -1. */
  line: number;
  visible: boolean;
  /** Position at an earlier moment, used to draw a comet trail. */
  trail: Pt[];
}

function packetCore(frame: number): Omit<PacketState, "trail"> {
  for (const p of PHASES) {
    if (frame < p.t0 || frame >= p.t1) continue;
    const e = frame - p.t0;
    const len = p.t1 - p.t0;
    if (p.kind === "hop") {
      const k = hopEase(clamp01(e / len));
      const a = DEPART[p.index];
      const b = ARRIVE[p.index + 1];
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, scale: 1, reply: p.index >= 3, line: HOP_LINE[p.index], visible: true };
    }
    const win = Math.min(7, len / 2);
    const arrive = ARRIVE[p.index];
    const depart = DEPART[p.index];
    const reply = p.index > 3;
    if (e < len / 2) {
      const s = p.index === 0 ? 0 : 1 - clamp01(e / win);
      return { x: arrive.x, y: arrive.y, scale: s, reply, line: -1, visible: s > 0.01 };
    }
    const s = p.index === 6 ? 0 : clamp01((e - (len - win)) / win);
    return { x: depart.x, y: depart.y, scale: s, reply, line: -1, visible: s > 0.01 };
  }
  return { x: 0, y: 0, scale: 0, reply: false, line: -1, visible: false };
}

export function getPacket(frame: number): PacketState {
  const core = packetCore(frame);
  const trail: Pt[] = [];
  if (core.visible && core.line >= 0) {
    for (let k = 1; k <= 7; k++) {
      const past = packetCore(frame - k * 1.4);
      if (past.line === core.line) trail.push({ x: past.x, y: past.y });
    }
  }
  return { ...core, trail };
}

export interface NodeRuntime {
  flash: number;
  load: number;
  ms: number;
}

/** Flash, CPU load and millisecond timer of one node at a given frame. */
export function getNodeRuntime(frame: number, node: number): NodeRuntime {
  let latest: Visit | undefined;
  for (const v of VISITS) {
    if (v.node === node && v.t0 <= frame) latest = v;
  }
  if (!latest) return { flash: 0, load: 0.12, ms: 0 };
  const e = frame - latest.t0;
  const dwell = latest.t1 - latest.t0;
  const ms = latest.ms * clamp01(e / dwell);
  if (e < dwell) {
    return { flash: 0.65 + 0.35 * Math.sin(e * 0.55), load: 1, ms };
  }
  const after = e - dwell;
  return { flash: Math.max(0, 1 - after / 34) * 0.85, load: Math.max(0.12, 1 - after / 50), ms };
}

export function getLatestVisit(frame: number): { visit: Visit; progress: number } | null {
  let latest: Visit | undefined;
  for (const v of VISITS) {
    if (v.t0 <= frame) latest = v;
  }
  if (!latest) return null;
  return { visit: latest, progress: clamp01((frame - latest.t0) / (latest.t1 - latest.t0)) };
}

export function getRoundTrip(frame: number): { cycle: number; ms: number } {
  let idx = -1;
  CYCLES.forEach((c, i) => {
    if (c.start <= frame) idx = i;
  });
  if (idx < 0) return { cycle: -1, ms: 0 };
  const c = CYCLES[idx];
  const t = interpolate(frame, [c.start, c.start + c.dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { cycle: idx, ms: t * ROUND_TRIP_MS };
}

/** How brightly each cable glows because the packet is on it right now. */
export function getLineBoost(frame: number, line: number): number {
  const p = getPacket(frame);
  return p.visible && p.line === line ? 1 : 0;
}
