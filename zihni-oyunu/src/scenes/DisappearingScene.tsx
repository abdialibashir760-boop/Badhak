import React from "react";
import { AbsoluteFill } from "remotion";
import { Caption } from "../components/Caption";
import { CameraMotion, CamKey, World } from "../components/CameraMotion";
import { FaceDisc, Scribble } from "../components/Glyphs";
import { Mask } from "../components/Mask";
import { Mirror } from "../components/Mirror";
import { Dust, PaperBackground } from "../components/PaperBackground";
import { Chair, Clock, Floor } from "../components/Props";
import { useGF } from "../components/SceneFrame";
import { ShadowHand } from "../components/ShadowHands";
import { Stickman } from "../components/Stickman";
import { Tangle, Threads, ThreadDef, Wrap } from "../components/ThreadSystem";
import { segPts, WRAP_ORDER } from "../components/BoundHero";
import { ev, sceneRanges } from "../data/timing";
import { C } from "../theme";
import { clamp, hash, kf, prog } from "../utils/animation";
import { joints, P, Pose, poseTrack, POSES, Pt } from "../utils/rig";

const E = (n: string, o = 0) => ev(`disappearing.${n}`, o);
const G = 830, HX = 800, MX = 1400, MY = 500;

const Cup: React.FC<{ x: number; y: number; f: number; steam?: number }> = ({ x, y, f, steam = 1 }) => (
  <g>
    <path d={`M ${x - 32} ${y - 50} L ${x + 32} ${y - 50} L ${x + 24} ${y} L ${x - 24} ${y} Z`} fill="#f3f0e6" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d={`M ${x + 32} ${y - 40} q 28 4 0 30`} fill="none" stroke={C.ink} strokeWidth={4} />
    {[0, 1].map((i) => <path key={i} d={`M ${x - 10 + i * 20} ${y - 62} q 8 -14 0 -26 q -8 -12 0 -24`} fill="none" stroke={C.ink} strokeWidth={2.4} strokeLinecap="round" opacity={0.5 * steam * (0.6 + 0.4 * Math.sin(f * 0.08 + i))} />)}
  </g>
);

