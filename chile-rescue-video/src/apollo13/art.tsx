import React from "react";
import { clamp, rng } from "../common/math";

const font = "Inter, 'Helvetica Neue', Arial, sans-serif";

// ---- backgrounds ----------------------------------------------------------
const STARS = (() => {
  const r = rng(42);
  return Array.from({ length: 150 }).map(() => ({ x: r() * 1080, y: r() * 1920, s: 0.7 + r() * 2, ph: r() * 6, k: 0.6 + r() * 1.8 }));
})();

export const Space: React.FC<{ t: number; top?: string; bottom?: string; stars?: number }> = ({ t, top = "#03050d", bottom = "#0d1530", stars = 1 }) => {
  const id = `sp${top.slice(1)}${bottom.slice(1)}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill={`url(#${id})`} />
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={stars * (0.35 + 0.45 * Math.sin(t * s.k + s.ph) ** 2)} />
      ))}
    </g>
  );
};

const LAND = (() => {
  const r = rng(9);
  return Array.from({ length: 7 }).map(() => {
    const cx = (r() - 0.5) * 1.7;
    const cy = (r() - 0.5) * 1.5;
    const pts = Array.from({ length: 9 }).map((_, k) => {
      const a = (k / 9) * 6.283;
      const rad = 0.18 + r() * 0.2;
      return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.8] as [number, number];
    });
    return { pts, tone: r() };
  });
})();

export const Earth: React.FC<{ x: number; y: number; r: number; t?: number; uid: string }> = ({ x, y, r, t = 0, uid }) => {
  const rot = ((t * 0.01) % 1) * 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={`${uid}g`}>
          <stop offset="0.9" stopColor="#7cc4ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7cc4ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}s`} cx="0.3" cy="0.3" r="0.9">
          <stop offset="0.4" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.72" />
        </radialGradient>
        <clipPath id={`${uid}c`}>
          <circle r={r} />
        </clipPath>
      </defs>
      <circle r={r * 1.07} fill={`url(#${uid}g)`} />
      <circle r={r} fill="#2767b0" />
      <g clipPath={`url(#${uid}c)`}>
        {[-2, 0, 2].map((o) => (
          <g key={o} transform={`translate(${(((rot + o) % 4) - 2) * r} 0)`}>
            {LAND.map((l, i) => (
              <polygon key={i} points={l.pts.map((p) => `${p[0] * r},${p[1] * r}`).join(" ")} fill={l.tone > 0.5 ? "#4e9b5b" : "#a8935a"} />
            ))}
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx={Math.sin(i * 2.1) * r * 0.6} cy={(i - 2) * r * 0.36} rx={r * 0.42} ry={r * 0.05} fill="#fff" opacity={0.5} />
        ))}
        <circle r={r} fill={`url(#${uid}s)`} />
      </g>
    </g>
  );
};

const CRATERS = (() => {
  const r = rng(77);
  return Array.from({ length: 11 }).map(() => ({ a: r() * 6.283, d: Math.sqrt(r()) * 0.8, s: 0.06 + r() * 0.13 }));
})();

export const Moon: React.FC<{ x: number; y: number; r: number; uid: string }> = ({ x, y, r, uid }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <radialGradient id={`${uid}m`} cx="0.35" cy="0.3" r="0.9">
        <stop offset="0" stopColor="#d9dce2" />
        <stop offset="1" stopColor="#8d929c" />
      </radialGradient>
    </defs>
    <circle r={r} fill={`url(#${uid}m)`} />
    {CRATERS.map((c, i) => (
      <g key={i}>
        <circle cx={Math.cos(c.a) * c.d * r} cy={Math.sin(c.a) * c.d * r} r={c.s * r} fill="#9a9fa9" />
        <circle cx={Math.cos(c.a) * c.d * r + c.s * r * 0.15} cy={Math.sin(c.a) * c.d * r + c.s * r * 0.15} r={c.s * r * 0.8} fill="#868b95" />
      </g>
    ))}
  </g>
);

