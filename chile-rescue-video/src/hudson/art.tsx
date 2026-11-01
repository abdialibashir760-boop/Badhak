import React from "react";
import { Astro, SKIN } from "../apollo13/art";
import { clamp, rng } from "../common/math";

export const font = "Inter, 'Helvetica Neue', Arial, sans-serif";

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

/** Winter-afternoon sky, extended well past the portrait edges. */
export const Sky: React.FC<{ uid: string; t: number; dim?: number }> = ({ uid, t, dim = 0 }) => (
  <g>
    <defs>
      <linearGradient id={`${uid}s`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={1000}>
        <stop offset="0" stopColor="#5f94c9" />
        <stop offset="1" stopColor="#dcebf6" />
      </linearGradient>
    </defs>
    <rect x={-1500} y={-1400} width={4200} height={2800} fill={`url(#${uid}s)`} />
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} opacity={0.85}>
        <ellipse cx={80 + i * 270 + ((t * 6 + i * 50) % 1400) - 300} cy={420 + (i % 3) * 70} rx={120} ry={30} fill="#fff" />
        <ellipse cx={130 + i * 270 + ((t * 6 + i * 50) % 1400) - 300} cy={400 + (i % 3) * 70} rx={80} ry={26} fill="#fff" />
      </g>
    ))}
    {dim > 0 && <rect x={-1500} y={-1400} width={4200} height={2800} fill="#0a1020" opacity={dim} />}
  </g>
);

const BUILDINGS = (() => {
  const r = rng(77);
  let x = -1400;
  const out: { x: number; w: number; h: number; c: string }[] = [];
  while (x < 2600) {
    const w = 38 + r() * 56;
    out.push({ x, w, h: 90 + r() * 260 + (Math.abs(x - 560) < 300 ? 90 : 0), c: ["#3c4b66", "#46566f", "#34425b", "#51607a"][Math.floor(r() * 4)] });
    x += w + 2 + r() * 6;
  }
  return out;
})();

/** Manhattan-style skyline standing on `base`. */
export const Skyline: React.FC<{ base: number; opacity?: number }> = ({ base, opacity = 1 }) => (
  <g opacity={opacity}>
    {BUILDINGS.map((b, i) => (
      <g key={i}>
        <rect x={b.x} y={base - b.h} width={b.w} height={b.h} fill={b.c} />
        {Array.from({ length: Math.floor(b.h / 26) }).map((_, k) => (
          <rect key={k} x={b.x + 6} y={base - b.h + 10 + k * 26} width={b.w - 12} height={4} fill="#9fb4d0" opacity={0.28} />
        ))}
      </g>
    ))}
    <rect x={548} y={base - 520} width={8} height={90} fill="#46566f" />
  </g>
);

export const River: React.FC<{ top: number; bottom?: number; t: number; glow?: number }> = ({ top, bottom = 1500, t, glow = 0 }) => (
  <g>
    <defs>
      <linearGradient id="rv" gradientUnits="userSpaceOnUse" x1={0} y1={top} x2={0} y2={bottom}>
        <stop offset="0" stopColor="#5b86ad" />
        <stop offset="1" stopColor="#1f3a57" />
      </linearGradient>
    </defs>
    <rect x={-1500} y={top} width={4200} height={bottom - top + 1500} fill="url(#rv)" />
    {Array.from({ length: 16 }).map((_, i) => (
      <path key={i} d={`M${-200 + i * 150 + ((t * 20 + i * 30) % 150)} ${top + 40 + (i % 5) * 60} q25 -10 50 0 t50 0`} fill="none" stroke="#cfe6f6" strokeWidth={4} opacity={0.45} />
    ))}
    {glow > 0 && <rect x={-1500} y={top} width={4200} height={240} fill="none" stroke="#7fd4ff" strokeWidth={8} opacity={glow * (0.5 + 0.4 * Math.sin(t * 6))} />}
  </g>
);

