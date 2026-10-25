import React from 'react';
import {Camera, HandDrawn, Parallax, Vignette} from '../../components/Stage';
import {SmallCaps} from '../../components/Overlays';
import {Svg} from '../../scenes/kit';
import type {SceneProps} from '../../scenes/types';
import {clamp, easeInOut, easeOut, lerp, seg} from '../../lib/anim';
import {lerpPose, walkPose} from '../../lib/pose';
import {Backdrop, Foreground, GROUND_Y} from '../art/Backdrop';
import {DistantCave} from '../art/Far';
import {FlintBlade, Tracks} from '../art/Camp';
import {Fog, Grade, Leaves, PaintOverlay, Rock} from '../art/Nature';
import {FACE, Hero, lerpHeroFace} from '../figures/Hero';
import {POSES} from '../figures/skeleton';

const STRIDE = 1.37; // hero legs are longer than the stick figure the walk cycle was tuned for

export const S2Wrong: React.FC<SceneProps> = ({frame, dur, tm}) => {
  const tod = lerp(0.1, 0.22, frame / dur);
  const tModern = tm.at('Modern', 0.28);
  const tThou = tm.at('thousands', 0.36);
  const tSuper = tm.at('supermarket', 0.52);
  const tPlus = tm.at('plus', 0.75);
  const shotB = tModern - 12;
  const shotC = tThou + 40;
  const shotD = tSuper - 16;
  const shotE = tPlus - 10;

  // --- shot A: stand up and walk through the giant trees, then tilt up
  const stand = seg(frame, 10, 70, easeInOut);
  const walkX = lerp(560, 1500, seg(frame, 60, shotB, easeInOut));
  const walking = frame > 60 && frame < shotB;
  const dist = (walkX - 560) / (0.85 * STRIDE);
  const wPose = walking ? walkPose(dist, POSES.stand, 0.9) : POSES.stand;
  const poseA = lerpPose(POSES.sitCalm, wPose, stand);
  const tiltUp = seg(frame, 120, 170, easeInOut) * (1 - seg(frame, 215, 250, easeInOut));
  const lookUp = tiltUp;

  const faceA = {...lerpHeroFace(FACE.groggy, FACE.confused, stand), gy: -lookUp * 0.9, gx: 0.3};

  let shot: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';
  if (frame >= shotB) shot = 'B';
  if (frame >= shotC) shot = 'C';
  if (frame >= shotD) shot = 'D';
  if (frame >= shotE) shot = 'E';

  // --- shot B: close-up, crouching at a mammoth footprint and a stone tool
  const kneel = seg(frame, shotB + 10, shotB + 40, easeInOut);
  const grab = seg(frame, shotB + 70, shotB + 100, easeInOut);
  const poseB = lerpPose(lerpPose(POSES.stand, POSES.crouch, kneel), {...POSES.hold, lean: 10}, grab);
  const faceB = lerpHeroFace(FACE.confused, FACE.focus, grab);

  // --- shot D: deadpan close-up (the comedic pause)
  const dp = seg(frame, shotD, shotD + 14, easeOut);

  const cams = {
    A: {x: lerp(960, walkX + 80, 0.8) + 0, y: lerp(640, 120, tiltUp) + 60, zoom: lerp(1.05, 0.9, tiltUp) + 0.05 * (1 - tiltUp), rot: 0},
    B: {x: 880, y: 800, zoom: lerp(1.5, 1.75, seg(frame, shotB, shotC, easeInOut)), rot: 0},
    C: {x: lerp(900, 1250, seg(frame, shotC, shotD, easeInOut)), y: 640, zoom: lerp(1.0, 1.25, seg(frame, shotC, shotD, easeInOut)), rot: 0},
    D: {x: 1060, y: 500, zoom: lerp(3.0, 3.35, dp), rot: 0},
    E: {x: lerp(1080, 1000, seg(frame, shotE, dur, easeInOut)), y: 680, zoom: 1.1, rot: 0},
  }[shot];

  const heroX = shot === 'B' ? 800 : shot === 'C' ? 760 : shot === 'D' || shot === 'E' ? 1000 : walkX;
  const heroFace =
    shot === 'B' ? faceB : shot === 'C' ? {...FACE.focus, gx: 0.8, brow: -0.4} : shot === 'D' ? {...FACE.deadpan, eye: lerp(0.9, 0.55, dp)} : shot === 'E' ? lerpHeroFace(FACE.deadpan, FACE.awkward, seg(frame, shotE + 20, shotE + 50)) : faceA;
  const heroPose =
    shot === 'B' ? poseB : shot === 'C' ? {...POSES.freeze, lean: 2, shrug: 0, aU: 10, aF: 8, bU: -10, bF: -8} : shot === 'D' ? POSES.stand : shot === 'E' ? lerpPose(POSES.stand, POSES.shrug, seg(frame, shotE + 20, shotE + 50, easeOut)) : poseA;

  // dashed "imagined" road for the last gag
  const road = seg(frame, shotE + 30, shotE + 80, easeOut) * (1 - seg(frame, shotE + 130, shotE + 160));

  return (
    <>
      <Svg>
        <Camera cam={cams} frame={frame}>
          <Backdrop frame={frame} tod={tod} seed={5} leaves clearing={shot === 'C' ? [1200, 2300] : undefined} />
          {shot === 'C' || shot === 'D' ? <DistantCave frame={frame} tod={tod} /> : null}
          <HandDrawn frame={frame}>
            <Rock x={300} y={GROUND_Y + 44} s={1.0} seed={12} tone="#4f4c47" />
            <Rock x={1700} y={GROUND_Y + 44} s={1.3} seed={15} tone="#4a4743" />
            {shot === 'B' ? (
              <>
                <Tracks x={980} y={GROUND_Y + 78} kind="mammoth" s={1.1} count={2} />
                <Tracks x={420} y={GROUND_Y + 110} kind="wolf" s={1.2} count={4} rot={-6} />
                <Tracks x={1100} y={GROUND_Y + 30} kind="hoof" s={1.0} count={5} rot={3} opacity={0.8} />
                {grab < 0.5 ? <FlintBlade x={1040} y={GROUND_Y + 48} s={2.2} rot={8} /> : null}
              </>
            ) : null}
            <Hero x={heroX} y={GROUND_Y + 30} scale={shot === 'B' ? 1.0 : 0.85} facing={1} pose={heroPose} face={heroFace} frame={frame} seed={3} idle={shot === 'D' ? 0.2 : 0.7} wind={0.2} headScale={shot === 'D' ? 1.0 : 1} />
            {shot === 'B' && grab >= 0.5 ? <FlintBlade x={heroX + 190} y={GROUND_Y - 110} s={2.0} rot={-34 + Math.sin(frame * 0.1) * 6} /> : null}
            {shot === 'E' ? (
              <g opacity={road} fill="none" stroke="#e8e0cf" strokeWidth={5} strokeDasharray="22 16" strokeLinecap="round">
                <path d={`M ${heroX + 120},${GROUND_Y + 40} L ${heroX + 1200},${GROUND_Y - 40}`} />
                <path d={`M ${heroX + 120},${GROUND_Y + 80} L ${heroX + 1200},${GROUND_Y - 10}`} />
                <path d={`M ${heroX + 560},${GROUND_Y - 130} l 70,70 m 0,-70 l -70,70`} stroke="#d2504b" strokeDasharray="0" strokeWidth={9} />
              </g>
            ) : null}
          </HandDrawn>
          <Parallax depth={1.15}>
            <Fog frame={frame} y={GROUND_Y + 70} opacity={0.3} id="fogF2" color="#d7e2de" seed={3} speed={0.7} h={100} />
          </Parallax>
          {shot === 'D' ? <Leaves frame={frame} count={5} seed={3} area={[200, 300, 1800, 600]} speed={2.2} /> : null}
          <Foreground frame={frame} tod={tod} seed={5} trunks={shot === 'A' ? [-200 + walkX * 0.2, 2200] : [-260, 2160]} />
        </Camera>
        {/* location tag */}
        <g opacity={seg(frame, 40, 70) * (1 - seg(frame, shotB - 20, shotB))}>
          <rect x={72} y={64} width={4} height={74} fill="#e0a43a" />
          <SmallCaps text="WESTERN EUROPE · c. 30,000 YEARS AGO" x={96} y={92} size={22} align="left" color="#e8e0cf" spacing={0.28} />
          <SmallCaps text="LATE ICE AGE · SCENES ARE ARTISTIC RECONSTRUCTIONS" x={96} y={126} size={15} align="left" color="#a9a79f" spacing={0.24} />
        </g>
      </Svg>
      <PaintOverlay />
      <Grade tod={tod} />
      <Vignette amount={shot === 'D' ? 0.95 : 0.5} />
      {shot === 'D' ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 96, color: '#e8e0cf', opacity: clamp((frame - shotD - 30) / 20) * (1 - clamp((frame - (shotE - 10)) / 10))}}>
          {'. '.repeat(Math.min(3, Math.max(0, Math.floor((frame - shotD - 30) / 18))))}
        </div>
      ) : null}
    </>
  );
};

