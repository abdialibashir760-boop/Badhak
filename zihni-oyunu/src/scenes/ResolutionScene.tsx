import React from "react";
import { AbsoluteFill } from "remotion";
import { BoundHero } from "../components/BoundHero";
import { CameraMotion, CamKey, World } from "../components/CameraMotion";
import { FaceDisc, Paper } from "../components/Glyphs";
import { Light, LightDefs, LightField } from "../components/ApprovalLights";
import { Mask } from "../components/Mask";
import { Dust, PaperBackground } from "../components/PaperBackground";
import { Bubble, Chair, Floor } from "../components/Props";
import { useGF } from "../components/SceneFrame";
import { Stickman } from "../components/Stickman";
import { FloorThread } from "../components/ThreadSystem";
import { ev, sceneRanges } from "../data/timing";
import { C } from "../theme";
import { clamp, kf, prog } from "../utils/animation";
import { joints, P, poseTrack, walk } from "../utils/rig";

const E = (n: string, o = 0) => ev(`resolution.${n}`, o);
const G = 830;
const X1 = 0, X2 = 2000, X3 = 4000, X4 = 6000;

const CALM = { lean: 0, head: -2, eyes: 1, brow: 0.05, smile: 0.5 };
const WARM = { ...CALM, smile: 0.9, joy: 1 };

export const ResolutionScene: React.FC = () => {
  const f = useGF();
  const s0 = sceneRanges[5].from, end = sceneRanges[6].from;
  const pan2 = E("pan2"), pan3 = E("pan3"), pan4 = E("pan4");
  const cam: CamKey[] = [
    [s0, { cx: X1 + 900, cy: 540, s: 1.0 }],
    [pan2 - 30, { cx: X1 + 940, cy: 540, s: 1.06 }],
    [pan2 + 30, { cx: X2 + 960, cy: 540, s: 1.0 }],
    [pan3 - 30, { cx: X2 + 980, cy: 540, s: 1.04 }],
    [pan3 + 30, { cx: X3 + 960, cy: 540, s: 1.0 }],
    [pan4 - 30, { cx: X3 + 1000, cy: 540, s: 1.04 }],
    [pan4 + 30, { cx: X4 + 960, cy: 540, s: 1.0 }],
    [end, { cx: X4 + 1040, cy: 540, s: 0.94 }],
  ];
  const near = (x: number) => Math.abs(kf(f, cam.map(([t, v]) => [t, v.cx] as const)) - x) < 2300;
  const lightsAway = prog(f, E("fall"), 60);
  return (
    <AbsoluteFill>
      <PaperBackground dark={0} constrict={0.05} spot={[0.5, 0.5]}>
        <Dust opacity={0.4} />
      </PaperBackground>
      <CameraMotion keys={cam} drift={2}>
        <World>
          <LightDefs />
          <Floor y={G} />
          {/* approval lights stay in the distance — he no longer chases them */}
          <g opacity={lightsAway}>
            <LightField frame={f} count={9} reveal={1} area={[-300, 120, 8800, 200]} size={7} speed={0.4} seed={11} tone={0.55} />
          </g>
          {near(X1 + 960) && <V1 f={f} />}
          {near(X2 + 960) && <V2 f={f} />}
          {near(X3 + 960) && <V3 f={f} />}
          {near(X4 + 960) && <V4 f={f} />}
        </World>
      </CameraMotion>
    </AbsoluteFill>
  );
};

