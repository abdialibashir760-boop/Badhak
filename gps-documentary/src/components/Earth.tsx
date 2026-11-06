import React from "react";
import { DEG, isLand, latLonToVec, R_EARTH, vecToLatLon } from "../engine/geo";
import {
  add,
  basisFrom,
  clamp,
  len,
  mul,
  pathD,
  project,
  projectRuns,
  smoothstep,
  toCam,
  type Cam,
  type Pt,
  type V3,
} from "../engine/math3d";
import { HEIGHT, WIDTH } from "../timeline";

const R = R_EARTH;
/** Direction from Earth's centre toward the Sun (fixed; the scene is a time-lapse). */
import { SUN } from "../engine/world";
import { useShot } from "./context";
export { SUN };

// ------------------------------------------------------------------ silhouette

/** SVG path of the visible Earth disc (exact sphere silhouette under perspective). */
export function earthPath(cam: Cam): string {
  const C = cam.pos;
  const d = len(C);
  const Ch = mul(C, 1 / d);
  const c0 = mul(Ch, (R * R) / d);
  const rho = R * Math.sqrt(1 - (R * R) / (d * d));
  const [e1, e2] = basisFrom(Ch);
  const N = 200;
  const pts: V3[] = [];
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2;
    pts.push(add(c0, add(mul(e1, rho * Math.cos(a)), mul(e2, rho * Math.sin(a)))));
  }
  const cs = pts.map((p) => toCam(cam, p));
  const behind = cs.findIndex((c) => c.z <= cam.near);
  if (behind < 0) {
    return "M" + cs.map((c) => `${(cam.cx + (cam.F * c.x) / c.z).toFixed(1)} ${(cam.cy - (cam.F * c.y) / c.z).toFixed(1)}`).join("L") + "Z";
  }
  const rot = [...pts.slice(behind), ...pts.slice(0, behind), pts[behind]];
  const runs = projectRuns(cam, rot);
  if (!runs.length) return "";
  const run = runs.reduce((a, b) => (b.length > a.length ? b : a));
  // Close the open horizon curve through "infinity" on the side of the Earth's centre.
  const nx = -(C[0] * cam.r[0] + C[1] * cam.r[1] + C[2] * cam.r[2]);
  const ny = -(C[0] * cam.u[0] + C[1] * cam.u[1] + C[2] * cam.u[2]);
  const nl = Math.hypot(nx, ny) || 1;
  const dn: Pt = [nx / nl, -ny / nl];
  const BIG = 60000;
  const a = run[0];
  const b = run[run.length - 1];
  return (
    "M" +
    run.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L") +
    `L${(b[0] + dn[0] * BIG).toFixed(1)} ${(b[1] + dn[1] * BIG).toFixed(1)}L${(a[0] + dn[0] * BIG).toFixed(1)} ${(a[1] + dn[1] * BIG).toFixed(1)}Z`
  );
}

// ------------------------------------------------------------------ day / night terminator