export const DisappearingScene: React.FC = () => {
  const f = useGF();
  const s0 = sceneRanges[3].from, end = sceneRanges[4].from;
  const ticket = E("ticket"), drop = E("drop"), clockF = E("clock"), mouth = E("mouth"), choice = E("choice"), look1 = E("look1"), look2 = E("look2");
  const mirror = E("mirror"), masks0 = E("masks0"), masksEnd = E("masksEnd"), rm = [E("rm1"), E("rm2"), E("rm3")];
  const guilt = E("guilt"), vText = E("verdictText"), cloudF = E("cloud"), tangle = E("tangle");

  // darkness closes in over the whole scene
  const dark = kf(f, [[s0, 0.12], [clockF, 0.28], [mirror, 0.4], [guilt, 0.5], [tangle, 0.52], [end, 0.5]]);
  const constrict = kf(f, [[s0, 0.35], [mirror, 0.6], [tangle, 0.75], [end, 0.7]]);

  const seated = prog(f, clockF - 6, 40) * (1 - prog(f, mirror + 6, 40)) + prog(f, guilt - 10, 40);
  const mirrorWalk = prog(f, mirror + 8, 40) * (1 - prog(f, guilt - 20, 30));
  const standX = HX + 340 * mirrorWalk;

  // --- hero pose ------------------------------------------------------------------------------
  const sitBase = POSES.sitSlump;
  const standTired = P({ lean: 6, head: 12, eyes: 0.4, brow: 0.55, smile: -0.2 });
  const pose = poseTrack(f, [
    [s0, standTired],
    [ticket + 14, { ...standTired, lean: 12, aR1: 40, aR2: 30 }],
    [drop, { ...standTired, lean: 4, head: 18, aR1: 8, aR2: 4, eyes: 0.3 }],
    [clockF + 20, sitBase],
    [mouth - 4, { ...sitBase, eyes: 0.5 }],
    [mouth + 18, { ...sitBase, aR1: 46, aR2: -158, head: 6, lean: 8, eyes: 0.6, smile: -0.4 }],
    [choice - 2, { ...sitBase, aR1: 46, aR2: -158, head: 6, lean: 8, eyes: 0.6, smile: -0.4 }],
    [choice + 20, { ...sitBase, lean: 6, head: 6, eyes: 0.85, brow: 0.9, smile: -0.1 }],
    [look1, { ...sitBase, lean: 6, head: 6, eyes: 0.85, brow: 0.9, gaze: -1, smile: -0.1 }],
    [look2, { ...sitBase, lean: 6, head: 6, eyes: 0.85, brow: 0.9, gaze: 1, smile: -0.1 }],
    [mirror, { ...sitBase, lean: 4, head: 4, eyes: 0.8, brow: 0.8, gaze: 0.2, smile: -0.1 }],
    [mirror + 40, P({ lean: 2, head: 0, eyes: 0.9, brow: 0.5, gaze: 1, smile: 0, aL1: -10, aR1: 10 })],
    [rm[0] - 10, P({ lean: 4, head: 2, eyes: 1, brow: 0.7, gaze: 1, smile: 0 })],
    [rm[0] + 8, P({ lean: 8, head: 4, eyes: 1, brow: 0.7, gaze: 1, aR1: 95, aR2: 96 })],
    [rm[0] + 26, P({ lean: 5, head: 3, eyes: 1, brow: 0.8, gaze: 1, aR1: 70, aR2: 84 })],
    [rm[1] + 4, P({ lean: 8, head: 4, eyes: 1, brow: 0.8, gaze: 1, aR1: 100, aR2: 100 })],
    [rm[2] + 20, P({ lean: 8, head: 6, eyes: 0.9, brow: 0.9, gaze: 1, aR1: 100, aR2: 100, aL1: -100, aL2: -100 })],
    [guilt - 6, P({ lean: 6, head: 12, eyes: 0.5, brow: 0.9, smile: -0.5 })],
    [guilt + 40, { ...sitBase, lean: 16, head: 20, eyes: 0.4, brow: 0.9 }],
    [vText + 60, { ...sitBase, lean: 14, head: 14, eyes: 0.5, brow: 0.7, smile: -0.2 }],
    [cloudF + 40, { ...sitBase, lean: 10, head: 4, eyes: 0.6, brow: 0.5, smile: -0.1 }],
    [end, { ...sitBase, lean: 14, head: 14, eyes: 0.4, brow: 0.6, smile: -0.2 }],
  ]);
  // a pulled-away "yes" shows in the body: tremble during the ticket scene
  const J = joints(pose, standX, G, 1.5, 0);
  const sitJ = joints(sitBase, standX, G, 1.5, 0);
  const chairOp = clamp(seated);

  // --- wraps/strings: no thread leads back to himself ------------------------------------------
  const wraps = WRAP_ORDER.slice(0, 11).map((w) => segPts(J, w.seg));
  const strands: ThreadDef[] = wraps.map((s, k) => {
    const at = WRAP_ORDER[k].at;
    const from: Pt = [s[0][0] + (s[1][0] - s[0][0]) * at, s[0][1] + (s[1][1] - s[0][1]) * at];
    const faces = FACES;
    const t = faces[k % faces.length];
    return { from, to: [t[0], t[1]], born: 0, draw: prog(f, mirror - 20 + k * 6, 30), tension: 0.55 + 0.2 * prog(f, tangle, 60), sag: 80, width: 2, opacity: 0.9 };
  });
  const before = f < mirror - 20;
  const topAnchors: ThreadDef[] = wraps.slice(0, 6).map((s, k) => {
    const at = WRAP_ORDER[k].at;
    const from: Pt = [s[0][0] + (s[1][0] - s[0][0]) * at, s[0][1] + (s[1][1] - s[0][1]) * at];
    return { from, to: [standX + (k % 2 ? 1 : -1) * (260 + k * 70), -420], born: 0, draw: 1, tension: 0.55, sag: 100, width: 2, opacity: 0.85 * (1 - prog(f, mirror - 20, 20)) };
  });

  // --- mirror and masks ------------------------------------------------------------------------
  const mirrorOn = prog(f, mirror - 10, 30);
  const masks = prog(f, masks0, masksEnd - masks0);
  const removed = rm.filter((r) => f > r + 12).length;
  const maskReveal = clamp(masks * 1.0);
  const flung = rm.map((r, i) => ({ t: prog(f, r, 40), i }));
  const reflPose: Pose = { ...pose, mask: 0 };

  const cam: CamKey[] = [
    [s0, { cx: 860, cy: 540, s: 1.1 }],
    [clockF, { cx: 840, cy: 520, s: 1.06 }],
    [mirror - 10, { cx: 900, cy: 540, s: 1.05 }],
    [mirror + 60, { cx: 1120, cy: 520, s: 1.05 }],
    [guilt, { cx: 1100, cy: 560, s: 1.0 }],
    [tangle - 30, { cx: 980, cy: 560, s: 0.98 }],
    [tangle + 60, { cx: 900, cy: 520, s: 0.82 }],
    [end, { cx: 900, cy: 500, s: 0.8 }],
  ];
  const dk = dark > 0.25;

  return (
    <AbsoluteFill>
      <PaperBackground dark={dark} constrict={constrict} spot={[0.5, 0.58]}>
        <Dust opacity={0.18} />
      </PaperBackground>
      <CameraMotion keys={cam} drift={2}>
        <World>
          <Floor y={G} dark />
          {/* plan ticket pulled away */}
          {f < drop + 80 && (
            <g opacity={1 - prog(f, drop + 40, 30)}>
              <Ticket x={f < drop ? J.handR[0] + 22 : J.handR[0] + 22 + (f - drop) * 1.2} y={f < drop ? J.handR[1] : J.handR[1] + Math.pow(f - drop, 1.6) * 0.9} rot={f < drop ? 0 : (f - drop) * 4} f={f} />
            </g>
          )}
          <ShadowHand from={[2300, 520]} target={[HX + 520, 540]} p={prog(f, ticket, 14) * (1 - prog(f, ticket + 40, 14))} kind="task" frame={f} seed={21} />
          {/* the clock that keeps advancing */}
          {f >= clockF - 20 && f < mirror + 30 && (
            <g opacity={prog(f, clockF - 20, 30) * (1 - prog(f, mirror, 30))}>
              <Clock x={HX} y={210} r={86} frame={f - clockF} speed={f < mouth ? 9 : 3} start={200} />
              <path d={`M ${HX + 150} 150 a 34 34 0 1 0 22 56 a 28 28 0 1 1 -22 -56`} fill={C.ink} opacity={0.8} />
            </g>
          )}
          {/* the simple choice he cannot make */}
          {f >= choice && f < mirror + 20 && (
            <g opacity={prog(f, choice, 20) * (1 - prog(f, mirror - 10, 30))}>
              <path d={`M ${HX - 440} ${G - 200} L ${HX - 100} ${G - 200} M ${HX - 420} ${G - 200} L ${HX - 420} ${G} M ${HX - 120} ${G - 200} L ${HX - 120} ${G}`} stroke={C.ink} strokeWidth={6} fill="none" />
              <Cup x={HX - 350} y={G - 204} f={f} />
              <Cup x={HX - 190} y={G - 204} f={f} />
              <g fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={0.7}>
                <path transform={`translate(${HX - 350} ${G - 330})`} d="M -14 -20 C -14 -40 18 -40 18 -20 C 18 -6 2 -8 2 6 L 2 10" />
                <path transform={`translate(${HX - 190} ${G - 330})`} d="M -14 -20 C -14 -40 18 -40 18 -20 C 18 -6 2 -8 2 6 L 2 10" />
              </g>
            </g>
          )}
          {/* the room of everyone else */}
          {FACES.map((p, i) => (
            <g key={i} opacity={prog(f, mirror - 30 + i * 6, 24)}>
              <FaceDisc x={p[0]} y={p[1]} r={p[2]} mood={0.9} fill="#d9d6cb" opacity={0.9} />
            </g>
          ))}
          {f >= mirror - 30 && <Threads frame={f} defs={strands} seed={5} />}
          {f < mirror && <Threads frame={f} defs={topAnchors} seed={6} />}

          <g opacity={mirrorOn}>
            <Mirror x={MX} y={MY} w={380} h={600} frame={f} masks={0} fog={prog(f, guilt, 40) * 0.3} dark={dk}>
              <MirrorContent f={f} pose={reflPose} masks={maskReveal} removed={removed} dark={dk} />
            </Mirror>
          </g>
          {flung.map(({ t, i }) => t > 0 && t < 1 && (
            <Mask key={i} x={MX - 60 - t * 520} y={MY - 40 + (-Math.sin(t * Math.PI) * 140 + t * t * 420)} r={44} rot={t * -300} opacity={1} />
          ))}
          {f >= rm[0] + 40 && [0, 1, 2].map((i) => <Mask key={i} x={MX - 600 + i * 90} y={G - 18} r={30} rot={80 + i * 30} opacity={0.9} mood={i === 1 ? "blank" : "smile"} />)}

          {/* chair + hero */}
          {chairOp > 0.01 && f < mirror + 20 && <g opacity={chairOp * (1 - prog(f, mirror, 20))}><Chair x={HX - 20} y={sitJ.hip[1] + 14} w={150} color="#0f0f0f" /></g>}
          {chairOp > 0.01 && f >= guilt - 10 && <g opacity={prog(f, guilt - 10, 30)}><Chair x={standX - 20} y={sitJ.hip[1] + 14} w={150} color="#0f0f0f" /></g>}
          <Tangle cx={standX} cy={G - 200} rx={420} ry={300} lines={90} amount={prog(f, tangle - 20, 160)} seed={3} frame={f} />
          <Stickman x={standX} ground={G} scale={1.5} pose={pose} seed={8} tremble={f < drop ? 1.2 : 0.5} color="#0d0d0d" />
          {wraps.map((w, k) => <Wrap key={k} a={w[0]} b={w[1]} at={WRAP_ORDER[k].at} born={-100} frame={f} tight={0.7} turns={4} dark />)}
          {/* the weight of guilt */}
          <Weight f={f} born={guilt} J={J} release={cloudF} />
          <Scribble x={J.chest[0]} y={J.chest[1]} r={22} frame={f} on={prog(f, guilt + 10, 20) * (1 - prog(f, cloudF, 30))} seed={4} />
          {/* the tangle */}
          <Tangle cx={standX} cy={G - 120} rx={300} ry={150} lines={34} amount={prog(f, tangle + 10, 140)} seed={12} frame={f} />
          {f >= tangle && <g opacity={prog(f, tangle, 40)}><path d={`M ${standX - 600} ${G + 6} Q ${standX} ${G - 40} ${standX + 600} ${G + 6}`} stroke={C.ink} strokeWidth={1.6} fill="none" opacity={0.6} /></g>}
        </World>
      </CameraMotion>
      <Caption text="Guilt is a feeling, not always a verdict." from={vText} to={vText + 150} at="upper" size={60} italic color="#f2efe6" plate="38,38,35" />
    </AbsoluteFill>
  );
};

