import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, Car, Card, Chip, Gauge, LimitSign, SceneTag } from "./art";
import { C, FONT, H, W, pop, ramp } from "./theme";
import type { Strings } from "./strings";
import type { Scene } from "./timing";

export type SceneProps = { sc: Scene; t: Strings };

/** Local-time helper: seconds since scene start + cue lookup (local seconds). */
const useSc = (sc: Scene) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = (name: string) => (sc.cues[name] ?? sc.start + 1) - sc.start;
  return { frame, fps, lt: frame / fps, cue, dur: sc.end - sc.start };
};

const lerp = (v: number, a: number, b: number, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(v, [0, 1], [a, b], { easing });

const Road: React.FC<{ y: number; h?: number; frame: number; speed?: number }> = ({
  y,
  h = 190,
  frame,
  speed = 0,
}) => {
  const off = (frame * speed) % 160;
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: W, height: h, background: C.road }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "#2c3a55" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "#2c3a55" }} />
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: h / 2 - 4,
            left: i * 160 - off,
            width: 90,
            height: 8,
            borderRadius: 4,
            background: C.roadLine,
            opacity: 0.55,
          }}
        />
      ))}
    </div>
  );
};

const Label: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  o?: number;
  size?: number;
  color?: string;
  center?: boolean;
  weight?: number;
}> = ({ children, x, y, o = 1, size = 40, color = C.text, center, weight = 800 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity: o,
      fontFamily: FONT,
      fontWeight: weight,
      fontSize: size,
      color,
      transform: center ? "translateX(-50%)" : undefined,
      whiteSpace: "nowrap",
      lineHeight: 1.1,
    }}
  >
    {children}
  </div>
);

const Flag: React.FC<{ color?: string; size?: number }> = ({ color = C.accent, size = 80 }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 80 104">
    <rect x="10" y="4" width="6" height="96" rx="3" fill="#cbd5e1" />
    <path d="M16 6 L70 20 L16 44 Z" fill={color} />
  </svg>
);

const Stopwatch: React.FC<{ size?: number; sweep?: number; color?: string }> = ({
  size = 150,
  sweep = 0,
  color = C.accent,
}) => (
  <svg width={size} height={size} viewBox="0 0 150 150">
    <rect x="62" y="4" width="26" height="14" rx="4" fill="#94a3b8" />
    <circle cx="75" cy="84" r="58" fill={C.card} stroke={color} strokeWidth="8" />
    {Array.from({ length: 12 }).map((_, i) => (
      <line
        key={i}
        x1={75 + 46 * Math.cos((i * Math.PI) / 6)}
        y1={84 + 46 * Math.sin((i * Math.PI) / 6)}
        x2={75 + 52 * Math.cos((i * Math.PI) / 6)}
        y2={84 + 52 * Math.sin((i * Math.PI) / 6)}
        stroke="#64748b"
        strokeWidth="3"
      />
    ))}
    <line
      x1="75"
      y1="84"
      x2={75 + 40 * Math.sin((sweep * Math.PI) / 180)}
      y2={84 - 40 * Math.cos((sweep * Math.PI) / 180)}
      stroke="#f8fafc"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <circle cx="75" cy="84" r="7" fill="#f8fafc" />
  </svg>
);

const Envelope: React.FC<{ size?: number }> = ({ size = 130 }) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 130 94">
    <rect x="4" y="4" width="122" height="86" rx="12" fill="#f8fafc" />
    <path d="M8 10 L65 56 L122 10" stroke="#94a3b8" strokeWidth="6" fill="none" strokeLinejoin="round" />
    <rect x="86" y="58" width="30" height="24" rx="4" fill={C.accent} />
  </svg>
);

const Magnifier: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <circle cx="48" cy="48" r="32" fill="none" stroke="#f8fafc" strokeWidth="10" />
    <line x1="72" y1="72" x2="108" y2="108" stroke={C.accent} strokeWidth="14" strokeLinecap="round" />
  </svg>
);

const PhotoIcon: React.FC<{ size?: number }> = ({ size = 130 }) => (
  <svg width={size} height={size * 0.78} viewBox="0 0 130 100">
    <rect x="4" y="12" width="122" height="84" rx="12" fill="#e2e8f0" />
    <rect x="40" y="2" width="50" height="16" rx="6" fill="#e2e8f0" />
    <circle cx="65" cy="54" r="26" fill="#0f172a" />
    <circle cx="65" cy="54" r="16" fill={C.wave} />
  </svg>
);