/** Night-side polygon (terminator arc + night half of the horizon) and the terminator line, in screen space. */
export function nightGeometry(cam: Cam): { fill: string; line: string } | null {
  const C = cam.pos;
  const d = len(C);
  if (d < 14000) return null;
  const Ch = mul(C, 1 / d);
  const c0 = mul(Ch, (R * R) / d);
  const rho = R * Math.sqrt(1 - (R * R) / (d * d));
  const [h1, h2] = basisFrom(Ch);
  const N = 180;
  const hz: V3[] = [];
  const tm: V3[] = [];
  const [t1, t2] = basisFrom(SUN);
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2;
    hz.push(add(c0, add(mul(h1, rho * Math.cos(a)), mul(h2, rho * Math.sin(a)))));
    tm.push(add(mul(t1, R * Math.cos(a)), mul(t2, R * Math.sin(a))));
  }
  const tVis = tm.map((p) => p[0] * C[0] + p[1] * C[1] + p[2] * C[2] > R * R);
  const start = tVis.findIndex((v, i) => v && !tVis[(i + N - 1) % N]);
  if (start < 0) return null;
  const tRun: V3[] = [];
  for (let k = 0; k < N && tVis[(start + k) % N]; k++) tRun.push(tm[(start + k) % N]);
  const hNight = hz.map((p) => p[0] * SUN[0] + p[1] * SUN[1] + p[2] * SUN[2] < 0);
  const hs = hNight.findIndex((v, i) => v && !hNight[(i + N - 1) % N]);
  if (hs < 0) return null;
  let hRun: V3[] = [];
  for (let k = 0; k < N && hNight[(hs + k) % N]; k++) hRun.push(hz[(hs + k) % N]);
  const dist = (a: V3, b: V3) => len(add(a, mul(b, -1)));
  const tEnd = tRun[tRun.length - 1];
  const tStart = tRun[0];
  const fwd = dist(tEnd, hRun[0]) + dist(hRun[hRun.length - 1], tStart);
  const rev = dist(tEnd, hRun[hRun.length - 1]) + dist(hRun[0], tStart);
  if (rev < fwd) hRun = hRun.reverse();
  const toS = (v: V3): Pt | null => {
    const p = project(cam, v);
    return p.ok ? [p.x, p.y] : null;
  };
  const poly = [...tRun, ...hRun].map(toS);
  if (poly.some((p) => !p)) return null;
  const line = tRun.map(toS);
  if (line.some((p) => !p)) return null;
  const fmtP = (pts: (Pt | null)[]) => "M" + pts.map((p) => `${p![0].toFixed(1)} ${p![1].toFixed(1)}`).join("L");
  return { fill: fmtP(poly) + "Z", line: fmtP(line) };
}

// ------------------------------------------------------------------ dot-matrix land with level of detail

const LEVELS = [3, 1.5, 0.75, 0.375, 0.1875, 0.09375]; // degrees between dots
const DOT_COLORS = ["#17405e", "#2a7fae", "#4cbfe8", "#a4ecff"]; // night → noon

type Dots = { key: string; d: string }[];