const FACES: [number, number, number][] = [
  [240, 250, 52], [300, 620, 46], [1700, 180, 54], [1800, 700, 48], [980, 90, 40], [560, 90, 36], [1460, 90, 38],
];

const Ticket: React.FC<{ x: number; y: number; rot: number; f: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M -34 -24 L 34 -24 L 34 -6 a 6 6 0 0 0 0 12 L 34 24 L -34 24 L -34 6 a 6 6 0 0 0 0 -12 Z" fill="#f4f0e2" stroke={C.ink} strokeWidth={3.4} strokeLinejoin="round" />
    <path d="M 0 -10 l 4 8 l 9 1 l -7 6 l 2 9 l -8 -5 l -8 5 l 2 -9 l -7 -6 l 9 -1 Z" fill="none" stroke={C.ink} strokeWidth={2.4} strokeLinejoin="round" />
  </g>
);

/** The reflection: first an exact copy of him, then buried under smiling masks. */
const MirrorContent: React.FC<{ f: number; pose: Pose; masks: number; removed: number; dark: boolean }> = ({ f, pose, masks, removed, dark }) => {
  const h = 600;
  const live = 1 - Math.min(1, masks * 1.15);
  return (
    <g>
      <g>
        <g opacity={0.35 + 0.65 * live}>
          <Stickman x={0} ground={h / 2 - 26} scale={1.3} pose={pose} flip shadow={false} seed={8} color={dark ? "#0f0f0f" : C.ink} />
        </g>
        {Array.from({ length: Math.max(0, Math.floor(11 * masks) - removed) }, (_, i) => (
          <Mask key={i} x={(hash(i * 3.1) - 0.5) * 190 + Math.sin(f * 0.02 + i) * 3} y={-h * 0.22 + (hash(i * 5.3) - 0.1) * h * 0.62} r={36 + hash(i * 1.7) * 20} rot={(hash(i * 8.8) - 0.5) * 40} mood={i % 4 === 3 ? "blank" : "smile"} />
        ))}
      </g>
    </g>
  );
};