const Banknote: React.FC<{ color: string }> = ({ color }) => (
  <svg width="150" height="90" viewBox="0 0 150 90">
    <rect x="4" y="8" width="142" height="74" rx="10" fill="none" stroke={color} strokeWidth="8" />
    <circle cx="75" cy="45" r="20" fill="none" stroke={color} strokeWidth="8" />
    <circle cx="26" cy="45" r="5" fill={color} />
    <circle cx="124" cy="45" r="5" fill={color} />
  </svg>
);
const BookIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="140" height="90" viewBox="0 0 140 90">
    <path d="M70 18 C50 6 24 6 6 12 L6 76 C24 70 50 70 70 82 C90 70 116 70 134 76 L134 12 C116 6 90 6 70 18 Z" fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
    <line x1="70" y1="18" x2="70" y2="82" stroke={color} strokeWidth="8" />
  </svg>
);
const Badge: React.FC<{ color: string }> = ({ color }) => (
  <svg width="100" height="96" viewBox="0 0 100 96">
    <path d="M50 4 L92 20 L92 52 C92 72 72 86 50 92 C28 86 8 72 8 52 L8 20 Z" fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
    <line x1="50" y1="30" x2="50" y2="66" stroke={color} strokeWidth="9" strokeLinecap="round" />
    <line x1="32" y1="48" x2="68" y2="48" stroke={color} strokeWidth="9" strokeLinecap="round" />
  </svg>
);
const CourtIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="130" height="96" viewBox="0 0 130 96">
    <path d="M65 6 L124 32 L6 32 Z" fill="none" stroke={color} strokeWidth="8" strokeLinejoin="round" />
    {[24, 50, 76, 102].map((x) => (
      <line key={x} x1={x} y1="42" x2={x} y2="76" stroke={color} strokeWidth="9" strokeLinecap="round" />
    ))}
    <line x1="6" y1="88" x2="124" y2="88" stroke={color} strokeWidth="8" strokeLinecap="round" />
  </svg>
);
const Check: React.FC = () => (
  <svg width="56" height="56" viewBox="0 0 56 56">
    <path d="M8 30 L22 44 L48 12" fill="none" stroke="#0b1220" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ───────────────────────── 1 · Hook ───────────────────────── */
export const SceneHook: React.FC<SceneProps> = ({ sc, t }) => {
  const { frame, fps, lt, cue } = useSc(sc);
  const f = cue("flash");
  const carX = interpolate(lt, [0, f + 0.15, f + 2], [-420, 1010, 1500], {
    easing: Easing.bezier(0.3, 0.1, 0.7, 0.9),
    extrapolateRight: "clamp",
  });
  const flash = interpolate(lt - f, [0, 0.05, 0.6], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleIn = pop(frame, fps, f + 0.45);
  const mirror = ramp(frame, fps, 0.8, 1.4) * (1 - ramp(frame, fps, f - 0.1, f + 0.1));
  return (
    <AbsoluteFillX>
      <Road y={610} h={210} frame={frame} speed={10} />
      <div style={{ position: "absolute", left: carX, top: 650 }}>
        <Car color="#38bdf8" scale={1.25} />
      </div>
      <div style={{ position: "absolute", left: 1450, top: 330 }}>
        <Camera facing="left" scale={1.2} glow={flash} />
      </div>
      {/* rear mirror view */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 180,
          width: 320,
          height: 120,
          borderRadius: 60,
          border: "8px solid #475569",
          background: "linear-gradient(#1e293b,#0f172a)",
          opacity: mirror,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: 20 + (frame % 90) * 0.6, top: 62, width: 90, height: 26, borderRadius: 10, background: "#64748b" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 96, height: 24, background: "#334155" }} />
      </div>
      <Label x={W / 2} y={160} center size={120} o={titleIn} weight={900}>
        {t.title}
      </Label>
      <Label x={W / 2} y={310} center size={52} o={titleIn} color={C.accent}>
        {t.subtitle}
      </Label>
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash * 0.95 }} />
    </AbsoluteFillX>
  );
};

