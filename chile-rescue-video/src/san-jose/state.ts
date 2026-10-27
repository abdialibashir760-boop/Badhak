import {
  E,
  FLOOR_OFF,
  HOLE_STALL0,
  HOLE_TARGET,
  Pt,
  RIGS,
  SHAFT,
  SHELTER,
  T,
  clamp,
  lerp,
  pathAt,
  prog,
  easeOut,
  rng,
} from "./geo";

/** The hook (first ~12 s) shows the *end state*: rubble, probes, miners seated. */
export const inHook = (t: number) => t < T("s1");
export const isCollapsed = (t: number) => inHook(t) || t >= T("c3");

export const truckF = (t: number) => prog(t, T("s4") + 0.2, E("s6") + 0.2) * 0.985;

/** 0 → 1 slide of the loose rock block. */
export const blockSlide = (t: number) => {
  const u = clamp((t - T("c2")) / 1.5);
  return u * u;
};

// ---- Drill holes -------------------------------------------------------------
export const holesVisible = (t: number) => inHook(t) || t >= T("d1") - 0.6;
export const rigsVisible = (t: number) => inHook(t) || t >= T("d1") - 1.5;
export const drilling = (t: number) => inHook(t) || (t >= T("d1") && t < E("b2"));

/** Depth (world y) of drill bit i. Negative = above ground. */
export function holeDepth(i: number, t: number): number {
  const target = i === 0 ? HOLE_STALL0 : HOLE_TARGET[i];
  if (inHook(t)) return target;
  const p = prog(t, T("d1") + 0.6, E("d3") + 1.2);
  let d = target * p;
  if (i === 0) {
    if (t >= T("b1")) d = lerp(HOLE_STALL0, HOLE_TARGET[0], prog(t, T("b1") + 0.3, T("b2") + 0.4));
    if (t >= T("b6")) d = lerp(HOLE_TARGET[0], -62, prog(t, T("b6") + 0.2, T("b7") + 0.5));
  }
  return d;
}
/** The raised bit swings out beside the mast so the note is visible. */
export const bitX = (i: number, t: number) => {
  if (i !== 0 || t < T("b6")) return RIGS[i];
  return RIGS[0] + 54 * prog(t, T("b7") - 0.4, T("b7") + 0.9);
};

// ---- Miners -----------------------------------------------------------------------
export const N_MINERS = 33;
export const LEADER = 32;

export type MinerState = { p: Pt; pose: "stand" | "walk" | "sit" | "lie" | "cheer" | "climb"; facing: 1 | -1 };

const seats: Pt[] = (() => {
  const out: Pt[] = [];
  for (let i = 0; i < 32; i++) {
    const r = Math.floor(i / 11);
    const c = i % 11;
    out.push([478 + c * 25 + (r % 2) * 11, SHELTER.y1 - 1 + r * 5]);
  }
  out.push([440, SHELTER.y1 - 1]); // leader stands by the table
  return out;
})();
export const seatOf = (i: number): Pt => seats[i];

const door: Pt = [772, 1773 + FLOOR_OFF];
const groupOf = (i: number): Pt => {
  const col = i % 11;
  const row = Math.floor(i / 11);
  return [lerp(985, 800, col / 10) + row * 6, 1773 + FLOOR_OFF - 2 - row * 4];
};

const CLIMBERS = 4;
export const isClimber = (i: number) => i < CLIMBERS;

export function minerState(i: number, t: number): MinerState {
  const seat = seats[i];
  const seated = i === LEADER ? "stand" : "sit";
  const lieDown = t >= T("d6") + 0.4 && t < T("b2") + 0.2 && i !== LEADER;
  const celebrate = t >= T("b11") && t < E("b11") + 1.2;
  if (inHook(t)) return { p: seat, pose: seated, facing: i === LEADER ? 1 : -1 };

  const g = groupOf(i);
  const mv = clamp((t - (T("sh2") + i * 0.045)) / 1.5);
  if (mv >= 1) {
    const pose = celebrate ? "cheer" : lieDown ? "lie" : seated;
    return { p: seat, pose, facing: i === LEADER ? 1 : -1 };
  }
  if (mv > 0) {
    const p: Pt = mv < 0.5 ? [lerp(g[0], door[0], mv * 2), lerp(g[1], door[1], mv * 2)] : [lerp(door[0], seat[0], mv * 2 - 1), lerp(door[1], seat[1], mv * 2 - 1)];
    return { p, pose: "walk", facing: -1 };
  }
  if (isClimber(i) && t >= T("l1") && t < T("sh1")) {
    const yBottom = SHAFT.y1 + 10;
    const yTop = SHAFT.ladderTop + 36 + i * 24; // they stop where the ladder ends
    const up = prog(t, T("l1") + i * 0.35, E("l2") + 0.6);
    const down = prog(t, E("l3"), T("sh1") - 0.2);
    const y = down > 0 ? lerp(yTop, yBottom, down) : lerp(yBottom, yTop, up);
    return { p: [SHAFT.x + (i % 2 ? 4 : -4), y], pose: "climb", facing: 1 };
  }
  return { p: g, pose: "stand", facing: -1 };
}

export const minerLook = (i: number) => {
  const r = rng(100 + i);
  const skins = ["#e2b08a", "#c68a62", "#a8694a", "#8a5236", "#f0c8a4"];
  const suits = ["#f0892a", "#f0892a", "#e8761c", "#2f6fb2", "#f0892a", "#d9d3c4"];
  const helm = ["#f5c518", "#f5c518", "#f5c518", "#e8e8e8", "#ef6c1f"];
  return {
    skin: skins[Math.floor(r() * skins.length)],
    suit: suits[Math.floor(r() * suits.length)],
    helmet: i === LEADER ? "#ffffff" : helm[Math.floor(r() * helm.length)],
  };
};

/** Sky: 1 = day, 0 = pre-dawn. */
export const dayness = (t: number) =>
  1 - 0.88 * prog(t, T("b1") - 0.4, T("b1") + 0.4) + 0.88 * prog(t, T("b6") - 0.2, T("b7") + 0.8);

export const shake = (t: number): number => {
  const pulse = (a: number, d: number, amp: number) => (t >= a && t < a + d ? amp * (1 - (t - a) / d) : 0);
  const ramp = t >= T("c1") + 0.2 && t < T("c3") ? 2 + 7 * clamp((t - T("c2")) / 2.5) : 0;
  return ramp + pulse(T("c3"), 2.2, 20) + pulse(T("u4") + 0.1, 2.4, 11) + pulse(T("b2") + 0.1, 0.9, 6);
};

export { easeOut };
