import React from 'react';
import {Camera, Ground, HandDrawn, Particles, Vignette} from '../components/Stage';
import {FACES, lerpFace, lerpPose, STAND, WAVE, type Pose} from '../lib/pose';
import {INK, RED, StickFigure} from '../components/StickFigure';
import {clamp, easeInOut, easeOut, kf, lerp, linear, seg} from '../lib/anim';
import {SANS, SERIF} from '../components/Overlays';
import {Svg, SpeechArcs} from './kit';
import type {SceneProps} from './types';

const AWK: Pose = {...WAVE, aU: 152, aF: 176, lean: -8, tilt: 10, shrug: 6};
const PX = 620;
const OX = 1320;
const GY = 820;
const S = 0.7;

const THOUGHTS = [
  {text: 'Was that awkward?', x: 1130, y: 300, rot: -3, red: false},
  {text: 'Why did I say that?', x: 400, y: 330, rot: 2, red: false},
  {text: 'Did they notice?', x: 1380, y: 640, rot: -2, red: false},
  {text: 'Too loud.', x: 300, y: 600, rot: -5, red: true},
  {text: 'Too quiet.', x: 1480, y: 330, rot: 4, red: true},
  {text: 'Just stop talking.', x: 900, y: 210, rot: 0, red: true},
];