/* ───────────────────────── 2 · Core idea ───────────────────────── */
export const SceneCore: React.FC<SceneProps> = ({ sc, t }) => {
  const { frame, fps, cue } = useSc(sc);
  const cd = cue("dist");
  const ct = cue("time");
  const pSpeed = pop(frame, fps, 0.3);
  const pDist = pop(frame, fps, cd - 0.1);
  const pTime = pop(frame, fps, ct - 0.1);
  const progress = ramp(frame, fps, cd, ct + 2.5, Easing.inOut(Easing.cubic));
  const swp = ramp(frame, fps, ct, ct + 2.5) * 360;
  const trackL = 260;
  const trackR = 1420;
  return (
    <AbsoluteFillX>
      <Label x={W / 2} y={130} center size={110} weight={900} o={pSpeed}>
        <span style={{ color: C.accent }}>{t.speed}</span>
        <span style={{ color: C.dim }}> = </span>
        <span style={{ opacity: 0.35 + 0.65 * Math.min(1, pDist), color: C.wave }}>{t.distance}</span>
        <span style={{ color: C.dim }}> ÷ </span>
        <span style={{ opacity: 0.35 + 0.65 * Math.min(1, pTime), color: C.laser }}>{t.time}</span>
      </Label>
      {/* track */}
      <div style={{ position: "absolute", left: trackL, top: 640, width: trackR - trackL, height: 10, borderRadius: 5, background: "#334155" }} />
      <div style={{ position: "absolute", left: trackL - 40, top: 520, opacity: Math.min(1, pDist) }}>
        <Flag color={C.ok} />
      </div>
      <div style={{ position: "absolute", left: trackR - 40, top: 520, opacity: Math.min(1, pDist) }}>
        <Flag color={C.bad} />
      </div>
      {/* distance bracket */}
      <div
        style={{
          position: "absolute",
          left: trackL,
          top: 700,
          width: (trackR - trackL) * Math.min(1, pDist),
          height: 8,
          borderRadius: 4,
          background: C.wave,
        }}
      />
      <Label x={(trackL + trackR) / 2} y={725} center size={44} color={C.wave} o={Math.min(1, pDist)}>
        {t.distance}
      </Label>
      <div style={{ position: "absolute", left: lerp(progress, trackL - 120, trackR - 250), top: 505 }}>
        <Car scale={0.8} color="#f59e0b" />
      </div>
      <div style={{ position: "absolute", left: W - 420, top: 380, opacity: Math.min(1, pTime), scale: 0.8 + 0.2 * Math.min(1, pTime) }}>
        <Stopwatch size={260} sweep={swp} color={C.laser} />
        <Label x={130} y={275} center size={42} color={C.laser}>
          {t.time}
        </Label>
      </div>
    </AbsoluteFillX>
  );
};

/* ───────────────────────── 3 · Radar ───────────────────────── */
const waveArc = (cx: number, cy: number, r: number, spread = 30) => {
  const a = (spread * Math.PI) / 180;
  const x0 = cx + r * Math.cos(-a);
  const y0 = cy + r * Math.sin(-a);
  const x1 = cx + r * Math.cos(a);
  const y1 = cy + r * Math.sin(a);
  return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
};

const SineWave: React.FC<{ w: number; h: number; wl: number; color: string; phase: number }> = ({
  w,
  h,
  wl,
  color,
  phase,
}) => {
  const pts: string[] = [];
  for (let x = 0; x <= w; x += 4) pts.push(`${x},${h / 2 + (h / 2 - 4) * Math.sin(((x - phase) / wl) * 2 * Math.PI)}`);
  return (
    <svg width={w} height={h}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round" />
    </svg>
  );
};

