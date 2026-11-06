import React from "react";
import { R_EARTH } from "../engine/geo";
import { add, addScaled, basisFrom, clamp01, dot, easeOutCubic, hiddenByEarth, len, mul, pathD, project, projectRuns, smoothstep, sub, type Cam, type V3 } from "../engine/math3d";
import { PHONE_POS, PHONE_UP, type Sat } from "../engine/world";
import { useShot } from "./context";

const R = R_EARTH;
const TAU = Math.PI * 2;
/** Time-lapsed wavefront speed (real: 299,792 km/s) and the gap between broadcast wavefronts, s. */
export const WAVE_SPEED = 6800;
export const WAVE_GAP = 0.8;

const ringPoints = (center: V3, e1: V3, e2: V3, radius: number, n: number): V3[] => {
  const pts: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    pts.push(addScaled(addScaled(center, e1, Math.cos(a) * radius), e2, Math.sin(a) * radius));
  }
  return pts;
};

/** Circle on the Earth's surface where a sphere of radius ρ around S meets the ground. */
export function rangeCircle(S: V3, rho: number): V3[] | null {
  const Sl = len(S);
  const cosA = (R * R + Sl * Sl - rho * rho) / (2 * R * Sl);
  if (cosA >= 1 || cosA <= R / Sl) return null;
  const α = Math.acos(cosA);
  const sh = mul(S, 1 / Sl);
  const [e1, e2] = basisFrom(sh);
  return ringPoints(mul(sh, R * 1.0012 * Math.cos(α)), e1, e2, R * 1.0012 * Math.sin(α), 160);
}

/** Circle on the curved surface around the phone: `radius` km of ground distance, lifted `lift` km. */
export function groundRing(radius: number, lift = 0.6, n = 96): V3[] {
  const [e1, e2] = basisFrom(PHONE_UP);
  const a = Math.min(radius / R, 3);
  return ringPoints(mul(PHONE_UP, (R + lift) * Math.cos(a)), e1, e2, (R + lift) * Math.sin(a), n);
}
export const onSurfaceVisible = (cam: Cam) => (p: V3) => dot(p, cam.pos) > dot(p, p) * 1.0000005;
const strokeRuns = (cam: Cam, pts: V3[], vis: (p: V3) => boolean) => pathD(projectRuns(cam, pts, vis));

export const GlowGroup: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => (
  <g filter="url(#glow)" style={{ mixBlendMode: "screen" }} opacity={opacity}>{children}</g>
);

// ─────────────────────────── broadcast cones (spherical wavefronts leaving the nadir antenna)
export type ConeSpec = { sat: Sat; S: V3; launch: number; fade?: number };

export const Cones: React.FC<{ cam: Cam; t: number; cones: ConeSpec[]; ripples?: number; spokes?: boolean; gap?: number }> = ({ cam, t, cones, ripples = 0, spokes = true, gap = WAVE_GAP }) => {
  const vis = (p: V3) => len(p) > R * 1.003 && !hiddenByEarth(cam.pos, p, R);
  const surf = onSurfaceVisible(cam);
  const layers: React.ReactNode[] = [];
  for (const c of cones) {
    const { sat: s, S } = c;
    const fadeAll = c.fade ?? 1;
    if (t < c.launch - 0.05 || fadeAll <= 0.01) continue;
    const Sl = len(S);
    const nadir = mul(S, -1 / Sl);
    const [e1, e2] = basisFrom(nadir);
    const αl = Math.asin(R / Sl);
    const dNadir = Sl - R;
    const rhoLimb = Math.sqrt(Sl * Sl - R * R);
    const k0 = t - c.launch;
    const rings: React.ReactNode[] = [];
    for (let k = 0; ; k++) {
      const rho = WAVE_SPEED * (k0 - k * gap);
      if (rho <= 0) break;
      if (rho > rhoLimb + 600) continue;
      const fade = smoothstep(400, 3200, rho) * (k === 0 ? 1.15 : 1) * (1 - 0.5 * clamp01(rho / dNadir)) * fadeAll;
      [{ f: 1, w: 2.4, o: 0.95 }, { f: 0.62, w: 1.6, o: 0.6 }, { f: 0.28, w: 1.1, o: 0.38 }].forEach((r, i) => {
        const α = αl * r.f;
        const d = strokeRuns(cam, ringPoints(addScaled(S, nadir, rho * Math.cos(α)), e1, e2, rho * Math.sin(α), 72), vis);
        if (d) rings.push(<path key={`${k}-${i}`} d={d} fill="none" stroke={s.color} strokeWidth={r.w} opacity={Math.min(1, r.o * fade)} />);
      });
      if (ripples > 0 && k > 0 && rho > dNadir && rho < rhoLimb) {
        const pts = rangeCircle(S, rho);
        if (pts) {
          const α = Math.acos((R * R + Sl * Sl - rho * rho) / (2 * R * Sl));
          const a = (1 - α / Math.acos(R / Sl)) ** 0.8 * smoothstep(0.01, 0.07, α) * 0.5 * ripples * fadeAll;
          const d = strokeRuns(cam, pts, surf);
          if (d) rings.push(<path key={`rip${k}`} d={d} fill="none" stroke={s.color} strokeWidth={1.8} opacity={a} />);
        }
      }
    }
    let sp = "";
    if (spokes) {
      const reach = Math.min(WAVE_SPEED * k0, rhoLimb);
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * TAU;
        const dir = add(mul(nadir, Math.cos(αl)), mul(add(mul(e1, Math.cos(a)), mul(e2, Math.sin(a))), Math.sin(αl)));
        sp += strokeRuns(cam, [S, addScaled(S, dir, reach * 0.5), addScaled(S, dir, reach)], vis);
      }
    }
    layers.push(
      <g key={s.id}>
        {spokes && <path d={sp} fill="none" stroke={s.color} strokeWidth={1} opacity={0.14 * fadeAll} />}
        {rings}
      </g>,
    );
  }
  return <GlowGroup>{layers}</GlowGroup>;
};

