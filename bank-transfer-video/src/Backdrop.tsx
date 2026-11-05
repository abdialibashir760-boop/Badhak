import React from "react";
import { random, useCurrentFrame } from "remotion";
import { C, H, W } from "./theme";

const BOKEH = Array.from({ length: 14 }, (_, i) => ({
  x: random(`bx${i}`) * W,
  y: random(`by${i}`) * H,
  r: 40 + random(`br${i}`) * 110,
  o: 0.04 + random(`bo${i}`) * 0.06,
  c: i % 3 === 0 ? C.cyan : C.teal,
}));

export const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const drift = (f * 0.35) % 80;
  return (
    <g>
      <rect width={W} height={H} fill="url(#bgGrad)" />
      <g opacity={0.07} stroke={C.cyan} strokeWidth={1}>
        {Array.from({ length: 26 }, (_, i) => (
          <line key={`v${i}`} x1={i * 80 - drift} y1={0} x2={i * 80 - drift} y2={H} />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 80 + drift} x2={W} y2={i * 80 + drift} />
        ))}
      </g>
      {BOKEH.map((b, i) => (
        <circle
          key={i}
          cx={b.x + Math.sin(f / 60 + i) * 14}
          cy={b.y + Math.cos(f / 70 + i) * 10}
          r={b.r}
          fill={b.c}
          opacity={b.o}
        />
      ))}
    </g>
  );
};
