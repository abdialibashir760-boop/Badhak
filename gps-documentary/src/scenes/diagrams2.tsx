import React from "react";
import { random } from "remotion";
import { clamp01, easeInOut, easeOutCubic, lerp, lookAt, pathD, project, projectRuns, smoothstep, type V3 } from "../engine/math3d";
import { MapView } from "../components/MapView";
import { useShot } from "../components/context";
import { ACCENT, INK, MINT, MONO, MUTED, WARN, glass } from "../components/Hud";
import { Card, ClockFace, GroundArc, Mono, Note, Phone2D, Sat2D, Scene2D, groundY } from "./kit";
import { HEIGHT, WIDTH } from "../timeline";

const GOLD = "#ffc85c";
const VIOLET = "#c39bff";
const PINK = "#ff7ab8";

// ───────────────────────────────────────────────────────── s23 Einstein's correction
export const S23: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const cam = lookAt([0, -1050, 470], [0, 0, -70], [0, 0, 1], 32, WIDTH, HEIGHT);
  const h = (r: number) => -240 / Math.pow(1 + (r / 120) ** 2, 0.7);
  const rings = Array.from({ length: 14 }, (_, i) => 30 + i * 36);
  const ringPath = (r: number) => pathD(projectRuns(cam, Array.from({ length: 73 }, (_, k) => { const th = (k / 72) * Math.PI * 2; return [r * Math.cos(th), r * Math.sin(th), h(r)] as V3; })));
  const spokes = Array.from({ length: 28 }, (_, i) => {
    const th = (i / 28) * Math.PI * 2;
    return pathD(projectRuns(cam, Array.from({ length: 30 }, (_, k) => { const r = 12 + (k / 29) * 480; return [r * Math.cos(th), r * Math.sin(th), h(r)] as V3; })));
  });
  const earth = project(cam, [0, 0, h(0) + 26]);
  const sat = project(cam, [-330, 40, h(-330) + 80]);
  const ground = project(cam, [0, 0, h(0) + 120]);
  const net = 38 * smoothstep(0.3, 0.8, p);
  return (
    <Scene2D grid={0.04} overlay={
      <>
        <Card x={1230} y={170} w={540} title="CLOCKS RUN AT DIFFERENT SPEEDS" color={VIOLET} opacity={a(0.12)}>
          {[["weaker gravity at altitude", "+45 µs/day", MINT], ["orbital speed", "−7 µs/day", WARN]].map(([k, v, c]) => (
            <div key={k as string} style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 22 }}><span style={{ color: MUTED }}>{k}</span><span style={{ fontFamily: MONO, color: c as string }}>{v}</span></div>
          ))}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(150,205,255,0.18)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 18, letterSpacing: 3, fontWeight: 700, color: GOLD }}>NET (approx.)</span>
            <span style={{ fontFamily: MONO, fontSize: 40, fontWeight: 700 }}>+{Math.round(net)} µs/day</span>
          </div>
        </Card>
        <div style={{ position: "absolute", left: 110, top: 770, width: 760, fontSize: 24, color: MUTED, opacity: a(0.5) }}>Engineers adjust the satellite clocks for this before launch, and receivers correct the rest. (Dial speeds exaggerated.)</div>
      </>
    }>
      <g opacity={a(0.0) * 0.9 + 0.1}>
        {rings.map((r, i) => <path key={i} d={ringPath(r)} fill="none" stroke={VIOLET} strokeWidth={1.3} opacity={0.35 + 0.4 * (1 - i / 14)} />)}
        {spokes.map((d, i) => <path key={i} d={d} fill="none" stroke="#6fd6ff" strokeWidth={0.9} opacity={0.28} />)}
      </g>
      {earth.ok && <g><circle cx={earth.x} cy={earth.y} r={58} fill="url(#kitEarth)" /><circle cx={earth.x} cy={earth.y} r={60} fill="none" stroke="#8fdcff" strokeWidth={2} opacity={0.8} /></g>}
      {earth.ok && <ClockFace cx={earth.x - 330} cy={earth.y - 70} r={64} turns={(t * 0.12) % 1} color={ACCENT} ticks={12} label="" />}
      {sat.ok && <><Sat2D x={sat.x} y={sat.y} s={0.5} rot={20} glow={0.7} /><ClockFace cx={sat.x + 10} cy={sat.y + 150} r={64} turns={(t * 0.12 * 1.2) % 1} color={GOLD} ticks={12} /></>}
      {earth.ok && <text x={earth.x - 330} y={earth.y + 28} textAnchor="middle" fill={INK} fontSize={20} fontFamily="Inter, sans-serif" fontWeight={650} letterSpacing={2}>GROUND CLOCK</text>}
      {sat.ok && <text x={sat.x + 10} y={sat.y + 248} textAnchor="middle" fill={INK} fontSize={20} fontFamily="Inter, sans-serif" fontWeight={650} letterSpacing={2}>SATELLITE CLOCK</text>}
      
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s24 the phone's own clock
export const S24: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.14, p);
  return (
    <Scene2D overlay={
      <>
        <div style={{ position: "absolute", left: 250, top: 770, width: 480, textAlign: "center", opacity: a(0.1) }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 3, color: GOLD }}>SATELLITE</div>
          <div style={{ fontSize: 20, color: MUTED, marginTop: 6 }}>atomic clock · known and corrected</div>
        </div>
        <div style={{ position: "absolute", left: 1190, top: 770, width: 480, textAlign: "center", opacity: a(0.35) }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 3, color: WARN }}>YOUR PHONE</div>
          <div style={{ fontSize: 20, color: MUTED, marginTop: 6 }}>quartz clock · small, unknown error</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", opacity: a(0.65), fontFamily: MONO, fontSize: 34, color: "#fff" }}>so the phone treats its clock error <span style={{ color: MINT }}>b</span> as one more unknown</div>
      </>
    }>
      <ClockFace cx={490} cy={470} r={200} turns={(t * 0.1) % 1} color={GOLD} opacity={a(0.0) * 0.9 + 0.1} />
      <g opacity={a(0.3)}>
        <ClockFace cx={1430} cy={470} r={200} turns={(t * 0.1 + Math.sin(t * 1.7) * 0.025) % 1} color={WARN} />
        <text x={1430} y={400} textAnchor="middle" fill="#fff" fontSize={170} fontWeight={700} fontFamily="Inter, sans-serif" opacity={0.18 + 0.1 * Math.sin(t * 3)}>?</text>
        <polygon points="1430,330 1470,350 1470,390 1430,410 1390,390 1390,350" fill="none" stroke={WARN} strokeWidth={3} opacity={0.7} transform="translate(0 220) scale(0.6) translate(954 220)" />
      </g>
      <text x={960} y={490} textAnchor="middle" fill={MUTED} fontSize={64} fontFamily={MONO} opacity={a(0.3)}>≠</text>
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s25 TRILATERATION title
export const S25: React.FC = () => {
  const { t, p } = useShot();
  const a = easeOutCubic(clamp01(p / 0.5));
  const b = easeOutCubic(clamp01((p - 0.2) / 0.5));
  const cols = [ACCENT, VIOLET, GOLD];
  const centres: [number, number][] = [[860, 400], [1060, 400], [960, 560]];
  const r = 190 + 14 * Math.sin(t * 2);
  return (
    <Scene2D grid={0.05}>
      {centres.map(([x, y], i) => (
        <g key={i} opacity={a}>
          <circle cx={x} cy={y} r={r * a} fill={cols[i]} opacity={0.07} />
          <circle cx={x} cy={y} r={r * a} fill="none" stroke={cols[i]} strokeWidth={4} filter="url(#glow)" />
        </g>
      ))}
      <circle cx={960} cy={455} r={14 * b} fill="#fff" filter="url(#glow)" />
      <circle cx={960} cy={455} r={40 * b} fill="none" stroke={MINT} strokeWidth={2} opacity={0.7} />
      <text x={960} y={860} textAnchor="middle" fill="#fff" fontSize={96} fontWeight={750} fontFamily="Inter, sans-serif" letterSpacing={14 - 8 * b} opacity={b}>TRILATERATION</text>
      <text x={960} y={920} textAnchor="middle" fill={ACCENT} fontSize={24} letterSpacing={8} fontWeight={600} fontFamily="Inter, sans-serif" opacity={b}>POSITION FROM DISTANCES ALONE</text>
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s32 1 ms = 300 km
export const S32: React.FC = () => {
  const { p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const rows: [string, string, string, number, string][] = [
    ["1 millisecond", "≈ 300 km", "a cheap clock can easily drift this much", 1, WARN],
    ["1 microsecond", "≈ 300 m", "still useless for navigation", 0.55, GOLD],
    ["1 nanosecond", "≈ 30 cm", "the level GPS has to work at", 0.2, MINT],
  ];
  return (
    <Scene2D overlay={
      <>
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 22, letterSpacing: 6, fontWeight: 700, color: ACCENT, opacity: a(0.02) }}>WHY THE PHONE'S CLOCK MATTERS</div>
        {rows.map(([k, v, note, w, c], i) => {
          const o = a(0.1 + i * 0.22);
          return (
            <div key={k} style={{ position: "absolute", left: 300, top: 260 + i * 200, width: 1320, opacity: o, transform: `translateX(${(1 - o) * -30}px)` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
                <span style={{ fontSize: 44, fontWeight: 700, width: 380 }}>{k}</span>
                <span style={{ fontFamily: MONO, fontSize: 60, fontWeight: 700, color: c }}>{v}</span>
              </div>
              <div style={{ height: 14, marginTop: 14, width: `${Math.max(w * 100 * o, 2)}%`, borderRadius: 7, background: `linear-gradient(90deg, ${c}, ${c}33)`, boxShadow: `0 0 24px ${c}66` }} />
              <div style={{ fontSize: 20, color: MUTED, marginTop: 8 }}>{note}</div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontFamily: MONO, fontSize: 28, color: MUTED, opacity: a(0.8) }}>299,792 km/s × error in seconds = range error</div>
      </>
    }>
      <g />
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s34 four equations, four unknowns
export const S34: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.1, p);
  const rowsC = [ACCENT, VIOLET, GOLD, PINK];
  const unk = [["x", ACCENT], ["y", VIOLET], ["z", GOLD], ["b", MINT]] as const;
  return (
    <Scene2D overlay={
      <>
        <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontSize: 22, letterSpacing: 6, fontWeight: 700, color: ACCENT, opacity: a(0.02) }}>FOUR MEASUREMENTS</div>
        <div style={{ position: "absolute", left: 250, top: 230, width: 1420 }}>
          {rowsC.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, height: 106, opacity: a(0.08 + i * 0.1), transform: `translateX(${(1 - a(0.08 + i * 0.1)) * -30}px)` }}>
              <span style={{ width: 16, height: 16, borderRadius: 8, background: c, boxShadow: `0 0 16px ${c}` }} />
              <span style={{ fontFamily: MONO, fontSize: 50, fontWeight: 600 }}>
                <span style={{ color: c }}>ρ{["₁", "₂", "₃", "₄"][i]}</span> = |<span style={{ color: c }}>S{["₁", "₂", "₃", "₄"][i]}</span> − <span style={{ color: "#fff" }}>X</span>| + c·<span style={{ color: MINT }}>b</span>
              </span>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 250, top: 700, display: "flex", gap: 22, alignItems: "center", opacity: a(0.55) }}>
          <span style={{ fontSize: 24, color: MUTED, width: 270 }}>unknowns to solve</span>
          {unk.map(([k, c], i) => {
            const on = smoothstep(0.6 + i * 0.06, 0.66 + i * 0.06, p);
            return <span key={k} style={{ fontFamily: MONO, fontSize: 64, fontWeight: 700, color: c, width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 20, border: `2px solid ${c}`, background: `${c}${on > 0.5 ? "22" : "08"}`, boxShadow: on > 0.5 ? `0 0 28px ${c}66` : "none", opacity: 0.35 + 0.65 * on }}>{k}</span>;
          })}
          <span style={{ fontSize: 22, color: MUTED, marginLeft: 20, lineHeight: 1.4 }}>X = (x, y, z) your position<br />b = your clock error</span>
        </div>
        <div style={{ position: "absolute", left: 250, top: 870, fontSize: 21, color: MUTED, opacity: a(0.8) }}>Satellite positions S₁…S₄ come from each broadcast. More satellites means more equations and a better fix.</div>
      </>
    }>
      <g />
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s36 the fix on the map
export const S36: React.FC = () => {
  const { t, p } = useShot();
  const zoom = lerp(3.4, 7, easeInOut(clamp01(p / 0.9)));
  const pulse = (t * 1.1) % 1;
  const a = smoothstep(0.1, 0.35, p);
  return (
    <>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
        <MapView w={WIDTH} h={HEIGHT} zoom={zoom} cx={0} cy={0} dot={{ mx: 0, my: 0, show: easeOutCubic(clamp01(p / 0.25)), pulse, acc: 34 + zoom * 2.2 }} dim={0.1} />
        <rect width={WIDTH} height={HEIGHT} fill="url(#vig)" />
        <defs><radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.6} /></radialGradient></defs>
      </svg>
      <div style={{ position: "absolute", left: 96, top: 150, ...glass, padding: "18px 26px", opacity: a, color: INK, fontFamily: "Inter, sans-serif" }}>
        <div style={{ fontSize: 13.5, letterSpacing: 3.2, fontWeight: 700, color: MINT }}>YOUR SCREEN</div>
        <div style={{ fontSize: 30, fontWeight: 650, marginTop: 8 }}>Blue dot + accuracy circle</div>
        <div style={{ fontSize: 18, color: MUTED, marginTop: 6 }}>typically within about 5 m under open sky</div>
      </div>
    </>
  );
};

// ───────────────────────────────────────────────────────── s42 / s43 satellite geometry (DOP)
type V2 = [number, number];
function clip(poly: V2[], n: V2, d: number): V2[] {
  const out: V2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const fa = n[0] * a[0] + n[1] * a[1] - d, fb = n[0] * b[0] + n[1] * b[1] - d;
    if (fa <= 0) out.push(a);
    if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) { const k = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
  }
  return out;
}

