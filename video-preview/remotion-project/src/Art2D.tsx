import React from "react";
import { interpolate, random } from "remotion";

export const W = 1280;
export const H = 720;
export const SKIN = "#0b0a12";
export const ORANGE = "#f2552c";
export const AMBER = "#ffc08a";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Mood = "happy" | "worry" | "neutral" | "angry" | "surprised" | "sleep";

// ---------------------------------------------------------------- defs
export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%">
      <stop offset="55%" stopColor="#000" stopOpacity={0} />
      <stop offset="100%" stopColor="#000" stopOpacity={0.6} />
    </radialGradient>
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#241b4a" />
      <stop offset="45%" stopColor="#6d417a" />
      <stop offset="80%" stopColor="#f08a4b" />
      <stop offset="100%" stopColor="#ffc27a" />
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#fff3c9" stopOpacity={0.95} />
      <stop offset="35%" stopColor="#ffb25e" stopOpacity={0.55} />
      <stop offset="100%" stopColor="#ff8a3d" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="wallWarm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#4a3a40" />
      <stop offset="100%" stopColor="#372b32" />
    </linearGradient>
    <linearGradient id="wallBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#1b2750" />
      <stop offset="100%" stopColor="#141c3b" />
    </linearGradient>
    <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ffd9a0" stopOpacity={0.5} />
      <stop offset="100%" stopColor="#ffd9a0" stopOpacity={0} />
    </linearGradient>
    <radialGradient id="glowRed" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#ff5a4a" stopOpacity={0.9} />
      <stop offset="100%" stopColor="#ff2a1a" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="glowAmber" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#ffd9a0" stopOpacity={0.8} />
      <stop offset="100%" stopColor="#ffb25e" stopOpacity={0} />
    </radialGradient>
  </defs>
);

export const Vignette: React.FC = () => <rect width={W} height={H} fill="url(#vig)" />;

export const Dust: React.FC<{ t: number; n?: number }> = ({ t, n = 36 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = (random(`dx${i}`) * W + t * (6 + random(`dv${i}`) * 10)) % W;
      const y = (((random(`dy${i}`) * H - t * (3 + random(`dw${i}`) * 6)) % H) + H) % H;
      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={1 + random(`dr${i}`) * 1.6}
          fill="#fff"
          opacity={0.12 + 0.28 * Math.abs(Math.sin(t * 0.8 + i))}
        />
      );
    })}
  </g>
);

// ---------------------------------------------------------------- sky / city
export const Sky: React.FC<{ base?: number; sunX?: number }> = ({ base = 560, sunX = 900 }) => (
  <g>
    <rect width={W} height={base + 40} fill="url(#dusk)" />
    <circle cx={sunX} cy={base - 10} r={380} fill="url(#sun)" />
  </g>
);

export const Skyline: React.FC<{
  scroll?: number;
  base?: number;
  seed?: string;
  color?: string;
  scale?: number;
  lit?: boolean;
}> = ({ scroll = 0, base = 560, seed = "sk", color = "#3a2d52", scale = 1, lit = true }) => {
  const count = 28;
  const span = count * 56;
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const w = 34 + random(`${seed}w${i}`) * 34;
        const h = (70 + random(`${seed}h${i}`) * 190) * scale;
        const x = ((((i * 56 - scroll) % span) + span) % span) - 90;
        return (
          <g key={i}>
            <rect x={x} y={base - h} width={w} height={h} fill={color} />
            {lit &&
              Array.from({ length: Math.floor(h / 22) * 2 }).map((_, k) =>
                random(`${seed}l${i}-${k}`) < 0.4 ? (
                  <rect
                    key={k}
                    x={x + 6 + (k % 2) * (w * 0.45)}
                    y={base - h + 8 + Math.floor(k / 2) * 22}
                    width={5}
                    height={8}
                    fill="#ffe3a8"
                    opacity={0.8}
                  />
                ) : null,
              )}
          </g>
        );
      })}
    </g>
  );
};

