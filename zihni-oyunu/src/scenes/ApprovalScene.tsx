import React from "react";
import { AbsoluteFill } from "remotion";
import { BoundHero } from "../components/BoundHero";
import { CameraMotion, CamKey, World } from "../components/CameraMotion";
import { Light, LightDefs, LightField } from "../components/ApprovalLights";
import { Dust, PaperBackground } from "../components/PaperBackground";
import { Bubble, Floor } from "../components/Props";
import { useGF } from "../components/SceneFrame";
import { ShadowHand } from "../components/ShadowHands";
import { Stickman } from "../components/Stickman";
import { ev, sceneRanges } from "../data/timing";
import { C } from "../theme";
import { clamp, kf, noise, prog } from "../utils/animation";
import { joints, P, Pose, walk } from "../utils/rig";

const E = (n: string, o = 0) => ev(`approval.${n}`, o);
const HERO_G = 860, HERO_SC = 1.5;

const PEOPLE = [
  { x: 1560, g: 820, sc: 1.35, style: 1 },
  { x: 1800, g: 800, sc: 1.2, style: 2 },
  { x: 2030, g: 790, sc: 1.1, style: 3 },
  { x: 250, g: 810, sc: 1.25, style: 4 },
  { x: 470, g: 795, sc: 1.15, style: 1 },
];

/** mood −1..1 of each person over time (approving → light, disappointed → none). */
function moodOf(k: number, f: number): number {
  const l1 = E("l1"), l2 = E("l2"), dis = E("disap1"), fast = E("fast"), borrowed = E("borrowed"), flood = E("flood");
  if (f < l1) return 0.05;
  if (f < dis) {
    if (k === 0) return prog(f, l1, 14);
    if (k === 1) return prog(f, l2, 14);
    return 0.1;
  }
  if (f < fast) {
    if (k === 0) return 1 - 2 * prog(f, dis, 10);
    if (k === 1) return 0.9;
    return 0.1;
  }
  const d = f - fast;
  if (f < borrowed) {
    const x = 0.03 * d + 0.00004 * d * d;
    return clamp(noise(x + k * 7.3, k + 2) * 3.2, -1, 1);
  }
  if (f < flood) return clamp(noise((f - borrowed) * 0.035 + k * 5.1, k + 8) * 3, -1, 1);
  return 0.9;
}

