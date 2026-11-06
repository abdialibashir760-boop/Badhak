import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  Space, Starfield, Vignette, Planet, Tag, Statement, Galaxy, Sun, bounce, fallTime, clamp, ease, lerp, seg, smooth, window01,
  W, H, CYAN, DIM, FONT, GOLD, INK, TAU,
} from '../lib';

export type ShotProps = { t: number; dur: number };

/* ───────────── 01 · Hand releases a ball ───────────── */
export const HandDrop: React.FC<ShotProps> = ({ t }) => {
  const FLOOR = 905, PXM = 400, R = 34;
  const h0 = 1.5; // metres above the floor at release
  const release = 1.5;
  const slow = 0.5; // slow-motion factor
  const tp = Math.max(0, (t - release) * slow);
  const b = bounce(tp, h0);
  const held = t < release;
  const by = FLOOR - R - (held ? h0 : Math.max(0, b.y)) * PXM;
  const open = smooth(t, release - 0.25, release + 0.1);
  const squash = b.hit && b.y < 0.03 ? 0.82 : 1;
  const zoom = 1 + 0.04 * seg(t, 0, 4);
  const bx = 980;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 52% 18%, #1b2a3f 0%, #090e18 55%, #04060b 100%)' }}>
      <svg width={W} height={H} style={{ position: 'absolute', transform: `scale(${zoom})`, transformOrigin: '50% 55%' }}>
        <defs>
          <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bcd8ff" stopOpacity="0.28" /><stop offset="1" stopColor="#bcd8ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a2433" /><stop offset="1" stopColor="#05070c" />
          </linearGradient>
        </defs>
        <polygon points={`${bx - 60},0 ${bx + 60},0 ${bx + 520},${FLOOR} ${bx - 520},${FLOOR}`} fill="url(#cone)" />
        <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill="url(#floor)" />
        <line x1={0} y1={FLOOR} x2={W} y2={FLOOR} stroke="#3d5578" strokeWidth={2} />
        {/* soft shadow */}
        <ellipse cx={bx} cy={FLOOR + 6} rx={46 - (by < FLOOR - 100 ? 10 : 0)} ry={9} fill="#000" opacity={0.55} />
        {/* arm + hand, from upper right */}
        <g transform={`translate(${bx + 10} ${by - R - 6})`} opacity={1 - smooth(t, release + 0.2, release + 0.9)}>
          <path d={`M ${320 + open * 40} ${-420} C ${200 + open * 24} ${-260} ${120} ${-130} ${44 + open * 22} ${-34}`} stroke="#0d1420" strokeWidth={96} fill="none" strokeLinecap="round" />
          <path d={`M ${320 + open * 40} ${-420} C ${200 + open * 24} ${-260} ${120} ${-130} ${44 + open * 22} ${-34}`} stroke="#6f8fbf" strokeOpacity={0.35} strokeWidth={3} fill="none" transform="translate(-44 0)" />
          {[-1, 0, 1].map((i) => (
            <ellipse key={i} cx={i * 22 + open * i * 20} cy={-18 + Math.abs(i) * 6} rx={13} ry={40} fill="#0d1420" stroke="#6f8fbf" strokeOpacity={0.3}
              transform={`rotate(${i * 12 + open * i * 26} ${i * 22} -50)`} />
          ))}
          <ellipse cx={-48 - open * 22} cy={-6} rx={14} ry={32} fill="#0d1420" stroke="#6f8fbf" strokeOpacity={0.3} transform={`rotate(${-40 - open * 24} -48 -6)`} />
        </g>
        {/* motion ghosts */}
        {!held && b.v < -0.5 && [1, 2, 3].map((k) => {
          const bb = bounce(Math.max(0, tp - k * 0.018), h0);
          return <circle key={k} cx={bx} cy={FLOOR - R - Math.max(0, bb.y) * PXM} r={R} fill="#ff9a55" opacity={0.16 / k} />;
        })}
        <g transform={`translate(${bx} ${by + (1 - squash) * R * 0.9}) scale(${1 + (1 - squash) * 0.9} ${squash})`}>
          <Planet kind="ball" cx={0} cy={0} r={R} light={-2.2} />
        </g>
      </svg>
      <Tag x={W / 2} y={1010} text="" />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

/* ───────────── 02 · Camera follows the falling ball ───────────── */
export const FallFollow: React.FC<ShotProps & { overlay?: React.ReactNode; warp?: boolean; h0?: number; rate?: number; showTitle?: boolean; heading?: string }> = ({ t, warp = false, overlay, h0 = 45, rate = 0.85, showTitle = true, heading = 'FALLING BALL' }) => {
  const g = 9.81, H0 = h0;
  const tf = fallTime(H0);
  const tt = Math.min(t * rate, tf + 0.6); // slightly slowed so the fall fills the shot
  const b = bounce(tt, H0, g, 0.3);
  const y = Math.max(0, b.y);
  const PXM = 24; // px per metre
  const ballY = 470;
  const toScreen = (m: number) => ballY + (y - m) * PXM; // world height m → screen y
  const speed = Math.min(Math.abs(b.v), g * tf);
  const sky = smooth(y, 0, H0);
  const ticks = [];
  for (let m = -10; m <= 80; m += 5) ticks.push(m);
  const clouds = [60, 38, 22, 9];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(to bottom, #060b18 0%, ${sky > 0.3 ? '#1a3358' : '#223d66'} 60%, #3b5b82 100%)` }}>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {clouds.map((m, i) => (
          <g key={i} opacity={0.18 + 0.08 * (i % 2)}>
            <ellipse cx={300 + i * 360} cy={toScreen(m)} rx={190} ry={22} fill="#cfe0ff" />
            <ellipse cx={420 + i * 360} cy={toScreen(m) + 8} rx={120} ry={16} fill="#cfe0ff" />
          </g>
        ))}
        {warp && Array.from({ length: 9 }, (_, k) => {
          const m = (k * H0) / 8;
          const pts = Array.from({ length: 49 }, (_, i) => `${i * 40},${toScreen(m) + 34 + 70 * Math.exp(-Math.pow((i * 40 - 960) / 420, 2))}`);
          return <polyline key={k} points={pts.join(' ')} fill="none" stroke={CYAN} strokeOpacity={0.35} strokeWidth={2} />;
        })}
        {/* ground */}
        <rect x={0} y={toScreen(0) + 34} width={W} height={H} fill="#0a0f18" />
        <line x1={0} y1={toScreen(0) + 34} x2={W} y2={toScreen(0) + 34} stroke="#5d7da8" strokeWidth={3} />
        {/* ruler */}
        <line x1={1480} y1={0} x2={1480} y2={H} stroke={DIM} strokeWidth={2} />
        {ticks.map((m) => (
          <g key={m}>
            <line x1={1480} y1={toScreen(m) + 34} x2={1480 + (m % 10 === 0 ? 46 : 26)} y2={toScreen(m) + 34} stroke={DIM} strokeWidth={2} />
            {m % 10 === 0 && m >= 0 && <text x={1540} y={toScreen(m) + 42} fill={DIM} fontFamily={FONT} fontSize={26}>{m} m</text>}
          </g>
        ))}
        {/* trail */}
        {y > 0.5 && Array.from({ length: 8 }, (_, k) => (
          <circle key={k} cx={960} cy={ballY - (k + 1) * Math.min(speed, 30) * 1.1} r={30 - k * 2.2} fill="#ff9a55" opacity={0.14 - k * 0.015} />
        ))}
        <Planet kind="ball" cx={960} cy={ballY} r={32} light={-2.3} />
        {/* gravity arrow */}
        <line x1={960} y1={ballY + 50} x2={960} y2={ballY + 50 + clamp(speed / 30) * 120 + 30} stroke={GOLD} strokeWidth={5} strokeLinecap="round" opacity={window01(t, 0.4, 5)} />
        <polygon points={`960,${ballY + 50 + clamp(speed / 30) * 120 + 52} 946,${ballY + 50 + clamp(speed / 30) * 120 + 24} 974,${ballY + 50 + clamp(speed / 30) * 120 + 24}`} fill={GOLD} opacity={window01(t, 0.4, 5)} />
      </svg>
      <div style={{ position: 'absolute', left: 120, top: 150, fontFamily: FONT, color: INK, opacity: window01(t, 0.3, 4, 0.5) }}>
        <div style={{ color: DIM, fontSize: 24, letterSpacing: 3 }}>{heading}</div>
        <div style={{ fontSize: 72, fontWeight: 800, marginTop: 8 }}>{speed.toFixed(1)} <span style={{ fontSize: 34, color: DIM }}>m/s</span></div>
        <div style={{ fontSize: 30, color: GOLD, marginTop: 6 }}>speeds up by 9.8 m/s every second</div>
      </div>
      {overlay}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', fontFamily: FONT, color: INK, fontSize: 150, fontWeight: 800, letterSpacing: 18,
        opacity: showTitle ? window01(t, 1.9, 3.5, 0.5) * 0.92 : 0, textShadow: '0 0 60px rgba(127,208,255,.6)' }}>
        GRAVITY
      </div>
      <Vignette />
    </AbsoluteFill>
  );
};

