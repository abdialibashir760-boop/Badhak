import React from "react";
import { C, FONT } from "./theme";

type Props = {
  id: string;
  x: number;
  y: number;
  scale?: number;
  mirror?: boolean;
  /** 0..1.4 — brightness of windows and emblem */
  glow: number;
};

const COLS = [0, 1, 2, 3, 4];
const SIDE = { dx: 56, dy: -26 };

/** Side-face point: u along depth (0..1), y in front-plane coordinates. */
const sp = (u: number, y: number) => `${222 + SIDE.dx * u},${y + SIDE.dy * u}`;

/** 2.5D bank: front facade + extruded side face, drawn in local units (≈280 × 250). */
export const Bank: React.FC<Props> = ({ id, x, y, scale = 1, mirror, glow }) => {
  const g = Math.min(1.4, glow);
  const win = 0.28 + g * 0.62;
  return (
    <g transform={`translate(${x} ${y}) scale(${mirror ? -scale : scale} ${scale})`}>
      <defs>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#21436b" />
          <stop offset="100%" stopColor="#12304f" />
        </linearGradient>
        <linearGradient id={`${id}-col`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a9c3de" />
          <stop offset="50%" stopColor="#e7f2fc" />
          <stop offset="100%" stopColor="#7f9dbd" />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0f2640" />
          <stop offset="100%" stopColor="#081729" />
        </linearGradient>
        <linearGradient id={`${id}-roof`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a6797" />
          <stop offset="100%" stopColor="#274c75" />
        </linearGradient>
      </defs>

      {/* platform + glow */}
      <ellipse cx={140} cy={22} rx={250} ry={58} fill="url(#glowTeal)" opacity={0.18 + g * 0.3} />
      <ellipse cx={140} cy={22} rx={226} ry={50} fill="rgba(8,20,38,0.85)" stroke={C.teal} strokeOpacity={0.4 + g * 0.3} strokeWidth={2} />
      <ellipse cx={140} cy={22} rx={190} ry={40} fill="none" stroke={C.cyan} strokeOpacity={0.2} strokeWidth={1.5} strokeDasharray="6 10" />

      {/* steps */}
      <polygon points="-18,0 238,0 238,-14 -18,-14" fill="#27496f" />
      <polygon points={`238,0 ${sp(1, 0)} ${sp(1, -14)} 238,-14`} fill="#0f2640" />
      <polygon points="-8,-14 228,-14 228,-26 -8,-26" fill="#335a85" />
      <polygon points={`228,-14 ${sp(0.95, -14)} ${sp(0.95, -26)} 228,-26`} fill="#12304f" />

      {/* side face */}
      <polygon points={`222,-26 ${sp(1, -26)} ${sp(1, -152)} 222,-152`} fill={`url(#${id}-side)`} />
      {[0.14, 0.4, 0.66].map((u) => (
        <polygon
          key={u}
          points={`${sp(u, -60)} ${sp(u + 0.16, -60)} ${sp(u + 0.16, -128)} ${sp(u, -128)}`}
          fill={C.teal}
          opacity={win * 0.8}
        />
      ))}
      {/* entablature */}
      <polygon points={`222,-152 ${sp(1, -152)} ${sp(1, -170)} 222,-170`} fill="#1a3a5e" />
      <polygon points="-12,-152 234,-152 234,-170 -12,-170" fill="#4b79a8" />
      {/* roof slope (side) + pediment (front) */}
      <polygon points={`230,-170 ${sp(1.05, -170)} ${sp(0.5, -226)} 112,-226`} fill="#1d4067" />
      <polygon points="-10,-170 234,-170 112,-226" fill={`url(#${id}-roof)`} stroke="rgba(160,220,255,0.35)" strokeWidth={1.5} />

      {/* front wall */}
      <rect x={0} y={-152} width={222} height={126} fill={`url(#${id}-front)`} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={30 + i * 50} y={-130} width={22} height={74} rx={4} fill={C.teal} opacity={win} />
      ))}
      {/* columns */}
      {COLS.map((i) => (
        <rect key={i} x={6 + i * 50} y={-152} width={18} height={126} fill={`url(#${id}-col)`} />
      ))}

      {/* emblem */}
      <circle cx={112} cy={-190} r={20 + g * 3} fill="url(#glowGold)" opacity={0.5 + g * 0.4} />
      <circle cx={112} cy={-190} r={14} fill="#1a1405" stroke={C.gold} strokeWidth={3} />
      <text x={112} y={-184} textAnchor="middle" fill={C.gold} fontSize={19} fontWeight={800} fontFamily={FONT} transform={mirror ? "translate(224 0) scale(-1 1)" : undefined}>
        $
      </text>
    </g>
  );
};
