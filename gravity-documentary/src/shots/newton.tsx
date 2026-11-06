import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  Space, Starfield, Vignette, Planet, Sun, Arrow, Tag, Card, Graph, ChapterCard, Statement, integrateOrbit,
  bounce, clamp, ease, lerp, seg, smooth, window01, W, H, CYAN, DIM, FONT, GOLD, GREEN, INK, ORANGE, SERIF, TAU,
} from '../lib';
import type { ShotProps } from './hook';

/* ───────────── 07 · Chapter: Newton ───────────── */
export const NewtonCard: React.FC<ShotProps> = ({ t, dur }) => (
  <Space tint="blue" driftX={-t * 10}>
    <svg width={W} height={H} style={{ position: 'absolute' }}>
      {[260, 420, 600].map((r, i) => (
        <circle key={r} cx={W / 2} cy={500} r={r} fill="none" stroke={CYAN} strokeOpacity={0.12} strokeDasharray="3 14" />
      ))}
      <Planet kind="moon" cx={W / 2 + 420 * Math.cos(t * 0.5)} cy={500 + 420 * 0.35 * Math.sin(t * 0.5)} r={20} />
    </svg>
    <ChapterCard num="I" title="NEWTON" sub="1687 · The law of universal gravitation" t={t} dur={dur} />
    <Vignette />
  </Space>
);

