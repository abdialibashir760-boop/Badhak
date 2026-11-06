import React from "react";
import { Easing } from "remotion";
import { DEG, R_EARTH, R_ORBIT, latLonToVec, PHONE } from "../engine/geo";
import { add, addScaled, basisFrom, clamp01, cross, easeInOut, easeOutCubic, len, lerp, mul, norm, pathD, project, projectRuns, smoothstep, sub, type Cam, type V3 } from "../engine/math3d";
import { camFromPose, dive, mixPose, poseAt, poseNear, poseWide, type Pose } from "../engine/cam";
import { CONSTELLATION, OMEGA, PHONE_POS, PHONE_UP, PLANE_COLORS, SATS, SUN, T_REF, satAt, satPos, type Sat } from "../engine/world";
import { Earth } from "../components/Earth";
import { Space, SpaceDefs } from "../components/Space";
import { FacesSvg, MiniSat, OrbitRing, Satellite, satDepthOrder, satFaces, FONT } from "../components/SatModel";
import { Beams, Cones, GlowGroup, RangeCircles, ReceptionPulse, rangeCircle, onSurfaceVisible, WAVE_SPEED, type ConeSpec } from "../components/Signals";
import { PhoneBase } from "../components/Phone3D";
import { Marker, MINT, pinAnchor } from "../components/Marker";
import { AltitudeHud, Callout, Callout3D, INK, MONO, MUTED, Overlay, Stat, glass, ACCENT } from "../components/Hud";
import { useShot } from "../components/context";
import { HEIGHT, WIDTH } from "../timeline";

// Shared poses -------------------------------------------------------------
export const WIDE = poseWide(25, 20, 67000, 20);
export const NEAR = poseNear(35, 1250, 640);
export const NEAR_END = poseNear(49, 1140, 570);
/** Orbit clock that keeps the four phone-sky satellites near their design positions. */
const orbitClock = (t: number, rate = 0.6) => T_REF + (t - 5) * rate;
const satsAt = (orbitT: number) => SATS.map((sat) => ({ sat, S: satPos(sat, orbitT) }));
const EASE_OUT = Easing.bezier(0.5, 0, 0.2, 1);
const EASE_PULL = Easing.bezier(0.45, 0.05, 0.2, 1);

type StageProps = { pose: Pose; zoom?: number; dots?: boolean; dim?: number; children: (c: { cam: Cam; D: number; frame: number; t: number; p: number }) => React.ReactNode; overlay?: (c: { cam: Cam; D: number }) => React.ReactNode };
/** Space + Earth + whatever the shot draws on top, in one SVG; optional HTML overlay. */
export const Stage: React.FC<StageProps> = ({ pose, zoom = 0, dots = true, dim = 0, children, overlay }) => {
  const { cam, D } = camFromPose(pose);
  const sh = useShot();
  return (
    <>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
        <SpaceDefs />
        <Space zoom={zoom} frame={sh.frame} />
        <Earth cam={cam} D={D} dots={dots} />
        {dim > 0 && <rect width={WIDTH} height={HEIGHT} fill="#02040b" opacity={dim} />}
        {children({ cam, D, frame: sh.frame, t: sh.t, p: sh.p })}
      </svg>
      {overlay && <Overlay>{overlay({ cam, D })}</Overlay>}
    </>
  );
};

const SatLayer: React.FC<{ cam: Cam; items: { sat: Sat; S: V3; label?: [string, string]; emit?: number }[]; opacity?: number; labelOpacity?: number; size?: number }> = ({ cam, items, opacity = 1, labelOpacity = 0, size = 1 }) => (
  <>
    {satDepthOrder(cam, items).map((it) => (
      <Satellite key={it.sat.id} sat={it.sat} S={it.S} cam={cam} opacity={opacity} labelOpacity={labelOpacity} label={it.label} emit={it.emit ?? 0} size={size} />
    ))}
  </>
);

