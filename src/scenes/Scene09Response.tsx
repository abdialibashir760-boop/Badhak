import React from 'react';
import {Camera, Ground, HandDrawn, Particles, Spotlight, Vignette} from '../components/Stage';
import {SANS} from '../components/Overlays';
import {FACES, GUARDED, lerpFace, lerpPose, RELAXED, STAND, TALK, walkPose} from '../lib/pose';
import {INK, StickFigure} from '../components/StickFigure';
import {easeInOut, easeOut, lerp, seg} from '../lib/anim';
import {Svg} from './kit';
import type {SceneProps} from './types';

const GY = 800;
const S = 0.8;
const OX = 1230;

export const Scene09Response: React.FC<SceneProps> = ({frame, dur, p, tm}) => {
  const tSilence = tm.at('silence', 0.22);
  const tPause = tm.at('pause', 0.4);
  const tSmooth = tm.at('smooth', 0.62);

  // P walks over to O again.
  const walk = seg(frame, 6, 78, easeOut);
  const px = lerp(-120, 760, walk);
  const walking = walk < 0.995;
  const nervous = 1 - seg(frame, tSilence, tPause + 20, easeInOut);
  const basePose = lerpPose(RELAXED, GUARDED, 0.6 * nervous);
  const pPose = walking ? walkPose((px + 120) / S, basePose, 0.9 * (1 - walk * 0.6)) : basePose;

  // Conversation before the silence, then a deliberate pause.
  const talking = frame > 70 && frame < tSilence;
  const talkOsc = Math.abs(Math.sin(frame * 0.5));
  const smile = seg(frame, tPause, tSmooth + 30);
  const pFace = {
    ...lerpFace(lerpFace(FACES.worried, FACES.calm, 1 - nervous), FACES.smile, smile),
    mouthOpen: talking && frame % 60 < 30 ? talkOsc * 0.35 : 0,
    gx: 0.5,
  };
  const oFace = {...lerpFace(FACES.calm, FACES.smile, smile * 0.8), mouthOpen: talking && frame % 60 >= 30 ? talkOsc * 0.4 : 0};
  const oPose = lerpPose(STAND, frame % 80 > 50 && !talking ? RELAXED : TALK, talking ? 0.5 : 0);

  // Waveform between them: lively while talking, then flat — silence allowed to exist.
  const live = 1 - seg(frame, tSilence - 4, tSilence + 18, easeOut);
  const wf: string[] = [];
  const wx0 = 700;
  const wx1 = 1290;
  for (let i = 0; i <= 90; i++) {
    const u = i / 90;
    const env = Math.sin(u * Math.PI);
    const y = 420 - Math.sin(i * 0.9 + frame * 0.6) * 34 * env * live * (0.5 + 0.5 * Math.sin(i * 0.2 + frame * 0.1)) - Math.sin(i * 0.35 - frame * 0.07) * 4 * env * (1 - live);
    wf.push(`${(wx0 + (wx1 - wx0) * u).toFixed(1)},${y.toFixed(1)}`);
  }
  const silent = Math.max(0, (frame - tSilence) / 30);
  const secs = Math.floor(silent * 1.6);
  const clock = `00:0${Math.min(9, secs)}`;
  const clockIn = seg(frame, tSilence + 4, tSilence + 24);

  const cam = {x: lerp(900, 980, easeInOut(p)), y: lerp(600, 580, easeInOut(p)), zoom: lerp(1.0, 1.25, easeInOut(p))};
  const warm = seg(frame, tPause, dur);

  return (
    <>
      <Svg>
        <Camera cam={cam} frame={frame}>
          <Spotlight x={980} floorY={GY + 4} topW={80} floorW={460} id="s9-spot" opacity={0.5 + 0.5 * warm} tint="#f3e6cf" />
          <HandDrawn frame={frame}>
            <Ground y={GY} x1={-300} x2={2200} opacity={0.85} />
            <StickFigure x={px} y={GY} scale={S} pose={pPose} face={pFace} frame={frame} seed={2} idle={1.2} />
            <StickFigure x={OX} y={GY} scale={S} facing={-1} pose={oPose} face={oFace} color="#cfcac2" frame={frame} seed={6} idle={1.2} />
            <polyline points={wf.join(' ')} fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" opacity={walking ? 0 : 0.7} />
          </HandDrawn>
          {clockIn > 0 ? (
            <g opacity={clockIn * 0.85}>
              <text x={995} y={372} textAnchor="middle" fontFamily={SANS} fontSize={22} letterSpacing={8} fill={INK}>
                {clock}
              </text>
              <circle cx={995} cy={340} r={5} fill={INK} opacity={0.5 + 0.5 * Math.sin(frame * 0.2)} />
            </g>
          ) : null}
          <Particles frame={frame} count={34} opacity={0.4} speed={0.5} color="#f3e6cf" area={[-200, 0, 2200, 900]} />
        </Camera>
      </Svg>
      <Vignette amount={0.6} />
    </>
  );
};
