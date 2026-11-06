import React from "react";
import { Easing } from "remotion";
import { R_EARTH } from "../engine/geo";
import { add, addScaled, basisFrom, clamp, clamp01, cross, dot, easeInOut, easeOutCubic, hiddenByEarth, len, lerp, mixV, mul, norm, pathD, project, projectRuns, smoothstep, sub, type Cam, type V3 } from "../engine/math3d";
import { dive, mixPose, poseAt, poseLocal, poseWide, type Pose } from "../engine/cam";
import { PHONE_POS, PHONE_UP, SATS, T_REF, satPos, type Sat } from "../engine/world";
import { Satellite, FacesSvg, satFaces } from "../components/SatModel";
import { GlowGroup, rangeCircle, onSurfaceVisible } from "../components/Signals";
import { PhoneBase } from "../components/Phone3D";
import { Marker, MINT } from "../components/Marker";
import { Callout3D, Callout, glass, INK, MONO, MUTED, ACCENT, WARN } from "../components/Hud";
import { Stage } from "./globe";
import { useShot } from "../components/context";
import { Card } from "./kit";

const R = R_EARTH;
const C_KM = 299792.458;
/** Phone-clock error used in the film: 1 millisecond → 299.79 km of range error. */
export const BIAS_KM = C_KM * 0.001;

const orbitT = (t: number) => T_REF + (t - 2.5) * 0.12;
const states = (t: number) => SATS.map((sat) => ({ sat, S: satPos(sat, orbitT(t)) }));
const rangeTo = (S: V3, X: V3 = PHONE_POS) => len(sub(S, X));

// ─────────────────────────────────────────── geometry helpers
/** Intersections of three spheres; returns [lowerSolution, upperSolution] (lower = closer to Earth's centre). */
export function solve3(c: V3[], r: number[]): [V3, V3] | null {
  const ex = norm(sub(c[1], c[0]));
  const v13 = sub(c[2], c[0]);
  const i = dot(ex, v13);
  const ey0 = sub(v13, mul(ex, i));
  const ey = norm(ey0);
  const ez = cross(ex, ey);
  const d = len(sub(c[1], c[0]));
  const j = dot(ey, v13);
  const x = (r[0] ** 2 - r[1] ** 2 + d * d) / (2 * d);
  const y = (r[0] ** 2 - r[2] ** 2 + i * i + j * j) / (2 * j) - (i / j) * x;
  const z2 = r[0] ** 2 - x * x - y * y;
  if (z2 < 0) return null;
  const z = Math.sqrt(z2);
  const base = add(add(c[0], mul(ex, x)), mul(ey, y));
  const a = addScaled(base, ez, z);
  const b = addScaled(base, ez, -z);
  return len(a) < len(b) ? [a, b] : [b, a];
}

const triple = (t: number, bias = 0, radiiBias = 0) => {
  const st = states(t).slice(0, 3);
  const radii = st.map((s) => rangeTo(s.S) + radiiBias - bias);
  return { st, radii, sol: solve3(st.map((s) => s.S), radii) };
};

// ─────────────────────────────────────────── drawing primitives
const vis = (cam: Cam) => (X: V3) => len(X) > R * 1.0005 && !hiddenByEarth(cam.pos, X, R);

/** The silhouette of a huge sphere (what you'd see of the whole shell from far away). */
const SphereOutline: React.FC<{ cam: Cam; S: V3; rho: number; color: string; alpha?: number }> = ({ cam, S, rho, color, alpha = 1 }) => {
  const Cv = sub(cam.pos, S);
  const d = len(Cv);
  if (d <= rho * 1.02) return null;
  const ch = mul(Cv, 1 / d);
  const [e1, e2] = basisFrom(ch);
  const c0 = addScaled(S, ch, (rho * rho) / d);
  const rr = rho * Math.sqrt(1 - (rho * rho) / (d * d));
  const pts: V3[] = Array.from({ length: 181 }, (_, i) => { const a = (i / 180) * Math.PI * 2; return addScaled(addScaled(c0, e1, Math.cos(a) * rr), e2, Math.sin(a) * rr); });
  const dd = pathD(projectRuns(cam, pts, (X) => !hiddenByEarth(cam.pos, X, R)));
  return (
    <g opacity={alpha}>
      <path d={dd} fill="none" stroke={color} strokeWidth={7} opacity={0.28} />
      <path d={dd} fill="none" stroke={color} strokeWidth={2.4} />
    </g>
  );
};