function buildDots(cam: Cam): Dots {
  const C = cam.pos;
  const dC = len(C);
  const nadir = vecToLatLon(C);
  const φc = nadir.lat * DEG;
  const λcDeg = nadir.lon;
  const sinφc = Math.sin(φc);
  const cosφc = Math.cos(φc);
  const horizonθ = Math.acos(R / dC);
  const farDist = Math.sqrt(dC * dC - R * R);
  const buckets = new Map<string, string>();
  const sunX = SUN[0];
  const sunY = SUN[1];
  const sunZ = SUN[2];

  for (const stepDeg of LEVELS) {
    const sKm = stepDeg * DEG * R;
    const rMax = (sKm * cam.F) / 5.5;
    if (dC - R > rMax) continue;
    if (farDist < (sKm * cam.F) / 40) continue;
    const θL = Math.min(horizonθ, Math.acos(clamp((R * R + dC * dC - rMax * rMax) / (2 * R * dC), -1, 1)));
    const latLo = Math.max(-90, nadir.lat - θL / DEG);
    const latHi = Math.min(90, nadir.lat + θL / DEG);
    const i0 = Math.floor((latLo + 90) / stepDeg - 0.5);
    const i1 = Math.ceil((latHi + 90) / stepDeg - 0.5);
    for (let i = i0; i <= i1; i++) {
      const lat = -90 + (i + 0.5) * stepDeg;
      if (lat < -90 || lat > 90) continue;
      const φ = lat * DEG;
      const cosφ = Math.cos(φ);
      const sinφ = Math.sin(φ);
      const nCols = Math.max(1, Math.round((360 * cosφ) / stepDeg));
      const dl = 360 / nCols;
      const rhs = (Math.cos(θL) - sinφc * sinφ) / (cosφc * cosφ || 1e-9);
      if (rhs > 1) continue;
      let j0 = 0;
      let j1 = nCols - 1;
      if (rhs > -1 && cosφc * cosφ > 1e-6) {
        const Δ = Math.acos(rhs) / DEG;
        j0 = Math.floor((λcDeg - Δ + 180) / dl);
        j1 = Math.min(j0 + nCols - 1, Math.ceil((λcDeg + Δ + 180) / dl));
      }
      for (let j = j0; j <= j1; j++) {
        const lon = ((((j + 0.5 + (i & 1) * 0.5) * dl) % 360) + 360) % 360 - 180;
        if (!isLand(lat, lon)) continue;
        const λ = lon * DEG;
        const nx = cosφ * Math.cos(λ);
        const ny = cosφ * Math.sin(λ);
        const nz = sinφ;
        const X0 = R * nx;
        const X1 = R * ny;
        const X2 = R * nz;
        // Visible side of the sphere?
        const toC0 = C[0] - X0;
        const toC1 = C[1] - X1;
        const toC2 = C[2] - X2;
        const dist = Math.hypot(toC0, toC1, toC2);
        const nv = (nx * toC0 + ny * toC1 + nz * toC2) / dist;
        if (nv <= 0.02) continue;
        const dx = -toC0;
        const dy = -toC1;
        const dz = -toC2;
        const z = dx * cam.f[0] + dy * cam.f[1] + dz * cam.f[2];
        if (z < cam.near) continue;
        const sx = cam.cx + (cam.F * (dx * cam.r[0] + dy * cam.r[1] + dz * cam.r[2])) / z;
        if (sx < -40 || sx > WIDTH + 40) continue;
        const sy = cam.cy - (cam.F * (dx * cam.u[0] + dy * cam.u[1] + dz * cam.u[2])) / z;
        if (sy < -40 || sy > HEIGHT + 40) continue;
        const P = (sKm * cam.F) / z;
        const w = smoothstep(5.5, 9, P) * (1 - smoothstep(21, 36, P)) * smoothstep(0.03, 0.4, nv);
        if (w < 0.04) continue;
        const day = smoothstep(-0.12, 0.45, nx * sunX + ny * sunY + nz * sunZ);
        const bright = day > 0.72 ? 3 : day > 0.4 ? 2 : day > 0.08 ? 1 : 0;
        const alpha = Math.round(w * (0.3 + 0.7 * day) * 6);
        if (alpha <= 0) continue;
        const rad = clamp(P * 0.17, 0.65, 3.6) * (0.6 + 0.4 * nv);
        const sizeBin = Math.round(rad / 0.45);
        const key = `${bright}|${alpha}|${sizeBin}`;
        buckets.set(key, (buckets.get(key) ?? "") + `M${sx.toFixed(1)} ${sy.toFixed(1)}h0`);
      }
    }
  }
  return [...buckets].map(([key, d]) => ({ key, d }));
}

// ------------------------------------------------------------------ graticule

const GRID = [15, 5, 1];

function buildGraticule(cam: Cam, D: number): { d: string; w: number }[] {
  const C = cam.pos;
  const dC = len(C);
  const nadir = vecToLatLon(C);
  const φc = nadir.lat * DEG;
  const horizonθ = Math.acos(R / dC);
  const out: { d: string; w: number }[] = [];
  const visible = (p: V3) => p[0] * C[0] + p[1] * C[1] + p[2] * C[2] > R * R * 1.00002;
  for (const cell of GRID) {
    const cellKm = cell * DEG * R;
    const w = smoothstep(26, 70, (cellKm * cam.F) / D);
    if (w < 0.03) continue;
    const rMax = (cellKm * cam.F) / 16;
    const θ = Math.min(horizonθ, Math.acos(clamp((R * R + dC * dC - rMax * rMax) / (2 * R * dC), -1, 1)));
    const latLo = Math.max(-90, nadir.lat - θ / DEG);
    const latHi = Math.min(90, nadir.lat + θ / DEG);
    const fullLon = θ >= Math.PI / 2 - Math.abs(φc) - 1e-6;
    const dLon = fullLon ? 180 : Math.asin(Math.sin(θ) / Math.cos(φc)) / DEG;
    const lonLo = nadir.lon - dLon;
    const lonHi = nadir.lon + dLon;
    const samp = clamp(cell / 4, 0.4, 3);
    let d = "";
    // meridians
    for (let lon = Math.ceil(lonLo / cell) * cell; lon <= lonHi + 1e-6; lon += cell) {
      const pts: V3[] = [];
      for (let lat = latLo; lat <= latHi + 1e-6; lat += samp) pts.push(latLonToVec(clamp(lat, -89.9, 89.9), lon, R));
      d += pathD(projectRuns(cam, pts, visible));
    }
    // parallels
    for (let lat = Math.ceil(latLo / cell) * cell; lat <= latHi + 1e-6; lat += cell) {
      if (Math.abs(lat) > 89.5) continue;
      const step = Math.min(8, samp / Math.max(Math.cos(lat * DEG), 0.12));
      const pts: V3[] = [];
      for (let lon = lonLo; lon <= lonHi + 1e-6; lon += step) pts.push(latLonToVec(lat, lon, R));
      d += pathD(projectRuns(cam, pts, visible));
    }
    if (d) out.push({ d, w });
  }
  return out;
}