const Weight: React.FC<{ f: number; born: number; J: ReturnType<typeof joints>; release: number }> = ({ f, born, J, release }) => {
  const a = prog(f, born, 30);
  if (a <= 0) return null;
  const lift = prog(f, release, 70);
  const x = J.chest[0] + 6, y = J.chest[1] + 40 - lift * 330;
  const heavy = 1 - lift;
  return (
    <g opacity={a}>
      <path d={`M ${J.chest[0]} ${J.chest[1] - 6} L ${x} ${y - 30}`} stroke={C.ink} strokeWidth={3} />
      {heavy > 0.05 ? (
        <g opacity={heavy}><path d={`M ${x - 54} ${y + 44} L ${x - 38} ${y - 18} Q ${x} ${y - 36} ${x + 38} ${y - 18} L ${x + 54} ${y + 44} Z`} fill="#242422" stroke="#000" strokeWidth={3} />
          <ellipse cx={x} cy={y - 28} rx={16} ry={7} fill="none" stroke="#000" strokeWidth={5} /></g>
      ) : null}
      <g opacity={lift}>
        <path d={`M ${x - 90} ${y + 16} a 36 36 0 0 1 16 -66 a 48 48 0 0 1 92 -8 a 34 34 0 0 1 28 74 Z`} fill="#cfcbbd" stroke={C.ink} strokeWidth={3.4} />
      </g>
    </g>
  );
};

