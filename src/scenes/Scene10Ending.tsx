import React from 'react';
import {Camera, DrawPath, Ground, HandDrawn, Parallax, Particles, Vignette} from '../components/Stage';
import {GeoFrame, JudgeMark, WatchingEye} from '../components/Glyphs';
import {KineticText, SANS, SERIF} from '../components/Overlays';
import {FACES, lerpFace, RELAXED, STAND, lerpPose, walkPose} from '../lib/pose';
import {INK, RED, StickFigure} from '../components/StickFigure';
import {easeInOut, easeOut, lerp, rng, seg} from '../lib/anim';
import {Svg} from './kit';
import type {SceneProps} from './types';

const GY = 820;
const S = 0.5;

type Mark = {kind: 'eye' | 'q' | 'x' | 'tick' | 'frame'; x: number; y: number; size: number; vanish: number; dx: number; dy: number; rot: number};

const makeMarks = (): Mark[] => {
  const r = rng(2024);
  const kinds: Mark['kind'][] = ['eye', 'q', 'x', 'eye', 'tick', 'q', 'frame', 'eye', 'x', 'q', 'eye', 'tick', 'q', 'x'];
  return kinds.map((kind, i) => ({
    kind,
    x: 360 + r() * 1200,
    y: 160 + r() * 520,
    size: 34 + r() * 36,
    vanish: 0.12 + (i / kinds.length) * 0.5 + r() * 0.06,
    dx: (r() - 0.5) * 380,
    dy: -60 - r() * 160,
    rot: (r() - 0.5) * 30,
  }));
};
const MARKS = makeMarks();

export const Scene10Ending: React.FC<SceneProps> = ({frame, dur, p, tm}) => {
  const lastWords = tm.words.slice(-7);
  const tTitle = dur - 106; // channel card starts ~3.5 s before the end
  const textOut = 1 - seg(frame, tTitle - 26, tTitle + 4, easeInOut);
  const worldOut = 1 - seg(frame, tTitle - 10, tTitle + 40, easeInOut);

  // P walks out of the enclosed feeling into open space.
  const walkP = seg(frame, 0, dur - 20, easeInOut);
  const px = lerp(440, 1640, walkP);
  const moving = 1 - seg(frame, dur - 60, dur - 10);
  const pose = walkPose((px - 440) / S, lerpPose(STAND, RELAXED, 0.6), 0.85 * (0.4 + 0.6 * moving));
  const face = lerpFace(FACES.calm, FACES.smile, seg(p, 0.3, 0.7));

  const open = seg(p, 0.1, 0.62, easeInOut);
  const cam = {x: lerp(560, 960, open), y: lerp(640, 540, open), zoom: lerp(1.6, 0.9, open)};
  const horizon = seg(frame, 20, 140, easeOut);

  // Title card.
  const t = Math.max(0, frame - tTitle);
  const ink = seg(t, 6, 50, easeOut);
  const tracking = lerp(0.9, 0.34, seg(t, 0, 80, easeOut));
  const logoIn = seg(t, 0, 30, easeOut);
  const lineIn = seg(t, 34, 80, easeInOut);
  const tag = seg(t, 70, 100, easeOut);

  return (
    <>
      <Svg>
        <g opacity={worldOut}>
          <Camera cam={cam} frame={frame}>
            <Parallax depth={0.3}>
              <circle cx={1280} cy={380 - horizon * 40} r={230} fill="none" stroke={INK} strokeWidth={2} opacity={0.35 * horizon} />
              <circle cx={1280} cy={380 - horizon * 40} r={226} fill="#0e0d0c" opacity={horizon} />
              <path d="M -600 860 Q 100 700 600 820 T 1500 780 T 2500 840" fill="none" stroke={INK} strokeWidth={2} opacity={0.22 * horizon} />
              <path d="M -600 880 Q 300 780 900 860 T 2500 800" fill="none" stroke={INK} strokeWidth={2} opacity={0.15 * horizon} />
            </Parallax>
            <HandDrawn frame={frame}>
              <Ground y={GY} x1={-1800} x2={3800} opacity={0.9} />
              <StickFigure x={px} y={GY} scale={S} pose={pose} face={face} frame={frame} seed={2} />
            </HandDrawn>

            <Parallax depth={1.12}>
              {MARKS.map((m, i) => {
                const out = seg(p, m.vanish, m.vanish + 0.14, easeInOut);
                const o = 1 - out;
                if (o <= 0.01) return null;
                const x = m.x + m.dx * out;
                const y = m.y + m.dy * out;
                const sc = 1 - out * 0.4;
                return (
                  <g key={i} transform={`translate(${x},${y}) scale(${sc}) translate(${-x},${-y})`}>
                    {m.kind === 'eye' ? (
                      <WatchingEye x={x} y={y} size={m.size} look={{x: px, y: GY - 120}} opacity={0.8 * o} rot={m.rot} />
                    ) : m.kind === 'frame' ? (
                      <GeoFrame cx={x} cy={y} w={m.size * 4} h={m.size * 3} opacity={0.5 * o} rot={m.rot} color={INK} />
                    ) : (
                      <JudgeMark kind={m.kind} x={x} y={y} size={m.size} rot={m.rot} opacity={0.85 * o} color={m.kind === 'tick' ? '#9d9993' : RED} />
                    )}
                  </g>
                );
              })}
            </Parallax>
            <Particles frame={frame} count={46} opacity={0.4} speed={0.6} area={[-600, -200, 3200, 1100]} />
          </Camera>
        </g>
      </Svg>
      <Vignette amount={lerp(0.85, 0.45, open)} />

      <KineticText
        frame={frame}
        opacity={textOut}
        y={300}
        size={92}
        tracking={0.08}
        gap={0.26}
        maxWidth={1700}
        words={lastWords.map((w, i) => ({
          text: w.text.replace(/[.]/g, '').toUpperCase(),
          at: w.start,
          color: i === 4 ? '#d2504b' : undefined,
          italic: i === 4,
        }))}
      />

      {/* channel card */}
      <Svg>
        {ink > 0 ? (
          <g>
            <g opacity={logoIn} transform={`translate(960,368) scale(${lerp(0.7, 1, logoIn)})`}>
              <DrawPath d="M -34 0 a 34 34 0 1 1 68 0 a 34 34 0 1 1 -68 0" progress={logoIn} width={4} />
              <circle cx={-12} cy={-4} r={4.5} fill={INK} opacity={logoIn > 0.8 ? 1 : 0} />
              <circle cx={12} cy={-4} r={4.5} fill={INK} opacity={logoIn > 0.8 ? 1 : 0} />
              <circle cx={0} cy={0} r={46 + 160 * (1 - logoIn)} fill="none" stroke={RED} strokeWidth={1.5} opacity={(1 - logoIn) * 0.8} />
            </g>
            <text
              x={960}
              y={540}
              textAnchor="middle"
              fontFamily={SERIF}
              fontWeight={600}
              fontSize={118}
              fill={INK}
              letterSpacing={tracking * 118}
              opacity={ink}
              style={{filter: `blur(${(1 - ink) * 10}px)`}}
            >
              ZİHNİ OYUNU
            </text>
            <path d="M 700 584 L 1220 584" stroke={RED} strokeWidth={2.5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lineIn} />
            <text x={960} y={640} textAnchor="middle" fontFamily={SANS} fontSize={19} letterSpacing={9} fill="#8f8b84" opacity={tag}>
              PSYCHOLOGY, QUIETLY EXPLAINED
            </text>
          </g>
        ) : null}
      </Svg>
    </>
  );
};
