import React from "react";
import { R_EARTH, R_ORBIT } from "../engine/geo";
import { add, clamp01, cross, dot, hiddenByEarth, len, mul, norm, pathD, project, projectRuns, smoothstep, sub, type Cam, type Pt, type V3 } from "../engine/math3d";
import { OMEGA, SUN, T_REF, type Sat } from "../engine/world";
import { useShot } from "./context";

export const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";

// ─────────────────────────── orbit path + trail
export const OrbitRing: React.FC<{ cam: Cam; sat: Pick<Sat, "p0" | "n" | "color">; orbitT?: number; theta?: number; opacity?: number; trail?: boolean; width?: number; dash?: boolean; trailSpan?: number }> = ({ cam, sat, orbitT = T_REF, theta, opacity = 1, trail = true, width = 1, dash = true, trailSpan = 0.5 }) => {
  if (opacity <= 0.01) return null;
  const vis = (X: V3) => !hiddenByEarth(cam.pos, X, R_EARTH);
  const q = cross(sat.n, sat.p0);
  const at = (θ: number): V3 => mul(add(mul(sat.p0, Math.cos(θ)), mul(q, Math.sin(θ))), R_ORBIT);
  const ring: V3[] = [];
  for (let i = 0; i <= 200; i++) ring.push(at((i / 200) * Math.PI * 2));
  const θs = theta ?? OMEGA * (orbitT - T_REF);
  const SEG = 12;
  const SPAN = trailSpan;
  const segs: React.ReactNode[] = [];
  if (trail) {
    for (let k = 0; k < SEG; k++) {
      const a0 = θs - SPAN + (SPAN * k) / SEG;
      const a1 = θs - SPAN + (SPAN * (k + 1)) / SEG;
      const pts: V3[] = [];
      for (let j = 0; j <= 4; j++) pts.push(at(a0 + ((a1 - a0) * j) / 4));
      const d = pathD(projectRuns(cam, pts, vis));
      if (!d) continue;
      const f = (k + 1) / SEG;
      segs.push(<path key={k} d={d} fill="none" stroke={sat.color} strokeWidth={1 + 2 * f} strokeLinecap="round" opacity={0.03 + 0.8 * f * f * f} />);
    }
  }
  return (
    <g opacity={opacity}>
      <path d={pathD(projectRuns(cam, ring, vis))} fill="none" stroke={sat.color} strokeWidth={width} strokeDasharray={dash ? "2 7" : undefined} opacity={dash ? 0.3 : 0.7} />
      {segs}
    </g>
  );
};

// ─────────────────────────── satellite model (gold-foil bus, sun-tracking arrays, nadir antenna)
type Face = { pts: Pt[]; fill: string; stroke?: string; sw?: number; depth: number; extra?: React.ReactNode };
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.min(255, Math.round(v * k));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
};

