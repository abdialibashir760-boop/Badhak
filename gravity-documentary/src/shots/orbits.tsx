import React from 'react';
import {
  Space, Vignette, Planet, Sun, Surface, wellHeight, makeView, project, ChapterCard, Tag, Arrow, integrate2D, kepler2D,
  PLANETS, ease, lerp, seg, smooth, window01, clamp, W, H, CYAN, DIM, FONT, GOLD, GREEN, INK, ORANGE, TAU, SERIF,
  type SurfaceBody, type SurfaceLine, type LineStyle,
} from '../lib';
import type { ShotProps } from './hook';

const rad = (d: number) => (d * Math.PI) / 180;
const SUN_WELL = { gm: 40, s: 3.6 };
const vCirc = (r: number, w = SUN_WELL) => Math.sqrt((w.gm * r * r) / Math.pow(r * r + w.s * w.s, 1.5));
const SUN_PAL = ['#4f7cb0', '#5aa6e0', '#8fd9ea', '#d3ec9c', '#ffc96b', '#ff8a50'];

const sunBody = (t: number, h: (x: number, z: number) => number): SurfaceBody => ({
  id: 'sun', x: 0, z: 0, y: h(0, 0) + 1.6, radius: 2.0,
  render: (sx, sy, r) => <Sun cx={sx} cy={sy} r={r} t={t} />,
});

/* ───────────── 25 · Chapter: Orbits ───────────── */
export const OrbitsCard: React.FC<ShotProps> = ({ t, dur }) => (
  <Space tint="warm" driftX={-t * 10}>
    <svg width={W} height={H} style={{ position: 'absolute' }}>
      <Sun cx={W / 2} cy={480} r={70} t={t} opacity={0.55} />
      {[210, 330, 470, 640].map((r, i) => (
        <g key={r}>
          <ellipse cx={W / 2} cy={480} rx={r} ry={r * 0.32} fill="none" stroke="#9fc4ff" strokeOpacity={0.2} />
          <circle cx={W / 2 + r * Math.cos(t * (0.8 - i * 0.14) + i * 1.7)} cy={480 + r * 0.32 * Math.sin(t * (0.8 - i * 0.14) + i * 1.7)} r={7 + i} fill={i % 2 ? CYAN : GOLD} />
        </g>
      ))}
    </svg>
    <ChapterCard num="III" title="ORBITS" sub="Falling around a curved Sun" t={t} dur={dur} y={560} accent={ORANGE} />
    <Vignette />
  </Space>
);

