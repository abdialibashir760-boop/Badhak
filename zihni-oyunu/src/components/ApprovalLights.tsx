import React from "react";
import { C } from "../theme";
import { hash, noise } from "../utils/animation";

export const LightDefs: React.FC = () => (
  <defs>
    <radialGradient id="lightHalo">
      <stop offset="0" stopColor={C.light} stopOpacity="0.75" />
      <stop offset="0.35" stopColor={C.light} stopOpacity="0.28" />
      <stop offset="1" stopColor={C.light} stopOpacity="0" />
    </radialGradient>
  </defs>
);

/** One little light of approval. `on` 0..1 (fades/pops), `size` = core radius. Requires <LightDefs/> in the svg. */
export const Light: React.FC<{ x: number; y: number; on: number; size?: number; frame: number; seed?: number; tone?: number }> = ({ x, y, on, size = 14, frame, seed = 0, tone = 1 }) => {
  if (on <= 0.01) return null;
  const flick = 0.9 + 0.1 * noise(frame * 0.18 + seed * 7, seed);
  const s = on * flick;
  return (
    <g opacity={tone}>
      <circle cx={x} cy={y} r={size * 5.2 * s} fill="url(#lightHalo)" />
      <circle cx={x} cy={y} r={size * 1.35 * s} fill={C.light} opacity={0.55} />
      <circle cx={x} cy={y} r={size * 0.85 * s} fill={C.lightCore} />
      {on > 0.3 && Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + frame * 0.01 + seed;
        return <path key={i} d={`M ${x + Math.cos(a) * size * 1.7 * s} ${y + Math.sin(a) * size * 1.7 * s} L ${x + Math.cos(a) * size * 2.3 * s} ${y + Math.sin(a) * size * 2.3 * s}`} stroke={C.light} strokeWidth={2} strokeLinecap="round" opacity={0.65 * on} />;
      })}
    </g>
  );
};

/** Many drifting lights filling the frame (deterministic positions). */
export const LightField: React.FC<{ frame: number; count: number; reveal: number; area?: [number, number, number, number]; size?: number; speed?: number; seed?: number; tone?: number }> = ({
  frame, count, reveal, area = [0, 0, 1920, 1080], size = 9, speed = 1, seed = 5, tone = 1,
}) => {
  const n = Math.floor(count * reveal);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const bx = area[0] + hash(seed + i * 3.3) * area[2], by = area[1] + hash(seed + i * 7.7) * area[3];
        const x = bx + noise(frame * 0.012 * speed + i * 2.1, seed + i) * 70, y = by + noise(frame * 0.015 * speed + i * 1.3, seed + i + 9) * 55;
        const blink = 0.35 + 0.65 * Math.max(0, noise(frame * 0.05 * speed + i * 4.4, seed + i * 2) * 0.5 + 0.55);
        return <Light key={i} x={x} y={y} on={blink} size={size * (0.6 + hash(i * 1.9) * 0.9)} frame={frame} seed={i} tone={tone} />;
      })}
    </g>
  );
};