/** Airbus-style airliner, side view, generic livery. Origin = middle of the fuselage. */
export const Plane: React.FC<{ x: number; y: number; s?: number; rot?: number; smoke?: boolean; t?: number; flip?: boolean }> = ({ x, y, s = 1, rot = 0, smoke = false, t = 0, flip = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    <polygon points="-210,-26 -150,-112 -118,-112 -150,-26" fill="#1f4e8c" />
    <polygon points="-205,2 -105,-14 -112,14 -190,18" fill="#d5dbe3" />
    <rect x={-210} y={-32} width={420} height={64} rx={32} fill="#f4f6f8" />
    <rect x={-200} y={8} width={400} height={8} fill="#aab6c4" opacity={0.7} />
    <path d="M150 -20 L182 -20 L190 -4 L150 -4 Z" fill="#6fa8dc" />
    {Array.from({ length: 24 }).map((_, i) => (
      <circle key={i} cx={-160 + i * 11} cy={-8} r={3} fill="#5a7ea6" />
    ))}
    <polygon points="-30,10 70,10 20,74 -60,74" fill="#cfd6df" />
    <ellipse cx={24} cy={42} rx={36} ry={16} fill="#aeb8c4" />
    <ellipse cx={52} cy={42} rx={6} ry={12} fill="#e8edf2" />
    {smoke &&
      Array.from({ length: 14 }).map((_, i) => {
        const age = (t * 1.1 + i / 14) % 1;
        return <circle key={i} cx={-12 - age * 220} cy={42 + age * 30 + Math.sin(i) * 6} r={8 + age * 22} fill="#4a4f58" opacity={(1 - age) * 0.7} />;
      })}
  </g>
);

export const Geese: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 13 }).map((_, i) => {
      const row = Math.ceil(i / 2);
      const side = i % 2 ? 1 : -1;
      const flap = Math.sin(t * 9 + i * 0.7);
      const bx = side * row * 34;
      const by = row * 22 + (i === 0 ? 0 : 0);
      return (
        <path
          key={i}
          transform={`translate(${i === 0 ? 0 : bx} ${i === 0 ? 0 : by})`}
          d={`M0 0 Q-14 ${-10 * flap} -30 -2 Q-14 -2 0 3 Q14 -2 30 -2 Q14 ${-10 * flap} 0 0 Z`}
          fill="#2a2e36"
        />
      );
    })}
  </g>
);

/** A pilot: the shared flat figure in a navy uniform with a cap. */
export const Pilot: React.FC<{ x: number; y: number; s?: number; t?: number; skin?: string; pose?: "bust" | "stand" | "cheer" | "wave" }> = ({ x, y, s = 1, t = 0, skin = SKIN[0], pose = "bust" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Astro x={0} y={0} s={1} suit="#1d2d4d" hair="#4a3a2c" skin={skin} pose={pose} t={t} />
    <path d="M-31 -192 Q0 -236 31 -192 L35 -186 L-35 -186 Z" fill="#14203a" />
    <rect x={-28} y={-198} width={56} height={9} rx={3} fill="#c9a227" />
    <rect x={-6} y={-163} width={12} height={5} fill="#c9a227" opacity={0} />
    <path d="M-34 -132 h14 M20 -132 h14" stroke="#e8c85a" strokeWidth={5} />
  </g>
);

export const Ferry: React.FC<{ x: number; y: number; s?: number; flip?: boolean; people?: number; t?: number }> = ({ x, y, s = 1, flip = false, people = 0, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M-120 0 L120 0 L96 36 L-96 36 Z" fill="#1c3a63" />
    <rect x={-110} y={-6} width={220} height={8} fill="#f4f6f8" />
    <rect x={-80} y={-48} width={150} height={44} rx={6} fill="#f4f6f8" />
    {[-60, -30, 0, 30, 54].map((wx) => (
      <rect key={wx} x={wx} y={-40} width={18} height={16} rx={3} fill="#6fa8dc" />
    ))}
    <rect x={-40} y={-76} width={70} height={30} rx={5} fill="#e8edf3" />
    <rect x={-6} y={-96} width={12} height={22} fill="#c0392b" />
    {Array.from({ length: people }).map((_, i) => (
      <circle key={i} cx={-96 + i * 14} cy={-14 + Math.sin(t * 3 + i) * 1.5} r={5} fill={["#f0892a", "#2f6fb2", "#d9d3c4"][i % 3]} />
    ))}
  </g>
);

export const Timer: React.FC<{ x: number; y: number; text: string; size?: number; color?: string }> = ({ x, y, text, size = 120, color = "#fff" }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-size * 2.2} y={-size * 0.95} width={size * 4.4} height={size * 1.3} rx={size * 0.22} fill="#0b1220" opacity={0.85} stroke="#f2b705" strokeWidth={6} />
    <text x={0} y={size * 0.1} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={size} fill={color} letterSpacing={size * 0.04}>
      {text}
    </text>
  </g>
);

export const fmt = (sec: number) => {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
export const clampI = (v: number) => clamp(v);
