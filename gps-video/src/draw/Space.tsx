import React from "react";
import { random } from "remotion";
import { HEIGHT, WIDTH } from "../timing";

type Star = { x: number; y: number; r: number; tone: number; a: number };

const STARS: Star[] = Array.from({ length: 620 }, (_, i) => ({
  x: (random(`sx${i}`) * 1.3 - 0.15) * WIDTH,
  y: (random(`sy${i}`) * 1.3 - 0.15) * HEIGHT,
  r: 0.35 + Math.pow(random(`sr${i}`), 3.2) * 1.5,
  tone: Math.floor(random(`st${i}`) * 3),
  a: 0.25 + random(`sa${i}`) * 0.75,
}));

const TONES = ["#ffffff", "#bcd7ff", "#ffe9c8"];

/** Deep-space backdrop. `zoom` (0..1) pushes the stars outward for a sense of speed. */
export const Space: React.FC<{ zoom: number; frame: number }> = ({ zoom, frame }) => {
  const scale = 1 + 0.7 * zoom;
  return (
    <g>
      <rect width={WIDTH} height={HEIGHT} fill="#02040b" />
      <rect width={WIDTH} height={HEIGHT} fill="url(#nebulaA)" />
      <rect width={WIDTH} height={HEIGHT} fill="url(#nebulaB)" />
      <g transform={`translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${scale}) translate(${-WIDTH / 2} ${-HEIGHT / 2})`}>
        {STARS.map((s, i) => {
          const tw = 0.82 + 0.18 * Math.sin(frame * 0.09 + i * 1.7);
          return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={TONES[s.tone]} opacity={s.a * tw} />;
        })}
      </g>
    </g>
  );
};

export const SpaceDefs: React.FC = () => (
  <defs>
    <radialGradient id="nebulaA" cx="0.2" cy="0.25" r="0.6">
      <stop offset="0" stopColor="#1b2a6b" stopOpacity={0.35} />
      <stop offset="1" stopColor="#1b2a6b" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="nebulaB" cx="0.85" cy="0.8" r="0.55">
      <stop offset="0" stopColor="#0d4d63" stopOpacity={0.3} />
      <stop offset="1" stopColor="#0d4d63" stopOpacity={0} />
    </radialGradient>
    <filter id="blur3" x="0" y="0" width={WIDTH} height={HEIGHT} filterUnits="userSpaceOnUse">
      <feGaussianBlur stdDeviation="3" />
    </filter>
    <filter id="blur6" x="0" y="0" width={WIDTH} height={HEIGHT} filterUnits="userSpaceOnUse">
      <feGaussianBlur stdDeviation="6" />
    </filter>
    <filter id="blur12" x="0" y="0" width={WIDTH} height={HEIGHT} filterUnits="userSpaceOnUse">
      <feGaussianBlur stdDeviation="12" />
    </filter>
    <filter id="blur20" x="0" y="0" width={WIDTH} height={HEIGHT} filterUnits="userSpaceOnUse">
      <feGaussianBlur stdDeviation="20" />
    </filter>
    <filter id="glow" x="0" y="0" width={WIDTH} height={HEIGHT} filterUnits="userSpaceOnUse">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b1" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b2" />
      <feMerge>
        <feMergeNode in="b2" />
        <feMergeNode in="b1" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);
