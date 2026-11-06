import React from 'react';
import { mulberry32, TAU } from './math';

export type PlanetKind = 'earth' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'ball' | 'apple';

type Props = {
  kind: PlanetKind;
  cx: number;
  cy: number;
  r: number;
  /** Direction the light comes FROM in screen space (radians). Default: upper-left. */
  light?: number;
  /** Surface rotation phase in radians (earth). */
  spin?: number;
  glow?: number;
  /** Ring opening / tilt for Saturn. */
  tilt?: number;
  opacity?: number;
};

const g = mulberry32(5);
const LAND = Array.from({ length: 18 }, () => ({ lon: g() * TAU, lat: (g() - 0.5) * 1.7, size: 0.1 + g() * 0.15, tone: g() }));
const CLOUDS = Array.from({ length: 16 }, () => ({ lon: g() * TAU, lat: (g() - 0.5) * 2.2, size: 0.06 + g() * 0.08 }));
const CRATERS = [
  { x: -0.35, y: -0.25, s: 0.2 }, { x: 0.3, y: -0.4, s: 0.13 }, { x: 0.1, y: 0.2, s: 0.25 },
  { x: -0.4, y: 0.35, s: 0.12 }, { x: 0.5, y: 0.25, s: 0.1 }, { x: -0.1, y: -0.6, s: 0.09 },
];

function blobs(list: { lon: number; lat: number; size: number; tone?: number }[], lon0: number, r: number, fill: (t: number) => string, op: number) {
  const out: React.ReactNode[] = [];
  list.forEach((b, i) => {
    for (let j = 0; j < 4; j++) {
      const lon = b.lon + (j - 1.5) * 0.9 * b.size;
      const lat = b.lat + (j % 2 ? 0.45 : -0.3) * b.size;
      const rel = lon - lon0;
      const cosc = Math.cos(lat) * Math.cos(rel);
      if (cosc <= -0.05) continue;
      const x = r * Math.cos(lat) * Math.sin(rel);
      const y = -r * Math.sin(lat);
      const sz = b.size * r * (j === 1 || j === 2 ? 1 : 0.7);
      out.push(
        <ellipse
          key={`${i}-${j}`} cx={x} cy={y} rx={Math.max(0.5, sz * Math.max(cosc, 0.3))} ry={sz}
          transform={`rotate(${(Math.atan2(y, x) * 180) / Math.PI} ${x} ${y})`} fill={fill(b.tone ?? 0.5)} opacity={op}
        />,
      );
    }
  });
  return out;
}

const BANDS: Record<string, { c: string[]; base: string }> = {
  jupiter: { base: '#c9a07a', c: ['#e8d3b4', '#b98557', '#f1e2c8', '#a8693f', '#e0c4a0', '#b8865c', '#ead7ba'] },
  saturn: { base: '#d9c28f', c: ['#efe0b8', '#c9ae78', '#e8d4a2', '#bfa56f', '#efdfb6'] },
};
const FLAT: Record<string, [string, string]> = {
  mercury: ['#b7b0a6', '#6f6a63'],
  venus: ['#f1dca8', '#b48a4c'],
  mars: ['#d9774a', '#7c321c'],
  uranus: ['#bff3f2', '#5aa7b5'],
  neptune: ['#6f9bff', '#1e3f9e'],
  moon: ['#e6e4dc', '#8d8b86'],
  ball: ['#ff9a55', '#b3401a'],
  apple: ['#ff5d52', '#98150f'],
};