// ---- spacecraft -----------------------------------------------------------------
/** Origin = junction of command and service module. Y grows downward: LM above, bell below. */
export const Stack: React.FC<{
  x: number;
  y: number;
  s?: number;
  rot?: number;
  lm?: boolean;
  cm?: boolean;
  sm?: boolean;
  panelOff?: number; // 0..1: the fuel-cell panel is blown away
}> = ({ x, y, s = 1, rot = 0, lm = true, cm = true, sm = true, panelOff = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {sm && (
      <g>
        <path d="M-26 190 L26 190 L46 248 L-46 248 Z" fill="#7d848f" />
        <ellipse cx={0} cy={248} rx={46} ry={8} fill="#454a53" />
        <rect x={-60} y={0} width={120} height={192} rx={6} fill="#d8dce2" />
        <rect x={-60} y={44} width={120} height={14} fill="#2a2d33" />
        <rect x={-60} y={150} width={120} height={8} fill="#2a2d33" opacity={0.7} />
        {[-20, 20].map((px) => (
          <line key={px} x1={px} x2={px} y1={0} y2={192} stroke="#aab0ba" strokeWidth={2} />
        ))}
        <rect x={-62} y={76} width={16} height={26} rx={3} fill="#3a3e46" />
        <rect x={46} y={76} width={16} height={26} rx={3} fill="#3a3e46" />
        {panelOff > 0 ? (
          <g>
            <path d={`M26 58 L60 58 L60 150 L26 150 Z`} fill="#0b0e15" />
            <path d="M26 58 L36 70 L28 84 L40 98 L28 112 L38 128 L26 150" fill="none" stroke="#9aa1ac" strokeWidth={3} />
            <path d="M60 70 L50 82 L60 96" fill="none" stroke="#cfd4db" strokeWidth={4} />
          </g>
        ) : (
          <rect x={26} y={58} width={34} height={92} fill="#c4c9d1" />
        )}
      </g>
    )}
    {cm && (
      <g>
        <path d="M-60 0 L-26 -102 Q0 -116 26 -102 L60 0 Z" fill="#eef1f5" />
        <path d="M-60 0 L-26 -102 L-12 -104 L-34 0 Z" fill="#cfd4db" opacity={0.6} />
        <rect x={-60} y={-4} width={120} height={8} rx={3} fill="#b3b8c1" />
        <path d="M-8 -66 L12 -66 L8 -44 L-4 -44 Z" fill="#5a9bd0" />
        <rect x={-18} y={-120} width={36} height={14} rx={3} fill="#868d98" />
      </g>
    )}
    {lm && (
      <g>
        <path d="M-52 -112 L-58 -150 L-40 -206 L40 -206 L58 -150 L52 -112 Z" fill="#cdbb8a" />
        <path d="M-30 -168 L-8 -168 L-14 -146 L-26 -146 Z M8 -168 L30 -168 L26 -146 L14 -146 Z" fill="#1b2230" />
        <rect x={-16} y={-216} width={32} height={10} fill="#8a919b" />
        <line x1={40} y1={-206} x2={74} y2={-250} stroke="#cfd4db" strokeWidth={3} />
        <circle cx={76} cy={-254} r={9} fill="none" stroke="#cfd4db" strokeWidth={3} />
        <rect x={-84} y={-292} width={168} height={82} rx={5} fill="#d9a441" />
        {[-60, -20, 20, 60].map((px) => (
          <path key={px} d={`M${px} -292 L${px + 12} -210`} stroke="#b9852a" strokeWidth={3} />
        ))}
        {[-1, 1].map((d) => (
          <g key={d}>
            <line x1={d * 84} y1={-292} x2={d * 146} y2={-352} stroke="#2a2d33" strokeWidth={5} />
            <ellipse cx={d * 150} cy={-356} rx={20} ry={6} fill="#2a2d33" />
          </g>
        ))}
      </g>
    )}
  </g>
);

// ---- people ------------------------------------------------------------------------
export type AstroPose = "stand" | "bust" | "cheer" | "wave";
export const SKIN = ["#e5b48f", "#d9a37a", "#f0c9a6", "#c58d63"];
export const Astro: React.FC<{
  x: number;
  y: number;
  s?: number;
  skin?: string;
  hair?: string;
  suit?: string;
  pose?: AstroPose;
  t?: number;
  rot?: number;
  opacity?: number;
  gray?: boolean;
}> = ({ x, y, s = 1, skin = SKIN[0], hair = "#3b2b20", suit = "#4f7fc0", pose = "stand", t = 0, rot = 0, opacity = 1, gray = false }) => {
  const bob = Math.sin(t * 2.2 + x) * 1.5;
  const body = gray ? "#8a919c" : suit;
  const arm = (side: 1 | -1) => {
    let a = side * 6;
    if (pose === "cheer") a = side * (150 + Math.sin(t * 8 + side) * 14);
    if (pose === "wave" && side === 1) a = 150 + Math.sin(t * 9) * 20;
    return (
      <g transform={`translate(${side * 34} ${-134}) rotate(${-a})`}>
        <rect x={-8} y={0} width={16} height={78} rx={8} fill={body} />
        <circle cx={0} cy={82} r={9} fill={gray ? "#aab0ba" : skin} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${rot}) scale(${s})`} opacity={opacity}>
      {pose !== "bust" && (
        <g>
          <rect x={-28} y={-48} width={26} height={48} rx={8} fill={gray ? "#6f7580" : "#2f4a78"} />
          <rect x={2} y={-48} width={26} height={48} rx={8} fill={gray ? "#6f7580" : "#2f4a78"} />
          <rect x={-31} y={-8} width={30} height={10} rx={5} fill="#1b1f27" />
          <rect x={1} y={-8} width={30} height={10} rx={5} fill="#1b1f27" />
        </g>
      )}
      {arm(-1)}
      <rect x={-36} y={-146} width={72} height={pose === "bust" ? 100 : 104} rx={22} fill={body} />
      <circle cx={-14} cy={-112} r={10} fill="#d6342c" />
      <circle cx={-14} cy={-112} r={6} fill="#fff" opacity={0.85} />
      <path d="M-14 -148 L0 -132 L14 -148 Z" fill="#e8edf3" />
      {arm(1)}
      <rect x={-10} y={-160} width={20} height={16} rx={6} fill={gray ? "#aab0ba" : skin} />
      <circle cx={0} cy={-184} r={28} fill={gray ? "#aab0ba" : skin} />
      <path d="M-29 -190 Q-24 -218 0 -218 Q26 -218 29 -190 Q14 -206 -2 -204 Q-18 -204 -29 -190 Z" fill={gray ? "#59606b" : hair} />
      <circle cx={-9} cy={-182} r={2.6} fill="#2b1d14" />
      <circle cx={9} cy={-182} r={2.6} fill="#2b1d14" />
      <path d="M-8 -168 Q0 -162 8 -168" fill="none" stroke="#7a4a35" strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
};

// ---- effects & labels ------------------------------------------------------------------------
export const Plume: React.FC<{ x: number; y: number; dx: number; dy: number; t: number; n?: number; color?: string; size?: number; spread?: number; speed?: number }> = ({ x, y, dx, dy, t, n = 28, color = "#f4f8ff", size = 14, spread = 40, speed = 0.8 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const r = rng(900 + i);
      const age = (t * speed + i / n) % 1;
      const sx = (r() - 0.5) * spread * age;
      const sy = (r() - 0.5) * spread * age;
      return <circle key={i} cx={x + dx * age + sx} cy={y + dy * age + sy} r={size * (0.4 + age * 1.3) * (0.6 + r() * 0.6)} fill={color} opacity={(1 - age) * 0.7} />;
    })}
  </g>
);

export const Label: React.FC<{ x: number; y: number; text: string; size?: number; bg?: string; fg?: string; opacity?: number; anchor?: "middle" | "start" }> = ({ x, y, text, size = 34, bg = "#f2b705", fg = "#14161a", opacity = 1, anchor = "middle" }) => {
  const w = text.length * size * 0.6 + size * 1.2;
  const x0 = anchor === "middle" ? -w / 2 : 0;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect x={x0} y={-size * 0.95} width={w} height={size * 1.55} rx={size * 0.3} fill={bg} />
      <text x={x0 + w / 2} y={size * 0.2} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={size} fill={fg} letterSpacing={size * 0.04}>
        {text}
      </text>
    </g>
  );
};

export const Bar: React.FC<{ x: number; y: number; w: number; h: number; v: number; label: string; color: string; t?: number }> = ({ x, y, w, h, v, label, color }) => (
  <g transform={`translate(${x} ${y})`}>
    <text x={0} y={-14} fontFamily={font} fontWeight={800} fontSize={26} fill="#e8edf3" letterSpacing={2}>
      {label}
    </text>
    <rect width={w} height={h} rx={h / 2} fill="#0b101a" stroke="#3a4558" strokeWidth={3} />
    <rect x={4} y={4} width={Math.max(0, (w - 8) * clamp(v))} height={h - 8} rx={(h - 8) / 2} fill={color} />
  </g>
);

export const Fade: React.FC<{ a: number; children: React.ReactNode }> = ({ a, children }) => <g opacity={clamp(a)}>{children}</g>;
