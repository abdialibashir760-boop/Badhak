import React from 'react';
import { random } from 'remotion';

type BodyProps = { cx: number; cy: number; r: number };

// Abstract "Earth-like" land masses (not real geography)
const LAND = Array.from({ length: 8 }, (_, i) => ({
  lon: random(`lon${i}`) * Math.PI * 2,
  lat: (random(`lat${i}`) - 0.5) * 1.9,
  size: 0.3 + random(`sz${i}`) * 0.22,
  tone: random(`tone${i}`),
}));
const CLOUDS = Array.from({ length: 10 }, (_, i) => ({
  lon: random(`clon${i}`) * Math.PI * 2,
  lat: (random(`clat${i}`) - 0.5) * 2.2,
  size: 0.1 + random(`csz${i}`) * 0.1,
}));

function blobs(
  list: { lon: number; lat: number; size: number; tone?: number }[],
  lon0: number,
  r: number,
  fill: (tone: number) => string,
  opacity: number,
  keyPrefix: string,
) {
  const out: React.ReactNode[] = [];
  list.forEach((b, i) => {
    for (let j = 0; j < 3; j++) {
      const lon = b.lon + (j - 1) * 0.28 * b.size * 3;
      const lat = b.lat + (j === 1 ? 0.12 : -0.08) * b.size * 3;
      const rel = lon - lon0;
      const cosc = Math.cos(lat) * Math.cos(rel);
      if (cosc <= -0.05) continue;
      const x = r * Math.cos(lat) * Math.sin(rel);
      const y = -r * Math.sin(lat);
      const sz = b.size * r * (j === 1 ? 1 : 0.7);
      const angle = (Math.atan2(y, x) * 180) / Math.PI;
      out.push(
        <ellipse
          key={`${keyPrefix}${i}-${j}`}
          cx={x}
          cy={y}
          rx={Math.max(0.5, sz * Math.max(cosc, 0.3))}
          ry={sz}
          transform={`rotate(${angle} ${x} ${y})`}
          fill={fill(b.tone ?? 0.5)}
          opacity={opacity}
        />,
      );
    }
  });
  return out;
}

export const Earth: React.FC<BodyProps & { spin: number }> = ({ cx, cy, r, spin }) => (
  <g transform={`translate(${cx} ${cy})`}>
    {/* atmosphere */}
    <circle r={r * 1.22} fill="url(#earthAtmos)" />
    <clipPath id="earthClip">
      <circle r={r} />
    </clipPath>
    <g clipPath="url(#earthClip)">
      <circle r={r} fill="url(#earthOcean)" />
      {blobs(LAND, spin, r, (tn) => (tn > 0.55 ? '#4f9a58' : '#b8a35e'), 0.95, 'l')}
      {blobs(CLOUDS, spin * 1.25, r, () => '#ffffff', 0.22, 'c')}
      <circle r={r} fill="url(#sphereShade)" />
    </g>
    <circle r={r} fill="none" stroke="#a9d4ff" strokeOpacity={0.35} strokeWidth={Math.max(1, r * 0.02)} />
  </g>
);

const CRATERS = [
  { x: -0.35, y: -0.25, s: 0.2 },
  { x: 0.3, y: -0.4, s: 0.13 },
  { x: 0.1, y: 0.2, s: 0.25 },
  { x: -0.4, y: 0.35, s: 0.12 },
  { x: 0.5, y: 0.25, s: 0.1 },
];

export const Moon: React.FC<BodyProps> = ({ cx, cy, r }) => (
  <g transform={`translate(${cx} ${cy})`}>
    <circle r={r * 1.5} fill="url(#moonGlow)" />
    <clipPath id="moonClip">
      <circle r={r} />
    </clipPath>
    <g clipPath="url(#moonClip)">
      <circle r={r} fill="url(#moonBase)" />
      {CRATERS.map((c, i) => (
        <circle key={i} cx={c.x * r} cy={c.y * r} r={c.s * r} fill="#5f6068" opacity={0.35} />
      ))}
      <circle r={r} fill="url(#sphereShade)" />
    </g>
  </g>
);

/** Gradients/clip paths shared by the bodies. Unit radius so they scale with the group. */
export const BodyDefs: React.FC = () => (
  <defs>
    <radialGradient id="earthOcean" cx="0.38" cy="0.35" r="0.85">
      <stop offset="0" stopColor="#3f8fe0" />
      <stop offset="0.6" stopColor="#1b5ca8" />
      <stop offset="1" stopColor="#0c2f66" />
    </radialGradient>
    <radialGradient id="earthAtmos">
      <stop offset="0" stopColor="#6db6ff" stopOpacity="0" />
      <stop offset="0.8" stopColor="#6db6ff" stopOpacity="0" />
      <stop offset="0.84" stopColor="#6db6ff" stopOpacity="0.5" />
      <stop offset="1" stopColor="#6db6ff" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="moonBase" cx="0.38" cy="0.35" r="0.85">
      <stop offset="0" stopColor="#e6e4dc" />
      <stop offset="1" stopColor="#8d8b86" />
    </radialGradient>
    <radialGradient id="moonGlow">
      <stop offset="0" stopColor="#dfe6ff" stopOpacity="0" />
      <stop offset="0.64" stopColor="#dfe6ff" stopOpacity="0" />
      <stop offset="0.7" stopColor="#dfe6ff" stopOpacity="0.3" />
      <stop offset="1" stopColor="#dfe6ff" stopOpacity="0" />
    </radialGradient>
    {/* light from the upper left: darken the far limb */}
    <radialGradient id="sphereShade" cx="0.36" cy="0.32" r="0.95">
      <stop offset="0.45" stopColor="#000814" stopOpacity="0" />
      <stop offset="1" stopColor="#000814" stopOpacity="0.72" />
    </radialGradient>
  </defs>
);
