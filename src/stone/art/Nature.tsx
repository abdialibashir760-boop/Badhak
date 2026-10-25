import React from 'react';
import {clamp, lerp, rng} from '../../lib/anim';
import {useFx} from '../../components/Stage';

export const SINK = '#0d0907'; // ink outline colour (matches the supplied art's dark brown-black lines)

const hex = (h: string) =>
  h.startsWith('#') ? [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) : (h.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(t)))).join(',')})`;
};

type Sky = {t: number; top: string; mid: string; hor: string; sun: number; light: string};
const SKY: Sky[] = [
  {t: 0.0, top: '#26394a', mid: '#5f7b82', hor: '#e0a06c', sun: 0.12, light: '#f0b887'},
  {t: 0.18, top: '#476c86', mid: '#9db6b4', hor: '#d3dccb', sun: 0.3, light: '#f4efd8'},
  {t: 0.45, top: '#6797b3', mid: '#a8c3c8', hor: '#dde6dc', sun: 0.62, light: '#fff7e0'},
  {t: 0.68, top: '#4b7690', mid: '#b4b5a0', hor: '#e8c58f', sun: 0.34, light: '#f7cf94'},
  {t: 0.86, top: '#241f3d', mid: '#6a4655', hor: '#e2763c', sun: 0.06, light: '#e8884a'},
  {t: 1.0, top: '#04050c', mid: '#0a0e22', hor: '#171d3b', sun: -0.2, light: '#4a5aa0'},
];

export const skyAt = (tod: number) => {
  let i = 1;
  while (i < SKY.length - 1 && tod > SKY[i].t) i++;
  const a = SKY[i - 1];
  const b = SKY[i];
  const k = clamp((tod - a.t) / (b.t - a.t));
  return {
    top: mix(a.top, b.top, k),
    mid: mix(a.mid, b.mid, k),
    hor: mix(a.hor, b.hor, k),
    light: mix(a.light, b.light, k),
    sun: lerp(a.sun, b.sun, k),
    night: clamp((tod - 0.82) / 0.16),
  };
};

/** Sky dome with a hazy low sun / moon and stars at night. Screen-space (x range is generous for camera pans). */
export const SkyBox: React.FC<{tod: number; frame: number; id?: string; horizonY?: number; x0?: number; x1?: number; sunX?: number}> = ({
  tod,
  frame,
  id = 'sky',
  horizonY = 620,
  x0 = -1500,
  x1 = 3600,
  sunX = 1380,
}) => {
  const s = skyAt(tod);
  const sunY = horizonY - s.sun * 520;
  const stars = React.useMemo(() => {
    const r = rng(11);
    return Array.from({length: 120}, () => ({x: x0 + r() * (x1 - x0), y: r() * horizonY * 0.9, s: 0.6 + r() * 1.6, p: r() * 6}));
  }, [x0, x1, horizonY]);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.top} />
          <stop offset="0.55" stopColor={s.mid} />
          <stop offset="1" stopColor={s.hor} />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor={s.light} stopOpacity="0.95" />
          <stop offset="0.25" stopColor={s.light} stopOpacity="0.45" />
          <stop offset="1" stopColor={s.light} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={x0} y={-600} width={x1 - x0} height={horizonY + 900} fill={`url(#${id}-g)`} />
      {s.night > 0.05
        ? stars.map((st, i) => <circle key={i} cx={st.x} cy={st.y} r={st.s} fill="#dfe6ff" opacity={s.night * (0.35 + 0.55 * Math.abs(Math.sin(frame * 0.03 + st.p)))} />)
        : null}
      {s.sun > -0.1 ? <circle cx={sunX} cy={sunY} r={360} fill={`url(#${id}-sun)`} /> : null}
      {s.sun > 0 ? <circle cx={sunX} cy={sunY} r={46} fill={s.light} opacity={0.9} /> : null}
      {s.night > 0.4 ? (
        <g opacity={s.night}>
          <circle cx={sunX - 500} cy={170} r={170} fill="#9bb0ff" opacity={0.08} />
          <circle cx={sunX - 500} cy={170} r={44} fill="#dfe6ff" />
          <circle cx={sunX - 486} cy={160} r={40} fill="#05060d" opacity={0.0} />
        </g>
      ) : null}
    </g>
  );
};

