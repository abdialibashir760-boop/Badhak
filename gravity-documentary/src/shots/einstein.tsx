import React from 'react';
import {
  Space, Vignette, Planet, Surface, wellHeight, makeView, ChapterCard, Tag, Stamp, Arrow, integrate2D, massStep,
  ease, lerp, seg, smooth, window01, W, H, CYAN, DIM, FONT, GOLD, GREEN, INK, ORANGE, SERIF, RED, TAU, clamp,
  type SurfaceBody, type SurfaceLine, type LineStyle,
} from '../lib';
import type { ShotProps } from './hook';

const rad = (d: number) => (d * Math.PI) / 180;
export const EARTH_WELL = { gm: 12.65, s: 2.3 };
const R_EARTH = 1.5;

const trailStyles = (c: string): Record<string, LineStyle> => ({
  t0: { stroke: c, opacity: 0.18, width: 2.4 }, t1: { stroke: c, opacity: 0.45, width: 3.2 }, t2: { stroke: c, opacity: 0.9, width: 4, glow: 9 },
  ref: { stroke: '#cfe4ff', opacity: 0.35, width: 1.6, dash: '2 9' },
});
const trailLine = (pts: { x: number; z: number }[], head: number): SurfaceLine[] => {
  const n = Math.max(2, head);
  const seg3 = Math.ceil(n / 3);
  return [0, 1, 2].map((k) => ({ pts: pts.slice(Math.max(0, k * seg3 - (k ? 1 : 0)), Math.min(n, (k + 1) * seg3)), style: `t${k}` })).filter((l) => l.pts.length > 1);
};

/* ───────────── 16 · Chapter: Einstein ───────────── */
export const EinsteinCard: React.FC<ShotProps> = ({ t, dur }) => {
  const view = makeView({ pitch: rad(38), yaw: 0.2 + t * 0.03, dist: 30, ty: -1 });
  const h = wellHeight([{ x: 0, z: 0, ...EARTH_WELL, amp: smooth(t, 1.5, 4) }]);
  return (
    <Space tint="violet">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Surface view={view} height={h} wells={[{ x: 0, z: 0 }]} gridOpacity={0.4} />
      </svg>
      <ChapterCard num="II" title="EINSTEIN" sub="1915 · General relativity" t={t} dur={dur} y={300} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, color: INK, opacity: smooth(t, 1.6, 2.6) * (1 - seg(t, dur - 0.6, dur)) }}>
        G<sub style={{ fontSize: '0.55em' }}>μν</sub> = (8π<span>G</span>/c⁴) T<sub style={{ fontSize: '0.55em' }}>μν</sub>
      </div>
      <Vignette />
    </Space>
  );
};

