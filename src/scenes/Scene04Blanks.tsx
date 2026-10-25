import React from 'react';
import {Camera, DrawPath, Ground, HandDrawn, Particles, Vignette} from '../components/Stage';
import {Label, ThoughtBubble} from '../components/Glyphs';
import {SmallCaps} from '../components/Overlays';
import {FACES, GUARDED, lerpFace, lerpPose, STAND, walkPose} from '../lib/pose';
import {INK, RED, StickFigure} from '../components/StickFigure';
import {clamp, easeInOut, easeOut, easeOutBack, lerp, seg} from '../lib/anim';
import {Svg} from './kit';
import type {SceneProps} from './types';

const PX = 520;
const OX0 = 1120;
const GY = 800;
const S = 0.78;

const CHILD = [
  {x: 210, y: 215, lines: ['I bored them.'], rx: 150, ry: 66},
  {x: 640, y: 120, lines: ['I said it wrong.'], rx: 170, ry: 66},
  {x: 1060, y: 250, lines: ["They've had", 'enough of me.'], rx: 175, ry: 86},
];

export const Scene04Blanks: React.FC<SceneProps> = ({frame, tm}) => {
  const tVerdict = tm.at('verdict', 0.2);
  const tBlanks = tm.at('blanks', 0.32);
  const tFills = tm.at('fills', 0.42);
  const tHarsh = tm.at('harshly', 0.55);
  const tBut = tm.at('but', 0.7);
  const tEvid = tm.at('evidence', 0.82);

  // O: neutral stare, then turns and walks away.
  const walkP = seg(frame, tVerdict, tVerdict + 110, easeInOut);
  const ox = lerp(OX0, 2200, walkP * walkP);
  const walking = frame > tVerdict + 6;
  const facing = walking ? 1 : -1;
  const oPose = walking ? walkPose((ox - OX0) / S, STAND, 0.8) : STAND;
  const oFace = FACES.blank;

  // P: reads the blank, gets anxious.
  const worry = seg(frame, tVerdict, tHarsh, easeInOut);
  const pPose = lerpPose(STAND, GUARDED, worry * 0.8);
  const pFace = {...lerpFace(FACES.neutral, FACES.anxious, worry), gx: 0.9 - 0.9 * seg(frame, tVerdict, tVerdict + 20), gy: -0.3 * worry};

  // Camera: tight on the neutral face, then reveal the whole picture, then drift to the left for the verdict panels.
  const k1 = seg(frame, 0, 12) * (1 - seg(frame, tVerdict - 4, tVerdict + 30, easeInOut));
  const k2 = seg(frame, tBut - 10, tBut + 40, easeInOut);
  const cam = {x: lerp(960, OX0 - 40, k1), y: lerp(540, 590, k1), zoom: lerp(1.0, 2.5, k1) * lerp(1, 0.92, k2), rot: 0};

  // Imagination: root bubble -> branching -> exaggeration -> dissolve.
  const rootG = seg(frame, tBlanks, tBlanks + 26, easeOutBack);
  const dissolve = seg(frame, tBut, tBut + 36, easeInOut);
  const childG = (i: number) => seg(frame, tFills + i * 10, tFills + i * 10 + 26, easeOutBack) * (1 - dissolve);
  const hot = seg(frame, tHarsh, tHarsh + 40);
  const rootPos = {x: PX + 40, y: 400};

  // Verdict panels.
  const panel = seg(frame, tBut + 14, tBut + 60, easeOut);
  const evid = seg(frame, tEvid - 6, tEvid + 20, easeOut);
  const jitter = (n: number) => Math.sin(frame * 1.7 + n) * 2.2 + Math.sin(frame * 0.6 + n * 3) * 3;

  return (
    <>
      <Svg>
        <Camera cam={cam} frame={frame}>
          <HandDrawn frame={frame}>
            <Ground y={GY} x1={-500} x2={2400} opacity={0.85} />
            <StickFigure x={PX} y={GY} scale={S} pose={pPose} face={pFace} frame={frame} seed={2} tremble={0.5 * worry} opacity={1 - 0.45 * panel} />
            <StickFigure x={ox} y={GY} scale={S} facing={facing} pose={oPose} face={oFace} color="#c3bfb8" frame={frame} seed={8} idle={walking ? 0.3 : 1} />

            {/* thought branching */}
            {rootG > 0
              ? CHILD.map((c, i) => {
                  const g = childG(i);
                  if (g <= 0.01) return null;
                  const sx = rootPos.x;
                  const sy = rootPos.y - 60;
                  const mx = (sx + c.x) / 2 + (i - 1) * 40;
                  const my = (sy + c.y) / 2 - 20;
                  const d = `M ${sx} ${sy} Q ${mx} ${my} ${c.x} ${c.y + c.ry * 0.9}`;
                  return <DrawPath key={i} d={d} progress={seg(frame, tFills + i * 10, tFills + i * 10 + 18, easeOut) * (1 - dissolve)} stroke={RED} width={3} dash="3 12" opacity={0.8} />;
                })
              : null}
            <ThoughtBubble
              x={rootPos.x}
              y={rootPos.y}
              rx={118}
              ry={62}
              lines={['…?']}
              fontSize={50}
              grow={rootG * (1 - dissolve * 0.8)}
              frame={frame}
              seed={3}
              tail={{x: PX + 20, y: GY - 330 * S}}
              color={lerpColor(hot)}
              distort={0.03 + 0.06 * hot}
              opacity={1 - dissolve}
            />
            {CHILD.map((c, i) => (
              <ThoughtBubble
                key={i}
                x={c.x}
                y={c.y}
                rx={c.rx * (1 + 0.18 * hot)}
                ry={c.ry * (1 + 0.18 * hot)}
                lines={c.lines}
                grow={childG(i)}
                frame={frame}
                seed={i + 4}
                color={RED}
                textColor="#e0716c"
                fill="#140505"
                distort={0.05 + 0.1 * hot}
                fontSize={34}
              />
            ))}
          </HandDrawn>
          <Particles frame={frame} count={34} opacity={0.3} speed={0.5} area={[-300, 0, 2500, 900]} />
        </Camera>

        {/* Observation vs imagination */}
        <g opacity={panel}>
          <path d="M 960 200 L 960 580" stroke={INK} strokeWidth={2} opacity={0.5} strokeDasharray="4 10" />
          <SmallCaps text="OBSERVED" x={610} y={232} size={22} color="#bdb9b2" />
          <SmallCaps text="IMAGINED" x={1310} y={232} size={22} color="#c0504b" />
          <rect x={290} y={280} width={640} height={190} fill="none" stroke={INK} strokeWidth={4} opacity={0.9} rx={4} />
          <Label text="A person walked away." x={610} y={390} size={48} color={INK} family="serif" italic={false} />
          <g opacity={1 - evid * 0.55}>
            <rect x={1000 + jitter(1)} y={280 + jitter(2)} width={620} height={190} fill="none" stroke={RED} strokeWidth={4} strokeDasharray="16 12" />
            <Label text="They've had enough of me." x={1310 + jitter(4)} y={390 + jitter(5)} size={46} color="#e0716c" opacity={0.65 + 0.35 * Math.sin(frame * 0.9)} />
          </g>
          {evid > 0 ? <path d="M 1010 280 L 1610 470" stroke={RED} strokeWidth={4} opacity={0.7 * evid} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - evid} /> : null}
        </g>
      </Svg>
      <Vignette amount={0.7} />
    </>
  );
};

const lerpColor = (t: number) => {
  const a = [236, 232, 225];
  const b = [178, 64, 61];
  const c = a.map((v, i) => Math.round(lerp(v, b[i], clamp(t))));
  return `rgb(${c.join(',')})`;
};