export const Apartments: React.FC<{ scroll: number; base?: number }> = ({ scroll, base = 600 }) => {
  const span = 6 * 330;
  return (
    <g>
      {Array.from({ length: 6 }).map((_, i) => {
        const x = ((((i * 330 - scroll) % span) + span) % span) - 330;
        const h = 250 + random(`ap${i}`) * 90;
        const lit = (r: number, c: number) => random(`apw${i}-${r}-${c}`) < 0.45;
        return (
          <g key={i}>
            <rect x={x} y={base - h} width={300} height={h} fill="#3a3346" />
            <rect x={x} y={base - h} width={300} height={10} fill="#2a2434" />
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => (
                <rect
                  key={`${r}${c}`}
                  x={x + 28 + c * 90}
                  y={base - h + 40 + r * 70}
                  width={58}
                  height={44}
                  fill={lit(r, c) ? "#ffe3a8" : "#26212f"}
                />
              )),
            )}
          </g>
        );
      })}
    </g>
  );
};

export const Tree: React.FC<{ x: number; base: number; s?: number }> = ({ x, base, s = 1 }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`} fill="#1a1522">
    <rect x={-5} y={-60} width={10} height={60} />
    <circle cx={0} cy={-90} r={34} />
    <circle cx={-26} cy={-70} r={24} />
    <circle cx={26} cy={-70} r={24} />
  </g>
);

export const LampPost: React.FC<{ x: number; base: number }> = ({ x, base }) => (
  <g>
    <rect x={x - 3} y={base - 230} width={6} height={230} fill="#1d1826" />
    <circle cx={x} cy={base - 235} r={60} fill="url(#glowAmber)" />
    <circle cx={x} cy={base - 235} r={7} fill="#ffe3a8" />
  </g>
);

export const Road: React.FC<{ scroll: number; y?: number }> = ({ scroll, y = 600 }) => (
  <g>
    <rect x={0} y={y} width={W} height={H - y} fill="#2a2330" />
    <rect x={0} y={y} width={W} height={4} fill="#4a3f55" />
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={((((i * 130 - scroll * 1.0) % 1560) + 1560) % 1560) - 130} y={y + 62} width={70} height={6} fill="#6c6280" />
    ))}
  </g>
);

// ---------------------------------------------------------------- rooms
export const Room: React.FC<{ wall?: "warm" | "blue"; floorY?: number }> = ({ wall = "warm", floorY = 600 }) => (
  <g>
    <rect width={W} height={floorY} fill={wall === "warm" ? "url(#wallWarm)" : "url(#wallBlue)"} />
    <rect y={floorY} width={W} height={H - floorY} fill={wall === "warm" ? "#2a2127" : "#0f1530"} />
    <rect y={floorY - 6} width={W} height={8} fill={wall === "warm" ? "#3d3138" : "#1a2347"} />
  </g>
);

export const WindowView: React.FC<{ x: number; y: number; w: number; h: number; night?: boolean; moon?: number; scroll?: number }> = ({
  x,
  y,
  w,
  h,
  night,
  moon = 0,
  scroll = 0,
}) => (
  <g>
    <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} fill={night ? "#0d1330" : "#2a2127"} />
    <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="hidden">
      <rect width={w} height={h} fill={night ? "#0b1233" : "url(#dusk)"} />
      {!night && <circle cx={w * 0.7} cy={h * 0.85} r={w * 0.5} fill="url(#sun)" />}
      {night && <circle cx={w * 0.3} cy={h * (0.45 - moon * 0.08)} r={12} fill="#e8f0ff" />}
      {Array.from({ length: 9 }).map((_, i) => {
        const bw = 18 + random(`wv${i}`) * 16;
        const bh = 30 + random(`wh${i}`) * h * 0.4;
        const bx = (i * (w / 8) - scroll * 0.1) % w;
        return <rect key={i} x={bx} y={h - bh} width={bw} height={bh} fill={night ? "#142048" : "#3a2d52"} />;
      })}
    </svg>
    <rect x={x + w / 2 - 2} y={y} width={4} height={h} fill={night ? "#0d1330" : "#2a2127"} />
    <rect x={x} y={y + h / 2 - 2} width={w} height={4} fill={night ? "#0d1330" : "#2a2127"} />
  </g>
);

export const FloorLamp: React.FC<{ x: number; floorY?: number }> = ({ x, floorY = 600 }) => (
  <g>
    <polygon points={`${x - 26},${floorY - 250} ${x + 26},${floorY - 250} ${x + 120},${floorY} ${x - 120},${floorY}`} fill="url(#cone)" opacity={0.55} />
    <rect x={x - 2} y={floorY - 240} width={4} height={240} fill="#2a2127" />
    <path d={`M${x - 26} ${floorY - 240} L${x - 16} ${floorY - 275} L${x + 16} ${floorY - 275} L${x + 26} ${floorY - 240} Z`} fill="#ffd9a0" />
  </g>
);

export const CeilingLight: React.FC<{ x: number; floorY?: number }> = ({ x, floorY = 600 }) => (
  <g>
    <polygon points={`${x - 14},40 ${x + 14},40 ${x + 190},${floorY} ${x - 190},${floorY}`} fill="url(#cone)" opacity={0.5} />
    <path d={`M${x - 20} 30 L${x + 20} 30 L${x + 12} 46 L${x - 12} 46 Z`} fill="#ffd9a0" />
  </g>
);

export const Table: React.FC<{ x: number; floorY?: number; w?: number }> = ({ x, floorY = 600, w = 280 }) => (
  <g>
    <rect x={x - w / 2} y={floorY - 118} width={w} height={10} fill="#241d27" />
    <rect x={x - w / 2 + 12} y={floorY - 108} width={8} height={108} fill="#241d27" />
    <rect x={x + w / 2 - 20} y={floorY - 108} width={8} height={108} fill="#241d27" />
  </g>
);

export const Chair: React.FC<{ x: number; floorY?: number; flip?: 1 | -1 }> = ({ x, floorY = 600, flip = 1 }) => (
  <g transform={`translate(${x} ${floorY}) scale(${flip} 1)`} fill="#241d27">
    <rect x={-24} y={-52} width={48} height={7} />
    <rect x={-22} y={-45} width={6} height={45} />
    <rect x={16} y={-45} width={6} height={45} />
    <rect x={-26} y={-120} width={6} height={72} />
  </g>
);

export const Corkboard: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x} y={y} width={360} height={270} fill="#9a7650" stroke="#6a4d33" strokeWidth={8} />
    <rect x={x + 22} y={y + 36} width={52} height={64} fill="#ffe08a" />
    <rect x={x + 22} y={y + 130} width={60} height={50} fill="#9cd0ff" />
    <rect x={x + 276} y={y + 150} width={64} height={50} fill="#9cd0ff" />
    <Poster x={x + 110} y={y + 20} s={0.62} />
  </g>
);

export const Poster: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect width={200} height={290} fill="#f4f1ea" />
    <rect width={200} height={56} fill="#f2552c" />
    <text x={100} y={36} textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontWeight={800} fontSize={22} fill="#fff">
      VOLUNTEERS
    </text>
    <text x={100} y={92} textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontWeight={800} fontSize={30} fill="#222">
      NEEDED
    </text>
    <circle cx={86} cy={140} r={22} fill="none" stroke="#6a4de0" strokeWidth={4} />
    <circle cx={114} cy={140} r={22} fill="none" stroke="#6a4de0" strokeWidth={4} />
    <text x={100} y={196} textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontWeight={800} fontSize={20} fill="#222">
      MEMORY STUDY
    </text>
    <rect x={20} y={212} width={160} height={34} fill="#fde5db" />
    <text x={100} y={236} textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontWeight={800} fontSize={17} fill="#f2552c">
      3 NIGHTS · $50
    </text>
    {[0, 1, 2].map((i) => (
      <rect key={i} x={24} y={256 + i * 8} width={152} height={2} fill="#bbb" />
    ))}
  </g>
);

export const Machine: React.FC<{ x: number; floorY?: number; shake?: number; redOn?: boolean; t: number }> = ({
  x,
  floorY = 600,
  shake = 0,
  redOn,
  t,
}) => {
  const jx = shake ? Math.sin(t * 70) * 3 : 0;
  return (
    <g transform={`translate(${x + jx} ${floorY})`}>
      <rect x={-48} y={-280} width={96} height={280} rx={6} fill="#2c3552" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-26} y={-250 + i * 34} width={52} height={10} rx={3} fill="#1a2238" />
      ))}
      <circle cx={20} cy={-264} r={7} fill={redOn ? (Math.sin(t * 9) > 0 ? "#ff4a3a" : "#5a1410") : "#44e0b0"} />
      {redOn && <circle cx={20} cy={-264} r={34} fill="url(#glowRed)" />}
      <path d="M0 -280 L90 -340 L180 -290" stroke="#aeb8d8" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M150 -280 a34 22 0 0 1 68 0 Z" fill="#e8ecf8" />
    </g>
  );
};

export const Monitor: React.FC<{ x: number; y: number; t: number; alert?: boolean; label?: string }> = ({ x, y, t, alert, label = "SLEEP · STAGE 3" }) => {
  const pts = Array.from({ length: 41 }).map((_, i) => {
    const px = (i / 40) * 150;
    const amp = alert ? 18 : 9;
    return `${i ? "L" : "M"}${px} ${Math.sin(i * 0.7 - t * 5) * amp}`;
  });
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={190} height={104} rx={6} fill="#071a2e" stroke="#2c4a6a" strokeWidth={4} />
      <text x={14} y={22} fontFamily="Poppins, Arial, sans-serif" fontWeight={700} fontSize={10} fill="#7fd6ff" letterSpacing={1}>
        {label}
      </text>
      <g transform="translate(20 62)">
        <path d={pts.join(" ")} stroke={alert ? "#ff6a5a" : "#5fe8d8"} strokeWidth={2.5} fill="none" />
      </g>
    </g>
  );
};

export const Bed: React.FC<{ x: number; floorY?: number; w?: number; night?: boolean }> = ({ x, floorY = 600, w = 360, night }) => (
  <g transform={`translate(${x} ${floorY})`}>
    <rect x={-w / 2} y={-92} width={w} height={22} rx={8} fill={night ? "#c9d4f2" : "#6a5a66"} />
    <rect x={-w / 2 + 14} y={-70} width={8} height={70} fill="#2a2330" />
    <rect x={w / 2 - 22} y={-70} width={8} height={70} fill="#2a2330" />
    <rect x={-w / 2 + 6} y={-112} width={70} height={22} rx={10} fill={night ? "#e8eeff" : "#8a7a86"} />
  </g>
);

export const Couch: React.FC<{ x: number; floorY?: number }> = ({ x, floorY = 600 }) => (
  <g transform={`translate(${x} ${floorY})`}>
    <rect x={-150} y={-120} width={300} height={74} rx={14} fill="#5a3f4e" />
    <rect x={-170} y={-96} width={40} height={96} rx={12} fill="#4a3341" />
    <rect x={130} y={-96} width={40} height={96} rx={12} fill="#4a3341" />
    <rect x={-150} y={-60} width={300} height={44} rx={10} fill="#6a4d5d" />
  </g>
);

export const TV: React.FC<{ x: number; floorY?: number; t: number }> = ({ x, floorY = 600, t }) => (
  <g transform={`translate(${x} ${floorY})`}>
    <rect x={-120} y={-250} width={240} height={140} rx={6} fill="#0d1224" stroke="#2a3150" strokeWidth={5} />
    <rect x={-112} y={-242} width={224} height={124} fill={`hsl(${(t * 40) % 360},40%,${22 + 8 * Math.sin(t * 3)}%)`} />
    <rect x={-120} y={-110} width={240} height={110} fill="#241d27" />
  </g>
);

export const Shelf: React.FC<{ x: number; floorY?: number; built: number }> = ({ x, floorY = 600, built }) => (
  <g transform={`translate(${x} ${floorY})`} stroke="#e0b96a" strokeWidth={8} strokeLinecap="round" fill="none">
    <line x1={-60} y1={0} x2={-60} y2={-250 * built} />
    <line x1={60} y1={0} x2={60} y2={-250 * built} />
    {[0.25, 0.55, 0.85].map((k) => (
      <line key={k} x1={-60} y1={-250 * k} x2={60} y2={-250 * k} opacity={built > k ? 1 : 0} />
    ))}
  </g>
);

export const Planks: React.FC<{ x: number; floorY?: number }> = ({ x, floorY = 600 }) => (
  <g stroke="#c89a4a" strokeWidth={12} strokeLinecap="round">
    <line x1={x} y1={floorY} x2={x + 36} y2={floorY - 110} />
    <line x1={x + 22} y1={floorY} x2={x + 56} y2={floorY - 120} />
    <line x1={x + 44} y1={floorY} x2={x + 74} y2={floorY - 100} />
  </g>
);

// ---------------------------------------------------------------- characters
const legPts = (hipY: number, a: number, bend: number) => {
  const kx = Math.sin(a) * 42;
  const ky = hipY + Math.cos(a) * 42;
  const b = a - bend;
  return { kx, ky, fx: kx + Math.sin(b) * 42, fy: ky + Math.cos(b) * 42 };
};

export type CharProps = {
  x: number;
  y: number;
  s?: number;
  face?: 1 | -1;
  pose: "stand" | "walk" | "sit" | "ride" | "lie" | "point";
  t: number;
  shirt?: string;
  pants?: string;
  mood?: Mood;
  look?: number;
  ponytail?: boolean;
  glasses?: boolean;
  cap?: string;
  hold?: "cup" | "papers" | "bill" | "tool" | null;
  seat?: number;
  blink?: boolean;
  rim?: boolean;
};

export const Char: React.FC<CharProps> = ({
  x,
  y,
  s = 1.4,
  face = 1,
  pose,
  t,
  shirt = ORANGE,
  pants = "#1c1a24",
  mood = "neutral",
  look = 0,
  ponytail,
  glasses,
  cap,
  hold = null,
  seat = 48,
  blink,
  rim = true,
}) => {
  const ph = t * 7.5;
  const walk = pose === "walk";
  const sit = pose === "sit" || pose === "ride";
  const hipY = sit ? -seat : -85;
  const lean = pose === "ride" ? 0.2 : 0;
  const aA = walk ? Math.sin(ph) * 0.55 : sit ? (pose === "ride" ? 1.15 : 1.45) : 0.03;
  const aB = walk ? -Math.sin(ph) * 0.55 : sit ? (pose === "ride" ? 1.0 : 1.35) : -0.03;
  const bendA = walk ? Math.max(0, -Math.sin(ph + 0.5)) * 0.9 : sit ? (pose === "ride" ? 1.1 : 1.35) : 0;
  const bendB = walk ? Math.max(0, Math.sin(ph + 0.5)) * 0.9 : sit ? (pose === "ride" ? 1.0 : 1.3) : 0;
  const la = legPts(hipY, aA, bendA);
  const lb = legPts(hipY, aB, bendB);
  const sh = { x: Math.sin(lean) * 62, y: hipY - Math.cos(lean) * 62 };
  const hd = { x: sh.x + Math.sin(lean) * 24, y: sh.y - Math.cos(lean) * 24 };
  let ua = walk ? -Math.sin(ph) * 0.6 : 0.08;
  let fa = ua + 0.4;
  let ub = walk ? Math.sin(ph) * 0.6 : 0.0;
  let fb = ub + 0.4;
  if (pose === "point") {
    ua = 1.55;
    fa = 1.55;
  }
  if (pose === "ride") {
    ua = 1.0;
    fa = 1.25;
    ub = 1.0;
    fb = 1.25;
  }
  if (hold === "cup") {
    ua = 0.95;
    fa = 2.0;
  }
  if (hold === "papers" || hold === "bill") {
    ua = 0.6;
    fa = 1.45;
  }
  if (hold === "tool") {
    ua = 1.2;
    fa = 1.6 + Math.sin(t * 9) * 0.25;
  }
  const arm = (a1: number, a2: number) => {
    const ex = sh.x + Math.sin(a1) * 28;
    const ey = sh.y + 6 + Math.cos(a1) * 28;
    const hx = ex + Math.sin(a2) * 27;
    const hy = ey + Math.cos(a2) * 27;
    return { ex, ey, hx, hy };
  };
  const A = arm(ua, fa);
  const B = arm(ub, fb);
  const far = "#14121c";
  const e1 = { x: hd.x + 6, y: hd.y - 3 };
  const e2 = { x: hd.x + 15, y: hd.y - 3 };
  const eyeR = blink || mood === "sleep" ? 0.6 : 3.4;
  const mouth = (() => {
    const mx = hd.x + 11;
    const my = hd.y + 8;
    if (mood === "happy") return <path d={`M${mx - 5} ${my - 1} Q${mx} ${my + 6} ${mx + 6} ${my - 1}`} stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" />;
    if (mood === "worry") return <path d={`M${mx - 6} ${my + 2} q3 -4 6 0 t6 0`} stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" />;
    if (mood === "surprised") return <ellipse cx={mx} cy={my + 1} rx={3} ry={4} fill="#fff" />;
    if (mood === "angry") return <path d={`M${mx - 5} ${my + 3} Q${mx} ${my - 2} ${mx + 6} ${my + 3}`} stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" />;
    return <path d={`M${mx - 4} ${my} L${mx + 5} ${my}`} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />;
  })();
  const brows = (() => {
    if (mood === "worry") return (
      <>
        <path d={`M${e1.x - 4} ${e1.y - 8} L${e1.x + 3} ${e1.y - 11}`} stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
        <path d={`M${e2.x - 3} ${e2.y - 11} L${e2.x + 4} ${e2.y - 8}`} stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
      </>
    );
    if (mood === "angry") return (
      <>
        <path d={`M${e1.x - 4} ${e1.y - 11} L${e1.x + 3} ${e1.y - 8}`} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
        <path d={`M${e2.x - 3} ${e2.y - 8} L${e2.x + 4} ${e2.y - 11}`} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
      </>
    );
    return null;
  })();
  const lying = pose === "lie";
  const body = (
    <g>
      {/* far limbs */}
      <line x1={0} y1={hipY} x2={lb.kx} y2={lb.ky} stroke={far} strokeWidth={11} strokeLinecap="round" />
      <line x1={lb.kx} y1={lb.ky} x2={lb.fx} y2={lb.fy} stroke={far} strokeWidth={10} strokeLinecap="round" />
      <ellipse cx={lb.fx + 5} cy={lb.fy} rx={9} ry={4} fill={far} />
      <line x1={sh.x} y1={sh.y + 6} x2={B.ex} y2={B.ey} stroke={shirt} opacity={0.7} strokeWidth={10} strokeLinecap="round" />
      <line x1={B.ex} y1={B.ey} x2={B.hx} y2={B.hy} stroke={shirt} opacity={0.7} strokeWidth={9} strokeLinecap="round" />
      {/* torso */}
      <line x1={0} y1={hipY} x2={sh.x} y2={sh.y} stroke={shirt} strokeWidth={30} strokeLinecap="round" />
      {/* head */}
      {ponytail && <ellipse cx={hd.x - 22} cy={hd.y + 8} rx={7} ry={14} fill={SKIN} />}
      <circle cx={hd.x} cy={hd.y} r={21} fill={SKIN} />
      {rim && <path d={`M${hd.x - 12} ${hd.y - 18} A21 21 0 0 0 ${hd.x - 12} ${hd.y + 18}`} stroke={AMBER} strokeWidth={2.4} fill="none" opacity={0.8} />}
      {cap && (
        <>
          <path d={`M${hd.x - 21} ${hd.y - 4} A21 21 0 0 1 ${hd.x + 21} ${hd.y - 4} Z`} fill={cap} />
          <rect x={hd.x + 8} y={hd.y - 8} width={22} height={5} rx={2} fill={cap} />
        </>
      )}
      <ellipse cx={e1.x} cy={e1.y} rx={3.4} ry={eyeR} fill="#fff" />
      <ellipse cx={e2.x} cy={e2.y} rx={3.4} ry={eyeR} fill="#fff" />
      {eyeR > 1 && (
        <>
          <circle cx={e1.x + look * 1.4} cy={e1.y} r={1.5} fill={SKIN} />
          <circle cx={e2.x + look * 1.4} cy={e2.y} r={1.5} fill={SKIN} />
        </>
      )}
      {glasses && (
        <>
          <circle cx={e1.x} cy={e1.y} r={6} stroke="#fff" strokeWidth={1.4} fill="none" />
          <circle cx={e2.x} cy={e2.y} r={6} stroke="#fff" strokeWidth={1.4} fill="none" />
        </>
      )}
      {brows}
      {mouth}
      {/* near limbs */}
      <line x1={0} y1={hipY} x2={la.kx} y2={la.ky} stroke={pants} strokeWidth={12} strokeLinecap="round" />
      <line x1={la.kx} y1={la.ky} x2={la.fx} y2={la.fy} stroke={pants} strokeWidth={11} strokeLinecap="round" />
      <ellipse cx={la.fx + 6} cy={la.fy} rx={10} ry={4.5} fill={pants} />
      <line x1={sh.x} y1={sh.y + 6} x2={A.ex} y2={A.ey} stroke={shirt} strokeWidth={11} strokeLinecap="round" />
      <line x1={A.ex} y1={A.ey} x2={A.hx} y2={A.hy} stroke={shirt} strokeWidth={10} strokeLinecap="round" />
      <circle cx={A.hx} cy={A.hy} r={5} fill={SKIN} />
      {hold === "cup" && <rect x={A.hx - 5} y={A.hy - 14} width={11} height={13} rx={2} fill="#f4f1ea" />}
      {hold === "papers" && <rect x={A.hx - 4} y={A.hy - 18} width={22} height={28} fill="#f4f1ea" transform={`rotate(-12 ${A.hx} ${A.hy})`} />}
      {hold === "bill" && <rect x={A.hx - 2} y={A.hy - 10} width={26} height={14} fill="#5ec27a" />}
      {hold === "tool" && <line x1={A.hx} y1={A.hy} x2={A.hx + 18} y2={A.hy - 6} stroke="#cfd6ea" strokeWidth={4} strokeLinecap="round" />}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s * face} ${s})`}>
      {lying ? <g transform={`translate(0 ${-14}) rotate(-90)`}>{body}</g> : body}
    </g>
  );
};

