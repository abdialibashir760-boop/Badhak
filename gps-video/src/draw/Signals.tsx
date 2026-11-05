import React from "react";
import { R_EARTH } from "../geo";
import {
  add,
  addScaled,
  basisFrom,
  clamp01,
  dot,
  easeOutCubic,
  hiddenByEarth,
  len,
  mul,
  pathD,
  project,
  projectRuns,
  smoothstep,
  sub,
  type Cam,
  type Pt,
  type V3,
} from "../math3d";
import { PHONE_POS, PHONE_UP, SATS, satPosition, slantRange, WAVE_GAP, WAVE_SPEED, type Sat } from "../orbit";

const R = R_EARTH;
const TAU = Math.PI * 2;

const ringPoints = (center: V3, e1: V3, e2: V3, radius: number, n: number): V3[] => {
  const pts: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    pts.push(addScaled(addScaled(center, e1, Math.cos(a) * radius), e2, Math.sin(a) * radius));
  }
  return pts;
};

/** Circle on the Earth's surface where a sphere of radius ρ around the satellite meets the ground. */
export function rangeCircle(S: V3, rho: number): V3[] | null {
  const Sl = len(S);
  const cosA = (R * R + Sl * Sl - rho * rho) / (2 * R * Sl);
  if (cosA >= 1 || cosA <= R / Sl) return null;
  const α = Math.acos(cosA);
  const sh = mul(S, 1 / Sl);
  const [e1, e2] = basisFrom(sh);
  const centre = mul(sh, R * 1.0012 * Math.cos(α));
  return ringPoints(centre, e1, e2, R * 1.0012 * Math.sin(α), 160);
}

/** Circle on the Earth's curved surface around the phone: `radius` km of ground distance, lifted `lift` km. */
export function groundRing(radius: number, lift = 0.6, n = 96): V3[] {
  const [e1, e2] = basisFrom(PHONE_UP);
  const a = Math.min(radius / R, 3);
  const centre = mul(PHONE_UP, (R + lift) * Math.cos(a));
  return ringPoints(centre, e1, e2, (R + lift) * Math.sin(a), n);
}

/** Visibility predicate for points lying on (or just above) the Earth's surface. */
export const onSurfaceVisible = (cam: Cam) => (p: V3) => dot(p, cam.pos) > dot(p, p) * 1.0000005;

const strokeRuns = (cam: Cam, pts: V3[], vis: (p: V3) => boolean) => pathD(projectRuns(cam, pts, vis));

