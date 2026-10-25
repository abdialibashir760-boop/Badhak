import React from 'react';
import {Camera, Ground, HandDrawn, Parallax, Particles, Vignette} from '../components/Stage';
import {Label} from '../components/Glyphs';
import {FACES, GUARDED, lerpFace, lerpPose, RELAXED, STAND, WAVE, walkPose} from '../lib/pose';
import {INK, RED, StickFigure} from '../components/StickFigure';
import {easeInOut, easeOut, kf, lerp, rng, seg} from '../lib/anim';
import {Silhouette, Svg} from './kit';
import type {SceneProps} from './types';

const GY = 800;
const PX0 = 560;
const S = 0.66;
const GROUP = [1330, 1440, 1550, 1660];

const blobPath = (cx: number, base: number, w: number, h: number, frame: number, seed: number) => {
  const ph = rng(seed)() * 6.28;
  const n = 120;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI; // upper half-dome
    const wob = 1 + 0.07 * Math.sin(a * 3 + frame * 0.04 + ph) + 0.035 * Math.sin(a * 6 - frame * 0.06 + ph * 2);
    pts.push(`${(cx + Math.cos(a) * w * wob).toFixed(1)},${(base + Math.sin(a) * h * wob).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

export const Scene07Avoid: React.FC<SceneProps> = ({frame, dur, p, tm}) => {
  const tInv = tm.at('invitation', 0.2);
  const tStep = tm.at('stepping', 0.38);
  const tRelief = tm.at('relief', 0.52);
  const tRetreat = tm.at('retreat', 0.66);
  const tShrinks = tm.at('shrinks', 0.9);

  // Invitation: a card flies from the group to the protagonist.
  const fly = seg(frame, tInv - 8, tInv + 42, easeInOut);
  const cardX = lerp(GROUP[0], PX0 + 40, fly);
  const cardY = lerp(560, 380, fly) - Math.sin(fly * Math.PI) * 130;
  const open = seg(frame, tInv + 40, tInv + 66, easeOut);
  const cardOpacity = 1 - seg(frame, tStep + 20, tStep + 70);
  const gotIt = seg(frame, tInv + 30, tInv + 54);

  // Shadow rises between them, shrinks as P retreats, then quietly grows past its first size.
  const rise = seg(frame, tStep - 12, tStep + 26, easeOut);
  const shadowScale = kf(frame, [[tStep, 0], [tStep + 26, 1], [tRelief, 1], [tRelief + 50, 0.42], [tRetreat, 0.5], [dur, 1.5]], easeInOut) * rise;

  // P steps back (walking backwards), relief, then the world closes in.
  const back = seg(frame, tStep + 4, tRelief + 20, easeInOut);
  const px = lerp(PX0, PX0 - 200, back);
  const pose =
    back > 0 && back < 1
      ? walkPose(-(PX0 - px) / S * 1.0, lerpPose(STAND, GUARDED, 0.8), 0.7)
      : lerpPose(lerpPose(STAND, WAVE, 0), lerpPose(GUARDED, RELAXED, seg(frame, tRelief + 20, tRelief + 60)), back);
  const reach = seg(frame, tInv + 50, tStep) * (1 - back);
  const poseFinal = lerpPose(pose, {...STAND, aU: 70, aF: 85, lean: 6}, reach * 0.7);
  const face = lerpFace(lerpFace(FACES.neutral, FACES.anxious, seg(frame, tInv + 30, tStep + 20)), FACES.calm, seg(frame, tRelief + 10, tRelief + 50));

  const close = seg(frame, tRetreat + 10, tShrinks + 40, easeInOut);
  const worldR = lerp(2400, 330, close);
  const groupVis = 1 - seg(frame, tRetreat, tShrinks + 20);
  const groupScale = lerp(1, 0.55, seg(frame, tRetreat, tShrinks + 30));

  const cam = {x: lerp(960, px + 200, easeInOut(p)), y: lerp(560, 640, easeInOut(p)), zoom: lerp(1, 1.18, easeInOut(p))};
  const lightX = 1480;

  return (
    <>
      <Svg>
        <defs>
          <radialGradient id="s7-light" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#8a7a5a" stopOpacity="0.42" />
            <stop offset="0.5" stopColor="#6a6048" stopOpacity="0.16" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="s7-soft">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.7" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="s7-mask" maskUnits="userSpaceOnUse" x={-2000} y={-1000} width={6000} height={3000}>
            <circle cx={px + 100} cy={620} r={worldR} fill="url(#s7-soft)" />
          </mask>
        </defs>
        <Camera cam={cam} frame={frame}>
          <g mask="url(#s7-mask)">
            <Parallax depth={0.6}>
              <ellipse cx={lightX} cy={620} rx={780} ry={520} fill="url(#s7-light)" opacity={groupVis} />
            </Parallax>
            <HandDrawn frame={frame}>
              <Ground y={GY} x1={-400 + close * 600} x2={2300 - close * 1500} opacity={0.85} />
              {/* the path toward the group */}
              <path d={`M ${PX0 + 140} ${GY + 26} L ${GROUP[0] - 60} ${GY + 26}`} stroke={INK} strokeWidth={3} strokeDasharray="2 22" strokeLinecap="round" opacity={0.5 * groupVis} />
              <g transform={`translate(1500,${GY}) scale(${groupScale}) translate(-1500,${-GY})`} opacity={groupVis}>
                {GROUP.map((x, i) => (
                  <Silhouette key={i} x={x} y={GY} s={0.5} frame={frame} seed={i} wave={i === 0 ? 1 : 0} color="#8f8a80" />
                ))}
              </g>
              <StickFigure x={px} y={GY} scale={S} pose={poseFinal} face={face} frame={frame} seed={2} tremble={0.4 * (1 - back)} />
              {/* enormous shadow */}
              {shadowScale > 0.01 ? (
                <g>
                  <path d={blobPath(960, GY + 6, 330 * shadowScale, 620 * shadowScale, frame, 5)} fill="#000" stroke={RED} strokeWidth={3} opacity={1} strokeLinejoin="round" />
                  <path d={blobPath(960, GY + 6, 330 * shadowScale + 18, 620 * shadowScale + 18, frame + 40, 9)} fill="none" stroke={RED} strokeWidth={1.5} opacity={0.35} />
                </g>
              ) : null}
            </HandDrawn>
            {/* the invitation */}
            {cardOpacity > 0 && fly > 0 ? (
              <g transform={`translate(${cardX},${cardY}) rotate(${Math.sin(frame * 0.08) * 6 * (1 - gotIt)})`} opacity={cardOpacity}>
                <rect x={-70} y={-46} width={140} height={92 + 36 * open} rx={4} fill="#050505" stroke={INK} strokeWidth={3} />
                <path d={`M -70 -46 L 0 ${4 - 50 * open} L 70 -46`} fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
                {open > 0.5 ? <Label text="come along?" x={0} y={30} size={24} opacity={(open - 0.5) * 2} color={INK} /> : null}
              </g>
            ) : null}
            <Particles frame={frame} count={30} opacity={0.3} speed={0.4} area={[-300, 0, 2500, 900]} />
          </g>
        </Camera>
      </Svg>
      <Vignette amount={0.55 + 0.4 * close} />
    </>
  );
};