export const Scene03Replay: React.FC<SceneProps> = ({frame, dur, tm}) => {
  const tRew = Math.max(tm.at('rewind', 0.3), 84);
  const tFreeze = Math.max(tm.at('freeze', 0.42), tRew + 48);
  const tD = tFreeze + 44;
  const tHunt = Math.max(tm.at('hunting', 0.85), tD + 66);
  const tEnd = tHunt + 8;
  const rewEnd = tRew + (tFreeze - tRew) * 0.5;

  // Conversation clock (0..~0.55). Forward, rewind, replay, freeze, then looping close-ups.
  let c: number;
  let mode: 'play' | 'rewind' | 'pause' = 'play';
  if (frame < tFreeze) {
    c = kf(frame, [[8, 0], [tRew, 0.55], [rewEnd, 0.12], [tFreeze, 0.46]], linear);
    if (frame >= tRew && frame < rewEnd) mode = 'rewind';
  } else if (frame < tD) {
    c = 0.46;
    mode = 'pause';
  } else if (frame < tHunt) {
    c = 0.28 + 0.26 * (((frame - tD) / 44) % 1);
  } else {
    c = 0.46;
    mode = 'pause';
  }
  c = clamp(c, 0, 0.58);

  // Camera per beat.
  const views = (() => {
    const third = (tHunt - tD) / 3;
    if (frame < tFreeze - 14) return {x: 960, y: 640, zoom: lerp(1, 1.12, seg(frame, 0, tFreeze, linear)), rot: 0, flip: false, shake: 0};
    if (frame < tD) {
      const k = seg(frame, tFreeze - 14, tFreeze + 20, easeInOut);
      return {x: lerp(960, 700, k), y: lerp(640, 600, k), zoom: lerp(1.12, 1.75, k), rot: 0, flip: false, shake: 0};
    }
    if (frame < tD + third) return {x: PX + 40, y: 560, zoom: 2.7, rot: 0, flip: false, shake: 12 * (1 - seg(frame, tD, tD + 8, easeOut))};
    if (frame < tD + 2 * third) return {x: 960, y: 650, zoom: 1.55, rot: -4, flip: true, shake: 12 * (1 - seg(frame, tD + third, tD + third + 8, easeOut))};
    if (frame < tHunt) return {x: OX - 160, y: 560, zoom: 2.0, rot: 5, flip: false, shake: 12 * (1 - seg(frame, tD + 2 * third, tD + 2 * third + 8, easeOut))};
    const k = seg(frame, tHunt, dur, easeInOut);
    return {x: lerp(840, 960, k), y: lerp(600, 600, k), zoom: lerp(1.9, 1.05, k), rot: lerp(3, 0, k), flip: false, shake: 0};
  })();

  const pair = (cc: number, ghost: number, key: string) => {
    const talk = clamp(seg(cc, 0.02, 0.07) - seg(cc, 0.3, 0.35), 0, 1);
    const wave = clamp(seg(cc, 0.04, 0.1) - seg(cc, 0.28, 0.34), 0, 1);
    const oPose = lerpPose(STAND, WAVE, wave);
    oPose.aF += Math.sin(cc * 190) * 22 * wave;
    const oFace = {...lerpFace(FACES.neutral, FACES.talk, talk), mouthOpen: talk * Math.abs(Math.sin(cc * 420)) * 0.7};
    const awk = clamp(seg(cc, 0.3, 0.4) - seg(cc, 0.53, 0.58), 0, 1);
    const pPose = lerpPose(STAND, AWK, awk);
    pPose.aF += Math.sin(cc * 260) * 10 * awk;
    const pFace = lerpFace(lerpFace(FACES.neutral, FACES.talk, 0), {eye: 1, brow: -0.9, mouth: 0.95, mouthOpen: 0.3, gx: 0.6, gy: 0}, awk);
    const shown = ghost === 0;
    return (
      <g key={key} opacity={shown ? 1 : ghost}>
        <StickFigure x={PX - 14 * awk} y={GY} scale={S} pose={pPose} face={pFace} frame={frame} seed={2} redGlow={awk * (mode === 'pause' ? 1 : 0.25)} noBlink={!shown} />
        <StickFigure x={OX} y={GY} scale={S} facing={-1} pose={oPose} face={oFace} color="#c3bfb8" frame={frame} seed={6} />
        {shown && talk > 0.1 ? <SpeechArcs x={OX - 40} y={GY - 195} dir={-1} phase={cc * 6} opacity={0.6} size={0.8} /> : null}
      </g>
    );
  };

  const rewinding = mode === 'rewind';
  const lines = frame % 6 < 3 ? 1 : 0;

  // Scrub bar (screen-space, camcorder language).
  const barX0 = 220;
  const barX1 = 1700;
  const playX = lerp(barX0, barX1, c / 0.6);
  const modeColor = mode === 'play' ? INK : RED;

  return (
    <>
      <Svg>
        <Camera cam={views} shake={views.shake} frame={frame}>
          <g transform={views.flip ? 'translate(1920,0) scale(-1,1)' : undefined}>
            <HandDrawn frame={frame}>
              <Ground y={GY} x1={-500} x2={2400} opacity={0.85} />
              {rewinding ? pair(clamp(c + 0.07, 0, 0.58), 0.28, 'g1') : null}
              {rewinding ? pair(clamp(c + 0.14, 0, 0.58), 0.14, 'g2') : null}
              {pair(c, 0, 'main')}
            </HandDrawn>
            <Particles frame={frame} count={30} opacity={0.3} speed={0.4} area={[-200, 0, 2400, 900]} />
          </g>
        </Camera>

        {/* camcorder UI */}
        <g opacity={1}>
          <circle cx={150} cy={96} r={9} fill={RED} opacity={Math.floor(frame / 15) % 2 ? 1 : 0.25} />
          <text x={176} y={104} fill={INK} fontFamily={SANS} fontSize={24} letterSpacing={6} opacity={0.95}>
            {mode === 'play' ? 'PLAY' : mode === 'rewind' ? 'REWIND' : 'PAUSED'}
          </text>
          {mode === 'play' ? <path d="M 352 86 L 372 97 L 352 108 Z" fill={INK} opacity={0.7} /> : null}
          {mode === 'rewind' ? (
            <path d="M 372 86 L 352 97 L 372 108 Z M 394 86 L 374 97 L 394 108 Z" fill={RED} />
          ) : null}
          {mode === 'pause' ? <path d="M 356 86 h7 v22 h-7 z M 372 86 h7 v22 h-7 z" fill={RED} /> : null}
          <line x1={barX0} x2={barX1} y1={160} y2={160} stroke={INK} strokeWidth={2} opacity={0.35} />
          {Array.from({length: 38}, (_, i) => (
            <line key={i} x1={lerp(barX0, barX1, i / 37)} x2={lerp(barX0, barX1, i / 37)} y1={i % 5 === 0 ? 150 : 154} y2={166} stroke={INK} strokeWidth={1.5} opacity={0.3} />
          ))}
          <line x1={playX} x2={playX} y1={138} y2={182} stroke={modeColor} strokeWidth={3} />
          <path d={`M ${playX - 8} 134 L ${playX + 8} 134 L ${playX} 148 Z`} fill={modeColor} />
        </g>
        {rewinding
          ? Array.from({length: 7}, (_, i) => (
              <rect key={i} x={0} y={((frame * 37 + i * 211) % 1080)} width={1920} height={2 + (i % 3)} fill={INK} opacity={0.12 * lines} />
            ))
          : null}

        {/* thought fragments */}
        {THOUGHTS.map((t, i) => {
          const at = [tFreeze + 6, tD + 8, tD + (tHunt - tD) / 3 + 10, tHunt - 10, tHunt - 2, tHunt + 6][i];
          const n = Math.floor((frame - at) / 1.6);
          if (n <= 0) return null;
          const fade = frame > tEnd + 20 ? 1 - seg(frame, tEnd + 20, dur, easeInOut) * 0.3 : 1;
          const flick = t.red ? 0.75 + 0.25 * Math.sin(frame * 0.9 + i) : 1;
          return (
            <text
              key={i}
              x={t.x + Math.sin(frame * 0.05 + i) * 6}
              y={t.y + (frame - at) * -0.12}
              textAnchor="middle"
              fontFamily={SERIF}
              fontStyle="italic"
              fontSize={t.red ? 40 : 46}
              fill={t.red ? '#c24a45' : INK}
              opacity={0.88 * flick * fade}
              transform={`rotate(${t.rot} ${t.x} ${t.y})`}
            >
              {t.text.slice(0, n)}
            </text>
          );
        })}
      </Svg>
      <Vignette amount={mode === 'pause' ? 0.9 : 0.65} tint={mode === 'pause' ? '#120303' : '#000'} />
    </>
  );
};
