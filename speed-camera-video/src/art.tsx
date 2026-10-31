import React from "react";
import { C, FONT } from "./theme";

/** Side-view car, ~300×120 at scale 1. Origin = top-left. */
export const Car: React.FC<{
  color?: string;
  plate?: string;
  plateBlur?: boolean;
  scale?: number;
  flip?: boolean;
}> = ({ color = "#38bdf8", plate = "TK 42 SPD", plateBlur = false, scale = 1, flip = false }) => (
  <svg
    width={320 * scale}
    height={130 * scale}
    viewBox="0 0 320 130"
    style={{ overflow: "visible" }}
  >
    <g transform={flip ? "translate(320 0) scale(-1 1)" : undefined}>
    <ellipse cx="160" cy="124" rx="140" ry="8" fill="#000" opacity={0.35} />
    <path
      d="M10 92 C10 74 24 68 44 64 L84 38 C92 32 100 30 112 30 L196 30 C210 30 218 34 228 44 L252 64 C282 68 306 72 308 90 L308 102 L10 102 Z"
      fill={color}
    />
    <path
      d="M92 42 L118 36 L150 36 L150 64 L70 64 Z"
      fill="#0b1220"
      opacity={0.85}
    />
    <path
      d="M160 36 L196 36 C204 36 208 38 214 46 L230 64 L160 64 Z"
      fill="#0b1220"
      opacity={0.85}
    />
    <rect x="288" y="74" width="20" height="10" rx="4" fill="#fde68a" />
    <rect x="10" y="76" width="14" height="10" rx="4" fill="#ef4444" />
    <rect
      x="124"
      y="82"
      width="72"
      height="18"
      rx="3"
      fill="#f8fafc"
      style={plateBlur ? { filter: "blur(2.5px)" } : undefined}
    />
    {[78, 244].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy="102" r="24" fill="#0f172a" />
        <circle cx={cx} cy="102" r="12" fill="#94a3b8" />
        <circle cx={cx} cy="102" r="4" fill="#0f172a" />
      </g>
    ))}
    </g>
    <text
      x="160"
      y="96"
      textAnchor="middle"
      fontFamily={FONT}
      fontWeight={800}
      fontSize="13"
      fill="#0b1220"
      style={plateBlur ? { filter: "blur(2.5px)" } : undefined}
    >
      {plate}
    </text>
  </svg>
);

/** Pole-mounted camera. `facing` = which way the lens points. */
export const Camera: React.FC<{
  facing?: "left" | "right";
  label?: string;
  color?: string;
  scale?: number;
  glow?: number; // 0..1 lens glow
}> = ({ facing = "right", label, color = C.accent, scale = 1, glow = 0 }) => (
  <div
    style={{
      position: "relative",
      width: 150 * scale,
      height: 300 * scale,
      scale: facing === "left" ? "-1 1" : undefined,
    }}
  >
    <svg width={150 * scale} height={300 * scale} viewBox="0 0 150 300">
      <rect x="62" y="70" width="12" height="230" rx="4" fill="#475569" />
      <rect x="40" y="288" width="56" height="12" rx="4" fill="#334155" />
      <rect x="20" y="20" width="110" height="60" rx="12" fill="#e2e8f0" />
      <rect x="20" y="20" width="110" height="60" rx="12" fill="none" stroke={color} strokeWidth="4" />
      <rect x="100" y="34" width="36" height="32" rx="6" fill="#0f172a" />
      <circle cx="118" cy="50" r="10" fill={color} opacity={0.35 + glow * 0.65} />
      <circle cx="118" cy="50" r="22" fill={color} opacity={glow * 0.35} />
      <rect x="30" y="34" width="24" height="10" rx="3" fill="#94a3b8" />
    </svg>
    {label ? (
      <div
        style={{
          position: "absolute",
          top: -46 * scale,
          left: 0,
          width: "100%",
          textAlign: "center",
          scale: facing === "left" ? "-1 1" : undefined,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 26,
          color,
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
    ) : null}
  </div>
);

/** Round speedometer, value 0..max */
export const Gauge: React.FC<{
  value: number;
  max?: number;
  limit?: number;
  size?: number;
  unit: string;
}> = ({ value, max = 120, limit, size = 300, unit }) => {
  const r = size / 2 - 22;
  const cx = size / 2;
  const cy = size / 2;
  const a0 = 135;
  const sweep = 270;
  const pt = (v: number, rad: number) => {
    const ang = ((a0 + (sweep * v) / max) * Math.PI) / 180;
    return [cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)] as const;
  };
  const arc = (v0: number, v1: number, rad: number) => {
    const [x0, y0] = pt(v0, rad);
    const [x1, y1] = pt(v1, rad);
    const large = ((v1 - v0) / max) * sweep > 180 ? 1 : 0;
    return `M${x0} ${y0} A${rad} ${rad} 0 ${large} 1 ${x1} ${y1}`;
  };
  const over = limit !== undefined && value > limit;
  const col = over ? C.bad : C.ok;
  const [nx, ny] = pt(Math.min(value, max), r - 18);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={size / 2 - 4} fill={C.card} stroke={C.cardLine} strokeWidth="4" />
      <path d={arc(0, max, r)} stroke="#2a3b61" strokeWidth="16" fill="none" strokeLinecap="round" />
      {value > 0.5 ? (
        <path d={arc(0, Math.max(0.5, Math.min(value, max)), r)} stroke={col} strokeWidth="16" fill="none" strokeLinecap="round" />
      ) : null}
      {limit !== undefined ? (
        <>
          <line
            x1={pt(limit, r - 14)[0]}
            y1={pt(limit, r - 14)[1]}
            x2={pt(limit, r + 14)[0]}
            y2={pt(limit, r + 14)[1]}
            stroke={C.accent}
            strokeWidth="5"
          />
        </>
      ) : null}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="12" fill="#f8fafc" />
      <text x={cx} y={cy + size * 0.28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size * 0.2} fill={col}>
        {Math.round(value)}
      </text>
      <text x={cx} y={cy + size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={size * 0.075} fill={C.dim}>
        {unit}
      </text>
    </svg>
  );
};

/** Circular speed-limit sign. */
export const LimitSign: React.FC<{ value: number; size?: number; label?: string }> = ({
  value,
  size = 120,
  label,
}) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#fff",
        border: `${size * 0.12}px solid #dc2626`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size * 0.42,
        color: "#0b1220",
      }}
    >
      {value}
    </div>
    {label ? (
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, color: C.dim, marginTop: 8, letterSpacing: 1 }}>
        {label}
      </div>
    ) : null}
  </div>
);

/** Rounded chip / label. */
export const Chip: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
  filled?: boolean;
  style?: React.CSSProperties;
}> = ({ children, color = C.accent, size = 34, filled = false, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: `${size * 0.35}px ${size * 0.8}px`,
      borderRadius: 999,
      border: `3px solid ${color}`,
      background: filled ? color : "rgba(11,18,32,0.7)",
      color: filled ? "#0b1220" : color,
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: 0.5,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Plain card used by the flow chart / info boxes. */
export const Card: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = C.cardLine, style }) => (
  <div
    style={{
      background: C.card,
      border: `3px solid ${color}`,
      borderRadius: 28,
      padding: "26px 34px",
      fontFamily: FONT,
      color: C.text,
      boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Scene heading label top-left. */
export const SceneTag: React.FC<{ text: string; color: string; opacity?: number }> = ({
  text,
  color,
  opacity = 1,
}) => (
  <div style={{ position: "absolute", left: 90, top: 70, opacity }}>
    <Chip color={color} size={34} filled>
      {text}
    </Chip>
  </div>
);
