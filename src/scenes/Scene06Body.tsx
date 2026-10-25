import React from 'react';
import {Camera, Ground, HandDrawn, Particles, Vignette} from '../components/Stage';
import {PulseRings} from '../components/Glyphs';
import {SmallCaps} from '../components/Overlays';
import {FACES, HUG, lerpFace, lerpPose, STAND} from '../lib/pose';
import {INK, RED, StickFigure} from '../components/StickFigure';
import {beatsAt} from '../lib/heart';
import {easeInOut, easeOut, lerp, seg} from '../lib/anim';
import {Svg} from './kit';
import type {SceneProps} from './types';

const PX = 960;
const GY = 850;
const S = 1.12;
const TIGHT = {...HUG, shrug: 20, headDrop: 14, lean: -5};

export const Scene06Body: React.FC<SceneProps> = ({frame, dur, p, tm}) => {
  const tSh = tm.at('shoulders', 0.2);
  const tHeart = tm.at('heart', 0.4);
  const tBreath = tm.at('breathing', 0.58);
  const tBrace = tm.at('bracing', 0.75);

  const tense = seg(frame, tSh, tSh + 36, easeOut);
  const pose = lerpPose(STAND, TIGHT, tense);
  const bracing = seg(frame, tBrace, tBrace + 30);
  const face = lerpFace(lerpFace(FACES.neutral, FACES.worried, tense), FACES.anxious, bracing);
  const tremble = 2.6 * seg(frame, tSh + 20, dur - 20) + 1.5 * bracing;

  const beats = beatsAt(frame, dur);
  const beatPhase = beats % 1;
  const thump = Math.exp(-beatPhase * 9) * seg(frame, tHeart - 8, tHeart + 6);
  const chest = {x: PX, y: GY - (124 + 62) * S};
  const heartIn = seg(frame, tHeart - 8, tHeart + 10);

  const breathIn = seg(frame, tBreath - 10, tBreath + 20);
  const shallow = seg(frame, tBreath, dur - 10);
  const breathSpeed = lerp(1, 3.2, shallow);

  // Breath trace: frequency up, amplitude down.
  const pts: string[] = [];
  const W0 = 520;
  const W1 = 1400;
  for (let i = 0; i <= 120; i++) {
    const u = i / 120;
    const x = lerp(W0, W1, u);
    const f = lerp(1.2, 3.4 + 7 * shallow, u);
    const amp = lerp(34, 34 - 24 * shallow, u);
    const ph = u * f * Math.PI * 2 * 1.4 - frame * 0.12 * breathSpeed * 0.5;
    pts.push(`${x.toFixed(1)},${(150 - Math.sin(ph) * amp).toFixed(1)}`);
  }

  const cam = {x: PX, y: lerp(620, 600, easeInOut(p)), zoom: lerp(1.05, 1.32, easeInOut(p)) + 0.012 * thump, rot: 0};

  // Tightening marks at the shoulders.
  const sh = tense * (0.6 + 0.4 * Math.sin(frame * 0.4));
  const shY = GY - (124 + 96) * S - 20;

  return (
    <>
      <Svg>
        <Camera cam={cam} frame={frame} shake={0.35 * seg(p, 0.5, 1)}>
          <HandDrawn frame={frame}>
            <Ground y={GY} x1={300} x2={1620} opacity={0.75} />
            <StickFigure
              x={PX}
              y={GY}
              scale={S}
              pose={pose}
              face={face}
              frame={frame}
              seed={2}
              tremble={tremble}
              breath={breathSpeed}
              redGlow={0.35 * tense * (0.4 + 0.6 * thump)}
            />
            {tense > 0.05 ? (
              <g stroke={RED} strokeWidth={5} strokeLinecap="round" fill="none" opacity={sh}>
                <path d={`M ${PX - 150 + 22 * tense} ${shY - 10} L ${PX - 112 + 22 * tense} ${shY + 10}`} />
                <path d={`M ${PX + 150 - 22 * tense} ${shY - 10} L ${PX + 112 - 22 * tense} ${shY + 10}`} />
                <path d={`M ${PX - 170 + 22 * tense} ${shY + 24} L ${PX - 132 + 22 * tense} ${shY + 44}`} opacity={0.6} />
                <path d={`M ${PX + 170 - 22 * tense} ${shY + 24} L ${PX + 132 - 22 * tense} ${shY + 44}`} opacity={0.6} />
              </g>
            ) : null}
          </HandDrawn>
          <PulseRings x={chest.x} y={chest.y} phase={beatPhase} maxR={420} opacity={heartIn} width={3.5} />
          <circle cx={chest.x} cy={chest.y} r={10 + 8 * thump} fill={RED} opacity={0.9 * heartIn} />
          {/* breath: a ribcage arc that barely moves once breathing turns shallow */}
          <ellipse
            cx={chest.x}
            cy={chest.y + 8}
            rx={58 + (14 - 9 * shallow) * Math.sin(frame * 0.12 * breathSpeed)}
            ry={46 + (9 - 6 * shallow) * Math.sin(frame * 0.12 * breathSpeed)}
            fill="none"
            stroke={INK}
            strokeWidth={2}
            strokeDasharray="3 9"
            opacity={0.45 * breathIn}
          />
          <Particles frame={frame} count={26} opacity={0.25} speed={0.4} area={[0, 0, 1920, 950]} />
        </Camera>

        <g opacity={breathIn}>
          <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" opacity={0.75} />
          <SmallCaps text="BREATH" x={W0 - 70} y={156} size={16} align="right" />
        </g>
        <g opacity={heartIn}>
          <SmallCaps text={`${Math.round(64 + 64 * (frame / dur))} BPM`} x={1790} y={96} size={18} align="right" color="#b2403d" />
        </g>
      </Svg>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 55%, transparent 30%, rgba(60,6,6,${0.35 * heartIn * (0.4 + 0.6 * thump)}) 100%)`, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      <Vignette amount={0.7} />
    </>
  );
};

