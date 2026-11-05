import React from "react";
import { DEG } from "../geo";
import { add, addScaled, clamp, clamp01, cross, dot, easeOutBack, len, mul, pathD, project, projectRuns, smoothstep, sub, type Cam, type Pt, type V3 } from "../math3d";
import { PHONE_POS, PHONE_UP } from "../orbit";
import { BEAT } from "../timing";
import { CAM_AZ, EAST, NORTH } from "../camera";
import { SUN } from "./Earth";
import { groundRing, onSurfaceVisible } from "./Signals";

// Deliberately enlarged: a real phone is ~0.15 m; here ~230 km so it reads from orbit-scale distances.
const SZ = 1.45;
const HL = 115 * SZ; // half length (km)
const HW = 56 * SZ; // half width
const TH = 14 * SZ; // thickness
const CR = 24 * SZ; // corner radius

const TOP_AZ = CAM_AZ + 180; // top of the phone points away from the final camera
const Y: V3 = add(mul(NORTH, Math.cos(TOP_AZ * DEG)), mul(EAST, Math.sin(TOP_AZ * DEG)));
const X: V3 = cross(Y, PHONE_UP);

function roundedRect(hw: number, hl: number, r: number, seg = 5): [number, number][] {
  const out: [number, number][] = [];
  const corners: [number, number, number][] = [
    [hw - r, hl - r, 0],
    [-(hw - r), hl - r, 90],
    [-(hw - r), -(hl - r), 180],
    [hw - r, -(hl - r), 270],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = (a0 + (90 * i) / seg) * DEG;
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  }
  return out;
}

const OUTLINE = roundedRect(HW, HL, CR);
const SCREEN = roundedRect(HW - 6 * SZ, HL - 15 * SZ, CR - 6 * SZ);
const NOTCH = roundedRect(13 * SZ, 3.2 * SZ, 3.2 * SZ, 3).map(([x, y]) => [x, y + HL - 9.5 * SZ] as [number, number]);

const ROADS0: [number, number][][] = [
  [[-50, -34], [-12, -26], [18, -38], [50, -22]],
  [[-50, 44], [-14, 36], [8, 56], [50, 62]],
  [[-24, -100], [-18, -40], [-28, 18], [-20, 100]],
  [[30, -100], [24, -30], [34, 40], [26, 100]],
  [[-50, -92], [-4, -10], [50, 88]],
];
const WATER0: [number, number][] = [[-50, 76], [-14, 46], [14, 14], [34, -26], [50, -62]];
const sc = (pts: [number, number][]) => pts.map(([x, y]) => [x * SZ, y * SZ] as [number, number]);
const ROADS = ROADS0.map(sc);
const WATER = sc(WATER0);

export const phoneScale = (t: number) => easeOutBack(clamp01((t - BEAT.phoneIn) / 0.75));

type Poly = { pts: Pt[]; fill: string; stroke?: string; sw?: number; o?: number };

