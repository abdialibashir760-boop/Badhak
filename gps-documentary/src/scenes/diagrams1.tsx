import React from "react";
import { clamp01, easeInOut, easeOutCubic, lerp, smoothstep } from "../engine/math3d";
import { useShot } from "../components/context";
import { ACCENT, INK, MINT, MUTED, MONO, Stat, glass, WARN } from "../components/Hud";
import { Card, ClockFace, GroundArc, Mono, Note, Phone2D, Sat2D, Scene2D, bits, groundY } from "./kit";

const GOLD = "#ffc85c";
const VIOLET = "#c39bff";

// ───────────────────────────────────────────────────────── s11 what the signal carries
export const S11: React.FC = () => {
  const { t, p, frame } = useShot();
  const sec = 27 + Math.floor(t);
  const frac = (t % 1).toFixed(6).slice(2);
  const cardA = (at: number) => easeOutCubic(clamp01((p - at) / 0.14));
  const pts: string[] = [];
  for (let x = 260; x <= 1660; x += 5) {
    const env = 1 + 0.35 * Math.sin(x * 0.012 - t * 3);
    pts.push(`${x},${772 + Math.sin(x * 0.11 - t * 14) * 26 * env * smoothstep(0, 0.1, p)}`);
  }
  const stream = bits(46, Math.floor(frame / 2));
  return (
    <Scene2D overlay={
      <>
        <Card x={250} y={170} w={440} title="1 · TIME SENT" color={ACCENT} opacity={cardA(0.1)}>
          <Mono size={40} style={{ marginTop: 18 }}>14:03:{sec}</Mono>
          <Mono size={30} color={ACCENT}>.{frac}</Mono>
          <Note style={{ marginTop: 10 }}>the instant the signal left the satellite</Note>
        </Card>
        <Card x={740} y={170} w={440} title="2 · ORBIT DATA" color={VIOLET} opacity={cardA(0.38)}>
          <svg width={390} height={120} style={{ marginTop: 10 }}>
            <ellipse cx={195} cy={62} rx={150} ry={46} fill="none" stroke={VIOLET} strokeWidth={2} strokeDasharray="3 7" />
            <circle cx={195 + Math.cos(t * 1.5) * 150} cy={62 + Math.sin(t * 1.5) * 46} r={9} fill="#fff" />
            <circle cx={195} cy={62} r={16} fill="#1d6fd0" />
          </svg>
          <Note>where the satellite is, right now</Note>
        </Card>
        <Card x={1230} y={170} w={440} title="3 · CLOCK CORRECTION" color={GOLD} opacity={cardA(0.66)}>
          <Mono size={40} style={{ marginTop: 18 }} color={GOLD}>Δ clock</Mono>
          <Mono size={30} color={MUTED}>tiny, and tracked</Mono>
          <Note style={{ marginTop: 10 }}>how far this satellite's clock has drifted</Note>
        </Card>
        <div style={{ position: "absolute", left: 260, top: 812, fontFamily: MONO, fontSize: 24, letterSpacing: 5, color: ACCENT, opacity: 0.8 }}>{stream}</div>
        <div style={{ position: "absolute", left: 260, top: 856, fontSize: 18, color: MUTED }}>navigation message · 50 bits per second · each satellite signs its signal with its own code</div>
      </>
    }>
      <Sat2D x={140} y={772} s={0.55} rot={90} glow={1} />
      <defs>
        <linearGradient id="carrier" x1="0" x2="1"><stop offset="0" stopColor={ACCENT} stopOpacity={0.2} /><stop offset="0.3" stopColor={ACCENT} /><stop offset="1" stopColor={MINT} /></linearGradient>
      </defs>
      <polyline points={pts.join(" ")} fill="none" stroke="url(#carrier)" strokeWidth={4} strokeLinejoin="round" filter="url(#glow)" />
      {[0, 1, 2].map((i) => {
        const a = ((p * 1.6 + i / 3) % 1);
        return <circle key={i} cx={260 + a * 1400} cy={772} r={7} fill="#fff" opacity={Math.sin(Math.PI * a)} />;
      })}
      {[210, 700, 1190].map((x, i) => <line key={x} x1={x + 220} y1={440} x2={x + 220} y2={740} stroke={[ACCENT, VIOLET, GOLD][i]} strokeWidth={1.4} strokeDasharray="4 8" opacity={0.5 * cardA(0.1 + i * 0.28)} />)}
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s13 atomic clock
export const S13: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  return (
    <Scene2D overlay={
      <>
        <Card x={1130} y={190} w={640} title="WHAT KEEPS THE TIME" color={GOLD} opacity={a(0.12)}>
          <div style={{ marginTop: 16, fontSize: 30, fontWeight: 650 }}>Rubidium and cesium atomic clocks</div>
          <Note style={{ marginTop: 8 }}>Atoms swing between two energy levels at a fixed frequency: nature's own pendulum.</Note>
        </Card>
        <Card x={1130} y={430} w={640} title="FREQUENCY CHAIN" color={ACCENT} opacity={a(0.4)}>
          <Mono size={36} style={{ marginTop: 16 }}>10.23 MHz × 154</Mono>
          <Mono size={36} color={MINT}>= 1575.42 MHz</Mono>
          <Note style={{ marginTop: 8 }}>every GPS signal is derived from the clock</Note>
        </Card>
      </>
    }>
      {/* atom */}
      <g transform="translate(560 520)">
        <circle r={300} fill="#1d6fd0" opacity={0.08} filter="url(#blur20)" />
        <ClockFace cx={0} cy={0} r={290} turns={(t * 0.16) % 1} color={GOLD} ticks={60} opacity={a(0.0) * 0.9 + 0.1} />
        <g opacity={0.95}>
          {[0, 60, 120].map((rot, i) => (
            <g key={rot} transform={`rotate(${rot})`}>
              <ellipse rx={150} ry={54} fill="none" stroke={ACCENT} strokeWidth={1.8} opacity={0.55} />
              <circle cx={Math.cos(t * (2.2 + i * 0.5) + i * 2) * 150} cy={Math.sin(t * (2.2 + i * 0.5) + i * 2) * 54} r={9} fill="#fff" />
              <circle cx={Math.cos(t * (2.2 + i * 0.5) + i * 2) * 150} cy={Math.sin(t * (2.2 + i * 0.5) + i * 2) * 54} r={18} fill={ACCENT} opacity={0.35} />
            </g>
          ))}
          <circle r={26} fill={GOLD} /><circle r={42} fill={GOLD} opacity={0.25} filter="url(#blur6)" />
        </g>
      </g>
      {/* steady oscillation */}
      <polyline points={Array.from({ length: 110 }, (_, i) => `${1130 + i * 5.8},${860 + Math.sin(i * 0.5 - t * 9) * 36}`).join(" ")} fill="none" stroke={GOLD} strokeWidth={3} filter="url(#glow)" opacity={a(0.6)} />
      <text x={1130} y={934} fill={MUTED} fontSize={20} fontFamily="Inter, sans-serif" opacity={a(0.6)}>a steady beat that barely wavers</text>
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s14 listen only
export const S14: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const sx = 330, sy = 250, px = 1500, py = groundY(1500) - 6;
  const wave = (i: number) => ((t * 0.55 + i / 4) % 1);
  return (
    <Scene2D overlay={
      <>
        <div style={{ position: "absolute", left: 700, top: 360, fontSize: 24, letterSpacing: 5, fontWeight: 700, color: ACCENT, opacity: a(0.1) }}>BROADCAST</div>
        <div style={{ position: "absolute", left: 640, top: 640, fontSize: 24, letterSpacing: 5, fontWeight: 700, color: WARN, opacity: a(0.45) }}>NO REPLY</div>
        <div style={{ position: "absolute", left: 1250, top: 480, width: 420, fontSize: 22, color: MUTED, opacity: a(0.3) }}>receive-only: the phone has no way to talk to the satellite</div>
      </>
    }>
      <GroundArc />
      <Sat2D x={sx} y={sy} s={0.8} rot={35} glow={1} />
      {/* downlink */}
      <line x1={sx + 40} y1={sy + 40} x2={px - 30} y2={py - 70} stroke={ACCENT} strokeWidth={4} filter="url(#glow)" opacity={a(0.05)} />
      {[0, 1, 2, 3].map((i) => {
        const w = wave(i);
        return <circle key={i} cx={lerp(sx + 40, px - 30, w)} cy={lerp(sy + 40, py - 70, w)} r={9} fill="#fff" opacity={Math.sin(Math.PI * w) * a(0.05)} />;
      })}
      {/* struck-out uplink */}
      <line x1={px - 80} y1={py - 120} x2={sx + 100} y2={sy + 100} stroke={WARN} strokeWidth={3} strokeDasharray="10 12" opacity={0.55 * a(0.4)} />
      <g opacity={a(0.45)} transform={`translate(${(px + sx) / 2 - 60} ${(py + sy) / 2 + 10})`}>
        <circle r={34} fill="#14080b" stroke={WARN} strokeWidth={4} />
        <line x1={-18} y1={-18} x2={18} y2={18} stroke={WARN} strokeWidth={6} strokeLinecap="round" />
        <line x1={18} y1={-18} x2={-18} y2={18} stroke={WARN} strokeWidth={6} strokeLinecap="round" />
      </g>
      <Phone2D x={px} y={py - 70} s={1.15} glow={0.8} />
      <circle cx={px} cy={py - 70} r={22 + 60 * ((t * 0.9) % 1)} fill="none" stroke={ACCENT} strokeWidth={2} opacity={1 - ((t * 0.9) % 1)} />
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s15 anyone can listen
export const S15: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const sx = 960, sy = 170;
  const rng = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
  const phones = Array.from({ length: 260 }, (_, i) => {
    const u = rng(i + 1), v = rng(i + 77);
    const x = 360 + u * 1200;
    const gy = groundY(x, 1650, 1700, 900);
    return { x, y: gy - 6 - v * 70, k: rng(i + 301) };
  });
  const count = Math.round(260 * smoothstep(0.05, 0.85, p));
  return (
    <Scene2D overlay={
      <Card x={110} y={150} w={470} title="ONE SIGNAL · ANY NUMBER OF RECEIVERS" color={ACCENT} opacity={a(0.08)}>
        <Mono size={64} style={{ marginTop: 14 }}>{count}</Mono>
        <Note>phones in this view, all hearing the same broadcast. The satellite never knows.</Note>
      </Card>
    }>
      <GroundArc />
      <defs>
        <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ACCENT} stopOpacity={0.55} /><stop offset="1" stopColor={ACCENT} stopOpacity={0.05} /></linearGradient>
      </defs>
      <polygon points={`${sx},${sy + 30} 330,${groundY(330) - 2} 1590,${groundY(1590) - 2}`} fill="url(#coneGrad)" opacity={0.7} />
      {[0, 1, 2].map((i) => {
        const w = ((t * 0.5 + i / 3) % 1);
        const y = lerp(sy + 30, 760, w);
        const half = lerp(10, 640, w);
        return <path key={i} d={`M${sx - half} ${y} Q${sx} ${y + 40} ${sx + half} ${y}`} fill="none" stroke={ACCENT} strokeWidth={3} opacity={1 - w} filter="url(#glow)" />;
      })}
      <Sat2D x={sx} y={sy} s={0.7} rot={0} glow={1} />
      {phones.slice(0, count).map((ph, i) => (
        <g key={i} transform={`translate(${ph.x} ${ph.y})`} opacity={0.55 + 0.45 * Math.sin(t * 4 + ph.k * 9) ** 2}>
          <rect x={-3} y={-6} width={6} height={11} rx={1.5} fill="#e8fbff" />
          <circle r={7} fill={ACCENT} opacity={0.2} />
        </g>
      ))}
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s16 time → distance
export const S16: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.14, p);
  const fill = easeInOut(clamp01((p - 0.2) / 0.6));
  return (
    <Scene2D overlay={
      <>
        <div style={{ position: "absolute", left: 360, top: 790, width: 400, textAlign: "center", fontSize: 34, letterSpacing: 6, fontWeight: 700, color: ACCENT, opacity: a(0.05) }}>TIME</div>
        <div style={{ position: "absolute", left: 1010, top: 790, width: 620, textAlign: "center", fontSize: 34, letterSpacing: 6, fontWeight: 700, color: MINT, opacity: a(0.5) }}>DISTANCE</div>
        <div style={{ position: "absolute", left: 800, top: 380, width: 200, textAlign: "center", fontFamily: MONO, fontSize: 64, fontWeight: 700, color: INK, opacity: a(0.3) }}>× c</div>
      </>
    }>
      <ClockFace cx={560} cy={520} r={190} turns={fill * 0.7} color={ACCENT} />
      <path d={`M780 520 H900`} stroke={INK} strokeWidth={3} opacity={a(0.3)} markerEnd="url(#none)" />
      <polygon points="900,508 924,520 900,532" fill={INK} opacity={a(0.3)} />
      {/* ruler */}
      <g opacity={a(0.4)}>
        <rect x={1010} y={470} width={620} height={100} rx={10} fill="#06101f" stroke={MINT} strokeWidth={3} />
        {Array.from({ length: 31 }, (_, i) => <line key={i} x1={1010 + i * 20} y1={470} x2={1010 + i * 20} y2={470 + (i % 5 === 0 ? 44 : 24)} stroke={MINT} strokeWidth={i % 5 === 0 ? 3 : 1.5} />)}
        <rect x={1014} y={560} width={612 * fill} height={7} rx={3} fill={MINT} filter="url(#glow)" />
        <circle cx={1014 + 612 * fill} cy={563} r={10} fill="#fff" />
      </g>
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s18 the 21,000 km trip + s19 stopwatch
const SX = 250, SY = 210;
export const S18: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const px = 1560, py = groundY(1560) - 4;
  const q = easeInOut(clamp01((p - 0.12) / 0.74));
  const dx = px - SX, dy = py - 70 - SY;
  const L = Math.hypot(dx, dy);
  const nx = -dy / L, ny = dx / L;
  const secs = 0.07 * q;
  return (
    <Scene2D overlay={
      <>
        <Card x={1330} y={150} w={440} title="STOPWATCH" color={MINT} opacity={a(0.05)}>
          <Mono size={74} style={{ marginTop: 10 }}>{secs.toFixed(3)}<span style={{ fontSize: 30, color: MUTED }}> s</span></Mono>
          <Note>since the signal left the satellite</Note>
        </Card>
        <div style={{ position: "absolute", left: SX + 80, top: SY + 70, fontSize: 18, letterSpacing: 3, fontWeight: 700, color: ACCENT, opacity: a(0.08) }}>SENT · t₀</div>
        <div style={{ position: "absolute", left: px - 210, top: py - 150, fontSize: 18, letterSpacing: 3, fontWeight: 700, color: MINT, opacity: smoothstep(0.82, 0.92, p) }}>RECEIVED · t₀ + 0.070 s</div>
      </>
    }>
      <GroundArc />
      <Sat2D x={SX} y={SY} s={0.7} rot={35} glow={1} />
      <Phone2D x={px} y={py - 70} s={1.0} glow={0.8} />
      <line x1={SX + 30} y1={SY + 40} x2={px} y2={py - 70} stroke={ACCENT} strokeWidth={2} strokeDasharray="4 10" opacity={0.5} />
      <line x1={SX + 30} y1={SY + 40} x2={lerp(SX + 30, px, q)} y2={lerp(SY + 40, py - 70, q)} stroke={ACCENT} strokeWidth={5} filter="url(#glow)" />
      <circle cx={lerp(SX + 30, px, q)} cy={lerp(SY + 40, py - 70, q)} r={14} fill="#fff" filter="url(#glow)" />
      {/* dimension line */}
      <g opacity={a(0.15)} stroke={MUTED} strokeWidth={1.6}>
        <line x1={SX + 30 + nx * 70} y1={SY + 40 + ny * 70} x2={px + nx * 70} y2={py - 70 + ny * 70} />
        <line x1={SX + 30 + nx * 56} y1={SY + 40 + ny * 56} x2={SX + 30 + nx * 84} y2={SY + 40 + ny * 84} />
        <line x1={px + nx * 56} y1={py - 70 + ny * 56} x2={px + nx * 84} y2={py - 70 + ny * 84} />
      </g>
      <g transform={`translate(${(SX + px) / 2 + nx * 106} ${(SY + py - 70) / 2 + ny * 106})`} opacity={a(0.2)}>
        <rect x={-130} y={-30} width={260} height={52} rx={12} fill="#06101f" stroke={MUTED} />
        <text textAnchor="middle" y={8} fill="#fff" fontSize={30} fontWeight={700} fontFamily={MONO}>≈ 21,000 km</text>
      </g>
    </Scene2D>
  );
};

export const S19: React.FC = () => {
  const { t, p } = useShot();
  const fill = easeOutCubic(clamp01(p / 0.55));
  const ms = 70 * fill;
  const a = (at: number) => smoothstep(at, at + 0.14, p);
  return (
    <Scene2D overlay={
      <div style={{ position: "absolute", left: 0, right: 0, top: 750, textAlign: "center", opacity: a(0.5) }}>
        <div style={{ fontSize: 34, color: INK, fontWeight: 650 }}>about 70 milliseconds</div>
        <div style={{ fontSize: 22, color: MUTED, marginTop: 6 }}>far quicker than a blink of an eye</div>
      </div>
    }>
      <g transform="translate(960 440)">
        <circle r={290} fill={MINT} opacity={0.07} filter="url(#blur20)" />
        <circle r={250} fill="#06101f" stroke={MINT} strokeWidth={4} />
        {Array.from({ length: 60 }, (_, i) => {
          const an = (i / 60) * Math.PI * 2 - Math.PI / 2;
          return <line key={i} x1={Math.cos(an) * (i % 5 === 0 ? 210 : 226)} y1={Math.sin(an) * (i % 5 === 0 ? 210 : 226)} x2={Math.cos(an) * 242} y2={Math.sin(an) * 242} stroke={i % 5 === 0 ? "#fff" : MINT} strokeWidth={i % 5 === 0 ? 3 : 1.4} opacity={0.8} />;
        })}
        <path d={`M0 -250 A250 250 0 ${fill * 0.19 > 0.5 ? 1 : 0} 1 ${Math.sin(fill * 0.19 * Math.PI * 2) * 250} ${-Math.cos(fill * 0.19 * Math.PI * 2) * 250}`} fill="none" stroke={MINT} strokeWidth={8} filter="url(#glow)" />
        <line x1={0} y1={0} x2={Math.sin(fill * 0.19 * Math.PI * 2) * 232} y2={-Math.cos(fill * 0.19 * Math.PI * 2) * 232} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        <circle r={10} fill="#fff" />
        <text y={110} textAnchor="middle" fill="#fff" fontSize={86} fontWeight={700} fontFamily={MONO}>{(ms / 1000).toFixed(3)}</text>
        <text y={156} textAnchor="middle" fill={MUTED} fontSize={28} fontFamily="Inter, sans-serif">seconds</text>
      </g>
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s20 sent vs received, s21 equation
export const S20: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const q = clamp01((p - 0.25) / 0.45);
  const gap = easeOutCubic(clamp01((p - 0.6) / 0.25));
  return (
    <Scene2D overlay={
      <>
        <Card x={190} y={150} w={520} title="TIME STAMPED IN THE MESSAGE" color={ACCENT} opacity={a(0.05)}>
          <Mono size={46} style={{ marginTop: 16 }}>12:00:00.000000</Mono>
          <Note>the satellite's clock when it sent it</Note>
        </Card>
        <Card x={1210} y={150} w={520} title="THE PHONE'S OWN CLOCK" color={MINT} opacity={a(0.5)}>
          <Mono size={46} style={{ marginTop: 16 }}>12:00:00.070000</Mono>
          <Note>the phone's clock when it arrived</Note>
        </Card>
        <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", opacity: gap }}>
          <span style={{ fontFamily: MONO, fontSize: 58, fontWeight: 700, color: "#fff" }}>Δt = 0.070 s</span>
          <div style={{ fontSize: 22, color: MUTED, marginTop: 6 }}>the difference between the two clocks</div>
        </div>
      </>
    }>
      <ClockFace cx={450} cy={600} r={150} turns={0.0} color={ACCENT} />
      <ClockFace cx={1470} cy={600} r={150} turns={0.07 * q} color={MINT} />
      <line x1={620} y1={600} x2={1300} y2={600} stroke={ACCENT} strokeWidth={2} strokeDasharray="4 10" opacity={0.5} />
      <circle cx={lerp(620, 1300, q)} cy={600} r={12} fill="#fff" filter="url(#glow)" opacity={q > 0 && q < 1 ? 1 : 0} />
      <g opacity={gap}>
        <line x1={620} y1={640} x2={620} y2={680} stroke="#fff" strokeWidth={2} /><line x1={1300} y1={640} x2={1300} y2={680} stroke="#fff" strokeWidth={2} />
        <line x1={620} y1={660} x2={1300} y2={660} stroke="#fff" strokeWidth={2.5} />
      </g>
    </Scene2D>
  );
};

export const S21: React.FC = () => {
  const { p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  return (
    <Scene2D grid={0.05} overlay={
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
        <div style={{ opacity: a(0.05), transform: `scale(${0.94 + 0.06 * a(0.05)})` }}>
          <span style={{ fontFamily: MONO, fontSize: 150, fontWeight: 700, color: "#fff", letterSpacing: -4 }}>d = </span>
          <span style={{ fontFamily: MONO, fontSize: 150, fontWeight: 700, color: ACCENT }}>c</span>
          <span style={{ fontFamily: MONO, fontSize: 150, fontWeight: 700, color: "#fff" }}> × </span>
          <span style={{ fontFamily: MONO, fontSize: 150, fontWeight: 700, color: MINT }}>Δt</span>
        </div>
        <div style={{ marginTop: 56, fontFamily: MONO, fontSize: 52, fontWeight: 600, opacity: a(0.45) }}>
          <span style={{ color: ACCENT }}>299,792 km/s</span> <span style={{ color: MUTED }}>×</span> <span style={{ color: MINT }}>0.070 s</span>
        </div>
        <div style={{ marginTop: 22, fontFamily: MONO, fontSize: 70, fontWeight: 700, color: "#fff", opacity: a(0.7) }}>≈ 21,000 km</div>
        <div style={{ marginTop: 14, fontSize: 22, color: MUTED, opacity: a(0.8) }}>in practice: finer timing, corrections, and a clock error to solve for</div>
      </div>
    }>
      <g />
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s22 one nanosecond = 30 cm
export const S22: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const x0 = 360, w = 1200;
  const q = ((t * 0.45) % 1);
  const ns = (q * 1).toFixed(2);
  return (
    <Scene2D overlay={
      <>
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", opacity: a(0.05) }}>
          <div style={{ fontSize: 22, letterSpacing: 6, fontWeight: 700, color: ACCENT }}>ONE NANOSECOND</div>
          <div style={{ fontFamily: MONO, fontSize: 64, fontWeight: 700, marginTop: 12 }}>0.000 000 001 s</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 680, textAlign: "center", opacity: a(0.45) }}>
          <div style={{ fontSize: 50, fontWeight: 700 }}>light travels ≈ <span style={{ color: MINT }}>30 centimeters</span></div>
          <div style={{ fontSize: 24, color: MUTED, marginTop: 10 }}>so a one-nanosecond timing error is a 30 cm position error</div>
        </div>
      </>
    }>
      <g opacity={a(0.15)}>
        <rect x={x0} y={450} width={w} height={130} rx={12} fill="#06101f" stroke={MINT} strokeWidth={3} />
        {Array.from({ length: 31 }, (_, i) => <line key={i} x1={x0 + (i * w) / 30} y1={450} x2={x0 + (i * w) / 30} y2={450 + (i % 5 === 0 ? 56 : 32)} stroke={MINT} strokeWidth={i % 5 === 0 ? 3 : 1.5} />)}
        {Array.from({ length: 7 }, (_, i) => <text key={i} x={x0 + (i * 5 * w) / 30} y={540} textAnchor="middle" fill="#fff" fontSize={24} fontFamily={MONO}>{i * 5}</text>)}
        <text x={x0 + w + 16} y={560} fill={MUTED} fontSize={24} fontFamily="Inter, sans-serif">cm</text>
        <circle cx={x0 + q * w} cy={420} r={13} fill="#fff" filter="url(#glow)" />
        <line x1={x0} y1={420} x2={x0 + q * w} y2={420} stroke={ACCENT} strokeWidth={4} filter="url(#glow)" />
        <text x={x0 + q * w} y={388} textAnchor="middle" fill={ACCENT} fontSize={26} fontFamily={MONO} fontWeight={700}>{ns} ns</text>
      </g>
    </Scene2D>
  );
};
export { Stat, glass };
