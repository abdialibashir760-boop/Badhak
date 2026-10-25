import React from 'react';
import {Camera, Ground, HandDrawn, Particles, Spotlight, Vignette} from '../components/Stage';
import {KineticText} from '../components/Overlays';
import {FACES, GUARDED, STAND, TALK, lerpFace, lerpPose, walkPose} from '../lib/pose';
import {RED, StickFigure} from '../components/StickFigure';
import {easeInOut, easeOut, lerp, seg} from '../lib/anim';
import {Svg, SpeechArcs} from './kit';
import type {SceneProps} from './types';

export const Scene01Hook: React.FC<SceneProps> = ({frame, tm}) => {
  const tArrive = tm.at('speaks', 0.22);
  const tEnds = tm.at('ends', 0.5);
  const tWords = tm.words.slice(-5).map((w) => w.start);
  const silence = seg(frame, tEnds + 10, tEnds + 40, easeInOut);

  // O walks in from the right.
  const walkStart = 14;
  const arriveF = Math.max(walkStart + 30, tArrive - 4);
  const walkT = seg(frame, walkStart, arriveF, easeOut);
  const S = 0.34;
  const ox = lerp(1780, 930, walkT);
  const moving = walkT < 0.999 ? 1 : 0;
  const oPose = moving ? walkPose((1780 - ox) / S, STAND, 0.55 + 0.45 * (1 - walkT)) : lerpPose(STAND, TALK, seg(frame, arriveF, arriveF + 14));
  const speaking = frame >= arriveF && frame < tEnds ? 1 : 0;

  const swell = seg(frame, arriveF, arriveF + 34, easeInOut) * (1 - 0.0 * silence);
  const headScale = 1 + 0.5 * swell;
  const pFace = lerpFace(lerpFace(FACES.neutral, FACES.worried, swell), FACES.blank, silence * 0.6);
  const pPose = lerpPose(STAND, GUARDED, swell * 0.7);

  // Camera: wide -> push in on the pair as speech starts -> pull back for the title.
  const push = seg(frame, arriveF - 10, arriveF + 44, easeInOut);
  const pull = seg(frame, tEnds + 20, tWords[0] + 20, easeInOut);
  const zoom = lerp(1, 2.1, push) - 0.95 * pull;
  const cam = {x: lerp(960, 790, push) + 80 * pull, y: lerp(540, 700, push) + 40 * pull, zoom: Math.max(1, zoom)};
  const reveal = seg(frame, 2, 46, easeInOut);
  const dustSpeed = 1 - silence;

  return (
    <>
      <Svg>
        <Camera cam={cam} frame={frame}>
          <HandDrawn frame={frame}>
            <Ground y={820} x1={-600} x2={2500} progress={reveal} opacity={0.9} />
            <StickFigure x={620} y={820} scale={S} facing={1} pose={pPose} face={pFace} headScale={headScale} frame={frame} seed={2} />
            <StickFigure
              x={ox}
              y={820}
              scale={S}
              facing={-1}
              pose={oPose}
              face={speaking ? {...FACES.talk, mouthOpen: 0.25 + 0.5 * Math.abs(Math.sin(frame * 0.55))} : FACES.neutral}
              color="#b9b5ae"
              frame={frame}
              seed={5}
              redGlow={0}
            />
            {speaking ? <SpeechArcs x={ox - 36 * S * 2} y={820 - 270 * S} dir={-1} phase={(frame - arriveF) / 26} opacity={1 - silence} size={0.9} /> : null}
          </HandDrawn>
          <Spotlight x={620} floorY={824} floorW={170} topW={24} id="s1-spot" opacity={reveal * (0.55 + 0.45 * (1 - silence))} />
          <Particles frame={Math.floor(frame * dustSpeed)} count={50} speed={0.8} opacity={0.4} area={[-300, 0, 2500, 900]} />
        </Camera>
      </Svg>

      <Vignette amount={0.55 + 0.35 * silence} />

      <KineticText
        frame={frame}
        words={[
          {text: 'IT', at: tWords[0]},
          {text: 'WAS', at: tWords[1]},
          {text: 'JUST', at: tWords[2], color: '#d2504b', italic: true},
          {text: 'A', at: tWords[3]},
          {text: 'CONVERSATION', at: tWords[4]},
        ]}
        size={104}
        y={330}
        tracking={0.1}
        gap={0.26}
        maxWidth={1860}
      />
      <Svg>
        <path
          d="M 470 418 C 800 436 1180 410 1460 428"
          fill="none"
          stroke={RED}
          strokeWidth={4}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - seg(frame, tWords[4] + 14, tWords[4] + 44, easeOut)}
          opacity={0.9}
        />
      </Svg>
    </>
  );
};
