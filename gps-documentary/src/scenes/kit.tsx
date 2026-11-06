import React from "react";
import { random } from "remotion";
import { Space, SpaceDefs } from "../components/Space";
import { Overlay, INK, MUTED, ACCENT, MONO, glass } from "../components/Hud";
import { useShot } from "../components/context";
import { HEIGHT, WIDTH } from "../timeline";

/** Dark "blueprint space" backdrop for 2D explainer shots: stars + faint grid + vignette. */
export const Scene2D: React.FC<{ children: React.ReactNode; overlay?: React.ReactNode; grid?: number; tint?: string }> = ({ children, overlay, grid = 0.07, tint = "#0b1d3c" }) => {
  const { frame } = useShot();
  return (
    <>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
        <SpaceDefs />
        <defs>
          <radialGradient id="kitGlow" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stopColor={tint} stopOpacity={0.85} /><stop offset="1" stopColor={tint} stopOpacity={0} /></radialGradient>
          <pattern id="kitGrid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#6fd6ff" strokeWidth={0.6} /></pattern>
        </defs>
        <Space zoom={0} frame={frame} />
        <rect width={WIDTH} height={HEIGHT} fill="url(#kitGlow)" />
        <rect width={WIDTH} height={HEIGHT} fill="url(#kitGrid)" opacity={grid} />
        {children}
      </svg>
      {overlay && <Overlay>{overlay}</Overlay>}
    </>
  );
};

export const Sat2D: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string; glow?: number }> = ({ x, y, s = 1, rot = 0, color = "#4fd8ff", glow = 0.5 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle r={90} fill={color} opacity={0.1 + 0.2 * glow} filter="url(#blur20)" />
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${sd * 78} 0)`}>
        <rect x={-52} y={-24} width={104} height={48} fill="#183a86" stroke="#8cc2ff" strokeWidth={1.4} />
        {[-26, 0, 26].map((gx) => <line key={gx} x1={gx} y1={-24} x2={gx} y2={24} stroke="#5b97ec" strokeWidth={1} />)}
        <line x1={-52} y1={0} x2={52} y2={0} stroke="#5b97ec" strokeWidth={1} />
      </g>
    ))}
    <rect x={-27} y={-30} width={54} height={60} rx={5} fill="#d6a845" stroke="#ffeaa0" strokeWidth={1.4} />
    <rect x={-22} y={18} width={44} height={9} rx={3} fill="#08141d" stroke={color} strokeWidth={1.4} />
  </g>
);

export const Phone2D: React.FC<{ x: number; y: number; s?: number; rot?: number; glow?: number; children?: React.ReactNode; lit?: string }> = ({ x, y, s = 1, rot = 0, glow = 0.4, children, lit = "#071a2b" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-50} y={-92} width={100} height={184} rx={18} fill="#4fa8ff" opacity={0.1 + glow * 0.3} filter="url(#blur12)" />
    <rect x={-46} y={-88} width={92} height={176} rx={16} fill="#151b2a" stroke="#9db4dc" strokeWidth={2} />
    <rect x={-40} y={-80} width={80} height={160} rx={11} fill={lit} />
    <rect x={-13} y={-76} width={26} height={6} rx={3} fill="#02050a" />
    {children}
  </g>
);

export const GroundArc: React.FC<{ cy?: number; rx?: number; ry?: number; opacity?: number }> = ({ cy = 1650, rx = 1700, ry = 900, opacity = 1 }) => (
  <g opacity={opacity}>
    <defs>
      <radialGradient id="kitEarth" cx="0.5" cy="0.2" r="0.8"><stop offset="0" stopColor="#1d6fd0" /><stop offset="0.6" stopColor="#0a2a55" /><stop offset="1" stopColor="#030c1c" /></radialGradient>
    </defs>
    <ellipse cx={960} cy={cy} rx={rx + 40} ry={ry + 30} fill="#3ea8ff" opacity={0.18} filter="url(#blur20)" />
    <ellipse cx={960} cy={cy} rx={rx} ry={ry} fill="url(#kitEarth)" />
    <ellipse cx={960} cy={cy} rx={rx} ry={ry} fill="none" stroke="#bfeaff" strokeWidth={2.5} opacity={0.7} filter="url(#blur3)" />
  </g>
);
export const groundY = (x: number, cy = 1650, rx = 1700, ry = 900) => cy - ry * Math.sqrt(Math.max(0, 1 - ((x - 960) / rx) ** 2));

export const ClockFace: React.FC<{ cx: number; cy: number; r: number; turns: number; color?: string; label?: string; ticks?: number; sweep?: boolean; opacity?: number }> = ({ cx, cy, r, turns, color = ACCENT, label, ticks = 60, opacity = 1 }) => (
  <g opacity={opacity} fontFamily="Inter, sans-serif">
    <circle cx={cx} cy={cy} r={r + 14} fill={color} opacity={0.08} filter="url(#blur12)" />
    <circle cx={cx} cy={cy} r={r} fill="#06101f" stroke={color} strokeWidth={3} />
    {Array.from({ length: ticks }, (_, i) => {
      const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
      const major = i % (ticks / 12) === 0;
      const r0 = r - (major ? 24 : 12);
      return <line key={i} x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={cx + Math.cos(a) * (r - 6)} y2={cy + Math.sin(a) * (r - 6)} stroke={major ? "#fff" : color} strokeWidth={major ? 3 : 1.4} opacity={major ? 0.95 : 0.6} />;
    })}
    {(() => {
      const a = turns * Math.PI * 2 - Math.PI / 2;
      return (
        <>
          <line x1={cx - Math.cos(a) * r * 0.16} y1={cy - Math.sin(a) * r * 0.16} x2={cx + Math.cos(a) * (r - 18)} y2={cy + Math.sin(a) * (r - 18)} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={8} fill={color} />
        </>
      );
    })()}
    {label && <text x={cx} y={cy + r + 52} textAnchor="middle" fill={INK} fontSize={26} fontWeight={650} letterSpacing={2}>{label}</text>}
  </g>
);

export const Card: React.FC<{ x: number; y: number; w: number; h?: number; title: string; color?: string; opacity?: number; children?: React.ReactNode; lift?: number }> = ({ x, y, w, h, title, color = ACCENT, opacity = 1, children, lift = 18 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, padding: "20px 26px 22px", opacity, transform: `translateY(${(1 - opacity) * lift}px)`, ...glass, borderColor: opacity > 0.6 ? `${color}66` : undefined }}>
    <div style={{ fontSize: 14, letterSpacing: 3.4, fontWeight: 700, color }}>{title}</div>
    {children}
  </div>
);

export const Mono: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 30, color = INK, style }) => (
  <div style={{ fontFamily: MONO, fontSize: size, fontWeight: 600, color, letterSpacing: -0.5, ...style }}>{children}</div>
);
export const Note: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 20, style }) => (
  <div style={{ fontSize: size, color: MUTED, lineHeight: 1.35, ...style }}>{children}</div>
);

/** Deterministic 0/1 stream. */
export const bits = (n: number, shift: number) => Array.from({ length: n }, (_, i) => (random(`bit${i + shift}`) > 0.5 ? "1" : "0")).join("");
export { random };
