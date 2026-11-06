import React from "react";
import { clamp01, easeOutCubic, smoothstep, type Cam, type V3, project } from "../engine/math3d";
import { FONT } from "./SatModel";

export const INK = "#eaf4ff";
export const MUTED = "#9db9d9";
export const ACCENT = "#6fd6ff";
export const MINT = "#7dffc0";
export const WARN = "#ff7a6b";
export const MONO = "'DejaVu Sans Mono', 'SF Mono', Menlo, Consolas, monospace";

export const glass: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(14,26,46,0.74), rgba(6,12,24,0.64))",
  border: "1px solid rgba(150,205,255,0.2)",
  borderRadius: 18,
  boxShadow: "0 18px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
  backdropFilter: "blur(14px)",
};

/** Overlay container for HTML HUD pieces above an SVG shot. */
export const Overlay: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", inset: 0, fontFamily: FONT, color: INK, fontVariantNumeric: "tabular-nums" }}>{children}</div>
);

/** Leader-line callout anchored at screen point (x, y); text sits at (x+dx, y+dy). */
export const Callout: React.FC<{ x: number; y: number; dx: number; dy: number; title: string; sub?: string; color?: string; opacity?: number }> = ({ x, y, dx, dy, title, sub, color = ACCENT, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const ex = x + dx;
  const ey = y + dy;
  const dir = dx >= 0 ? 1 : -1;
  const tail = ex + dir * 170;
  return (
    <g opacity={opacity} fontFamily={FONT}>
      <circle cx={x} cy={y} r={4.5} fill={color} />
      <circle cx={x} cy={y} r={11} fill="none" stroke={color} strokeWidth={1.2} opacity={0.6} />
      <polyline points={`${x},${y} ${ex},${ey} ${tail},${ey}`} fill="none" stroke={color} strokeWidth={1.3} opacity={0.85} />
      <text x={ex + dir * 8} y={ey - 10} textAnchor={dir > 0 ? "start" : "end"} fill={INK} fontSize={21} fontWeight={600} letterSpacing={0.4} stroke="#02050c" strokeWidth={5} strokeLinejoin="round" paintOrder="stroke">{title}</text>
      {sub && <text x={ex + dir * 8} y={ey + 20} textAnchor={dir > 0 ? "start" : "end"} fill={color} fontSize={15.5} fontWeight={500} letterSpacing={0.5} stroke="#02050c" strokeWidth={4} strokeLinejoin="round" paintOrder="stroke">{sub}</text>}
    </g>
  );
};

/** Callout whose anchor is a 3D point. Hidden when the point is off screen. */
export const Callout3D: React.FC<{ cam: Cam; at: V3; dx: number; dy: number; title: string; sub?: string; color?: string; opacity?: number }> = ({ cam, at, ...rest }) => {
  const p = project(cam, at);
  if (!p.ok || p.x < 20 || p.x > 1900 || p.y < 20 || p.y > 1060) return null;
  return <Callout x={p.x} y={p.y} {...rest} />;
};

const ALT_TICKS: [number, string][] = [
  [400, "Space station  ≈ 400 km"],
  [20200, "GPS satellites  20,200 km"],
  [35786, "Geostationary  35,786 km"],
];

/** Vertical altitude ruler (log scale) with a moving marker. */
export const AltitudeHud: React.FC<{ altKm: number; opacity?: number }> = ({ altKm, opacity = 1 }) => {
  const lo = Math.log(100);
  const hi = Math.log(80000);
  const pos = (a: number) => 1 - clamp01((Math.log(Math.max(a, 100)) - lo) / (hi - lo));
  const top = 250;
  const h = 560;
  const y = (a: number) => top + pos(a) * h;
  const gps = smoothstep(14000, 20200, altKm);
  return (
    <g opacity={opacity} fontFamily={FONT}>
      <line x1={1640} y1={top} x2={1640} y2={top + h} stroke={ACCENT} strokeWidth={1.4} opacity={0.5} />
      {ALT_TICKS.map(([a, label]) => (
        <g key={a} opacity={a === 20200 ? 1 : 0.7}>
          <line x1={1628} y1={y(a)} x2={1652} y2={y(a)} stroke={a === 20200 ? MINT : ACCENT} strokeWidth={a === 20200 ? 3 : 1.6} />
          <text x={1616} y={y(a) + 5} textAnchor="end" fill={a === 20200 ? MINT : MUTED} fontSize={a === 20200 ? 19 : 16} fontWeight={a === 20200 ? 700 : 500} stroke="#02050c" strokeWidth={4} paintOrder="stroke">{label}</text>
        </g>
      ))}
      <g transform={`translate(0 ${y(altKm)})`}>
        <polygon points="1640,0 1664,-11 1664,11" fill="#fff" />
        <text x={1676} y={7} fill="#fff" fontSize={22} fontWeight={700} fontFamily={MONO}>{Math.round(altKm).toLocaleString("en-US")} km</text>
      </g>
      <circle cx={1640} cy={y(20200)} r={9 + 6 * gps} fill={MINT} opacity={0.15 + 0.25 * gps} />
    </g>
  );
};

/** Big stat readout (number + caption), glass card. */
export const Stat: React.FC<{ x: number; y: number; w?: number; label: string; value: string; unit?: string; color?: string; opacity?: number; sub?: string }> = ({ x, y, w = 340, label, value, unit, color = ACCENT, opacity = 1, sub }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, padding: "18px 24px 20px", opacity, transform: `translateY(${(1 - easeOutCubic(opacity)) * 14}px)`, ...glass }}>
    <div style={{ fontSize: 13.5, letterSpacing: 3.2, fontWeight: 600, color }}>{label}</div>
    <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 54, fontWeight: 700, letterSpacing: -1 }}>{value}</span>
      {unit && <span style={{ fontSize: 24, color: MUTED, fontWeight: 500 }}>{unit}</span>}
    </div>
    {sub && <div style={{ marginTop: 6, fontSize: 17, color: MUTED }}>{sub}</div>}
  </div>
);

/** Equation line with token highlight. */
export const Tex: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 64, color = INK, style }) => (
  <div style={{ fontFamily: MONO, fontSize: size, fontWeight: 600, color, letterSpacing: -1, ...style }}>{children}</div>
);