export const SceneRadar: React.FC<SceneProps> = ({ sc, t }) => {
  const { frame, fps, lt, cue } = useSc(sc);
  const back = cue("back");
  const spd = cue("speed");
  const dop = cue("doppler");
  const camX = 130;
  const lensX = camX + 118 * 1.2 + 20;
  const lensY = 330 + 50 * 1.2 + 22;
  const carX = interpolate(lt, [0, sc.end - sc.start], [1500, 950]);
  const carHit = carX + 20;
  const maxR = carHit - lensX;
  const out = lt < back;
  const rings = [0, 1, 2, 3, 4].map((i) => {
    if (out) {
      const r = (((lt * 420 + i * 150) % maxR) + 20) | 0;
      return { r, o: 0.9 - r / maxR / 1.6, col: C.wave, w: 8 };
    }
    const r = maxR - (((lt - back) * 420 + i * 95) % maxR) + 20;
    return { r, o: 0.9 - (1 - r / maxR) / 1.8, col: C.accent, w: 8 };
  });
  const gaugeP = pop(frame, fps, spd);
  const val = ramp(frame, fps, spd, spd + 1.2, Easing.out(Easing.cubic)) * 68;
  const dopP = pop(frame, fps, back + 0.2);
  const dopLabelP = pop(frame, fps, dop);
  return (
    <AbsoluteFillX>
      <SceneTag text={t.radar} color={C.wave} opacity={pop(frame, fps, 0.1)} />
      <Road y={640} h={200} frame={frame} speed={6} />
      <div style={{ position: "absolute", left: camX, top: 330 }}>
        <Camera facing="right" scale={1.2} color={C.wave} glow={0.6 + 0.4 * Math.sin(lt * 8)} />
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {rings.map((rg, i) => (
          <path key={i} d={waveArc(lensX, lensY, rg.r)} fill="none" stroke={rg.col} strokeWidth={rg.w} strokeLinecap="round" opacity={Math.max(0, rg.o)} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: carX, top: 560 }}>
        <Car scale={1.1} color="#f59e0b" flip />
      </div>
      {/* Doppler card */}
      <div style={{ position: "absolute", left: 560, top: 110, width: 760, opacity: Math.min(1, dopP), translate: `0 ${(1 - Math.min(1, dopP)) * 30}px` }}>
        <Card color={C.wave} style={{ padding: "22px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 150, fontWeight: 800, fontSize: 30, color: C.wave }}>{t.sent}</div>
            <SineWave w={520} h={50} wl={80} color={C.wave} phase={frame * 3} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 14 }}>
            <div style={{ width: 150, fontWeight: 800, fontSize: 30, color: C.accent }}>{t.returned}</div>
            <SineWave w={520} h={50} wl={52} color={C.accent} phase={-frame * 3} />
          </div>
        </Card>
        <div style={{ textAlign: "center", marginTop: 16, opacity: Math.min(1, dopLabelP), fontFamily: FONT }}>
          <Chip color={C.accent} filled size={34}>
            {t.doppler} · {t.shift}
          </Chip>
        </div>
      </div>
      {/* gauge */}
      <div style={{ position: "absolute", left: 1480, top: 140, opacity: Math.min(1, gaugeP), scale: 0.85 + 0.15 * Math.min(1, gaugeP) }}>
        <Gauge value={val} limit={50} max={120} size={320} unit={t.kmh} />
      </div>
      <div style={{ position: "absolute", left: 1370, top: 190, opacity: Math.min(1, gaugeP) }}>
        <LimitSign value={50} size={96} />
      </div>
    </AbsoluteFillX>
  );
};

/* ───────────────────────── 4 · Laser ───────────────────────── */
export const SceneLaser: React.FC<SceneProps> = ({ sc, t }) => {
  const { frame, fps, lt, cue } = useSc(sc);
  const cDist = cue("dist");
  const cFast = cue("fast");
  const dur = sc.end - sc.start;
  const camX = 130;
  const lensX = camX + 118 * 1.2 + 20;
  const lensY = 330 + 50 * 1.2 + 22;
  const carX = interpolate(lt, [0, dur], [1500, 980]);
  const carHit = carX + 24;
  const gap = carHit - lensX;
  // pulses
  const pulses = Array.from({ length: 14 }).map((_, i) => {
    const phase = (lt * 2.2 + i / 14) % 1;
    const x = phase < 0.5 ? lensX + gap * (phase * 2) : carHit - gap * ((phase - 0.5) * 2);
    return { x, back: phase >= 0.5 };
  });
  const meters = Math.round(gap / 11);
  const count = Math.round(ramp(frame, fps, 0.5, dur - 1, Easing.out(Easing.cubic)) * 8400);
  const showDist = pop(frame, fps, cDist - 0.2);
  const gaugeP = pop(frame, fps, cFast - 0.1);
  const val = ramp(frame, fps, cFast, cFast + 1, Easing.out(Easing.cubic)) * 68;
  return (
    <AbsoluteFillX>
      <SceneTag text={t.laser} color={C.laser} opacity={pop(frame, fps, 0.1)} />
      <Road y={640} h={200} frame={frame} speed={6} />
      <div style={{ position: "absolute", left: camX, top: 330 }}>
        <Camera facing="right" scale={1.2} color={C.laser} glow={0.5 + 0.5 * Math.sin(lt * 12)} />
      </div>
      <div style={{ position: "absolute", left: carX, top: 560 }}>
        <Car scale={1.1} color="#f59e0b" flip />
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={lensX} y1={lensY} x2={carHit} y2={lensY + 150} stroke={C.laser} strokeWidth="2" opacity={0.25} />
        {pulses.map((p, i) => {
          const y = lensY + ((p.x - lensX) / gap) * 150;
          return <circle key={i} cx={p.x} cy={y} r={p.back ? 8 : 11} fill={p.back ? "#fda4af" : C.laser} opacity={0.95} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 1090, top: 130, opacity: ramp(frame, fps, 0.4, 1) }}>
        <Card color={C.laser} style={{ minWidth: 520 }}>
          <div style={{ fontSize: 28, color: C.dim, fontWeight: 700 }}>{t.pulses}</div>
          <div style={{ fontSize: 76, fontWeight: 900, color: C.laser }}>{count.toLocaleString("en-US")}</div>
        </Card>
      </div>
      <div style={{ position: "absolute", left: 560, top: 470, opacity: Math.min(1, showDist), scale: 0.9 + 0.1 * Math.min(1, showDist) }}>
        <Chip color={C.accent} size={38} filled>
          {t.distance}: {meters} m
        </Chip>
      </div>
      <div style={{ position: "absolute", left: 1480, top: 400, opacity: Math.min(1, gaugeP), scale: 0.85 + 0.15 * Math.min(1, gaugeP) }}>
        <Gauge value={val} limit={50} max={120} size={300} unit={t.kmh} />
      </div>
    </AbsoluteFillX>
  );
};

/* ───────────────────────── 5 · Road sensors ───────────────────────── */
export const SceneSensors: React.FC<SceneProps> = ({ sc, t }) => {
  const { frame, fps, lt, cue } = useSc(sc);
  const cRoad = cue("road");
  const cTwo = cue("two");
  const cTime = cue("time");
  const dur = sc.end - sc.start;
  const s1 = 620;
  const s2 = 1220;
  const startT = Math.max(0.8, cTwo - 0.3);
  const endT = dur - 0.2;
  const carX = interpolate(lt, [startT, endT], [-340, W + 80], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x1 = s1;
  const x2 = s2;
  // crossing times when car front passes sensors
  const tAt = (x: number) => startT + ((x - 320 + 340) / (W + 80 + 340)) * (endT - startT);
  const tc1 = tAt(x1);
  const tc2 = tAt(x2);
  const timer = lt < tc1 ? 0 : lt < tc2 ? ((lt - tc1) / (tc2 - tc1)) * 0.53 : 0.53;
  const crossed1 = lt >= tc1;
  const crossed2 = lt >= tc2;
  const reveal = ramp(frame, fps, cRoad - 0.2, cRoad + 0.6, Easing.out(Easing.cubic));
  const twoP = pop(frame, fps, cTwo - 0.1);
  const loopP = pop(frame, fps, cRoad + 0.2);
  const formulaP = pop(frame, fps, cTime);
  const Loop: React.FC<{ x: number; on: boolean; label: string }> = ({ x, on, label }) => (
    <>
      <div
        style={{
          position: "absolute",
          left: x - 70,
          top: 635,
          width: 140,
          height: 70,
          borderRadius: 14,
          border: `5px solid ${on ? C.accent : "#64748b"}`,
          background: on ? "rgba(251,191,36,0.28)" : "rgba(100,116,139,0.12)",
          opacity: Math.min(1, loopP),
        }}
      />
      <Label x={x} y={720} center size={30} color={on ? C.accent : C.dim} o={Math.min(1, loopP)}>
        {label}
      </Label>
      <div style={{ position: "absolute", left: x - 5, top: 590, width: 10, height: 45, background: on ? C.accent : "#facc15", opacity: Math.min(1, loopP) * (on ? 0.9 : 0.5) }} />
    </>
  );
  return (
    <AbsoluteFillX>
      <SceneTag text={t.sensors} color={C.accent} opacity={pop(frame, fps, 0.1)} />
      <Road y={400} h={190} frame={frame} speed={0} />
      {/* ground cutaway */}
      <div style={{ position: "absolute", left: 0, top: 590, width: W, height: 190, background: "#241a12", opacity: reveal }} />
      <div style={{ position: "absolute", left: 0, top: 590, width: W, height: 6, background: "#7c5a3a", opacity: reveal }} />
      <Loop x={x1} on={crossed1} label={t.sensor1} />
      <Loop x={x2} on={crossed2} label={t.sensor2} />
      {/* distance bracket */}
      <div style={{ position: "absolute", left: x1, top: 790, width: (x2 - x1) * Math.min(1, twoP), height: 6, background: C.wave, borderRadius: 3 }} />
      <Label x={(x1 + x2) / 2} y={808} center size={34} color={C.wave} o={Math.min(1, twoP)}>
        {t.distance}: 10 m
      </Label>
      <div style={{ position: "absolute", left: carX, top: 305 }}>
        <Car scale={1.1} color="#f59e0b" />
      </div>
      {/* timer + formula */}
      <div style={{ position: "absolute", left: 1330, top: 120, opacity: Math.min(1, twoP) }}>
        <Card color={C.accent} style={{ minWidth: 440, textAlign: "center" }}>
          <div style={{ fontSize: 26, color: C.dim, fontWeight: 700 }}>{t.elapsed}</div>
          <div style={{ fontSize: 88, fontWeight: 900, color: C.accent, fontVariantNumeric: "tabular-nums" }}>{timer.toFixed(2)} {t.sec}</div>
        </Card>
      </div>
      <div style={{ position: "absolute", left: 160, top: 200, opacity: Math.min(1, formulaP), scale: 0.9 + 0.1 * Math.min(1, formulaP) }}>
        <Chip color={C.ok} size={44} filled>
          10 m ÷ 0.53 {t.sec} ≈ 68 {t.kmh}
        </Chip>
      </div>
    </AbsoluteFillX>
  );
};

/* ───────────────────────── 6 · Average speed ───────────────────────── */
export const SceneAverage: React.FC<SceneProps> = ({ sc, t }) => {
  const { frame, fps, lt, cue } = useSc(sc);
  const cA = cue("a");
  const cB = cue("b");
  const cCover = cue("cover");
  const cSlow = cue("slowed");
  const ax = 260;
  const bx = 1500;
  const roadY = 640;
  // car A→B, slows near B
  const travelEnd = Math.max(cCover + 1.5, cB + 1.5);
  const prog = lt < travelEnd ? ramp(frame, fps, cA - 0.2, travelEnd, Easing.inOut(Easing.quad)) : 1;
  const carX = lerp(prog, ax - 200, bx - 340);
  const aP = pop(frame, fps, cA);
  const bP = pop(frame, fps, cB);
  const tooFast = pop(frame, fps, cCover, 10);
  const slowP = pop(frame, fps, cSlow);
  return (
    <AbsoluteFillX>
      <SceneTag text={t.average} color={C.bad} opacity={pop(frame, fps, 0.1)} />
      <Road y={roadY} h={170} frame={frame} speed={0} />
      <div style={{ position: "absolute", left: ax - 40, top: 390 }}>
        <Camera facing="right" scale={0.9} label={t.camA} color={C.wave} glow={Math.min(1, aP) * (1 - ramp(frame, fps, cA + 0.6, cA + 1))} />
      </div>
      <div style={{ position: "absolute", left: bx - 40, top: 390 }}>
        <Camera facing="left" scale={0.9} label={t.camB} color={C.wave} glow={Math.min(1, bP) * (1 - ramp(frame, fps, cB + 0.6, cB + 1))} />
      </div>
      <div style={{ position: "absolute", left: carX, top: 575 }}>
        <Car scale={0.95} color="#f59e0b" plate="AB 12 CDE" />
      </div>
      {/* distance bracket */}
      <div style={{ position: "absolute", left: ax, top: 772, width: bx - ax, height: 6, background: C.dim, opacity: 0.6, borderRadius: 3 }} />
      <Label x={(ax + bx) / 2} y={722} center size={36} color={C.dim}>
        5 km
      </Label>
      {/* plate reads */}
      <div style={{ position: "absolute", left: ax - 100, top: 160, opacity: Math.min(1, aP), scale: 0.85 + 0.15 * Math.min(1, aP) }}>
        <Card color={C.wave} style={{ padding: "16px 26px" }}>
          <div style={{ fontSize: 24, color: C.dim, fontWeight: 700 }}>{t.plateRead}</div>
          <div style={{ fontSize: 44, fontWeight: 900 }}>AB 12 CDE</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: C.wave, fontVariantNumeric: "tabular-nums" }}>10:00:00</div>
        </Card>
      </div>
      <div style={{ position: "absolute", left: bx - 100, top: 160, opacity: Math.min(1, bP), scale: 0.85 + 0.15 * Math.min(1, bP) }}>
        <Card color={C.wave} style={{ padding: "16px 26px" }}>
          <div style={{ fontSize: 24, color: C.dim, fontWeight: 700 }}>{t.plateRead}</div>
          <div style={{ fontSize: 44, fontWeight: 900 }}>AB 12 CDE</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: C.wave, fontVariantNumeric: "tabular-nums" }}>10:03:00</div>
        </Card>
      </div>
      {/* maths + stamp */}
      <div style={{ position: "absolute", left: 600, top: 170, opacity: Math.min(1, tooFast), scale: 0.8 + 0.2 * Math.min(1, tooFast) }}>
        <Card color={C.bad} style={{ textAlign: "center", padding: "20px 34px" }}>
          <div style={{ fontSize: 28, color: C.dim, fontWeight: 700 }}>{t.avgLabel}</div>
          <div style={{ fontSize: 46, fontWeight: 900 }}>5 km ÷ 3 {t.min}</div>
          <div style={{ fontSize: 60, fontWeight: 900, color: C.bad }}>= 100 {t.kmh}</div>
        </Card>
      </div>
      <div style={{ position: "absolute", left: 1130, top: 210, opacity: Math.min(1, tooFast) }}>
        <LimitSign value={70} size={120} />
      </div>
      <div
        style={{
          position: "absolute",
          left: W / 2,
          top: 420,
          translate: "-50% 0",
          rotate: "-8deg",
          opacity: Math.min(1, tooFast),
          scale: 2.2 - 1.2 * Math.min(1, tooFast),
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 120,
          color: C.bad,
          border: `10px solid ${C.bad}`,
          borderRadius: 24,
          padding: "0 36px",
          background: "rgba(11,18,32,0.55)",
          whiteSpace: "nowrap",
        }}
      >
        {t.tooFast}
      </div>
      <div style={{ position: "absolute", left: W / 2, top: 826, translate: "-50% 0", opacity: Math.min(1, slowP), textAlign: "center", fontFamily: FONT, fontWeight: 800 }}>
        <div style={{ fontSize: 34, color: C.accent }}>{t.slowedDown}</div>
        <div style={{ fontSize: 34, color: C.bad, marginTop: 4 }}>{t.stillCaught}</div>
      </div>
    </AbsoluteFillX>
  );
};