/* ───────────── 08 · Masses attract each other ───────────── */
export const MassPair: React.FC<ShotProps> = ({ t, dur }) => {
  const m1 = 1;
  const m2 = lerp(1, 4, smooth(t, 1.6, 2.8));
  const sep = lerp(1, 0.5, smooth(t, 3.4, 4.6));
  const F = (m1 * m2) / (sep * sep);
  const d = 620 * sep;
  const cy = 480;
  const x1 = W / 2 - d / 2, x2 = W / 2 + d / 2;
  const r1 = 70 * Math.cbrt(m1), r2 = 70 * Math.cbrt(m2);
  const len = 62 * F;
  const appear = ease.out(seg(t, 0.2, 1));
  const arrows = ease.out(seg(t, 0.9, 1.6));
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <line x1={x1} y1={cy + 190} x2={x2} y2={cy + 190} stroke={DIM} strokeWidth={2} />
        <line x1={x1} y1={cy + 178} x2={x1} y2={cy + 202} stroke={DIM} strokeWidth={2} />
        <line x1={x2} y1={cy + 178} x2={x2} y2={cy + 202} stroke={DIM} strokeWidth={2} />
        <Tag x={W / 2} y={cy + 238} text="distance  r" color={DIM} size={30} />
        <g opacity={appear}>
          <Planet kind="earth" cx={x1} cy={cy} r={r1} spin={t * 0.3} glow={0.12} />
          <Planet kind="mars" cx={x2} cy={cy} r={r2} />
        </g>
        <Arrow x1={x1 + r1 + 12} y1={cy} x2={x1 + r1 + 12 + len} y2={cy} p={arrows} color={GOLD} width={6} />
        <Arrow x1={x2 - r2 - 12} y1={cy} x2={x2 - r2 - 12 - len} y2={cy} p={arrows} color={GOLD} width={6} />
        <Tag x={x1} y={cy - r1 - 28} text="mass m₁" color={INK} size={32} />
        <Tag x={x2} y={cy - r2 - 28} text={`mass m₂`} color={INK} size={32} />
      </svg>
      <Tag x={W / 2} y={170} text="Every mass attracts every other mass" color={INK} size={46} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={240} text={t < 3.2 ? 'more mass → stronger pull' : 'closer together → stronger pull'} color={GOLD} size={36} opacity={smooth(t, 1.5, 2) * window01(t, 0, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 09 · F = G m₁ m₂ / r² ───────────── */
export const NewtonEquation: React.FC<ShotProps> = ({ t, dur }) => {
  const a = ease.out(seg(t, 0.3, 1.2));
  const hl = (on: boolean) => (on ? GOLD : INK);
  const phase = t < 1.4 ? 0 : t < 2.2 ? 1 : 2;
  return (
    <Space tint="violet">
      <Card x={300} y={300} w={1320} opacity={a} label="Newton's law of universal gravitation" size={150} align="center">
        <span style={{ color: hl(phase === 0) }}>F</span> = <span style={{ color: INK }}>G</span>
        <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 20px', lineHeight: 1.1 }}>
          <span style={{ color: hl(phase === 1), padding: '0 14px' }}>m<sub style={{ fontSize: '0.5em' }}>1</sub>m<sub style={{ fontSize: '0.5em' }}>2</sub></span>
          <span style={{ height: 6, width: '100%', background: INK, margin: '8px 0' }} />
          <span style={{ color: hl(phase === 2) }}>r²</span>
        </span>
      </Card>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: FONT, fontSize: 38, color: DIM, opacity: window01(t, 1.2, dur, 0.5) }}>
        <div style={{ color: phase === 0 ? GOLD : DIM }}>F — the attractive force between the two masses</div>
        <div style={{ color: phase === 1 ? GOLD : DIM, marginTop: 10 }}>m₁, m₂ — the masses</div>
        <div style={{ color: phase === 2 ? GOLD : DIM, marginTop: 10 }}>r — the distance between their centres</div>
        <div style={{ color: DIM, fontSize: 30, marginTop: 26, opacity: smooth(t, 2.4, 3) }}>G = 6.674 × 10⁻¹¹ N·m²/kg²  (a very small number)</div>
      </div>
      <Vignette />
    </Space>
  );
};

/* ───────────── 10 · Inverse-square graph ───────────── */
export const InverseSquare: React.FC<ShotProps> = ({ t, dur }) => {
  const p = ease.inOut(seg(t, 0.4, 3));
  const fn = (u: number) => 1 / Math.pow(1 + 2 * u, 2);
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Graph x={420} y={190} w={1080} h={560} xLabel="distance r" yLabel="gravitational pull" fn={fn} p={p} yMax={1}
          points={[{ u: 0, label: '1×' }, { u: 0.5, label: '¼' }, { u: 1, label: '1⁄9' }].map((q, i) => ({ ...q, color: [GOLD, ORANGE, CYAN][i] }))} />
        <Tag x={420} y={800} text="r" color={GOLD} size={28} opacity={0} />
      </svg>
      <Tag x={W / 2} y={140} text="Double the distance, and the pull falls to a quarter" color={INK} size={44} opacity={window01(t, 0.3, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 11 · The apple and the Earth ───────────── */
export const AppleEarth: React.FC<ShotProps> = ({ t, dur }) => {
  const R = 2600, cx = W / 2, top = 730, cy = top + R;
  const drop = 1.2;
  const tp = Math.max(0, t - drop);
  const b = bounce(tp * 0.75, 3.2, 9.81, 0.25);
  const PXM = 150;
  const appleY = top - 34 - Math.max(0, b.y) * PXM;
  const fall = t > drop;
  const arrows = ease.out(seg(t, 0.8, 1.6));
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#050a16, #12253f 70%, #1b3454)' }}>
      <Starfield opacity={0.8} />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Planet kind="moon" cx={1560} cy={210} r={44} />
        <Planet kind="earth" cx={cx} cy={cy} r={R} light={-1.4} spin={0.6} />
        {/* branch + leaves */}
        <path d="M 1700 -20 C 1500 120 1200 150 920 120" stroke="#241912" strokeWidth={26} fill="none" strokeLinecap="round" />
        {[[1000, 130], [1120, 150], [1260, 140], [1380, 110], [940, 100]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y + 14} rx={44} ry={20} fill="#1f3a22" transform={`rotate(${i * 25 - 40} ${x} ${y})`} />
        ))}
        {!fall && <path d="M 960 100 C 960 112 960 118 960 128" stroke="#3a2a1c" strokeWidth={5} />}
        <g transform={`translate(960 ${fall ? appleY : 160})`}>
          <Planet kind="apple" cx={0} cy={0} r={34} />
        </g>
        {fall && b.y > 0.02 && (
          <>
            <Arrow x1={960} y1={appleY + 52} x2={960} y2={appleY + 52 + 90 * arrows} color={GOLD} p={1} width={6} label="Earth pulls the apple" labelOffset={[24, -36]} />
          </>
        )}
        {fall && (
          <Arrow x1={cx + 380} y1={top + 130} x2={cx + 380} y2={top + 70} color={CYAN} width={5} label="the apple pulls on Earth, too" labelOffset={[24, 8]} />
        )}
      </svg>
      <Tag x={W / 2} y={150} text="Why does an apple fall?" color={INK} size={50} opacity={window01(t, 0.3, 3.4, 0.5)} />
      <Tag x={W / 2} y={150} text="Because Earth and apple attract each other" color={INK} size={46} opacity={smooth(t, 3.6, 4.2)} />
      <Vignette />
    </AbsoluteFill>
  );
};

/* ───────────── 12 · The Moon orbits the Earth ───────────── */
export const MoonOrbit: React.FC<ShotProps> = ({ t, dur }) => {
  const rO = 340, cx = W / 2, cy = 500;
  const w = 0.95;
  const th = t * w - 0.6;
  const mx = cx + rO * Math.cos(th), my = cy - rO * Math.sin(th);
  const trail = Array.from({ length: 70 }, (_, i) => {
    const a = th - i * 0.035;
    return `${cx + rO * Math.cos(a)},${cy - rO * Math.sin(a)}`;
  });
  const vx = Math.sin(th), vy = Math.cos(th); // tangent (counter-clockwise on screen)
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <circle cx={cx} cy={cy} r={rO} fill="none" stroke={CYAN} strokeOpacity={0.25} strokeDasharray="4 12" />
        <polyline points={trail.join(' ')} fill="none" stroke={GOLD} strokeOpacity={0.5} strokeWidth={3} />
        <Planet kind="earth" cx={cx} cy={cy} r={120} spin={t * 0.4} glow={0.15} />
        <Planet kind="moon" cx={mx} cy={my} r={30} light={Math.atan2(cy - my, cx - mx) + Math.PI} />
        <Arrow x1={mx} y1={my} x2={mx + (cx - mx) * 0.33} y2={my + (cy - my) * 0.33} color={CYAN} width={5} label="gravity" labelOffset={[10, -14]} />
        <Arrow x1={mx} y1={my} x2={mx - vx * 130} y2={my - vy * 130} color={GOLD} width={5} label="motion" labelOffset={[10, 30]} />
      </svg>
      <Tag x={W / 2} y={150} text="The Moon is always falling toward Earth" color={INK} size={48} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={215} text="…and its sideways motion keeps it from ever arriving" color={GOLD} size={34} opacity={smooth(t, 1.6, 2.4) * window01(t, 0, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 13 · The Earth orbits the Sun ───────────── */
export const EarthSun: React.FC<ShotProps> = ({ t, dur }) => {
  const a = 470, e = 0.05, cx = W / 2 - 20, cy = 500;
  const M = t * 0.9 - 0.4;
  const E = M + e * Math.sin(M);
  const px = a * (Math.cos(E) - e), py = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const ex = cx + px, ey = cy - py;
  const trail = Array.from({ length: 90 }, (_, i) => {
    const m = M - i * 0.03;
    const EE = m + e * Math.sin(m);
    return `${cx + a * (Math.cos(EE) - e)},${cy - a * Math.sqrt(1 - e * e) * Math.sin(EE)}`;
  });
  return (
    <Space tint="warm">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <ellipse cx={cx - a * e} cy={cy} rx={a} ry={a * Math.sqrt(1 - e * e)} fill="none" stroke="#7fb0ff" strokeOpacity={0.28} strokeDasharray="4 12" />
        <polyline points={trail.join(' ')} fill="none" stroke={GOLD} strokeOpacity={0.5} strokeWidth={3} />
        <Sun cx={cx} cy={cy} r={46} t={t} />
        <Planet kind="earth" cx={ex} cy={ey} r={30} light={Math.atan2(cy - ey, cx - ex) + Math.PI} spin={t * 3} />
        <Arrow x1={ex} y1={ey} x2={ex + (cx - ex) * 0.22} y2={ey + (cy - ey) * 0.22} color={CYAN} width={5} label="gravity" labelOffset={[10, -16]} />
      </svg>
      <Tag x={W / 2} y={150} text="The same law holds the Earth to the Sun" color={INK} size={48} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={215} text="one orbit = one year" color={GOLD} size={34} opacity={smooth(t, 1.5, 2.2) * window01(t, 0, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 14 · Newton's cannon ───────────── */
export const NewtonCannon: React.FC<ShotProps> = ({ t, dur }) => {
  const Rp = 300, cx = W / 2, cy = 560;
  const GM = 1;
  const h = 0.045;
  const r0 = 1 + h; // in units of planet radius
  const vc = Math.sqrt(GM / r0);
  const shots = [
    { f: 0.45, c: CYAN, start: 0.8 },
    { f: 0.72, c: GREEN, start: 2.0 },
    { f: 1.0, c: GOLD, start: 3.4 },
  ];
  const paths = React.useMemo(
    () => shots.map((s) => {
      const pts = integrateOrbit({ gm: GM, r0, v0: s.f * vc, ang0: Math.PI / 2, steps: 1800, dt: 0.0045 });
      const out: { x: number; y: number }[] = [];
      for (const p of pts) {
        out.push(p);
        if (Math.hypot(p.x, p.y) < 1) break;
      }
      return out;
    }),
    [],
  );
  const toS = (p: { x: number; y: number }) => `${cx + p.x * Rp},${cy - p.y * Rp}`;
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Planet kind="earth" cx={cx} cy={cy} r={Rp} light={-2.0} spin={0.4} glow={0.1} />
        {/* mountain + cannon */}
        <polygon points={`${cx - 26},${cy - Rp + 4} ${cx},${cy - Rp - 40} ${cx + 26},${cy - Rp + 4}`} fill="#3a4152" />
        <rect x={cx - 6} y={cy - Rp - 58} width={42} height={12} fill="#cfd8e8" transform={`rotate(-4 ${cx} ${cy - Rp - 52})`} />
        {shots.map((s, i) => {
          const path = paths[i];
          const prog = ease.inOut(seg(t, s.start, s.start + (i === 2 ? 3.4 : 1.4)));
          const n = Math.max(2, Math.floor(path.length * prog));
          const pts = path.slice(0, n);
          const head = pts[pts.length - 1];
          return (
            <g key={i}>
              <polyline points={pts.map(toS).join(' ')} fill="none" stroke={s.c} strokeWidth={4} strokeLinecap="round" opacity={0.95} />
              <circle cx={cx + head.x * Rp} cy={cy - head.y * Rp} r={8} fill={s.c} />
            </g>
          );
        })}
      </svg>
      <Tag x={W / 2} y={120} text="Newton's cannon" color={INK} size={52} opacity={window01(t, 0.2, dur, 0.5)} />
      <Tag x={W / 2} y={178} text={t < 2.8 ? 'Fire it faster, and it lands farther away…' : 'At the right speed, it never lands: an orbit'} color={GOLD} size={36} opacity={window01(t, 0.2, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 15 · But how does it reach across space? ───────────── */
export const ActionAtDistance: React.FC<ShotProps> = ({ t, dur }) => {
  const q = (t * 0.7) % 1;
  const x1 = 460, x2 = 1460, cy = 470;
  return (
    <Space tint="violet">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Planet kind="earth" cx={x1} cy={cy} r={130} spin={t * 0.4} glow={0.14} />
        <Planet kind="moon" cx={x2} cy={cy} r={42} light={Math.PI} />
        <line x1={x1 + 150} y1={cy} x2={x2 - 70} y2={cy} stroke={GOLD} strokeWidth={3} strokeDasharray="4 14" opacity={0.6} />
        <text x={lerp(x1 + 190, x2 - 120, q)} y={cy + 24} fill={GOLD} fontFamily={SERIF} fontStyle="italic" fontSize={90} textAnchor="middle" opacity={Math.sin(q * Math.PI)}>?</text>
      </svg>
      <Tag x={W / 2} y={190} text="But how does one mass reach across empty space?" color={INK} size={50} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={760} text="“Hypotheses non fingo”: I frame no hypotheses" color={GOLD} size={36} opacity={smooth(t, 1.4, 2.2) * window01(t, 0, dur, 0.5)} weight={500} />
      <Tag x={W / 2} y={810} text="— Newton, Principia (1713 edition), on the cause of gravity" color={DIM} size={26} opacity={smooth(t, 1.8, 2.6) * window01(t, 0, dur, 0.5)} weight={400} />
      <Vignette />
    </Space>
  );
};
void TAU; void clamp; void Statement;
