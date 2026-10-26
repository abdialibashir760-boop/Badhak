import React from "react";
import { Stickman, StickmanProps } from "./Stickman";
import { Threads, ThreadDef, Wrap } from "./ThreadSystem";
import { joints, Pose, Pt } from "../utils/rig";

/** Where successive wraps of thread land on the body (shared by every scene so the strings stay continuous). */
export const WRAP_ORDER: { seg: string; at: number }[] = [
  { seg: "foreR", at: 0.72 }, { seg: "foreL", at: 0.72 }, { seg: "upR", at: 0.5 }, { seg: "upL", at: 0.5 },
  { seg: "torso", at: 0.3 }, { seg: "torso", at: 0.62 }, { seg: "foreR", at: 0.35 }, { seg: "foreL", at: 0.35 },
  { seg: "thighR", at: 0.5 }, { seg: "thighL", at: 0.5 }, { seg: "upR", at: 0.22 }, { seg: "upL", at: 0.22 },
  { seg: "shinR", at: 0.5 }, { seg: "shinL", at: 0.5 },
];

export const segPts = (J: ReturnType<typeof joints>, seg: string): [Pt, Pt] => {
  switch (seg) {
    case "foreR": return [J.elbowR, J.handR];
    case "foreL": return [J.elbowL, J.handL];
    case "upR": return [J.shoulder, J.elbowR];
    case "upL": return [J.shoulder, J.elbowL];
    case "torso": return [J.hip, J.neck];
    case "thighR": return [J.hipR, J.kneeR];
    case "thighL": return [J.hipL, J.kneeL];
    case "shinR": return [J.kneeR, J.footR];
    default: return [J.kneeL, J.footL];
  }
};

type Props = Omit<StickmanProps, "pose" | "scale"> & {
  pose: Pose;
  scale?: number;
  frame: number;
  /** number of wraps (can be fractional: the last one is "born" mid-way) */
  wraps: number;
  /** 0..1 how tight the strings are (or a per-string function) */
  tension: number | ((k: number) => number);
  /** show strings running off to anchors */
  strings?: boolean;
  /** only draw the first N strings (default: all wraps) */
  stringCount?: number;
  /** anchor reach (px): strings run to x ± reach */
  reach?: number;
  anchorY?: number;
  dark?: boolean;
  threadOpacity?: number;
};

/** The protagonist with the visible strings wound around him. */
export const BoundHero: React.FC<Props> = ({ pose, scale = 1.5, frame, wraps, tension, strings = true, stringCount, reach = 260, anchorY, dark = false, threadOpacity = 1, ...rest }) => {
  const J = joints(pose, rest.x, rest.ground, scale, 0);
  const tf = (k: number) => (typeof tension === "function" ? tension(k) : tension);
  const tAvg = typeof tension === "function" ? tension(0) : tension;
  const n = Math.floor(wraps);
  const frac = wraps - n;
  const total = Math.min(WRAP_ORDER.length, Math.ceil(wraps));
  const items = WRAP_ORDER.slice(0, total).map((w, k) => {
    const [a, b] = segPts(J, w.seg);
    const grow = k < n ? 1 : frac;
    return { a, b, at: w.at, k, grow };
  });
  const sc = Math.min(stringCount ?? total, 7);
  const defs: ThreadDef[] = items.slice(0, sc).map(({ a, b, at, k, grow }) => {
    const from: Pt = [a[0] + (b[0] - a[0]) * at, a[1] + (b[1] - a[1]) * at];
    const side = k % 2 ? 1 : -1;
    const to: Pt = [rest.x + side * (reach + k * 60 + (k % 3) * 90), (anchorY ?? -420) + (k % 3) * 60];
    return { from, to, born: 0, draw: grow, tension: tf(k), sag: 120, width: 2, color: dark ? "#0a0a0a" : undefined, opacity: 0.9 * threadOpacity };
  });
  return (
    <g>
      <Stickman {...rest} pose={pose} scale={scale} tremble={rest.tremble ?? tAvg * 2} />
      {items.map(({ a, b, at, k, grow }) => (
        <Wrap key={k} a={a} b={b} at={at} born={-100} frame={frame} tight={tAvg} turns={Math.max(1, Math.round(4 * grow))} dark={dark} />
      ))}
      {strings && <Threads frame={frame} defs={defs} seed={9} />}
    </g>
  );
};