export type Tone = {a: string; b: string; trunk: string};
export const TONES = {
  near: {a: '#22332f', b: '#36524d', trunk: '#2b211b'},
  mid: {a: '#31504b', b: '#4c6e69', trunk: '#3a2d24'},
  far: {a: '#6d8887', b: '#8ca5a3', trunk: '#697676'},
  haze: {a: '#9db3b2', b: '#b7c9c6', trunk: '#8fa1a0'},
};
export const toneAt = (name: keyof typeof TONES, night: number, warm = 0): Tone => {
  const t = TONES[name];
  const dark = '#06090d';
  const sun = '#b9784a';
  const f = (c: string) => mix(mix(c, sun, warm * 0.28), dark, night * 0.86);
  return {a: f(t.a), b: f(t.b), trunk: f(t.trunk)};
};

export const Pine: React.FC<{x: number; base: number; h: number; seed?: number; tone: Tone; lw?: number}> = ({x, base, h, seed = 1, tone, lw = 3}) => {
  const r = rng(Math.floor(seed * 9973));
  const w = h * (0.17 + r() * 0.05);
  const tiers = 6;
  const top = base - h;
  const trunkW = h * 0.04;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < tiers; i++) {
    const y0 = top + (i / tiers) * h * 0.82;
    const y1 = y0 + (h * 0.82) / tiers + h * 0.1;
    const wi = w * (0.28 + (0.72 * (i + 1)) / tiers);
    const droop = h * 0.02;
    const jag = (side: 1 | -1) => {
      const pts: string[] = [];
      for (let j = 1; j <= 3; j++) {
        const u = j / 3;
        pts.push(`${(x + side * wi * u * (0.82 + r() * 0.16)).toFixed(1)},${(y0 + (y1 - y0) * u * 0.92 + (j % 2) * droop).toFixed(1)}`);
      }
      return pts;
    };
    const right = jag(1);
    const left = jag(-1).reverse();
    const d = `M ${x},${y0} L ${right.join(' L ')} L ${x + wi * 0.5},${(y1 + droop).toFixed(1)} L ${x},${(y1 - droop).toFixed(1)} L ${x - wi * 0.5},${(y1 + droop).toFixed(1)} L ${left.join(' L ')} Z`;
    out.push(<path key={i} d={d} fill={i % 2 ? tone.a : tone.b} stroke={SINK} strokeWidth={lw} strokeLinejoin="round" />);
  }
  return (
    <g>
      <path d={`M ${x - trunkW},${base} L ${x - trunkW * 0.55},${top + h * 0.3} L ${x + trunkW * 0.55},${top + h * 0.3} L ${x + trunkW},${base} Z`} fill={tone.trunk} stroke={SINK} strokeWidth={lw} strokeLinejoin="round" />
      {out}
    </g>
  );
};

