import React from 'react';
import {
  Space, Vignette, Planet, Clock, ChapterCard, Tag, Arrow, makeView, toView, screenOf, ease, lerp, seg, smooth, window01, clamp,
  W, H, CYAN, DIM, FONT, GOLD, GREEN, INK, RED, TAU, SERIF,
} from '../lib';
import type { ShotProps } from './hook';

const rad = (d: number) => (d * Math.PI) / 180;
const hms = (s: number) => `00:${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}`;
const Readout: React.FC<{ x: number; y: number; s: number; color?: string }> = ({ x, y, s, color = INK }) => (
  <div style={{ position: 'absolute', left: x - 130, top: y, width: 260, textAlign: 'center', fontFamily: 'monospace', fontSize: 40, color, letterSpacing: 2 }}>{hms(s)}</div>
);

/* ───────────── 33 · Chapter: Time ───────────── */
export const TimeCard: React.FC<ShotProps> = ({ t, dur }) => (
  <Space tint="violet">
    <svg width={W} height={H} style={{ position: 'absolute' }}>
      <Clock cx={W / 2} cy={500} r={430} seconds={t * 40} ticking={false} opacity={0.12} />
    </svg>
    <ChapterCard num="IV" title="TIME" sub="Gravity changes how clocks tick" t={t} dur={dur} y={330} accent={CYAN} />
    <Vignette />
  </Space>
);

const EarthLimb: React.FC<{ top?: number; spin?: number }> = ({ top = 860, spin = 0.3 }) => (
  <Planet kind="earth" cx={W / 2} cy={top + 2600} r={2600} light={-1.5} spin={spin} />
);