export function satFaces(sat: Pick<Sat, "n" | "color">, S: V3, cam: Cam, u: number, emit: number, nadirDir?: V3): Face[] {
  const Sh = norm(S);
  const x = sat.n;
  const y = norm(cross(sat.n, Sh));
  const z = nadirDir ?? mul(Sh, -1);
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
  const hx = 0.34, hy = 0.34, hz = 0.46;
  const box: { n: V3; c: [number, number, number][] }[] = [
    { n: x, c: [[hx, -hy, -hz], [hx, hy, -hz], [hx, hy, hz], [hx, -hy, hz]] },
    { n: mul(x, -1), c: [[-hx, -hy, -hz], [-hx, -hy, hz], [-hx, hy, hz], [-hx, hy, -hz]] },
    { n: y, c: [[-hx, hy, -hz], [-hx, hy, hz], [hx, hy, hz], [hx, hy, -hz]] },
    { n: mul(y, -1), c: [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, -hy, hz], [-hx, -hy, hz]] },
    { n: z, c: [[-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz]] },
    { n: mul(z, -1), c: [[-hx, -hy, -hz], [-hx, hy, -hz], [hx, hy, -hz], [hx, -hy, -hz]] },
  ];
  for (const f of box) {
    const centre = add(S, mul(f.n, u * 0.4));
    if (dot(f.n, camVec(centre)) <= 0) continue;
    const pts = toPts(f.c.map((c) => at(c[0], c[1], c[2])));
    if (!pts) continue;
    const lit = 0.32 + 0.68 * Math.max(0, dot(f.n, SUN));
    const isNadir = f.n === z;
    faces.push({ pts, fill: isNadir ? shade("#6b7480", 0.5 + 0.5 * lit) : shade("#d6a845", lit), stroke: "rgba(255,236,170,0.55)", sw: 0.8, depth: len(camVec(centre)) });
    if (isNadir) {
      const ring = (r: number, c: number) => toPts(Array.from({ length: 12 }, (_, i) => at(Math.cos((i / 12) * 6.283) * r, Math.sin((i / 12) * 6.283) * r, c)));
      const outer = ring(0.27, hz + 0.01);
      const inner = ring(0.13, hz + 0.02);
      if (outer && inner)
        faces.push({ pts: outer, fill: "#08141d", stroke: sat.color, sw: 1.1, depth: len(camVec(centre)) - 1, extra: <polygon points={inner.map((p) => p.join(",")).join(" ")} fill="none" stroke={sat.color} strokeWidth={1} opacity={0.5 + 0.5 * emit} /> });
    }
  }
  const m = norm(sub(SUN, mul(x, dot(x, SUN))));
  const w = cross(x, m);
  for (const side of [-1, 1]) {
    const x0 = side * 0.5, x1 = side * 1.78, hw = 0.38;
    const P = (a: number, b: number): V3 => add(S, mul(add(mul(x, a), mul(w, b)), u));
    const pts = toPts([P(x0, -hw), P(x1, -hw), P(x1, hw), P(x0, hw)]);
    if (!pts) continue;
    const centre = P((x0 + x1) / 2, 0);
    const front = dot(m, camVec(centre)) > 0;
    const grid: React.ReactNode[] = [];
    for (let i = 1; i < 6; i++) {
      const a = toPts([P(x0 + ((x1 - x0) * i) / 6, -hw), P(x0 + ((x1 - x0) * i) / 6, hw)]);
      if (a) grid.push(<line key={`c${i}`} x1={a[0][0]} y1={a[0][1]} x2={a[1][0]} y2={a[1][1]} />);
    }
    for (let i = 1; i < 3; i++) {
      const a = toPts([P(x0, -hw + (2 * hw * i) / 3), P(x1, -hw + (2 * hw * i) / 3)]);
      if (a) grid.push(<line key={`r${i}`} x1={a[0][0]} y1={a[0][1]} x2={a[1][0]} y2={a[1][1]} />);
    }
    faces.push({ pts, fill: front ? "#183a86" : "#27345f", stroke: front ? "#8cc2ff" : "#7a8599", sw: 1, depth: len(camVec(centre)), extra: <g stroke={front ? "#5b97ec" : "#566074"} strokeWidth={0.7} opacity={0.9}>{grid}</g> });
    const yoke = toPts([at(side * hx, 0, 0), P(x0, 0)]);
    if (yoke) faces.push({ pts: yoke, fill: "none", stroke: "#a0a8b6", sw: 1.4, depth: len(camVec(centre)) + 0.5 });
  }
  return faces.sort((a, b) => b.depth - a.depth);
}

