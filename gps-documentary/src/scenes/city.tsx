import React from "react";
import { random } from "remotion";
import { MapView } from "../components/MapView";
import { Space, SpaceDefs } from "../components/Space";
import { useShot } from "../components/context";
import { ACCENT, INK, MINT, MONO, MUTED, WARN, glass, Overlay } from "../components/Hud";
import { add, clamp01, cross, dot, easeInOut, easeOutCubic, len, lerp, lookAt, mul, norm, project, smoothstep, sub, type Cam, type Pt, type V3 } from "../engine/math3d";
import { HEIGHT, WIDTH } from "../timeline";
import { analyse, buildCity, findReflection, firstHit, RECEIVER, skyline, skyPlotSats, type Box, type SatCity } from "./cityModel";
import { Card, Sat2D, Scene2D } from "./kit";

const CITY = buildCity("c");
const THETA = 36;
const SATC = analyse(CITY, THETA);
const GOLD = "#ffc85c";
const REFL = "#ff9d4a";
const SUNDIR: V3 = norm([-0.45, -0.7, 0.6]);

const cityCam = (pos: V3, target: V3, fov = 42): Cam => ({ ...lookAt(pos, target, [0, 0, 1], fov, WIDTH, HEIGHT), near: 0.5 });
const mixV3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// ───────────────────────────────────────────── city drawing
const faceQuads = (b: Box): { n: V3; q: V3[] }[] => [
  { n: [1, 0, 0], q: [[b.x1, b.y0, 0], [b.x1, b.y1, 0], [b.x1, b.y1, b.h], [b.x1, b.y0, b.h]] },
  { n: [-1, 0, 0], q: [[b.x0, b.y1, 0], [b.x0, b.y0, 0], [b.x0, b.y0, b.h], [b.x0, b.y1, b.h]] },
  { n: [0, 1, 0], q: [[b.x1, b.y1, 0], [b.x0, b.y1, 0], [b.x0, b.y1, b.h], [b.x1, b.y1, b.h]] },
  { n: [0, -1, 0], q: [[b.x0, b.y0, 0], [b.x1, b.y0, 0], [b.x1, b.y0, b.h], [b.x0, b.y0, b.h]] },
  { n: [0, 0, 1], q: [[b.x0, b.y0, b.h], [b.x1, b.y0, b.h], [b.x1, b.y1, b.h], [b.x0, b.y1, b.h]] },
];

export const CityLayer: React.FC<{ cam: Cam; highlight?: { box: Box; wall: string } | null; glowA?: number }> = ({ cam, highlight, glowA = 0 }) => {
  const order = [...CITY].sort((a, b) => {
    const da = len(sub([(a.x0 + a.x1) / 2, (a.y0 + a.y1) / 2, a.h / 2], cam.pos));
    const db = len(sub([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, b.h / 2], cam.pos));
    return db - da;
  });
  const out: React.ReactNode[] = [];
  order.forEach((b, bi) => {
    const centre: V3 = [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, b.h / 2];
    if (len(sub(centre, cam.pos)) > 900) return;
    faceQuads(b).forEach((f, fi) => {
      const fc = f.q.reduce((a, p) => add(a, mul(p, 0.25)), [0, 0, 0] as V3);
      if (dot(f.n, sub(cam.pos, fc)) <= 0) return;
      const ps = f.q.map((p) => project(cam, p));
      if (ps.some((p) => !p.ok)) return;
      const lit = 0.38 + 0.62 * Math.max(0, dot(f.n, SUNDIR));
      const base = f.n[2] > 0 ? [38, 70, 118] : [22, 46, 86];
      const col = `rgb(${Math.round(base[0] * lit * 1.5)},${Math.round(base[1] * lit * 1.5)},${Math.round(base[2] * lit * 1.5)})`;
      const hot = highlight && highlight.box === b && ((highlight.wall === "x1" && f.n[0] === 1) || (highlight.wall === "x0" && f.n[0] === -1) || (highlight.wall === "y1" && f.n[1] === 1) || (highlight.wall === "y0" && f.n[1] === -1));
      const pts = ps.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
      out.push(<polygon key={`${bi}-${fi}`} points={pts} fill={hot ? "#2c5f9a" : col} stroke={hot ? REFL : "#3a6aa8"} strokeWidth={hot ? 3 : 0.8} strokeLinejoin="round" opacity={hot ? 1 : 0.96} />);
      // lit windows: dashed floor lines on tall visible side faces
      if (f.n[2] === 0) {
        const bottom = [ps[0], ps[1]];
        const top = [ps[3], ps[2]];
        const pxH = Math.abs(bottom[0].y - top[0].y);
        const pxW = Math.hypot(bottom[1].x - bottom[0].x, bottom[1].y - bottom[0].y);
        if (pxH > 40 && pxW > 20) {
          const rows = Math.min(14, Math.floor(b.h / 8));
          const warm = 0.25 + random(`w${bi}${fi}`) * 0.4;
          for (let r = 1; r < rows; r++) {
            const k = r / rows;
            const x0 = lerp(bottom[0].x, top[0].x, k), y0 = lerp(bottom[0].y, top[0].y, k);
            const x1 = lerp(bottom[1].x, top[1].x, k), y1 = lerp(bottom[1].y, top[1].y, k);
            out.push(<line key={`w${bi}-${fi}-${r}`} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#ffcf7a" strokeWidth={Math.min(16, Math.max(1, pxH / rows * 0.3))} strokeDasharray={`${Math.min(22, pxW * 0.045)} ${Math.min(16, pxW * 0.03)}`} opacity={warm * (0.5 + 0.5 * random(`wr${bi}${fi}${r}`)) * (pxH > 500 ? 0.55 : 1)} />);
          }
        }
      }
    });
  });
  return <g>{out}{glowA > 0 ? null : null}</g>;
};

const Ground: React.FC<{ cam: Cam }> = ({ cam }) => {
  const quads: React.ReactNode[] = [];
  const P = 96;
  const q = (x0: number, y0: number, x1: number, y1: number, fill: string, key: string) => {
    const ps = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => project(cam, [x, y, 0]));
    if (ps.some((p) => !p.ok)) return;
    quads.push(<polygon key={key} points={ps.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} fill={fill} />);
  };
  q(-900, -900, 900, 900, "#050d1c", "g");
  for (let i = -4; i <= 4; i++) { q(i * P - 12, -700, i * P + 12, 700, "#0b1a33", `sx${i}`); q(-700, i * P - 12, 700, i * P + 12, "#0b1a33", `sy${i}`); }
  return <g>{quads}</g>;
};

