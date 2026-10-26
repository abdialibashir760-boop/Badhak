import React from 'react';
import {Camera, HandDrawn, Parallax, Vignette} from '../../components/Stage';
import {Svg} from '../../scenes/kit';
import type {SceneProps} from '../../scenes/types';
import {useKeys} from '../i18n';
import {clamp, easeInOut, easeOut, kf, lerp, rng, seg} from '../../lib/anim';
import {lerpPose, walkPose, type Pose} from '../../lib/pose';
import {Backdrop, Foreground, GROUND_Y} from '../art/Backdrop';
import {Fog, Grade, PaintOverlay, SINK, mix} from '../art/Nature';
import {Wolf} from '../art/Animals';
import {Local, LOOKS} from '../figures/Local';
import {FACE, Hero, lerpHeroFace} from '../figures/Hero';
import {POSES} from '../figures/skeleton';
import {HideBag} from '../art/Camp';

const STRIDE = 1.37;

const Bush: React.FC<{x: number; y: number; s?: number; sway?: number; berries?: boolean; seed?: number; tone?: string}> = ({x, y, s = 1, sway = 0, berries = true, seed = 1, tone = '#36512f'}) => {
  const r = rng(seed * 31);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {Array.from({length: 11}, (_, i) => (
        <ellipse key={i} cx={(r() - 0.5) * 150 + sway * (0.4 + r())} cy={-30 - r() * 70} rx={34 + r() * 26} ry={22 + r() * 18} fill={i % 3 ? tone : mix(tone, '#7f9a46', 0.5)} stroke={SINK} strokeWidth={3} />
      ))}
      {berries
        ? Array.from({length: 9}, (_, i) => <circle key={i} cx={(r() - 0.5) * 140 + sway} cy={-20 - r() * 80} r={6.5} fill="#b92f48" stroke={SINK} strokeWidth={2} />)
        : null}
    </g>
  );
};

