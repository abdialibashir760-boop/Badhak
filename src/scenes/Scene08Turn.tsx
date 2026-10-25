import React from 'react';
import {Camera, Ground, HandDrawn, Particles, Vignette} from '../components/Stage';
import {PulseRings, ThoughtBubble} from '../components/Glyphs';
import {SmallCaps} from '../components/Overlays';
import {FACES, GUARDED, lerpFace, lerpPose, RELAXED, STAND} from '../lib/pose';
import {INK, RED, StickFigure} from '../components/StickFigure';
import {clamp, easeInOut, easeOutBack, lerp, seg} from '../lib/anim';
import {Svg} from './kit';
import type {SceneProps} from './types';

const PX = 900;
const GY = 800;
const S = 0.95;
const HEAD = {x: PX, y: GY - (124 + 104 + 6 + 58) * S};

export const Scene08Turn: React.FC<SceneProps> = ({frame, p, tm}) => {
  const tThought = tm.at('thought', 0.2);
  const tNotice = tm.at('notice', 0.42);
  const tObey = tm.at('obeying', 0.58);
  const tEvent = tm.at('event', 0.75);
  const tVerdict = tm.at('verdict', 0.9);

  // Everything here moves in slow motion.
  const slow = frame * 0.55;

  const born = seg(frame, tThought, tThought + 34, easeOutBack);
  const drift = seg(frame, tObey - 6, tVerdict + 10, easeInOut);
  const dissolve = seg(frame, tVerdict - 10, tVerdict + 36);
  const bx = lerp(HEAD.x, 1560, drift) + Math.sin(slow * 0.05) * 6;
  const by = lerp(HEAD.y - 250, 160, drift) + Math.sin(slow * 0.07) * 8;
  const bscale = lerp(1, 0.38, drift);
  const red = 1 - seg(frame, tNotice, tObey + 40);

  const grip = seg(frame, tThought + 10, tThought + 38) * (1 - seg(frame, tNotice, tNotice + 40, easeInOut));
  const pose = lerpPose(lerpPose(STAND, GUARDED, grip * 0.9), RELAXED, seg(frame, tNotice + 10, tNotice + 70));
  const gazeTarget = {x: (bx - HEAD.x) / 400, y: (by - HEAD.y) / 300};
  const face = {
    ...lerpFace(lerpFace(FACES.neutral, FACES.worried, grip), FACES.calm, seg(frame, tNotice + 8, tNotice + 60)),
    gx: clamp(gazeTarget.x * born, -1, 1),
    gy: clamp(gazeTarget.y * born, -1, 1),
  };

  const calm = seg(frame, tNotice + 10, tNotice + 50);
  const bubbleCol = `rgb(${Math.round(lerp(150, 178, red))},${Math.round(lerp(146, 64, red))},${Math.round(lerp(140, 61, red))})`;
  const cam = {x: lerp(920, 1010, easeInOut(p)), y: lerp(600, 560, easeInOut(p)), zoom: lerp(1.05, 1.2, easeInOut(p))};

  return (
    <>
      <Svg>
        <Camera cam={cam} frame={slow}>
          <HandDrawn frame={Math.floor(slow)}>
            <Ground y={GY} x1={-200} x2={2100} opacity={0.8} />
            <StickFigure x={PX} y={GY} scale={S} pose={pose} face={face} frame={slow} seed={4} breath={0.7} tremble={0.5 * grip} />
            <ThoughtBubble
              x={bx}
              y={by}
              rx={170 * bscale}
              ry={92 * bscale}
              lines={bscale > 0.8 ? ["They think", "I'm boring."] : []}
              fontSize={34}
              grow={born * (1 - dissolve)}
              frame={slow}
              seed={2}
              tail={drift < 0.2 ? {x: HEAD.x + 20, y: HEAD.y - 70} : undefined}
              color={bubbleCol}
              textColor={red > 0.3 ? '#e0716c' : '#9d9993'}
              fill="#0a0404"
              distort={0.05 * red + 0.015}
              opacity={1 - dissolve * 0.7}
            />
          </HandDrawn>
          {/* the observing mind: a faint line of attention and a slow, calm ring */}
          {calm > 0 && born > 0.5 ? (
            <line x1={HEAD.x + 24} y1={HEAD.y - 8} x2={lerp(HEAD.x + 24, bx, calm)} y2={lerp(HEAD.y - 8, by + 50 * bscale, calm)} stroke={INK} strokeWidth={1.5} strokeDasharray="3 10" opacity={0.4 * calm * (1 - dissolve)} />
          ) : null}
          <PulseRings x={PX} y={GY - 190 * S} phase={(slow / 30) * 0.14} color={INK} maxR={460} width={2} opacity={0.35 * calm} />
          {born > 0.6 && drift > 0.15 ? (
            <SmallCaps text={frame < tEvent ? 'A THOUGHT' : 'AN EVENT'} x={bx} y={by + 100 * bscale + 34} size={14} opacity={0.6 * (1 - dissolve)} color="#9d9993" />
          ) : null}
          <Particles frame={slow * 0.7} count={46} opacity={0.5} speed={0.6} area={[-200, 0, 2200, 900]} />
        </Camera>
        {/* thin red hairline marks the moment of noticing */}
        <line x1={0} x2={1920} y1={1004} y2={1004} stroke={RED} strokeWidth={1} opacity={0.4 * seg(frame, tNotice - 4, tNotice + 12) * (1 - seg(frame, tNotice + 12, tNotice + 50))} />
      </Svg>
      <Vignette amount={0.6} />
    </>
  );
};