/** A shaded sphere drawn at real pixel radius. All gradients are per-instance so several can coexist. */
export const Planet: React.FC<Props> = ({ kind, cx, cy, r, light = -2.4, spin = 0, glow = 0, tilt = 0.28, opacity = 1 }) => {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const lx = Math.cos(light), ly = Math.sin(light);
  const shade = (
    <radialGradient id={`sh${id}`} cx={0.5 + lx * 0.2} cy={0.5 + ly * 0.2} r={0.78}>
      <stop offset="0.5" stopColor="#000610" stopOpacity="0" />
      <stop offset="1" stopColor="#000610" stopOpacity="0.8" />
    </radialGradient>
  );
  const spec = (
    <radialGradient id={`sp${id}`} cx={0.5 + lx * 0.3} cy={0.5 + ly * 0.3} r={0.3}>
      <stop offset="0" stopColor="#fff" stopOpacity={kind === 'ball' || kind === 'apple' ? 0.55 : 0.12} />
      <stop offset="1" stopColor="#fff" stopOpacity="0" />
    </radialGradient>
  );
  const base = (fill: string) => <circle r={r} fill={fill} />;
  let body: React.ReactNode;
  const defs: React.ReactNode[] = [shade, spec];

  if (kind === 'earth') {
    defs.push(
      <radialGradient key="o" id={`oc${id}`} cx={0.5 + lx * 0.12} cy={0.5 + ly * 0.12} r={0.85}>
        <stop offset="0" stopColor="#3f8fe0" /><stop offset="0.6" stopColor="#1b5ca8" /><stop offset="1" stopColor="#0c2f66" />
      </radialGradient>,
      <radialGradient key="a" id={`at${id}`}>
        <stop offset="0" stopColor="#6db6ff" stopOpacity="0" /><stop offset="0.8" stopColor="#6db6ff" stopOpacity="0" />
        <stop offset="0.85" stopColor="#7cc2ff" stopOpacity="0.55" /><stop offset="1" stopColor="#6db6ff" stopOpacity="0" />
      </radialGradient>,
    );
    body = (
      <>
        <circle r={r * 1.22} fill={`url(#at${id})`} />
        <g clipPath={`url(#cl${id})`}>
          {base(`url(#oc${id})`)}
          {blobs(LAND, spin, r, (t) => (t > 0.55 ? '#4f9a58' : '#b8a35e'), 0.95)}
          {blobs(CLOUDS, spin * 1.25, r, () => '#fff', 0.22)}
        </g>
      </>
    );
  } else if (kind === 'jupiter' || kind === 'saturn') {
    const b = BANDS[kind];
    const n = b.c.length;
    defs.push(<linearGradient key="b" id={`bd${id}`} x1="0" y1="0" x2="0" y2="1">
      {b.c.map((c, i) => <stop key={i} offset={i / (n - 1)} stopColor={c} />)}
    </linearGradient>);
    body = (
      <g clipPath={`url(#cl${id})`}>
        {base(`url(#bd${id})`)}
        {b.c.map((c, i) => (
          <rect key={i} x={-r} y={-r + ((i + 0.5) / n) * 2 * r - r * 0.05} width={2 * r} height={r * 0.1} fill={c} opacity={0.5} />
        ))}
        {kind === 'jupiter' && <ellipse cx={r * 0.25} cy={r * 0.3} rx={r * 0.16} ry={r * 0.09} fill="#b5502f" opacity={0.85} />}
      </g>
    );
  } else {
    const [c1, c2] = FLAT[kind];
    defs.push(<radialGradient key="f" id={`fl${id}`} cx={0.5 + lx * 0.15} cy={0.5 + ly * 0.15} r={0.8}>
      <stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} />
    </radialGradient>);
    body = (
      <g clipPath={`url(#cl${id})`}>
        {base(`url(#fl${id})`)}
        {(kind === 'moon' || kind === 'mercury') && CRATERS.map((c, i) => (
          <circle key={i} cx={c.x * r} cy={c.y * r} r={c.s * r} fill="#4f5058" opacity={0.3} />
        ))}
        {kind === 'apple' && <ellipse cx={0} cy={-r * 0.95} rx={r * 0.08} ry={r * 0.22} fill="#4a2f1b" transform={`rotate(12 0 ${-r * 0.9})`} />}
      </g>
    );
  }
  const rings = kind === 'saturn';
  return (
    <g transform={`translate(${cx} ${cy})`} opacity={opacity}>
      <defs>
        {defs}
        <clipPath id={`cl${id}`}><circle r={r} /></clipPath>
      </defs>
      {glow > 0 && <circle r={r * (1 + glow)} fill={`url(#gl${id})`} />}
      {glow > 0 && (
        <defs>
          <radialGradient id={`gl${id}`}>
            <stop offset="0" stopColor="#bcd8ff" stopOpacity="0" />
            <stop offset={1 / (1 + glow)} stopColor="#bcd8ff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#bcd8ff" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      {rings && <Rings r={r} tilt={tilt} front={false} />}
      {body}
      <g clipPath={`url(#cl${id})`}>
        <circle r={r} fill={`url(#sh${id})`} />
        <circle r={r} fill={`url(#sp${id})`} />
      </g>
      {rings && <Rings r={r} tilt={tilt} front />}
    </g>
  );
};

const Rings: React.FC<{ r: number; tilt: number; front: boolean }> = ({ r, tilt, front }) => {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <g transform="rotate(-18)">
      <defs>
        <clipPath id={`rc${id}`}>
          <rect x={-r * 3} y={front ? 0 : -r * 3} width={r * 6} height={r * 3} />
        </clipPath>
      </defs>
      <g clipPath={`url(#rc${id})`}>
        {[
          [1.35, 1.6, '#cdb98a', 0.7], [1.65, 1.85, '#a8946a', 0.55], [1.9, 2.15, '#d8c79c', 0.6],
        ].map(([a, b, c, o], i) => (
          <ellipse key={i} rx={r * (b as number)} ry={r * (b as number) * tilt} fill="none" stroke={c as string}
            strokeWidth={r * ((b as number) - (a as number))} opacity={o as number} />
        ))}
      </g>
    </g>
  );
};

/** The Sun: layered glow, pulsing corona and slowly rotating rays. */
export const Sun: React.FC<{ cx: number; cy: number; r: number; t?: number; opacity?: number }> = ({ cx, cy, r, t = 0, opacity = 1 }) => {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const pulse = 1 + 0.03 * Math.sin(t * 1.7);
  return (
    <g transform={`translate(${cx} ${cy})`} opacity={opacity} style={{ mixBlendMode: 'screen' }}>
      <defs>
        <radialGradient id={`s1${id}`}>
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.5" /><stop offset="0.3" stopColor="#ff9a3c" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ff6a20" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`s2${id}`}>
          <stop offset="0" stopColor="#fff6d8" stopOpacity="0.9" /><stop offset="0.4" stopColor="#ffd070" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`s3${id}`} cx="0.45" cy="0.42" r="0.65">
          <stop offset="0" stopColor="#fffbe8" /><stop offset="0.6" stopColor="#ffd96b" /><stop offset="1" stopColor="#ff9a2e" />
        </radialGradient>
      </defs>
      <circle r={r * 7 * pulse} fill={`url(#s1${id})`} />
      <g transform={`rotate(${t * 4})`}>
        {Array.from({ length: 14 }, (_, i) => (
          <polygon key={i} points={`${-r * 0.12},0 ${r * 0.12},0 0,${-r * (2.4 + 0.6 * Math.sin(i * 2.3 + t * 1.3))}`}
            transform={`rotate(${(i * 360) / 14})`} fill="#ffc870" opacity={0.14} />
        ))}
      </g>
      <circle r={r * 2.6 * pulse} fill={`url(#s2${id})`} />
      <circle r={r} fill={`url(#s3${id})`} style={{ mixBlendMode: 'normal' }} />
    </g>
  );
};