export const S5Wolf: React.FC<SceneProps> = ({frame, dur, tm}) => {
  const K = useKeys(tm);
  const tod = lerp(0.55, 0.7, frame / dur);
  const tNotice = K.at('notice', 0.05);
  const tWatching = K.at('watching', 0.12);
  const tSudden = K.at('Suddenly', 0.3);
  const tOut = K.at('Out', 0.5);
  const tBack = K.at('back', 0.62);
  const tWolves = K.at('Wolves', 0.78);
  const slow = 0.55; // suspense plays in slow motion
  const sf = frame * slow;

  // wolf: emerges, watches, then leaves
  const appear = seg(frame, tWatching + 40, tWatching + 200, easeInOut);
  const leave = seg(frame, tWolves + 30, tWolves + 160, easeInOut);
  const wolfX = lerp(2150, 1640, appear) + leave * 700;
  const wolfFacing: 1 | -1 = leave > 0.01 ? 1 : -1;
  const wolfWalk = (appear > 0 && appear < 1 ? sf * 0.2 : 0) + (leave > 0 && leave < 1 ? frame * 0.25 : 0);
  const wolfHead = 0.25 * appear * (1 - leave) + 0.2 * Math.sin(frame * 0.03);

  // hero: forages, freezes, tries to look brave, backs away
  const picking = seg(frame, 20, 60) * (1 - seg(frame, tNotice + 10, tNotice + 26));
  const pick = Math.sin(frame * 0.2);
  const freeze = seg(frame, tNotice + 12, tNotice + 40);
  const brave = seg(frame, tOut + 20, tOut + 60, easeOut) * (1 - seg(frame, tBack - 40, tBack - 14));
  const backing = seg(frame, tBack + 4, tBack + 330, easeInOut);
  const heroX = lerp(900, 380, backing);
  const walkingBack = backing > 0 && backing < 0.995;
  const backPose = walkPose(-(900 - heroX) / (0.85 * STRIDE), {...POSES.freeze, lean: -4}, 0.55);
  let pose: Pose = lerpPose(POSES.stand, {...POSES.crouch, aU: 40 + pick * 14, aF: 96 + pick * 18, bU: 20, bF: 80}, picking);
  pose = lerpPose(pose, POSES.freeze, freeze);
  pose = lerpPose(pose, {...POSES.stand, lean: -6, aU: 38, aF: 10, bU: -38, bF: -10, shrug: -8, tilt: -6}, brave);
  if (walkingBack) pose = lerpPose(pose, backPose, seg(frame, tBack + 4, tBack + 30));
  const scared = seg(frame, tNotice + 18, tNotice + 50);
  const face = lerpHeroFace(lerpHeroFace(lerpHeroFace(FACE.calm, FACE.scared, scared), {...FACE.focus, eye: 1, brow: 0.7, smile: 0.2}, brave), FACE.scared, seg(frame, tBack - 6, tBack + 20));
  const faceF = {...face, gx: 0.9, sweat: scared * 0.9};

  // camera: wide -> slow push toward the trees -> hero close -> wolf -> pull back with him
  const pushZ = seg(frame, 0, tWatching + 220, easeInOut);
  const camX = kf(frame, [[0, 1000], [tWatching + 220, 1350], [tSudden, 1100], [tOut - 20, 1150], [tBack, 1000], [tWolves + 40, 1180], [dur, 900]]);
  const camZoom = kf(frame, [[0, 1.0], [tWatching + 220, 1.55], [tSudden, 1.85], [tOut, 1.4], [tBack, 1.2], [tWolves, 1.1], [dur, 1.0]]);
  const camY = lerp(660, 700, pushZ);

  // bushes quiver as something moves behind them
  const rustle = seg(frame, tNotice - 10, tNotice + 10) * (1 - seg(frame, tWatching + 220, tWatching + 260));
  const sway = Math.sin(sf * 0.5) * 16 * rustle;
  const eyes = seg(frame, tNotice + 6, tNotice + 30) * (1 - seg(frame, tWatching + 170, tWatching + 200)) * (0.6 + 0.4 * (Math.sin(frame * 0.05) > -0.9 ? 1 : 0));

  // dropped berries
  const drop = seg(frame, tNotice + 14, tNotice + 30);

  const breath = ((frame * 0.5) % 60) / 60;
  const camp = seg(frame, tBack + 200, tBack + 260);

  return (
    <>
      <Svg>
        <Camera cam={{x: camX, y: camY, zoom: camZoom, rot: 0}} frame={frame} shake={0}>
          <Backdrop frame={sf} tod={tod} seed={13} clearing={[1400, 2300]} giant snow={2} />
          <HandDrawn frame={frame}>
            <Bush x={1010} y={GROUND_Y + 30} s={1.0} sway={sway * 0.4} seed={3} />
            <Bush x={1900} y={GROUND_Y + 26} s={1.3} sway={sway} berries={false} seed={5} tone="#2f4a2b" />
            {/* eyes in the trees */}
            {eyes > 0.02 ? (
              <g opacity={eyes}>
                <ellipse cx={2060} cy={GROUND_Y - 118} rx={11} ry={6} fill="#ffcf4a" />
                <ellipse cx={2092} cy={GROUND_Y - 120} rx={11} ry={6} fill="#ffcf4a" />
                <ellipse cx={2076} cy={GROUND_Y - 118} rx={46} ry={22} fill="#ffcf4a" opacity={0.18} />
              </g>
            ) : null}
            <Wolf x={wolfX} y={GROUND_Y + 22} s={0.72} facing={wolfFacing} walk={wolfWalk} head={wolfHead} frame={frame} eyes={appear * (1 - leave)} breath fur="#78766f" opacity={clamp(appear * 3)} />
            {appear > 0.3 && leave < 0.4
              ? [0, 1, 2].map((i) => {
                  const t = (breath + i / 3) % 1;
                  return <ellipse key={i} cx={wolfX - 70 * (wolfFacing === -1 ? 1 : -1) - t * 40 * (wolfFacing === -1 ? 1 : -1)} cy={GROUND_Y - 62 - t * 26} rx={8 + t * 16} ry={6 + t * 10} fill="#e8f0f2" opacity={(1 - t) * 0.4} />;
                })
              : null}
            <Local x={170} y={GROUND_Y + 30} scale={0.86} facing={1} look={LOOKS.elder} pose={{...POSES.stand, aU: 128 * camp, aF: 150 * camp, bU: -4, bF: 0}} face={FACE.focus} frame={frame} seed={31} held={[{kind: 'stick', hand: 'B'}]} opacity={camp} />
            <Local x={60} y={GROUND_Y + 34} scale={0.86} facing={1} look={LOOKS.hunter} pose={{...POSES.hold, aU: 10, aF: 5, bU: -8, bF: -6}} face={FACE.focus} frame={frame} seed={32} held={[{kind: 'spear', hand: 'B', rot: -84}]} opacity={camp} />
            <Hero x={heroX} y={GROUND_Y + 30} scale={0.85} pose={pose} face={faceF} frame={frame} seed={3} idle={0.7} wind={0.15} />
            {frame < tNotice + 30 ? <HideBag x={heroX + 150} y={GROUND_Y + 14} s={0.7} /> : null}
            {frame >= tNotice + 14 ? (
              <g>
                {Array.from({length: 7}, (_, i) => {
                  const t = clamp((frame - tNotice - 14) / 40);
                  return <circle key={i} cx={heroX + 120 + i * 18 + t * (i * 8)} cy={GROUND_Y + 36 - Math.abs(Math.sin(t * 5 + i)) * 26 * (1 - t) * drop} r={7} fill="#b92f48" stroke={SINK} strokeWidth={2} />;
                })}
              </g>
            ) : null}
          </HandDrawn>
          <Parallax depth={0.95}>
            <Fog frame={sf} y={GROUND_Y + 40} opacity={0.34} id="fogW1" color="#d8dfd2" seed={4} speed={0.6} h={90} />
          </Parallax>
          <Parallax depth={1.2}>
            <Bush x={-60} y={GROUND_Y + 150} s={2.4} sway={sway * 0.6} berries={false} seed={8} tone="#1d3020" />
            <Bush x={2050} y={GROUND_Y + 170} s={2.6} sway={sway} berries={false} seed={9} tone="#1b2d1e" />
          </Parallax>
          <Foreground frame={sf} tod={tod} seed={13} trunks={[-300, 2350]} />
        </Camera>
      </Svg>
      <PaintOverlay />
      <Grade tod={tod} />
      <Vignette amount={0.55 + 0.35 * freeze * (1 - seg(frame, tBack, tBack + 120))} tint="#050402" />
    </>
  );
};
