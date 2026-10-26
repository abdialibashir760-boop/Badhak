import React from "react";

export const SKINS = ["#e2b08a", "#c68a62", "#a8694a", "#8a5236", "#f0c8a4"];
export const SUITS = ["#f0892a", "#f0892a", "#e8761c", "#2f6fb2", "#f0892a", "#d9d3c4"];

export type Pose = "stand" | "walk" | "sit" | "lie" | "cheer" | "climb" | "wave";

type MinerProps = {
  x: number;
  y: number; // feet position
  t: number; // seconds, drives idle/walk animation
  pose?: Pose;
  skin?: string;
  suit?: string;
  helmet?: string;
  facing?: 1 | -1;
  scale?: number;
  phase?: number;
  lamp?: boolean;
  suitStyle?: "miner" | "suit" | "vest";
  opacity?: number;
};

/** A small flat-vector worker. Origin (0,0) is the feet. */
export const Person: React.FC<MinerProps> = ({
  x,
  y,
  t,
  pose = "stand",
  skin = SKINS[0],
  suit = SUITS[0],
  helmet = "#f5c518",
  facing = 1,
  scale = 1,
  phase = 0,
  lamp = true,
  suitStyle = "miner",
  opacity = 1,
}) => {
  const w = Math.sin(t * 8 + phase);
  const idle = Math.sin(t * 1.6 + phase * 2) * 0.6;
  const dark = "#1d2430";
  let legL = 0;
  let legR = 0;
  let armL = 8;
  let armR = -8;
  let bodyDy = 0;
  let rot = 0;
  if (pose === "walk") {
    legL = w * 26;
    legR = -w * 26;
    armL = -w * 22;
    armR = w * 22;
    bodyDy = -Math.abs(w) * 1.2;
  } else if (pose === "climb") {
    legL = w * 18 - 10;
    legR = -w * 18 - 10;
    armL = 150 + w * 18;
    armR = 150 - w * 18;
    bodyDy = -Math.abs(w) * 1;
  } else if (pose === "cheer") {
    armL = 160 + w * 14;
    armR = -160 - w * 14;
    bodyDy = -Math.abs(Math.sin(t * 6 + phase)) * 5;
  } else if (pose === "wave") {
    armR = -150 + Math.sin(t * 9 + phase) * 22;
  } else if (pose === "lie") {
    rot = -90;
  }
  const sit = pose === "sit";
  const bodyTop = sit ? -26 : -38;
  const bodyBot = sit ? -6 : -16;
  const headY = sit ? -33 + idle : -45 + bodyDy + idle * 0.3;

  const limb = (len: number, wd: number, angle: number, color: string, ox: number, oy: number) => (
    <g transform={`translate(${ox} ${oy}) rotate(${angle})`}>
      <rect x={-wd / 2} y={0} width={wd} height={len} rx={wd / 2} fill={color} />
    </g>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${facing * scale} ${scale}) rotate(${rot} 0 ${-18})`} opacity={opacity}>
      {/* legs */}
      {sit ? (
        <>
          <rect x={-2} y={-9} width={18} height={6} rx={3} fill={dark} />
          <rect x={-2} y={-5} width={18} height={5} rx={2.5} fill="#2a3342" />
        </>
      ) : (
        <>
          {limb(17, 6, legL, dark, -3.5, -17 + bodyDy)}
          {limb(17, 6, legR, "#2a3342", 3.5, -17 + bodyDy)}
        </>
      )}
      {/* back arm */}
      {limb(15, 4.6, sit ? 70 : armL, suitStyle === "suit" ? "#10151d" : suit, -6.5, bodyTop + 3 + bodyDy)}
      {/* torso */}
      <rect x={-8} y={bodyTop + bodyDy} width={16} height={bodyBot - bodyTop} rx={4.5} fill={suit} />
      {suitStyle === "miner" && (
        <>
          <rect x={-8} y={bodyTop + 11 + bodyDy} width={16} height={3.2} fill="#e9eef2" opacity={0.92} />
        </>
      )}
      {suitStyle === "suit" && (
        <>
          <path d={`M-3 ${bodyTop + bodyDy} L0 ${bodyTop + 9 + bodyDy} L3 ${bodyTop + bodyDy} Z`} fill="#f2f2f2" />
          <rect x={-8} y={bodyTop + 6 + bodyDy} width={16} height={3} fill="#c1272d" opacity={0.0} />
        </>
      )}
      {suitStyle === "vest" && <rect x={-8} y={bodyTop + bodyDy} width={16} height={bodyBot - bodyTop} rx={4.5} fill="#e8c51b" opacity={0.9} />}
      {/* front arm */}
      {limb(15, 4.6, sit ? 80 : armR, suitStyle === "suit" ? "#10151d" : suit, 6.5, bodyTop + 3 + bodyDy)}
      {/* head */}
      <circle cx={1} cy={headY} r={6.6} fill={skin} />
      {suitStyle === "suit" ? (
        <path d={`M-5.6 ${headY - 2} Q1 ${headY - 11} 7.6 ${headY - 2} Q4 ${headY - 6} -5.6 ${headY - 2}`} fill="#2b2a2a" />
      ) : (
        <>
          <path d={`M-7 ${headY - 1.5} A8 8 0 0 1 9 ${headY - 1.5} Z`} fill={helmet} />
          <rect x={-8} y={headY - 2.5} width={18} height={2.6} rx={1.3} fill={helmet} />
          {lamp && <circle cx={8.4} cy={headY - 4.5} r={2} fill="#fff7c2" />}
        </>
      )}
      <circle cx={4} cy={headY + 0.5} r={0.9} fill="#2b1d14" />
    </g>
  );
};

export const Truck: React.FC<{ x: number; y: number; ang: number; scale?: number }> = ({ x, y, ang, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${(ang * 180) / Math.PI}) scale(${scale})`}>
    <rect x={-28} y={-30} width={56} height={22} rx={5} fill="#f2b705" />
    <rect x={8} y={-40} width={22} height={18} rx={4} fill="#f2b705" />
    <rect x={14} y={-37} width={13} height={9} rx={2} fill="#bfe3f2" />
    <rect x={-28} y={-12} width={58} height={4} fill="#c88f00" />
    <circle cx={-16} cy={-6} r={8} fill="#15181d" />
    <circle cx={-16} cy={-6} r={3.4} fill="#9aa3ad" />
    <circle cx={18} cy={-6} r={8} fill="#15181d" />
    <circle cx={18} cy={-6} r={3.4} fill="#9aa3ad" />
    <circle cx={31} cy={-22} r={2.6} fill="#fff6bf" />
  </g>
);

