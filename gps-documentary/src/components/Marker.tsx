import React from "react";
import { DEG, R_EARTH } from "../engine/geo";
import { addScaled, basisFrom, clamp01, easeInOut, mul, easeOutBack, easeOutCubic, lerp, pathD, project, projectRuns, smoothstep, type Cam, type V3 } from "../engine/math3d";
import { PHONE_POS, PHONE_UP } from "../engine/world";
import { groundRing, onSurfaceVisible } from "./Signals";

export const MINT = "#7dffc0";
export const LOCK_R = 235; // km, radius of the locked reticle ring

const TAU = Math.PI * 2;

/** Projected pin tip and pixel-per-km scale, used by the HUD to anchor the fix card. */
export function pinAnchor(cam: Cam) {
  const p = project(cam, addScaled(PHONE_POS, PHONE_UP, 14));
  return { x: p.x, y: p.y, s: p.ok ? cam.F / p.z : 1, ok: p.ok };
}

function arcPoints(r: number, a0: number, a1: number, n = 10): V3[] {
  const [e1, e2] = basisFrom(PHONE_UP);
  const ang = r / R_EARTH;
  const rad = R_EARTH + 0.8;
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const dir = addScaled(addScaled(mul(PHONE_UP, Math.cos(ang)), e1, Math.sin(ang) * Math.cos(a)), e2, Math.sin(ang) * Math.sin(a));
    out.push(mul(dir, rad));
  }
  return out;
}