export const ApprovalScene: React.FC = () => {
  const f = useGF();
  const s0 = sceneRanges[2].from;
  const chase = E("chase"), dis = E("disap1"), fast = E("fast"), explain = E("explain"), apol = E("apol"), repair = E("repair");
  const borrowed = E("borrowed"), verdict = E("verdict"), flood = E("flood"), slow = E("slow");
  const people = PEOPLE.map((p, k) => ({ ...p, m: moodOf(k, f), k }));

  // --- hero -----------------------------------------------------------------------------------
  const target = people.reduce((a, b) => (Math.abs(b.m) > Math.abs(a.m) ? b : a), people[0]);
  const near = (k: number) => PEOPLE[k].x - (PEOPLE[k].x > 1000 ? 300 : -300);
  let hx = 900;
  let walking = 0;
  if (f >= chase && f < dis) {
    // chases a light that drifts away
    hx = 860 + 330 * prog(f, chase, 90);
    walking = 1;
  } else if (f >= dis && f < borrowed) {
    const n = noise((f - dis) * 0.02 + 3, 4);
    hx = 980 + n * 230;
    walking = f >= fast ? 1 : 0.4;
    void target; void near;
  } else if (f >= borrowed) {
    hx = 980 + 40 * prog(f, borrowed, 120);
  }
  const mAvg = people.slice(0, 3).reduce((a, p) => a + Math.max(0, p.m), 0) / 3;
  const tall = f < chase ? prog(f, E("l1"), 16) : clamp(mAvg * 1.8);
  const anxious = f >= dis ? clamp(1 - tall * 1.2) : 0;
  const spin = f * 0.28;
  const base: Partial<Pose> = {
    lean: -2 * tall + 7 * anxious, head: -6 * tall + 10 * anxious,
    smile: 0.9 * tall - 0.5 * anxious, brow: 0.9 * anxious, eyes: 1 - 0.1 * anxious,
  };
  const bow = prog(f, apol, 10) * (1 - prog(f, apol + 40, 16)) * Math.abs(Math.sin((f - apol) * 0.17));
  const talk = f >= explain && f < apol;
  const wring = f >= dis ? anxious : 0;
  const pose = P({
    ...(walking ? walk(spin, 0.9 * walking) : {}),
    ...base,
    ...(talk ? { aL1: -70 + Math.sin(f * 0.4) * 22, aL2: -60 + Math.sin(f * 0.5) * 30, aR1: 70 - Math.sin(f * 0.45) * 22, aR2: 60 - Math.sin(f * 0.55) * 30, mouthO: 0.5 + 0.4 * Math.sin(f * 0.8) } : {}),
    ...(wring > 0.3 && !walking && !talk ? { aL1: 28, aL2: 98, aR1: -28, aR2: -98 } : {}),
  });
  pose.lean += bow * 34; pose.head += bow * 14;
  const repairing = f >= repair && f < borrowed;
  if (repairing) { pose.aR1 = 150; pose.aR2 = 170; pose.lean += 4; }
  const squash = f >= verdict && f < flood ? prog(f, verdict, 16) : 0;
  if (squash) { pose.lean += 12 * squash; pose.head += 16 * squash; pose.brow = 1; pose.smile = -0.6; }
  const slowP = prog(f, slow, 60);
  const floodP = f >= flood && f < slow ? 1 : 0;
  if (floodP) { pose.aL1 = -150 + Math.sin(f * 0.3) * 12; pose.aL2 = -165; pose.aR1 = 150 - Math.sin(f * 0.35) * 12; pose.aR2 = 165; pose.head = -14; pose.smile = 0.2; pose.brow = 0.8; }
  if (f >= slow) { pose.aL1 = 28 * slowP; pose.aL2 = 62 * slowP; pose.aR1 = -28 * slowP; pose.aR2 = -62 * slowP; pose.lean = 22 * slowP; pose.head = 26 * slowP; pose.eyes = 1 - 0.65 * slowP; pose.smile = -0.3; pose.brow = 0.6; pose.lL1 = -14 * slowP; pose.lR1 = 14 * slowP; pose.lL2 = 12 * slowP; pose.lR2 = -12 * slowP; }
  const wraps = 7 + prog(f, fast, 300) * 3;
  const tension = clamp(0.45 + (f >= fast ? 0.25 : 0) + squash * 0.2);
  const J = joints(pose, hx, HERO_G, HERO_SC, 0);

  // --- camera -------------------------------------------------------------------------------
  const cam: CamKey[] = [
    [s0, { cx: 1060, cy: 560, s: 1.0 }],
    [chase, { cx: 1100, cy: 540, s: 1.02 }],
    [chase + 100, { cx: 1250, cy: 540, s: 1.04 }],
    [fast, { cx: 1160, cy: 540, s: 1.0 }],
    [borrowed, { cx: 1120, cy: 560, s: 0.98 }],
    [verdict, { cx: 1020, cy: 540, s: 1.08 }],
    [flood, { cx: 1040, cy: 520, s: 1.0 }],
    [slow + 30, { cx: 980, cy: 600, s: 1.0 }],
    [sceneRanges[3].from, { cx: 980, cy: 640, s: 1.2 }],
  ];
  const dark = kf(f, [[verdict - 20, 0], [verdict + 40, 0.18], [flood, 0.18], [slow + 60, 0.3]]);
  const constrict = kf(f, [[s0, 0.1], [verdict, 0.2], [slow + 60, 0.5]]);

  return (
    <AbsoluteFill>
      <PaperBackground dark={dark} constrict={constrict} floorY={830} spot={[0.5, 0.5]}>
        <Dust opacity={0.28} />
      </PaperBackground>
      <CameraMotion keys={cam}>
        <World>
          <LightDefs />
          <Floor y={HERO_G - 30} dark={dark > 0.15} />
          {[...people].sort((a, b) => a.g - b.g).map((p) => <Person key={p.k} p={p} f={f} />)}
          <Stickman x={hx} ground={HERO_G} scale={HERO_SC} pose={pose} seed={3} tremble={anxious * 2 + 0.3} />
          <BoundHeroOverlay J={J} wraps={wraps} tension={tension} f={f} />
          {/* gestures and metaphors */}
          <Gestures f={f} people={people} J={J} />
          {/* lights above people */}
          {people.map((p) => <PersonLight key={p.k} p={p} f={f} chase={chase} />)}
          {f >= borrowed && f < flood && <BorrowedLight J={J} people={people} f={f} born={borrowed} />}
          {f >= flood && <LightField frame={f} count={110} reveal={prog(f, flood, 70) * (1 - 0.0)} area={[-200, -150, 2400, 900]} size={9} speed={f >= slow ? 0.25 : 1} seed={7} tone={1 - prog(f, slow + 30, 80) * 0.45} />}
          {f >= verdict - 12 && f < flood + 20 && <ShadowHand from={[hx + 40, -420]} target={[hx + 20, 215]} p={prog(f, verdict - 12, 14) * (1 - prog(f, verdict + 52, 18))} kind="point" frame={f} seed={12} showItem={false} />}
        </World>
      </CameraMotion>
    </AbsoluteFill>
  );
};

