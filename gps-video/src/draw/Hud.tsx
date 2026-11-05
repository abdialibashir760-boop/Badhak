import React from "react";
import { C_KM_S, PHONE } from "../geo";
import { clamp01, easeOutCubic, smoothstep, type Cam } from "../math3d";
import { SATS, slantRange, travelMs } from "../orbit";
import { BEAT, HEIGHT, WIDTH } from "../timing";
import { MINT, pinAnchor } from "./Marker";

const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'DejaVu Sans Mono', 'SF Mono', Menlo, Consolas, monospace";
const INK = "#eaf4ff";
const MUTED = "#9db9d9";
const ACCENT = "#6fd6ff";
const MARGIN = 96;

const glass: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(14,26,46,0.72), rgba(6,12,24,0.62))",
  border: "1px solid rgba(150,205,255,0.2)",
  borderRadius: 18,
  boxShadow: "0 18px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
  backdropFilter: "blur(14px)",
};

const STEPS = [
  { from: 0, to: BEAT.transmit, head: "24+ satellites circle the Earth", sub: "20,189 km up · one lap every 11 h 58 min" },
  { from: BEAT.transmit, to: BEAT.receive, head: "Each one broadcasts its position and the time", sub: "Radio waves at 1575.42 MHz, travelling at the speed of light" },
  { from: BEAT.receive, to: BEAT.lock, head: "The phone times every signal", sub: "distance = speed of light × travel time" },
  { from: BEAT.lock, to: BEAT.end + 1, head: "Three distances meet at one point: you", sub: "A 4th satellite corrects the phone's clock error" },
];

const stepOpacity = (t: number, from: number, to: number, last: boolean) => {
  const a = smoothstep(from + 0.05, from + 0.4, t);
  const b = last ? 1 : 1 - smoothstep(to - 0.3, to - 0.02, t);
  return Math.min(a, b);
};