const Receiver: React.FC<{ cam: Cam; pulse?: number; color?: string }> = ({ cam, pulse = 0, color = MINT }) => {
  const a = project(cam, [RECEIVER[0], RECEIVER[1], 0]);
  const b = project(cam, [RECEIVER[0], RECEIVER[1], 14]);
  if (!a.ok || !b.ok) return null;
  return (
    <g>
      <ellipse cx={a.x} cy={a.y} rx={34 + 30 * pulse} ry={(34 + 30 * pulse) * 0.45} fill="none" stroke={color} strokeWidth={2.4} opacity={1 - pulse} />
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={4} filter="url(#glow)" />
      <circle cx={b.x} cy={b.y} r={11} fill="#fff" /><circle cx={b.x} cy={b.y} r={26} fill={color} opacity={0.3} filter="url(#blur6)" />
    </g>
  );
};

const Line3D: React.FC<{ cam: Cam; a: V3; b: V3; color: string; w?: number; dash?: string; o?: number; head?: number }> = ({ cam, a, b, color, w = 3, dash, o = 1, head }) => {
  const pa = project(cam, a), pb = project(cam, b);
  if (!pa.ok || !pb.ok) return null;
  const x1 = head !== undefined ? lerp(pa.x, pb.x, head) : pb.x;
  const y1 = head !== undefined ? lerp(pa.y, pb.y, head) : pb.y;
  return (
    <g opacity={o}>
      <line x1={pa.x} y1={pa.y} x2={x1} y2={y1} stroke={color} strokeWidth={w * 3} opacity={0.22} strokeLinecap="round" />
      <line x1={pa.x} y1={pa.y} x2={x1} y2={y1} stroke={color} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round" filter="url(#glow)" />
      {head !== undefined && head < 1 && <circle cx={x1} cy={y1} r={7} fill="#fff" />}
    </g>
  );
};

const CityStage: React.FC<{ cam: Cam; children?: React.ReactNode; overlay?: React.ReactNode; highlight?: { box: Box; wall: string } | null }> = ({ cam, children, overlay, highlight }) => {
  const { frame } = useShot();
  return (
    <>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
        <SpaceDefs />
        <defs>
          <linearGradient id="citySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#02040b" /><stop offset="0.55" stopColor="#081735" /><stop offset="1" stopColor="#12335f" /></linearGradient>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#citySky)" />
        <Space zoom={0} frame={frame} />
        <rect width={WIDTH} height={HEIGHT} fill="url(#citySky)" opacity={0.35} />
        <Ground cam={cam} />
        <CityLayer cam={cam} highlight={highlight} />
        {children}
      </svg>
      {overlay && <Overlay>{overlay}</Overlay>}
    </>
  );
};

const FAR = 650;
const satPoint = (s: SatCity): V3 => add(RECEIVER, mul(s.dir, FAR));

// ───────────────────────────────────────────── s37 into the city
export const S37: React.FC = () => {
  const { t, p } = useShot();
  const e = easeInOut(p);
  const cam = cityCam(mixV3([-300, -380, 330], [-95, -165, 40], e), mixV3([0, 0, 40], [0, 10, 46], e), 44);
  return <CityStage cam={cam}><Receiver cam={cam} pulse={(t * 0.7) % 1} /></CityStage>;
};

// ───────────────────────────────────────────── s38 blocked
export const S38: React.FC = () => {
  const { t, p } = useShot();
  const cam = cityCam(mixV3([-50, -72, 12], [-38, -58, 14], easeInOut(p)), [4, 24, 42], 46);
  const a = smoothstep(0.1, 0.4, p);
  return (
    <CityStage cam={cam} overlay={
      <div style={{ position: "absolute", left: 96, top: 150, display: "flex", flexDirection: "column", gap: 10 }}>
        {SATC.map((s) => (
          <div key={s.id} style={{ ...glass, padding: "10px 20px", width: 330, display: "flex", alignItems: "center", gap: 14, opacity: a, borderColor: s.visible ? `${MINT}88` : `${WARN}88` }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: s.color }} />
            <span style={{ fontSize: 21, fontWeight: 650, width: 90 }}>{s.name}</span>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, color: s.visible ? MINT : WARN }}>{s.visible ? "CLEAR" : "BLOCKED"}</span>
          </div>
        ))}
      </div>
    }>
      {SATC.map((s, i) => {
        const far = satPoint(s);
        const end: V3 = s.visible || !s.hit ? RECEIVER : add(RECEIVER, mul(s.dir, s.hit.t));
        const q = easeOutCubic(clamp01((p * 1.4 - i * 0.12) / 0.5));
        const stop = mixV3(far, end, q);
        const hitP = project(cam, end);
        return (
          <g key={s.id}>
            <Line3D cam={cam} a={far} b={stop} color={s.visible ? s.color : WARN} w={s.visible ? 3.4 : 2.6} o={s.visible ? 1 : 0.85} />
            {!s.visible && q > 0.95 && hitP.ok && (
              <g transform={`translate(${hitP.x} ${hitP.y})`}>
                <circle r={26 + 6 * Math.sin(t * 8)} fill={WARN} opacity={0.25} filter="url(#blur6)" />
                <line x1={-12} y1={-12} x2={12} y2={12} stroke={WARN} strokeWidth={5} strokeLinecap="round" /><line x1={12} y1={-12} x2={-12} y2={12} stroke={WARN} strokeWidth={5} strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      })}
      <Receiver cam={cam} pulse={(t * 0.7) % 1} />
    </CityStage>
  );
};

// ───────────────────────────────────────────── s39 sky plot
const MASK = skyline(CITY, 4);
const SKY = skyPlotSats(CITY, THETA);
export const S39: React.FC = () => {
  const { p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const cx = 960, cy = 500, Rr = 310;
  const rOf = (el: number) => ((Math.PI / 2 - el) / (Math.PI / 2)) * Rr;
  const xy = (az: number, el: number): [number, number] => [cx + rOf(el) * Math.sin(az), cy - rOf(el) * Math.cos(az)];
  const maskPts = MASK.map((m) => xy(m.az, m.el));
  const vis = SKY.filter((s) => s.visible).length;
  return (
    <Scene2D overlay={
      <Card x={1230} y={170} w={520} title="SKY PLOT · SATELLITES YOU CAN SEE" color={ACCENT} opacity={a(0.08)}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 14 }}><span style={{ fontFamily: MONO, fontSize: 64, fontWeight: 700, color: vis >= 4 ? MINT : WARN }}>{Math.round(vis * smoothstep(0.3, 0.6, p) + (SKY.length - vis) * (1 - smoothstep(0.3, 0.6, p)) * 0)}</span><span style={{ fontSize: 24, color: MUTED }}>of {SKY.length} above the horizon</span></div>
        <div style={{ fontSize: 19, color: MUTED, marginTop: 8 }}>the rest hide behind buildings. The city carves away the sky.</div>
      </Card>
    }>
      <circle cx={cx} cy={cy} r={Rr} fill="#06101f" stroke="#6fd6ff" strokeWidth={2} />
      {[30, 60].map((e) => <circle key={e} cx={cx} cy={cy} r={rOf((e * Math.PI) / 180)} fill="none" stroke="#6fd6ff" strokeWidth={1} strokeDasharray="3 8" opacity={0.4} />)}
      {[0, 90, 180, 270].map((az) => <line key={az} x1={cx} y1={cy} x2={cx + Rr * Math.sin((az * Math.PI) / 180)} y2={cy - Rr * Math.cos((az * Math.PI) / 180)} stroke="#6fd6ff" strokeWidth={1} opacity={0.3} />)}
      {[["N", 0], ["E", 90], ["S", 180], ["W", 270]].map(([l, az]) => <text key={l as string} x={cx + (Rr + 28) * Math.sin(((az as number) * Math.PI) / 180)} y={cy - (Rr + 28) * Math.cos(((az as number) * Math.PI) / 180) + 8} textAnchor="middle" fill={MUTED} fontSize={22} fontWeight={700} fontFamily="Inter, sans-serif">{l}</text>)}
      <path d={`M${cx - Rr} ${cy} A${Rr} ${Rr} 0 1 0 ${cx + Rr} ${cy} A${Rr} ${Rr} 0 1 0 ${cx - Rr} ${cy} Z M${maskPts.map((q) => q.map((v) => v.toFixed(1)).join(" ")).join("L")} Z`} fill="#2a0e14" opacity={0.9 * a(0.15)} fillRule="evenodd" stroke={WARN} strokeWidth={0} />
      <path d={`M${maskPts.map((q) => q.map((v) => v.toFixed(1)).join(" ")).join("L")} Z`} fill="none" stroke={WARN} strokeWidth={2.4} opacity={a(0.15)} filter="url(#glow)" />
      {SKY.map((s, i) => {
        const [x, y] = xy(s.az, s.el);
        const o = a(0.05 + i * 0.015);
        return s.visible ? (
          <g key={s.id} opacity={o}><circle cx={x} cy={y} r={20} fill={s.color} opacity={0.3} filter="url(#blur6)" /><circle cx={x} cy={y} r={9} fill="#fff" stroke={s.color} strokeWidth={3} /></g>
        ) : (
          <g key={s.id} opacity={o * (1 - 0.45 * a(0.4))}><circle cx={x} cy={y} r={9} fill="none" stroke={MUTED} strokeWidth={2.2} /><line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} stroke={WARN} strokeWidth={2.4} /><line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} stroke={WARN} strokeWidth={2.4} /></g>
        );
      })}
    </Scene2D>
  );
};

