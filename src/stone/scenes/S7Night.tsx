import React from 'react';
import {Camera, HandDrawn, Particles, Vignette} from '../../components/Stage';
import {Svg} from '../../scenes/kit';
import type {SceneProps} from '../../scenes/types';
import {useKeys, useText} from '../i18n';
import {clamp, easeInOut, easeOut, kf, lerp, seg} from '../../lib/anim';
import {lerpPose, walkPose, type Pose} from '../../lib/pose';
import {GROUND_Y} from '../art/Backdrop';
import {CaveWall, Fire, flicker} from '../art/Camp';
import {Log} from '../art/CampSet';
import {Mammoth} from '../art/Animals';
import {SkyBox, SINK, PaintOverlay, mix} from '../art/Nature';
import {FACE, Hero, lerpHeroFace} from '../figures/Hero';
import {Local, LOOKS} from '../figures/Local';
import {POSES} from '../figures/skeleton';

const STRIDE = 1.37;
const FIRE_X = 700;
const ARCH = `M 1230,${GROUND_Y + 70} L 1230,470 C 1230,230 1420,130 1560,130 C 1720,130 1880,240 1880,470 L 1880,${GROUND_Y + 70} Z`;
const WALL_CLIP = `M -400,-200 H 2400 V 1300 H -400 Z ${ARCH}`;

