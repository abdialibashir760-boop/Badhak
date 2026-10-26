import React from 'react';
import {Camera, HandDrawn, Parallax, Particles, Vignette} from '../../components/Stage';
import {Svg} from '../../scenes/kit';
import type {SceneProps} from '../../scenes/types';
import {useKeys, useText} from '../i18n';
import {easeInOut, easeOut, easeOutBack, lerp, seg} from '../../lib/anim';
import {lerpPose, walkPose, type Pose} from '../../lib/pose';
import {Backdrop, Foreground, GROUND_Y} from '../art/Backdrop';
import {CampBack, CampFire} from '../art/CampSet';
import {DistantCave} from '../art/Far';
import {Grade, PaintOverlay} from '../art/Nature';
import {FlintBlade, Tracks} from '../art/Camp';
import {PictoBubble, Sketch} from '../art/Glyphs';
import {FACE, Hero, lerpHeroFace} from '../figures/Hero';
import {Local, LOOKS} from '../figures/Local';
import {POSES} from '../figures/skeleton';
import {SmallCaps} from '../../components/Overlays';

const STRIDE = 1.37;
const GX = 620; // where the hero stops

export const S3Locals: React.FC<SceneProps> = ({frame, dur, tm}) => {
  const K = useKeys(tm);
  const TX = useText();
  const tod = lerp(0.3, 0.4, frame / dur);
  const tSkills = K.at('skills', 0.2);
  const tLand = K.at('landscape', 0.3);
  const tTracks = K.at('tracks', 0.4);
  const tTools = K.at('tools', 0.5);
  const tRest = K.at('restaurant', 0.68);
  const tLouder = K.at('louder', 0.9);

  // hero walks in, stops, waves
  const walkT = seg(frame, 20, 190, easeInOut);
  const hx = lerp(120, GX, walkT);
  const walking = walkT > 0 && walkT < 0.995;
  const heroWalk = walkPose((hx - 120) / (0.85 * STRIDE), POSES.stand, 0.9);
  const waveAmt = seg(frame, 205, 225) * (1 - seg(frame, tSkills - 10, tSkills + 6));
  const wave = lerpPose(POSES.stand, POSES.wave, waveAmt);
  wave.aF += Math.sin(frame * 0.5) * 22 * waveAmt;
  // restaurant mime: both hands to mouth ("eat"), then a shout
  const mime = seg(frame, tRest - 6, tRest + 10) * (1 - seg(frame, tLouder - 20, tLouder - 6));
  const eatCycle = Math.sin(frame * 0.35) * 0.5 + 0.5;
  const mimePose: Pose = {...POSES.hold, aU: lerp(40, 84, eatCycle), aF: lerp(95, 168, eatCycle), bU: 20, bF: 80, tilt: 4, lean: 6};
  const shout = seg(frame, tLouder - 4, tLouder + 8, easeOut) * (1 - seg(frame, tLouder + 50, tLouder + 70));
  const shoutPose: Pose = {...POSES.both, lean: -4, aU: 120, aF: 150, bU: -120, bF: -150, tilt: -8};
  const slump = seg(frame, tLouder + 60, tLouder + 100);
  let heroPose: Pose = walking ? heroWalk : lerpPose(POSES.stand, wave, 1);
  heroPose = lerpPose(heroPose, mimePose, mime);
  heroPose = lerpPose(heroPose, shoutPose, shout);
  heroPose = lerpPose(heroPose, POSES.shrug, slump * 0.8);
  const heroFace = lerpHeroFace(lerpHeroFace(lerpHeroFace(FACE.awkward, FACE.confused, seg(frame, tSkills, tSkills + 30)), FACE.hungry, mime), FACE.shout, shout);

  // locals: notice -> act
  const notice = seg(frame, 120, 170);
  const recoil = shout;
  const hunterPoint = seg(frame, tLand - 8, tLand + 14, easeOut) * (1 - seg(frame, tLand + 80, tLand + 100));
  const hunterPose = lerpPose(lerpPose({...POSES.hold, aU: 8, aF: 4, bU: -6, bF: -8, lean: 0}, POSES.point, hunterPoint), {...POSES.freeze, lean: -10}, recoil * 0.8);
  const woman = lerpPose(POSES.stand, POSES.crouch, seg(frame, tTracks - 14, tTracks + 10, easeInOut) * (1 - seg(frame, tTracks + 100, tTracks + 130)));
  const knap = Math.sin(frame * 0.52);
  const forager = {...POSES.work, aU: 40 + knap * 22 + 20, aF: 96 + knap * 36, bU: 22, bF: 80};
  const childCover = seg(frame, tLouder, tLouder + 8);
  const childPose = lerpPose(POSES.stand, {...POSES.both, aU: 150, aF: 175, bU: -150, bF: -175}, childCover);
  const elderPose = lerpPose({...POSES.stand, bU: -4, bF: 0}, {...POSES.freeze, tilt: 10, lean: -6}, recoil * 0.6);
  const copy = seg(frame, tRest + 24, tRest + 40) * (1 - seg(frame, tLouder - 20, tLouder - 10));
  const childEat = lerpPose(childPose, {...mimePose, aU: lerp(30, 70, eatCycle), aF: lerp(90, 160, eatCycle)}, copy);
  const looks = (g: number) => ({...FACE.neutral, brow: 0.2 * notice, gx: -0.9 * notice + g, eye: 0.9});
  const confused = (i: number) => lerpHeroFace(looks(0), {...FACE.confused, gx: -0.8, gy: Math.sin(frame * 0.06 + i) * 0.3}, seg(frame, tSkills + 10 + i * 8, tSkills + 40 + i * 8));
  const shockFace = lerpHeroFace(FACE.neutral, {...FACE.shout, open: 0.3, brow: -0.8}, recoil);

  // knapping sparks
  const strike = frame % 24;
  const spark = strike < 8 ? 1 - strike / 8 : 0;

  // cameras (cuts): wide tracking -> pan over group -> pan to horizon -> tracks insert -> knap insert -> mime -> shout
  const camsOrder: Array<[number, {x: number; y: number; zoom: number}]> = [
    [0, {x: lerp(480, 840, seg(frame, 0, 200, easeInOut)), y: 640, zoom: 1.05}],
    [tSkills, {x: lerp(1000, 1600, seg(frame, tSkills, tLand, easeInOut)), y: 650, zoom: 1.3}],
    [tLand, {x: lerp(1500, 2050, seg(frame, tLand, tTracks - 10, easeInOut)), y: 600, zoom: 0.95}],
    [tTracks - 10, {x: 1250, y: 800, zoom: 2.1}],
    [tTools - 6, {x: 1520, y: 760, zoom: 2.4}],
    [tTools + 100, {x: lerp(960, 1000, seg(frame, tTools + 100, tRest, easeInOut)), y: 640, zoom: 1.15}],
    [tRest - 8, {x: 1040, y: 640, zoom: lerp(1.2, 1.55, seg(frame, tRest - 8, tLouder - 20, easeInOut))}],
    [tLouder - 16, {x: 960, y: 600, zoom: lerp(1.3, 1.1, seg(frame, tLouder - 16, tLouder + 40, easeOut))}],
    [tLouder + 70, {x: 900, y: 640, zoom: lerp(1.1, 1.45, seg(frame, tLouder + 70, dur, easeInOut))}],
  ];
  let cam = camsOrder[0][1];
  for (const [t, c] of camsOrder) if (frame >= t) cam = c;
  const insertKnap = frame >= tTools - 6 && frame < tTools + 100;

  const camShake = 14 * Math.exp(-Math.max(0, frame - (tLouder - 2)) / 7) * (frame >= tLouder - 2 ? 1 : 0);

  const bubbleOn = (a: number, b: number) => seg(frame, a, a + 14, easeOutBack) * (1 - seg(frame, b - 12, b));
  const L = LOOKS;

  return (
    <>
      <Svg>
        <Camera cam={{...cam, rot: 0}} frame={frame} shake={camShake}>
          <Backdrop frame={frame} tod={tod} seed={8} clearing={[1100, 2300]} giant={false} snow={3} />
          <DistantCave frame={frame} tod={tod} x={2750} y={790} />
          <HandDrawn frame={frame}>
            <CampBack frame={frame} tod={tod} glow={0.4} rack lean={0} />
            <CampFire frame={frame} intensity={0.6} s={0.7} />
            <Tracks x={1180} y={GROUND_Y + 96} kind="hoof" s={1.1} count={5} rot={2} opacity={0.9} />
            <Tracks x={1000} y={GROUND_Y + 120} kind="wolf" s={1.0} count={3} />

            <Local x={1010} y={GROUND_Y + 30} scale={0.62} facing={-1} look={L.child} pose={childEat} face={childCover > 0.5 ? shockFace : confused(0)} frame={frame} seed={11} headScale={1.15} />
            <Local x={1150} y={GROUND_Y + 28} scale={0.86} facing={-1} look={L.hunter} pose={hunterPose} face={recoil > 0.3 ? shockFace : confused(1)} frame={frame} seed={12} held={[{kind: 'spear', hand: 'B', rot: -84}]} />
            <Local x={1300} y={GROUND_Y + 30} scale={0.82} facing={-1} look={L.woman} pose={woman} face={recoil > 0.3 ? shockFace : confused(2)} frame={frame} seed={13} held={[{kind: 'bag', hand: 'B'}]} />
            <Local x={1470} y={GROUND_Y + 32} scale={0.8} facing={-1} look={L.forager} pose={forager} face={{...FACE.focus, gx: -0.4}} frame={frame} seed={14} held={[{kind: 'flint', hand: 'A'}]} />
            <Local x={1620} y={GROUND_Y + 30} scale={0.84} facing={-1} look={L.elder} pose={elderPose} face={recoil > 0.3 ? shockFace : confused(3)} frame={frame} seed={15} held={[{kind: 'stick', hand: 'B'}]} />
            {frame > tTracks - 14 && frame < tTracks + 120 ? <FlintBlade x={1310} y={GROUND_Y + 132} s={0.8} rot={4} /> : null}

            <Hero x={hx} y={GROUND_Y + 30} scale={0.85} pose={heroPose} face={heroFace} frame={frame} seed={3} idle={0.8} wind={0.2} />

            {/* knapping sparks */}
            {insertKnap || frame % 48 < 40 ? (
              <g transform={`translate(1560,${GROUND_Y - 6})`} opacity={spark}>
                {Array.from({length: 7}, (_, i) => (
                  <circle key={i} cx={(i - 3) * 8 * (1 - spark * 0.4) + 10} cy={-14 - Math.abs(i - 3) * 10 * (1 - spark)} r={2.6} fill="#ffd36a" />
                ))}
              </g>
            ) : null}

            {/* speech bubbles in an unknown language */}
            <PictoBubble x={1150} y={GROUND_Y - 520} frame={frame} glyphs={['q', 'eye']} grow={bubbleOn(tSkills + 20, tSkills + 120)} tailTo={{x: 1150, y: GROUND_Y - 330}} seed={1} />
            <PictoBubble x={1450} y={GROUND_Y - 500} frame={frame} glyphs={['sun', 'spear', 'paw']} grow={bubbleOn(tLand + 10, tLand + 110)} tailTo={{x: 1460, y: GROUND_Y - 320}} seed={2} />
            <PictoBubble x={1290} y={GROUND_Y - 520} frame={frame} glyphs={['q', 'q']} grow={bubbleOn(tRest + 30, tLouder - 20)} tailTo={{x: 1300, y: GROUND_Y - 330}} seed={3} />
            <PictoBubble x={1570} y={GROUND_Y - 520} frame={frame} glyphs={['hand', 'eye', 'q']} grow={bubbleOn(tRest + 50, tLouder - 10)} tailTo={{x: 1620, y: GROUND_Y - 340}} seed={4} />
            {/* the hero's imagination: dashed sketch plate and cutlery */}
            <Sketch kind="plate" x={hx + 20} y={GROUND_Y - 470} s={1.15} opacity={mime * (0.7 + 0.3 * Math.sin(frame * 0.2))} />
          </HandDrawn>
          {frame > tLouder - 4 && frame < tLouder + 70 ? (
            <g opacity={seg(frame, tLouder - 4, tLouder + 4) * (1 - seg(frame, tLouder + 50, tLouder + 70))}>
              <text x={hx + 330} y={GROUND_Y - 470} textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontWeight={700} fontSize={104} fill="#f2ead8" stroke="#0d0907" strokeWidth={6} paintOrder="stroke" transform={`rotate(${-6 + Math.sin(frame * 1.9) * 1.5} ${hx + 330} ${GROUND_Y - 470})`} letterSpacing={4}>
                {TX.shout}
              </text>
              {[-1, 1].map((s) => (
                <path key={s} d={`M ${hx + 120 + s * 90},${GROUND_Y - 380} l ${s * 40},-30 M ${hx + 120 + s * 100},${GROUND_Y - 330} l ${s * 54},0`} stroke="#f2ead8" strokeWidth={6} strokeLinecap="round" />
              ))}
            </g>
          ) : null}
          <Parallax depth={1.1}>
            <Particles frame={frame} count={20} opacity={0.3} area={[-200, 200, 3200, 700]} />
          </Parallax>
          <Foreground frame={frame} tod={tod} seed={8} trunks={[-300, 2300]} />
        </Camera>
        {/* tag when the elder is introduced */}
        <g opacity={seg(frame, tSkills + 10, tSkills + 30) * (1 - seg(frame, tSkills + 90, tSkills + 110))}>
          <SmallCaps text={TX.locals} x={960} y={150} size={20} color="#e8e0cf" spacing={0.3} />
        </g>
      </Svg>
      <PaintOverlay />
      <Grade tod={tod} />
      <Vignette amount={0.5} />
    </>
  );
};