const Dop: React.FC<{ angles: number[]; color: string; title: string; verdict: string }> = ({ angles, color, title, verdict }) => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const cx = 960, cy = 560, W = 24;
  let poly: V2[] = [[-700, -700], [700, -700], [700, 700], [-700, 700]];
  const dirs = angles.map((deg) => [Math.cos((deg * Math.PI) / 180), -Math.sin((deg * Math.PI) / 180)] as V2);
  dirs.forEach((u) => { poly = clip(poly, u, W); poly = clip(poly, [-u[0], -u[1]], W); });
  const worst = Math.max(...poly.map(([x, y]) => Math.hypot(x, y))) / W;
  const reveal = a(0.45);
  const shown = poly.map(([x, y]) => [cx + x * reveal, cy + y * reveal]);
  return (
    <Scene2D grid={0.05} overlay={
      <>
        <div style={{ position: "absolute", left: 96, top: 150, ...glass, padding: "16px 26px", opacity: a(0.02) }}>
          <div style={{ fontSize: 13.5, letterSpacing: 3.2, fontWeight: 700, color }}>{title}</div>
          <div style={{ fontSize: 26, fontWeight: 650, marginTop: 6 }}>{angles.length} satellites, seen from above</div>
        </div>
        <div style={{ position: "absolute", right: 96, top: 150, ...glass, padding: "18px 28px", opacity: a(0.55), borderColor: `${color}88` }}>
          <div style={{ fontSize: 13.5, letterSpacing: 3.2, fontWeight: 700, color }}>POSITION UNCERTAINTY</div>
          <div style={{ fontFamily: MONO, fontSize: 64, fontWeight: 700, marginTop: 6 }}>×{worst.toFixed(1)}</div>
          <div style={{ fontSize: 18, color: MUTED }}>{verdict}</div>
        </div>
      </>
    }>
      <circle cx={cx} cy={cy} r={330} fill="none" stroke="#6fd6ff" strokeWidth={1.2} strokeDasharray="3 9" opacity={0.4} />
      <circle cx={cx} cy={cy} r={180} fill="none" stroke="#6fd6ff" strokeWidth={1} strokeDasharray="3 9" opacity={0.25} />
      {dirs.map((u, i) => {
        const nx = -u[1], ny = u[0];
        return (
          <g key={i} opacity={a(0.08 + i * 0.08)}>
            <polygon points={`${cx + nx * 700 + u[0] * W},${cy + ny * 700 + u[1] * W} ${cx - nx * 700 + u[0] * W},${cy - ny * 700 + u[1] * W} ${cx - nx * 700 - u[0] * W},${cy - ny * 700 - u[1] * W} ${cx + nx * 700 - u[0] * W},${cy + ny * 700 - u[1] * W}`} fill={color} opacity={0.12} />
            <line x1={cx + u[0] * 330} y1={cy + u[1] * 330} x2={cx} y2={cy} stroke={color} strokeWidth={1.4} strokeDasharray="4 8" opacity={0.6} />
            <Sat2D x={cx + u[0] * 360} y={cy + u[1] * 360} s={0.28} rot={(Math.atan2(u[1], u[0]) * 180) / Math.PI + 90} color={color} glow={0.6} />
          </g>
        );
      })}
      <polygon points={shown.map((q) => q.join(",")).join(" ")} fill={color} opacity={0.35} stroke={color} strokeWidth={3} filter="url(#glow)" />
      <circle cx={cx} cy={cy} r={6} fill="#fff" />
      <g transform={`translate(${cx} ${cy + 1})`} opacity={0}><circle r={1} /></g>
      <text x={960} y={1000} textAnchor="middle" fill={MUTED} fontSize={20} fontFamily="Inter, sans-serif" opacity={a(0.7)}>bands = ranging error · where they overlap is where you might be · {Math.round(t) >= 0 ? "" : ""}</text>
    </Scene2D>
  );
};
export const S42: React.FC = () => <Dop angles={[58, 72, 84]} color={WARN} title="BUNCHED TOGETHER" verdict="circles cross at a shallow angle: error stretches" />;
export const S43: React.FC = () => <Dop angles={[20, 110, 200, 290]} color={MINT} title="WELL SPREAD" verdict="circles cross cleanly: error stays small" />;