/* ───────────── 17 · Spacetime diagram (space + time woven together) ───────────── */
export const SpacetimeDiagram: React.FC<ShotProps> = ({ t, dur }) => {
  const ox = W / 2, oy = 820, U = 66;
  const axes = ease.out(seg(t, 0.2, 1.2));
  const light = ease.out(seg(t, 2.2, 3.2));
  const wl = ease.out(seg(t, 1.2, 2.2));
  const mv = ease.out(seg(t, 3.2, 4.2));
  const lines: React.ReactNode[] = [];
  for (let i = -12; i <= 12; i++) {
    lines.push(<line key={`v${i}`} x1={ox + i * U} y1={oy} x2={ox + i * U} y2={oy - 8 * U * axes} stroke={CYAN} strokeOpacity={0.16} />);
  }
  for (let j = 0; j <= 8; j++) {
    lines.push(<line key={`h${j}`} x1={ox - 12 * U} y1={oy - j * U} x2={ox + 12 * U} y2={oy - j * U} stroke={CYAN} strokeOpacity={0.16 * axes} />);
  }
  return (
    <Space tint="violet">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {lines}
        <polygon points={`${ox},${oy} ${ox - 7 * U * light},${oy - 7 * U * light} ${ox + 7 * U * light},${oy - 7 * U * light}`} fill={GOLD} opacity={0.1} />
        <line x1={ox} y1={oy} x2={ox} y2={oy - 8 * U * axes} stroke={INK} strokeWidth={3} />
        <line x1={ox - 12 * U * axes} y1={oy} x2={ox + 12 * U * axes} y2={oy} stroke={INK} strokeWidth={3} />
        <Tag x={ox + 12 * U - 10} y={oy + 44} text="space →" color={INK} size={30} align="end" opacity={axes} />
        <Tag x={ox + 14} y={oy - 8 * U - 6} text="↑ time" color={INK} size={30} align="start" opacity={axes} />
        {/* worldline of an object at rest */}
        <line x1={ox - 4 * U} y1={oy} x2={ox - 4 * U} y2={oy - 7 * U * wl} stroke={CYAN} strokeWidth={6} strokeLinecap="round" />
        <circle cx={ox - 4 * U} cy={oy - 7 * U * wl} r={12} fill={CYAN} />
        <Tag x={ox - 4 * U + 24} y={oy - 7 * U * wl + 8} text="at rest" color={CYAN} size={28} align="start" opacity={wl} />
        {/* moving object */}
        <line x1={ox + 2 * U} y1={oy} x2={ox + 2 * U + 3 * U * mv} y2={oy - 7 * U * mv} stroke={GREEN} strokeWidth={6} strokeLinecap="round" />
        <circle cx={ox + 2 * U + 3 * U * mv} cy={oy - 7 * U * mv} r={12} fill={GREEN} />
        <Tag x={ox + 2 * U + 3 * U * mv + 24} y={oy - 7 * U * mv + 8} text="moving" color={GREEN} size={28} align="start" opacity={mv} />
        {/* light rays */}
        <line x1={ox} y1={oy} x2={ox + 7 * U * light} y2={oy - 7 * U * light} stroke={GOLD} strokeWidth={4} strokeDasharray="10 8" />
        <line x1={ox} y1={oy} x2={ox - 7 * U * light} y2={oy - 7 * U * light} stroke={GOLD} strokeWidth={4} strokeDasharray="10 8" />
        <Tag x={ox + 7 * U * light + 18} y={oy - 7 * U * light + 6} text="light" color={GOLD} size={28} align="start" opacity={light} />
      </svg>
      <Tag x={W / 2} y={150} text="Space and time woven together: spacetime" color={INK} size={52} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={212} text="every event has a place and a moment" color={DIM} size={34} opacity={smooth(t, 1, 1.8) * window01(t, 0, dur, 0.5)} weight={500} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 18 · Mass bends the grid ───────────── */
export const MassBendsGrid: React.FC<ShotProps> = ({ t, dur }) => {
  const pitch = lerp(66, 34, smooth(t, 0, dur - 0.4));
  const view = makeView({ pitch: rad(pitch), yaw: lerp(0, 0.35, smooth(t, 0, dur)), dist: 22, ty: -2 });
  const wells = [{ x: 0, z: 0, ...EARTH_WELL, t0: 1.2 }];
  const h = wellHeight(wells, { t, speed: 9, response: massStep });
  const m = massStep(t - 1.2);
  const bodies: SurfaceBody[] = [{
    id: 'earth', x: 0, z: 0, y: h(0, 0) + R_EARTH * 0.92, radius: R_EARTH,
    render: (sx, sy, r) => <Planet kind="earth" cx={sx} cy={sy} r={r} spin={t * 0.4} />,
  }];
  const ringR = 9 * (t - 1.2);
  const ring: SurfaceLine[] = ringR > 0.5 && ringR < 40 ? [{ pts: Array.from({ length: 100 }, (_, k) => ({ x: ringR * Math.cos((k / 99) * TAU), z: ringR * Math.sin((k / 99) * TAU) })), style: 'wave', lift: 0.03 }] : [];
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Surface view={view} height={h} wells={[{ x: 0, z: 0 }]} bodies={bodies} lines={ring}
          lineStyles={{ wave: { stroke: '#7fe3ff', opacity: 0.6 * clamp(1 - ringR / 40), width: 2.5, glow: 9 } }} />
      </svg>
      <Tag x={W / 2} y={150} text="Mass and energy change the geometry" color={INK} size={52} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={212} text={m > 0.5 ? 'the curvature spreads outward at the speed of light' : 'a massive object appears…'} color={GOLD} size={34} opacity={window01(t, 0.3, dur, 0.5)} weight={500} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 19 · Wheeler's summary ───────────── */
export const WheelerQuote: React.FC<ShotProps> = ({ t, dur }) => {
  const view = makeView({ pitch: rad(30), yaw: 0.5 + t * 0.05, dist: 26, ty: -1.5 });
  const h = wellHeight([{ x: 0, z: 0, ...EARTH_WELL }]);
  const a = ease.out(seg(t, 0.4, 1.4));
  const b = ease.out(seg(t, 2.0, 3.0));
  return (
    <Space tint="violet">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Surface view={view} height={h} wells={[{ x: 0, z: 0 }]} gridOpacity={0.35} />
      </svg>
      <div style={{ position: 'absolute', left: 160, right: 160, top: 300, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 78, lineHeight: 1.25, color: INK, textShadow: '0 4px 40px rgba(0,0,0,.9)' }}>
        <div style={{ opacity: a, transform: `translateY(${(1 - a) * 18}px)`, color: CYAN }}>“Spacetime tells matter how to move;</div>
        <div style={{ opacity: b, transform: `translateY(${(1 - b) * 18}px)`, color: GOLD }}>matter tells spacetime how to curve.”</div>
      </div>
      <Tag x={W / 2} y={720} text="— John Archibald Wheeler" color={DIM} size={36} opacity={smooth(t, 3.2, 4)} weight={500} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 20 · The rubber-sheet analogy ───────────── */
export const RubberSheet: React.FC<ShotProps> = ({ t, dur }) => {
  const view = makeView({ pitch: rad(24), yaw: lerp(-0.5, 0.1, smooth(t, 0, dur)), dist: 24, ty: -2.4 });
  const wells = [{ x: 0, z: 0, ...EARTH_WELL, amp: smooth(t, 0.2, 1.2) }];
  const h = wellHeight(wells);
  const path = React.useMemo(() => integrate2D({ gm: EARTH_WELL.gm, s: EARTH_WELL.s, x: 9, z: 0, vx: 0, vz: -1.15, steps: 900, dt: 0.02, every: 3 }), []);
  const head = Math.floor(path.length * clamp(seg(t, 0.8, dur - 0.3)));
  const mp = path[Math.min(path.length - 1, head)];
  const bodies: SurfaceBody[] = [
    { id: 'ball', x: 0, z: 0, y: h(0, 0) + 1.3, radius: 1.4, render: (sx, sy, r) => <Planet kind="ball" cx={sx} cy={sy} r={r} /> },
    { id: 'marble', x: mp.x, z: mp.z, y: h(mp.x, mp.z) + 0.35, radius: 0.35, render: (sx, sy, r) => <Planet kind="moon" cx={sx} cy={sy} r={Math.max(r, 5)} /> },
  ];
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Surface view={view} height={h} wells={[{ x: 0, z: 0 }]} bodies={bodies} lines={trailLine(path, head)} lineStyles={trailStyles(GOLD)}
          half={16} spacing={1} fade={[40, 60, 80]} palette={['#6a9bd0', '#7fb8e6', '#9fd4e8', '#e0cf9a', '#f0b878', '#ee9560']} />
      </svg>
      <Tag x={W / 2} y={150} text="A heavy ball on a stretched rubber sheet" color={INK} size={52} opacity={window01(t, 0.3, dur, 0.5)} />
      <Stamp x={1380} y={230} text="ANALOGY" opacity={smooth(t, 1.2, 1.8) * window01(t, 0, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 21 · Where the analogy stops ───────────── */
export const AnalogyLimits: React.FC<ShotProps> = ({ t, dur }) => {
  const L = ease.out(seg(t, 0.3, 1.2));
  const R = ease.out(seg(t, 1.8, 2.8));
  // left: cross-section of a sheet sagging into a hidden extra dimension
  const prof = (x: number) => 150 * (1 / Math.sqrt(1 + (x / 90) * (x / 90)));
  const sheet = Array.from({ length: 61 }, (_, i) => {
    const x = (i - 30) * 8;
    return `${480 + x},${470 + prof(x) * 0.9 - 150 * 0.9 + 40}`;
  });
  // right: stacked time slices of a spatial grid
  const slices = [0, 1, 2, 3, 4];
  return (
    <Space tint="violet">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <g opacity={L}>
          <polyline points={sheet.join(' ')} fill="none" stroke={CYAN} strokeWidth={5} />
          <Planet kind="ball" cx={480} cy={470 + 40 - 14} r={34} />
          <Tag x={480} y={250} text="RUBBER SHEET" color={GOLD} size={34} />
          <Tag x={480} y={720} text="a 2-D surface bending" color={INK} size={32} weight={500} />
          <Tag x={480} y={762} text="into a third dimension" color={INK} size={32} weight={500} />
        </g>
        <g opacity={R}>
          {slices.map((k) => {
            const y0 = 640 - k * 92;
            return (
              <g key={k} opacity={0.4 + 0.12 * k}>
                <polygon points={`1180,${y0} 1620,${y0} 1700,${y0 - 70} 1260,${y0 - 70}`} fill="rgba(127,208,255,.08)" stroke={CYAN} strokeOpacity={0.6} />
                {[1, 2, 3].map((i) => (
                  <line key={i} x1={1180 + i * 110} y1={y0} x2={1260 + i * 110} y2={y0 - 70} stroke={CYAN} strokeOpacity={0.3} />
                ))}
              </g>
            );
          })}
          <Arrow x1={1130} y1={650} x2={1130} y2={230} color={GOLD} width={5} label="time" labelOffset={[16, 8]} />
          <Tag x={1450} y={250} text="SPACETIME" color={GOLD} size={34} />
          <Tag x={1450} y={760} text="3 dimensions of space + 1 of time" color={INK} size={32} weight={500} />
          <Tag x={1450} y={802} text="curvature without any “fabric”" color={INK} size={32} weight={500} />
        </g>
      </svg>
      <Tag x={W / 2} y={150} text="Useful, but only an analogy" color={INK} size={56} opacity={window01(t, 0.3, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 22 · Marbles follow the straightest paths ───────────── */
export const GeodesicMarbles: React.FC<ShotProps> = ({ t, dur }) => {
  const view = makeView({ pitch: rad(44), yaw: lerp(0.05, -0.3, smooth(t, 0, dur)), dist: 34, ty: -1.5 });
  const wells = [{ x: 0, z: 0, ...EARTH_WELL }];
  const h = wellHeight(wells);
  const starts = [-7.5, -4.5, -2.2, 0.8, 3.6, 6.5];
  const paths = React.useMemo(
    () => starts.map((z0) => integrate2D({ gm: EARTH_WELL.gm * 1.4, s: EARTH_WELL.s, x: -22, z: z0, vx: 5.2, vz: 0, steps: 520, dt: 0.025, every: 2 })),
    [],
  );
  const colors = [CYAN, GREEN, GOLD, ORANGE, '#e59bff', '#9fd0ff'];
  const prog = seg(t, 0.6, dur - 0.5);
  const lines: SurfaceLine[] = [];
  const styles: Record<string, LineStyle> = { ref: { stroke: '#cfe4ff', opacity: 0.35, width: 1.6, dash: '2 9' } };
  const bodies: SurfaceBody[] = [{ id: 'earth', x: 0, z: 0, y: h(0, 0) + R_EARTH * 0.92, radius: R_EARTH, render: (sx, sy, r) => <Planet kind="earth" cx={sx} cy={sy} r={r} spin={t * 0.4} /> }];
  paths.forEach((p, i) => {
    const n = Math.max(2, Math.floor(p.length * prog));
    lines.push({ pts: p.slice(0, n), style: `m${i}` });
    styles[`m${i}`] = { stroke: colors[i], opacity: 0.95, width: 4, glow: 9 };
    lines.push({ pts: [{ x: -22, z: starts[i] }, { x: 22, z: starts[i] }], style: 'ref', lift: 0.05 });
    const head = p[n - 1];
    bodies.push({ id: `mb${i}`, x: head.x, z: head.z, y: h(head.x, head.z) + 0.3, radius: 0.32, render: (sx, sy, r) => <circle cx={sx} cy={sy} r={Math.max(r, 5)} fill={colors[i]} /> });
  });
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Surface view={view} height={h} wells={[{ x: 0, z: 0 }]} bodies={bodies} lines={lines} lineStyles={styles} />
      </svg>
      <Tag x={W / 2} y={150} text="Each marble goes straight — through curved geometry" color={INK} size={48} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={212} text="dotted lines: where they would go on a flat grid" color={DIM} size={30} opacity={smooth(t, 1, 1.8) * window01(t, 0, dur, 0.5)} weight={500} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 23 · Parallel paths on a globe meet ───────────── */
export const GlobeGeodesics: React.FC<ShotProps> = ({ t, dur }) => {
  const cx = W / 2, cy = 500, Rg = 330;
  const phi0 = rad(38), lam0 = 0;
  const P = (lat: number, lon: number) => {
    const dl = lon - lam0;
    const x = Math.cos(lat) * Math.sin(dl);
    const y = Math.cos(phi0) * Math.sin(lat) - Math.sin(phi0) * Math.cos(lat) * Math.cos(dl);
    const vis = Math.sin(phi0) * Math.sin(lat) + Math.cos(phi0) * Math.cos(lat) * Math.cos(dl);
    return { x: cx + Rg * x, y: cy - Rg * y, vis };
  };
  const meridian = (lon: number, to: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const lat = (i / 60) * to;
      const p = P(lat, lon);
      if (p.vis > 0) pts.push(`${p.x},${p.y}`);
    }
    return pts.join(' ');
  };
  const prog = ease.inOut(seg(t, 1.2, dur - 0.6));
  const lonA = rad(-22), lonB = rad(22);
  const a = P(prog * rad(88), lonA), b = P(prog * rad(88), lonB);
  const grat: React.ReactNode[] = [];
  for (let lon = -90; lon <= 90; lon += 15) grat.push(<polyline key={`m${lon}`} points={meridian(rad(lon), rad(90))} fill="none" stroke={CYAN} strokeOpacity={0.14} />);
  for (let lat = 0; lat <= 75; lat += 15) {
    const pts: string[] = [];
    for (let i = -90; i <= 90; i += 3) { const p = P(rad(lat), rad(i)); if (p.vis > 0) pts.push(`${p.x},${p.y}`); }
    grat.push(<polyline key={`l${lat}`} points={pts.join(' ')} fill="none" stroke={CYAN} strokeOpacity={0.14} />);
  }
  const trail = (lon: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) { const p = P((i / 40) * prog * rad(88), lon); pts.push(`${p.x},${p.y}`); }
    return pts.join(' ');
  };
  return (
    <Space tint="violet">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Planet kind="earth" cx={cx} cy={cy} r={Rg} light={-2.2} spin={-lam0 + 0.2} glow={0.12} />
        {grat}
        <polyline points={trail(lonA)} fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" />
        <polyline points={trail(lonB)} fill="none" stroke={GREEN} strokeWidth={5} strokeLinecap="round" />
        <circle cx={a.x} cy={a.y} r={11} fill={GOLD} />
        <circle cx={b.x} cy={b.y} r={11} fill={GREEN} />
      </svg>
      <Tag x={W / 2} y={140} text="Two straight, parallel paths on a curved surface…" color={INK} size={48} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={200} text="…drift together. No force required — only curvature." color={GOLD} size={38} opacity={smooth(t, 3, 3.8) * window01(t, 0, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 24 · A small object follows the straightest path ───────────── */
export const OrbitGeodesic: React.FC<ShotProps> = ({ t, dur }) => {
  const view = makeView({ pitch: rad(36), yaw: t * 0.09, dist: 26, ty: -2 });
  const wells = [{ x: 0, z: 0, ...EARTH_WELL }];
  const h = wellHeight(wells);
  const r0 = 7.5;
  const v0 = Math.sqrt((EARTH_WELL.gm * r0 * r0) / Math.pow(r0 * r0 + EARTH_WELL.s * EARTH_WELL.s, 1.5)) * 0.93;
  const path = React.useMemo(() => integrate2D({ gm: EARTH_WELL.gm, s: EARTH_WELL.s, x: r0, z: 0, vx: 0, vz: -v0, steps: 1800, dt: 0.02, every: 3 }), [v0]);
  const head = Math.max(3, Math.floor(path.length * clamp(seg(t, 0, dur) * 1.0)));
  const mp = path[Math.min(path.length - 1, head)];
  const bodies: SurfaceBody[] = [
    { id: 'earth', x: 0, z: 0, y: h(0, 0) + R_EARTH * 0.92, radius: R_EARTH, render: (sx, sy, r) => <Planet kind="earth" cx={sx} cy={sy} r={r} spin={t * 0.4} /> },
    { id: 'moon', x: mp.x, z: mp.z, y: h(mp.x, mp.z) + 0.4, radius: 0.42, render: (sx, sy, r) => <Planet kind="moon" cx={sx} cy={sy} r={Math.max(r, 6)} /> },
  ];
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Surface view={view} height={h} wells={[{ x: 0, z: 0 }]} bodies={bodies} lines={trailLine(path.slice(0, head + 1), head + 1)} lineStyles={trailStyles(GOLD)} />
      </svg>
      <Tag x={W / 2} y={150} text="Near a massive object, the straightest path curves" color={INK} size={50} opacity={window01(t, 0.3, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};
void FONT; void RED; void TAU;