// ---------------------------------------------------------------- moped
export const Moped: React.FC<{ x: number; y: number; s?: number; t: number; dist: number }> = ({ x, y, s = 1.25, t, dist }) => {
  const spin = (dist / 24) * 57.3;
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} -30) rotate(${spin})`}>
      <circle r={30} fill="#20202c" stroke={AMBER} strokeWidth={3} />
      <circle r={7} fill="#6a6a80" />
      <line x1={-26} y1={0} x2={26} y2={0} stroke="#44445a" strokeWidth={3} />
      <line x1={0} y1={-26} x2={0} y2={26} stroke="#44445a" strokeWidth={3} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <polygon points="40,-60 330,-60 360,-8 60,-8" fill="#fff" opacity={0.0} />
      <polygon points="70,-60 700,-80 700,-20 70,-30" fill="url(#cone)" opacity={0.0} />
      {wheel(-70)}
      {wheel(70)}
      <path d="M-70 -30 L-30 -60 L40 -60 L70 -30" stroke="#4a4a62" strokeWidth={9} fill="none" strokeLinecap="round" />
      <rect x={-40} y={-74} width={60} height={14} rx={5} fill="#2a2a3a" />
      <path d="M70 -30 L56 -96" stroke="#4a4a62" strokeWidth={8} strokeLinecap="round" />
      <rect x={-92} y={-112} width={44} height={34} rx={5} fill="#1d8f86" />
      <polygon points="76,-84 310,-120 310,-40 76,-70" fill="url(#cone)" opacity={0.5} />
      <circle cx={78} cy={-86} r={6} fill="#fff3c9" />
      <Char x={-8} y={-30} s={1} face={1} pose="ride" t={t} mood="happy" seat={38} rim />
    </g>
  );
};

// ---------------------------------------------------------------- big face
export const BigFace: React.FC<{ cx: number; cy: number; r: number; mood: Mood; t: number; look?: number; blink?: boolean }> = ({
  cx,
  cy,
  r,
  mood,
  t,
  look = 0,
  blink,
}) => {
  const k = r / 110;
  const wob = mood === "worry" ? Math.sin(t * 9) * 1.5 : 0;
  const eyeRy = blink ? 2 : 18;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k})`}>
      <circle r={112} fill="none" stroke={AMBER} strokeWidth={4} opacity={0.35} />
      <circle r={110} fill={SKIN} />
      <path d="M-100 -50 A108 108 0 0 1 20 -108" stroke={AMBER} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} />
      <ellipse cx={-38 + look * 4} cy={-10} rx={17} ry={eyeRy} fill="#fff" />
      <ellipse cx={38 + look * 4} cy={-10} rx={17} ry={eyeRy} fill="#fff" />
      {mood === "worry" && (
        <>
          <path d="M-62 -42 L-24 -52" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
          <path d="M24 -52 L62 -42" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
          <path d={`M-30 ${56 + wob} q15 -18 30 0 t30 0`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === "neutral" && <path d="M-26 56 L26 56" stroke="#fff" strokeWidth={6} strokeLinecap="round" />}
      {mood === "happy" && <path d="M-34 44 Q0 82 34 44" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />}
      {mood === "surprised" && <ellipse cy={58} rx={12} ry={16} fill="#fff" />}
    </g>
  );
};

