import React from "react";
import { Person, Rig, SKINS } from "../common/Figures";
import { clamp, lerp, rng } from "../common/math";

export const font = "Inter, 'Helvetica Neue', Arial, sans-serif";

// ---- geometry (design space 1080×1920; art zone y 330–1250) ---------------------------------------
export const GROUND_TOP = 430;
export const FLOOR = 1150;
export const CEIL = 1000;
export const ALC_X = 560; // alcove (air pocket) starts here
export const ALC_CEIL = 900;
export const BENCH_Y = 1070; // miners sit on a raised bench inside the alcove
export const X0 = 110;
export const X1 = 970;
export const RIG_X = 790;
export const BREACH: [number, number] = [400, 1000];
export const ABN = "M290 640 L540 630 L560 770 L520 990 L330 980 L290 810 Z"; // abandoned workings
export const EXIT_TOP: [number, number] = [60, GROUND_TOP];
export const CORRIDOR = `M${X0} ${CEIL} H${ALC_X} V${ALC_CEIL} H${X1} V${FLOOR} H${X0} Z`;

const TILE = 240;
const flecks = (() => {
  const r = rng(61);
  return Array.from({ length: 60 }).map(() => ({ x: r() * TILE, y: r() * TILE, s: 3 + r() * 9, a: r() * 360, light: r() > 0.5 }));
})();
const strata = (() => {
  const r = rng(8);
  return Array.from({ length: 14 }).map((_, i) => ({ y: 470 + i * 70 + r() * 30, h: 18 + r() * 40, amp: 6 + r() * 16, f: 0.003 + r() * 0.004, ph: r() * 6, c: r() }));
})();

/** Sky, hills and the rock below the surface. */
export const Backdrop: React.FC<{ uid: string; t: number }> = ({ uid, t }) => (
  <g>
    <defs>
      <linearGradient id={`${uid}sk`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={GROUND_TOP}>
        <stop offset="0" stopColor="#86c1ea" />
        <stop offset="1" stopColor="#e9f5fb" />
      </linearGradient>
      <pattern id={`${uid}tx`} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
        {flecks.map((f, i) => (
          <polygon key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.a})`} points={`${-f.s},${-f.s * 0.5} ${f.s * 0.2},${-f.s * 0.8} ${f.s},${f.s * 0.3} ${-f.s * 0.3},${f.s * 0.7}`} fill={f.light ? "#8a7258" : "#3a2e24"} opacity={0.32} />
        ))}
      </pattern>
      <linearGradient id={`${uid}dp`} gradientUnits="userSpaceOnUse" x1={0} y1={GROUND_TOP} x2={0} y2={1400}>
        <stop offset="0" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.45" />
      </linearGradient>
    </defs>
    <rect x={-1500} y={-1400} width={4200} height={GROUND_TOP + 1400} fill={`url(#${uid}sk)`} />
    <ellipse cx={180} cy={GROUND_TOP + 6} rx={420} ry={90} fill="#79b36a" />
    <ellipse cx={720} cy={GROUND_TOP + 10} rx={520} ry={70} fill="#6aa65c" />
    <ellipse cx={1180} cy={GROUND_TOP + 8} rx={420} ry={80} fill="#7fb96f" />
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={200 + i * 340 + Math.sin(t * 0.2 + i) * 14} cy={380 + (i % 2) * 40} rx={110} ry={26} fill="#fff" opacity={0.85} />
    ))}
    <rect x={-1500} y={GROUND_TOP} width={4200} height={1500} fill="#5d4a3a" />
    {strata.map((b, i) => (
      <path key={i} d={`M-1500 ${b.y} ${Array.from({ length: 36 }).map((_, k) => `L${-1500 + k * 120} ${b.y + b.amp * Math.sin(k * 120 * b.f + b.ph)}`).join(" ")} L2700 ${b.y + b.h} L-1500 ${b.y + b.h} Z`} fill={b.c > 0.5 ? "#6b5744" : "#4c3d30"} opacity={0.55} />
    ))}
    <rect x={-1500} y={GROUND_TOP} width={4200} height={1500} fill={`url(#${uid}tx)`} />
    <rect x={-1500} y={GROUND_TOP} width={4200} height={1500} fill={`url(#${uid}dp)`} />
    <rect x={-1500} y={GROUND_TOP - 6} width={4200} height={14} fill="#5f9a50" />
  </g>
);