// ------------------------------------------------------------------ component

export const Earth: React.FC<{ cam: Cam; D: number; dots?: boolean }> = ({ cam, D, dots: showDots = true }) => {
  const { id: sid } = useShot();
  const outline = earthPath(cam);
  if (!outline) return null;
  const dots = showDots ? buildDots(cam) : [];
  const grid = buildGraticule(cam, D);

  // Day/night terminator (a great circle) and a soft sun bloom; both fade out once we are close.
  const night = nightGeometry(cam);
  const nightAmount = smoothstep(14000, 30000, D);
  const sunPt = project(cam, mul(SUN, R));
  const discR = (cam.F * R) / Math.sqrt(len(cam.pos) ** 2 - R * R);

  return (
    <g>
      {/* outer atmosphere halo: stroked silhouette, the Earth fill hides the inner half */}
      <path d={outline} fill="none" stroke="#3ea8ff" strokeWidth={46} opacity={0.22} filter="url(#blur20)" />
      <path d={outline} fill="none" stroke="#7fd4ff" strokeWidth={10} opacity={0.5} filter="url(#blur6)" />
      <clipPath id={`${sid}-eclip`}>
        <path d={outline} />
      </clipPath>
      <defs>
        <radialGradient id={`${sid}-bloom`} gradientUnits="userSpaceOnUse" cx={sunPt.x} cy={sunPt.y} r={discR * 1.15}>
          <stop offset="0" stopColor="#4aa8ff" stopOpacity={0.5} />
          <stop offset="0.55" stopColor="#1f6fd6" stopOpacity={0.14} />
          <stop offset="1" stopColor="#1f6fd6" stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={outline} fill="#0a2a55" />
      <g clipPath={`url(#${sid}-eclip)`}>
        <path d={outline} fill={`url(#${sid}-bloom)`} opacity={nightAmount} />
        {night && (
          <>
            <path d={night.fill} fill="#00020a" opacity={0.9 * nightAmount} filter="url(#blur12)" />
            <path d={night.line} fill="none" stroke="#ff9a55" strokeWidth={9} opacity={0.22 * nightAmount} filter="url(#blur6)" />
          </>
        )}
        {grid.map((g, i) => (
          <path key={i} d={g.d} fill="none" stroke="#6ec4ff" strokeWidth={0.9} opacity={0.17 * g.w} />
        ))}
        {dots.map((b2) => {
          const [bright, alpha, size] = b2.key.split("|").map(Number);
          return (
            <path
              key={b2.key}
              d={b2.d}
              fill="none"
              stroke={DOT_COLORS[bright]}
              strokeWidth={size * 0.9}
              strokeLinecap="round"
              opacity={alpha / 6}
            />
          );
        })}
        {/* limb brightening (Fresnel-like) */}
        <path d={outline} fill="none" stroke="#5cc1ff" strokeWidth={60} opacity={0.34} filter="url(#blur20)" />
        <path d={outline} fill="none" stroke="#bfeaff" strokeWidth={3} opacity={0.55} filter="url(#blur3)" />
      </g>
    </g>
  );
};
