import React from "react";
import { AbsoluteFill } from "remotion";
import { Caption } from "../components/Caption";
import { CameraMotion, CamKey, World } from "../components/CameraMotion";
import { FaceDisc } from "../components/Glyphs";
import { Light, LightDefs } from "../components/ApprovalLights";
import { Dust, PaperBackground } from "../components/PaperBackground";
import { Floor } from "../components/Props";
import { useGF } from "../components/SceneFrame";
import { Stickman } from "../components/Stickman";
import { FloorThread } from "../components/ThreadSystem";
import { T } from "../data/strings";
import { ev, sceneRanges, TOTAL_FRAMES } from "../data/timing";
import { C, FONT_SERIF } from "../theme";
import { hash, prog } from "../utils/animation";
import { joints, P, poseTrack } from "../utils/rig";

const E = (n: string, o = 0) => ev(`final.${n}`, o);
const G = 830, HX = 960;

export const FinalScene: React.FC = () => {
  const f = useGF();
  const s0 = sceneRanges[6].from;
  const ask = E("ask"), own = E("own"), small = E("small"), honest = E("honest"), line = E("line"), feel = E("feel"), threads = E("threads"), hold = E("hold");
  const textIn = E("textIn"), textOut = E("textOut"), white = E("white"), logo = E("logo");

  const base = { lean: 0, head: -2, eyes: 1, brow: 0.05, smile: 0.4 };
  const pose = poseTrack(f, [
    [s0, { ...base, smile: 0.3, aR1: 9 }],
    [ask - 10, { ...base, aR1: 24, aR2: 150, smile: 0.2 }],          // a hand to the chest
    [own, { ...base, aR1: 24, aR2: 150, smile: 0.3 }],
    [small, { ...base, aR1: 9, aR2: 5, head: -4, smile: 0.4 }],
    [honest, { ...base, aR1: 40, aR2: 70, smile: 0.5 }],
    [honest + 50, { ...base, aR1: 30, aR2: 56, smile: 0.5 }],
    [line, { ...base, lean: 8, head: 4, aR1: 70, aR2: 70 }],
    [line + 40, { ...base, lean: 0, aR1: 9, aR2: 5 }],
    [feel, { ...base, gaze: 1, smile: 0.5, joy: 0 }],
    [threads, { ...base, head: -6, smile: 0.55, gaze: 0 }],
    [hold + 60, { ...base, head: -4, smile: 0.7, joy: 1 }],
  ]);
  const J = joints(pose, HX, G, 1.5, 0);
  const cam: CamKey[] = [
    [s0, { cx: 960, cy: 560, s: 1.04 }],
    [own, { cx: 960, cy: 520, s: 1.3 }],
    [small, { cx: 960, cy: 520, s: 1.3 }],
    [small + 70, { cx: 980, cy: 470, s: 0.9 }],
    [feel + 40, { cx: 1100, cy: 520, s: 0.9 }],
    [threads, { cx: 1000, cy: 540, s: 1.0 }],
    [hold + 90, { cx: 960, cy: 520, s: 1.12 }],
    [textIn, { cx: 960, cy: 500, s: 1.18 }],
  ];
  const world = 1 - prog(f, white, 90);
  const whiteA = prog(f, white, 78);
  const ownA = prog(f, own, 40);
  const lineP = prog(f, line + 10, 40);
  const fallen = [0, 1, 2, 3, 4, 5];

  return (
    <AbsoluteFill>
      <PaperBackground dark={0} constrict={0} spot={[0.5, 0.5]}>
        <Dust opacity={0.5} />
      </PaperBackground>
      <AbsoluteFill style={{ opacity: world }}>
        <CameraMotion keys={cam} drift={1.5}>
          <World>
            <LightDefs />
            <Floor y={G} />
            <Stickman x={HX} ground={G} scale={1.5} pose={pose} seed={3} breath={1.4} />
            {/* his own light, kept in his chest */}
            <Light x={J.chest[0]} y={J.chest[1]} on={ownA * 0.9} size={11} frame={f} seed={2} />
            <Light x={J.handR[0] + 10} y={J.handR[1] - 16} on={prog(f, honest, 30) * (1 - prog(f, line, 30))} size={10} frame={f} seed={3} />
            {/* the boundary he draws on the floor */}
            <path d={`M ${HX + 330} ${G + 20} L ${HX + 330} ${G - 140}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lineP} opacity={0.75} />
            {f >= feel - 20 && (
              <g opacity={prog(f, feel - 20, 30)}>
                <Stickman x={HX + 640} ground={G} scale={1.3} pose={P({ smile: -0.3, brow: 0.6, head: 8 })} style={3} seed={91} shadowDir={-1} />
                <FaceDisc x={HX + 640} y={G - 480} r={34} mood={Math.sin((f - feel) * 0.05) * 0.5 - 0.1} opacity={0.9} />
              </g>
            )}
            {/* a few loose threads drift down and rest on the floor */}
            {fallen.map((k) => {
              const t0 = threads + k * 14;
              const p = prog(f, t0, 70);
              const x = HX - 300 + k * 110 + (hash(k) - 0.5) * 70;
              return p > 0 && p < 1 ? (
                <path key={`d${k}`} d={`M ${x} ${100 + p * 700} q 14 24 0 50 q -14 24 2 50`} stroke={C.ink} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={1 - Math.max(0, p - 0.9) * 10} />
              ) : null;
            })}
            {fallen.map((k) => <FloorThread key={k} x={HX - 330 + k * 112} y={G + 6 + (k % 2) * 7} len={90 + (k % 3) * 36} seed={k + 5} appear={threads + k * 14 + 68} frame={f} />)}
          </World>
        </CameraMotion>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fbfaf6", opacity: whiteA }} />
      <Caption text={T.final} from={textIn} to={textOut + 30} at="upper" size={78} fadeIn={48} fadeOut={44} />
      <LogoCard f={f} logo={logo} />
    </AbsoluteFill>
  );
};

const LogoCard: React.FC<{ f: number; logo: number }> = ({ f, logo }) => {
  const a = prog(f, logo, 54) * (1 - prog(f, TOTAL_FRAMES - 26, 24));
  if (a <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: a }}>
      <div style={{ fontFamily: FONT_SERIF, fontWeight: 600, fontSize: 96, letterSpacing: `${0.36 - 0.14 * prog(f, logo, 120)}em`, color: C.ink, paddingLeft: "0.3em" }}>{T.logo}</div>
    </AbsoluteFill>
  );
};