type MineProps = {
  uid: string;
  t: number;
  /** water spans x from waterL to waterR in the corridor (omit for dry) */
  waterL?: number;
  waterR?: number;
  /** 0..1 depth of water in the main corridor (1 = floor to ceiling) */
  level?: number;
  /** px of water above the floor inside the alcove */
  alcove?: number;
  /** 0..1 how flooded the abandoned workings are */
  wet?: number;
  dim?: number;
};

/** Corridor, alcove, exit tunnel and the abandoned workings, with water. */
export const Mine: React.FC<MineProps> = ({ uid, t, waterL, waterR, level = 1, alcove = 24, wet = 0, dim = 0 }) => {
  const lamps = Array.from({ length: 9 }).map((_, i) => X0 + 50 + i * 90);
  const wave = (x: number) => Math.sin(x * 0.05 + t * 3) * 2.2;
  const yMain = FLOOR - level * (FLOOR - CEIL);
  const yAlc = FLOOR - alcove;
  let water: React.ReactNode = null;
  if (waterL !== undefined && waterR !== undefined && waterR > waterL) {
    const a = Math.max(waterL, X0);
    const b = Math.min(waterR, X1);
    const pts: string[] = [`M${a} ${FLOOR}`];
    for (let x = a; x <= b; x += 12) {
      const top = x < ALC_X ? yMain : yAlc;
      pts.push(`L${x} ${top + wave(x)}`);
    }
    pts.push(`L${b} ${FLOOR} Z`);
    water = <path d={pts.join(" ")} fill="#3d8fd1" opacity={0.82} />;
  }
  return (
    <g>
      <defs>
        <clipPath id={`${uid}cc`}>
          <path d={CORRIDOR} />
        </clipPath>
        <clipPath id={`${uid}aw`}>
          <path d={ABN} />
        </clipPath>
      </defs>
      {/* exit tunnel */}
      <line x1={X0 + 12} y1={FLOOR - 40} x2={EXIT_TOP[0] + 8} y2={EXIT_TOP[1] + 20} stroke="#0e0f12" strokeWidth={70} />
      <line x1={X0 + 12} y1={FLOOR - 40} x2={EXIT_TOP[0] + 8} y2={EXIT_TOP[1] + 20} stroke="#2b2f36" strokeWidth={4} strokeDasharray="14 18" transform="translate(0 28)" />
      <rect x={EXIT_TOP[0] - 40} y={EXIT_TOP[1] - 52} width={14} height={60} fill="#7b5632" transform="rotate(-8 40 480)" />
      <rect x={EXIT_TOP[0] + 28} y={EXIT_TOP[1] - 52} width={14} height={60} fill="#7b5632" transform="rotate(-8 40 480)" />
      {/* abandoned workings */}
      <path d={ABN} fill="#14161b" stroke="#0a0b0d" strokeWidth={10} />
      <g clipPath={`url(#${uid}aw)`}>
        <rect x={280} y={lerp(990, 640, wet)} width={300} height={380} fill="#3d8fd1" opacity={0.7} />
      </g>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${340 + i * 60} 680 L${350 + i * 60} 780 M${330 + i * 70} 800 L${360 + i * 70} 860`} stroke="#2a2e36" strokeWidth={5} opacity={0.8} />
      ))}
      {/* corridor */}
      <path d={CORRIDOR} fill="#0b0c0f" stroke="#1d2026" strokeWidth={16} strokeLinejoin="round" />
      <line x1={X0} y1={FLOOR + 3} x2={X1} y2={FLOOR + 3} stroke="#434a54" strokeWidth={5} />
      {lamps.map((x) => (
        <g key={x}>
          <circle cx={x} cy={x < ALC_X ? CEIL + 14 : ALC_CEIL + 14} r={20} fill="#ffd88a" opacity={0.2 * (1 - dim)} />
          <circle cx={x} cy={x < ALC_X ? CEIL + 14 : ALC_CEIL + 14} r={3} fill="#ffe7a8" opacity={1 - dim * 0.8} />
        </g>
      ))}
      {/* bench in the alcove */}
      <rect x={ALC_X + 40} y={BENCH_Y} width={X1 - ALC_X - 40} height={FLOOR - BENCH_Y} fill="#3a3f48" />
      <g clipPath={`url(#${uid}cc)`}>{water}</g>
    </g>
  );
};

const HELM = { a: "#f5c518", b: "#f2f2f2" };
const SUITS = ["#f0892a", "#2f6fb2", "#f0892a", "#d9d3c4", "#f0892a", "#2f6fb2", "#f0892a", "#f0892a", "#d9d3c4"];

export const Crew: React.FC<{ x: number; y: number; step: number; t: number; crew: "a" | "b"; pose?: "stand" | "sit" | "walk" | "cheer"; scale?: number; n?: number; opacity?: number }> = ({ x, y, step, t, crew, pose = "stand", scale = 1.15, n = 9, opacity = 1 }) => (
  <g opacity={opacity}>
    {Array.from({ length: n }).map((_, i) => (
      <Person key={i} x={x + i * step} y={y} t={t} phase={i * 0.8} pose={pose} skin={SKINS[i % 5]} suit={SUITS[i % SUITS.length]} helmet={HELM[crew]} scale={scale} facing={i % 2 ? 1 : -1} />
    ))}
  </g>
);

export const SurfaceRig: React.FC<{ x: number; t: number; active: boolean; s?: number }> = ({ x, t, active, s = 0.62 }) => (
  <g transform={`translate(${x} ${GROUND_TOP}) scale(${s})`}>
    <Rig x={0} t={t} active={active} />
  </g>
);

export const Pipe: React.FC<{ x: number; y0: number; y1: number; w?: number }> = ({ x, y0, y1, w = 6 }) =>
  y1 > y0 ? (
    <g>
      <line x1={x} x2={x} y1={y0} y2={y1} stroke="#b9c0ca" strokeWidth={w} />
      <line x1={x - w / 4} x2={x - w / 4} y1={y0} y2={y1} stroke="#e8edf3" strokeWidth={w / 4} />
      <path d={`M${x - w * 0.9} ${y1} L${x + w * 0.9} ${y1} L${x} ${y1 + w * 1.8} Z`} fill="#ff9d2e" />
    </g>
  ) : null;

export const Label: React.FC<{ x: number; y: number; text: string; size?: number; bg?: string; fg?: string; opacity?: number }> = ({ x, y, text, size = 32, bg = "#f2b705", fg = "#14161a", opacity = 1 }) => {
  const w = text.length * size * 0.62 + size * 1.2;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.55} rx={size * 0.3} fill={bg} />
      <text x={0} y={size * 0.2} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={size} fill={fg} letterSpacing={size * 0.04}>
        {text}
      </text>
    </g>
  );
};

export const Dots: React.FC<{ x: number; y: number; n: number; lit: number; r?: number; gap?: number }> = ({ x, y, n, lit, r = 16, gap = 54 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <circle key={i} cx={x + (i - (n - 1) / 2) * gap} cy={y} r={r} fill={i < lit ? "#f2b705" : "#1a2230"} stroke="#fff" strokeWidth={4} opacity={0.95} />
    ))}
  </g>
);

export const Ruler: React.FC<{ x: number; y0: number; y1: number; text: string; opacity?: number }> = ({ x, y0, y1, text, opacity = 1 }) => (
  <g opacity={opacity}>
    <line x1={x} x2={x} y1={y0} y2={y1} stroke="#f4f6f8" strokeWidth={4} />
    {[y0, y1].map((y) => (
      <line key={y} x1={x - 14} x2={x + 14} y1={y} y2={y} stroke="#f4f6f8" strokeWidth={4} />
    ))}
    <Label x={x - 6} y={(y0 + y1) / 2} text={text} size={30} />
  </g>
);

export const clampI = (v: number) => clamp(v);