export const Signals: React.FC<{ cam: Cam; t: number }> = ({ cam, t }) => {
  const rippleFade = 1 - smoothstep(6.6, 7.6, t);
  // the three range circles swell slightly as they converge on the fix
  const boost = 1 + 0.9 * smoothstep(7.0, 8.0, t);
  const surfaceVisible = (p: V3) => dot(p, cam.pos) > R * R * 1.0034;
  const vis = (p: V3) => len(p) > R * 1.003 && !hiddenByEarth(cam.pos, p, R);
  const beamVis = (p: V3) => !hiddenByEarth(cam.pos, p, R * 0.996);

  const defs: React.ReactNode[] = [];
  const layers: React.ReactNode[] = [];

  for (const s of SATS) {
    if (t < s.launch - 0.05) continue;
    const S = satPosition(s, t);
    const Sl = len(S);
    const nadir = mul(S, -1 / Sl);
    const [e1, e2] = basisFrom(nadir);
    const αl = Math.asin(R / Sl);
    const dNadir = Sl - R;
    const rhoLimb = Math.sqrt(Sl * Sl - R * R);
    const k0 = t - s.launch;
    // The broadcast cone is the star until this satellite's signal reaches the phone, then it steps back.
    const coneFade = 1 - smoothstep(s.arrive - 0.3, s.arrive + 0.9, t);

    // ---- spherical wavefronts leaving the nadir-pointing antenna (cone half-angle ≈ 13.9°)
    const rings: React.ReactNode[] = [];
    for (let k = 0; ; k++) {
      const rho = WAVE_SPEED * (k0 - k * WAVE_GAP);
      if (rho <= 0) break;
      if (rho > rhoLimb + 600) continue;
      const fade = smoothstep(400, 3200, rho) * (k === 0 ? 1.15 : 1) * (1 - 0.5 * clamp01(rho / dNadir)) * coneFade;
      [
        { f: 1, w: 2.4, o: 0.95 },
        { f: 0.62, w: 1.6, o: 0.6 },
        { f: 0.28, w: 1.1, o: 0.38 },
      ].forEach((r, i) => {
        const α = αl * r.f;
        const c = addScaled(S, nadir, rho * Math.cos(α));
        const d = strokeRuns(cam, ringPoints(c, e1, e2, rho * Math.sin(α), 72), vis);
        if (d) rings.push(<path key={`${k}-${i}`} d={d} fill="none" stroke={s.color} strokeWidth={r.w} opacity={Math.min(1, r.o * fade)} />);
      });

      // ripple where this wavefront meets the ground
      if (k > 0 && rippleFade * coneFade > 0.01 && rho > dNadir && rho < rhoLimb) {
        const pts = rangeCircle(S, rho);
        if (pts) {
          const α = Math.acos((R * R + Sl * Sl - rho * rho) / (2 * R * Sl));
          const a = (1 - α / Math.acos(R / Sl)) ** 0.8 * smoothstep(0.01, 0.07, α) * 0.5 * rippleFade * coneFade;
          const d = strokeRuns(cam, pts, surfaceVisible);
          if (d) rings.push(<path key={`rip${k}`} d={d} fill="none" stroke={s.color} strokeWidth={1.8} opacity={a} />);
        }
      }
    }

    // cone edge lines
    const reach = Math.min(WAVE_SPEED * k0, rhoLimb);
    let spokes = "";
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * TAU;
      const dir = add(mul(nadir, Math.cos(αl)), mul(add(mul(e1, Math.cos(a)), mul(e2, Math.sin(a))), Math.sin(αl)));
      spokes += strokeRuns(cam, [S, addScaled(S, dir, reach * 0.5), addScaled(S, dir, reach)], vis);
    }

    // ---- the first wavefront's range circle on the Earth: where the phone must be (distance = c × Δt)
    const slant = slantRange(s, t);
    const rho0 = Math.min(WAVE_SPEED * k0, slant);
    let circle: React.ReactNode = null;
    if (rho0 > dNadir + 30) {
      const pts = rangeCircle(S, rho0);
      if (pts) {
        const d = strokeRuns(cam, pts, surfaceVisible);
        const arrived = t >= s.arrive;
        const pulse = arrived ? 0.82 + 0.18 * Math.sin((t - s.arrive) * 5) : 1;
        if (d) {
          circle = (
            <g>
              <path d={d} fill="none" stroke={s.color} strokeWidth={(arrived ? 7 : 5) * boost} opacity={0.35 * pulse} />
              <path d={d} fill="none" stroke={s.color} strokeWidth={(arrived ? 2.8 : 2.2) * (0.8 + 0.2 * boost)} opacity={pulse} />
              <path d={d} fill="none" stroke="#fff" strokeWidth={0.9} opacity={0.55 * pulse} />
            </g>
          );
        }
      }
    }

    // ---- the ray to the phone, drawn as the signal is "received"
    let beam: React.ReactNode = null;
    const q = easeOutCubic(clamp01((t - (s.arrive - 0.45)) / 0.45));
    if (q > 0) {
      const end = addScaled(S, sub(PHONE_POS, S), q);
      const pts: V3[] = [];
      for (let i = 0; i <= 28; i++) pts.push(addScaled(S, sub(end, S), i / 28));
      const runs = projectRuns(cam, pts, beamVis);
      const d = pathD(runs);
      if (d && runs.length) {
        const first = runs[0][0];
        const lastRun = runs[runs.length - 1];
        const last = lastRun[lastRun.length - 1];
        const gid = `beam${s.id}`;
        defs.push(
          <linearGradient key={gid} id={gid} gradientUnits="userSpaceOnUse" x1={first[0]} y1={first[1]} x2={last[0]} y2={last[1]}>
            <stop offset="0" stopColor={s.color} stopOpacity={0.15} />
            <stop offset="0.6" stopColor={s.color} stopOpacity={0.75} />
            <stop offset="1" stopColor={s.color} stopOpacity={1} />
          </linearGradient>,
        );
        const head = project(cam, end);
        const packets: React.ReactNode[] = [];
        if (t > s.arrive) {
          for (let j = 0; j < 5; j++) {
            const f = (((t - s.arrive) * 0.62 + j / 5) % 1 + 1) % 1;
            const P = project(cam, addScaled(S, sub(PHONE_POS, S), f));
            if (!P.ok) continue;
            const o = Math.sin(Math.PI * f) ** 0.6;
            packets.push(<circle key={j} cx={P.x} cy={P.y} r={3.4 + 2.2 * f} fill="#fff" opacity={o} />);
            packets.push(<circle key={`g${j}`} cx={P.x} cy={P.y} r={9 + 5 * f} fill={s.color} opacity={0.5 * o} />);
          }
        }
        beam = (
          <g>
            <path d={d} fill="none" stroke={s.color} strokeWidth={10} opacity={0.2} strokeLinecap="round" />
            <path d={d} fill="none" stroke={`url(#${gid})`} strokeWidth={3} strokeLinecap="round" />
            <path d={d} fill="none" stroke="#fff" strokeWidth={1.1} opacity={0.8} strokeLinecap="round" />
            {packets}
            {q < 1 && head.ok && (
              <>
                <circle cx={head.x} cy={head.y} r={16} fill={s.color} opacity={0.55} />
                <circle cx={head.x} cy={head.y} r={6} fill="#fff" />
              </>
            )}
          </g>
        );
      }
    }

    // ---- reception pulse around the phone
    let hit: React.ReactNode = null;
    const τ = (t - s.arrive) / 1.1;
    if (τ > 0 && τ < 1) {
      const e = easeOutCubic(τ);
      const d = strokeRuns(cam, groundRing(70 + 520 * e), onSurfaceVisible(cam));
      if (d) hit = <path d={d} fill="none" stroke={s.color} strokeWidth={2.4} opacity={(1 - τ) * 0.9} />;
    }

    layers.push(
      <g key={s.id}>
        <path d={spokes} fill="none" stroke={s.color} strokeWidth={1} opacity={0.14 * coneFade} />
        {circle}
        {rings}
        {hit}
        {beam}
      </g>,
    );
  }

  return (
    <g>
      <defs>{defs}</defs>
      <g filter="url(#glow)" style={{ mixBlendMode: "screen" }}>
        {layers}
      </g>
    </g>
  );
};