// ───────────────────────────────────────────── s40 bouncing signals
const REF_SAT = SATC.find((s) => !s.visible && s.refl && s.refl.extra < 30) ?? SATC[3];
export const S40: React.FC = () => {
  const { t, p } = useShot();
  const cam = cityCam(mixV3([-62, -48, 22], [-50, -30, 26], easeInOut(p)), [0, 4, 20], 48);
  const s = REF_SAT;
  const W = s.refl ? s.refl.W : RECEIVER;
  const far = satPoint(s);
  const direct = easeOutCubic(clamp01(p / 0.22));
  const bounce = clamp01((p - 0.28) / 0.35);
  const a = smoothstep(0.55, 0.75, p);
  const extra = s.refl ? s.refl.extra : 0;
  const hitD = s.hit ? add(RECEIVER, mul(s.dir, s.hit.t)) : RECEIVER;
  const wP = project(cam, W);
  return (
    <CityStage cam={cam} highlight={s.refl ? { box: s.refl.box, wall: s.refl.wall } : null} overlay={
      <div style={{ position: "absolute", left: 96, top: 150, ...glass, padding: "18px 26px", width: 520, opacity: a, borderColor: `${REFL}88` }}>
        <div style={{ fontSize: 13.5, letterSpacing: 3.2, fontWeight: 700, color: REFL }}>REFLECTED SIGNAL</div>
        <div style={{ fontFamily: MONO, fontSize: 46, fontWeight: 700, marginTop: 8 }}>+{extra.toFixed(0)} m longer</div>
        <div style={{ fontSize: 19, color: MUTED, marginTop: 6 }}>the direct path is blocked, so only the bounce arrives</div>
      </div>
    }>
      {/* the direct path stops at a building */}
      <Line3D cam={cam} a={far} b={hitD} color={WARN} w={2.4} dash="8 10" o={0.65 * direct} head={undefined} />
      {/* satellite → wall → phone */}
      <Line3D cam={cam} a={far} b={W} color={REFL} w={3.2} head={clamp01(bounce * 2)} />
      {bounce > 0.5 && <Line3D cam={cam} a={W} b={RECEIVER} color={REFL} w={3.2} head={clamp01((bounce - 0.5) * 2)} />}
      {wP.ok && bounce > 0.5 && <circle cx={wP.x} cy={wP.y} r={22 + 8 * Math.sin(t * 8)} fill="none" stroke={REFL} strokeWidth={3} opacity={0.9} />}
      <Receiver cam={cam} pulse={(t * 0.7) % 1} />
    </CityStage>
  );
};

