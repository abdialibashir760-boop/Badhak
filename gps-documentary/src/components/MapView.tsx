import React from "react";
import { random } from "remotion";
import { clamp01, smoothstep } from "../engine/math3d";

// Procedural dark city map (no real street names): arterials, minor streets, river, parks, building footprints.
const SPAN = 1000;
const MAJOR = 240;
const MINOR = 60;

type Rect = { x: number; y: number; w: number; h: number; k: number };
const BUILDINGS: Rect[] = (() => {
  const out: Rect[] = [];
  for (let gx = -SPAN; gx < SPAN; gx += MINOR)
    for (let gy = -SPAN; gy < SPAN; gy += MINOR) {
      const n = 3 + Math.floor(random(`bn${gx}_${gy}`) * 3);
      for (let i = 0; i < n; i++) {
        const w = 10 + random(`bw${gx}_${gy}_${i}`) * 16;
        const h = 10 + random(`bh${gx}_${gy}_${i}`) * 16;
        const x = gx + 6 + random(`bx${gx}_${gy}_${i}`) * (MINOR - 12 - w);
        const y = gy + 6 + random(`by${gx}_${gy}_${i}`) * (MINOR - 12 - h);
        out.push({ x, y, w, h, k: random(`bk${gx}_${gy}_${i}`) });
      }
    }
  return out;
})();

const RIVER = Array.from({ length: 41 }, (_, i) => {
  const x = -SPAN + (i * 2 * SPAN) / 40;
  return [x, 330 + 110 * Math.sin(x / 170) + 40 * Math.sin(x / 61)] as [number, number];
});
const PARKS = [[-420, -180, 90, 60], [260, -300, 120, 70], [-120, 120, 70, 50], [520, 210, 100, 80], [-640, 300, 80, 60], [60, -520, 90, 55]];
const ROUTE: [number, number][] = [[-360, -300], [-360, 60], [0, 60], [0, 0]];

export type MapDot = { mx: number; my: number; show: number; pulse: number; acc: number };

export const MapView: React.FC<{ w: number; h: number; zoom: number; cx: number; cy: number; rot?: number; dot?: MapDot | null; route?: number; dim?: number; ghost?: { mx: number; my: number; show: number } | null }> = ({ w, h, zoom, cx, cy, rot = 0, dot, route = 0, dim = 0, ghost }) => {
  const lod = { minor: smoothstep(1.2, 2.2, zoom), bld: smoothstep(2.2, 3.6, zoom), detail: smoothstep(14, 24, zoom) };
  const half = Math.hypot(w, h) / 2 / zoom + 40;
  const vis = BUILDINGS.filter((b) => Math.abs(b.x - cx) < half && Math.abs(b.y - cy) < half);
  const major = Array.from({ length: Math.round((2 * SPAN) / MAJOR) + 1 }, (_, i) => -SPAN + i * MAJOR);
  const minor = Array.from({ length: Math.round((2 * SPAN) / MINOR) + 1 }, (_, i) => -SPAN + i * MINOR);
  const rad = (rot * Math.PI) / 180;
  const toScreen = (mx: number, my: number): [number, number] => {
    const dx = (mx - cx) * zoom;
    const dy = (my - cy) * zoom;
    return [w / 2 + dx * Math.cos(rad) - dy * Math.sin(rad), h / 2 + dx * Math.sin(rad) + dy * Math.cos(rad)];
  };
  const ns = { vectorEffect: "non-scaling-stroke" as const };
  const wMajor = 1.4 + Math.min(zoom, 40) * 0.28;
  const wMinor = 0.8 + Math.min(zoom, 40) * 0.18;
  return (
    <g>
      <rect width={w} height={h} fill="#091a33" />
      <g transform={`translate(${w / 2} ${h / 2}) rotate(${rot}) scale(${zoom}) translate(${-cx} ${-cy})`}>
        {PARKS.map(([px, py, rx, ry], i) => <ellipse key={i} cx={px} cy={py} rx={rx} ry={ry} fill="#0e3a3c" opacity={0.9} />)}
        <path d={"M" + RIVER.map((p) => p.join(" ")).join("L")} fill="none" stroke="#0f4274" strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" />
        <path d={"M" + RIVER.map((p) => p.join(" ")).join("L")} fill="none" stroke="#14548f" strokeWidth={4} opacity={0.5} />
        {lod.bld > 0.02 && vis.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.k > 0.82 ? "#1c3b66" : "#132f55"} opacity={lod.bld} />)}
        {lod.minor > 0.02 && (
          <g stroke="#173761" strokeWidth={wMinor} opacity={lod.minor} {...ns}>
            {minor.map((v) => <line key={`mx${v}`} x1={v} y1={-SPAN} x2={v} y2={SPAN} {...ns} />)}
            {minor.map((v) => <line key={`my${v}`} x1={-SPAN} y1={v} x2={SPAN} y2={v} {...ns} />)}
          </g>
        )}
        <g stroke="#2a5d99" strokeWidth={wMajor} strokeLinecap="round" {...ns}>
          {major.map((v) => <line key={`Mx${v}`} x1={v} y1={-SPAN} x2={v} y2={SPAN} {...ns} />)}
          {major.map((v) => <line key={`My${v}`} x1={-SPAN} y1={v} x2={SPAN} y2={v} {...ns} />)}
          <line x1={-SPAN} y1={-SPAN * 0.6} x2={SPAN} y2={SPAN * 0.7} {...ns} stroke="#3573b8" />
          <line x1={-SPAN * 0.7} y1={SPAN} x2={SPAN * 0.5} y2={-SPAN} {...ns} stroke="#3573b8" />
        </g>
        {route > 0 && <polyline points={ROUTE.map((p) => p.join(",")).join(" ")} fill="none" stroke="#4fd8ff" strokeWidth={4 + zoom * 0.4} strokeLinejoin="round" strokeLinecap="round" opacity={0.9} strokeDasharray={`${route * 2000} 5000`} {...ns} />}
      </g>
      {dim > 0 && <rect width={w} height={h} fill="#02060f" opacity={dim} />}
      {ghost && ghost.show > 0.01 && (() => {
        const [gx, gy] = toScreen(ghost.mx, ghost.my);
        return <circle cx={gx} cy={gy} r={9} fill="#ff6b6b" opacity={ghost.show * 0.9} stroke="#fff" strokeWidth={2} />;
      })()}
      {dot && dot.show > 0.01 && (() => {
        const [dx, dy] = toScreen(dot.mx, dot.my);
        const k = dot.show;
        return (
          <g opacity={k}>
            <circle cx={dx} cy={dy} r={dot.acc} fill="#3b8cff" opacity={0.16} />
            <circle cx={dx} cy={dy} r={dot.acc} fill="none" stroke="#6fb0ff" strokeWidth={1.5} opacity={0.6} />
            <circle cx={dx} cy={dy} r={16 + 34 * dot.pulse} fill="#3b8cff" opacity={0.35 * (1 - dot.pulse)} />
            <circle cx={dx} cy={dy} r={13} fill="#fff" />
            <circle cx={dx} cy={dy} r={9.5} fill="#2f7bff" />
          </g>
        );
      })()}
    </g>
  );
};
export { clamp01 };
