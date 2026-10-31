import { interpolate, spring } from "remotion";

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  bg: "#0b1220",
  bg2: "#111c33",
  road: "#1b2538",
  roadLine: "#e5e7eb",
  text: "#f8fafc",
  dim: "#94a3b8",
  accent: "#fbbf24", // speed / highlight
  wave: "#38bdf8", // radar
  laser: "#f43f5e",
  ok: "#22c55e",
  bad: "#ef4444",
  card: "#16223d",
  cardLine: "#2a3b61",
};

export const FONT =
  "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

/** 0 → 1 pop-in that starts at `at` seconds (local time). */
export const pop = (frame: number, fps: number, at: number, damping = 14) =>
  spring({
    frame: frame - at * fps,
    fps,
    config: { damping, stiffness: 140, mass: 0.7 },
  });

/** Linear ramp 0 → 1 between two local times (seconds). */
export const ramp = (
  frame: number,
  fps: number,
  from: number,
  to: number,
  easing?: (t: number) => number,
) =>
  interpolate(frame / fps, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