/* ───────────── 34 · Two identical, synchronised clocks ───────────── */
export const TwoClocksSync: React.FC<ShotProps> = ({ t, dur }) => {
  const a = ease.out(seg(t, 0.3, 1.3));
  const b = ease.out(seg(t, 1.2, 2.2));
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <EarthLimb top={880} />
        <line x1={1420} y1={430} x2={1420} y2={880} stroke={DIM} strokeDasharray="6 10" strokeOpacity={0.6} />
        <Clock cx={560} cy={690} r={110} seconds={t} label="On Earth's surface" opacity={a} color={CYAN} />
        <Clock cx={1420} cy={330} r={110} seconds={t} label="Far above the Earth" opacity={b} color={GOLD} />
      </svg>
      <Readout x={560} y={690 + 214} s={t} />
      <Readout x={1420} y={330 + 214} s={t} />
      <Tag x={W / 2} y={150} text="Two identical clocks, perfectly synchronised" color={INK} size={50} opacity={window01(t, 0.3, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 35 · Deeper in the field, slower ticks ───────────── */
export const TickRates: React.FC<ShotProps> = ({ t, dur }) => {
  const x0 = 640, widthPx = 1000;
  const tracks = [
    { y: 340, label: 'far above', rate: 1.0, color: GOLD },
    { y: 560, label: 'near the surface', rate: 0.86, color: CYAN },
  ];
  const time = Math.max(0, t - 0.8);
  return (
    <Space tint="violet">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="well35" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a1530" stopOpacity="0" /><stop offset="1" stopColor="#ff9a3c" stopOpacity="0.28" />
          </linearGradient>
        </defs>
        <rect x={120} y={230} width={400} height={500} rx={24} fill="url(#well35)" stroke="#6f8fbf" strokeOpacity={0.4} />
        <Arrow x1={170} y1={690} x2={170} y2={270} color={DIM} width={4} label="higher" labelOffset={[18, 10]} />
        <Tag x={320} y={720} text="Earth" color={DIM} size={26} />
        <Tag x={350} y={340} text="weaker gravity" color={GOLD} size={26} opacity={0.9} />
        <Tag x={320} y={680} text="stronger gravity" color={CYAN} size={26} opacity={0.9} />
        {tracks.map((tr) => {
          const n = Math.floor(time * tr.rate * 2);
          return (
            <g key={tr.label}>
              <line x1={x0} y1={tr.y} x2={x0 + widthPx} y2={tr.y} stroke={DIM} strokeOpacity={0.4} strokeWidth={2} />
              <Tag x={x0} y={tr.y - 44} text={`${tr.label} · ${n} ticks`} color={tr.color} size={32} align="start" />
              {Array.from({ length: Math.min(n, 11) }, (_, i) => (
                <g key={i}>
                  <line x1={x0 + 40 + i * 90} y1={tr.y - 22} x2={x0 + 40 + i * 90} y2={tr.y + 22} stroke={tr.color} strokeWidth={6} strokeLinecap="round" />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      <Tag x={W / 2} y={150} text="The deeper in a gravitational field, the slower a clock ticks" color={INK} size={46} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={830} text="difference exaggerated enormously for visibility" color={DIM} size={28} opacity={smooth(t, 1.5, 2.2) * window01(t, 0, dur, 0.5)} weight={500} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 36 · The readings drift apart ───────────── */
export const DivergingClocks: React.FC<ShotProps> = ({ t, dur }) => {
  const rate = 0.9; // exaggerated
  const top = t * 6, low = t * 6 * rate;
  const diff = top - low;
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <EarthLimb top={900} />
        <Clock cx={560} cy={520} r={150} seconds={low} label="Near the surface" opacity={1} color={CYAN} />
        <Clock cx={1360} cy={520} r={150} seconds={top} label="Far above" opacity={1} color={GOLD} />
        <line x1={720} y1={520} x2={1200} y2={520} stroke={DIM} strokeDasharray="4 10" />
      </svg>
      <Readout x={560} y={750} s={low} color={CYAN} />
      <Readout x={1360} y={750} s={top} color={GOLD} />
      <div style={{ position: 'absolute', left: W / 2 - 230, top: 440, width: 460, textAlign: 'center', fontFamily: FONT, color: INK }}>
        <div style={{ color: DIM, fontSize: 24, letterSpacing: 3 }}>DIFFERENCE</div>
        <div style={{ fontSize: 60, fontWeight: 800, color: RED }}>{diff.toFixed(1)} s</div>
      </div>
      <Tag x={W / 2} y={150} text="A subtle difference appears" color={INK} size={52} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={205} text="exaggerated here · in reality ≈ 1 part in 10¹⁶ per metre of height" color={DIM} size={28} opacity={smooth(t, 1.2, 2) * window01(t, 0, dur, 0.5)} weight={500} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 37 · Measured with atomic clocks over 33 cm ───────────── */
export const OpticalClocks: React.FC<ShotProps> = ({ t, dur }) => {
  const a = ease.out(seg(t, 0.3, 1.3));
  const b = ease.out(seg(t, 1.8, 2.8));
  const lattice = (cx: number, cy: number, c: string, rate: number) => (
    <g>
      <rect x={cx - 150} y={cy - 70} width={300} height={140} rx={22} fill="rgba(8,16,34,.8)" stroke={c} strokeWidth={3} />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={cx - 112 + i * 28} cy={cy + Math.sin(t * 6 * rate + i * 0.9) * 18} r={7} fill={c} opacity={0.95} />
      ))}
    </g>
  );
  return (
    <Space tint="violet">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <g opacity={a}>
          {lattice(800, 700, CYAN, 1)}
          <Tag x={620} y={712} text="clock A" color={CYAN} size={30} align="end" />
        </g>
        <g opacity={a}>
          {lattice(800, 400, GOLD, 1.0000)}
          <Tag x={620} y={412} text="clock B" color={GOLD} size={30} align="end" />
        </g>
        <line x1={1010} y1={400} x2={1010} y2={700} stroke={DIM} strokeWidth={2} />
        <line x1={996} y1={400} x2={1024} y2={400} stroke={DIM} strokeWidth={2} />
        <line x1={996} y1={700} x2={1024} y2={700} stroke={DIM} strokeWidth={2} />
        <Tag x={1040} y={562} text="33 cm" color={INK} size={44} align="start" />
        <Arrow x1={800} y1={330} x2={800} y2={250} color={GREEN} width={4} p={b} />
      </svg>
      <div style={{ position: 'absolute', left: 1180, top: 330, width: 640, fontFamily: FONT, opacity: b }}>
        <div style={{ color: GREEN, fontSize: 40, fontWeight: 700 }}>The higher clock ticks faster</div>
        <div style={{ color: INK, fontSize: 32, marginTop: 14, lineHeight: 1.4 }}>Fractional difference ≈ 4 × 10⁻¹⁷<br /><span style={{ color: DIM }}>about one second in 900 million years</span></div>
        <div style={{ color: DIM, fontSize: 26, marginTop: 22 }}>NIST aluminium-ion optical clocks, 2010</div>
      </div>
      <Tag x={W / 2} y={150} text="Atomic clocks have measured it — across just a third of a metre" color={INK} size={46} opacity={window01(t, 0.3, dur, 0.5)} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 38 · The GPS constellation ───────────── */
export const GpsConstellation: React.FC<ShotProps> = ({ t, dur }) => {
  const view = makeView({ pitch: rad(26), yaw: 0.25 + t * 0.05, dist: 8.2, ty: 0 });
  const earthV = toView(view, 0, 0, 0);
  const earthS = screenOf(earthV);
  const eR = (1000 * 1) / earthV[2];
  const RO = 4.17, inc = rad(55);
  const pos = (omega: number, u: number) => ({
    x: RO * (Math.cos(omega) * Math.cos(u) - Math.sin(omega) * Math.cos(inc) * Math.sin(u)),
    y: RO * Math.sin(inc) * Math.sin(u),
    z: RO * (Math.sin(omega) * Math.cos(u) + Math.cos(omega) * Math.cos(inc) * Math.sin(u)),
  });
  const back: string[] = [], front: string[] = [];
  const sats: { x: number; y: number; z: number; d: number; sx: number; sy: number }[] = [];
  for (let k = 0; k < 6; k++) {
    const om = (k * TAU) / 6;
    let prev: { sx: number; sy: number; d: number } | null = null;
    for (let i = 0; i <= 90; i++) {
      const p = pos(om, (i / 90) * TAU);
      const v = toView(view, p.x, p.y, p.z);
      const s = screenOf(v);
      if (prev) {
        const arr = (prev.d + s.depth) / 2 > earthV[2] ? back : front;
        arr.push(`M${prev.sx.toFixed(1)},${prev.sy.toFixed(1)}L${s.x.toFixed(1)},${s.y.toFixed(1)}`);
      }
      prev = { sx: s.x, sy: s.y, d: s.depth };
    }
    for (let j = 0; j < 4; j++) {
      const u = t * 0.5 + (j * TAU) / 4 + k * 0.9;
      const p = pos(om, u);
      const v = toView(view, p.x, p.y, p.z);
      const s = screenOf(v);
      sats.push({ ...p, d: v[2], sx: s.x, sy: s.y });
    }
  }
  const drawSat = (s: (typeof sats)[number], i: number) => (
    <g key={i}>
      <circle cx={s.sx} cy={s.sy} r={13} fill={GOLD} opacity={0.2} />
      <rect x={s.sx - 11} y={s.sy - 3} width={8} height={6} fill="#9fd0ff" />
      <rect x={s.sx + 3} y={s.sy - 3} width={8} height={6} fill="#9fd0ff" />
      <circle cx={s.sx} cy={s.sy} r={3.5} fill={INK} />
    </g>
  );
  const rx = project3(view, 0.6, 0.6, 0.52); // receiver on the surface facing the camera
  const near = sats.filter((s) => s.d < earthV[2]).sort((a, b) => Math.hypot(a.sx - rx.x, a.sy - rx.y) - Math.hypot(b.sx - rx.x, b.sy - rx.y)).slice(0, 4);
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <path d={back.join('')} stroke={CYAN} strokeOpacity={0.22} fill="none" strokeWidth={1.6} />
        {sats.filter((s) => s.d >= earthV[2]).map(drawSat)}
        <Planet kind="earth" cx={earthS.x} cy={earthS.y} r={eR} light={-2.2} spin={t * 0.3} glow={0.1} />
        <path d={front.join('')} stroke={CYAN} strokeOpacity={0.55} fill="none" strokeWidth={1.8} />
        {near.map((s, i) => <line key={i} x1={rx.x} y1={rx.y} x2={s.sx} y2={s.sy} stroke={GREEN} strokeWidth={1.6} strokeDasharray="5 7" opacity={0.6 + 0.4 * Math.sin(t * 5 + i)} />)}
        {sats.filter((s) => s.d < earthV[2]).map(drawSat)}
        <circle cx={rx.x} cy={rx.y} r={7} fill={GREEN} />
        <Tag x={rx.x + 16} y={rx.y + 34} text="your phone" color={GREEN} size={26} align="start" opacity={smooth(t, 1.5, 2.2)} />
      </svg>
      <Tag x={W / 2} y={150} text="GPS: about 30 satellites, ~20,000 km up" color={INK} size={50} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={208} text="each one carries an atomic clock" color={GOLD} size={34} opacity={smooth(t, 1.2, 2) * window01(t, 0, dur, 0.5)} weight={500} />
      <Vignette />
    </Space>
  );
};
function project3(view: ReturnType<typeof makeView>, x: number, y: number, z: number) {
  const n = Math.hypot(x, y, z);
  return screenOf(toView(view, x / n, y / n, z / n));
}

/* ───────────── 39 · Clock budget: gravity vs speed ───────────── */
export const ClockBudget: React.FC<ShotProps> = ({ t, dur }) => {
  const base = 780, u = 9;
  const g = ease.out(seg(t, 0.4, 1.6));
  const v = ease.out(seg(t, 2.0, 3.2));
  const n = ease.out(seg(t, 3.8, 5));
  const gh = 45.7 * u * g, vh = 7.2 * u * v, nh = 38.5 * u * n;
  const topY = base - 45.7 * u;
  return (
    <Space tint="violet">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <line x1={380} y1={base} x2={1540} y2={base} stroke={DIM} strokeWidth={2.5} />
        <rect x={470} y={base - gh} width={230} height={gh} rx={8} fill={GREEN} opacity={0.9} />
        <rect x={845} y={topY} width={230} height={vh} rx={8} fill={RED} opacity={0.9} />
        <rect x={1220} y={base - nh} width={230} height={nh} rx={8} fill={GOLD} opacity={0.95} />
        <line x1={700} y1={topY} x2={845} y2={topY} stroke={DIM} strokeDasharray="5 8" opacity={v} />
        <line x1={1075} y1={topY + 7.2 * u} x2={1220} y2={topY + 7.2 * u} stroke={DIM} strokeDasharray="5 8" opacity={n} />
        <Tag x={585} y={base + 50} text="weaker gravity" color={GREEN} size={32} opacity={g} />
        <Tag x={585} y={base + 90} text="clock runs faster" color={DIM} size={26} opacity={g} weight={500} />
        <Tag x={960} y={base + 50} text="orbital speed" color={RED} size={32} opacity={v} />
        <Tag x={960} y={base + 90} text="clock runs slower" color={DIM} size={26} opacity={v} weight={500} />
        <Tag x={1335} y={base + 50} text="net effect" color={GOLD} size={32} opacity={n} />
        <Tag x={585} y={base - gh - 22} text="+45.7 µs/day" color={GREEN} size={36} opacity={g} />
        <Tag x={960} y={topY + vh + 46} text="−7.2 µs/day" color={RED} size={36} opacity={v} />
        <Tag x={1335} y={base - nh - 22} text="+38.5 µs/day" color={GOLD} size={42} opacity={n} />
      </svg>
      <Tag x={W / 2} y={150} text="Satellite clocks drift against clocks on the ground" color={INK} size={50} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={205} text="gravity (general relativity) vs. speed (special relativity)" color={DIM} size={30} opacity={window01(t, 0.3, dur, 0.5)} weight={500} />
      <Vignette />
    </Space>
  );
};

/* ───────────── 40 · Uncorrected, position errors pile up ───────────── */
export const PositionDrift: React.FC<ShotProps> = ({ t, dur }) => {
  const hrs = 24 * ease.inOut(seg(t, 0.6, dur - 0.5));
  const km = 11.5 * (hrs / 24); // c × 38.5 µs ≈ 11.5 km after one day
  const px = 32; // px per km
  const ox = 760, oy = 650, ang = rad(-28);
  const ex = ox + Math.cos(ang) * km * px, ey = oy + Math.sin(ang) * km * px;
  const streets: React.ReactNode[] = [];
  for (let i = -3; i <= 14; i++) streets.push(<line key={`a${i}`} x1={ox - 140 + i * px * 1.5} y1={230} x2={ox - 140 + i * px * 1.5} y2={830} stroke="#2c4366" strokeWidth={i % 4 === 0 ? 3 : 1.4} />);
  for (let j = -3; j <= 10; j++) streets.push(<line key={`b${j}`} x1={420} y1={oy - 340 + j * px * 1.5} x2={1500} y2={oy - 340 + j * px * 1.5} stroke="#2c4366" strokeWidth={j % 4 === 0 ? 3 : 1.4} />);
  return (
    <Space tint="blue">
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <rect x={420} y={230} width={1080} height={600} rx={20} fill="rgba(10,20,40,.7)" stroke="#6f8fbf" strokeOpacity={0.4} />
        <g clipPath="url(#mapclip)">{streets}</g>
        <defs><clipPath id="mapclip"><rect x={420} y={230} width={1080} height={600} rx={20} /></clipPath></defs>
        <line x1={ox} y1={oy} x2={ex} y2={ey} stroke={RED} strokeWidth={3} strokeDasharray="8 8" />
        <circle cx={ox} cy={oy} r={14} fill={CYAN} /><Tag x={ox - 26} y={oy + 8} text="where you are" color={CYAN} size={28} align="end" />
        <circle cx={ex} cy={ey} r={14} fill={RED} /><Tag x={ex + 26} y={ey + 8} text="where GPS says" color={RED} size={28} align="start" />
        <line x1={1280} y1={780} x2={1280 + 5 * px} y2={780} stroke={INK} strokeWidth={4} /><Tag x={1280 + 2.5 * px} y={812} text="5 km" color={INK} size={26} />
      </svg>
      <div style={{ position: 'absolute', left: 1560, top: 300, fontFamily: FONT, color: INK }}>
        <div style={{ color: DIM, fontSize: 24, letterSpacing: 3 }}>ELAPSED</div>
        <div style={{ fontSize: 64, fontWeight: 800 }}>{hrs.toFixed(0)} <span style={{ fontSize: 30, color: DIM }}>h</span></div>
        <div style={{ color: DIM, fontSize: 24, letterSpacing: 3, marginTop: 26 }}>ERROR</div>
        <div style={{ fontSize: 64, fontWeight: 800, color: RED }}>{km.toFixed(1)} <span style={{ fontSize: 30, color: DIM }}>km</span></div>
      </div>
      <Tag x={W / 2} y={150} text="Uncorrected, GPS would be off by more than 10 km a day" color={INK} size={48} opacity={window01(t, 0.3, dur, 0.5)} />
      <Tag x={W / 2} y={205} text="engineers account for relativity — the clocks are tuned before launch" color={GOLD} size={32} opacity={smooth(t, 2, 2.8) * window01(t, 0, dur, 0.5)} weight={500} />
      <Vignette />
    </Space>
  );
};
void clamp; void lerp; void SERIF;