/** A patch of a sphere's surface (lat/long wire mesh) around the point of the sphere nearest to `toward`. */
const SpherePatch: React.FC<{ cam: Cam; S: V3; rho: number; toward?: V3; color: string; W: number; alpha?: number; mesh?: number }> = ({ cam, S, rho, toward = PHONE_POS, color, W, alpha = 1, mesh = 6 }) => {
  if (alpha <= 0.01) return null;
  const a = norm(sub(toward, S));
  const [e1, e2] = basisFrom(a);
  const amax = clamp(W / rho, 0.001, 1.2);
  const ptAt = (al: number, ph: number): V3 => addScaled(S, add(mul(a, Math.cos(al)), mul(add(mul(e1, Math.cos(ph)), mul(e2, Math.sin(ph))), Math.sin(al))), rho);
  const visible = vis(cam);
  let rings = "";
  for (let k = 1; k <= mesh; k++) {
    const pts: V3[] = Array.from({ length: 73 }, (_, i) => ptAt((amax * k) / mesh, (i / 72) * Math.PI * 2));
    rings += pathD(projectRuns(cam, pts, visible));
  }
  let merid = "";
  for (let j = 0; j < 20; j++) {
    const ph = (j / 20) * Math.PI * 2;
    const pts: V3[] = Array.from({ length: 13 }, (_, i) => ptAt((amax * i) / 12, ph));
    merid += pathD(projectRuns(cam, pts, visible));
  }
  const edge = pathD(projectRuns(cam, Array.from({ length: 97 }, (_, i) => ptAt(amax, (i / 96) * Math.PI * 2)), visible));
  return (
    <g opacity={alpha}>
      <path d={edge} fill={color} opacity={0.09} />
      <path d={merid} fill="none" stroke={color} strokeWidth={1.2} opacity={0.5} />
      <path d={rings} fill="none" stroke={color} strokeWidth={1.8} opacity={0.62} />
      <path d={edge} fill="none" stroke={color} strokeWidth={3.2} opacity={0.95} />
      <path d={edge} fill="none" stroke={color} strokeWidth={9} opacity={0.35} filter="url(#blur6)" />
    </g>
  );
};

/** Circle where two spheres intersect; `reveal` 0..1 sweeps it on from the point nearest `near`. */
const SphereCircle: React.FC<{ cam: Cam; S1: V3; r1: number; S2: V3; r2: number; color?: string; reveal?: number; near?: V3 }> = ({ cam, S1, r1, S2, r2, color = "#fff", reveal = 1, near = PHONE_POS }) => {
  const dv = sub(S2, S1);
  const d = len(dv);
  const u = mul(dv, 1 / d);
  const aa = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const rc2 = r1 * r1 - aa * aa;
  if (rc2 <= 0 || reveal <= 0.001) return null;
  const rc = Math.sqrt(rc2);
  const c0 = addScaled(S1, u, aa);
  const [e1, e2] = basisFrom(u);
  const vN = sub(near, c0);
  const th0 = Math.atan2(dot(vN, e2), dot(vN, e1));
  const span = Math.PI * reveal;
  const pts: V3[] = Array.from({ length: 241 }, (_, i) => { const a = th0 - span + (i / 240) * span * 2; return addScaled(addScaled(c0, e1, Math.cos(a) * rc), e2, Math.sin(a) * rc); });
  const dd = pathD(projectRuns(cam, pts, vis(cam)));
  return (
    <GlowGroup>
      <path d={dd} fill="none" stroke={color} strokeWidth={9} opacity={0.35} />
      <path d={dd} fill="none" stroke={color} strokeWidth={3.2} />
      <path d={dd} fill="none" stroke="#fff" strokeWidth={1.1} opacity={0.7} />
    </GlowGroup>
  );
};

const Point: React.FC<{ cam: Cam; X: V3; color: string; r?: number; ghost?: boolean; pulse?: number }> = ({ cam, X, color, r = 1, ghost = false, pulse = 0 }) => {
  const p = project(cam, X);
  if (!p.ok) return null;
  return (
    <g>
      <circle cx={p.x} cy={p.y} r={(34 + 14 * pulse) * r} fill={color} opacity={ghost ? 0.1 : 0.22} filter="url(#blur6)" />
      <circle cx={p.x} cy={p.y} r={14 * r} fill={ghost ? "none" : "#fff"} stroke={color} strokeWidth={ghost ? 3 : 4} strokeDasharray={ghost ? "5 5" : undefined} />
      {!ghost && <circle cx={p.x} cy={p.y} r={30 * r} fill="none" stroke={color} strokeWidth={1.6} opacity={0.6} />}
    </g>
  );
};

