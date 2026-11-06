import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  Space, Vignette, Planet, Sun, Galaxy, Tag, Arrow, ease, lerp, seg, smooth, window01, clamp,
  W, H, CYAN, DIM, FONT, GOLD, GREEN, INK, RED, TAU, SERIF,
} from '../lib';
import { FallFollow, type ShotProps } from './hook';
import { MoonOrbit } from './newton';
import { DivergingClocks } from './time';
import { SunWell } from './orbits';

/* ───────────── 41 · Back to the falling ball ───────────── */
export const BallReturn: React.FC<ShotProps> = (p) => (
  <>
    <FallFollow {...p} h0={22} rate={0.62} showTitle={false} warp heading="THE FALLING BALL, AGAIN" />
    <Tag x={W / 2} y={150} text="Nothing is pulling it through empty space" color={INK} size={52} opacity={window01(p.t, 0.4, p.dur, 0.5)} />
    <Tag x={W / 2} y={212} text="it follows the straightest path through curved spacetime" color={GOLD} size={36} opacity={smooth(p.t, 1.6, 2.4) * window01(p.t, 0, p.dur, 0.5)} weight={500} />
  </>
);

/* ───────────── 42 · Worldlines: free fall vs standing still ───────────── */
export const Worldlines: React.FC<ShotProps> = ({ t, dur }) => {
  const ox = 420, oy = 840, X = 1100, Y = 600; // axes: x = height above ground, y = time
  const wl = ease.out(seg(t, 1.0, 2.2));
  const fall = ease.inOut(seg(t, 2.6, 4.4));
  // grid: horizontal "time" lines get closer together toward the ground (slower clocks)
  const timeLines = Array.from({ length: 9 }, (_, k) => {
    const pts = Array.from({ length: 40 }, (_, i) => {
      const x = (i / 39) * X;
      const spacing = 1 + 0.35 * (x / X);
      return `${ox + x},${oy - (k * (Y / 8)) * spacing * 0.78 * (1 - 0.0) }`;
    });
    return <polyline key={k} points={pts.join(' ')} fill="none" stroke={CYAN} strokeOpacity={0.2} strokeWidth={1.6} />;
  });
  const hLines = Array.from({ length: 9 }, (_, k) => <line key={k} x1={ox + (k * X) / 8} y1={oy} x2={ox + (k * X) / 8} y2={oy - Y} stroke={CYAN} strokeOpacity={0.12} />);
  // free-fall worldline: height h(τ) = h0 − ½ g τ²  (curves toward the ground)
  const fp = Array.from({ length: 60 }, (_, i) => {
    const u = (i / 59) * fall;
    return `${ox + X * 0.78 * (1 - 0.9 * u * u)},${oy - u * Y * 0.92}`;
  });
  const hd = { x: ox + X * 0.78 * (1 - 0.9 * fall * fall), y: oy - fall * Y * 0.92 };
  return (
    <Space tint="violet">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {timeLines}
        {hLines}
        <line x1={ox} y1={oy} x2={ox} y2={oy - Y - 20} stroke={INK} strokeWidth={3} />
        <line x1={ox} y1={oy} x2={ox + X + 20} y2={oy} stroke={INK} strokeWidth={3} />
        <Tag x={ox + X} y={oy + 46} text="height above the ground →" color={INK} size={28} align="end" />
        <Tag x={ox - 20} y={oy - Y - 34} text="↑ time" color={INK} size={28} align="start" />
        <rect x={ox - 26} y={oy} width={26} height={0.0001} fill="none" />
        {/* the ground / person standing */}
        <line x1={ox + 6} y1={oy} x2={ox + 6} y2={oy - Y * wl} stroke={RED} strokeWidth={7} strokeLinecap="round" />
        <Tag x={ox + 40} y={oy - 90} text="standing still: the ground pushes you up" color={RED} size={30} align="start" opacity={wl} />
        <polyline points={fp.join(' ')} fill="none" stroke={GREEN} strokeWidth={7} strokeLinecap="round" />
        <circle cx={hd.x} cy={hd.y} r={13} fill={GREEN} opacity={fall > 0.02 ? 1 : 0} />
        <Tag x={ox + X * 0.78 + 16} y={oy - 40} text="free fall: the straightest path" color={GREEN} size={32} align="start" opacity={smooth(t, 3, 3.8)} />
      </svg>
      <Tag x={W / 2} y={150} text="Free fall is the natural motion in curved spacetime" color={INK} size={50} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={205} text="spacetime diagram · lines slant because clocks tick slower near the ground" color={DIM} size={28} opacity={smooth(t, 1, 1.8) * window01(t, 0, dur, 0.5)} weight={500} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 43 · Montage: one idea, many consequences ───────────── */
const Panel: React.FC<{ x: number; y: number; w: number; h: number; o: number; label: string; children: React.ReactNode }> = ({ x, y, w, h, o, label, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', borderRadius: 18, border: '2px solid rgba(140,190,255,.4)', opacity: o, transform: `scale(${0.96 + 0.04 * o})`, boxShadow: '0 10px 50px rgba(0,0,0,.6)' }}>
    <div style={{ width: W, height: H, transform: `scale(${w / W})`, transformOrigin: '0 0' }}>{children}</div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 18px', background: 'linear-gradient(transparent, rgba(2,4,11,.9))', fontFamily: FONT, color: INK, fontSize: 26, fontWeight: 700 }}>{label}</div>
  </div>
);
export const Montage: React.FC<ShotProps> = ({ t, dur }) => {
  const pw = 700, ph = pw * (H / W);
  const o = (i: number) => ease.out(seg(t, 0.2 + i * 0.35, 1.0 + i * 0.35));
  return (
    <Space tint="blue">
      <Panel x={250} y={70} w={pw} h={ph} o={o(0)} label="falling objects"><FallFollow t={t + 1.2} dur={dur} showTitle={false} h0={30} heading="" /></Panel>
      <Panel x={970} y={70} w={pw} h={ph} o={o(1)} label="orbits"><MoonOrbit t={t} dur={dur} /></Panel>
      <Panel x={250} y={70 + ph + 26} w={pw} h={ph} o={o(2)} label="the passage of time"><DivergingClocks t={t} dur={dur} /></Panel>
      <Panel x={970} y={70 + ph + 26} w={pw} h={ph} o={o(3)} label="the geometry of spacetime"><SunWell t={t + 1} dur={dur} /></Panel>
      <Vignette />
    </Space>
  );
};

/* ───────────── 44 · Wide: Earth, Moon and Sun ───────────── */
export const WideEarthSolar: React.FC<ShotProps> = ({ t, dur }) => {
  const k = ease.inOut(seg(t, 0, dur));
  return (
    <Space tint="warm" driftX={-k * 120} zoom={1 + k * 0.15}>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Sun cx={lerp(1700, 1560, k)} cy={lerp(300, 260, k)} r={52} t={t} />
        <Planet kind="earth" cx={lerp(560, 480, k)} cy={lerp(760, 720, k)} r={lerp(430, 360, k)} light={-0.6} spin={t * 0.08 + 2} glow={0.16} />
        <Planet kind="moon" cx={lerp(1100, 1010, k)} cy={lerp(520, 470, k)} r={lerp(62, 52, k)} light={-0.5} />
        <ellipse cx={lerp(560, 480, k)} cy={lerp(760, 720, k)} rx={760} ry={280} fill="none" stroke="#9fc4ff" strokeOpacity={0.22} strokeDasharray="4 12" />
      </svg>
      <Vignette strength={0.7} />
    </Space>
  );
};

/* ───────────── 45 · Wide: the galaxy ───────────── */
export const GalaxyWide: React.FC<ShotProps> = ({ t, dur }) => {
  const k = seg(t, 0, dur);
  return (
    <Space tint="violet" driftX={-k * 60}>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Galaxy cx={W / 2} cy={470} r={lerp(480, 640, ease.inOut(k))} rot={t * 2.2} tilt={lerp(0.4, 0.55, k)} />
        <circle cx={W / 2 + 190} cy={470 + 40} r={5} fill={GOLD} opacity={smooth(t, 2.5, 3.5)} />
        <Tag x={W / 2 + 214} y={470 + 14} text="Sun" color={GOLD} size={24} align="start" opacity={smooth(t, 2.8, 3.6)} />
      </svg>
      <Vignette strength={0.7} />
    </Space>
  );
};

/* ───────────── 46 · End title ───────────── */
export const EndCard: React.FC<ShotProps> = ({ t, dur }) => {
  const a = ease.out(seg(t, 0.4, 1.6));
  const b = ease.out(seg(t, 1.2, 2.4));
  const out = 1 - seg(t, dur - 1.2, dur);
  return (
    <AbsoluteFill style={{ background: '#02040b' }}>
      <Space tint="blue" zoom={1 + t * 0.01} opacity={0.5} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 340, textAlign: 'center', fontFamily: FONT, opacity: out }}>
        <div style={{ color: INK, fontSize: 112, fontWeight: 800, letterSpacing: 6, opacity: a, transform: `translateY(${(1 - a) * 20}px)`, textShadow: '0 0 60px rgba(127,208,255,.35)' }}>WHAT GRAVITY</div>
        <div style={{ color: INK, fontSize: 112, fontWeight: 800, letterSpacing: 6, opacity: a, transform: `translateY(${(1 - a) * 20}px)` }}>ACTUALLY IS</div>
        <div style={{ height: 2, width: 420 * b, background: GOLD, margin: '36px auto 28px' }} />
        <div style={{ color: GOLD, fontSize: 38, letterSpacing: 3, opacity: b }}>and why Einstein changed everything</div>
      </div>
      <Vignette strength={0.8} />
    </AbsoluteFill>
  );
};
void CYAN; void DIM; void GREEN; void TAU; void SERIF; void clamp; void Arrow;