/* ───────────── 26 · The Sun curves spacetime ───────────── */
export const SunWell: React.FC<ShotProps> = ({ t, dur }) => {
  const view = makeView({ pitch: rad(lerp(60, 36, smooth(t, 0, dur - 0.5))), yaw: lerp(0, 0.5, smooth(t, 0, dur)), dist: 36, ty: -4 });
  const amp = smooth(t, 0.2, 2.2);
  const h = wellHeight([{ x: 0, z: 0, ...SUN_WELL, amp }]);
  const orbitR = [8, 12.5, 18];
  const bodies: SurfaceBody[] = [sunBody(t, h)];
  orbitR.forEach((r, i) => {
    const a = 0.4 + (t * 2 * vCirc(r)) / r + i * 2.1;
    const x = r * Math.cos(a), z = -r * Math.sin(a);
    bodies.push({ id: `p${i}`, x, z, y: h(x, z) + 0.45, radius: 0.5 + 0.1 * i, render: (sx, sy, rr) => <Planet kind={(['mars', 'earth', 'jupiter'] as const)[i]} cx={sx} cy={sy} r={Math.max(rr, 6)} /> });
  });
  return (
    <Space tint="warm">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Surface view={view} height={h} wells={[{ x: 0, z: 0 }]} bodies={bodies} depthScale={11} palette={SUN_PAL} />
      </svg>
      <Tag x={W / 2} y={150} text="The Sun's enormous mass curves the spacetime around it" color={INK} size={48} opacity={window01(t, 0.3, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 27 · A planet coasts along the straightest path ───────────── */
export const CoastingPlanet: React.FC<ShotProps> = ({ t, dur }) => {
  const view = makeView({ pitch: rad(40), yaw: lerp(0.2, -0.3, smooth(t, 0, dur)), dist: 34, ty: -4 });
  const h = wellHeight([{ x: 0, z: 0, ...SUN_WELL }]);
  const r0 = 13;
  const path = React.useMemo(() => integrate2D({ gm: SUN_WELL.gm, s: SUN_WELL.s, x: r0, z: 0, vx: 0, vz: -vCirc(r0) * 0.78, steps: 1500, dt: 0.06, every: 3 }), []);
  const head = Math.max(3, Math.floor(path.length * clamp(seg(t, 0, dur) * 0.9)));
  const p = path[head], q = path[head + 1] ?? p;
  const vx = (q.x - p.x), vz = (q.z - p.z);
  const vn = Math.hypot(vx, vz) || 1;
  const y = (x: number, z: number) => h(x, z) + 0.5;
  const s0 = project(view, p.x, y(p.x, p.z), p.z);
  const s1 = project(view, p.x + (vx / vn) * 3.4, y(p.x + (vx / vn) * 3.4, p.z + (vz / vn) * 3.4), p.z + (vz / vn) * 3.4);
  const bodies: SurfaceBody[] = [sunBody(t, h), { id: 'pl', x: p.x, z: p.z, y: y(p.x, p.z), radius: 0.55, render: (sx, sy, r) => <Planet kind="earth" cx={sx} cy={sy} r={Math.max(r, 8)} spin={t * 2} /> }];
  const lines: SurfaceLine[] = [{ pts: path.slice(0, head + 1), style: 'tr' }];
  const styles: Record<string, LineStyle> = { tr: { stroke: GOLD, opacity: 0.9, width: 3.5, glow: 9 } };
  return (
    <Space tint="warm">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Surface view={view} height={h} wells={[{ x: 0, z: 0 }]} bodies={bodies} lines={lines} lineStyles={styles} depthScale={11} palette={SUN_PAL} />
        <Arrow x1={s0.x} y1={s0.y} x2={s1.x} y2={s1.y} color={CYAN} width={5} label="its motion" labelOffset={[14, -10]} />
      </svg>
      <Tag x={W / 2} y={150} text="A planet isn't tugged on a rope" color={INK} size={50} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={212} text="It coasts along the straightest possible path" color={GOLD} size={36} opacity={smooth(t, 1.4, 2.2) * window01(t, 0, dur, 0.5)} weight={500} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 28 · Why doesn't it fall in? Sideways speed ───────────── */
export const WhyNotFall: React.FC<ShotProps> = ({ t, dur }) => {
  const view = makeView({ pitch: rad(52), yaw: lerp(0, 0.2, smooth(t, 0, dur)), dist: 40, ty: -3 });
  const h = wellHeight([{ x: 0, z: 0, ...SUN_WELL }]);
  const r0 = 12;
  const vc = vCirc(r0);
  const runs = [
    { f: 0.12, c: '#ff6b6b', label: 'no sideways speed: falls straight in', start: 0.5, steps: 260 },
    { f: 0.7, c: GREEN, label: 'some sideways speed: falls around the Sun', start: 2.2, steps: 800 },
    { f: 1.0, c: GOLD, label: 'just enough: a circle', start: 4.0, steps: 700 },
    { f: 1.28, c: CYAN, label: 'faster: a stretched ellipse', start: 5.6, steps: 900 },
  ];
  const paths = React.useMemo(() => runs.map((r) => integrate2D({ gm: SUN_WELL.gm, s: SUN_WELL.s, x: r0, z: 0, vx: 0, vz: -r.f * vc, steps: r.steps, dt: 0.06, every: 2 })), []);
  const styles: Record<string, LineStyle> = {};
  const lines: SurfaceLine[] = [];
  const bodies: SurfaceBody[] = [sunBody(t, h)];
  runs.forEach((r, i) => {
    styles[`r${i}`] = { stroke: r.c, opacity: 0.95, width: 4, glow: 9 };
    const n = Math.max(2, Math.floor(paths[i].length * ease.inOut(seg(t, r.start, r.start + 1.8))));
    if (t > r.start) {
      lines.push({ pts: paths[i].slice(0, n), style: `r${i}` });
      const hd = paths[i][n - 1];
      bodies.push({ id: `h${i}`, x: hd.x, z: hd.z, y: h(hd.x, hd.z) + 0.35, radius: 0.3, render: (sx, sy, rr) => <circle cx={sx} cy={sy} r={Math.max(rr, 6)} fill={r.c} /> });
    }
  });
  const idx = runs.reduce((a, r, i) => (t >= r.start ? i : a), 0);
  return (
    <Space tint="warm">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Surface view={view} height={h} wells={[{ x: 0, z: 0 }]} bodies={bodies} lines={lines} lineStyles={styles} depthScale={11} palette={SUN_PAL} />
      </svg>
      <Tag x={W / 2} y={150} text="So why doesn't it fall straight into the Sun?" color={INK} size={50} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={212} text={runs[idx].label} color={runs[idx].c} size={38} opacity={window01(t, 0.3, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 29 · Fly through the solar system ───────────── */
const orbitR = (a: number) => 5 * Math.pow(a, 0.62);
export const SolarFlythrough: React.FC<ShotProps> = ({ t, dur }) => {
  const k = smooth(t, 0, dur);
  const view = makeView({ pitch: rad(lerp(24, 52, k)), yaw: lerp(-0.3, 1.1, k), dist: lerp(11, 62, ease.out(seg(t, 0, dur))), ty: 0 });
  const time = t * (1 / 6); // 6 s = 1 Earth year
  const pos = PLANETS.map((p) => {
    const M = TAU * (time / p.T) + p.a;
    const q = kepler2D(orbitR(p.a), p.e, M, 0.4 * p.a);
    return { p, x: q.x, z: -q.y };
  });
  const bodies: SurfaceBody[] = [{ id: 'sun', x: 0, y: 0, z: 0, radius: 1.5, render: (sx, sy, r) => <Sun cx={sx} cy={sy} r={r} t={t} /> }];
  const lines: SurfaceLine[] = [];
  const styles: Record<string, LineStyle> = { orb: { stroke: '#9fc4ff', opacity: 0.35, width: 1.5 } };
  pos.forEach(({ p, x, z }) => {
    const pr = 0.28 + 0.2 * Math.sqrt(p.rad);
    bodies.push({ id: p.name, x, y: 0, z, radius: pr, render: (sx, sy, r) => (
      <g><Planet kind={p.kind} cx={sx} cy={sy} r={Math.max(r, 3.5)} spin={t * 2} light={Math.atan2(-sy + 500, -sx + 960) + Math.PI} /></g>
    ) });
    lines.push({ pts: Array.from({ length: 121 }, (_, i) => { const q = kepler2D(orbitR(p.a), p.e, (i / 120) * TAU, 0.4 * p.a); return { x: q.x, z: -q.y }; }), style: 'orb', lift: 0 });
  });
  const labels = pos.map(({ p, x, z }) => ({ p, s: project(view, x, 0, z) }));
  return (
    <Space tint="blue" driftX={-k * 200}>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Surface view={view} height={() => 0} flat bodies={bodies} lines={lines} lineStyles={styles} half={64} spacing={4} gridOpacity={0.14} fade={[50, 62, 80]} />
        {labels.map(({ p, s }) => (
          <Tag key={p.name} x={s.x} y={s.y - 24 - 6 * Math.sqrt(p.rad)} text={p.name} color={DIM} size={24} opacity={smooth(t, 3, 5) * 0.9} weight={500} />
        ))}
      </svg>
      <Tag x={W / 2} y={150} text="Eight planets, one geometry" color={INK} size={50} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={212} text="time-lapse: one Earth year every 6 seconds · orbit sizes compressed" color={DIM} size={28} opacity={smooth(t, 1, 2) * window01(t, 0, dur, 0.5)} weight={500} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 30 · Nearer planets move faster ───────────── */
export const SpeedChart: React.FC<ShotProps> = ({ t, dur }) => {
  const x0 = 560, maxW = 920, rowH = 74, y0 = 250;
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {PLANETS.map((p, i) => {
          const g = ease.out(seg(t, 0.4 + i * 0.25, 1.4 + i * 0.25));
          const y = y0 + i * rowH;
          const wBar = (p.v / 47.4) * maxW * g;
          return (
            <g key={p.name}>
              <Planet kind={p.kind} cx={x0 - 190} cy={y + 24} r={22} />
              <Tag x={x0 - 150} y={y + 36} text={p.name} color={INK} size={32} align="start" />
              <rect x={x0} y={y} width={maxW} height={48} rx={10} fill="rgba(127,176,255,.07)" />
              <rect x={x0} y={y} width={Math.max(2, wBar)} height={48} rx={10} fill={`url(#sp${i})`} />
              <defs><linearGradient id={`sp${i}`} x1="0" x2="1"><stop offset="0" stopColor={CYAN} /><stop offset="1" stopColor={i < 4 ? GOLD : '#7aa6ff'} /></linearGradient></defs>
              <Tag x={x0 + wBar + 16} y={y + 36} text={`${(p.v * g).toFixed(1)} km/s`} color={GOLD} size={30} align="start" opacity={g} />
            </g>
          );
        })}
      </svg>
      <Tag x={W / 2} y={150} text="Nearer the Sun: faster. Farther away: slower." color={INK} size={50} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={205} text="average orbital speed" color={DIM} size={28} weight={500} opacity={window01(t, 0.3, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 31 · Mercury's shifting orbit ───────────── */
export const MercuryPrecession: React.FC<ShotProps> = ({ t, dur }) => {
  const cx = W / 2 - 40, cy = 520, a = 400, e = 0.55;
  const delta = 0.55; // rad of apsidal advance per orbit (hugely exaggerated)
  const nOrb = 5.2 * clamp(seg(t, 0.4, dur - 0.4));
  const pts: string[] = [];
  const total = Math.max(2, Math.floor(nOrb * 90));
  const at = (m: number) => {
    const M = m * TAU;
    const q = kepler2D(a, e, M, (delta * m) % 100);
    return { x: cx + q.x, y: cy - q.y };
  };
  for (let i = 0; i <= total; i++) pts.push(`${at(i / 90).x},${at(i / 90).y}`);
  const head = at(nOrb);
  const ref: string[] = [];
  for (let i = 0; i <= 120; i++) { const q = kepler2D(a, e, (i / 120) * TAU, 0); ref.push(`${cx + q.x},${cy - q.y}`); }
  return (
    <Space tint="warm">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <polyline points={ref.join(' ')} fill="none" stroke="#cfe4ff" strokeOpacity={0.4} strokeDasharray="3 10" strokeWidth={2} />
        <polyline points={pts.join(' ')} fill="none" stroke={GOLD} strokeOpacity={0.7} strokeWidth={2.5} />
        <Sun cx={cx} cy={cy} r={30} t={t} />
        <Planet kind="mercury" cx={head.x} cy={head.y} r={16} />
      </svg>
      <Tag x={W / 2} y={150} text="Mercury's orbit slowly rotates" color={INK} size={50} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={212} text="Real shift ≈ 43 arc-seconds per century — Newton's theory couldn't explain it" color={GOLD} size={32} opacity={smooth(t, 1.4, 2.2) * window01(t, 0, dur, 0.5)} weight={500} />
      <Tag x={W / 2} y={262} text="(shown hugely exaggerated · dotted: a fixed ellipse)" color={DIM} size={26} opacity={smooth(t, 1.8, 2.6) * window01(t, 0, dur, 0.5)} weight={400} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 32 · Descend from the solar system to Earth ───────────── */
export const DescendToEarth: React.FC<ShotProps> = ({ t, dur }) => {
  const k = ease.in(seg(t, 0, dur));
  const rEarth = lerp(14, 900, k);
  const cx = lerp(1130, 960, k), cy = lerp(420, 1060, k);
  const sun = 1 - seg(t, 0, dur * 0.7);
  return (
    <Space tint="warm" zoom={1 + k * 1.5}>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Sun cx={lerp(1500, 2400, k)} cy={lerp(300, 120, k)} r={lerp(40, 120, k)} t={t} opacity={sun} />
        <ellipse cx={W / 2} cy={480} rx={lerp(420, 2000, k)} ry={lerp(140, 700, k)} fill="none" stroke="#9fc4ff" strokeOpacity={0.3 * sun} />
        <Planet kind="earth" cx={cx} cy={cy} r={rEarth} light={-2.3} spin={t * 0.6} glow={0.12} />
      </svg>
      <Vignette />
    </Space>
  );
};
void FONT; void SERIF; void GREEN;