/* ───────────── 03 · Ball settles on the ground, "g" appears ───────────── */
export const BounceSettle: React.FC<ShotProps> = ({ t }) => {
  const GROUND = 760, PXM = 150, R = 30;
  const b = bounce(t * 0.9 + 0.3, 2.6, 9.81, 0.55);
  const y = Math.max(0, b.y);
  const squash = b.hit && y < 0.02 ? 0.78 : 1;
  const tilt = smooth(t, 0, 3.5) * 120;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#050914, #0f2038 55%, #1c3555)' }}>
      <Starfield driftY={-tilt * 0.4} opacity={0.7} />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="ground3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16202e" /><stop offset="1" stopColor="#04060a" /></linearGradient>
        </defs>
        <g transform={`translate(0 ${tilt})`}>
          <rect x={0} y={GROUND + R} width={W} height={H} fill="url(#ground3)" />
          <line x1={0} y1={GROUND + R} x2={W} y2={GROUND + R} stroke="#4c6b96" strokeWidth={2.5} />
          {[...Array(7)].map((_, i) => (
            <line key={i} x1={W / 2} y1={GROUND + R} x2={W / 2 + (i - 3) * 520} y2={H + 200} stroke="#2b3d57" strokeWidth={1.5} />
          ))}
          <ellipse cx={960} cy={GROUND + R + 8} rx={40 + y * 8} ry={8} fill="#000" opacity={0.55 - y * 0.1} />
          {b.hit && y < 0.02 && <ellipse cx={960} cy={GROUND + R} rx={70 + (t * 40) % 70} ry={10} fill="none" stroke="#9db8e0" strokeOpacity={0.4} />}
          <g transform={`translate(960 ${GROUND - y * PXM + (1 - squash) * R}) scale(${1 + (1 - squash) * 0.8} ${squash})`}>
            <Planet kind="ball" cx={0} cy={0} r={R} />
          </g>
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 120, top: 140, fontFamily: FONT, opacity: window01(t, 0.4, 3.5), color: INK }}>
        <div style={{ color: DIM, fontSize: 24, letterSpacing: 3 }}>EVERYDAY GRAVITY</div>
        <div style={{ fontSize: 70, fontWeight: 800, marginTop: 6 }}>g ≈ 9.81 <span style={{ fontSize: 34, color: DIM }}>m/s²</span></div>
        <div style={{ fontSize: 30, color: CYAN, marginTop: 6 }}>It feels simple.</div>
      </div>
      <Vignette />
    </AbsoluteFill>
  );
};