export const S7Night: React.FC<SceneProps> = ({frame, dur, tm}) => {
  const K = useKeys(tm);
  const TX = useText();
  const tod = lerp(0.84, 1.0, seg(frame, 0, 300));
  const tFlute = K.at('flute', 0.28);
  const tTomorrow = K.at('tomorrow', 0.58);
  const tHot = K.at('hotline', 0.88);
  const f = flicker(frame);
  const L = LOOKS;

  // hero stands and walks to the cave mouth
  const rise = seg(frame, tTomorrow - 20, tTomorrow + 30, easeInOut);
  const walkT = seg(frame, tTomorrow + 30, tTomorrow + 260, easeInOut);
  const hx = lerp(900, 1520, walkT);
  const walking = walkT > 0 && walkT < 0.995;
  const dist = (hx - 900) / (0.85 * STRIDE);
  const stood: Pose = walking ? walkPose(dist, POSES.stand, 0.6) : POSES.stand;
  const pose = lerpPose(POSES.sitCalm, stood, rise);
  const lookUp = seg(frame, tTomorrow + 300, tTomorrow + 340, easeInOut);
  const glanceBack = seg(frame, tHot - 12, tHot + 6) * (1 - seg(frame, tHot + 50, tHot + 66));
  const face = {...lerpHeroFace(lerpHeroFace(FACE.calm, FACE.focus, rise), FACE.calm, lookUp), gy: -lookUp * 0.8, gx: lerp(0.3, -0.9, glanceBack)};

  // camera: wide, drift to the flute, wide again, then follows the hero out
  const cam = {
    x: kf(frame, [[0, 900], [tFlute - 30, 960], [tFlute + 10, 520], [tFlute + 190, 540], [tFlute + 260, 960], [tTomorrow + 30, 1000], [tTomorrow + 270, 1380], [dur, 1480]]),
    y: kf(frame, [[0, 640], [tFlute, 700], [tFlute + 200, 700], [tTomorrow + 30, 640], [dur, 600]]),
    zoom: kf(frame, [[0, 1.08], [tFlute - 30, 1.15], [tFlute + 10, 1.85], [tFlute + 190, 1.85], [tFlute + 260, 1.1], [tTomorrow + 30, 1.1], [dur, 1.35]]),
  };

  const sleepy = (a: number) => ({...FACE.calm, eye: a});
  const noteBob = Math.sin(frame * 0.18);
  const flutePose: Pose = {...POSES.sitCalm, aU: 70, aF: 40 + noteBob * 3, bU: 80, bF: 44 - noteBob * 3};
  const night = clamp((tod - 0.82) / 0.16);

  const shadowOf = (x: number, s: number, key: string, node: (x: number, y: number, s: number, facing: 1 | -1) => React.ReactNode, facing: 1 | -1) => (
    <g key={key} opacity={0.4 * (0.8 + 0.2 * f)} style={{filter: 'brightness(0) blur(3px)'}}>
      {node(FIRE_X + (x - FIRE_X) * 1.9 - 200, GROUND_Y - 120, s * 1.9, facing)}
    </g>
  );
  const hero = (x: number, y: number, s: number, facing: 1 | -1) => (
    <Hero x={x} y={y} scale={s} facing={facing} pose={pose} face={face} frame={frame} seed={3} idle={0.6} wind={0.1} shadow={false} />
  );
  const elder = (x: number, y: number, s: number, facing: 1 | -1) => (
    <Local x={x} y={y} scale={s} facing={facing} look={L.elder} pose={flutePose} face={{...sleepy(0.6)}} frame={frame} seed={61} held={[{kind: 'flute', hand: 'A'}]} shadow={false} />
  );
  const hunter = (x: number, y: number, s: number, facing: 1 | -1) => (
    <Local x={x} y={y} scale={s} facing={facing} look={L.hunter} pose={{...POSES.sitCalm, aU: 50, aF: 95}} face={sleepy(0.55)} frame={frame} seed={62} shadow={false} />
  );

  return (
    <>
      <Svg>
        <Camera cam={{...cam, rot: 0}} frame={frame}>
          {/* the night outside the cave mouth */}
          <SkyBox tod={tod} frame={frame} id="nightsky" horizonY={760} x0={900} x1={2400} sunX={1500} />
          <path d={`M 1100,${GROUND_Y} Q 1250,640 1400,720 T 1700,690 T 2100,740 L 2100,${GROUND_Y + 200} L 1100,${GROUND_Y + 200} Z`} fill={mix('#1b2630', '#04060b', night)} />
          <path d={`M 1100,${GROUND_Y + 10} Q 1400,730 1650,770 T 2100,${GROUND_Y} L 2100,${GROUND_Y + 200} L 1100,${GROUND_Y + 200} Z`} fill={mix('#101a20', '#02030a', night)} />
          <Mammoth x={1750} y={GROUND_Y - 6} s={0.3} walk={frame * 0.03} color="#06080c" rim="#10161e" frame={frame} opacity={night * 0.9} />
          <g opacity={night}>
            <circle cx={1980} cy={GROUND_Y - 38} r={3} fill="#ffb25a" />
            <circle cx={1980} cy={GROUND_Y - 38} r={22} fill="#ff8a3a" opacity={0.22} />
          </g>
          {/* the shelter wall, lit by the fire, with an opening onto the night */}
          <defs>
            <clipPath id="wall-clip">
              <path d={WALL_CLIP} clipRule="evenodd" />
            </clipPath>
          </defs>
          <g clipPath="url(#wall-clip)">
            <CaveWall frame={frame} fireX={FIRE_X} fireY={GROUND_Y} x0={-400} x1={2400} y0={-200} y1={GROUND_Y + 80} />
          </g>
          <path d={ARCH} fill="none" stroke={SINK} strokeWidth={6} />
          {/* floor */}
          <rect x={-400} y={GROUND_Y + 60} width={2900} height={500} fill="#1a1410" stroke={SINK} strokeWidth={4} />
          <ellipse cx={FIRE_X} cy={GROUND_Y + 80} rx={620 * f} ry={90} fill="#c4651f" opacity={0.18} />
          {/* giant shadows on the wall */}
          {shadowOf(520, 0.84, 's-elder', elder, 1)}
          {shadowOf(1120, 0.84, 's-hunter', hunter, -1)}
          {rise < 0.3 ? shadowOf(880, 0.85, 's-hero', hero, -1) : null}
          <HandDrawn frame={frame}>
            <Log x={520} y={GROUND_Y + 66} w={150} />
            <Log x={1000} y={GROUND_Y + 66} w={260} />
            <Fire x={FIRE_X} y={GROUND_Y + 40} s={0.95} frame={frame} intensity={0.95} id="nightfire" />
            <Local x={150} y={GROUND_Y + 70} scale={0.62} facing={1} look={L.child} pose={{...POSES.lying, lean: 82}} face={{...FACE.asleep}} frame={frame} seed={63} headScale={1.15} />
            <Local x={340} y={GROUND_Y + 58} scale={0.82} facing={1} look={L.woman} pose={{...POSES.sitCalm, aU: 20, aF: 80}} face={sleepy(0.5)} frame={frame} seed={64} />
            {elder(520, GROUND_Y + 54, 0.84, 1)}
            {hunter(1120, GROUND_Y + 54, 0.84, -1)}
            {hero(hx, GROUND_Y + lerp(54, 66, rise), 0.85, 1)}
          </HandDrawn>
          <Particles frame={frame} count={18} opacity={0.5} speed={0.7} color="#ffc27a" area={[300, 300, 1200, 600]} />
          {/* flute notes drifting up */}
          {frame > tFlute - 10 && frame < tFlute + 300
            ? Array.from({length: 5}, (_, i) => {
                const t = (((frame - tFlute) * 0.7 + i * 40) % 200) / 200;
                return <text key={i} x={560 + Math.sin(t * 5 + i) * 30 + t * 60} y={GROUND_Y - 300 - t * 200} fontSize={34} fill="#f4dca8" opacity={(1 - t) * 0.8} fontFamily="'Cormorant Garamond', serif">{i % 2 ? '♪' : '♫'}</text>;
              })
            : null}
        </Camera>
      </Svg>
      <PaintOverlay />
      <Vignette amount={0.75} tint="#020208" />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 96,
          textAlign: 'center',
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600,
          fontSize: 84,
          letterSpacing: '0.08em',
          color: '#f2ead8',
          opacity: seg(frame, dur - 150, dur - 96, easeOut) * (1 - seg(frame, dur - 18, dur - 2)),
          textShadow: '0 4px 30px #000',
        }}
      >
        {TX.ending[0]}
        <br />
        <span style={{color: '#e0a43a', fontStyle: 'italic'}}>{TX.ending[1]}</span>
      </div>
    </>
  );
};