// ─────────────────────────── range circles (a sphere around a satellite meeting the ground)
export type CircleSpec = { S: V3; rho: number; color: string; alpha?: number; width?: number };
export const RangeCircles: React.FC<{ cam: Cam; circles: CircleSpec[]; pulseT?: number }> = ({ cam, circles, pulseT = 0 }) => {
  const surf = onSurfaceVisible(cam);
  return (
    <GlowGroup>
      {circles.map((c, i) => {
        const pts = rangeCircle(c.S, c.rho);
        if (!pts) return null;
        const d = strokeRuns(cam, pts, surf);
        if (!d) return null;
        const a = (c.alpha ?? 1) * (0.88 + 0.12 * Math.sin(pulseT * 5 + i));
        const w = c.width ?? 1;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={c.color} strokeWidth={7 * w} opacity={0.35 * a} />
            <path d={d} fill="none" stroke={c.color} strokeWidth={2.8 * w} opacity={a} />
            <path d={d} fill="none" stroke="#fff" strokeWidth={0.9} opacity={0.55 * a} />
          </g>
        );
      })}
    </GlowGroup>
  );
};

// ─────────────────────────── beams (satellite → phone ray) with travelling packets
export type BeamSpec = { sat: Sat; S: V3; P?: V3; q: number; packetsT?: number | null };
export const Beams: React.FC<{ cam: Cam; beams: BeamSpec[] }> = ({ cam, beams }) => {
  const { id: sid } = useShot();
  const beamVis = (p: V3) => !hiddenByEarth(cam.pos, p, R * 0.996);
  const defs: React.ReactNode[] = [];
  const out: React.ReactNode[] = [];
  for (const b of beams) {
    const q = easeOutCubic(clamp01(b.q));
    if (q <= 0) continue;
    const P = b.P ?? PHONE_POS;
    const end = addScaled(b.S, sub(P, b.S), q);
    const pts: V3[] = [];
    for (let i = 0; i <= 28; i++) pts.push(addScaled(b.S, sub(end, b.S), i / 28));
    const runs = projectRuns(cam, pts, beamVis);
    const d = pathD(runs);
    if (!d || !runs.length) continue;
    const first = runs[0][0];
    const lastRun = runs[runs.length - 1];
    const last = lastRun[lastRun.length - 1];
    const gid = `${sid}-beam${b.sat.id}`;
    defs.push(
      <linearGradient key={gid} id={gid} gradientUnits="userSpaceOnUse" x1={first[0]} y1={first[1]} x2={last[0]} y2={last[1]}>
        <stop offset="0" stopColor={b.sat.color} stopOpacity={0.15} />
        <stop offset="0.6" stopColor={b.sat.color} stopOpacity={0.75} />
        <stop offset="1" stopColor={b.sat.color} stopOpacity={1} />
      </linearGradient>,
    );
    const head = project(cam, end);
    const packets: React.ReactNode[] = [];
    if (b.packetsT != null && b.packetsT >= 0) {
      for (let j = 0; j < 5; j++) {
        const f = (((b.packetsT * 0.62 + j / 5) % 1) + 1) % 1;
        const p = project(cam, addScaled(b.S, sub(P, b.S), f));
        if (!p.ok) continue;
        const o = Math.sin(Math.PI * f) ** 0.6;
        packets.push(<circle key={j} cx={p.x} cy={p.y} r={3.4 + 2.2 * f} fill="#fff" opacity={o} />);
        packets.push(<circle key={`g${j}`} cx={p.x} cy={p.y} r={9 + 5 * f} fill={b.sat.color} opacity={0.5 * o} />);
      }
    }
    out.push(
      <g key={b.sat.id}>
        <path d={d} fill="none" stroke={b.sat.color} strokeWidth={10} opacity={0.2} strokeLinecap="round" />
        <path d={d} fill="none" stroke={`url(#${gid})`} strokeWidth={3} strokeLinecap="round" />
        <path d={d} fill="none" stroke="#fff" strokeWidth={1.1} opacity={0.8} strokeLinecap="round" />
        {packets}
        {q < 1 && head.ok && (
          <>
            <circle cx={head.x} cy={head.y} r={16} fill={b.sat.color} opacity={0.55} />
            <circle cx={head.x} cy={head.y} r={6} fill="#fff" />
          </>
        )}
      </g>,
    );
  }
  return (
    <>
      <defs>{defs}</defs>
      <GlowGroup>{out}</GlowGroup>
    </>
  );
};

/** Expanding ring on the ground around the phone (reception pulse). τ = 0..1. */
export const ReceptionPulse: React.FC<{ cam: Cam; tau: number; color: string }> = ({ cam, tau, color }) => {
  if (tau <= 0 || tau >= 1) return null;
  const d = strokeRuns(cam, groundRing(70 + 520 * easeOutCubic(tau)), onSurfaceVisible(cam));
  return d ? <path d={d} fill="none" stroke={color} strokeWidth={2.4} opacity={(1 - tau) * 0.9} /> : null;
};
