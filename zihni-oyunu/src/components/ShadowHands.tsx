import React from "react";
import { noise, smooth } from "../utils/animation";
import type { Pt } from "../utils/rig";

export type HandKind = "task" | "phone" | "point" | "palm" | "calendar";

const INK = "#161616";

const Item: React.FC<{ kind: HandKind }> = ({ kind }) => {
  if (kind === "task")
    return (
      <g transform="translate(70 -2) rotate(-6)">
        <rect x={-6} y={-52} width={92} height={110} rx={5} fill="#ece9df" stroke="#222" strokeWidth={3} />
        <rect x={22} y={-60} width={34} height={14} rx={4} fill="#333" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={6} y={-28 + i * 20} width={11} height={11} fill="none" stroke="#333" strokeWidth={2.2} />
            <path d={`M 26 ${-22 + i * 20} L 72 ${-22 + i * 20}`} stroke="#444" strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
  if (kind === "phone")
    return (
      <g transform="translate(60 0) rotate(8)">
        <rect x={-10} y={-48} width={64} height={110} rx={10} fill="#1d1d1d" stroke="#000" strokeWidth={2} />
        <rect x={-3} y={-38} width={50} height={88} rx={4} fill="#efe9cf" />
        <circle cx={22} cy={-4} r={13} fill="none" stroke="#333" strokeWidth={3} />
        <path d="M 15 -4 L 30 -4 M 22 -11 L 22 3" stroke="#333" strokeWidth={2.4} />
      </g>
    );
  if (kind === "calendar")
    return (
      <g transform="translate(66 -2) rotate(-4)">
        <rect x={-8} y={-50} width={100} height={104} rx={5} fill="#ece9df" stroke="#222" strokeWidth={3} />
        <rect x={-8} y={-50} width={100} height={22} rx={5} fill="#333" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={2 + (i % 4) * 22} y={-20 + Math.floor(i / 4) * 22} width={16} height={14} fill={i === 5 || i === 6 ? "#555" : "none"} stroke="#555" strokeWidth={1.8} />
        ))}
      </g>
    );
  return null;
};

/** Open hand silhouette, wrist at origin, fingers towards +x. */
const HandShape: React.FC<{ kind: HandKind }> = ({ kind }) => {
  if (kind === "point")
    return (
      <g fill={INK}>
        <rect x={-6} y={-30} width={78} height={60} rx={26} />
        <rect x={50} y={-22} width={118} height={19} rx={9.5} />
        <rect x={52} y={-1} width={52} height={17} rx={8.5} />
        <rect x={52} y={14} width={46} height={16} rx={8} />
        <rect x={20} y={20} width={50} height={22} rx={11} transform="rotate(26 20 20)" />
      </g>
    );
  return (
    <g fill={INK}>
      <rect x={-6} y={-32} width={76} height={64} rx={24} />
      <rect x={52} y={-28} width={64} height={15} rx={7.5} />
      <rect x={56} y={-12} width={72} height={15} rx={7.5} />
      <rect x={56} y={4} width={68} height={15} rx={7.5} />
      <rect x={52} y={19} width={52} height={14} rx={7} />
      <rect x={14} y={-46} width={58} height={20} rx={10} transform="rotate(-34 14 -30)" />
    </g>
  );
};

/**
 * A shadowy arm that glides in from outside the frame towards `target`.
 * `p` = 0 hidden … 1 arrived. The hand drifts slightly while it waits.
 */
export const ShadowHand: React.FC<{ from: Pt; target: Pt; p: number; kind: HandKind; frame: number; seed?: number; scale?: number; showItem?: boolean }> = ({
  from, target, p, kind, frame, seed = 0, scale = 1.25, showItem = true,
}) => {
  if (p <= 0.001) return null;
  const e = smooth(p);
  const bob = noise(frame * 0.04, seed) * 6;
  const x = from[0] + (target[0] - from[0]) * e, y = from[1] + (target[1] - from[1]) * e + bob * e;
  const ang = (Math.atan2(target[1] - from[1], target[0] - from[0]) * 180) / Math.PI;
  const flipY = Math.abs(ang) > 90 ? -1 : 1; // keep the thumb on top when the arm comes from the right
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${scale} ${scale * flipY})`} style={{ filter: "blur(0.6px)" }} opacity={0.93}>
      <defs>
        <linearGradient id={`arm${seed}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={INK} stopOpacity="0.2" />
          <stop offset="1" stopColor={INK} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d="M -1900 -26 L -4 -30 L -4 30 L -1900 38 Z" fill={`url(#arm${seed})`} />
      <HandShape kind={kind} />
      {showItem && <Item kind={kind} />}
    </g>
  );
};

