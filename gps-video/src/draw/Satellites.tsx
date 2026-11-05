import React from "react";
import { R_EARTH, R_ORBIT } from "../geo";
import {
  add,
  clamp01,
  cross,
  dot,
  hiddenByEarth,
  len,
  mul,
  norm,
  pathD,
  project,
  projectRuns,
  smoothstep,
  sub,
  type Cam,
  type Pt,
  type V3,
} from "../math3d";
import { OMEGA, SATS, satPosition, T_REF, type Sat } from "../orbit";
import { SUN } from "./Earth";

const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";

// ------------------------------------------------------------------ orbit rings + trails

export const Orbits: React.FC<{ cam: Cam; t: number; fade: number }> = ({ cam, t, fade }) => {
  if (fade <= 0.01) return null;
  const vis = (X: V3) => !hiddenByEarth(cam.pos, X, R_EARTH);
  return (
    <g opacity={fade}>
      {SATS.map((s) => {
        const q = cross(s.n, s.p0); // along-track direction at T_REF
        const at = (θ: number): V3 => mul(add(mul(s.p0, Math.cos(θ)), mul(q, Math.sin(θ))), R_ORBIT);
        const ring: V3[] = [];
        for (let i = 0; i <= 240; i++) ring.push(at((i / 240) * Math.PI * 2));
        const θs = OMEGA * (t - T_REF);
        const trail: React.ReactNode[] = [];
        const SEG = 14;
        const SPAN = 0.5;
        for (let k = 0; k < SEG; k++) {
          const a0 = θs - SPAN + (SPAN * k) / SEG;
          const a1 = θs - SPAN + (SPAN * (k + 1)) / SEG;
          const pts: V3[] = [];
          for (let j = 0; j <= 5; j++) pts.push(at(a0 + ((a1 - a0) * j) / 5));
          const d = pathD(projectRuns(cam, pts, vis));
          if (!d) continue;
          const f = (k + 1) / SEG;
          trail.push(<path key={k} d={d} fill="none" stroke={s.color} strokeWidth={1 + 2 * f} strokeLinecap="round" opacity={0.03 + 0.8 * f * f * f} />);
        }
        return (
          <g key={s.id}>
            <path d={pathD(projectRuns(cam, ring, vis))} fill="none" stroke={s.color} strokeWidth={1} strokeDasharray="2 7" opacity={0.28} />
            <g filter="url(#blur3)">{trail}</g>
            {trail}
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ satellite model

type Face = { pts: Pt[]; fill: string; stroke?: string; sw?: number; depth: number; extra?: React.ReactNode };

function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * k));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * k));
  const b = Math.min(255, Math.round((n & 255) * k));
  return `rgb(${r},${g},${b})`;
}

function satFaces(s: Sat, S: V3, cam: Cam, u: number, emit: number): Face[] {
  const Sh = norm(S);
  const x = s.n; // solar-array axis (orbit normal)
  const y = norm(cross(s.n, Sh)); // along-track
  const z = mul(Sh, -1); // nadir (antenna face)
  const at = (a: number, b: number, c: number): V3 => add(S, mul(add(add(mul(x, a), mul(y, b)), mul(z, c)), u));
  const faces: Face[] = [];
  const toPts = (v: V3[]): Pt[] | null => {
    const out: Pt[] = [];
    for (const p of v) {
      const q = project(cam, p);
      if (!q.ok) return null;
      out.push([q.x, q.y]);
    }
    return out;
  };
  const camVec = (p: V3) => sub(cam.pos, p);

  // Bus: gold-foil box. half extents
  const hx = 0.34;
  const hy = 0.34;
  const hz = 0.46;
  const boxFaces: { n: V3; c: [number, number, number][] }[] = [
    { n: x, c: [[hx, -hy, -hz], [hx, hy, -hz], [hx, hy, hz], [hx, -hy, hz]] },
    { n: mul(x, -1), c: [[-hx, -hy, -hz], [-hx, -hy, hz], [-hx, hy, hz], [-hx, hy, -hz]] },
    { n: y, c: [[-hx, hy, -hz], [-hx, hy, hz], [hx, hy, hz], [hx, hy, -hz]] },
    { n: mul(y, -1), c: [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, -hy, hz], [-hx, -hy, hz]] },
    { n: z, c: [[-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz]] },
    { n: mul(z, -1), c: [[-hx, -hy, -hz], [-hx, hy, -hz], [hx, hy, -hz], [hx, -hy, -hz]] },
  ];
  for (const f of boxFaces) {
    const centre = add(S, mul(f.n, u * 0.4));
    if (dot(f.n, camVec(centre)) <= 0) continue;
    const verts = f.c.map((c) => at(c[0], c[1], c[2]));
    const pts = toPts(verts);
    if (!pts) continue;
    const lit = 0.32 + 0.68 * Math.max(0, dot(f.n, SUN));
    const isNadir = f.n === z;
    faces.push({
      pts,
      fill: isNadir ? shade("#6b7480", 0.5 + 0.5 * lit) : shade("#d6a845", lit),
      stroke: "rgba(255,236,170,0.55)",
      sw: 0.8,
      depth: len(camVec(centre)),
    });
    if (isNadir) {
      // L-band helical antenna array on the nadir face
      const ring = (r: number, c: number): Pt[] | null =>
        toPts(Array.from({ length: 12 }, (_, i) => at(Math.cos((i / 12) * 6.283) * r, Math.sin((i / 12) * 6.283) * r, c)));
      const outer = ring(0.27, hz + 0.01);
      const inner = ring(0.13, hz + 0.02);
      if (outer && inner) {
        faces.push({
          pts: outer,
          fill: "#08141d",
          stroke: s.color,
          sw: 1.1,
          depth: len(camVec(centre)) - 1,
          extra: <polygon points={inner.map((p) => p.join(",")).join(" ")} fill="none" stroke={s.color} strokeWidth={1} opacity={0.5 + 0.5 * emit} />,
        });
      }
    }
  }

  // Solar arrays: rotate about their long axis to face the Sun (as the real ones do)
  const m = norm(sub(SUN, mul(x, dot(x, SUN))));
  const w = cross(x, m);
  for (const side of [-1, 1]) {
    const x0 = side * 0.5;
    const x1 = side * 1.78;
    const hw = 0.38;
    const corners = [at(0, 0, 0), at(0, 0, 0), at(0, 0, 0), at(0, 0, 0)];
    const P = (a: number, b: number): V3 => add(S, mul(add(mul(x, a), mul(w, b)), u));
    corners[0] = P(x0, -hw);
    corners[1] = P(x1, -hw);
    corners[2] = P(x1, hw);
    corners[3] = P(x0, hw);
    const pts = toPts(corners);
    if (!pts) continue;
    const centre = P((x0 + x1) / 2, 0);
    const front = dot(m, camVec(centre)) > 0;
    const grid: React.ReactNode[] = [];
    const cols = 6;
    const rows = 3;
    for (let i = 1; i < cols; i++) {
      const a = toPts([P(x0 + ((x1 - x0) * i) / cols, -hw), P(x0 + ((x1 - x0) * i) / cols, hw)]);
      if (a) grid.push(<line key={`c${i}`} x1={a[0][0]} y1={a[0][1]} x2={a[1][0]} y2={a[1][1]} />);
    }
    for (let i = 1; i < rows; i++) {
      const a = toPts([P(x0, -hw + (2 * hw * i) / rows), P(x1, -hw + (2 * hw * i) / rows)]);
      if (a) grid.push(<line key={`r${i}`} x1={a[0][0]} y1={a[0][1]} x2={a[1][0]} y2={a[1][1]} />);
    }
    faces.push({
      pts,
      fill: front ? "#183a86" : "#2a3140",
      stroke: front ? "#8cc2ff" : "#7a8599",
      sw: 1,
      depth: len(camVec(centre)),
      extra: <g stroke={front ? "#5b97ec" : "#566074"} strokeWidth={0.7} opacity={0.9}>{grid}</g>,
    });
    // yoke
    const yoke = toPts([at(side * hx, 0, 0), P(x0, 0)]);
    if (yoke) faces.push({ pts: yoke, fill: "none", stroke: "#a0a8b6", sw: 1.4, depth: len(camVec(centre)) + 0.5 });
  }
  return faces.sort((a, b) => b.depth - a.depth);
}