/* V1 — checking his own schedule and energy, then helping because he wants to ---------------- */
const V1: React.FC<{ f: number }> = ({ f }) => {
  const ask = E("ask"), sched = E("sched"), decide = E("decide"), help = E("help"), caring = E("caring");
  const hx = X1 + 780;
  const fx = kf(f, [[ask - 60, X1 + 1750], [ask + 40, X1 + 1250], [help, X1 + 1250], [help + 60, X1 + 1140]]);
  const walking = f > ask - 60 && f < ask + 40;
  const fp = P({ ...(walking ? walk(f * 0.3, 0.8) : {}), smile: 0.4, aR1: f > help ? 40 : 9, aR2: f > help ? 30 : 5 });
  const looking = prog(f, sched, 16) * (1 - prog(f, decide + 10, 16));
  const nodN = Math.sin(Math.PI * clamp((f - decide) / 30)) * 12;
  const carry = prog(f, help, 24);
  const hp = poseTrack(f, [
    [ask - 20, { ...CALM, smile: 0.3 }],
    [sched, { ...CALM, gaze: -1, head: -6, brow: 0.2 }],
    [decide - 12, { ...CALM, gaze: -1, head: -4, smile: 0.2 }],
    [decide + 20, { ...WARM, head: -2 }],
    [help, { ...WARM, aL1: -60, aL2: -50, lean: 3 }],
    [help + 40, { ...WARM, aL1: -62, aL2: -52, lean: 4 }],
  ]);
  hp.head += nodN;
  const J = joints(hp, hx, G, 1.5, 0);
  const fJ = joints(fp, fx, G, 1.5, 0);
  const boxX = (fJ.handR[0] + J.handL[0]) / 2 + (1 - carry) * 80, boxY = Math.min(fJ.handR[1], J.handL[1]) - 40;
  const loose = 1 - prog(f, decide, 60);
  return (
    <g>
      <BoundHero x={hx} ground={G} scale={1.5} pose={hp} frame={f} wraps={14 * 0 + 14} tension={0.18 * loose + 0.05} seed={3} stringCount={4} reach={380}
        threadOpacity={0.65 * loose + 0.0} tremble={0.3} />
      <Stickman x={fx} ground={G} scale={1.5} pose={fp} style={1} seed={61} shadowDir={-1} />
      {/* schedule + energy — a deliberate look at what he actually has */}
      {looking > 0.01 && (
        <g opacity={looking}>
          <g transform={`translate(${hx - 20} 270)`}>
            <Bubble x={0} y={0} w={420} h={220} tail={[10, 150]} />
            <g transform="translate(-130 -64)" stroke={C.ink} fill="none" strokeWidth={3}>
              {Array.from({ length: 10 }, (_, i) => <rect key={i} x={(i % 5) * 28} y={Math.floor(i / 5) * 30} width={22} height={24} fill={i === 7 ? C.light : i % 4 === 1 ? "#cfcbbd" : "none"} opacity={i === 7 ? 0.9 : 1} />)}
            </g>
            <g transform="translate(40 -52)">
              <rect x={0} y={0} width={86} height={40} rx={6} fill="none" stroke={C.ink} strokeWidth={4} />
              <rect x={86} y={12} width={8} height={16} fill={C.ink} />
              <rect x={6} y={6} width={22 + 38 * prog(f, sched + 20, 40)} height={28} rx={3} fill={C.ink} />
            </g>
          </g>
        </g>
      )}
      <Box x={boxX} y={boxY} f={f} show={prog(f, ask, 20)} />
      <Light x={fx} y={fJ.head[1] - 100} on={prog(f, caring, 20)} size={12} frame={f} seed={6} />
    </g>
  );
};

const Box: React.FC<{ x: number; y: number; f: number; show: number }> = ({ x, y, show }) => {
  if (show < 0.02) return null;
  return (
    <g opacity={show} transform={`translate(${x} ${y})`}>
      <rect x={-52} y={-34} width={104} height={68} fill="#d7d2c3" stroke={C.ink} strokeWidth={4} />
      <path d="M -52 -34 L 0 -10 L 52 -34 M 0 -10 L 0 34" fill="none" stroke={C.ink} strokeWidth={3} />
    </g>
  );
};