type Pn = (typeof PEOPLE)[number] & { m: number; k: number };

const Person: React.FC<{ p: Pn; f: number }> = ({ p, f }) => {
  const m = p.m;
  const pose = P({
    smile: m > 0 ? 0.3 + 0.7 * m : 0.3 + 0.9 * m, brow: m < -0.2 ? -m * 0.8 : 0, eyes: 1,
    head: m < -0.3 ? 12 * -m : 0, lean: m < -0.3 ? 4 * -m : 0,
    aL1: m < -0.3 ? 38 : -9, aL2: m < -0.3 ? 120 : -5, aR1: m < -0.3 ? -38 : 9, aR2: m < -0.3 ? -120 : 5,
  });
  return <Stickman x={p.x} ground={p.g} scale={p.sc} pose={pose} style={p.style} seed={50 + p.k} shadow={p.g > 800} color={C.inkSoft} />;
};

const PersonLight: React.FC<{ p: Pn; f: number; chase: number }> = ({ p, f, chase }) => {
  const J = joints(P(), p.x, p.g, p.sc, 0);
  const on = clamp((p.m - 0.15) * 2.6);
  let x = J.head[0], y = J.head[1] - 100 * p.sc;
  if (p.k < 2 && f >= chase && f < E("disap1")) {
    // the lights drift out of reach while he chases them
    const d = prog(f, chase, 120);
    x += (p.k === 0 ? 300 : 220) * d; y -= 170 * d + Math.sin(f * 0.07 + p.k) * 14;
  }
  return <Light x={x} y={y + Math.sin(f * 0.05 + p.k) * 5} on={on} size={19 * p.sc / 1.2} frame={f} seed={p.k} />;
};

const BoundHeroOverlay: React.FC<{ J: ReturnType<typeof joints>; wraps: number; tension: number; f: number }> = ({ J, tension }) => {
  // a few strings from the hero up out of frame (continuity with the previous scenes)
  return (
    <g stroke={C.ink} strokeWidth={2 + tension} fill="none" opacity={0.85}>
      {[-1, 1, -2, 2, 3].map((o, i) => (
        <path key={i} d={`M ${J.shoulder[0] + o * 6} ${J.shoulder[1] + 4} L ${J.shoulder[0] + o * 150} -480`} opacity={0.85 - i * 0.08} />
      ))}
    </g>
  );
};

const BorrowedLight: React.FC<{ J: ReturnType<typeof joints>; people: Pn[]; f: number; born: number }> = ({ J, people, f, born }) => {
  const a = prog(f, born, 20);
  const avg = people.reduce((s, p) => s + Math.max(0, p.m), 0) / people.length;
  const hx = J.head[0], hy = J.head[1] - 110;
  return (
    <g opacity={a}>
      {people.map((p) => {
        const pj = joints(P(), p.x, p.g, p.sc, 0);
        const on = clamp((p.m - 0.15) * 2.6);
        return <path key={p.k} d={`M ${pj.head[0]} ${pj.head[1] - 100 * p.sc} Q ${(pj.head[0] + hx) / 2} ${hy - 90} ${hx} ${hy}`} stroke={C.light} strokeWidth={2.2} fill="none" opacity={0.15 + 0.6 * on} strokeDasharray="2 9" strokeLinecap="round" />;
      })}
      <Light x={hx} y={hy} on={0.25 + avg * 1.3} size={16} frame={f} seed={9} />
    </g>
  );
};