export const Satellite: React.FC<{ sat: Sat; cam: Cam; t: number; opacity: number; label: number }> = ({ sat, cam, t, opacity, label }) => {
  const S = satPosition(sat, t);
  if (opacity <= 0.01 || hiddenByEarth(cam.pos, S, R_EARTH * 0.995)) return null;
  const c = project(cam, S);
  if (!c.ok) return null;
  if (c.x < -200 || c.x > 2120 || c.y < -200 || c.y > 1280) return null;
  const dist = len(sub(S, cam.pos));
  const u = 0.0112 * dist; // keeps the (deliberately enlarged) satellite ≈ 70 px wide at any zoom
  const emit = smoothstep(sat.launch - 0.2, sat.launch + 0.3, t) * (0.65 + 0.35 * Math.sin(t * 9 + sat.id * 2));
  const faces = satFaces(sat, S, cam, u, clamp01(emit));
  const glowR = 52 * (1 + 0.22 * emit);
  const gid = `satGlow${sat.id}`;
  const alt = Math.round(len(S) - R_EARTH);
  const transmitting = t >= sat.launch;
  return (
    <g opacity={opacity}>
      <defs>
        <radialGradient id={gid}>
          <stop offset="0" stopColor={sat.color} stopOpacity={0.55} />
          <stop offset="0.45" stopColor={sat.color} stopOpacity={0.16} />
          <stop offset="1" stopColor={sat.color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={c.x} cy={c.y} r={glowR} fill={`url(#${gid})`} />
      {faces.map((f, i) => (
        <g key={i}>
          <polygon points={f.pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")} fill={f.fill} stroke={f.stroke} strokeWidth={f.sw} strokeLinejoin="round" />
          {f.extra}
        </g>
      ))}
      {label > 0.01 && (() => {
        // Label sits on the far side of the satellite from Earth, so it never fights the wavefronts.
        const dx = c.x - cam.cx;
        const dy = c.y - cam.cy;
        let sx = dx >= 0 ? 1 : -1;
        if (sx > 0 && c.x + 260 > 1880) sx = -1;
        else if (sx < 0 && c.x - 260 < 40) sx = 1;
        let sy = dy >= 0 ? 1 : -1;
        // keep clear of the title block (top-left)
        if (sy < 0 && c.y < 340 && c.x < 780) sy = 1;
        const ox = c.x + sx * 40;
        const oy = c.y + sy * 36;
        const ex = ox + sx * 34;
        const ey = oy + sy * 34;
        const tail = ex + sx * 128;
        const anchor = sx > 0 ? "start" : "end";
        return (
          <g opacity={label} fontFamily={FONT}>
            <polyline points={`${ox},${oy} ${ex},${ey} ${tail},${ey}`} fill="none" stroke={sat.color} strokeWidth={1.2} opacity={0.8} />
            <text x={ex + sx * 6} y={sy > 0 ? ey + 24 : ey - 34} fill="#eaf6ff" fontSize={19} fontWeight={600} letterSpacing={1.5} textAnchor={anchor} stroke="#02050c" strokeWidth={5} strokeLinejoin="round" paintOrder="stroke">
              {sat.name}
            </text>
            <text x={ex + sx * 6} y={sy > 0 ? ey + 46 : ey - 10} fill={sat.color} fontSize={14.5} fontWeight={500} letterSpacing={0.6} textAnchor={anchor} stroke="#02050c" strokeWidth={4} strokeLinejoin="round" paintOrder="stroke">
              {transmitting ? "L1 · 1575.42 MHz" : `ALT ${alt.toLocaleString("en-US")} km`}
            </text>
          </g>
        );
      })()}
    </g>
  );
};

export const satDepthOrder = (cam: Cam, t: number): Sat[] =>
  [...SATS].sort((a, b) => len(sub(satPosition(b, t), cam.pos)) - len(sub(satPosition(a, t), cam.pos)));