/* V2 — the strings fall away; the masks are set down, not destroyed -------------------------- */
const V2: React.FC<{ f: number }> = ({ f }) => {
  const fall = E("fall"), masks = E("masks");
  const hx = X2 + 900;
  const fp = prog(f, fall, 110);
  const place = [0, 1, 2].map((i) => prog(f, masks + i * 38, 36));
  const bend = Math.max(...place.map((p, i) => Math.sin(Math.PI * p) * (place[i] < 1 && place[i] > 0 ? 1 : 0)));
  const hp = poseTrack(f, [
    [fall - 10, { ...CALM, smile: 0.2, lean: 4 }],
    [fall + 60, { ...CALM, lean: 0, head: -5, smile: 0.4, aL1: -14, aR1: 14 }],
    [masks - 10, { ...CALM, lean: 0, head: -2, smile: 0.5 }],
  ]);
  hp.lean += bend * 28; hp.head += bend * 10;
  hp.aR1 = 9 + bend * 70; hp.aR2 = 5 + bend * 70;
  const holding = prog(f, masks - 30, 20) * (1 - place[0]);
  const J = joints(hp, hx, G, 1.5, 0);
  return (
    <g>
      <BoundHero x={hx} ground={G} scale={1.5} pose={hp} frame={f} wraps={14 * (1 - fp)} tension={0.12} seed={3} stringCount={7} reach={420}
        threadOpacity={1 - fp} tremble={0.25} />
      {/* fallen strings */}
      {[0, 1, 2, 3, 4, 5].map((k) => <FloorThread key={k} x={hx - 420 + k * 130} y={G + 8 + (k % 2) * 8} len={120 + (k % 3) * 40} seed={k + 2} appear={fall + 20 + k * 12} frame={f} />)}
      {/* masks, set gently on the ground */}
      {place.map((p, i) => {
        const x = kf(p, [[0, J.handR[0]], [1, hx + 330 + i * 120]]);
        const y = kf(p, [[0, J.handR[1]], [1, G - 22]]);
        const shown = i === 0 ? Math.max(holding, p) : p;
        return shown > 0.01 ? <Mask key={i} x={x} y={y} r={34} rot={kf(p, [[0, 0], [1, -12 + i * 14]])} opacity={clamp(shown * 2)} mood={i === 1 ? "blank" : "smile"} /> : null;
      })}
    </g>
  );
};

/* V3 — kindness as a choice; listening without fixing --------------------------------------- */
const V3: React.FC<{ f: number }> = ({ f }) => {
  const tea = E("tea"), sit = E("sit"), stay = E("cloudStay");
  const hx = X3 + 760, fx = X3 + 1230;
  const give = prog(f, tea, 30);
  const sitP = prog(f, sit, 40);
  const hp = poseTrack(f, [
    [tea - 20, { ...WARM }],
    [tea + 30, { ...WARM, aR1: 66, aR2: 80, lean: 3 }],
    [sit - 4, { ...WARM, aR1: 9, aR2: 5 }],
    [sit + 50, { ...CALM, lL1: 88, lL2: 4, lR1: 88, lR2: 4, aL1: -8, aL2: 22, aR1: 8, aR2: -22, lean: 4, head: 4, gaze: 1 }],
  ]);
  const fp = poseTrack(f, [
    [tea, { smile: 0.2, brow: 0.3 }],
    [tea + 40, { smile: 0.8, brow: 0 }],
    [sit + 10, { lL1: 88, lL2: 4, lR1: 88, lR2: 4, smile: -0.3, brow: 0.7, head: 14, lean: 8, aL1: 12, aL2: 62, aR1: -12, aR2: -62 }],
  ]);
  const J = joints(hp, hx, G, 1.5, 0);
  const fJ = joints(fp, fx, G, 1.5, 0);
  const sitJ = joints(P({ lL1: 88, lL2: 4, lR1: 88, lR2: 4 }), hx, G, 1.5, 0);
  const cloudA = prog(f, sit + 20, 30);
  return (
    <g>
      {sitP > 0.02 && <g opacity={sitP}><Chair x={hx - 20} y={sitJ.hip[1] + 14} w={150} /></g>}
      {sitP > 0.02 && <g opacity={sitP}><Chair x={fx - 20} y={sitJ.hip[1] + 14} w={150} /></g>}
      <Stickman x={hx} ground={G} scale={1.5} pose={hp} seed={3} />
      <Stickman x={fx} ground={G} scale={1.5} pose={fp} style={3} seed={63} shadowDir={-1} />
      {give < 1 && give > 0 && <Cup x={J.handR[0] + (fJ.handL[0] - J.handR[0]) * give * 0.4} y={J.handR[1] - 14} />}
      <Light x={fx} y={fJ.head[1] - 110} on={prog(f, tea + 30, 20) * (1 - prog(f, sit, 20))} size={12} frame={f} seed={7} />
      {cloudA > 0.01 && (
        <g opacity={cloudA}>
          <path d={`M ${fx - 82} ${fJ.head[1] - 100} a 34 34 0 0 1 14 -64 a 44 44 0 0 1 84 -8 a 32 32 0 0 1 24 72 Z`} fill="#cfcbbd" stroke={C.ink} strokeWidth={3.4} />
        </g>
      )}
      {f >= stay && <g opacity={prog(f, stay, 30)}><path d={`M ${hx + 56} ${J.hip[1] - 20} L ${fx - 56} ${fJ.hip[1] - 20}`} stroke={C.light} strokeWidth={2.4} strokeDasharray="3 9" opacity={0.7} /></g>}
    </g>
  );
};