const altOf = (cam: Cam) => len(cam.pos) - R_EARTH;

// ─────────────────────────────────────────────────────────────── s04
/** Break through the screen: from the phone on the ground out to orbit; satellites appear on the way. */
export const S04: React.FC = () => {
  const { t, p } = useShot();
  const e = EASE_PULL(p);
  const pose = dive(1 - e, NEAR, WIDE);
  const items = satsAt(orbitClock(t, 1)).map((x) => ({ ...x, label: [x.sat.name, "ALT 20,189 km"] as [string, string] }));
  return (
    <Stage pose={pose} zoom={e * 0.8} overlay={({ cam }) => (
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}><AltitudeHud altKm={altOf(cam)} opacity={smoothstep(0.05, 0.2, p)} /></svg>
    )}>
      {({ cam, D }) => (
        <>
          {SATS.map((s) => <OrbitRing key={s.id} cam={cam} sat={s} orbitT={orbitClock(t, 1)} opacity={smoothstep(0.6, 0.9, e)} />)}
          <PhoneBase cam={cam} t={t} D={D} age={4} />
          <SatLayer cam={cam} items={items} opacity={smoothstep(0.62, 0.9, e)} labelOpacity={smoothstep(0.88, 1, e)} />
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────────────────────────── s05
export const S05: React.FC = () => {
  const { t, p } = useShot();
  const pose = mixPose(poseWide(25, 20, 67000, 20), poseWide(21, 40, 60000, 12), easeInOut(p));
  const oT = orbitClock(t + 2, 1.4);
  const items = satsAt(oT).map((x) => ({ ...x, label: [x.sat.name, "ALT 20,189 km"] as [string, string] }));
  return (
    <Stage pose={pose} zoom={0}>
      {({ cam }) => (
        <>
          {SATS.map((s) => <OrbitRing key={s.id} cam={cam} sat={s} orbitT={oT} />)}
          <SatLayer cam={cam} items={items} labelOpacity={smoothstep(0.1, 0.4, p)} />
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────────────────────────── s06
export const S06: React.FC = () => {
  const { t, p } = useShot();
  const a = poseAt(mul(PHONE_POS, 0.5), latLonToVec(38, 22), 30000, [0, 0, 1], 6);
  const b = poseAt(mul(PHONE_POS, 0.6), latLonToVec(41, 30), 25000, [0, 0, 1], 2);
  const pose = mixPose(a, b, easeInOut(p));
  const items = satsAt(orbitClock(t, 0.8));
  const cones: ConeSpec[] = items.map((x, i) => ({ sat: x.sat, S: x.S, launch: -3 + i * 0.4, fade: 0.9 }));
  return (
    <Stage pose={pose}>
      {({ cam, D }) => (
        <>
          <Cones cam={cam} t={t} cones={cones} ripples={1} spokes={false} />
          <PhoneBase cam={cam} t={t} D={D} age={4} />
          <SatLayer cam={cam} items={items.map((x) => ({ ...x, emit: 1 }))} opacity={1} />
          <Callout3D cam={cam} at={PHONE_POS} dx={150} dy={-130} title="Your phone" sub="not addressed, not tracked" color={MINT} opacity={smoothstep(0.25, 0.5, p)} />
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────────────────────────── s07 title
export const S07: React.FC = () => {
  const { t, p } = useShot();
  const lift: V3 = [0, 0, -8500]; // look below the planet so it sits in the upper half of the frame
  const pose = mixPose(poseAt(lift, latLonToVec(18, 50), 64000, [0, 0, 1], 10), poseAt(lift, latLonToVec(22, 80), 56000, [0, 0, 1], 6), easeInOut(p));
  const oT = orbitClock(t + 4, 1.2);
  const a = easeOutCubic(clamp01((t - 0.15) / 0.9));
  const b = easeOutCubic(clamp01((t - 0.45) / 0.9));
  const out = 1 - smoothstep(dur(p), 1, p);
  return (
    <Stage pose={pose} overlay={() => (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 96, opacity: out, background: "linear-gradient(to top, rgba(2,5,12,0.85), rgba(2,5,12,0) 62%)" }}>
        <div style={{ fontSize: 22, letterSpacing: 9, fontWeight: 600, color: ACCENT, opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>A TECHNOLOGY DOCUMENTARY</div>
        <div style={{ marginTop: 22, fontSize: 100, fontWeight: 750, letterSpacing: -2, color: "#fff", opacity: a, textShadow: "0 6px 60px rgba(0,0,0,0.8)", transform: `translateY(${(1 - a) * 22}px)` }}>How GPS Knows</div>
        <div style={{ fontSize: 100, fontWeight: 750, letterSpacing: -2, color: "#fff", opacity: b, textShadow: "0 6px 60px rgba(0,0,0,0.8)", transform: `translateY(${(1 - b) * 22}px)`, backgroundImage: "linear-gradient(90deg,#fff,#9fe6ff)", WebkitBackgroundClip: "text" }}>Exactly Where You Are</div>
        <div style={{ marginTop: 34, width: 420 * b, height: 3, background: "linear-gradient(90deg, transparent, #6fd6ff, transparent)" }} />
      </div>
    )}>
      {({ cam }) => (
        <>
          {SATS.map((s) => <OrbitRing key={s.id} cam={cam} sat={s} orbitT={oT} opacity={0.8} />)}
          <SatLayer cam={cam} items={satsAt(oT)} />
        </>
      )}
    </Stage>
  );
};
const dur = (p: number) => 0.82 + 0 * p;

// ─────────────────────────────────────────────────────────────── s08 constellation
const CON_POS = (theta: number) => CONSTELLATION.map((s) => ({ sat: s, S: satAt(s, theta) }));

export const ConstellationLayer: React.FC<{ cam: Cam; theta: number; rings?: number | number[]; miniScale?: number; opacity?: number }> = ({ cam, theta, rings = 0.35, miniScale = 1, opacity = 1 }) => {
  const items = CON_POS(theta);
  return (
    <g opacity={opacity}>
      {Array.from({ length: 6 }, (_, k) => {
        const a = Array.isArray(rings) ? rings[k] : rings;
        return a > 0.01 ? <OrbitRing key={k} cam={cam} sat={CONSTELLATION[k * 4]} theta={theta} opacity={a} trail={false} dash={false} width={1.2} /> : null;
      })}
      {satDepthOrder(cam, items).map((x) => <MiniSat key={x.sat.id} S={x.S} n={x.sat.n} color={x.sat.color} cam={cam} scale={miniScale} />)}
    </g>
  );
};

export const S08: React.FC = () => {
  const { p } = useShot();
  const pose = mixPose(poseWide(30, 10, 82000, 14), poseWide(26, 70, 74000, 8), easeInOut(p));
  const theta = easeInOut(p) * 4 * Math.PI;
  const orbits = (theta / (2 * Math.PI)).toFixed(2);
  const mins = Math.round(easeInOut(p) * 23.93 * 60);
  return (
    <Stage pose={pose} zoom={0} overlay={() => (
      <>
        <Stat x={1396} y={150} w={430} label="TIME-LAPSE · ORBITS COMPLETED" value={orbits} unit="of 2" opacity={smoothstep(0.05, 0.2, p)} color={ACCENT} />
        <Stat x={1396} y={330} w={430} label="ELAPSED" value={`${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, "0")}`} unit="min" opacity={smoothstep(0.1, 0.25, p)} color={MINT} sub="one orbit ≈ 11 h 58 min" />
      </>
    )}>
      {({ cam }) => <ConstellationLayer cam={cam} theta={theta} miniScale={1.1} />}
    </Stage>
  );
};

// ─────────────────────────────────────────────────────────────── s09 hero satellite
export const S09: React.FC = () => {
  const { t, p } = useShot();
  const sat = SATS[0];
  const S0 = satPos(sat, 6);
  const Sh = norm(S0);
  const [h1, h2] = basisFrom(Sh);
  // camera looks along the satellite's track, slightly from below, swinging gently so both arrays and the antenna show
  const along = norm(cross(sat.n, Sh));
  const φ = -0.55 + 1.1 * p;
  const dir = norm(addScaled(add(mul(along, Math.cos(φ)), mul(sat.n, Math.sin(φ) * 0.9)), Sh, -0.3));
  const pose = poseAt(S0, dir, 4600, Sh, 0);
  const U = 700;
  void h1; void h2; void SUN;
  return (
    <Stage pose={pose} dots={false} overlay={() => null}>
      {({ cam }) => {
        const faces = satFaces(sat, S0, cam, U, 1);
        const c = project(cam, S0);
        const x = sat.n;
        const y = norm(cross(sat.n, Sh));
        const z = mul(Sh, -1);
        const at = (a: number, b: number, d: number): V3 => add(S0, mul(add(add(mul(x, a), mul(y, b)), mul(z, d)), U));
        return (
          <>
            <defs>
              <radialGradient id="heroLimb" cx="0.5" cy="0.5" r="0.5"><stop offset="0.86" stopColor="#0a2a55" /><stop offset="0.97" stopColor="#2f9bff" /><stop offset="1" stopColor="#8fdcff" /></radialGradient>
            </defs>
            <ellipse cx={960} cy={1900} rx={2400} ry={1000} fill="url(#heroLimb)" opacity={0.95} />
            <ellipse cx={960} cy={1900} rx={2400} ry={1000} fill="none" stroke="#bfeaff" strokeWidth={3} opacity={0.6} filter="url(#blur6)" />
            <Cones cam={cam} t={t} cones={[{ sat, S: S0, launch: -0.2 }]} spokes={false} />
            {c.ok && <circle cx={c.x} cy={c.y} r={260} fill={sat.color} opacity={0.1} filter="url(#blur20)" />}
            <FacesSvg faces={faces} />
            <Callout3D cam={cam} at={at(1.3, 0, 0)} dx={170} dy={-150} title="Solar arrays" sub="turn to face the Sun" opacity={smoothstep(0.2, 0.36, p)} />
            <Callout3D cam={cam} at={at(0, 0, 0.46)} dx={-210} dy={170} title="L-band antenna" sub="always points at Earth" color={MINT} opacity={smoothstep(0.45, 0.6, p)} />
            <Callout3D cam={cam} at={at(0, 0, -0.1)} dx={-130} dy={-190} title="Atomic clocks" sub="the heart of the system" color="#ffc85c" opacity={smoothstep(0.7, 0.85, p)} />
          </>
        );
      }}
    </Stage>
  );
};

// ─────────────────────────────────────────────────────────────── s10 broadcast
export const S10: React.FC = () => {
  const { t, p } = useShot();
  const pose = mixPose(poseWide(22, 25, 62000, 10), poseWide(28, 14, 52000, 14), easeInOut(p));
  const items = satsAt(orbitClock(t + 3, 0.9));
  const cones: ConeSpec[] = items.map((x, i) => ({ sat: x.sat, S: x.S, launch: 0.1 + i * 0.35 }));
  return (
    <Stage pose={pose}>
      {({ cam }) => (
        <>
          <Cones cam={cam} t={t} cones={cones} ripples={1} />
          <SatLayer cam={cam} items={items.map((x) => ({ ...x, emit: 1, label: [x.sat.name, "L1 · 1575.42 MHz"] as [string, string] }))} labelOpacity={smoothstep(0.1, 0.3, p) * (1 - smoothstep(0.85, 1, p))} />
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────────────────────────── s12 orbit data
export const S12: React.FC = () => {
  const { t, p } = useShot();
  const sat = SATS[1];
  const oT = orbitClock(t + 2, 1.6);
  const pose = mixPose(poseWide(34, 5, 68000, 8), poseWide(30, -15, 60000, 14), easeInOut(p));
  const S = satPos(sat, oT);
  const km = (v: number) => Math.round(v).toLocaleString("en-US");
  const a = smoothstep(0.1, 0.3, p);
  return (
    <Stage pose={pose} overlay={() => (
      <div style={{ position: "absolute", right: 96, top: 150, width: 560, padding: "22px 28px 24px", opacity: a, transform: `translateX(${(1 - a) * 24}px)`, ...glass }}>
        <div style={{ fontSize: 13.5, letterSpacing: 3.2, fontWeight: 600, color: sat.color }}>ORBIT DATA · {sat.name}</div>
        {[["Orbit radius", "26,560 km"], ["Inclination", "55°"], ["Period", "11 h 58 min"]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 21 }}><span style={{ color: MUTED }}>{k}</span><span style={{ fontFamily: MONO }}>{v}</span></div>
        ))}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(150,205,255,0.16)", fontSize: 16, letterSpacing: 2, color: MINT, fontWeight: 600 }}>POSITION NOW  (km)</div>
        {(["x", "y", "z"] as const).map((k, i) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 22 }}><span style={{ color: MUTED, fontFamily: MONO }}>{k}</span><span style={{ fontFamily: MONO, color: INK }}>{km(S[i])}</span></div>
        ))}
      </div>
    )}>
      {({ cam }) => (
        <>
          {SATS.filter((s) => s.id !== sat.id).map((s) => <OrbitRing key={s.id} cam={cam} sat={s} orbitT={oT} opacity={0.35} trail={false} />)}
          <OrbitRing cam={cam} sat={sat} orbitT={oT} dash={false} width={2.4} trailSpan={1.3} />
          <SatLayer cam={cam} items={satsAt(oT).map((x) => ({ ...x, label: x.sat.id === sat.id ? ([x.sat.name, "I am here, at this time"] as [string, string]) : undefined }))} labelOpacity={smoothstep(0.1, 0.35, p)} />
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────────────────────────── s17 light laps the Earth
const LAP_S = 1.337; // 7.48 laps/s slowed 10×
export const S17: React.FC = () => {
  const { t, p } = useShot();
  const pose = mixPose(poseWide(24, 10, 36000, 6), poseWide(32, 70, 30000, 12), easeInOut(p));
  const laps = t / LAP_S;
  return (
    <Stage pose={pose} overlay={() => (
      <>
        <Stat x={110} y={150} w={470} label="THE SPEED OF LIGHT" value="299,792" unit="km / s" color={ACCENT} opacity={smoothstep(0.05, 0.2, p)} />
        <Stat x={110} y={330} w={470} label="LAPS AROUND EARTH EACH SECOND" value="7.5" unit="" color={MINT} opacity={smoothstep(0.2, 0.35, p)} sub="shown 10× slower" />
        <div style={{ position: "absolute", left: 110, top: 520, fontFamily: MONO, fontSize: 26, color: MUTED, opacity: smoothstep(0.3, 0.45, p) }}>lap {laps.toFixed(1)}</div>
      </>
    )}>
      {({ cam }) => {
        const tilt = 22 * DEG;
        const pt = (θ: number): V3 => {
          const r = R_EARTH + 1800;
          return [r * Math.cos(θ), r * Math.sin(θ) * Math.cos(tilt), r * Math.sin(θ) * Math.sin(tilt)];
        };
        const θh = (t / LAP_S) * Math.PI * 2;
        const vis = (X: V3) => X[0] * cam.pos[0] + X[1] * cam.pos[1] + X[2] * cam.pos[2] > (R_EARTH + 700) ** 2 * 0.9999 || len(sub(X, cam.pos)) < 1; // visible side of the sphere
        const full: V3[] = Array.from({ length: 181 }, (_, i) => pt((i / 180) * Math.PI * 2));
        const trailPts: V3[] = Array.from({ length: 60 }, (_, i) => pt(θh - (i / 59) * 1.5));
        const head = pt(θh);
        const hp = project(cam, head);
        return (
          <GlowGroup>
            <path d={pathD(projectRuns(cam, full, (X) => dot3(X, cam.pos) > dot3(X, X) * 0.999999))} fill="none" stroke={ACCENT} strokeWidth={1.4} opacity={0.55} strokeDasharray="3 8" />
            {Array.from({ length: 12 }, (_, k) => {
              const seg = trailPts.slice(k * 5, k * 5 + 7);
              return <path key={k} d={pathD(projectRuns(cam, seg, (X) => dot3(X, cam.pos) > dot3(X, X) * 0.999999))} fill="none" stroke="#fff" strokeWidth={5 - k * 0.35} strokeLinecap="round" opacity={0.95 - k * 0.075} />;
            })}
            {hp.ok && dot3(head, cam.pos) > dot3(head, head) * 0.999999 && (<><circle cx={hp.x} cy={hp.y} r={26} fill="#9fe6ff" opacity={0.6} /><circle cx={hp.x} cy={hp.y} r={9} fill="#fff" /></>)}
            <span />
          </GlowGroup>
        );
      }}
    </Stage>
  );
};
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// ─────────────────────────────────────────────────────────────── finale: pull-back, planes, blanket
export const S48: React.FC = () => {
  const { t, p } = useShot();
  const e = EASE_PULL(p);
  const pose = dive(1 - e, NEAR_END, poseWide(28, 25, 78000, 12));
  const θ = 0.2 + t * 0.08;
  return (
    <Stage pose={pose} zoom={e} overlay={({ cam }) => <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}><AltitudeHud altKm={altOf(cam)} opacity={smoothstep(0.05, 0.2, p)} /></svg>}>
      {({ cam, D }) => (
        <>
          <PhoneBase cam={cam} t={t} D={D} age={9} lockT={3} />
          <ConstellationLayer cam={cam} theta={θ} rings={0.28 * smoothstep(0.5, 0.9, e)} opacity={smoothstep(0.55, 0.9, e)} miniScale={1.15} />
        </>
      )}
    </Stage>
  );
};

export const S49: React.FC = () => {
  const { t, p } = useShot();
  const pose = mixPose(poseWide(28, 25, 78000, 12), poseWide(36, 85, 72000, 6), easeInOut(p));
  const θ = 0.2 + t * 0.08 + 0.2;
  const active = Math.min(5, Math.floor(p * 6));
  const rings = Array.from({ length: 6 }, (_, k) => (k === active ? 1 : k < active ? 0.55 : 0.2));
  return (
    <Stage pose={pose} overlay={() => (
      <div style={{ position: "absolute", left: 96, top: 150, ...glass, padding: "16px 26px", opacity: smoothstep(0.02, 0.15, p) }}>
        <div style={{ fontSize: 13.5, letterSpacing: 3.2, fontWeight: 600, color: PLANE_COLORS[active] }}>ORBITAL PLANE {active + 1} OF 6</div>
        <div style={{ fontSize: 28, fontWeight: 650, marginTop: 6 }}>4 satellites · 55° tilt</div>
      </div>
    )}>
      {({ cam }) => <ConstellationLayer cam={cam} theta={θ} rings={rings} miniScale={1.25} />}
    </Stage>
  );
};

export const S50: React.FC = () => {
  const { t, p } = useShot();
  const pose = mixPose(poseWide(28, 5, 60000, 8), poseWide(24, 60, 52000, 8), easeInOut(p));
  const θ = 0.6 + t * 0.1;
  const items = CON_POS(θ);
  return (
    <Stage pose={pose}>
      {({ cam }) => (
        <>
          <GlowGroup opacity={0.9}>
            {items.map((x) => {
              const Sl = len(x.S);
              const pts = rangeCircle(x.S, Math.sqrt(Sl * Sl - R_EARTH * R_EARTH) * 0.9995);
              if (!pts) return null;
              const runs = projectRuns(cam, pts, onSurfaceVisible(cam));
              return <path key={x.sat.id} d={pathD(runs)} fill="none" stroke={x.sat.color} strokeWidth={1.6} opacity={0.5} />;
            })}
          </GlowGroup>
          <ConstellationLayer cam={cam} theta={θ} rings={0.12} miniScale={1} />
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────────────────────────── near the phone: beams, circles, lock
const nearSats = (t: number) => satsAt(orbitClock(t, 0.5));

export const NearBase: React.FC<{ cam: Cam; D: number; t: number; lockT: number; ret: number; beams: number; packets?: number; circles?: boolean; count?: number; pulse?: boolean }> = ({ cam, D, t, lockT, ret, beams, packets = 0, circles = true, count = 3, pulse = true }) => {
  const items = nearSats(t).slice(0, count);
  return (
    <>
      {circles && <RangeCircles cam={cam} pulseT={t} circles={items.map((x) => ({ S: x.S, rho: len(sub(x.S, PHONE_POS)), color: x.sat.color, alpha: 1 }))} />}
      <PhoneBase cam={cam} t={t} D={D} age={9} lockT={lockT} />
      <Beams cam={cam} beams={items.map((x) => ({ sat: x.sat, S: x.S, q: beams, packetsT: beams >= 1 ? packets : null }))} />
      {pulse && items.map((x, i) => <ReceptionPulse key={x.sat.id} cam={cam} tau={((t * 0.5 + i / 3) % 1)} color={x.sat.color} />)}
      <Marker cam={cam} ret={ret} lockT={lockT} />
    </>
  );
};

export const S51: React.FC = () => {
  const { t, p } = useShot();
  const pose = mixPose(NEAR, poseNear(40, 1200, 620), easeInOut(p));
  const chips = [["TIME", "signal travel time", ACCENT, 0.08], ["DISTANCE", "× speed of light", "#c39bff", 0.38], ["POSITION", "where the circles cross", MINT, 0.68]] as const;
  return (
    <Stage pose={pose} dots overlay={() => (
      <div style={{ position: "absolute", left: 96, top: 150, display: "flex", flexDirection: "column", gap: 14 }}>
        {chips.map(([a, b, c, at]) => {
          const o = smoothstep(at, at + 0.1, p);
          return (
            <div key={a} style={{ ...glass, padding: "14px 24px", width: 400, opacity: 0.25 + 0.75 * o, borderColor: o > 0.5 ? c : "rgba(150,205,255,0.2)" }}>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: o > 0.5 ? c : MUTED }}>{a}</div>
              <div style={{ fontSize: 18, color: MUTED, marginTop: 2 }}>{b}</div>
            </div>
          );
        })}
      </div>
    )}>
      {({ cam, D }) => <NearBase cam={cam} D={D} t={t} lockT={-1} ret={clamp01((p - 0.55) / 0.45)} beams={1} packets={t} />}
    </Stage>
  );
};

export const S52: React.FC = () => {
  const { t, p } = useShot();
  const pose = mixPose(poseNear(40, 1200, 620), NEAR_END, easeInOut(p));
  const lockT = t - 0.35;
  const card = easeOutCubic(clamp01((lockT - 0.3) / 0.5));
  return (
    <Stage pose={pose} overlay={({ cam }) => {
      const pin = pinAnchor(cam);
      return (
        <>
          {card > 0.01 && pin.ok && (
            <div style={{ position: "absolute", left: Math.min(WIDTH - 96 - 380, pin.x + 330), top: 330, width: 380, padding: "20px 26px 22px", opacity: card, transform: `translateY(${(1 - card) * 14}px)`, ...glass, border: "1px solid rgba(125,255,192,0.45)", boxShadow: "0 18px 50px rgba(0,0,0,0.45), 0 0 40px rgba(125,255,192,0.14)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, letterSpacing: 3.2, fontWeight: 700, color: MINT }}><span style={{ width: 9, height: 9, borderRadius: 5, background: MINT, boxShadow: `0 0 12px ${MINT}` }} />POSITION FIX</div>
              <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, marginTop: 14 }}>{PHONE.lat.toFixed(4)}° N</div>
              <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, marginTop: 2 }}>{PHONE.lon.toFixed(4)}° E</div>
              <div style={{ marginTop: 12, fontSize: 16.5, color: MUTED }}>Typical accuracy ≈ 5 m, open sky</div>
            </div>
          )}
        </>
      );
    }}>
      {({ cam, D }) => <NearBase cam={cam} D={D} t={t} lockT={lockT} ret={lockT < 0 ? clamp01(0.35 + (t / 0.35) * 0.65) : 1} beams={1} packets={t} />}
    </Stage>
  );
};

export const S53: React.FC = () => {
  const { t, p } = useShot();
  const e = EASE_OUT(p);
  const pose = dive(1 - e, NEAR_END, poseWide(24, 40, 82000, 10));
  const oT = orbitClock(t + 3, 0.5);
  const θ = 0.8 + t * 0.07;
  const items = satsAt(T_REF + (t - 5) * 0.5);
  return (
    <Stage pose={pose} zoom={e * 0.6} overlay={({ cam }) => <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}><AltitudeHud altKm={altOf(cam)} opacity={smoothstep(0.05, 0.2, p)} /></svg>}>
      {({ cam, D }) => (
        <>
          <PhoneBase cam={cam} t={t} D={D} age={9} lockT={3} />
          <Beams cam={cam} beams={items.map((x) => ({ sat: x.sat, S: x.S, q: 1, packetsT: t }))} />
          <Marker cam={cam} ret={1} lockT={3 + t} />
          <ConstellationLayer cam={cam} theta={θ} rings={0.22 * smoothstep(0.35, 0.8, e)} opacity={smoothstep(0.4, 0.8, e)} miniScale={1.15} />
          <span style={{ display: "none" }}>{oT}</span>
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────────────────────────── s54 end card
export const S54: React.FC = () => {
  const { t, p } = useShot();
  const lift: V3 = [0, 0, -7500];
  const pose = mixPose(poseAt(lift, latLonToVec(24, 70), 66000, [0, 0, 1], 8), poseAt(lift, latLonToVec(20, 96), 60000, [0, 0, 1], 4), easeInOut(p));
  const a = easeOutCubic(clamp01((t - 0.2) / 1.0));
  const θ = 1.0 + t * 0.05;
  return (
    <Stage pose={pose} overlay={() => (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 84, background: "linear-gradient(to top, rgba(2,5,12,0.88), rgba(2,5,12,0) 64%)" }}>
        <div style={{ fontSize: 76, fontWeight: 750, letterSpacing: -1.5, color: "#fff", opacity: a, transform: `translateY(${(1 - a) * 16}px)`, textShadow: "0 6px 50px rgba(0,0,0,0.8)" }}>How GPS Knows Exactly Where You Are</div>
        <div style={{ marginTop: 26, fontSize: 24, letterSpacing: 6, color: ACCENT, fontWeight: 600, opacity: a }}>LISTEN · MEASURE TIME · CALCULATE</div>
        <div style={{ marginTop: 40, fontSize: 17, color: MUTED, opacity: 0.8 * a, textAlign: "center", lineHeight: 1.6 }}>Sources: GPS.gov · IS-GPS-200 interface specification · U.S. Space Force · Natural Earth coastlines (public domain)</div>
      </div>
    )}>
      {({ cam }) => <ConstellationLayer cam={cam} theta={θ} rings={0.16} miniScale={1} />}
    </Stage>
  );
};
export { lerp };