const Cloud: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g>
    <path d={`M ${x - 70} ${y + 20} a 34 34 0 0 1 14 -64 a 44 44 0 0 1 84 -8 a 32 32 0 0 1 24 72 Z`} fill="#6d6c67" stroke={C.ink} strokeWidth={3} />
    {[0, 1, 2, 3, 4].map((i) => {
      const t = ((f * 0.04 + i * 0.21) % 1);
      return <path key={i} d={`M ${x - 56 + i * 28} ${y + 30 + t * 90} l -5 14`} stroke={C.ink} strokeWidth={3} strokeLinecap="round" opacity={1 - t} />;
    })}
  </g>
);

const Gestures: React.FC<{ f: number; people: Pn[]; J: ReturnType<typeof joints> }> = ({ f, people, J }) => {
  const explain = E("explain"), apol = E("apol"), repair = E("repair"), q = E("q"), cloud = E("cloud"), cross = E("cross"), borrowed = E("borrowed"), verdict = E("verdict");
  const p0 = people[0], p1 = people[1], p3 = people[3];
  const j0 = joints(P(), p0.x, p0.g, p0.sc, 0);
  const j1 = joints(P(), p1.x, p1.g, p1.sc, 0);
  const j3 = joints(P(), p3.x, p3.g, p3.sc, 0);
  return (
    <g>
      {/* explaining: lots of lines pour out */}
      {f >= explain && f < apol + 10 && (
        <g opacity={prog(f, explain, 10) * (1 - prog(f, apol, 10))}>
          <Bubble x={J.head[0] + 190} y={J.head[1] - 40} w={300} h={150} tail={[-120, 70]} />
          {[0, 1, 2].map((i) => <path key={i} d={`M ${J.head[0] + 70} ${J.head[1] - 78 + i * 30} l ${150 + Math.sin(f * 0.3 + i) * 30} 0`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.75} />)}
        </g>
      )}
      {/* apologising: small drops of sweat */}
      {f >= apol && f < repair && [0, 1, 2].map((i) => {
        const t = ((f * 0.05 + i / 3) % 1);
        return <path key={i} d={`M ${J.head[0] + 46 + i * 12} ${J.head[1] - 30 + t * 50} q 4 8 0 12 q -4 -4 0 -12`} fill={C.ink} opacity={1 - t} />;
      })}
      {/* repairing someone else's feelings: a grey cloud he cannot lift */}
      {f >= repair && f < borrowed && (
        <g opacity={prog(f, repair, 16) * (1 - prog(f, borrowed - 10, 14))}>
          <Cloud x={p0.x} y={j0.head[1] - 160 + Math.sin(f * 0.05) * 6} f={f} />
          <path d={`M ${J.handR[0]} ${J.handR[1]} L ${p0.x - 40} ${j0.head[1] - 120}`} stroke={C.light} strokeWidth={2} strokeDasharray="3 8" opacity={0.6} />
        </g>
      )}
      {/* "misunderstand" */}
      {f >= q && f < cross - 20 && (
        <g transform={`translate(${p3.x} ${j3.head[1] - 150})`} opacity={prog(f, q, 14) * (1 - prog(f, cross - 40, 14))}>
          <g fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round"><path d="M -22 -30 C -22 -64 32 -64 32 -30 C 32 -8 4 -10 4 14 L 4 22" /></g>
          <circle cx={4} cy={46} r={5.5} fill={C.ink} />
        </g>
      )}
      {/* "a bad day" */}
      {f >= cloud && f < verdict && (
        <g opacity={prog(f, cloud, 14) * (1 - prog(f, verdict - 18, 14))}>
          <Cloud x={p1.x} y={j1.head[1] - 150} f={f} />
        </g>
      )}
    </g>
  );
};