const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export const Hud: React.FC<{ cam: Cam; t: number }> = ({ cam, t }) => {
  const stepIdx = STEPS.findIndex((s) => t >= s.from && t < s.to);
  const intro = smoothstep(0.1, 0.7, t);

  // ---- range readout panel (live values from the simulated geometry)
  const panelA = smoothstep(4.3, 4.8, t);
  const rows = SATS.map((s) => {
    const a = clamp01((t - s.arrive) / 0.7);
    const k = easeOutCubic(a);
    const km = slantRange(s, t);
    return { s, a, km: km * k, ms: travelMs(km) * k };
  });

  // ---- fix card
  const L = t - BEAT.lock;
  const cardA = easeOutCubic(clamp01((L - 0.3) / 0.5));
  const pin = pinAnchor(cam);
  const cardX = Math.min(WIDTH - MARGIN - 380, pin.x + 330);
  const cardY = 352;

  const fadeIn = 1 - smoothstep(0, 0.22, t);
  const fadeOut = smoothstep(BEAT.end - 0.22, BEAT.end, t);

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT, color: INK, fontVariantNumeric: "tabular-nums" }}>
      {/* legibility scrims */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 420, background: "linear-gradient(to top, rgba(2,5,12,0.82), rgba(2,5,12,0))" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 520, background: "radial-gradient(ellipse 60% 55% at 0% 0%, rgba(2,5,12,0.66), rgba(2,5,12,0) 100%)" }} />
      {/* vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />

      {/* title */}
      <div style={{ position: "absolute", left: MARGIN, top: 70, opacity: intro, transform: `translateY(${(1 - intro) * 10}px)` }}>
        <div style={{ fontSize: 15, letterSpacing: 4, fontWeight: 600, color: ACCENT }}>TECHNOLOGY EXPLAINED</div>
        <div style={{ fontSize: 36, fontWeight: 650, letterSpacing: -0.4, marginTop: 8 }}>How GPS locates your phone</div>
      </div>

      {/* captions */}
      <div style={{ position: "absolute", left: MARGIN, bottom: 84, width: 1200 }}>
        {STEPS.map((s, i) => {
          const o = stepOpacity(t, s.from, s.to, i === STEPS.length - 1);
          if (o <= 0.01) return null;
          return (
            <div key={i} style={{ position: "absolute", left: 0, bottom: 34, opacity: o, transform: `translateY(${(1 - o) * 14}px)`, width: 1200 }}>
              <div style={{ fontSize: 50, fontWeight: 650, letterSpacing: -0.8, lineHeight: 1.08, textShadow: "0 2px 30px rgba(0,0,0,0.7)" }}>{s.head}</div>
              <div style={{ fontSize: 25, color: MUTED, marginTop: 12, fontWeight: 450, textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>{s.sub}</div>
            </div>
          );
        })}
        {/* progress rail */}
        <div style={{ display: "flex", gap: 8, position: "absolute", left: 0, bottom: 0 }}>
          {STEPS.map((_, i) => {
            const fill = i < stepIdx ? 1 : i === stepIdx ? clamp01((t - STEPS[i].from) / (Math.min(STEPS[i].to, BEAT.end) - STEPS[i].from)) : 0;
            return (
              <div key={i} style={{ width: 64, height: 4, borderRadius: 2, background: "rgba(150,200,255,0.2)", overflow: "hidden" }}>
                <div style={{ width: `${fill * 100}%`, height: "100%", background: i === 3 ? MINT : ACCENT }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* range panel */}
      {panelA > 0.01 && (
        <div style={{ position: "absolute", right: MARGIN, top: 70, width: 470, padding: "20px 24px 18px", opacity: panelA, transform: `translateX(${(1 - panelA) * 24}px)`, ...glass }}>
          <div style={{ fontSize: 13.5, letterSpacing: 3.2, fontWeight: 600, color: ACCENT, display: "flex", justifyContent: "space-between" }}>
            <span>SIGNAL TRAVEL TIME</span>
            <span style={{ color: MUTED, letterSpacing: 1.2, fontWeight: 500 }}>one way</span>
          </div>
          <div style={{ marginTop: 14 }}>
            {rows.map(({ s, a, km, ms }) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", height: 40, opacity: 0.45 + 0.55 * a }}>
                <span style={{ width: 11, height: 11, borderRadius: 6, background: s.color, boxShadow: `0 0 12px ${s.color}`, marginRight: 14, opacity: 0.35 + 0.65 * a }} />
                <span style={{ width: 82, fontSize: 19, fontWeight: 600 }}>{s.name}</span>
                <span style={{ width: 130, fontFamily: MONO, fontSize: 19, color: a > 0 ? INK : MUTED }}>{a > 0 ? `${fmt(ms, 1)} ms` : "— — —"}</span>
                <span style={{ flex: 1, textAlign: "right", fontFamily: MONO, fontSize: 19, color: a > 0 ? s.color : MUTED }}>{a > 0 ? `${fmt(km)} km` : "waiting"}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, paddingTop: 12, borderTop: "1px solid rgba(150,205,255,0.16)", fontSize: 16, color: MUTED, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: MONO }}>d = c × Δt</span>
            <span style={{ fontFamily: MONO }}>c = {fmt(C_KM_S)} km/s</span>
          </div>
        </div>
      )}

      {/* position fix card + leader */}
      {cardA > 0.01 && pin.ok && (
        <>
          <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0, opacity: cardA }}>
            <path d={`M${pin.x + 40} ${pin.y - 110} L${cardX - 30} ${cardY + 100} L${cardX} ${cardY + 100}`} stroke={MINT} strokeWidth={1.4} opacity={0.7} fill="none" />
            <circle cx={pin.x + 40} cy={pin.y - 110} r={3.5} fill={MINT} />
          </svg>
          <div style={{ position: "absolute", left: cardX, top: cardY, width: 380, padding: "20px 26px 22px", opacity: cardA, transform: `translateY(${(1 - cardA) * 14}px)`, ...glass, border: "1px solid rgba(125,255,192,0.45)", boxShadow: "0 18px 50px rgba(0,0,0,0.45), 0 0 40px rgba(125,255,192,0.14), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, letterSpacing: 3.2, fontWeight: 700, color: MINT }}>
              <span style={{ width: 9, height: 9, borderRadius: 5, background: MINT, boxShadow: `0 0 12px ${MINT}` }} />
              POSITION FIX
            </div>
            <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, marginTop: 14, letterSpacing: -0.5 }}>{fmt(PHONE.lat, 4)}° N</div>
            <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, marginTop: 2, letterSpacing: -0.5 }}>{fmt(PHONE.lon, 4)}° E</div>
            <div style={{ marginTop: 12, fontSize: 16.5, color: MUTED }}>Typical accuracy ≈ 5 m, open sky</div>
          </div>
        </>
      )}

      {/* footnote */}
      <div style={{ position: "absolute", right: MARGIN, bottom: 40, fontSize: 13.5, color: MUTED, opacity: 0.6, letterSpacing: 0.3 }}>
        Time-lapse · satellites and phone enlarged · coastlines: Natural Earth
      </div>

      {/* fades */}
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: Math.max(fadeIn, fadeOut) }} />
    </div>
  );
};
