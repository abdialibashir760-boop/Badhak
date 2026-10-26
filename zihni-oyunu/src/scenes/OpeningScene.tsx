import React from "react";
import { AbsoluteFill } from "remotion";
import { Caption } from "../components/Caption";
import { CameraMotion, World } from "../components/CameraMotion";
import { PaperBackground, Dust } from "../components/PaperBackground";
import { Floor } from "../components/Props";
import { useGF } from "../components/SceneFrame";
import { ShadowHand, HandKind } from "../components/ShadowHands";
import { Stickman } from "../components/Stickman";
import { Threads, Wrap, ThreadDef } from "../components/ThreadSystem";
import { ev, sec } from "../data/timing";
import { C, FONT_SERIF } from "../theme";
import { clamp, prog } from "../utils/animation";
import { joints, P, Pt } from "../utils/rig";

const GROUND = 830, HX = 960, SC = 1.5;

type Req = { side: "r" | "l" | "t"; kind: HandKind; dy: number; seg: string; at: number };
const REQS: Req[] = [
  { side: "r", kind: "task", dy: 0, seg: "foreR", at: 0.72 },
  { side: "l", kind: "phone", dy: -20, seg: "foreL", at: 0.72 },
  { side: "t", kind: "point", dy: 0, seg: "upR", at: 0.5 },
  { side: "r", kind: "calendar", dy: 40, seg: "upL", at: 0.5 },
  { side: "l", kind: "phone", dy: 30, seg: "torso", at: 0.3 },
  { side: "t", kind: "point", dy: 0, seg: "torso", at: 0.62 },
  { side: "r", kind: "task", dy: -30, seg: "foreR", at: 0.35 },
  { side: "l", kind: "calendar", dy: 0, seg: "foreL", at: 0.35 },
  { side: "t", kind: "point", dy: 0, seg: "thighR", at: 0.5 },
  { side: "r", kind: "phone", dy: 60, seg: "thighL", at: 0.5 },
  { side: "l", kind: "task", dy: 40, seg: "upR", at: 0.22 },
  { side: "t", kind: "point", dy: 0, seg: "upL", at: 0.22 },
  { side: "r", kind: "phone", dy: -10, seg: "shinR", at: 0.5 },
  { side: "l", kind: "task", dy: 10, seg: "shinL", at: 0.5 },
];

const segPts = (J: ReturnType<typeof joints>, seg: string): [Pt, Pt] => {
  switch (seg) {
    case "foreR": return [J.elbowR, J.handR];
    case "foreL": return [J.elbowL, J.handL];
    case "upR": return [J.shoulder, J.elbowR];
    case "upL": return [J.shoulder, J.elbowL];
    case "torso": return [J.hip, J.neck];
    case "thighR": return [J.hipR, J.kneeR];
    case "thighL": return [J.hipL, J.kneeL];
    case "shinR": return [J.kneeR, J.footR];
    default: return [J.kneeL, J.footL];
  }
};

