import React from 'react';
import {Camera, Ground, HandDrawn, Parallax, Particles, Spotlight, Vignette} from '../components/Stage';
import {GeoFrame, JudgeMark, WatchingEye} from '../components/Glyphs';
import {FACES, GUARDED, lerpFace, lerpPose, STAND} from '../lib/pose';
import {INK, RED, StickFigure} from '../components/StickFigure';
import {clamp, easeInOut, easeOut, easeOutBack, lerp, rng, seg} from '../lib/anim';
import {Svg} from './kit';
import type {SceneProps} from './types';

const EYES: Array<{x: number; y: number; s: number; r: number}> = [
  {x: 300, y: 250, s: 74, r: -8},
  {x: 640, y: 150, s: 58, r: -4},
  {x: 1010, y: 120, s: 84, r: 0},
  {x: 1370, y: 170, s: 60, r: 5},
  {x: 1650, y: 280, s: 76, r: 9},
  {x: 170, y: 560, s: 48, r: -6},
  {x: 1760, y: 580, s: 52, r: 7},
  {x: 470, y: 430, s: 40, r: -5},
  {x: 1480, y: 450, s: 42, r: 6},
];

export const Scene02Exam: React.FC<SceneProps> = ({frame, p, tm}) => {
  const tChecked = tm.at('checked', 0.55);
  const tScored = tm.at('scored', 0.78);
  const tExam = tm.at('exam', 0.3);
  const lookTarget = {x: 960, y: 560};

  // Examination "room" materialises from the dark: tunnel of frames, spotlight, viewfinder.
  const room = seg(frame, 6, 60, easeInOut);
  const f = (frame * 0.0075) % 1;
  const tunnel = Array.from({length: 9}, (_, i) => {
    const u = i - f;
    const s = Math.pow(0.7, u);
    const op = clamp(u + 1) * clamp((7.5 - u) / 2.5) * 0.5 * room;
    return {w: 1980 * s, h: 1110 * s, op, key: i, rot: Math.sin(frame * 0.01 + i) * 0.4};
  });

  // P glances nervously from eye to eye.
  const ei = Math.floor(frame / 27);
  const order = [2, 0, 4, 7, 1, 8, 3, 5, 6];
  const tgt = EYES[order[ei % order.length]];
  const prev = EYES[order[(ei + order.length - 1) % order.length]];
  const sw = seg(frame % 27, 0, 7, easeOut);
  const gx = lerp((prev.x - 960) / 600, (tgt.x - 960) / 600, sw);
  const gy = lerp((prev.y - 640) / 500, (tgt.y - 640) / 500, sw);
  const tension = seg(frame, tExam, tExam + 40);
  const pose = lerpPose(STAND, GUARDED, tension);
  const face = {...lerpFace(FACES.neutral, FACES.anxious, tension), gx: clamp(gx, -1, 1), gy: clamp(gy, -1, 1)};
  const tilt = clamp(gx, -1, 1) * 6;

  const cam = {x: lerp(960, 960, p), y: lerp(540, 560, easeInOut(p)), zoom: lerp(1, 1.2, easeInOut(p)), rot: Math.sin(p * Math.PI * 2) * 0.8};
  const r = rng(77);
  const marks = EYES.map((e, i) => ({kind: (r() < 0.5 ? 'tick' : 'x') as 'tick' | 'x', t: i < 5 ? tChecked + i * 8 : tScored + (i - 5) * 9, e}));

  return (
    <>
      <Svg>
        <Camera cam={cam} frame={frame}>
          <Parallax depth={0.45}>
            <g transform="translate(0,-70)">
              {tunnel.map((t) => (
                <rect
                  key={t.key}
                  x={960 - t.w / 2}
                  y={540 - t.h / 2}
                  width={t.w}
                  height={t.h}
                  fill="none"
                  stroke={INK}
                  strokeWidth={1.6}
                  opacity={t.op * 0.55}
                  transform={`rotate(${t.rot} 960 540)`}
                />
              ))}
            </g>
          </Parallax>

          <Parallax depth={0.8}>
            {EYES.map((e, i) => {
              const born = 0.1 + i * 0.045;
              const k = seg(p, born, born + 0.07, easeOutBack);
              const blink = ((frame + i * 23) % 130) < 6 ? 0.1 : 1;
              return k > 0 ? (
                <g key={i} transform={`translate(${e.x},${e.y}) scale(${k}) translate(${-e.x},${-e.y})`}>
                  <WatchingEye x={e.x} y={e.y + Math.sin(frame * 0.03 + i) * 6} size={e.s} look={lookTarget} open={blink} rot={e.r} opacity={0.92} />
                </g>
              ) : null;
            })}
            {marks.map((m, i) =>
              frame >= m.t ? (
                <JudgeMark
                  key={i}
                  kind={m.kind}
                  x={m.e.x + m.e.s * 0.9}
                  y={m.e.y + m.e.s * 0.7}
                  size={22}
                  color={m.kind === 'x' ? RED : '#9d9993'}
                  opacity={seg(frame, m.t, m.t + 8, easeOut) * 0.9}
                />
              ) : null,
            )}
          </Parallax>

          <Spotlight x={960} floorY={800} topW={40} floorW={260} id="s2-spot" opacity={room} />
          <HandDrawn frame={frame}>
            <Ground y={800} x1={200} x2={1720} progress={room} opacity={0.8} />
            <GeoFrame cx={960} cy={570} w={420} h={560} progress={seg(frame, tExam, tExam + 30, easeOut)} opacity={0.7} color={RED} width={3} />
            <StickFigure
              x={960}
              y={800}
              scale={0.82}
              pose={{...pose, tilt}}
              face={face}
              frame={frame}
              seed={3}
              tremble={0.6 * tension}
              draw={seg(frame, 0, 28, easeOut)}
            />
          </HandDrawn>
          <Particles frame={frame} count={40} opacity={0.35} speed={0.5} area={[0, 0, 1920, 1000]} />
        </Camera>
      </Svg>
      <Vignette amount={0.62} />
    </>
  );
};
