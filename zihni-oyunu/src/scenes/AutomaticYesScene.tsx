import React from "react";
import { AbsoluteFill } from "remotion";
import { BoundHero } from "../components/BoundHero";
import { CameraMotion, CamKey, World } from "../components/CameraMotion";
import { Arrow, FaceDisc, LaughMarks, Paper, Scribble } from "../components/Glyphs";
import { Light, LightDefs } from "../components/ApprovalLights";
import { Dust, PaperBackground } from "../components/PaperBackground";
import { Bubble, Chair, Clock, Floor, Phone, TodoList } from "../components/Props";
import { useGF } from "../components/SceneFrame";
import { Stickman } from "../components/Stickman";
import { Threads } from "../components/ThreadSystem";
import { ev, sceneRanges } from "../data/timing";
import { C } from "../theme";
import { clamp, kf, noise, prog, pulse } from "../utils/animation";
import { joints, P, poseTrack, POSES, walk } from "../utils/rig";

const G = 830;
const XA = 0, XB = 2000, XC = 4000, XD = 6000;
const E = (n: string, o = 0) => ev(`response.${n}`, o);

export const AutomaticYesScene: React.FC = () => {
  const f = useGF();
  const s0 = sceneRanges[1].from;
  const pB = E("pan_b"), pC = E("pan_c"), pD = E("pan_d"), why = E("why"), learn = E("learn");
  const cam: CamKey[] = [
    [s0, { cx: XA + 880, cy: 560, s: 1.02 }],
    [pB - 14, { cx: XA + 940, cy: 550, s: 1.1 }],
    [pB + 18, { cx: XB + 940, cy: 560, s: 1.02 }],
    [pC - 14, { cx: XB + 980, cy: 550, s: 1.1 }],
    [pC + 18, { cx: XC + 940, cy: 560, s: 1.02 }],
    [pD - 14, { cx: XC + 980, cy: 550, s: 1.1 }],
    [pD + 18, { cx: XD + 960, cy: 600, s: 1.05 }],
    [why - 20, { cx: XD + 960, cy: 560, s: 1.1 }],
    [why + 80, { cx: XD + 960, cy: 470, s: 0.78 }],
    [learn + 150, { cx: XD + 960, cy: 520, s: 0.92 }],
    [E("smile"), { cx: XD + 1000, cy: 540, s: 1.0 }],
    [E("every") + 120, { cx: XD + 960, cy: 540, s: 1.18 }],
  ];
  const dark = kf(f, [[s0, 0], [pD, 0.03], [pD + 60, 0.17], [why, 0.17], [E("every"), 0.1]]);
  const constrict = kf(f, [[s0, 0.1], [pD, 0.15], [pD + 60, 0.45], [why + 60, 0.3], [E("every"), 0.38]]);
  const camX = 0; void camX;
  const near = (x: number) => Math.abs(kf(f, cam.map(([t, v]) => [t, v.cx] as const)) - x) < 2300;

  return (
    <AbsoluteFill>
      <PaperBackground dark={dark} constrict={constrict} spot={[0.5, 0.55]}>
        <Dust opacity={0.22} />
      </PaperBackground>
      <CameraMotion keys={cam}>
        <World>
          <LightDefs />
          <Floor y={G} dark={dark > 0.15} />
          {near(XA + 960) && <VignetteA f={f} />}
          {near(XB + 960) && <VignetteB f={f} />}
          {near(XC + 960) && <VignetteC f={f} />}
          {near(XD + 960) && <VignetteD f={f} dark={dark > 0.15} />}
          {/* the string that connects every "yes" */}
          <ConnectingThread f={f} />
        </World>
      </CameraMotion>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------------------------- */

const ConnectingThread: React.FC<{ f: number }> = ({ f }) => {
  const pB = E("pan_b"), pC = E("pan_c");
  return (
    <Threads
      frame={f}
      defs={[
        { from: [XA + 760, 800], to: [XB + 760, 800], born: 0, draw: prog(f, pB - 10, 24), tension: 0.15, sag: 40, width: 2.4 },
        { from: [XB + 760, 800], to: [XC + 760, 800], born: 0, draw: prog(f, pC - 10, 24), tension: 0.3, sag: 40, width: 2.4 },
      ]}
    />
  );
};

/* A — "A coworker asks you to cover a shift" ------------------------------------------------ */
const VignetteA: React.FC<{ f: number }> = ({ f }) => {
  const walkF = E("a_walk"), ask = E("a_ask"), nod = E("a_nod");
  const hx = XA + 640, wx0 = XA + 1750, wx1 = XA + 1180;
  const wp = prog(f, walkF, 70);
  const cw = wx0 + (wx1 - wx0) * wp;
  const walking = wp > 0 && wp < 1;
  const cwPose = P({
    ...(walking ? walk(f * 0.34) : {}),
    smile: 0.5,
    ...(f >= ask ? { aL1: -78 * prog(f, ask, 14), aL2: -86 * prog(f, ask, 14), head: -6 * prog(f, ask, 14) } : {}),
  });
  const nodAmt = Math.sin(Math.PI * clamp((f - nod) / 22)) * 17;
  const hp = poseTrack(f, [
    [0, { lean: 6, head: 14, eyes: 0.32, brow: 0.55, smile: -0.3 }],
    [ask + 20, { lean: 8, head: 16, eyes: 0.28, brow: 0.7, smile: -0.4 }],
    [nod - 2, { lean: 8, head: 12, eyes: 0.3, brow: 0.7, smile: -0.4 }],
    [nod + 12, { lean: 4, head: 8, eyes: 0.45, brow: 0.6, smile: 1 }],
  ]);
  hp.head += nodAmt;
  const wraps = 4 + prog(f, nod, 16);
  const tension = 0.3 + prog(f, nod, 20) * 0.12;
  const cwJ = joints(cwPose, cw, G, 1.5, 0);
  return (
    <g>
      <Clock x={XA + 1000} y={290} r={74} frame={f} speed={f > ask ? 6 : 0.7} start={110} />
      <path d={`M ${XA + 1450} ${G - 150} L ${XA + 1450} ${G} M ${XA + 1450} ${G - 150} L ${XA + 1820} ${G - 150} M ${XA + 1820} ${G - 150} L ${XA + 1820} ${G}`} stroke={C.ink} strokeWidth={5} fill="none" opacity={0.6} />
      <Stickman x={cw} ground={G} scale={1.5} pose={cwPose} style={1} seed={21} shadowDir={-1} />
      {f >= ask && <g opacity={prog(f, ask, 10)}><Paper x={cwJ.handL[0] - 34} y={cwJ.handL[1] - 8} rot={-8} /></g>}
      <BoundHero x={hx} ground={G} scale={1.5} pose={hp} frame={f} wraps={wraps} tension={tension} seed={3}  />
    </g>
  );
};

/* B — "A friend calls when you desperately need time alone" ----------------------------------- */
const VignetteB: React.FC<{ f: number }> = ({ f }) => {
  const ring = E("b_ring"), look = E("b_look"), reach = E("b_reach"), ans = E("b_answer");
  const hx = XB + 760;
  const tableX = XB + 1330, tableY = G - 230;
  const ringing = f >= ring && f < ans ? 1 : 0;
  const reachA = prog(f, reach, 26) * (1 - prog(f, reach + 30, 12) * 0.55) ; // reaches, hesitates, retreats a little
  const grab = prog(f, ans - 24, 22);
  const sitBase = POSES.sit;
  const pose = poseTrack(f, [
    [0, { ...sitBase, head: -12, lean: -4, eyes: 0, smile: 0.2, aL1: -6, aL2: -3, aR1: 6, aR2: 3 }],
    [ring + 6, { ...sitBase, head: -6, lean: -2, eyes: 0.8, smile: 0, brow: 0.3, aL1: -6, aL2: -3, aR1: 6, aR2: 3 }],
    [look + 6, { ...sitBase, head: 10, lean: 6, eyes: 0.7, gaze: -1, brow: 0.7, smile: -0.4, aL1: -6, aL2: -3, aR1: 6, aR2: 3 }],
    [reach, { ...sitBase, head: 8, lean: 8, eyes: 0.5, gaze: 1, brow: 0.7, smile: -0.4, aR1: 70, aR2: 76 }],
    [reach + 24, { ...sitBase, head: 12, lean: 10, eyes: 0.45, gaze: 0.6, brow: 0.8, smile: -0.5, aR1: 40, aR2: 44 }],
    [ans - 22, { ...sitBase, head: 6, lean: 14, eyes: 0.5, gaze: 1, brow: 0.6, smile: -0.2, aR1: 74, aR2: 82 }],
    [ans, { ...sitBase, head: -4, lean: 8, eyes: 0.5, smile: 1, brow: 0.3, aR1: 140, aR2: 168 }],
  ]);
  void reachA; void grab;
  const J = joints(pose, hx, G, 1.5, 0);
  const wraps = 5 + prog(f, ans, 16);
  const tension = 0.42 + prog(f, ans, 20) * 0.12;
  // phone: on the table, then in the hand, then at the ear
  const toHand = prog(f, ans - 8, 10);
  const toEar = prog(f, ans + 4, 16);
  const px = (tableX + (J.handR[0] - tableX) * toHand) + (J.head[0] + 30 - (tableX + (J.handR[0] - tableX) * toHand)) * toEar;
  const py = (tableY - 52 + (J.handR[1] - (tableY - 52)) * toHand) + (J.head[1] + 4 - (tableY - 52 + (J.handR[1] - (tableY - 52)) * toHand)) * toEar;
  return (
    <g>
      <Chair x={hx - 20} y={J.hip[1] + 14} w={150} />
      <path d={`M ${tableX - 90} ${tableY} L ${tableX + 90} ${tableY} M ${tableX - 70} ${tableY} L ${tableX - 70} ${G} M ${tableX + 70} ${tableY} L ${tableX + 70} ${G}`} stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none" />
      <Phone x={px} y={py + 40} ring={ringing * (1 - toHand)} frame={f} />
      <TodoList x={hx - 330} y={330} frame={f} born={look} done={0} rot={-4} />
      <BoundHero x={hx} ground={G + (G - (J.footL[1] > J.footR[1] ? J.footL[1] : J.footR[1]))} scale={1.5} pose={pose} frame={f} wraps={wraps} tension={tension} seed={5} shadowDir={1}  />
    </g>
  );
};

/* C — "Someone makes a joke that hurts you, and you laugh along" ------------------------------ */
const VignetteC: React.FC<{ f: number }> = ({ f }) => {
  const joke = E("c_joke"), hurt = E("c_hurt"), laugh = E("c_laugh");
  const hx = XC + 660, ox = XC + 1280;
  const laughing = prog(f, joke, 10) * (1 - prog(f, laugh + 70, 20) * 0.6);
  const op = P({
    smile: 1, mouthO: 0.75 * laughing, eyes: 0.4, joy: laughing > 0.5 ? 1 : 0,
    head: -10 * laughing, lean: -5 * laughing,
    aL1: -70 * prog(f, joke, 12), aL2: -78 * prog(f, joke, 12),
  });
  const hpose = poseTrack(f, [
    [0, { smile: 0.1, eyes: 0.85, brow: 0.2, lean: 2 }],
    [joke + 6, { smile: 0.1, eyes: 1, brow: 0.2 }],
    [hurt, { smile: -0.9, eyes: 0.75, brow: 0.95, head: 12, lean: 6, aR1: 35, aR2: -140 }],
    [laugh - 10, { smile: -0.7, eyes: 0.7, brow: 0.8, head: 10, lean: 6, aR1: 35, aR2: -140 }],
    [laugh + 8, { smile: 1, mouthO: 0.55, eyes: 0.5, brow: 0.5, head: -3, lean: 0, aR1: 14, aR2: 8 }],
  ]);
  const sh = f > laugh ? Math.sin(f * 0.9) * 2.4 : 0;
  const wraps = 6 + prog(f, laugh, 16);
  const tension = 0.55 + prog(f, laugh, 20) * 0.1;
  const oJ = joints(op, ox, G, 1.5, 0);
  return (
    <g>
      <Stickman x={ox} ground={G} scale={1.5} pose={op} style={3} seed={31} tremble={laughing * 2.5} shadowDir={-1} />
      <LaughMarks x={oJ.head[0] + 6} y={oJ.head[1] - 30} frame={f} on={laughing} />
      <BoundHero x={hx} ground={G} scale={1.5} pose={hpose} frame={f} wraps={wraps} tension={tension} tremble={sh + 0.4} seed={7}  />
    </g>
  );
};

/* D+ — alone, replaying; then the "why" and the pattern ---------------------------------------- */
const MiniReplay: React.FC<{ x: number; y: number; f: number; born: number; kind: number }> = ({ x, y, f, born, kind }) => {
  const a = prog(f, born, 18);
  if (a <= 0) return null;
  const t = (f - born) * 0.16;
  const nod = Math.max(0, Math.sin(t * 2)) * 14;
  const hero = P({ smile: 1, head: nod, eyes: 1 });
  const other = P({ smile: 0.8, aL1: -70, aL2: -76 });
  return (
    <g opacity={a} transform={`translate(${x} ${y}) scale(${0.9 + 0.1 * a})`}>
      <Bubble x={0} y={0} w={380} h={230} />
      <g transform="translate(-140 -92)">
        <Stickman x={110} ground={170} scale={0.56} pose={hero} shadow={false} seed={41 + kind} boilFrame={f} />
        <Stickman x={250} ground={170} scale={0.56} pose={other} style={kind === 0 ? 1 : kind === 1 ? 4 : 3} shadow={false} seed={44 + kind} boilFrame={f} />
        {kind === 0 && <Paper x={196} y={92} rot={-6} w={34} h={44} />}
        {kind === 1 && <g transform="translate(206 78)"><Phone x={0} y={0} ring={0} frame={f} /></g>}
        {kind === 2 && <g transform="translate(250 22)"><LaughMarks x={0} y={0} frame={f} on={1} /></g>}
      </g>
    </g>
  );
};

const VignetteD: React.FC<{ f: number; dark: boolean }> = ({ f, dark }) => {
  const hx = XD + 960;
  const alone = E("d_alone"), think = E("d_think"), frus = E("d_frus"), again = E("d_again"), again2 = E("d_again2");
  const why = E("why"), learn = E("learn");
  const rise = prog(f, why - 4, 40);
  const sitK = 1 - rise;
  const J0 = joints(POSES.sit, hx, G, 1.5, 0);
  const groundY = G + (G - Math.max(J0.footL[1], J0.footR[1])) * 0 ;
  void groundY;
  // posture
  const grabHead = prog(f, frus, 18) * (1 - prog(f, again - 16, 16));
  const nodN = Math.max(Math.sin(Math.PI * clamp((f - again) / 22)), Math.sin(Math.PI * clamp((f - again2) / 22)));
  const sitPose = poseTrack(f, [
    [0, { ...POSES.sitSlump }],
    [frus, { ...POSES.sitSlump }],
    [frus + 18, { ...POSES.sitSlump, aL1: -135, aL2: 130, aR1: 135, aR2: -130, head: 18, lean: 16 }],
    [again - 16, { ...POSES.sitSlump, aL1: -135, aL2: 130, aR1: 135, aR2: -130, head: 18, lean: 16 }],
    [again, { ...POSES.sitSlump, lean: 4, head: 6, smile: 1, eyes: 0.5 }],
    [again2 + 40, { ...POSES.sitSlump, lean: 4, head: 6, smile: 1, eyes: 0.5 }],
  ]);
  void grabHead;
  sitPose.head += nodN * 16;
  const standPose = poseTrack(f, [
    [why, { lean: 6, head: 10, eyes: 0.5, smile: -0.2, brow: 0.5 }],
    [why + 60, { lean: 0, head: 0, eyes: 1, smile: 0, brow: 0.6, gaze: 0 }],
  ]);
  const learnMask = pulse(f, E("f_rej") + 22, 18, 60) + pulse(f, E("f_conf") + 22, 18, 60) + pulse(f, E("f_dis") + 22, 18, 60);
  const smileF = E("smile"), loopF = E("loop"), reachF = E("reach"), askF = E("ask"), everyF = E("every");
  const relief = prog(f, smileF + 6, 24);
  const reachP = prog(f, reachF + 20, 26) * (1 - prog(f, reachF + 60, 24));
  const fPose = poseTrack(f, [
    [why + 60, { ...standPose }],
    [E("f_dis") + 30, { lean: -6, head: -5, eyes: 1, brow: 0.9, smile: 0.2 }],
    [learn, { lean: 0, head: 0, eyes: 1, brow: 0.5, smile: 0.1 }],
    [smileF, { lean: 0, head: 0, eyes: 1, brow: 0.3 }],
    [smileF + 30, { lean: -2, head: -6, eyes: 0.5, brow: 0, smile: 0.5, aL1: -12, aR1: 12 }],
    [loopF + 40, { lean: 2, head: 4, eyes: 0.8, brow: 0.3, smile: 0.2 }],
    [reachF + 18, { lean: 6, head: 10, eyes: 0.9, brow: 0.8, smile: -0.3 }],
    [reachF + 46, { lean: 8, head: 8, eyes: 1, smile: 0.4, aR1: 105, aR2: 125, gaze: 1 }],
    [reachF + 84, { lean: 2, head: -2, eyes: 0.6, smile: 0.6, aR1: 12, aR2: 6, gaze: 0 }],
    [askF + 40, { lean: 4, head: -10, eyes: 1, brow: 0.7, smile: 0, gaze: -0.3 }],
    [everyF + 10, { lean: 6, head: 6, eyes: 0.9, brow: 0.6, smile: 0.2, gaze: 0.8 }],
    [everyF + 90, { lean: 8, head: 12, eyes: 0.5, brow: 0.7, smile: 0.1, gaze: -0.8 }],
  ]);
  const inF = f >= why;
  const pose = inF ? fPose : sitPose;
  const mask = inF ? clamp(learnMask) * (1 - prog(f, learn, 20)) * 0.9 : 0;
  const wraps = 7 + (f >= again ? prog(f, again, 12) : 0) + (f >= again2 ? prog(f, again2, 12) : 0);
  const tension = inF ? 0.5 : 0.55 + (f >= frus ? 0.1 : 0);
  const seatY = J0.hip[1] + 12;
  const ghost = f >= again && f < why;
  const chairOp = (f < why ? 1 : 1 - rise) * prog(f, alone - 10, 20);
  const heroG = inF ? G : G;
  return (
    <g>
      {chairOp > 0.01 && <g opacity={chairOp}><Chair x={hx - 20} y={seatY} w={150} color={dark ? "#111" : C.ink} /></g>}
      {ghost && [1, 2, 3].map((g) => (
        <g key={g} opacity={0.14 * (1 - g / 4)}>
          <Stickman x={hx} ground={heroG} scale={1.5} pose={{ ...sitPose, head: sitPose.head + Math.sin((f - again) * 0.4 - g * 0.9) * 10 }} shadow={false} seed={60 + g} />
        </g>
      ))}
      <BoundHero x={hx} ground={heroG} scale={inF ? 1.3 : 1.5} pose={{ ...pose, mask }} frame={f} wraps={wraps} tension={tension} seed={11} 
        dark={dark} tremble={f >= frus && f < again ? 2.6 : inF ? 0.6 : 0.5} breath={inF ? 1.4 : 1} />
      {f >= again && f < again + 60 && <HandIn f={f} at={again} />}
      {f >= again2 && f < again2 + 60 && <HandIn f={f} at={again2} />}
      {/* replay clouds */}
      {f < think + 40 && <g opacity={1 - prog(f, think - 8, 16)}>
        <MiniReplay x={hx - 360} y={300} f={f} born={E("d_replay1")} kind={0} />
        <MiniReplay x={hx + 20} y={200} f={f} born={E("d_replay2")} kind={1} />
        <MiniReplay x={hx + 400} y={310} f={f} born={E("d_replay3")} kind={2} />
      </g>}
      <WhatIShouldHaveSaid f={f} born={think} until={frus} x={hx} />
      {inF && <PatternGlyphs f={f} hx={hx} J={joints(fPose, hx, G, 1.3, 0)} relief={relief} reachP={reachP} />}
      {f >= frus && f < again && <Scribble x={joints(sitPose, hx, G, 1.5, 0).chest[0]} y={joints(sitPose, hx, G, 1.5, 0).chest[1]} r={26} frame={f} on={prog(f, frus, 12)} seed={2} />}
      <WhyMark f={f} x={hx} born={why} />
    </g>
  );
};

const HandIn: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const p = prog(f, at - 14, 12) * (1 - prog(f, at + 28, 12));
  return (
    <g opacity={p}>
      <g transform={`translate(${XD + 960 + 420 - (1 - p) * 300} ${470})`}>
        <path d="M 0 -26 L 700 -34 L 700 38 L 0 30 Z" fill="#161616" opacity={0.9} />
        <rect x={-60} y={-30} width={72} height={60} rx={24} fill="#161616" />
        <rect x={-96} y={-26} width={44} height={14} rx={7} fill="#161616" />
        <rect x={-100} y={-8} width={50} height={14} rx={7} fill="#161616" />
        <rect x={-96} y={10} width={44} height={14} rx={7} fill="#161616" />
      </g>
    </g>
  );
};

const WhatIShouldHaveSaid: React.FC<{ f: number; born: number; until: number; x: number }> = ({ f, born, until, x }) => {
  const a = prog(f, born, 14) * (1 - prog(f, until - 10, 14));
  if (a <= 0) return null;
  const lines = [0.0, 0.25, 0.5].map((d, i) => ({ w: 160 + i * 30, p: prog(f, born + 10 + d * 40, 22), e: prog(f, born + 70 + i * 14, 14) }));
  return (
    <g opacity={a}>
      <Bubble x={x + 20} y={190} w={470} h={190} tail={[-80, 120]} />
      {lines.map((l, i) => (
        <g key={i}>
          <path d={`M ${x - 180} ${150 + i * 36} L ${x - 180 + l.w * l.p} ${150 + i * 36}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - l.e * 0.6} />
          {l.e > 0 && <path d={`M ${x - 190} ${150 + i * 36} L ${x - 190 + (l.w + 20) * l.e} ${150 + i * 36}`} stroke={C.ink} strokeWidth={9} strokeLinecap="round" opacity={0.15} />}
        </g>
      ))}
    </g>
  );
};

const WhyMark: React.FC<{ f: number; x: number; born: number }> = ({ f, x, born }) => {
  const p = prog(f, born + 6, 46) * (1 - prog(f, E("f_rej") - 10, 30));
  const draw = prog(f, born + 6, 46);
  if (p <= 0) return null;
  const s = 2.4;
  return (
    <g transform={`translate(${x} 250) scale(${s})`} opacity={clamp(p * 2)} fill="none" stroke={C.ink} strokeWidth={3.2 / s * 1.5} strokeLinecap="round">
      <path d="M -34 -52 C -34 -108 44 -108 44 -56 C 44 -24 6 -26 6 10 L 6 22" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      <circle cx={6} cy={52} r={4} fill={C.ink} opacity={prog(f, born + 40, 10)} />
    </g>
  );
};

/** All the diagram-like thoughts that explain the pattern (scene sentences 20–29). */
const PatternGlyphs: React.FC<{ f: number; hx: number; J: ReturnType<typeof joints>; relief: number; reachP: number }> = ({ f, hx, J, relief, reachP }) => {
  const rej = E("f_rej"), conf = E("f_conf"), dis = E("f_dis"), learn = E("learn");
  const p1 = E("f_p1"), p2 = E("f_p2"), p3 = E("f_p3");
  const smile = E("smile"), loop = E("loop"), reach = E("reach"), ask = E("ask"), every = E("every");
  const out = 1 - prog(f, learn + 20, 30);
  const rejP = prog(f, rej, 20) * out;
  const confP = prog(f, conf, 20) * out;
  const disP = prog(f, dis, 20) * out;
  const walkOff = (f - rej) * 3.2;
  return (
    <g>
      {/* rejection: someone turns and walks away */}
      {rejP > 0.01 && (
        <g opacity={rejP}>
          <Stickman x={hx + 520 + walkOff} ground={G} scale={1.1} pose={P({ ...walk((f - rej) * 0.3, 0.9), smile: -0.2 })} style={2} shadow={false} seed={77} />
        </g>
      )}
      {/* conflict: two faces and a crack of lightning */}
      {confP > 0.01 && (
        <g opacity={confP}>
          <FaceDisc x={hx - 640} y={520} r={52} mood={-1} />
          <FaceDisc x={hx - 340} y={520} r={52} mood={-1} />
          <path d={`M ${hx - 560} 470 L ${hx - 520} 520 L ${hx - 548} 524 L ${hx - 500} 575 L ${hx - 470} 520 L ${hx - 450} 516`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinejoin="round" opacity={0.6 + 0.4 * Math.sin(f * 0.7)} />
        </g>
      )}
      {/* disapproval: a large frowning face looming above */}
      {disP > 0.01 && (
        <g opacity={disP * 0.9} transform={`translate(0 ${(1 - disP) * -40 + Math.sin(f * 0.05) * 6})`}>
          <FaceDisc x={hx + 40} y={190} r={96} mood={-1} />
        </g>
      )}
      {/* the loop the mind learns */}
      {f > learn && f < p1 + 20 && (
        <g opacity={prog(f, learn, 20) * (1 - prog(f, p1 + 4, 14))}>
          <Arrow a={[hx - 130, 300]} b={[hx + 130, 300]} bulge={-120} p={prog(f, learn + 6, 40)} />
          <Arrow a={[hx + 130, 340]} b={[hx - 130, 340]} bulge={110} p={prog(f, learn + 36, 40)} />
        </g>
      )}
      {/* three rules */}
      {[p1, p2, p3].map((pp, i) => <RuleCard key={i} f={f} born={pp} x={hx - 560 + i * 560} y={250} i={i} until={smile - 6} />)}
      {/* relief: a smile appears, he exhales */}
      {f >= smile && f < every + 200 && (
        <g opacity={prog(f, smile, 18) * (1 - prog(f, ask - 20, 20))}>
          <FaceDisc x={hx + 470} y={420} r={72} mood={1} />
          <Light x={hx + 470} y={290} on={prog(f, smile + 10, 14)} size={13} frame={f} seed={1} />
          <path d={`M ${J.head[0] + 50} ${J.head[1] + 14} q 24 -8 44 4 M ${J.head[0] + 50} ${J.head[1] + 30} q 24 -6 40 8`} stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" opacity={relief * (1 - prog(f, smile + 60, 20))} />
        </g>
      )}
      {/* reinforcement loop: a light circles him */}
      {f >= loop && f < reach - 6 && (
        <g opacity={prog(f, loop, 16) * (1 - prog(f, reach - 26, 20))}>
          <ellipse cx={hx} cy={520} rx={330} ry={250} fill="none" stroke={C.ink} strokeWidth={2.4} strokeDasharray="4 14" opacity={0.5} strokeLinecap="round" />
          {[0, 1, 2].map((k) => {
            const a = (f - loop) * 0.045 + (k * Math.PI * 2) / 3;
            return k === 0 ? <Light key={k} x={hx + Math.cos(a) * 330} y={520 + Math.sin(a) * 250} on={1} size={12} frame={f} seed={k} /> : <FaceDisc key={k} x={hx + Math.cos(a) * 330} y={520 + Math.sin(a) * 250} r={26} mood={k === 1 ? 1 : 0.4} />;
          })}
        </g>
      )}
      {/* discomfort → reach for approval */}
      {f >= reach - 4 && f < ask - 10 && (
        <g>
          <Scribble x={J.chest[0]} y={J.chest[1]} r={24} frame={f} on={prog(f, reach, 16) * (1 - prog(f, reach + 56, 24))} seed={3} />
          <Light x={hx + 380} y={410} on={prog(f, reach + 8, 14) * (1 - prog(f, reach + 70, 20) * 0.5)} size={13} frame={f} seed={2} />
          {reachP > 0 && <path d={`M ${J.handR[0]} ${J.handR[1]} L ${hx + 376} 414`} stroke={C.light} strokeWidth={2} opacity={0.5} strokeDasharray="3 8" />}
        </g>
      )}
      {/* "do I actually want this?" — erased */}
      {f >= ask && f < every && (
        <g opacity={prog(f, ask, 16) * (1 - prog(f, every - 12, 16))}>
          <Bubble x={hx + 20} y={220} w={300} h={170} tail={[-60, 110]} />
          <g transform={`translate(${hx + 20} 215)`} opacity={1 - prog(f, ask + 50, 40)}>
            <path d="M -22 -30 C -22 -62 30 -62 30 -30 C 30 -8 4 -10 4 14 L 4 22" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
            <circle cx={4} cy={46} r={5} fill={C.ink} />
          </g>
        </g>
      )}
      {/* "what will keep everyone happy?" */}
      {f >= every && (
        <g opacity={prog(f, every, 20)}>
          <Bubble x={hx} y={210} w={640} h={200} tail={[-30, 130]} />
          {[0, 1, 2, 3].map((i) => <FaceDisc key={i} x={hx - 225 + i * 150} y={208 + Math.sin(f * 0.04 + i) * 5} r={44} mood={0.9} opacity={prog(f, every + 10 + i * 10, 14)} />)}
        </g>
      )}
      <Dummy n={noise(0, 0) + reachP} />
    </g>
  );
};
const Dummy: React.FC<{ n: number }> = () => null;

const RuleCard: React.FC<{ f: number; born: number; x: number; y: number; i: number; until: number }> = ({ f, born, x, y, i, until }) => {
  const a = prog(f, born, 18) * (1 - prog(f, until, 16));
  if (a <= 0.01) return null;
  const t = f - born;
  const hero = P({ smile: 1, head: i === 0 ? Math.max(0, Math.sin(t * 0.22)) * 14 : 0 });
  return (
    <g opacity={a} transform={`translate(${x} ${y})`}>
      <Bubble x={0} y={0} w={440} h={260} />
      <g transform="translate(-170 -108)">
        <Stickman x={90} ground={200} scale={0.62} pose={hero} shadow={false} seed={80 + i} boilFrame={f} />
        {i === 0 && <FaceDisc x={290} y={110} r={44} mood={kf(t, [[10, -1], [60, 0.9]])} />}
        {i === 1 && <><Paper x={175} y={110} rot={-8} w={34} h={44} /><Stickman x={290} ground={200} scale={0.62} pose={P({ smile: 0.6 })} style={2} shadow={false} seed={90} boilFrame={f} />
          <path d="M 230 95 Q 262 110 262 95" stroke={C.ink} strokeWidth={2.4} fill="none" opacity={prog(t, 30, 20)} /></>}
        {i === 2 && <><Stickman x={290} ground={200} scale={0.62} pose={P({ smile: 0.8 })} style={4} shadow={false} seed={91} boilFrame={f} />
          <path d="M 130 120 Q 210 150 262 120" stroke={C.ink} strokeWidth={3} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(t, 14, 36)} /></>}
      </g>
    </g>
  );
};