/** Drill rig on the surface (feet at y=0). */
export const Rig: React.FC<{ x: number; t: number; active: boolean }> = ({ x, t, active }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={-46} y={-26} width={92} height={18} rx={4} fill="#f2b705" />
    <rect x={-46} y={-10} width={92} height={4} fill="#c88f00" />
    <circle cx={-30} cy={-6} r={9} fill="#15181d" />
    <circle cx={30} cy={-6} r={9} fill="#15181d" />
    <rect x={-8} y={-250} width={16} height={226} fill="#8a939e" />
    <rect x={-8} y={-250} width={16} height={226} fill="none" stroke="#5c646e" strokeWidth={2} />
    {Array.from({ length: 11 }).map((_, i) => (
      <path key={i} d={`M-8 ${-250 + i * 20} L8 ${-230 + i * 20}`} stroke="#5c646e" strokeWidth={2} />
    ))}
    <rect x={-22} y={-264} width={44} height={20} rx={4} fill="#f2b705" />
    <rect x={-30} y={-62} width={60} height={34} rx={5} fill="#f2b705" />
    <rect x={-22} y={-56} width={18} height={14} rx={2} fill="#bfe3f2" />
    {active && <circle cx={0} cy={-22} r={3.5 + Math.sin(t * 9) * 1.2} fill="#ffb347" opacity={0.85} />}
    <circle cx={0} cy={-268} r={4} fill={active && Math.sin(t * 6) > 0 ? "#ff5a3c" : "#7a2c20"} />
  </g>
);

export const Tent: React.FC<{ x: number; w: number; h: number; color: string }> = ({ x, w, h, color }) => (
  <g transform={`translate(${x} 0)`}>
    <path d={`M${-w / 2} 0 L0 ${-h} L${w / 2} 0 Z`} fill={color} />
    <path d={`M0 ${-h} L${w / 2} 0 L${w * 0.1} 0 Z`} fill="#00000022" />
    <rect x={-w * 0.12} y={-h * 0.42} width={w * 0.24} height={h * 0.42} fill="#00000033" />
  </g>
);

export const Flag: React.FC<{ x: number; t: number }> = ({ x, t }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={-1.5} y={-90} width={3} height={90} fill="#d7dbe0" />
    <g transform={`skewY(${Math.sin(t * 3 + x) * 3})`}>
      <rect x={1.5} y={-90} width={42} height={12} fill="#ffffff" />
      <rect x={1.5} y={-78} width={42} height={12} fill="#d52b1e" />
      <rect x={1.5} y={-90} width={16} height={12} fill="#0039a6" />
      <circle cx={9.5} cy={-84} r={2.3} fill="#fff" />
    </g>
  </g>
);

export const Car: React.FC<{ x: number; color?: string }> = ({ x, color = "#f4f4f2" }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={-40} y={-24} width={80} height={16} rx={5} fill={color} />
    <path d="M-18 -24 L-10 -38 L16 -38 L26 -24 Z" fill={color} />
    <path d="M-12 -26 L-7 -35 L5 -35 L5 -26 Z" fill="#bfe3f2" />
    <path d="M9 -26 L9 -35 L15 -35 L21 -26 Z" fill="#bfe3f2" />
    <circle cx={-24} cy={-8} r={8} fill="#15181d" />
    <circle cx={24} cy={-8} r={8} fill="#15181d" />
  </g>
);

export const Camera: React.FC<{ x: number; y?: number; t: number; phase: number; flash: boolean }> = ({ x, y = 0, t, phase, flash }) => (
  <g transform={`translate(${x} ${y})`}>
    <Person x={0} y={0} t={t} phase={phase} suit="#3d4a5c" suitStyle="vest" lamp={false} helmet="#222" skin={SKINS[phase % 5]} facing={-1} />
    <rect x={-22} y={-40} width={14} height={9} rx={2} fill="#2b2f36" />
    <circle cx={-24} cy={-36} r={3.2} fill="#8fd3ff" />
    {flash && <circle cx={-30} cy={-36} r={12} fill="#fff" opacity={0.85} />}
  </g>
);