export const Birch: React.FC<{x: number; base: number; h: number; seed?: number; night: number; lw?: number}> = ({x, base, h, seed = 1, night, lw = 3}) => {
  const r = rng(Math.floor(seed * 7919));
  const w = h * 0.026;
  const bark = mix('#d9d6c8', '#07090d', night * 0.85);
  const leaf = mix('#c9a63e', '#0a0d12', night * 0.85);
  const sway = Math.sin(seed) * 6;
  const marks = Array.from({length: 7}, (_, i) => ({y: base - h * (0.08 + 0.12 * i + r() * 0.04), s: 0.4 + r() * 0.6}));
  const blobs = Array.from({length: 22}, () => ({dx: (r() - 0.5) * h * 0.4, dy: -h * (0.55 + r() * 0.42), rr: h * (0.018 + r() * 0.03), c: r()}));
  return (
    <g>
      <path d={`M ${x - w},${base} Q ${x - w * 0.5 + sway * 0.4},${base - h * 0.5} ${x + sway - w * 0.6},${base - h * 0.96} L ${x + sway + w * 0.6},${base - h * 0.96} Q ${x + w * 0.5 + sway * 0.4},${base - h * 0.5} ${x + w},${base} Z`} fill={bark} stroke={SINK} strokeWidth={lw} strokeLinejoin="round" />
      {marks.map((m, i) => (
        <path key={i} d={`M ${x - w * m.s},${m.y} q ${w * m.s},-3 ${w * m.s * 1.6},0`} stroke={SINK} strokeWidth={lw * 0.8} strokeLinecap="round" fill="none" />
      ))}
      <path d={`M ${x + sway * 0.5},${base - h * 0.5} q ${w * 8},${-h * 0.08} ${w * 12},${-h * 0.2} M ${x + sway * 0.7},${base - h * 0.65} q ${-w * 7},${-h * 0.06} ${-w * 11},${-h * 0.16}`} stroke={SINK} strokeWidth={lw * 0.8} fill="none" strokeLinecap="round" />
      {blobs.map((b, i) => (
        <ellipse key={i} cx={x + b.dx + sway} cy={base + b.dy} rx={b.rr * 1.5} ry={b.rr} transform={`rotate(${b.c * 80 - 40} ${x + b.dx + sway} ${base + b.dy})`} fill={mix(leaf, '#8a6a22', b.c * 0.6)} opacity={0.88} />
      ))}
    </g>
  );
};

export const TreeLine: React.FC<{
  x0: number;
  x1: number;
  base: number;
  count: number;
  hMin: number;
  hMax: number;
  seed: number;
  tone: Tone;
  night?: number;
  birchRatio?: number;
  lw?: number;
  skip?: [number, number][];
}> = ({x0, x1, base, count, hMin, hMax, seed, tone, night = 0, birchRatio = 0.25, lw = 3, skip = []}) => {
  const r = rng(seed);
  const trees = Array.from({length: count}, (_, i) => {
    const x = x0 + ((i + 0.2 + r() * 0.6) / count) * (x1 - x0);
    return {x, h: lerp(hMin, hMax, r()), birch: r() < birchRatio, s: r() * 100, dy: (r() - 0.5) * 20};
  }).filter((t) => !skip.some(([a, b]) => t.x > a && t.x < b));
  return (
    <g>
      {trees.map((t, i) =>
        t.birch ? (
          <Birch key={i} x={t.x} base={base + t.dy} h={t.h * 0.85} seed={t.s} night={night} lw={lw} />
        ) : (
          <Pine key={i} x={t.x} base={base + t.dy} h={t.h} seed={t.s} tone={tone} lw={lw} />
        ),
      )}
    </g>
  );
};

/** Drifting ground fog. */
export const Fog: React.FC<{frame: number; y: number; x0?: number; x1?: number; opacity?: number; seed?: number; speed?: number; color?: string; id: string; h?: number}> = ({
  frame,
  y,
  x0 = -1200,
  x1 = 3200,
  opacity = 0.35,
  seed = 3,
  speed = 0.35,
  color = '#cdd9d6',
  id,
  h = 150,
}) => {
  const {effects} = useFx();
  if (!effects) return null;
  const r = rng(seed);
  const n = 7;
  const span = x1 - x0;
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity={opacity} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({length: n}, (_, i) => {
        const w = 520 + r() * 520;
        const x = x0 + ((((i / n) * span + frame * speed * (0.6 + r() * 0.8) + r() * 300) % span) + span) % span;
        return <ellipse key={i} cx={x} cy={y + Math.sin(frame * 0.01 + i) * 14 + (r() - 0.5) * 60} rx={w} ry={h * (0.6 + r() * 0.6)} fill={`url(#${id})`} />;
      })}
    </g>
  );
};

