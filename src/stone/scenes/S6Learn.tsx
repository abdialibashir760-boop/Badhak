import React from 'react';
import {Camera, HandDrawn, Parallax, Particles, Vignette} from '../../components/Stage';
import {Svg} from '../../scenes/kit';
import type {SceneProps} from '../../scenes/types';
import {useKeys} from '../i18n';
import {clamp, easeInOut, easeOut, lerp, seg} from '../../lib/anim';
import {lerpPose, walkPose, type Pose} from '../../lib/pose';
import {Backdrop, Foreground, GROUND_Y} from '../art/Backdrop';
import {CampBack, CampFire, Log} from '../art/CampSet';
import {Fire, FlintBlade} from '../art/Camp';
import {Fog, Grade, PaintOverlay, SINK} from '../art/Nature';
import {FACE, Hero, lerpHeroFace} from '../figures/Hero';
import {Local, LOOKS} from '../figures/Local';
import {POSES} from '../figures/skeleton';
import {Smoke} from '../art/Far';

const STRIDE = 1.37;

const Sticks: React.FC<{x: number; y: number; n?: number; s?: number; rot?: number}> = ({x, y, n = 6, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    {Array.from({length: n}, (_, i) => (
      <path key={i} d={`M ${-40 + i * 4},${i * 5} L ${90 + i * 10},${-40 + i * 9} M ${40 + i * 6},${-18 + i * 7} l 18,-26 M ${64 + i * 4},${-20 + i * 8} l 14,22`} stroke={i % 2 ? '#5a3e27' : '#6e4d2f'} strokeWidth={7} strokeLinecap="round" fill="none" />
    ))}
  </g>
);

export const S6Learn: React.FC<SceneProps> = ({frame, dur, tm}) => {
  const K = useKeys(tm);
  const tod = lerp(0.6, 0.76, frame / dur);
  const tMake = K.at('Make', 0.45);
  const tShape = K.at('Shape', 0.55);
  const tBuild = K.at('Build', 0.66);
  const tShare = K.at('Share', 0.78);
  const tRecon = K.at('reconstruct', 0.88);
  const L = LOOKS;

  type Shot = 'wood' | 'fire' | 'stone' | 'shelter' | 'share';
  let shot: Shot = 'wood';
  if (frame >= tMake - 10) shot = 'fire';
  if (frame >= tShape - 8) shot = 'stone';
  if (frame >= tBuild - 8) shot = 'shelter';
  if (frame >= tShare - 8) shot = 'share';
  const t0 = {wood: 0, fire: tMake - 10, stone: tShape - 8, shelter: tBuild - 8, share: tShare - 8}[shot];
  const lf = frame - t0; // shot-local frame

  // ---- shot A: carrying firewood through the forest (tracking)
  const wx = lerp(300, 1500, seg(frame, 0, tMake - 10, easeInOut));
  const wpose = (off: number, amp = 0.85): Pose => walkPose((wx - 300 + off) / (0.85 * STRIDE), POSES.hold, amp);
  const drop = seg(frame, 200, 230) * (1 - seg(frame, 230, 260));

  // ---- shot B: fire by spark and tinder
  const strikeT = (lf % 36) / 36;
  const spark = lf > 20 && lf < 150 ? Math.max(0, 1 - strikeT * 3) : 0;
  const blowHard = seg(lf, 150, 168) * (1 - seg(lf, 176, 190));
  const blowSoft = seg(lf, 210, 250);
  const ember = clamp(seg(lf, 90, 150) * (1 - blowHard) + blowSoft);
  const flame = seg(lf, 240, 330, easeInOut);

  // ---- shot C: knapping lesson
  const hit = Math.sin(lf * 0.5);
  const flake = seg(lf, 130, 190, easeOut);
  const proud = seg(lf, 190, 230);

  // ---- shot D: raising the shelter
  const build = seg(lf, 30, 190, easeInOut);

  const heroPose: Pose =
    shot === 'wood'
      ? lerpPose(wpose(0), {...POSES.hold, aU: 90, aF: 80, bU: 70, bF: 70, lean: -4}, 0.4)
      : shot === 'fire'
        ? lerpPose({...POSES.crouch, lean: 36, aU: 62, aF: 98, bU: 48, bF: 90, headDrop: 12}, {...POSES.crouch, lean: 52, headDrop: 20, aU: 72, aF: 100}, Math.max(blowHard, blowSoft * 0.7))
        : shot === 'stone'
          ? {...POSES.crouch, lean: 26, aU: 64 + hit * 22, aF: 100 + hit * 40, bU: 32, bF: 86}
          : shot === 'shelter'
            ? lerpPose(POSES.hold, {...POSES.both, aU: 150, aF: 175, bU: 120, bF: 160, lean: -3}, build)
            : {...POSES.sitCalm, lean: 4};
  let heroFace = FACE.focus;
  if (shot === 'wood') heroFace = {...FACE.awkward, brow: -0.4, sweat: 0.4} as typeof FACE.awkward;
  if (shot === 'fire') heroFace = lerpHeroFace(lerpHeroFace(FACE.focus, FACE.scared, blowHard), FACE.smile, flame);
  if (shot === 'stone') heroFace = lerpHeroFace(lerpHeroFace(FACE.focus, {...FACE.shout, open: 0.5, brow: -0.8}, seg(lf, 60, 70) * (1 - seg(lf, 90, 104))), FACE.smile, proud);
  if (shot === 'shelter') heroFace = lerpHeroFace(FACE.focus, FACE.smile, build);
  if (shot === 'share') heroFace = lerpHeroFace(FACE.calm, FACE.smile, seg(lf, 20, 80));

  const cams: Record<Shot, {x: number; y: number; zoom: number}> = {
    wood: {x: wx + 120, y: 650, zoom: 1.1},
    fire: {x: 1000, y: 790, zoom: lerp(2.2, 2.5, seg(lf, 0, 330))},
    stone: {x: 1000, y: 770, zoom: 2.4},
    shelter: {x: lerp(760, 880, seg(lf, 0, 200)), y: 640, zoom: 1.3},
    share: {x: lerp(1200, 1260, seg(lf, 0, dur - t0)), y: 660, zoom: lerp(1.25, 1.1, seg(frame, tRecon, dur))},
  };
  const cam = cams[shot];

  return (
    <>
      <Svg>
        <Camera cam={{...cam, rot: 0}} frame={frame}>
          <Backdrop frame={frame} tod={tod} seed={17} clearing={shot === 'wood' ? undefined : [1000, 2300]} giant={shot === 'wood'} snow={3} leaves={shot === 'wood'} />
          <HandDrawn frame={frame}>
            {shot === 'wood' ? (
              <>
                <Local x={wx - 420} y={GROUND_Y + 30} scale={0.84} facing={1} look={L.hunter} pose={wpose(-420, 0.8)} face={FACE.focus} frame={frame} seed={41} />
                <Sticks x={wx - 420 + 50} y={GROUND_Y - 180} n={8} s={1.2} rot={-8} />
                <Local x={wx - 250} y={GROUND_Y + 32} scale={0.82} facing={1} look={L.woman} pose={wpose(-250, 0.8)} face={FACE.calm} frame={frame} seed={42} />
                <Sticks x={wx - 250 + 50} y={GROUND_Y - 170} n={5} s={1.0} rot={-4} />
                <Local x={wx - 600} y={GROUND_Y + 30} scale={0.62} facing={1} look={L.child} pose={wpose(-600, 0.8)} face={FACE.smile} frame={frame} seed={43} headScale={1.15} />
                <Hero x={wx} y={GROUND_Y + 30} scale={0.85} pose={heroPose} face={heroFace} frame={frame} seed={3} idle={0.8} wind={0.2} />
                <Sticks x={wx + 40} y={GROUND_Y - 150} n={14} s={1.5} rot={-10 + Math.sin(frame * 0.12) * 3} />
                {drop > 0 ? <path d={`M ${wx + 130},${GROUND_Y - 150 + drop * 150} l 70,-20`} stroke="#6e4d2f" strokeWidth={7} strokeLinecap="round" /> : null}
              </>
            ) : null}

            {shot === 'fire' ? (
              <>
                <ellipse cx={1000} cy={GROUND_Y + 42} rx={90} ry={16} fill="#2a1d12" stroke={SINK} strokeWidth={3} />
                <g>
                  {Array.from({length: 18}, (_, i) => (
                    <path key={i} d={`M ${940 + i * 7},${GROUND_Y + 38} q ${(i % 3) * 3 - 3},-22 ${(i % 2 ? 1 : -1) * 12},-26`} stroke="#c9b277" strokeWidth={3} fill="none" strokeLinecap="round" />
                  ))}
                </g>
                {ember > 0.02 ? <circle cx={1000} cy={GROUND_Y + 22} r={6 + 8 * ember} fill="#ff7a2a" opacity={0.4 + 0.6 * ember} /> : null}
                {blowHard > 0.3 ? (
                  <g opacity={blowHard}>
                    {Array.from({length: 10}, (_, i) => (
                      <circle key={i} cx={1000 + (i - 4) * 36 * blowHard} cy={GROUND_Y + 10 - Math.abs(i - 4) * 18 * blowHard} r={4} fill="#ff9a3c" opacity={0.8} />
                    ))}
                  </g>
                ) : null}
                {flame > 0.02 ? <Fire x={1000} y={GROUND_Y + 38} s={0.5 + flame * 0.5} frame={frame} intensity={0.2 + 0.7 * flame} id="learnfire" /> : null}
                <Local x={780} y={GROUND_Y + 40} scale={0.85} facing={1} look={L.forager} pose={{...POSES.crouch, lean: 34, aU: 58, aF: 96, bU: 44, bF: 88}} face={FACE.focus} frame={frame} seed={44} />
                <Hero x={1240} y={GROUND_Y + 40} scale={0.85} facing={-1} pose={heroPose} face={heroFace} frame={frame} seed={3} idle={0.4} wind={0.1} />
                {spark > 0 ? (
                  <g opacity={spark}>
                    {Array.from({length: 8}, (_, i) => (
                      <circle key={i} cx={930 + i * 10 - spark * 10} cy={GROUND_Y - 4 - i * 6 * (1 - spark * 0.4)} r={3} fill="#ffd36a" />
                    ))}
                  </g>
                ) : null}
                <Smoke x={1000} y={GROUND_Y} frame={frame} h={240} opacity={0.5 * flame} />
              </>
            ) : null}

            {shot === 'stone' ? (
              <>
                <Local x={780} y={GROUND_Y + 40} scale={0.85} facing={1} look={L.forager} pose={{...POSES.crouch, lean: 30, aU: 60 + Math.sin(lf * 0.5 + 1) * 14, aF: 100 + Math.sin(lf * 0.5 + 1) * 24, bU: 40, bF: 88}} face={FACE.calm} frame={frame} seed={44} />
                <Hero x={1240} y={GROUND_Y + 40} scale={0.85} facing={-1} pose={heroPose} face={heroFace} frame={frame} seed={3} idle={0.4} wind={0.1} />
                <ellipse cx={1010} cy={GROUND_Y + 40} rx={50} ry={16} fill="#6c675f" stroke={SINK} strokeWidth={3.5} />
                {flake < 0.1 ? <ellipse cx={1010} cy={GROUND_Y + 22} rx={30} ry={20} fill="#8c8478" stroke={SINK} strokeWidth={3.5} /> : null}
                {flake > 0.02 && proud < 0.5 ? <FlintBlade x={lerp(1030, 1160, flake)} y={GROUND_Y + 10 - Math.sin(flake * Math.PI) * 120} s={1.2} rot={flake * 540} /> : null}
                {proud > 0.5 ? <FlintBlade x={1140} y={GROUND_Y - 150 + (1 - proud) * 20} s={1.6} rot={-50} /> : null}
                {lf % 25 < 6 && lf < 130 ? <circle cx={1010} cy={GROUND_Y + 10} r={18} fill="#ffe3a0" opacity={0.7 * (1 - (lf % 25) / 6)} /> : null}
              </>
            ) : null}

            {shot === 'shelter' ? (
              <>
                <CampBack frame={frame} tod={tod} glow={0.4} rack={false} lean={build} />
                <CampFire frame={frame} intensity={0.55} s={0.7} />
                <Local x={560} y={GROUND_Y + 32} scale={0.86} facing={1} look={L.hunter} pose={lerpPose(POSES.hold, {...POSES.both, aU: 140, aF: 170, bU: 110, bF: 150}, build)} face={FACE.focus} frame={frame} seed={45} />
                <Local x={880} y={GROUND_Y + 30} scale={0.62} facing={-1} look={L.child} pose={{...POSES.work, lean: 18}} face={FACE.smile} frame={frame} seed={46} headScale={1.15} />
                <Local x={1040} y={GROUND_Y + 32} scale={0.84} facing={-1} look={L.woman} pose={{...POSES.hold, aU: 70 + Math.sin(frame * 0.2) * 10}} face={FACE.calm} frame={frame} seed={47} held={[{kind: 'bag', hand: 'B'}]} />
                <Hero x={720} y={GROUND_Y + 32} scale={0.85} pose={heroPose} face={heroFace} frame={frame} seed={3} idle={0.5} wind={0.1} />
                <line x1={770} y1={GROUND_Y - 250} x2={lerp(760, 650, build)} y2={GROUND_Y - 480} stroke="#5a3e27" strokeWidth={10} strokeLinecap="round" />
              </>
            ) : null}

            {shot === 'share' ? (
              <>
                <CampBack frame={frame} tod={tod} glow={0.6} rack lean={1} />
                <Log x={1050} y={GROUND_Y + 56} w={160} />
                <Log x={1620} y={GROUND_Y + 56} w={160} />
                <CampFire frame={frame} intensity={0.9} s={0.8} />
                <Local x={1030} y={GROUND_Y + 36} scale={0.84} facing={1} look={L.hunter} pose={{...POSES.sitCalm, aU: 40, aF: 90}} face={FACE.calm} frame={frame} seed={51} />
                <Hero x={1180} y={GROUND_Y + 36} scale={0.85} facing={1} pose={{...POSES.sitCalm, aU: 44, aF: 96}} face={heroFace} frame={frame} seed={3} idle={0.6} wind={0.1} />
                <Local x={1540} y={GROUND_Y + 36} scale={0.84} facing={-1} look={L.woman} pose={{...POSES.sitCalm, aU: 50, aF: 100}} face={FACE.smile} frame={frame} seed={52} />
                <Local x={1680} y={GROUND_Y + 36} scale={0.84} facing={-1} look={L.elder} pose={POSES.sitCalm} face={FACE.calm} frame={frame} seed={53} />
                <Local x={1360} y={GROUND_Y + 34} scale={0.62} facing={-1} look={L.child} pose={{...POSES.stand, aU: 60, aF: 70}} face={FACE.smile} frame={frame} seed={54} headScale={1.15} />
                <FlintBlade x={1490} y={GROUND_Y + 84} s={1.0} rot={8} />
              </>
            ) : null}
          </HandDrawn>
          <Parallax depth={1.1}>
            <Fog frame={frame} y={GROUND_Y + 70} opacity={0.22} id="fogL1" color="#f0d9bd" seed={6} speed={0.5} h={80} />
            <Particles frame={frame} count={16} opacity={0.3} area={[-200, 200, 3200, 700]} color="#ffe0a8" />
          </Parallax>
          <Foreground frame={frame} tod={tod} seed={17} trunks={[-300, 2350]} />
        </Camera>
      </Svg>
      <PaintOverlay />
      <Grade tod={tod} />
      <Vignette amount={0.5} />
    </>
  );
};