/* ───────────────────────── 7 · The photo ───────────────────────── */
export const ScenePhoto: React.FC<SceneProps> = ({ sc, t }) => {
  const { frame, fps, cue } = useSc(sc);
  const cPlate = cue("plate");
  const cTime = cue("time");
  const cSpeed = cue("speed");
  const inP = pop(frame, fps, 0.15, 12);
  const plateP = pop(frame, fps, cPlate);
  const timeP = pop(frame, fps, cTime);
  const speedP = pop(frame, fps, cSpeed);
  return (
    <AbsoluteFillX>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 150,
          width: 1000,
          height: 620,
          borderRadius: 18,
          border: "14px solid #f1f5f9",
          background: "linear-gradient(#273449,#1b2538 55%,#111827 55%)",
          overflow: "hidden",
          rotate: `${-3 + (1 - Math.min(1, inP)) * -8}deg`,
          scale: 0.8 + 0.2 * Math.min(1, inP),
          opacity: Math.min(1, inP),
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ position: "absolute", left: 120, top: 190 }}>
          <Car scale={2.2} color="#f59e0b" plate="AB 12 CDE" />
        </div>
        {/* plate highlight */}
        <div
          style={{
            position: "absolute",
            left: 120 + 124 * 2.2 - 12,
            top: 190 + 82 * 2.2 - 14,
            width: 72 * 2.2 + 24,
            height: 18 * 2.2 + 28,
            border: `6px solid ${C.accent}`,
            borderRadius: 10,
            opacity: Math.min(1, plateP),
            scale: 1.8 - 0.8 * Math.min(1, plateP),
            boxShadow: `0 0 30px ${C.accent}`,
          }}
        />
        <div style={{ position: "absolute", left: 18, bottom: 14, fontFamily: FONT, fontWeight: 800, fontSize: 26, color: "#e2e8f0", opacity: Math.min(1, timeP) }}>
          10:03:12 · {t.place}
        </div>
      </div>
      <Label x={140} y={110} size={34} color={C.dim} o={Math.min(1, inP)}>
        {t.photoTitle}
      </Label>
      <div style={{ position: "absolute", left: 1230, top: 190, width: 540 }}>
        <Card color={C.accent} style={{ opacity: Math.min(1, plateP), translate: `0 ${(1 - Math.min(1, plateP)) * 30}px`, marginBottom: 22 }}>
          <div style={{ fontSize: 26, color: C.dim, fontWeight: 700 }}>{t.plateRead}</div>
          <div style={{ fontSize: 58, fontWeight: 900 }}>AB 12 CDE</div>
        </Card>
        <Card color={C.wave} style={{ opacity: Math.min(1, timeP), translate: `0 ${(1 - Math.min(1, timeP)) * 30}px`, marginBottom: 22 }}>
          <div style={{ fontSize: 26, color: C.dim, fontWeight: 700 }}>{t.when} · {t.where}</div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>10:03:12</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.wave }}>{t.place}</div>
        </Card>
        <Card color={C.bad} style={{ opacity: Math.min(1, speedP), translate: `0 ${(1 - Math.min(1, speedP)) * 30}px` }}>
          <div style={{ fontSize: 26, color: C.dim, fontWeight: 700 }}>{t.speedField} · {t.limit} 70</div>
          <div style={{ fontSize: 76, fontWeight: 900, color: C.bad }}>100 {t.kmh}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.bad }}>+30 {t.overLimit}</div>
        </Card>
      </div>
    </AbsoluteFillX>
  );
};

