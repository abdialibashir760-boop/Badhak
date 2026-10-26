import React from "react";
import { C } from "../theme";
import { hash } from "../utils/animation";
import { Mask } from "./Mask";

/**
 * A standing mirror. `children` is the reflection (drawn in mirror-local coordinates, origin = mirror centre),
 * `masks` (0..1 reveal) covers it with smiling masks, `fog` dims the glass.
 */
export const Mirror: React.FC<{ x: number; y: number; w?: number; h?: number; masks?: number; maskCount?: number; fog?: number; frame: number; children?: React.ReactNode; dark?: boolean }> = ({
  x, y, w = 360, h = 560, masks = 0, maskCount = 9, fog = 0, frame, children, dark = false,
}) => {
  const id = `mirrorClip${Math.round(x)}`;
  const n = Math.floor(maskCount * masks);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={h / 2 + 14} rx={w * 0.55} ry={14} fill="#000" opacity={0.15} />
      <path d={`M ${-w * 0.32} ${h / 2} L ${-w * 0.42} ${h / 2 + 12} M ${w * 0.32} ${h / 2} L ${w * 0.42} ${h / 2 + 12}`} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <clipPath id={id}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.5} ry={w * 0.5} /></clipPath>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.5} ry={w * 0.5} fill={dark ? "#56554f" : "#ebe9e0"} />
      <g clipPath={`url(#${id})`}>
        {children}
        {Array.from({ length: n }, (_, i) => (
          <Mask
            key={i}
            x={(hash(i * 3.1) - 0.5) * w * 0.55 + Math.sin(frame * 0.02 + i) * 4}
            y={-h * 0.28 + (hash(i * 5.3) - 0.2) * h * 0.55}
            r={34 + hash(i * 1.7) * 22}
            rot={(hash(i * 8.8) - 0.5) * 40}
            mood={i % 4 === 3 ? "blank" : "smile"}
          />
        ))}
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={dark ? "#3f3e3a" : "#f2f0e8"} opacity={fog * 0.55} />
        <path d={`M ${-w * 0.3} ${-h / 2} L ${-w * 0.05} ${-h / 2} L ${-w * 0.45} ${h * 0.1} L ${-w * 0.5} ${h * 0.1} Z`} fill="#fff" opacity={0.2} />
        <path d={`M ${w * 0.08} ${-h / 2} L ${w * 0.16} ${-h / 2} L ${-w * 0.3} ${h * 0.35} L ${-w * 0.36} ${h * 0.35} Z`} fill="#fff" opacity={0.14} />
      </g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.5} ry={w * 0.5} fill="none" stroke={C.ink} strokeWidth={9} />
      <rect x={-w / 2 + 9} y={-h / 2 + 9} width={w - 18} height={h - 18} rx={w * 0.5 - 8} ry={w * 0.5 - 8} fill="none" stroke={C.ink} strokeWidth={2} opacity={0.5} />
    </g>
  );
};
