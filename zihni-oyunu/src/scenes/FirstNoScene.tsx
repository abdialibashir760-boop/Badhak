import React from "react";
import { AbsoluteFill } from "remotion";
import { BoundHero } from "../components/BoundHero";
import { Caption } from "../components/Caption";
import { CameraMotion, CamKey, World } from "../components/CameraMotion";
import { FaceDisc, Paper, Scribble } from "../components/Glyphs";
import { Light, LightDefs } from "../components/ApprovalLights";
import { Dust, PaperBackground } from "../components/PaperBackground";
import { Bubble, Floor } from "../components/Props";
import { useGF } from "../components/SceneFrame";
import { Stickman } from "../components/Stickman";
import { T } from "../data/strings";
import { ev, sceneRanges } from "../data/timing";
import { C, FONT_SERIF } from "../theme";
import { kf, noise, prog } from "../utils/animation";
import { joints, P, poseTrack, walk } from "../utils/rig";

const E = (n: string, o = 0) => ev(`firstNo.${n}`, o);
const G = 830, HX = 780;

/** A calm, intact room: window, door and a patch of light on the floor. */
const Room: React.FC<{ warm: number; f: number }> = ({ warm, f }) => (
  <g>
    <path d="M -600 560 L 2700 560" stroke={C.ink} strokeWidth={1.5} opacity={0.14} />
    {/* window */}
    <g opacity={0.55}>
      <rect x={1380} y={170} width={300} height={290} fill="#f6f2e4" opacity={0.35 + warm * 0.4} stroke={C.ink} strokeWidth={5} />
      <path d="M 1530 170 L 1530 460 M 1380 315 L 1680 315" stroke={C.ink} strokeWidth={4} />
    </g>
    <path d={`M 1380 460 L 1680 460 L 1980 ${G} L 1180 ${G} Z`} fill={C.light} opacity={0.05 + warm * 0.12} />
    {/* door */}
    <g opacity={0.5} fill="none" stroke={C.ink} strokeWidth={5}>
      <rect x={120} y={260} width={220} height={G - 260} />
      <circle cx={310} cy={560} r={9} fill={C.ink} />
    </g>
    {/* lamp swaying very slightly: the room stays intact */}
    <g transform={`translate(1040 0) rotate(${Math.sin(f * 0.03) * 0.8} 0 0)`}>
      <path d="M 0 0 L 0 150" stroke={C.ink} strokeWidth={3} />
      <path d="M -44 200 L 44 200 L 20 150 L -20 150 Z" fill="#e9e4d3" stroke={C.ink} strokeWidth={3.5} />
      <circle cx={0} cy={206} r={7} fill={C.light} opacity={0.35 + warm * 0.55} />
    </g>
  </g>
);