/* ───────────────────────── 8 · The fine ───────────────────────── */
export const SceneFine: React.FC<SceneProps> = ({ sc, t }) => {
  const { frame, fps, cue } = useSc(sc);
  const pPhoto = pop(frame, fps, 0.2);
  const pOwner = pop(frame, fps, cue("owner") - 0.15);
  const pNotice = pop(frame, fps, cue("notice") - 0.15);
  const pFine = pop(frame, fps, cue("fine") - 0.1);
  const pCourse = pop(frame, fps, cue("course") - 0.1);
  const pPoints = pop(frame, fps, cue("points") - 0.1);
  const pCourt = pop(frame, fps, cue("court") - 0.1);
  const Node: React.FC<{ p: number; icon: React.ReactNode; label: string; color: string }> = ({ p, icon, label, color }) => (
    <div style={{ opacity: Math.min(1, p), scale: 0.8 + 0.2 * Math.min(1, p), width: 380 }}>
      <Card color={color} style={{ textAlign: "center", height: 250, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ height: 100, display: "flex", alignItems: "center" }}>{icon}</div>
        <div style={{ fontSize: 36, fontWeight: 800 }}>{label}</div>
      </Card>
    </div>
  );
  const Arrow: React.FC<{ p: number }> = ({ p }) => (
    <svg width="110" height="40" viewBox="0 0 110 40" style={{ opacity: Math.min(1, p) }}>
      <line x1="4" y1="20" x2={4 + 80 * Math.min(1, p)} y2="20" stroke={C.dim} strokeWidth="8" strokeLinecap="round" />
      <path d="M84 6 L106 20 L84 34" fill="none" stroke={C.dim} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const Outcome: React.FC<{ p: number; label: string; color: string; sub?: string; big: React.ReactNode }> = ({ p, label, color, sub, big }) => (
    <div style={{ opacity: Math.min(1, p), scale: 0.8 + 0.2 * Math.min(1, p), width: 390 }}>
      <Card color={color} style={{ textAlign: "center", height: 230, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
        <div style={{ height: 96, display: "flex", justifyContent: "center", alignItems: "center" }}>{big}</div>
        <div style={{ fontSize: 34, fontWeight: 800 }}>{label}</div>
        {sub ? <div style={{ fontSize: 24, fontWeight: 700, color: C.dim }}>{sub}</div> : <div style={{ fontSize: 24 }}>&nbsp;</div>}
      </Card>
    </div>
  );
  return (
    <AbsoluteFillX>
      <div style={{ position: "absolute", left: 180, top: 110, display: "flex", alignItems: "center", gap: 20 }}>
        <Node p={pPhoto} icon={<PhotoIcon />} label={t.photo} color={C.wave} />
        <Arrow p={pOwner} />
        <Node p={pOwner} icon={<Magnifier />} label={t.owner} color={C.accent} />
        <Arrow p={pNotice} />
        <Node p={pNotice} icon={<Envelope />} label={t.notice} color={C.ok} />
      </div>
      <svg width={W} height={140} style={{ position: "absolute", left: 0, top: 380, opacity: Math.min(1, pFine) }}>
        <path d="M1525 0 L1525 50 L400 50" stroke={C.dim} strokeWidth="6" fill="none" opacity={0.5} />
        {[400, 800, 1200, 1500].map((x, i) => (
          <path key={i} d={`M${x} 50 L${x} 120 M${x - 14} 104 L${x} 124 L${x + 14} 104`} stroke={C.dim} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 200, top: 540, display: "flex", gap: 36 }}>
        <Outcome p={pFine} big={<Banknote color={C.accent} />} label={t.fine} color={C.accent} />
        <Outcome p={pCourse} big={<BookIcon color={C.ok} />} label={t.course} color={C.ok} />
        <Outcome p={pPoints} big={<Badge color={C.bad} />} label={t.points} color={C.bad} sub={t.seriousCases} />
        <Outcome p={pCourt} big={<CourtIcon color={C.laser} />} label={t.court} color={C.laser} sub={t.seriousCases} />
      </div>
    </AbsoluteFillX>
  );
};

/* ───────────────────────── 9 · Wrap-up ───────────────────────── */
export const SceneWrap: React.FC<SceneProps> = ({ sc, t }) => {
  const { frame, fps, cue } = useSc(sc);
  const cMagic = cue("magic");
  const cMaths = cue("maths");
  const cWatch = cue("watch");
  const pMagic = pop(frame, fps, Math.max(0.1, cMagic - 0.6));
  const strike = ramp(frame, fps, cMagic + 0.3, cMagic + 0.9);
  const pMaths = pop(frame, fps, cMaths - 0.1);
  const pWatch = pop(frame, fps, cWatch);
  const val = interpolate(ramp(frame, fps, cWatch - 0.2, cWatch + 1.2, Easing.inOut(Easing.cubic)), [0, 1], [68, 46]);
  return (
    <AbsoluteFillX>
      <Label x={W / 2} y={170} center size={96} weight={900} o={Math.min(1, pMagic)} color={C.dim}>
        <span style={{ position: "relative" }}>
          {t.magic}
          <span style={{ position: "absolute", left: 0, top: "52%", height: 10, width: `${strike * 100}%`, background: C.bad, borderRadius: 5 }} />
        </span>
      </Label>
      <Label x={W / 2} y={310} center size={120} weight={900} o={Math.min(1, pMaths)} color={C.accent}>
        {t.maths}
      </Label>
      <Label x={W / 2} y={470} center size={64} weight={800} o={Math.min(1, pMaths)} color={C.text}>
        v = d ÷ t
      </Label>
      <div style={{ position: "absolute", left: W / 2 - 560, top: 600, opacity: Math.min(1, pWatch), scale: 0.85 + 0.15 * Math.min(1, pWatch) }}>
        <Gauge value={val} limit={50} max={120} size={260} unit={t.kmh} />
      </div>
      <div style={{ position: "absolute", left: W / 2 - 240, top: 650, opacity: Math.min(1, pWatch) }}>
        <Chip color={C.ok} size={64} filled>
          <Check /> {t.watch}
        </Chip>
      </div>
    </AbsoluteFillX>
  );
};

/** Absolute-fill wrapper that doesn't need the `AbsoluteFill` import in every scene. */
function AbsoluteFillX({ children }: { children: React.ReactNode }) {
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>{children}</div>;
}