const NEAR_POSE = (az: number, el: number, D: number): Pose => poseLocal(az, el, D);
const fmtKm = (v: number) => Math.round(v).toLocaleString("en-US");

const Legend: React.FC<{ rows: { sat: Sat; text: string; on: number }[]; title?: string; foot?: React.ReactNode }> = ({ rows, title = "MEASURED DISTANCES", foot }) => (
  <Card x={96} y={150} w={520} title={title} color={ACCENT}>
    {rows.map(({ sat, text, on }) => (
      <div key={sat.id} style={{ display: "flex", alignItems: "center", height: 42, marginTop: sat.id === 0 ? 10 : 0, opacity: 0.25 + 0.75 * on }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: sat.color, boxShadow: `0 0 12px ${sat.color}`, marginRight: 14 }} />
        <span style={{ width: 90, fontSize: 21, fontWeight: 650 }}>{sat.name}</span>
        <span style={{ fontFamily: MONO, fontSize: 21, color: on > 0.5 ? INK : MUTED }}>{text}</span>
      </div>
    ))}
    {foot}
  </Card>
);

// ─────────────────────────────────────────── s26 one sphere
export const S26: React.FC = () => {
  const { t, p } = useShot();
  const st = states(t);
  const S = st[0].S;
  const rho = rangeTo(S);
  const grow = easeOutCubic(clamp01((p - 0.1) / 0.45));
  const pose = mixPose(poseAt(mul(S, 0.5), norm(cross(S, [0, 0, 1])), 98000, [0, 0, 1], 6), poseAt(mul(S, 0.5), norm(add(cross(S, [0, 0, 1]), mul(norm(S), 0.5))), 90000, [0, 0, 1], 0), easeInOut(p));
  return (
    <Stage pose={pose} overlay={() => <Legend rows={[{ sat: st[0].sat, text: `${fmtKm(rho)} km`, on: smoothstep(0.35, 0.55, p) }]} title="ONE MEASURED DISTANCE" />}>
      {({ cam }) => (
        <>
          <SphereOutline cam={cam} S={S} rho={rho * grow} color={st[0].sat.color} alpha={0.95} />
          <SpherePatch cam={cam} S={S} rho={rho * grow} color={st[0].sat.color} W={9000} alpha={smoothstep(0.45, 0.7, p)} />
          <Satellite sat={st[0].sat} S={S} cam={cam} emit={1} size={1.1} />
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────── s27 the sphere meets Earth: a ring of possible places
export const S27: React.FC = () => {
  const { t, p } = useShot();
  const st = states(t);
  const S = st[0].S;
  const rho = rangeTo(S);
  const pose = dive(1 - easeInOut(p), poseAt(mul(PHONE_POS, 0.55), norm(add(norm(PHONE_POS), mul(norm(S), 0.55))), 17000, [0, 0, 1], 0), poseAt(mul(S, 0.5), norm(add(cross(S, [0, 0, 1]), mul(norm(S), 0.5))), 90000, [0, 0, 1], 0));
  const ring = rangeCircle(S, rho);
  return (
    <Stage pose={pose} overlay={() => (
      <Card x={96} y={150} w={560} title="WHERE COULD YOU BE?" color={ACCENT} opacity={smoothstep(0.1, 0.3, p)}>
        <div style={{ marginTop: 14, fontSize: 28, fontWeight: 650 }}>Anywhere on this ring</div>
        <div style={{ fontSize: 19, color: MUTED, marginTop: 6 }}>every point on it is exactly {fmtKm(rho)} km from GPS 1</div>
      </Card>
    )}>
      {({ cam }) => (
        <>
          <SphereOutline cam={cam} S={S} rho={rho} color={st[0].sat.color} alpha={1 - smoothstep(0.3, 0.7, p) * 0.7} />
          <SpherePatch cam={cam} S={S} rho={rho} color={st[0].sat.color} W={8000} alpha={0.9} />
          {ring && (
            <GlowGroup>
              {(() => { const d = pathD(projectRuns(cam, ring, onSurfaceVisible(cam))); return (<><path d={d} fill="none" stroke={st[0].sat.color} strokeWidth={8} opacity={0.35} /><path d={d} fill="none" stroke={st[0].sat.color} strokeWidth={3} /><path d={d} fill="none" stroke="#fff" strokeWidth={1} opacity={0.6} /></>); })()}
            </GlowGroup>
          )}
          <Satellite sat={st[0].sat} S={S} cam={cam} size={1.1} />
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────── s28 two spheres → a circle
export const S28: React.FC = () => {
  const { t, p } = useShot();
  const st = states(t);
  const r = st.map((x) => rangeTo(x.S));
  const second = smoothstep(0.08, 0.35, p);
  const pose = mixPose(NEAR_POSE(200, 38, 25000), NEAR_POSE(235, 30, 19000), easeInOut(p));
  return (
    <Stage pose={pose} dim={0.4} overlay={() => <Legend rows={[0, 1].map((i) => ({ sat: st[i].sat, text: `${fmtKm(r[i])} km`, on: i === 0 ? 1 : second }))} title="TWO DISTANCES" />}>
      {({ cam, D }) => (
        <>
          <SpherePatch cam={cam} S={st[0].S} rho={r[0]} color={st[0].sat.color} W={D * 0.7} alpha={0.9} />
          <SpherePatch cam={cam} S={st[1].S} rho={r[1] * (0.9 + 0.1 * second)} color={st[1].sat.color} W={D * 0.7} alpha={second} />
          <SphereCircle cam={cam} S1={st[0].S} r1={r[0]} S2={st[1].S} r2={r[1]} reveal={smoothstep(0.35, 0.8, p)} />
          <Point cam={cam} X={PHONE_POS} color={MINT} r={0.6} ghost />
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────── s29 three spheres → two points
export const S29: React.FC = () => {
  const { t, p } = useShot();
  const st = states(t);
  const r = st.map((x) => rangeTo(x.S));
  const third = smoothstep(0.05, 0.3, p);
  const pose = mixPose(NEAR_POSE(215, 36, 17000), NEAR_POSE(250, 26, 11500), easeInOut(p));
  const s3 = solve3(st.slice(0, 3).map((x) => x.S), r.slice(0, 3));
  return (
    <Stage pose={pose} dim={0.4} overlay={() => <Legend rows={[0, 1, 2].map((i) => ({ sat: st[i].sat, text: `${fmtKm(r[i])} km`, on: i < 2 ? 1 : third }))} title="THREE DISTANCES" />}>
      {({ cam, D }) => (
        <>
          {[0, 1, 2].map((i) => <SpherePatch key={i} cam={cam} S={st[i].S} rho={r[i] * (i === 2 ? 0.92 + 0.08 * third : 1)} color={st[i].sat.color} W={D * 0.75} alpha={i === 2 ? third : 0.8} mesh={5} />)}
          <SphereCircle cam={cam} S1={st[0].S} r1={r[0]} S2={st[1].S} r2={r[1]} reveal={1} />
          {s3 && <Point cam={cam} X={s3[0]} color={MINT} pulse={0.5 + 0.5 * Math.sin(t * 5)} />}
          {s3 && <Callout3D cam={cam} at={s3[0]} dx={170} dy={-130} title="Point 1" sub="on the ground" color={MINT} opacity={smoothstep(0.45, 0.65, p)} />}
          <PhoneBase cam={cam} t={t} D={D} age={9} />
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────── s30 the second point is far out in space
export const S30: React.FC = () => {
  const { t, p } = useShot();
  const st = states(t);
  const sats = st.slice(0, 3);
  const r = sats.map((x) => rangeTo(x.S));
  const sol = solve3(sats.map((x) => x.S), r);
  const P2 = sol ? sol[1] : mul(PHONE_POS, 8);
  const e = easeInOut(p);
  const mid = mixV(PHONE_POS, mul(add(PHONE_POS, P2), 0.5), e);
  const D0 = 9000;
  const D1 = Math.max(60000, len(sub(P2, PHONE_POS)) * 2.1);
  const dir = norm(add(mul(norm(cross(sub(P2, PHONE_POS), PHONE_UP)), 0.8), mul(norm(sub(P2, PHONE_POS)), 0.0)));
  const pose = mixPose(NEAR_POSE(250, 26, D0), poseAt(mid, add(dir, mul(norm(sub(P2, PHONE_POS)), 0.15)), D1, [0, 0, 1], 0), e);
  const lineA = smoothstep(0.25, 0.5, p);
  return (
    <Stage pose={pose} dim={0.3} overlay={() => (
      <Card x={96} y={150} w={560} title="TWO CANDIDATES" color={ACCENT} opacity={smoothstep(0.05, 0.2, p)}>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 14 }}><span style={{ width: 16, height: 16, borderRadius: 8, background: MINT }} /><span style={{ fontSize: 26, fontWeight: 650 }}>on the ground</span></div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 14, opacity: smoothstep(0.4, 0.6, p) }}><span style={{ width: 16, height: 16, borderRadius: 8, border: `3px dashed ${WARN}` }} /><span style={{ fontSize: 26, fontWeight: 650 }}>{fmtKm(len(P2) - R)} km above the surface</span></div>
        <div style={{ fontSize: 18, color: MUTED, marginTop: 10, opacity: smoothstep(0.5, 0.7, p) }}>nowhere near Earth: easy to rule out</div>
      </Card>
    )}>
      {({ cam, D }) => (
        <>
          {sats.map((x) => {
            const a = project(cam, x.S);
            const b = project(cam, PHONE_POS);
            const c = project(cam, P2);
            return (
              <g key={x.sat.id}>
                {a.ok && b.ok && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={x.sat.color} strokeWidth={2} opacity={0.7} />}
                {a.ok && c.ok && <line x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke={x.sat.color} strokeWidth={1.6} strokeDasharray="5 8" opacity={0.5 * lineA} />}
              </g>
            );
          })}
          {sats.map((x) => <Satellite key={x.sat.id} sat={x.sat} S={x.S} cam={cam} size={1.0} />)}
          <Point cam={cam} X={PHONE_POS} color={MINT} r={0.9} pulse={0.5 + 0.5 * Math.sin(t * 5)} />
          <Point cam={cam} X={P2} color={WARN} r={0.9} ghost />
          <Callout3D cam={cam} at={P2} dx={-190} dy={-110} title="Mirror point" sub="out in space" color={WARN} opacity={smoothstep(0.5, 0.7, p)} />
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────── s31 a clock error inflates every sphere
export const S31: React.FC = () => {
  const { t, p } = useShot();
  const infl = easeInOut(clamp01((p - 0.1) / 0.5));
  const bias = BIAS_KM * 0.35 * infl; // visualised bias (scaled so the shells stay in frame)
  const { st, radii, sol } = triple(t, 0, bias);
  const trueR = st.map((x) => rangeTo(x.S));
  const Q = sol ? sol[0] : PHONE_POS;
  const err = len(sub(Q, PHONE_POS));
  const pose = mixPose(NEAR_POSE(235, 30, 11500), NEAR_POSE(205, 40, 13500), easeInOut(p));
  return (
    <Stage pose={pose} dim={0.4} overlay={() => (
      <Card x={96} y={150} w={560} title="THE PHONE'S CLOCK IS OFF" color={WARN} opacity={smoothstep(0.02, 0.15, p)}>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 22 }}><span style={{ color: MUTED }}>every distance too long by</span><span style={{ fontFamily: MONO, color: WARN }}>+{Math.round(bias)} km</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 22 }}><span style={{ color: MUTED }}>computed position off by</span><span style={{ fontFamily: MONO }}>{fmtKm(err)} km</span></div>
        <div style={{ fontSize: 17, color: MUTED, marginTop: 12 }}>(error exaggerated to show the effect)</div>
      </Card>
    )}>
      {({ cam, D }) => (
        <>
          {st.map((x, i) => <SpherePatch key={`t${i}`} cam={cam} S={x.S} rho={trueR[i]} color={x.sat.color} W={D * 0.7} alpha={0.3} mesh={4} />)}
          {st.map((x, i) => <SpherePatch key={`i${i}`} cam={cam} S={x.S} rho={radii[i]} color={x.sat.color} W={D * 0.7} alpha={0.9} mesh={5} />)}
          <Point cam={cam} X={PHONE_POS} color={MINT} r={0.7} ghost />
          {sol && infl > 0.05 && <Point cam={cam} X={Q} color={WARN} r={0.9} />}
          {sol && infl > 0.05 && <Callout3D cam={cam} at={Q} dx={190} dy={-120} title="Computed position" sub="wrong" color={WARN} opacity={smoothstep(0.55, 0.75, p)} />}
          <PhoneBase cam={cam} t={t} D={D} age={9} />
        </>
      )}
    </Stage>
  );
};

// ─────────────────────────────────────────── s33 the fourth sphere: solve for the clock error
export const S33: React.FC = () => {
  const { t, p } = useShot();
  const trueBias = BIAS_KM * 0.35;
  const sweep = easeInOut(clamp01((p - 0.2) / 0.62)); // assumed clock error b' goes 0 → true
  const guess = trueBias * sweep;
  const st = states(t);
  const rho = st.map((x) => rangeTo(x.S));
  const meas = rho.map((r) => r + trueBias); // pseudoranges
  const radii = meas.map((m) => m - guess);
  const sol = solve3(st.slice(0, 3).map((x) => x.S), radii.slice(0, 3));
  const Q = sol ? sol[0] : PHONE_POS;
  const gap = Math.abs(len(sub(st[3].S, Q)) - radii[3]);
  const fourth = smoothstep(0.02, 0.2, p);
  const pose = mixPose(NEAR_POSE(215, 34, 12000), NEAR_POSE(245, 28, 9500), easeInOut(p));
  const locked = smoothstep(0.82, 0.9, p);
  return (
    <Stage pose={pose} dim={0.4} overlay={() => (
      <>
        <Legend rows={st.map((x, i) => ({ sat: x.sat, text: `${fmtKm(meas[i])} km`, on: i < 3 ? 1 : fourth }))} title="FOUR DISTANCES" foot={
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(150,205,255,0.16)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 21 }}><span style={{ color: MUTED }}>clock-error guess</span><span style={{ fontFamily: MONO, color: MINT }}>{(guess / C_KM * 1000).toFixed(3)} ms</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 21, marginTop: 8 }}><span style={{ color: MUTED }}>4th sphere misses by</span><span style={{ fontFamily: MONO, color: gap < 2 ? MINT : WARN }}>{gap < 2 ? "0" : fmtKm(gap)} km</span></div>
          </div>
        } />
      </>
    )}>
      {({ cam, D }) => {
        const q4 = project(cam, Q);
        const d4 = len(sub(st[3].S, Q));
        const toward = norm(sub(st[3].S, Q));
        const onShell = addScaled(st[3].S, mul(toward, -1), radii[3]);
        const sOn = project(cam, onShell);
        return (
          <>
            {st.slice(0, 3).map((x, i) => <SpherePatch key={i} cam={cam} S={x.S} rho={radii[i]} color={x.sat.color} W={D * 0.7} alpha={0.75} mesh={4} />)}
            <SpherePatch cam={cam} S={st[3].S} rho={radii[3]} toward={Q} color={st[3].sat.color} W={D * 0.7} alpha={fourth} mesh={5} />
            {q4.ok && sOn.ok && fourth > 0.3 && gap > 2 && <line x1={q4.x} y1={q4.y} x2={sOn.x} y2={sOn.y} stroke={WARN} strokeWidth={3} strokeDasharray="6 6" opacity={0.9} />}
            <Point cam={cam} X={Q} color={locked > 0.5 ? MINT : WARN} pulse={0.5 + 0.5 * Math.sin(t * 6)} />
            <PhoneBase cam={cam} t={t} D={D} age={9} />
            <span style={{ display: "none" }}>{d4}</span>
          </>
        );
      }}
    </Stage>
  );
};

// ─────────────────────────────────────────── s35 snap: four spheres meet at one point
export const S35: React.FC = () => {
  const { t, p } = useShot();
  const st = states(t);
  const rho = st.map((x) => rangeTo(x.S));
  const snap = easeOutCubic(clamp01(p / 0.4));
  const radii = rho.map((r) => r + (1 - snap) * 40);
  const lockT = t - 0.55;
  const pose = mixPose(NEAR_POSE(245, 28, 9500), poseLocal(50, 34, 2600), easeInOut(p));
  const flash = clamp01(1 - Math.abs(lockT) / 0.5);
  return (
    <Stage pose={pose} dim={0.35 * (1 - smoothstep(0.5, 0.9, p))}>
      {({ cam, D }) => (
        <>
          {st.map((x, i) => <SpherePatch key={i} cam={cam} S={x.S} rho={radii[i]} color={x.sat.color} W={D * 0.7} alpha={1 - smoothstep(0.55, 0.9, p) * 0.7} mesh={4} />)}
          <PhoneBase cam={cam} t={t} D={D} age={9} lockT={lockT} />
          <Marker cam={cam} ret={1} lockT={lockT} />
          {(() => { const pp = project(cam, PHONE_POS); return pp.ok && flash > 0 ? <circle cx={pp.x} cy={pp.y} r={40 + 120 * (1 - flash)} fill="#fff" opacity={flash * 0.8} filter="url(#blur20)" /> : null; })()}
        </>
      )}
    </Stage>
  );
};
export { Callout, FacesSvg, satFaces, lerp, Easing };