export const OpeningScene: React.FC = () => {
  const f = useGF();
  const freezeF = ev("opening.freeze");
  const ft = Math.min(f, freezeF);
  const frozen = f >= freezeF;
  const titleF = ev("opening.title");
  const questionF = ev("opening.question");

  const reqF = REQS.map((_, k) => ev(`opening.r${k + 1}`));
  const nodF = REQS.map((_, k) => ev(`opening.n${k + 1}`));
  const accepted = nodF.filter((n) => ft >= n).length;
  const strain = clamp(accepted / REQS.length);

  let nod = 0;
  nodF.forEach((n) => { nod = Math.max(nod, Math.sin(Math.PI * clamp((ft - n) / 20))); });

  const pose = P({
    smile: 1, eyes: 1, brow: 0.2 + strain * 0.5,
    head: 3 + nod * 16 + strain * 4, lean: strain * 7,
    aL1: -9 - strain * 22, aL2: -5 - strain * 14, aR1: 9 + strain * 22, aR2: 5 + strain * 14,
    lL1: -5 - strain * 7, lL2: -2, lR1: 5 + strain * 7, lR2: 2,
  });
  const J = joints(pose, HX, GROUND, SC, 0);

  const wraps = REQS.map((r, k) => {
    const [a, b] = segPts(J, r.seg);
    return { a, b, born: nodF[k], at: r.at };
  });
  const threads: ThreadDef[] = REQS.map((r, k) => {
    const { a, b, at } = wraps[k];
    const from: Pt = [a[0] + (b[0] - a[0]) * at, a[1] + (b[1] - a[1]) * at];
    const anchor: Pt = r.side === "r" ? [2300, 160 + k * 60] : r.side === "l" ? [-380, 200 + k * 55] : [HX + (k % 2 ? 420 : -420), -420];
    const pulseT = Math.max(0, 1 - (ft - nodF[k]) / 25);
    return { from, to: anchor, born: reqF[k] + 8, dur: 22, tension: clamp(0.18 + strain * 0.7 + pulseT * 0.25), sag: 140, width: 2 };
  });

  const hands = REQS.map((r, k) => {
    const start = reqF[k];
    const p = prog(ft, start, 15) * (1 - prog(ft, start + 54, 16));
    const fromP: Pt = r.side === "r" ? [2250, 420 + r.dy] : r.side === "l" ? [-330, 440 + r.dy] : [HX + (k % 2 ? 180 : -180), -330];
    const target: Pt = r.side === "r" ? [HX + 300, 500 + r.dy] : r.side === "l" ? [HX - 300, 500 + r.dy] : [HX + (k % 2 ? 80 : -80), 235];
    return { p, fromP, target, kind: r.kind, key: k };
  });

  const cam = [
    [0, { cx: 960, cy: 560, s: 0.96 }],
    [freezeF, { cx: 960, cy: 520, s: 1.12 }],
    [titleF - 10, { cx: 960, cy: 470, s: 1.5 }],
  ] as const;

  const worldFade = 1 - prog(f, titleF, 30) * 0.94;
  const dim = frozen ? prog(f, freezeF, 40) : 0;

  return (
    <AbsoluteFill>
      <PaperBackground constrict={strain * 0.5 + dim * 0.2} spot={[0.5, 0.52]} dark={dim * 0.08}>
        <Dust opacity={0.25} />
      </PaperBackground>
      <AbsoluteFill style={{ opacity: worldFade }}>
        <CameraMotion keys={cam}>
          <World>
            <path d={`M -400 ${GROUND - 125} L 2400 ${GROUND - 125}`} stroke={C.ink} strokeWidth={1.4} opacity={0.1} />
            <Floor y={GROUND} />
            <Stickman x={HX} ground={GROUND} scale={SC} pose={pose} tremble={0.3 + strain * 2.3} breath={frozen ? 0.2 : 1} boilFrame={ft} seed={3} />
            {wraps.map((w, k) => <Wrap key={k} a={w.a} b={w.b} at={w.at} born={w.born} frame={ft} tight={strain} turns={4} />)}
            <Threads frame={ft} defs={threads} seed={4} />
            {hands.map((h) => <ShadowHand key={h.key} from={h.fromP} target={h.target} p={h.p} kind={h.kind} frame={ft} seed={h.key} />)}
          </World>
        </CameraMotion>
      </AbsoluteFill>

      <Caption text="Relief is not always happiness." from={ev("opening.relief")} to={freezeF - 6} at="lower" size={46} italic />
      <Caption text={"When was the last time you said no\nwithout feeling guilty?"} from={questionF} to={titleF - 8} at="upper" size={62} fadeIn={36} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: prog(f, titleF, 36) * (1 - prog(f, titleF + sec(2.9), 14)) }}>
        <div style={{ fontFamily: FONT_SERIF, fontWeight: 600, fontSize: 112, letterSpacing: `${0.2 - 0.12 * prog(f, titleF, 90)}em`, color: C.ink, textAlign: "center", lineHeight: 1.1 }}>
          THE PRISON
          <br />
          OF BEING LIKED
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