export const FirstNoScene: React.FC = () => {
  const f = useGF();
  const s0 = sceneRanges[4].from, end = sceneRanges[5].from;
  const enter = E("enter"), ask = E("ask"), rises = E("rises"), course = E("course"), pause = E("pause"), chest = E("chest"), fear = E("fear");
  const allow = E("allow"), raise = E("raise"), say = E("say"), leave = E("leave"), urge = E("urge"), wait = E("wait"), breathe = E("breathe");
  const calm = E("calm"), maybe1 = E("maybe1"), maybe2 = E("maybe2"), learned = E("learned"), danger = E("danger"), loosen = E("loosen");
  const imp = [E("impulse1"), E("impulse2"), E("impulse3")];

  const dark = kf(f, [[s0, 0.4], [rises, 0.3], [say, 0.2], [leave + 60, 0.14], [calm, 0.08], [danger, 0.0]]);
  const constrict = kf(f, [[s0, 0.55], [pause, 0.55], [say, 0.4], [calm, 0.3], [danger, 0.12]]);
  const warm = prog(f, calm, 200);

  // --- the other person ------------------------------------------------------------------------
  const ox = kf(f, [
    [s0, 2350], [enter, 2350], [ask - 10, 1480],
    [leave, 1480], [leave + 150, 1700], [maybe1, 1900], [maybe2 + 20, 1900], [learned + 30, 2400],
  ]);
  const moving = (f > enter && f < ask - 10) || (f > leave + 10 && f < maybe1 - 10) || (f > maybe2 + 20 && f < learned + 60);
  const speedK = f > leave ? 0.12 : 0.2;
  const asked = prog(f, ask, 14) * (1 - prog(f, leave, 14));
  const disappointed = prog(f, leave, 16);
  const lookBack = prog(f, maybe1 - 20, 20) * (1 - prog(f, maybe2 + 20, 20));
  const oPose = P({
    ...(moving ? walk(f * speedK, 0.85) : {}),
    smile: 0.4 * (1 - disappointed) - 0.5 * disappointed + 0.1 * lookBack,
    brow: disappointed * 0.6,
    head: disappointed * 12 * (1 - lookBack),
    gaze: -1 * lookBack,
    ...(asked > 0.01 ? { aL1: -78 * asked, aL2: -88 * asked } : {}),
  });
  const oJ = joints(oPose, ox, G, 1.5, 0);

  // --- hero -------------------------------------------------------------------------------------
  const frozenNod = Math.min(1, prog(f, course, 20));
  const hp = poseTrack(f, [
    [s0, { lean: 10, head: 14, eyes: 0.4, brow: 0.6, smile: -0.3 }],
    [ask + 30, { lean: 10, head: 14, eyes: 0.4, brow: 0.6, smile: -0.3 }],
    [E("tired"), { lean: 12, head: 16, eyes: 0.3, brow: 0.7, smile: -0.35 }],
    [rises - 10, { lean: 11, head: 15, eyes: 0.35, brow: 0.7, smile: -0.3 }],
    [course, { lean: 14, head: 22, eyes: 0.4, brow: 0.8, smile: 0.5, aR1: 44, aR2: 70 }],
    [pause - 4, { lean: 14, head: 24, eyes: 0.5, brow: 0.85, smile: 0.7, aR1: 62, aR2: 88 }],
    [chest, { lean: 14, head: 24, eyes: 0.5, brow: 0.85, smile: 0.7, aR1: 62, aR2: 88 }],
    [fear + 30, { lean: 12, head: 20, eyes: 0.7, brow: 0.95, smile: 0.1, aR1: 40, aR2: 40 }],
    [allow + 30, { lean: 8, head: 14, eyes: 0.6, brow: 0.8, smile: 0, aR1: 14, aR2: 10 }],
    [raise + 70, { lean: 2, head: -4, eyes: 1, brow: 0.35, smile: 0.05, aR1: 9, aR2: 5 }],
    [say + 20, { lean: 0, head: -6, eyes: 1, brow: 0.3, smile: 0.1, mouthO: 0.5 }],
    [leave, { lean: 0, head: -4, eyes: 1, brow: 0.3, smile: 0.0, mouthO: 0 }],
    [urge, { lean: 3, head: 8, eyes: 0.9, brow: 0.9, smile: -0.4, aR1: 70, aR2: 92 }],
    [urge + 40, { lean: 5, head: 8, eyes: 0.9, brow: 0.95, smile: -0.4, aR1: 118, aR2: 130, gaze: 1 }],
    [wait, { lean: 5, head: 6, eyes: 0.85, brow: 0.9, smile: -0.2, aR1: 120, aR2: 132, gaze: 1 }],
    [wait + 50, { lean: 1, head: 0, eyes: 0.8, brow: 0.6, smile: 0.0, aR1: 24, aR2: 12, gaze: 0.4 }],
    [breathe + 40, { lean: 0, head: -2, eyes: 0.7, brow: 0.4, smile: 0.05, aL1: -17, aR1: 17 }],
    [breathe + 100, { lean: 0, head: -2, eyes: 0.75, brow: 0.3, smile: 0.1, aL1: -9, aR1: 9 }],
    [calm + 60, { lean: -1, head: -4, eyes: 0.9, brow: 0.2, smile: 0.2, gaze: 0.6 }],
    [danger + 40, { lean: -2, head: -4, eyes: 1, brow: 0.1, smile: 0.3, gaze: 0 }],
  ]);
  void frozenNod;
  const J = joints(hp, HX, G, 1.5, 0);

  // pulling threads: tense until the end; one strand loosens
  const tight = kf(f, [[s0, 0.55], [rises, 0.7], [pause, 0.82], [urge, 1.0], [wait, 0.85], [calm, 0.6], [danger, 0.55]]);
  const loose = prog(f, loosen, 80);
  const tensionFn = (k: number) => (k === 0 ? tight * (1 - loose * 0.95) : tight);

  const breathAmp = f >= breathe && f < calm + 100 ? 1 + 4 * prog(f, breathe, 20) * (1 - prog(f, calm + 40, 60)) : f >= allow && f < raise ? 2.5 : 1;

  // camera
  const cam: CamKey[] = [
    [s0, { cx: 1080, cy: 540, s: 0.95 }],
    [ask, { cx: 1000, cy: 530, s: 1.05 }],
    [course, { cx: 900, cy: 500, s: 1.2 }],
    [pause, { cx: 860, cy: 470, s: 1.3 }],
    [chest + 40, { cx: 800, cy: 450, s: 1.5 }],
    [allow + 40, { cx: 800, cy: 470, s: 1.6 }],
    [raise + 50, { cx: 800, cy: 430, s: 1.6 }],
    [say + 40, { cx: 960, cy: 470, s: 1.2 }],
    [leave + 60, { cx: 1180, cy: 520, s: 1.0 }],
    [urge + 20, { cx: 960, cy: 480, s: 1.3 }],
    [wait + 20, { cx: 820, cy: 450, s: 1.5 }],
    [calm, { cx: 900, cy: 480, s: 1.2 }],
    [maybe1, { cx: 1180, cy: 520, s: 1.0 }],
    [danger, { cx: 1050, cy: 520, s: 0.88 }],
    [end, { cx: 1020, cy: 540, s: 0.84 }],
  ];

  const bubbleA = prog(f, say, 12) * (1 - prog(f, leave + 50, 18));

  return (
    <AbsoluteFill>
      <PaperBackground dark={dark} constrict={constrict} spot={[0.45, 0.55]}>
        <Dust opacity={0.25 + warm * 0.2} />
      </PaperBackground>
      <CameraMotion keys={cam} drift={f >= pause && f < raise ? 1 : 2.5}>
        <World>
          <LightDefs />
          <Room warm={warm} f={f} />
          <Floor y={G} dark={dark > 0.25} />
          <Stickman x={ox} ground={G} scale={1.5} pose={oPose} style={2} seed={34} shadowDir={-1} tremble={0} />
          {asked > 0.05 && <g opacity={asked}><Paper x={oJ.handL[0] - 36} y={oJ.handL[1] - 10} rot={-8} /></g>}
          {asked > 0.05 && <Bubble x={ox + 60} y={oJ.head[1] - 120} w={130} h={80} tail={[-40, 60]} opacity={asked} dots />}
          <BoundHero x={HX} ground={G} scale={1.5} pose={hp} frame={f} wraps={14} tension={tensionFn} seed={3} reach={300} stringCount={7}
            tremble={f >= urge && f < wait ? 1.8 : f >= pause && f < raise ? 0.5 : 0.8} breath={breathAmp} />
          {/* tension in the chest — allowed to stay */}
          <Scribble x={J.chest[0]} y={J.chest[1]} r={24} frame={f} on={prog(f, chest, 24) * (1 - prog(f, calm, 140) * 0.9)} seed={5} />
          {/* fear: the thought of disappointment */}
          {f >= fear && f < allow + 40 && (
            <g opacity={prog(f, fear, 18) * (1 - prog(f, allow + 10, 30))}>
              <Bubble x={HX + 190} y={J.head[1] - 130} w={170} h={120} tail={[-90, 82]} />
              <FaceDisc x={HX + 190} y={J.head[1] - 130} r={38} mood={-0.9} />
            </g>
          )}
          {/* the sentence */}
          {bubbleA > 0.01 && (
            <g opacity={bubbleA}>
              <Bubble x={HX + 30} y={J.head[1] - 150} w={560} h={110} tail={[-10, 100]} />
              <text x={HX + 30} y={J.head[1] - 134} textAnchor="middle" fontFamily={FONT_SERIF} fontSize={48} fontWeight={600} fill={C.ink}>{T.say}</text>
            </g>
          )}
          {/* impulses to take it back */}
          {imp.map((t, i) => <Impulse key={i} f={f} born={t} i={i} x={J.head[0] + 70} y={J.head[1] - 70} />)}
          {/* ambiguous reaction in the distance */}
          {f >= maybe1 && f < learned + 30 && (
            <g opacity={prog(f, maybe1, 16) * (1 - prog(f, learned, 24))}>
              <FaceDisc x={ox} y={oJ.head[1] - 100} r={30} mood={Math.sin((f - maybe1) * 0.09) * 0.7} />
            </g>
          )}
          {f >= calm && f < end && <Light x={1060} y={206} on={warm * 0.6} size={22} frame={f} seed={4} tone={0.6} />}
        </World>
      </CameraMotion>
      <Caption text={T.danger} from={danger} to={danger + 160} at="lower" size={56} italic />
    </AbsoluteFill>
  );
};

const Impulse: React.FC<{ f: number; born: number; i: number; x: number; y: number }> = ({ f, born, i, x, y }) => {
  const t = f - born;
  if (t < 0 || t > 90) return null;
  const rise = prog(f, born, 34);
  const a = prog(f, born, 10) * (1 - prog(f, born + 56, 30));
  const px = x + rise * 120 + noise(f * 0.05, i) * 4, py = y - 40 - rise * 60;
  const held = prog(f, born + 40, 20);
  return (
    <g opacity={a} transform={`translate(${px} ${py}) scale(${1 - held * 0.4})`}>
      <Bubble x={0} y={0} w={130} h={92} />
      {i === 0 && [0, 1, 2].map((k) => <path key={k} d={`M -40 ${-18 + k * 18} l ${64 - k * 10} 0`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.7} />)}
      {i === 1 && <g transform="scale(0.8)"><Paper x={0} y={0} w={54} h={68} /></g>}
      {i === 2 && <><FaceDisc x={-6} y={0} r={26} mood={1} /><circle cx={34} cy={-26} r={7} fill={C.light} /></>}
    </g>
  );
};

