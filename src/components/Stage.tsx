import React, {createContext, useContext} from 'react';
import {HEIGHT, WIDTH} from '../config/types';
import {rng} from '../lib/anim';
import {INK} from './StickFigure';

export type Cam = {x: number; y: number; zoom: number; rot: number};
export const CamContext = createContext<Cam>({x: WIDTH / 2, y: HEIGHT / 2, zoom: 1, rot: 0});

export type Fx = {effects: boolean};
export const FxContext = createContext<Fx>({effects: true});
export const useFx = () => useContext(FxContext);

/**
 * Camera: world point (x, y) is centred on screen at the given zoom/rotation.
 * Shake is deterministic (frame-based).
 */
export const Camera: React.FC<{cam: Partial<Cam>; shake?: number; frame?: number; children: React.ReactNode}> = ({
  cam,
  shake = 0,
  frame = 0,
  children,
}) => {
  const c: Cam = {x: WIDTH / 2, y: HEIGHT / 2, zoom: 1, rot: 0, ...cam};
  const sx = shake ? Math.sin(frame * 3.1) * shake + Math.sin(frame * 7.7) * shake * 0.5 : 0;
  const sy = shake ? Math.cos(frame * 2.3) * shake + Math.sin(frame * 6.1) * shake * 0.5 : 0;
  return (
    <CamContext.Provider value={c}>
      <g transform={`translate(${WIDTH / 2 + sx},${HEIGHT / 2 + sy}) rotate(${c.rot}) scale(${c.zoom}) translate(${-c.x},${-c.y})`}>
        {children}
      </g>
    </CamContext.Provider>
  );
};

/** depth 1 = moves with the world, <1 = distant (moves less), >1 = foreground (moves more). */
export const Parallax: React.FC<{depth: number; children: React.ReactNode}> = ({depth, children}) => {
  const c = useContext(CamContext);
  const k = 1 - depth;
  const s = Math.pow(c.zoom, depth - 1);
  const ox = (c.x - WIDTH / 2) * k;
  const oy = (c.y - HEIGHT / 2) * k;
  return (
    <g transform={`translate(${c.x},${c.y}) scale(${s}) translate(${-c.x + ox},${-c.y + oy})`}>{children}</g>
  );
};

/** Frame-stepped SVG "line boil": gives strokes a living, hand-drawn wobble. */
export const HandDrawn: React.FC<{frame: number; strength?: number; children: React.ReactNode}> = ({frame, strength = 3.2, children}) => {
  const {effects} = useFx();
  if (!effects) return <g>{children}</g>;
  const seed = Math.floor(frame / 3) % 6;
  return (
    <>
      <filter id="boil" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.014 0.017" numOctaves={2} seed={seed + 3} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={strength} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <g filter="url(#boil)">{children}</g>
    </>
  );
};

/** Hand-drawn stroke reveal for any SVG path. */
export const DrawPath: React.FC<{d: string; progress: number; stroke?: string; width?: number; opacity?: number; dash?: string; fill?: string}> = ({
  d,
  progress,
  stroke = INK,
  width = 5,
  opacity = 1,
  dash,
  fill = 'none',
}) => {
  if (progress <= 0) return null;
  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      {...(dash && progress >= 1
        ? {strokeDasharray: dash}
        : {pathLength: 1, strokeDasharray: dash ? undefined : 1, strokeDashoffset: dash ? undefined : 1 - progress})}
    />
  );
};

export const Ground: React.FC<{y: number; x1: number; x2: number; progress?: number; opacity?: number; color?: string; width?: number}> = ({
  y,
  x1,
  x2,
  progress = 1,
  opacity = 1,
  color = INK,
  width = 3,
}) => {
  const mid = (x1 + x2) / 2;
  const half = ((x2 - x1) / 2) * progress;
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={`gl-${y}-${x1}`} gradientUnits="userSpaceOnUse" x1={x1} x2={x2} y1={0} y2={0}>
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.25" stopColor={color} stopOpacity="0.9" />
          <stop offset="0.75" stopColor={color} stopOpacity="0.9" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {half > 1 ? <line x1={mid - half} x2={mid + half} y1={y} y2={y} stroke={`url(#gl-${y}-${x1})`} strokeWidth={width} strokeLinecap="round" /> : null}
    </g>
  );
};

export const Vignette: React.FC<{amount?: number; tint?: string}> = ({amount = 0.75, tint = '#000'}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background: `radial-gradient(ellipse at 50% 50%, transparent 38%, ${tint} 100%)`,
      opacity: amount,
    }}
  />
);

/** Deterministic drifting dust. */
export const Particles: React.FC<{frame: number; count?: number; seed?: number; speed?: number; color?: string; opacity?: number; area?: [number, number, number, number]}> = ({
  frame,
  count = 36,
  seed = 4,
  speed = 1,
  color = INK,
  opacity = 0.5,
  area = [0, 0, WIDTH, HEIGHT],
}) => {
  const {effects} = useFx();
  if (!effects) return null;
  const r = rng(seed);
  const [ax, ay, aw, ah] = area;
  return (
    <g>
      {Array.from({length: count}, (_, i) => {
        const bx = r() * aw;
        const by = r() * ah;
        const sp = (0.2 + r() * 0.6) * speed;
        const ph = r() * 6.28;
        const size = 0.8 + r() * 1.8;
        const o = (0.25 + r() * 0.75) * opacity;
        const x = ax + ((bx + frame * sp * 0.6 + Math.sin(frame * 0.02 + ph) * 18) % aw + aw) % aw;
        const y = ay + (((by - frame * sp * 0.45) % ah) + ah) % ah;
        return <circle key={i} cx={x} cy={y} r={size} fill={color} opacity={o * (0.6 + 0.4 * Math.sin(frame * 0.05 + ph))} />;
      })}
    </g>
  );
};

/** Soft cone of light from above. */
export const Spotlight: React.FC<{x: number; topY?: number; floorY: number; topW?: number; floorW: number; opacity?: number; id: string; tint?: string}> = ({
  x,
  topY = -40,
  floorY,
  topW = 30,
  floorW,
  opacity = 1,
  id,
  tint = '#f1ede4',
}) => {
  const {effects} = useFx();
  if (!effects || opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={tint} stopOpacity="0.22" />
          <stop offset="1" stopColor={tint} stopOpacity="0.03" />
        </linearGradient>
        <radialGradient id={`${id}-f`}>
          <stop offset="0" stopColor={tint} stopOpacity="0.28" />
          <stop offset="1" stopColor={tint} stopOpacity="0" />
        </radialGradient>
      </defs>
      <polygon points={`${x - topW},${topY} ${x + topW},${topY} ${x + floorW},${floorY} ${x - floorW},${floorY}`} fill={`url(#${id})`} />
      <ellipse cx={x} cy={floorY} rx={floorW * 1.05} ry={floorW * 0.16} fill={`url(#${id}-f)`} />
    </g>
  );
};