/* ───────────── 04 · Ascent from the ground to space ───────────── */
export const Ascent: React.FC<ShotProps> = ({ t, dur }) => {
  const u = ease.inOut(seg(t, 0, dur - 0.3));
  const R = lerp(9000, 1700, ease.out(u));
  const top = lerp(560, 800, u);
  const cx = W / 2;
  const cy = top + R;
  const sky = clamp(1 - u * 1.25);
  const alt = Math.round(Math.pow(u, 2.6) * 400);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(to bottom, rgb(${4 + 30 * sky},${8 + 90 * sky},${20 + 170 * sky}), rgb(${6 + 90 * sky},${14 + 130 * sky},${30 + 200 * sky}))` }}>
      <Starfield opacity={clamp(u * 1.8 - 0.4)} />
      <AbsoluteFill style={{ background: `rgba(${40 + 150 * sky},${70 + 130 * sky},${130 + 100 * sky},${sky * 0.9})` }} />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <circle cx={cx} cy={cy} r={R * 1.012} fill="none" stroke="#7cc2ff" strokeOpacity={0.6 - 0.2 * u} strokeWidth={Math.max(3, R * 0.01)} />
        <Planet kind="earth" cx={cx} cy={cy} r={R} light={-1.57} spin={t * 0.1} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#bfe0ff" strokeOpacity={0.5} strokeWidth={2} />
      </svg>
      <div style={{ position: 'absolute', left: 120, top: 150, fontFamily: FONT, color: INK }}>
        <div style={{ color: DIM, fontSize: 24, letterSpacing: 3 }}>ALTITUDE</div>
        <div style={{ fontSize: 76, fontWeight: 800 }}>{alt} <span style={{ fontSize: 34, color: DIM }}>km</span></div>
      </div>
      <Vignette />
    </AbsoluteFill>
  );
};

/* ───────────── 05 · Earth from orbit + the question ───────────── */
export const EarthOrbit: React.FC<ShotProps> = ({ t, dur }) => {
  const slide = ease.out(seg(t, 0, dur));
  return (
    <Space tint="blue" driftX={-t * 8}>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Planet kind="earth" cx={lerp(1500, 1380, slide)} cy={lerp(760, 700, slide)} r={560} light={-2.3} spin={t * 0.12 + 1} glow={0.18} />
        <Planet kind="moon" cx={lerp(380, 300, slide)} cy={lerp(250, 230, slide)} r={34} light={-2.3} />
      </svg>
      <Statement text="Is gravity really a force?" sub="Or is there a deeper explanation?" t={t} dur={dur} y={340} size={84} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 06 · Zoom out to the universe + film title ───────────── */
export const CosmicZoom: React.FC<ShotProps> = ({ t, dur }) => {
  const k = seg(t, 0, dur - 1.2);
  const s = Math.exp(-k * 9); // scale factor, 1 → ~1e-4
  const earthMoon = clamp(1 - seg(k, 0.18, 0.4));
  const solar = Math.min(seg(k, 0.15, 0.4), 1 - seg(k, 0.62, 0.8));
  const gal = seg(k, 0.6, 0.85);
  const title = ease.out(seg(t, dur - 2.2, dur - 1.2));
  return (
    <Space tint="violet" zoom={1 + k * 0.4}>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <g opacity={earthMoon}>
          <g transform={`translate(${W / 2} 470) scale(${Math.exp(-k * 4)})`}>
            <circle r={380} fill="none" stroke={CYAN} strokeOpacity={0.5} strokeDasharray="4 12" />
            <Planet kind="moon" cx={380 * Math.cos(t * 0.7)} cy={380 * Math.sin(t * 0.7)} r={24} />
            <Planet kind="earth" cx={0} cy={0} r={140} spin={t * 0.3} glow={0.15} />
          </g>
        </g>
        <g opacity={solar}>
          <g transform={`translate(${W / 2} 470)`}>
            {[70, 120, 175, 240, 330, 430].map((r, i) => (
              <g key={r}>
                <circle r={r * (0.6 + 0.4 * (1 - k))} fill="none" stroke="#7fb0ff" strokeOpacity={0.28} />
                <circle cx={Math.cos(t * (1.1 - i * 0.15) + i) * r * (0.6 + 0.4 * (1 - k))} cy={Math.sin(t * (1.1 - i * 0.15) + i) * r * (0.6 + 0.4 * (1 - k))} r={6 + (i === 4 ? 4 : 0)} fill={i === 2 ? CYAN : GOLD} />
              </g>
            ))}
            <Sun cx={0} cy={0} r={26} t={t} />
          </g>
        </g>
        <Galaxy cx={W / 2} cy={470} r={lerp(100, 520, ease.out(gal))} rot={t * 2} tilt={0.5} opacity={gal} />
      </svg>
      <Tag x={W / 2} y={880} text="Earth and Moon" color={CYAN} size={34} opacity={earthMoon} />
      <Tag x={W / 2} y={880} text="The Solar System" color={GOLD} size={34} opacity={solar} />
      <Tag x={W / 2} y={880} text="The Milky Way · ~100,000 light-years across" color={INK} size={34} opacity={gal * (1 - title)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: FONT, opacity: title * (1 - seg(t, dur - 0.5, dur)) }}>
        <div style={{ color: INK, fontSize: 104, fontWeight: 800, letterSpacing: 5, textShadow: '0 0 60px rgba(0,0,0,.9)' }}>WHAT GRAVITY</div>
        <div style={{ color: INK, fontSize: 104, fontWeight: 800, letterSpacing: 5, textShadow: '0 0 60px rgba(0,0,0,.9)' }}>ACTUALLY IS</div>
        <div style={{ color: GOLD, fontSize: 36, marginTop: 24, letterSpacing: 3 }}>and why Einstein changed everything</div>
      </div>
      <Vignette />
    </Space>
  );
};
void TAU;