// ───────────────────────────────────────────────────────── s44 atmosphere
export const S44: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const sx = 330, sy = 190, px = 1500, py = groundY(1500) - 8;
  const mid = (f: number): [number, number] => [lerp(sx, px, f), lerp(sy, py, f)];
  // path bends slightly inside the layers
  const path = Array.from({ length: 41 }, (_, i) => { const f = i / 40; const [x, y] = mid(f); const bend = Math.exp(-((f - 0.72) ** 2) / 0.006) * 26 + Math.exp(-((f - 0.93) ** 2) / 0.0015) * 18; return [x - bend * 0.5, y + bend] as V2; });
  const q = clamp01((p - 0.1) / 0.75);
  const dots = Array.from({ length: 30 }, (_, i) => { const f = ((((i / 30 + t * 0.12) % 1) + 1) % 1); const slow = f > 0.62 ? 0.55 : 1; return f * slow; });
  return (
    <Scene2D overlay={
      <>
        <Card x={110} y={150} w={500} title="ATMOSPHERIC DELAY" color={VIOLET} opacity={a(0.08)}>
          <div style={{ marginTop: 14, fontSize: 26, fontWeight: 650 }}>The signal slows and bends</div>
          <Note style={{ marginTop: 8 }}>so it arrives a little late, and the satellite looks a little farther away.</Note>
        </Card>
        <div style={{ position: "absolute", left: 980, top: 560, fontSize: 20, fontWeight: 700, letterSpacing: 2, color: VIOLET, opacity: a(0.3) }}>IONOSPHERE · roughly 60–1,000 km up</div>
        <div style={{ position: "absolute", left: 1010, top: 760, fontSize: 20, fontWeight: 700, letterSpacing: 2, color: ACCENT, opacity: a(0.4) }}>TROPOSPHERE · weather, up to ~12 km</div>
        <div style={{ position: "absolute", right: 96, bottom: 150, fontSize: 16, color: MUTED }}>layers not to scale</div>
      </>
    }>
      <GroundArc cy={1650} ry={900} />
      {/* layers */}
      <ellipse cx={960} cy={1650} rx={1700 + 330} ry={900 + 330} fill="none" stroke={VIOLET} strokeWidth={2} opacity={0.35 * a(0.25)} />
      <ellipse cx={960} cy={1650} rx={1700 + 150} ry={900 + 150} fill="none" stroke={VIOLET} strokeWidth={1.4} opacity={0.25 * a(0.25)} />
      <path d={`M${960 - 2030} 1650 A2030 1230 0 0 1 ${960 + 2030} 1650 L${960 + 1850} 1650 A1850 1050 0 0 0 ${960 - 1850} 1650 Z`} fill={VIOLET} opacity={0.1 * a(0.25)} />
      <path d={`M${960 - 1790} 1650 A1790 990 0 0 1 ${960 + 1790} 1650 L${960 + 1700} 1650 A1700 900 0 0 0 ${960 - 1700} 1650 Z`} fill={ACCENT} opacity={0.18 * a(0.3)} />
      <Sat2D x={sx} y={sy} s={0.65} rot={35} glow={1} />
      <polyline points={path.map((q2) => q2.join(",")).join(" ")} fill="none" stroke={ACCENT} strokeWidth={2.4} strokeDasharray="4 9" opacity={0.7} />
      {dots.map((f, i) => { const idx = Math.max(0, Math.min(40, Math.floor(f * 40))); const [x, y] = path[idx]; return <circle key={i} cx={x} cy={y} r={f > 0.62 ? 6 : 4.5} fill={f > 0.62 ? VIOLET : "#fff"} opacity={0.9 * smoothstep(0, 0.1, f) * a(0.1)} />; })}
      <Phone2D x={px} y={py - 70} s={1.0} glow={0.8} />
      <circle cx={mid(q)[0]} cy={mid(q)[1]} r={12} fill="#fff" filter="url(#glow)" opacity={0} />
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s45 inside the phone
export const S45: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const ex = easeInOut(clamp01(p / 0.5));
  const layers: { name: string; color: string; fill: string }[] = [
    { name: "glass", color: "#9db4dc", fill: "rgba(120,170,255,0.16)" },
    { name: "display", color: "#6fd6ff", fill: "#071a2b" },
    { name: "battery", color: "#7dffc0", fill: "#0f2a22" },
    { name: "mainboard", color: "#ffc85c", fill: "#1d1a0c" },
    { name: "back", color: "#9db4dc", fill: "#10151f" },
  ];
  const gap = 78 * ex;
  const cx = 470, cy = 470;
  const iso = (x: number, y: number, z: number): [number, number] => [cx + (x - y) * 0.86, cy + (x + y) * 0.45 - z];
  const slab = (z: number, c: string, f: string, k: number, label: string, extra?: React.ReactNode) => {
    const hw = 130, hl = 215;
    const pts = [iso(-hw, -hl, z), iso(hw, -hl, z), iso(hw, hl, z), iso(-hw, hl, z)].map((q) => q.join(",")).join(" ");
    return (
      <g key={label} opacity={0.35 + 0.65 * k}>
        <polygon points={pts} fill={f} stroke={c} strokeWidth={2.4} strokeLinejoin="round" />
        {extra}
      </g>
    );
  };
  const boardZ = (3 - 2) * gap;
  const chip = [iso(-30, -90, boardZ), iso(40, -90, boardZ), iso(40, -30, boardZ), iso(-30, -30, boardZ)];
  const ant: [number, number][] = [[-100, 170], [-100, 130], [-60, 130], [-60, 170], [-20, 170], [-20, 130], [20, 130]].map(([x, y]) => iso(x, y, boardZ));
  const ping = (t * 0.8) % 1;
  return (
    <Scene2D overlay={
      <>
        <Card x={1130} y={150} w={640} title="TWO SMALL PIECES THAT MATTER" color={ACCENT} opacity={a(0.3)}>
          <div style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "baseline" }}><span style={{ width: 14, height: 14, borderRadius: 7, background: MINT }} /><span style={{ fontSize: 26, fontWeight: 650 }}>Antenna</span><span style={{ fontSize: 20, color: MUTED }}>tiny, so faint signals are easy to miss</span></div>
          <div style={{ display: "flex", gap: 16, marginTop: 14, alignItems: "baseline" }}><span style={{ width: 14, height: 14, borderRadius: 7, background: GOLD }} /><span style={{ fontSize: 26, fontWeight: 650 }}>GNSS chip</span><span style={{ fontSize: 20, color: MUTED }}>measures the timing of each signal</span></div>
        </Card>
        <Card x={1130} y={430} w={640} title="LISTENING ON TWO FREQUENCIES" color={VIOLET} opacity={a(0.6)}>
          <Mono size={34} style={{ marginTop: 16 }}>L1  1575.42 MHz</Mono>
          <Mono size={34} color={VIOLET}>L5  1176.45 MHz</Mono>
          <Note style={{ marginTop: 10 }}>comparing the two reveals how much the ionosphere delayed the signal.</Note>
        </Card>
      </>
    }>
      {layers.map((l, i) => slab((4 - i) * gap - 2 * gap, l.color, l.fill, 1, l.name, i === 3 ? (
        <g>
          <polygon points={chip.map((q) => q.join(",")).join(" ")} fill="#2a2208" stroke={GOLD} strokeWidth={3} filter="url(#glow)" />
          <polyline points={ant.map((q) => q.join(",")).join(" ")} fill="none" stroke={MINT} strokeWidth={3} filter="url(#glow)" />
          <polyline points={[iso(20, 130, boardZ), iso(5, -30, boardZ)].map((q) => q.join(",")).join(" ")} fill="none" stroke={MINT} strokeWidth={2} strokeDasharray="4 6" />
        </g>
      ) : undefined))}
      {ex > 0.6 && <g opacity={a(0.4)}>
        <polyline points={`${iso(5, -60, boardZ)[0] + 30},${iso(5, -60, boardZ)[1]} 780,${iso(5, -60, boardZ)[1] - 40} 960,${iso(5, -60, boardZ)[1] - 40}`} fill="none" stroke={GOLD} strokeWidth={1.4} />
        <text x={790} y={iso(5, -60, boardZ)[1] - 52} fill={GOLD} fontSize={20} fontWeight={700} fontFamily="Inter, sans-serif" letterSpacing={2}>GNSS RECEIVER CHIP</text>
        <polyline points={`${ant[3][0] + 14},${ant[3][1]} 780,${ant[3][1] + 70} 960,${ant[3][1] + 70}`} fill="none" stroke={MINT} strokeWidth={1.4} />
        <text x={790} y={ant[3][1] + 58} fill={MINT} fontSize={20} fontWeight={700} fontFamily="Inter, sans-serif" letterSpacing={2}>ANTENNA</text>
      </g>}
      {[0, 1, 2].map((i) => { const f = (ping + i / 3) % 1; return <circle key={i} cx={ant[3][0]} cy={ant[3][1]} r={10 + 70 * f} fill="none" stroke={MINT} strokeWidth={2} opacity={(1 - f) * 0.7 * a(0.3)} />; })}
    </Scene2D>
  );
};