const Cup: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path d={`M ${x - 22} ${y - 30} L ${x + 22} ${y - 30} L ${x + 16} ${y} L ${x - 16} ${y} Z`} fill="#f3f0e6" stroke={C.ink} strokeWidth={3.4} strokeLinejoin="round" />
    <path d={`M ${x + 22} ${y - 24} q 18 2 0 20`} fill="none" stroke={C.ink} strokeWidth={3} />
  </g>
);

/* V4 — politely declining, keeping his own plans; making a mistake without collapsing ----------- */
const V4: React.FC<{ f: number }> = ({ f }) => {
  const decline = E("decline"), react = E("react"), plan = E("plan"), mistake = E("mistake"), sorry = E("sorry"), clean = E("clean");
  const hx = kf(f, [[decline, X4 + 840], [plan, X4 + 840], [plan + 90, X4 + 1020]]);
  const walkingAway = f > plan && f < plan + 90;
  const hp = poseTrack(f, [
    [decline - 20, { ...CALM }],
    [decline + 20, { ...CALM, aR1: 62, aR2: 70, smile: 0.4, head: 3 }],
    [react, { ...CALM, aR1: 50, aR2: 60, smile: 0.4, head: 3 }],
    [plan - 10, { ...CALM, aR1: 9, aR2: 5, smile: 0.5 }],
    [mistake, { ...CALM }],
    [mistake + 40, { ...CALM, brow: 0.5, eyes: 1, smile: -0.1, aR1: 30, aR2: 80 }],
    [sorry, { ...CALM, brow: 0.45, smile: 0.0, aL1: -30, aL2: 150 }],
    [clean, { ...CALM, lean: 14, head: 8, smile: 0.35, aR1: 40, aR2: 70 }],
    [clean + 50, { ...CALM, smile: 0.45 }],
  ]);
  const wp = walkingAway ? walk(f * 0.22, 0.8) : {};
  const pose = { ...hp, ...wp };
  const people = [
    { x: X4 + 1320, style: 1, mood: 0.9, k: 0 },
    { x: X4 + 1560, style: 2, mood: 0.0, k: 1 },
    { x: X4 + 1800, style: 4, mood: -0.6, k: 2 },
  ];
  const showPeople = prog(f, decline - 10, 20) * (1 - prog(f, plan + 40, 40));
  const spill = prog(f, mistake, 20) * (1 - prog(f, clean, 20));
  const J = joints(pose, hx, G, 1.5, 0);
  return (
    <g>
      {showPeople > 0.01 && (
        <g opacity={showPeople}>
          {people.map((p) => {
            const m = p.mood * prog(f, react, 20);
            const pp = P({ smile: 0.3 + 0.7 * m, brow: m < 0 ? -m : 0, head: m < 0 ? 12 * -m : 0 });
            const pj = joints(pp, p.x, G, 1.4, 0);
            return (
              <g key={p.k}>
                <Stickman x={p.x} ground={G} scale={1.4} pose={pp} style={p.style} seed={70 + p.k} shadowDir={-1} />
                {p.k === 0 && <Light x={p.x} y={pj.head[1] - 100} on={clamp(m * 2)} size={12} frame={f} seed={9} />}
              </g>
            );
          })}
        </g>
      )}
      <Stickman x={hx} ground={G} scale={1.5} pose={pose} seed={3} />
      {f >= plan && f < plan + 140 && (
        <g opacity={prog(f, plan, 20) * (1 - prog(f, plan + 100, 40))}>
          <Paper x={J.handR[0] + 26} y={J.handR[1] + 6} rot={6} w={46} h={60} />
        </g>
      )}
      {/* a small mistake: a spilled cup, then calmly cleaned up */}
      {f >= mistake - 10 && f < clean + 80 && (
        <g opacity={1 - prog(f, clean + 40, 40)}>
          <g transform={`translate(${hx + 150} ${G - 12}) rotate(${spill * 78} 0 0)`}>
            <path d="M -22 -30 L 22 -30 L 16 0 L -16 0 Z" fill="#f3f0e6" stroke={C.ink} strokeWidth={3.4} strokeLinejoin="round" />
          </g>
          <ellipse cx={hx + 210} cy={G + 8} rx={60 * spill} ry={9 * spill} fill="#bdb9aa" opacity={0.8} />
        </g>
      )}
    </g>
  );
};