export const PhoneBase: React.FC<{ cam: Cam; t: number; D: number }> = ({ cam, t, D }) => {
  if (t < BEAT.phoneIn - 0.05) return null;
  const k = Math.max(0.0001, phoneScale(t));
  const pPx = (2 * HL * cam.F) / D; // phone length in px (roughly)
  const toBeacon = 1 - smoothstep(26, 80, pPx);
  const at = (x: number, y: number, z: number): V3 => addScaled(addScaled(addScaled(PHONE_POS, X, x * k), Y, y * k), PHONE_UP, z * k);
  const proj2 = (pts2: [number, number][], z: number): Pt[] | null => {
    const out: Pt[] = [];
    for (const [x, y] of pts2) {
      const p = project(cam, at(x, y, z));
      if (!p.ok) return null;
      out.push([p.x, p.y]);
    }
    return out;
  };
  const sw = (b: number) => Math.max(0.5, (pPx / (230 * SZ)) * b);
  const lock = smoothstep(BEAT.lock, BEAT.lock + 0.5, t);

  // ---------- ground: beacon rings + holo platform
  const age = t - BEAT.phoneIn;
  const rings: React.ReactNode[] = [];
  for (let i = 0; i < 3; i++) {
    const τ = (((age * 0.85 - i / 3) % 1) + 1) % 1;
    if (age < i / 3 * 0 - 0.01) continue;
    const d = pathD(projectRuns(cam, groundRing(40 + 760 * τ), onSurfaceVisible(cam)));
    if (d) rings.push(<path key={i} d={d} fill="none" stroke="#dff8ff" strokeWidth={1.8} opacity={(1 - τ) ** 1.6 * 0.85 * clamp01(age * 2)} />);
  }
  const platform = pathD(projectRuns(cam, groundRing(300 * k, 0.4, 72), onSurfaceVisible(cam)));
  const platformDash = pathD(projectRuns(cam, groundRing(390 * k, 0.4, 96), onSurfaceVisible(cam)));
  const centre = project(cam, addScaled(PHONE_POS, PHONE_UP, 6));

  // ---------- phone body
  const polys: Poly[] = [];
  const nrm = OUTLINE.length;
  for (let i = 0; i < nrm; i++) {
    const a = OUTLINE[i];
    const b = OUTLINE[(i + 1) % nrm];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const n = add(mul(X, dy / l), mul(Y, -dx / l));
    const mid = at((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, TH / 2);
    if (dot(n, sub(cam.pos, mid)) <= 0) continue;
    const pts = [at(a[0], a[1], 0), at(b[0], b[1], 0), at(b[0], b[1], TH), at(a[0], a[1], TH)].map((v) => project(cam, v));
    if (pts.some((p) => !p.ok)) continue;
    const lit = 0.55 + 0.9 * Math.max(0, dot(n, SUN));
    const c = clamp(Math.round(34 * lit), 0, 255);
    polys.push({ pts: pts.map((p) => [p.x, p.y] as Pt), fill: `rgb(${c},${Math.round(c * 1.18)},${Math.round(c * 1.7)})` });
  }
  const top = proj2(OUTLINE, TH);
  const screen = proj2(SCREEN, TH + 0.25);
  const notch = proj2(NOTCH, TH + 0.4);
  const detail = pPx > 38;

  // screen content
  const content: React.ReactNode[] = [];
  if (screen && detail) {
    const line = (pts2: [number, number][], stroke: string, w: number, o: number, key: string) => {
      const pp = proj2(pts2, TH + 0.4);
      if (pp) content.push(<path key={key} d={"M" + pp.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L")} fill="none" stroke={stroke} strokeWidth={sw(w)} opacity={o} strokeLinecap="round" strokeLinejoin="round" />);
    };
    for (let gx = -46; gx <= 46; gx += 23) line([[gx * SZ, -98 * SZ], [gx * SZ, 98 * SZ]], "#2a6a99", 0.8, 0.28, `gx${gx}`);
    for (let gy = -100; gy <= 100; gy += 25) line([[-50 * SZ, gy * SZ], [50 * SZ, gy * SZ]], "#2a6a99", 0.8, 0.28, `gy${gy}`);
    line(WATER, "#1c6aa0", 9, 0.85, "water");
    ROADS.forEach((r, i) => line(r, "#4aa3d8", 1.6, 0.85, `road${i}`));
    // scan line while the receiver is searching
    if (t < BEAT.lock) {
      const sy = (-96 + 192 * ((t * 0.75) % 1)) * SZ;
      line([[-48 * SZ, sy], [48 * SZ, sy]], "#7dffc0", 1.6, 0.75, "scan");
    }
  }
  const centreDotR = 6 * SZ * (1 + 0.25 * Math.sin(t * 7));

  return (
    <g>
      {/* ground platform */}
      <g filter="url(#blur3)" opacity={0.7}>
        <path d={platform} fill="none" stroke="#5fe0ff" strokeWidth={2} />
      </g>
      <path d={platform} fill="rgba(70,200,255,0.09)" stroke="#8fe9ff" strokeWidth={1.2} opacity={0.75} />
      <path d={platformDash} fill="none" stroke="#8fe9ff" strokeWidth={1} strokeDasharray="3 9" opacity={0.5} />
      <g style={{ mixBlendMode: "screen" }}>{rings}</g>

      {/* beacon visible from orbit scale */}
      {toBeacon > 0.01 && centre.ok && (
        <g opacity={toBeacon * clamp01(age * 3)}>
          <circle cx={centre.x} cy={centre.y} r={16} fill="#8fe9ff" opacity={0.35} filter="url(#blur6)" />
          <circle cx={centre.x} cy={centre.y} r={3.6} fill="#fff" />
        </g>
      )}

      {/* phone */}
      {polys.map((p, i) => (
        <polygon key={i} points={p.pts.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ")} fill={p.fill} stroke="#7d92b8" strokeWidth={sw(1)} strokeLinejoin="round" />
      ))}
      {top && (
        <polygon points={top.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ")} fill="#10151f" stroke="#c4d4f0" strokeWidth={sw(1.6)} strokeLinejoin="round" opacity={0.98} />
      )}
      {screen && (
        <>
          <polygon points={screen.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ")} fill="#071a2b" />
          {detail && <polygon points={screen.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ")} fill="#7dffc0" opacity={0.1 * lock} />}
          <clipPath id="phoneScreenClip">
            <polygon points={screen.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ")} />
          </clipPath>
          <g clipPath="url(#phoneScreenClip)">{content}</g>
          {detail && centre.ok && <circle cx={centre.x} cy={centre.y} r={Math.max(1, sw(centreDotR))} fill="none" stroke="#e8fbff" strokeWidth={sw(1.6)} opacity={0.9 * (1 - lock)} />}
        </>
      )}
      {notch && detail && <polygon points={notch.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ")} fill="#02050a" />}
    </g>
  );
};