// ───────────────────────────────────────────────────────── s46 GPS is not Wi-Fi / cell
export const S46: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const hint = (i: number) => ((t * 0.6 + i / 3) % 1);
  void hint;
  return (
    <Scene2D overlay={
      <>
        <div style={{ position: "absolute", left: 130, top: 190, width: 560, textAlign: "center", opacity: a(0.1) }}>
          <div style={{ fontSize: 22, letterSpacing: 4, fontWeight: 700, color: GOLD }}>NETWORK CLUES</div>
          <div style={{ fontSize: 22, color: MUTED, marginTop: 6 }}>Wi-Fi networks · mobile towers</div>
          <div style={{ display: "inline-block", marginTop: 14, padding: "8px 18px", borderRadius: 10, border: `1px solid ${WARN}`, color: WARN, fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>NOT GPS</div>
        </div>
        <div style={{ position: "absolute", left: 1230, top: 190, width: 560, textAlign: "center", opacity: a(0.4) }}>
          <div style={{ fontSize: 22, letterSpacing: 4, fontWeight: 700, color: MINT }}>GPS</div>
          <div style={{ fontSize: 22, color: MUTED, marginTop: 6 }}>signals from satellites only</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", opacity: a(0.7) }}>
          <div style={{ fontSize: 34, fontWeight: 650 }}>Your phone blends them for speed and indoors,</div>
          <div style={{ fontSize: 34, fontWeight: 650, color: MINT }}>but the satellite signals are the GPS.</div>
        </div>
      </>
    }>
      {/* wifi */}
      <g transform="translate(300 420)" opacity={a(0.1)}>
        {[1, 2, 3].map((i) => <path key={i} d={`M${-i * 36} ${-i * 12 - 20} A${i * 46} ${i * 46} 0 0 1 ${i * 36} ${-i * 12 - 20}`} fill="none" stroke={GOLD} strokeWidth={9} strokeLinecap="round" opacity={0.4 + 0.2 * i} />)}
        <circle cy={26} r={12} fill={GOLD} />
      </g>
      {/* tower */}
      <g transform="translate(540 470)" opacity={a(0.18)} stroke={GOLD} strokeWidth={6} strokeLinecap="round" fill="none">
        <line x1={0} y1={-130} x2={-50} y2={90} /><line x1={0} y1={-130} x2={50} y2={90} /><line x1={-34} y1={-10} x2={34} y2={-10} /><line x1={-42} y1={50} x2={42} y2={50} />
        <circle cy={-140} r={12} fill={GOLD} />
      </g>
      {/* satellite */}
      <Sat2D x={1500} y={430} s={1.0} rot={20} color={MINT} glow={1} />
      {/* hints into phone */}
      {[0, 1, 2].map((i) => { const f = hint(i); return <circle key={i} cx={lerp(420, 900, f)} cy={lerp(450, 540, f)} r={6} fill={GOLD} opacity={Math.sin(Math.PI * f) * a(0.3)} />; })}
      {[0, 1, 2].map((i) => { const f = hint(i); return <circle key={i} cx={lerp(1440, 1020, f)} cy={lerp(470, 540, f)} r={8} fill="#fff" opacity={Math.sin(Math.PI * f) * a(0.45)} filter="url(#glow)" />; })}
      <line x1={420} y1={450} x2={900} y2={540} stroke={GOLD} strokeWidth={2} strokeDasharray="4 10" opacity={0.4 * a(0.3)} />
      <line x1={1440} y1={470} x2={1020} y2={540} stroke={MINT} strokeWidth={3} opacity={0.6 * a(0.45)} />
      <Phone2D x={960} y={560} s={1.2} glow={0.9}>
        <circle r={14 + 5 * Math.sin(t * 4)} cy={6} fill="#3b8cff" /><circle r={6} cy={6} fill="#fff" />
      </Phone2D>
    </Scene2D>
  );
};
export { random };