/** Distant birds crossing the sky. */
export const Birds: React.FC<{frame: number; seed?: number; count?: number; y?: number; opacity?: number; color?: string}> = ({frame, seed = 5, count = 6, y = 220, opacity = 0.8, color = '#1b2227'}) => {
  const r = rng(seed);
  return (
    <g opacity={opacity}>
      {Array.from({length: count}, (_, i) => {
        const sp = 1.2 + r() * 0.9;
        const x = ((((r() * 2600 + frame * sp) % 3000) + 3000) % 3000) - 500;
        const yy = y + r() * 160 + Math.sin(frame * 0.05 + i) * 16;
        const flap = Math.sin(frame * 0.4 + i * 2) * 8;
        const s = 0.7 + r() * 0.8;
        return (
          <path key={i} d={`M ${x - 16 * s},${yy + flap * s} Q ${x - 7 * s},${yy - 5 * s} ${x},${yy} Q ${x + 7 * s},${yy - 5 * s} ${x + 16 * s},${yy + flap * s}`} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

/** Falling leaves / snow flecks (deterministic). */
export const Leaves: React.FC<{frame: number; count?: number; seed?: number; color?: string; area?: [number, number, number, number]; opacity?: number; speed?: number}> = ({
  frame,
  count = 26,
  seed = 8,
  color = '#c9a63e',
  area = [-200, -100, 2400, 1200],
  opacity = 0.9,
  speed = 1,
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
        const sp = (0.8 + r() * 1.2) * speed;
        const ph = r() * 6.28;
        const x = ax + ((((bx + frame * sp * 0.7 + Math.sin(frame * 0.03 + ph) * 60) % aw) + aw) % aw);
        const y = ay + ((((by + frame * sp * 1.3) % ah) + ah) % ah);
        const rot = Math.sin(frame * 0.05 + ph) * 70 + ph * 20;
        const s = 5 + r() * 6;
        return <path key={i} transform={`translate(${x},${y}) rotate(${rot})`} d={`M 0 ${-s} Q ${s * 0.8} 0 0 ${s} Q ${-s * 0.8} 0 0 ${-s} Z`} fill={color} opacity={opacity * (0.5 + 0.5 * r())} />;
      })}
    </g>
  );
};

export const Rock: React.FC<{x: number; y: number; s?: number; seed?: number; tone?: string; lw?: number}> = ({x, y, s = 1, seed = 1, tone = '#5a5650', lw = 3.5}) => {
  const r = rng(Math.floor(seed * 1013));
  const pts = Array.from({length: 7}, (_, i) => {
    const a = Math.PI + (i / 6) * Math.PI;
    const rr = 1 + (r() - 0.5) * 0.35;
    return [Math.cos(a) * 70 * rr * s, Math.sin(a) * 52 * rr * s] as const;
  });
  const d = `M ${x - 70 * s},${y} ${pts.map(([px, py]) => `L ${x + px},${y + py}`).join(' ')} L ${x + 70 * s},${y} Z`;
  return (
    <g>
      <path d={d} fill={tone} stroke={SINK} strokeWidth={lw} strokeLinejoin="round" />
      <path d={`M ${x - 18 * s},${y - 38 * s} L ${x + 4 * s},${y - 10 * s} L ${x - 4 * s},${y}`} stroke={SINK} strokeWidth={lw * 0.7} fill="none" strokeLinecap="round" opacity={0.7} />
      <path d={`M ${x + 20 * s},${y - 44 * s} Q ${x + 44 * s},${y - 36 * s} ${x + 50 * s},${y - 16 * s}`} stroke="#fff" strokeWidth={lw} fill="none" strokeLinecap="round" opacity={0.12} />
    </g>
  );
};

/** Ground slab with a wavy top edge, grass tufts and optional snow patches. */
export const Terrain: React.FC<{
  x0: number;
  x1: number;
  y: number;
  bottom?: number;
  seed?: number;
  top: string;
  deep: string;
  tufts?: number;
  tuftColor?: string;
  amp?: number;
  snow?: number;
  lw?: number;
}> = ({x0, x1, y, bottom = 1300, seed = 2, top, deep, tufts = 40, tuftColor = '#556048', amp = 14, snow = 0, lw = 3.5}) => {
  const r = rng(seed);
  const step = 120;
  const pts: [number, number][] = [];
  for (let x = x0; x <= x1 + step; x += step) pts.push([x, y + (r() - 0.5) * amp * 2]);
  const edge = pts.map(([px, py], i) => (i === 0 ? `M ${px},${py}` : `L ${px},${py}`)).join(' ');
  const gid = `ter-${seed}-${y}`;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>
      <path d={`${edge} L ${x1 + step},${bottom} L ${x0},${bottom} Z`} fill={`url(#${gid})`} stroke={SINK} strokeWidth={lw} strokeLinejoin="round" />
      {Array.from({length: tufts}, (_, i) => {
        const x = x0 + r() * (x1 - x0);
        const yy = y + 10 + r() * (bottom - y) * 0.25;
        const s = 0.6 + r() * 0.9;
        return (
          <path key={i} d={`M ${x - 7 * s},${yy} q ${2 * s},${-16 * s} ${6 * s},${-20 * s} M ${x},${yy} q ${0},${-22 * s} ${2 * s},${-26 * s} M ${x + 7 * s},${yy} q ${-2 * s},${-14 * s} ${-6 * s},${-18 * s}`} stroke={tuftColor} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        );
      })}
      {Array.from({length: snow}, (_, i) => {
        const x = x0 + r() * (x1 - x0);
        const yy = y + 16 + r() * 60;
        return <ellipse key={i} cx={x} cy={yy} rx={30 + r() * 60} ry={5 + r() * 6} fill="#dbe5e7" opacity={0.55} />;
      })}
    </g>
  );
};

export const River: React.FC<{y: number; x0: number; x1: number; h: number; frame: number; tod?: number}> = ({y, x0, x1, h, frame, tod = 0.3}) => {
  const s = skyAt(tod);
  return (
    <g>
      <path d={`M ${x0},${y} Q ${(x0 + x1) / 2},${y - 18} ${x1},${y} L ${x1},${y + h} Q ${(x0 + x1) / 2},${y + h + 20} ${x0},${y + h} Z`} fill={mix('#35545f', '#05080e', s.night * 0.9)} stroke={SINK} strokeWidth={3.5} />
      {Array.from({length: 22}, (_, i) => {
        const x = x0 + ((((i * 137 + frame * (1.2 + (i % 3) * 0.5)) % (x1 - x0)) + (x1 - x0)) % (x1 - x0));
        const yy = y + 14 + ((i * 47) % (h - 24));
        return <path key={i} d={`M ${x},${yy} q 14,-5 30,0`} stroke={s.light} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.35} />;
      })}
    </g>
  );
};

/** Subtle painterly grain + unevenness to echo the textured source art. Static per scene. */
export const PaintOverlay: React.FC<{opacity?: number}> = ({opacity = 0.08}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity, pointerEvents: 'none'}}>
    <filter id="paint-tex" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={4} seed={7} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.45  1.4 0 0 0 -0.35" />
    </filter>
    <rect width={1920} height={1080} filter="url(#paint-tex)" />
  </svg>
);

/** Tonal grade over the whole frame (cold morning -> warm dusk -> blue night). */
export const Grade: React.FC<{tod: number; amount?: number}> = ({tod, amount = 1}) => {
  const s = skyAt(tod);
  const warm = clamp(1 - Math.abs(tod - 0.9) / 0.1) * 0.5 + clamp(1 - Math.abs(tod - 0.05) / 0.08) * 0.3;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
        background: `linear-gradient(180deg, ${mix('#ffffff', '#7787a8', s.night * 0.7)} 0%, ${mix('#ffffff', warm > 0.1 ? '#ffd2b0' : '#c9d4e0', Math.max(warm, 0.35 * (1 - s.night)))} 100%)`,
        opacity: amount,
      }}
    />
  );
};
