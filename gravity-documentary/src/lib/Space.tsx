import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { H, W } from './camera';
import { BG } from './theme';
import { mulberry32, TAU } from './math';

const rng = mulberry32(20260611);
const STARS = Array.from({ length: 260 }, () => ({
  x: rng() * (W + 400) - 200,
  y: rng() * (H + 200) - 100,
  r: 0.5 + Math.pow(rng(), 3) * 1.9,
  base: 0.2 + rng() * 0.7,
  speed: 0.5 + rng() * 2,
  phase: rng() * TAU,
  depth: 0.2 + rng() * 0.8,
  tint: rng(),
}));

type StarProps = { driftX?: number; driftY?: number; zoom?: number; opacity?: number };

/** Parallax starfield with gentle twinkle. `zoom` scales stars outward from centre (for fly-through shots). */
export const Starfield: React.FC<StarProps> = ({ driftX = 0, driftY = 0, zoom = 1, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, opacity }}>
      {STARS.map((s, i) => {
        const z = 1 + (zoom - 1) * s.depth;
        const x = W / 2 + (s.x - driftX * s.depth - W / 2) * z;
        const y = H / 2 + (s.y - driftY * s.depth - H / 2) * z;
        if (x < -20 || x > W + 20 || y < -20 || y > H + 20) return null;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={s.r * (0.8 + 0.2 * z)}
            fill={s.tint > 0.8 ? '#ffe3c4' : s.tint < 0.2 ? '#bcd4ff' : '#e6efff'}
            opacity={s.base * (0.72 + 0.28 * Math.sin(t * s.speed + s.phase))}
          />
        );
      })}
    </svg>
  );
};

/** Deep-space backdrop: dark gradient, soft nebula tint and starfield. */
export const Space: React.FC<StarProps & { tint?: 'blue' | 'violet' | 'warm' | 'none'; children?: React.ReactNode }> = ({
  tint = 'blue', children, ...star
}) => {
  const tints = {
    blue: 'radial-gradient(ellipse at 28% 18%, rgba(40,80,170,.26), transparent 55%), radial-gradient(ellipse at 82% 88%, rgba(70,60,160,.18), transparent 50%)',
    violet: 'radial-gradient(ellipse at 70% 25%, rgba(110,60,170,.26), transparent 55%), radial-gradient(ellipse at 20% 85%, rgba(40,70,160,.18), transparent 50%)',
    warm: 'radial-gradient(ellipse at 50% 55%, rgba(170,90,40,.20), transparent 55%), radial-gradient(ellipse at 15% 15%, rgba(40,70,150,.16), transparent 50%)',
    none: 'none',
  };
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ background: tints[tint] }} />
      <Starfield {...star} />
      {children}
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.6 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: 'none' }} />
);

/** Spiral galaxy built from logarithmic-spiral star clouds (SVG). */
export const Galaxy: React.FC<{ cx: number; cy: number; r: number; rot?: number; tilt?: number; opacity?: number }> = ({
  cx, cy, r, rot = 0, tilt = 0.45, opacity = 1,
}) => {
  const dots = React.useMemo(() => {
    const g = mulberry32(77);
    const out: { x: number; y: number; s: number; o: number; c: string }[] = [];
    for (let i = 0; i < 1500; i++) {
      const arm = i % 3;
      const rr = Math.pow(g(), 0.7) * r;
      const ang = (rr / r) * 4.6 + (arm * TAU) / 3 + (g() - 0.5) * (0.7 - 0.4 * (rr / r));
      const core = rr < r * 0.18;
      out.push({
        x: Math.cos(ang) * rr + (g() - 0.5) * r * 0.05,
        y: Math.sin(ang) * rr + (g() - 0.5) * r * 0.05,
        s: 0.7 + g() * (core ? 1.4 : 1.8),
        o: 0.25 + g() * 0.6,
        c: core ? '#ffe3b0' : g() > 0.55 ? '#a9c8ff' : '#e8eeff',
      });
    }
    return out;
  }, [r]);
  return (
    <g transform={`translate(${cx} ${cy}) scale(1 ${tilt}) rotate(${rot})`} opacity={opacity}>
      <circle r={r * 1.1} fill="url(#galGlow)" />
      <defs>
        <radialGradient id="galGlow">
          <stop offset="0" stopColor="#ffe2b0" stopOpacity="0.55" />
          <stop offset="0.25" stopColor="#8aa8ff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#4060c0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={d.c} opacity={d.o} />
      ))}
    </g>
  );
};