export const FacesSvg: React.FC<{ faces: Face[] }> = ({ faces }) => (
  <>
    {faces.map((f, i) => (
      <g key={i}>
        <polygon points={f.pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")} fill={f.fill} stroke={f.stroke} strokeWidth={f.sw} strokeLinejoin="round" />
        {f.extra}
      </g>
    ))}
  </>
);

type SatProps = {
  sat: Sat;
  S: V3;
  cam: Cam;
  opacity?: number;
  /** 0..1 label visibility; text lines are given by `label` */
  labelOpacity?: number;
  label?: [string, string];
  emit?: number; // 0..1 transmitting glow
  size?: number; // multiplier on the ~70 px default footprint
  glow?: boolean;
};

/** Enlarged-for-visibility satellite icon; keeps ≈ 70 px wide at any zoom. */
export const Satellite: React.FC<SatProps> = ({ sat, S, cam, opacity = 1, labelOpacity = 0, label, emit = 0, size = 1, glow = true }) => {
  const { id: sid, t } = useShot();
  if (opacity <= 0.01 || hiddenByEarth(cam.pos, S, R_EARTH * 0.995)) return null;
  const c = project(cam, S);
  if (!c.ok || c.x < -200 || c.x > 2120 || c.y < -200 || c.y > 1280) return null;
  const dist = len(sub(S, cam.pos));
  const u = 0.0112 * dist * size;
  const em = clamp01(emit) * (0.65 + 0.35 * Math.sin(t * 9 + sat.id * 2));
  const faces = satFaces(sat, S, cam, u, em);
  const gid = `${sid}-sg${sat.id}`;
  return (
    <g opacity={opacity}>
      {glow && (
        <>
          <defs>
            <radialGradient id={gid}>
              <stop offset="0" stopColor={sat.color} stopOpacity={0.55} />
              <stop offset="0.45" stopColor={sat.color} stopOpacity={0.16} />
              <stop offset="1" stopColor={sat.color} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={c.x} cy={c.y} r={52 * size * (1 + 0.22 * em)} fill={`url(#${gid})`} />
        </>
      )}
      <FacesSvg faces={faces} />
      {labelOpacity > 0.01 && label && <SatLabel c={c} cam={cam} color={sat.color} label={label} opacity={labelOpacity} />}
    </g>
  );
};

const SatLabel: React.FC<{ c: { x: number; y: number }; cam: Cam; color: string; label: [string, string]; opacity: number }> = ({ c, cam, color, label, opacity }) => {
  const dx = c.x - cam.cx;
  const dy = c.y - cam.cy;
  let sx = dx >= 0 ? 1 : -1;
  if (sx > 0 && c.x + 260 > 1880) sx = -1;
  else if (sx < 0 && c.x - 260 < 40) sx = 1;
  let sy = dy >= 0 ? 1 : -1;
  if (sy < 0 && c.y < 340 && c.x < 780) sy = 1;
  const ox = c.x + sx * 40, oy = c.y + sy * 36, ex = ox + sx * 34, ey = oy + sy * 34, tail = ex + sx * 128;
  const anchor = sx > 0 ? "start" : "end";
  return (
    <g opacity={opacity} fontFamily={FONT}>
      <polyline points={`${ox},${oy} ${ex},${ey} ${tail},${ey}`} fill="none" stroke={color} strokeWidth={1.2} opacity={0.8} />
      <text x={ex + sx * 6} y={sy > 0 ? ey + 24 : ey - 34} fill="#eaf6ff" fontSize={19} fontWeight={600} letterSpacing={1.5} textAnchor={anchor} stroke="#02050c" strokeWidth={5} strokeLinejoin="round" paintOrder="stroke">{label[0]}</text>
      <text x={ex + sx * 6} y={sy > 0 ? ey + 46 : ey - 10} fill={color} fontSize={14.5} fontWeight={500} letterSpacing={0.6} textAnchor={anchor} stroke="#02050c" strokeWidth={4} strokeLinejoin="round" paintOrder="stroke">{label[1]}</text>
    </g>
  );
};

/** Tiny constellation marker: a gold dot with two blue panels (used for the 24-satellite views). */
export const MiniSat: React.FC<{ S: V3; n: V3; color: string; cam: Cam; opacity?: number; scale?: number }> = ({ S, n, color, cam, opacity = 1, scale = 1 }) => {
  if (hiddenByEarth(cam.pos, S, R_EARTH * 0.995)) return null;
  const c = project(cam, S);
  if (!c.ok || c.x < -60 || c.x > 1980 || c.y < -60 || c.y > 1140) return null;
  const dist = len(sub(S, cam.pos));
  const half = 0.0042 * dist * scale;
  const a = project(cam, add(S, mul(n, half)));
  const b = project(cam, sub(S, mul(n, half)));
  if (!a.ok || !b.ok) return null;
  return (
    <g opacity={opacity}>
      <circle cx={c.x} cy={c.y} r={11 * scale} fill={color} opacity={0.22} />
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#5b97ec" strokeWidth={3 * scale} strokeLinecap="butt" />
      <circle cx={c.x} cy={c.y} r={2.6 * scale} fill="#f0c25a" />
    </g>
  );
};

export const satDepthOrder = <T extends { S: V3 }>(cam: Cam, list: T[]) => [...list].sort((a, b) => len(sub(b.S, cam.pos)) - len(sub(a.S, cam.pos)));
export { smoothstep };