// ───────────────────────────────────────────── s41 arriving late, and the fix drifts
export const S41: React.FC = () => {
  const { t, p } = useShot();
  const a = (at: number) => smoothstep(at, at + 0.12, p);
  const s = REF_SAT;
  const extra = s.refl ? s.refl.extra : 10;
  const ns = extra / 0.299792458;
  const x0 = 190, x1 = 960;
  const tx = (v: number) => lerp(x0, x1, v / (ns * 1.6));
  const slide = easeOutCubic(clamp01((p - 0.25) / 0.4));
  const d = norm([-s.dir[0], -s.dir[1], 0]);
  const shift = easeInOut(clamp01((p - 0.55) / 0.3)) * extra * 1.3;
  return (
    <Scene2D overlay={
      <>
        <Card x={150} y={160} w={900} title="WHEN DOES THE SIGNAL ARRIVE?" color={REFL} opacity={a(0.04)}>
          <div style={{ position: "relative", height: 300, marginTop: 14 }}>
            <svg width={860} height={300}>
              <line x1={40} y1={220} x2={820} y2={220} stroke={MUTED} strokeWidth={2} />
              <text x={820} y={256} textAnchor="end" fill={MUTED} fontSize={17} fontFamily="Inter, sans-serif">time →</text>
              <g opacity={0.8}>
                <line x1={tx(0) - 150} y1={60} x2={tx(0) - 150} y2={220} stroke={MINT} strokeWidth={4} strokeDasharray="8 8" />
                <text x={tx(0) - 140} y={52} fill={MINT} fontSize={20} fontWeight={700} fontFamily="Inter, sans-serif">direct path (blocked)</text>
                <text x={tx(0) - 140} y={82} fill={MUTED} fontSize={17} fontFamily="Inter, sans-serif">would arrive here</text>
              </g>
              <line x1={tx(ns * slide) - 150} y1={120} x2={tx(ns * slide) - 150} y2={220} stroke={REFL} strokeWidth={6} filter="url(#glow)" />
              <text x={tx(ns * slide) - 138} y={140} fill={REFL} fontSize={20} fontWeight={700} fontFamily="Inter, sans-serif" opacity={slide}>reflected: {ns.toFixed(0)} ns late</text>
              <g opacity={slide}><line x1={tx(0) - 150} y1={190} x2={tx(ns) - 150} y2={190} stroke="#fff" strokeWidth={2.4} /><line x1={tx(0) - 150} y1={182} x2={tx(0) - 150} y2={198} stroke="#fff" strokeWidth={2.4} /><line x1={tx(ns) - 150} y1={182} x2={tx(ns) - 150} y2={198} stroke="#fff" strokeWidth={2.4} /></g>
            </svg>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 30, marginTop: 4, opacity: a(0.45) }}>{ns.toFixed(0)} ns × 299,792 km/s ≈ <span style={{ color: REFL }}>{extra.toFixed(0)} m</span> of range error</div>
        </Card>
        <div style={{ position: "absolute", left: 1090, top: 160, width: 680, height: 560, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(150,205,255,0.25)", opacity: a(0.3) }}>
          <svg width={680} height={560}>
            <MapView w={680} h={560} zoom={9} cx={0} cy={0} dot={{ mx: 0, my: 0, show: 1, pulse: (t * 0.9) % 1, acc: 20 }} ghost={{ mx: d[0] * shift, my: -d[1] * shift, show: smoothstep(0.55, 0.7, p) }} />
          </svg>
        </div>
        <div style={{ position: "absolute", left: 1090, top: 740, width: 680, fontSize: 21, color: MUTED, opacity: a(0.7) }}><span style={{ color: WARN, fontWeight: 700 }}>●</span> where the phone thinks it is &nbsp;&nbsp;<span style={{ color: "#4a8cff", fontWeight: 700 }}>●</span> where you really are</div>
      </>
    }>
      <g />
    </Scene2D>
  );
};
export { findReflection, firstHit, cross, Sat2D };