// ---------------------------------------------------------------- UI bits
export const GlassCard: React.FC<{ x: number; y: number; label: string; icon: "book" | "pot" | "bill"; a: number }> = ({ x, y, label, icon, a }) => (
  <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * a})`} opacity={a}>
    <rect x={-110} y={-80} width={220} height={160} rx={18} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
    {icon === "book" && <path d="M-34 -28 L0 -18 L34 -28 L34 14 L0 24 L-34 14 Z M0 -18 L0 24" fill="#8fc6ff" stroke="#2a3a60" strokeWidth={3} />}
    {icon === "pot" && (
      <g fill="#ff9aa8">
        <rect x={-34} y={-16} width={68} height={38} rx={8} />
        <rect x={-46} y={-20} width={92} height={7} rx={3} />
        <path d="M-12 -34 q-6 -10 0 -18 M10 -34 q-6 -10 0 -18" stroke="#ffd0d6" strokeWidth={3} fill="none" />
      </g>
    )}
    {icon === "bill" && (
      <g>
        <rect x={-34} y={-30} width={68} height={52} rx={4} fill="#ffe08a" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-22} y={-16 + i * 12} width={44} height={4} fill="#a07a20" />
        ))}
      </g>
    )}
    <text y={62} textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontWeight={700} fontSize={22} letterSpacing={3} fill="#fff">
      {label}
    </text>
  </g>
);

export const Label: React.FC<{ t: number; from: number; to: number; x: number; y: number; size?: number; color?: string; anchor?: "start" | "middle" | "end"; children: React.ReactNode }> = ({
  t,
  from,
  to,
  x,
  y,
  size = 34,
  color = "#fff",
  anchor = "middle",
  children,
}) => {
  if (t < from || t > to) return null;
  const o = interpolate(t, [from, from + 0.25, to - 0.3, to], [0, 1, 1, 0], clamp);
  const dy = interpolate(t, [from, from + 0.3], [10, 0], clamp);
  return (
    <text x={x} y={y + dy} textAnchor={anchor} opacity={o} fontFamily="Poppins, Arial, sans-serif" fontWeight={800} fontSize={size} letterSpacing={3} fill={color} style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
      {children}
    </text>
  );
};
