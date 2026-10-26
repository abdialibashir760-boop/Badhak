import React from "react";
import { C } from "../theme";
import { clamp } from "../utils/animation";

/** Simple emoji-like face used for crowds, icons and "everyone" thoughts. mood −1 (frown) … 1 (smile). */
export const FaceDisc: React.FC<{ x: number; y: number; r?: number; mood?: number; opacity?: number; color?: string; fill?: string }> = ({ x, y, r = 36, mood = 1, opacity = 1, color = C.ink, fill = "#f8f6ee" }) => {
  const k = r / 36;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <circle r={r} fill={fill} stroke={color} strokeWidth={3 * k + 0.6} />
      <circle cx={-12 * k} cy={-7 * k} r={3.4 * k} fill={color} />
      <circle cx={12 * k} cy={-7 * k} r={3.4 * k} fill={color} />
      <path d={`M ${-14 * k} ${12 * k} Q 0 ${12 * k + mood * 15 * k} ${14 * k} ${12 * k}`} stroke={color} strokeWidth={3 * k + 0.4} fill="none" strokeLinecap="round" />
      {mood < -0.3 && <path d={`M ${-19 * k} ${-17 * k} L ${-6 * k} ${-13 * k} M ${19 * k} ${-17 * k} L ${6 * k} ${-13 * k}`} stroke={color} strokeWidth={2.6 * k} strokeLinecap="round" />}
    </g>
  );
};

/** Curved arrow drawn progressively (p 0..1) from a→b via a bulge. */
export const Arrow: React.FC<{ a: [number, number]; b: [number, number]; bulge?: number; p?: number; color?: string; width?: number }> = ({ a, b, bulge = -30, p = 1, color = C.ink, width = 3.4 }) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + bulge;
  const ang = Math.atan2(b[1] - my, b[0] - mx);
  const hx = (d: number) => [b[0] - Math.cos(ang + d) * 16, b[1] - Math.sin(ang + d) * 16];
  const [h1, h2] = [hx(0.5), hx(-0.5)];
  return (
    <g fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity={clamp(p * 3)}>
      <path d={`M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(p)} />
      {p > 0.9 && <path d={`M ${h1[0]} ${h1[1]} L ${b[0]} ${b[1]} L ${h2[0]} ${h2[1]}`} />}
    </g>
  );
};

/** Radiating "ha" marks around a laughing mouth. */
export const LaughMarks: React.FC<{ x: number; y: number; frame: number; on: number }> = ({ x, y, frame, on }) => {
  if (on <= 0.01) return null;
  const wob = Math.sin(frame * 1.3) * 3;
  return (
    <g stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={on}>
      {[-40, 0, 40].map((a, i) => {
        const r = ((a - 90) * Math.PI) / 180;
        return <path key={i} d={`M ${x + Math.cos(r) * (48 + wob)} ${y + Math.sin(r) * (48 + wob)} L ${x + Math.cos(r) * (76 + wob)} ${y + Math.sin(r) * (76 + wob)}`} />;
      })}
    </g>
  );
};

/** Crossed-out scribble ball ("discomfort") in the chest. */
export const Scribble: React.FC<{ x: number; y: number; r?: number; frame: number; on: number; seed?: number }> = ({ x, y, r = 22, frame, on, seed = 0 }) => {
  if (on <= 0.01) return null;
  let d = "";
  for (let i = 0; i < 26; i++) {
    const a = i * 2.4 + frame * 0.35 + seed, rr = r * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7 + seed)));
    d += `${i ? "L" : "M"} ${x + Math.cos(a) * rr} ${y + Math.sin(a) * rr} `;
  }
  return <path d={d} fill="none" stroke={C.ink} strokeWidth={2.2} strokeLinecap="round" opacity={0.85 * on} />;
};

/** A small paper held in the air (schedule, request). */
export const Paper: React.FC<{ x: number; y: number; rot?: number; w?: number; h?: number }> = ({ x, y, rot = 0, w = 70, h = 90 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill="#f3f0e6" stroke={C.ink} strokeWidth={3} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-w / 2 + 10} ${-h / 2 + 18 + i * 17} L ${w / 2 - 10 - (i % 2) * 10} ${-h / 2 + 18 + i * 17}`} stroke={C.ink} strokeWidth={2.6} strokeLinecap="round" opacity={0.7} />)}
  </g>
);