/** ret = 0..1 progress of the converging reticle; lockT = seconds since lock (negative before). */
export const Marker: React.FC<{ cam: Cam; ret: number; lockT: number }> = ({ cam, ret, lockT }) => {
  if (ret <= 0 && lockT < 0) return null;
  const L = lockT;
  const out: React.ReactNode[] = [];
  const all = onSurfaceVisible(cam);

  // ---- converging reticle while the three distances are being solved
  const p = easeInOut(clamp01(ret));
  const retA = smoothstep(0, 0.06, ret) * (L < 0 ? 1 : clamp01(1 - L / 0.2));
  if (retA > 0.01) {
    const r = lerp(1400, LOCK_R, p);
    const rot = (1 - p) * 80 * DEG;
    let d = "";
    for (let i = 0; i < 4; i++) {
      const a = (i * TAU) / 4 + rot;
      d += pathD(projectRuns(cam, arcPoints(r, a - 0.34, a + 0.34), all));
      // short radial tick pointing at the centre
      d += pathD(projectRuns(cam, [arcPoints(r * 0.84, a, a, 1)[0], arcPoints(r * 1.12, a, a, 1)[0]], all));
    }
    const thin = pathD(projectRuns(cam, arcPoints(r, 0, TAU, 72), all));
    out.push(
      <g key="ret" opacity={retA}>
        <path d={thin} fill="none" stroke="#e8fbff" strokeWidth={1} opacity={0.35} />
        <path d={d} fill="none" stroke="#e8fbff" strokeWidth={2.6} strokeLinecap="round" />
      </g>,
    );
  }

  // ---- lock
  if (L >= 0) {
    const flash = clamp01(1 - L / 0.45);
    const c = project(cam, addScaled(PHONE_POS, PHONE_UP, 14));
    if (c.ok && flash > 0) {
      out.push(<circle key="flash" cx={c.x} cy={c.y} r={40 + 150 * (1 - flash)} fill="#fff" opacity={flash * 0.8} filter="url(#blur20)" />);
    }
    for (let i = 0; i < 3; i++) {
      const τ = (L - 0.1 * i) / 1.1;
      if (τ <= 0 || τ >= 1) continue;
      const d = pathD(projectRuns(cam, groundRing(LOCK_R + 1000 * easeOutCubic(τ), 0.8, 96), all));
      out.push(<path key={`burst${i}`} d={d} fill="none" stroke={MINT} strokeWidth={3} opacity={(1 - τ) ** 1.3} />);
    }
    // settled ring with ticks
    const ringA = easeOutCubic(clamp01(L / 0.35));
    const ring = pathD(projectRuns(cam, arcPoints(LOCK_R, 0, TAU, 96), all));
    let ticks = "";
    for (let i = 0; i < 12; i++) {
      const a = (i * TAU) / 12 + L * 0.35;
      ticks += pathD(projectRuns(cam, [arcPoints(LOCK_R * 1.05, a, a, 1)[0], arcPoints(LOCK_R * 1.22, a, a, 1)[0]], all));
    }
    out.push(
      <g key="ring" opacity={ringA}>
        <path d={ring} fill="rgba(125,255,192,0.12)" stroke={MINT} strokeWidth={3} />
        <path d={ticks} fill="none" stroke={MINT} strokeWidth={2} strokeLinecap="round" opacity={0.85} />
      </g>,
    );
    // soft heartbeat after the lock
    if (L > 0.9) {
      const τ = ((L - 0.9) * 0.7) % 1;
      const d = pathD(projectRuns(cam, groundRing(LOCK_R + 420 * τ, 0.8, 96), all));
      out.push(<path key="beat" d={d} fill="none" stroke={MINT} strokeWidth={2} opacity={(1 - τ) * 0.55} />);
    }

    // ---- light column + map pin dropping onto the fix
    const tip = addScaled(PHONE_POS, PHONE_UP, 14);
    const top = addScaled(PHONE_POS, PHONE_UP, 14 + 700);
    const a = project(cam, tip);
    const b = project(cam, top);
    const colA = easeOutCubic(clamp01(L / 0.5));
    if (a.ok && b.ok) {
      const w = Math.max(2, 26 * (cam.F / a.z));
      out.push(
        <g key="col" opacity={colA * 0.9}>
          <defs>
            <linearGradient id="colGrad" gradientUnits="userSpaceOnUse" x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
              <stop offset="0" stopColor={MINT} stopOpacity={0.85} />
              <stop offset="1" stopColor={MINT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="url(#colGrad)" strokeWidth={w} strokeLinecap="round" />
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fff" strokeWidth={Math.max(1, w * 0.18)} opacity={0.7} />
        </g>,
      );
    }
    const drop = (1 - easeOutBack(clamp01(L / 0.62))) * 420;
    const pin = project(cam, addScaled(PHONE_POS, PHONE_UP, 14 + Math.max(-30, drop)));
    if (pin.ok) {
      const s = cam.F / pin.z;
      const H = 118 * s;
      const Wd = 0.64 * H;
      const pa = clamp01(L / 0.12);
      const d = `M0 0 C ${-0.2 * Wd} ${-0.3 * H} ${-0.5 * Wd} ${-0.45 * H} ${-0.5 * Wd} ${-0.68 * H} A ${0.5 * Wd} ${0.5 * Wd} 0 0 1 ${0.5 * Wd} ${-0.68 * H} C ${0.5 * Wd} ${-0.45 * H} ${0.2 * Wd} ${-0.3 * H} 0 0 Z`;
      out.push(
        <g key="pin" transform={`translate(${pin.x.toFixed(1)} ${pin.y.toFixed(1)})`} opacity={pa}>
          <defs>
            <linearGradient id="pinGrad" gradientUnits="userSpaceOnUse" x1="0" y1={-H} x2="0" y2="0">
              <stop offset="0" stopColor="#d8ffec" />
              <stop offset="0.55" stopColor={MINT} />
              <stop offset="1" stopColor="#12b36f" />
            </linearGradient>
          </defs>
          <path d={d} fill={MINT} opacity={0.6} filter="url(#blur20)" />
          <path d={d} fill="url(#pinGrad)" stroke="#eafff5" strokeWidth={Math.max(1.2, H * 0.015)} strokeLinejoin="round" />
          <circle cx={0} cy={-0.68 * H} r={0.2 * Wd} fill="#052a1b" />
          <circle cx={0} cy={-0.68 * H} r={0.09 * Wd} fill="#eafff5" />
        </g>,
      );
    }
  }
  return <g style={{ mixBlendMode: "normal" }}>{out}</g>;
};
