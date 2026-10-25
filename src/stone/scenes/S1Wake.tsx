import React from 'react';
import {Camera, HandDrawn, Parallax, Vignette} from '../../components/Stage';
import {KineticText} from '../../components/Overlays';
import {Svg} from '../../scenes/kit';
import type {SceneProps} from '../../scenes/types';
import {clamp, easeInOut, easeOut, kf, lerp, seg} from '../../lib/anim';
import {lerpPose} from '../../lib/pose';
import {Backdrop, Foreground, GROUND_Y} from '../art/Backdrop';
import {Fog, PaintOverlay, Grade, Rock} from '../art/Nature';
import {FACE, Hero, HeroArt, lerpHeroFace} from '../figures/Hero';
import {POSES} from '../figures/skeleton';

const HX = 900;

export const S1Wake: React.FC<SceneProps> = ({frame, dur, tm}) => {
  const tod = lerp(0.0, 0.1, frame / dur);
  const tHouses = tm.at('houses', 0.28);
  const tPhones = tm.at('phones', 0.36);
  const tElec = tm.at('electricity', 0.42);
  const tTrees = tm.at('trees', 0.55);
  const tBig = tm.at('biggest', 0.7);
  const tArt = tTrees - 6;

  // waking: lying -> sitting up -> groggy look around -> frantic pat-down -> look up
  const open = seg(frame, 40, 70);
  const sit = seg(frame, 80, 150, easeInOut);
  const pose = lerpPose(POSES.lying, POSES.sitCalm, sit);
  const patting = seg(frame, tPhones - 4, tPhones + 6) * (1 - seg(frame, tPhones + 40, tPhones + 52));
  const pat = Math.sin(frame * 0.9) * 10 * patting;
  const look = kf(frame, [[150, 0], [185, -1], [225, 1], [tHouses + 40, -1], [tPhones - 10, 0], [tElec + 4, 0.2]]);
  const up = seg(frame, tElec - 2, tElec + 14) * (1 - seg(frame, tElec + 50, tElec + 64));
  const rigPose = {...pose, aU: pose.aU + pat * 2, aF: pose.aF + pat, tilt: pose.tilt + look * 6 - up * 10};
  const face = {...lerpHeroFace(lerpHeroFace(FACE.asleep, FACE.groggy, open), FACE.confused, seg(frame, 150, 200)), gx: look, gy: -up * 0.9 + (1 - sit) * 0.3};

  const cutArt = frame >= tArt;
  const artK = seg(frame, tArt, tArt + 18, easeOut);

  // camera: low and tight at first, then pushes toward the character
  const push = seg(frame, 0, tArt, easeInOut);
  const cam = cutArt
    ? {x: 960, y: 700, zoom: lerp(1.25, 1.5, seg(frame, tArt, dur, easeInOut)), rot: 0}
    : {x: lerp(1000, 960, push), y: lerp(780, 690, push), zoom: lerp(1.35, 1.8, push), rot: lerp(-1.2, 0, push)};

  const titleIn = tBig + 10;
  const shake = 6 * Math.exp(-(frame - tArt) / 5) * (cutArt ? 1 : 0);

  return (
    <>
      <Svg>
        <Camera cam={cam} frame={frame} shake={shake}>
          <Backdrop frame={frame} tod={tod} seed={2} leaves />
          <HandDrawn frame={frame}>
            <Rock x={560} y={GROUND_Y + 40} s={0.9} seed={4} tone="#4d4a46" />
            <Rock x={1380} y={GROUND_Y + 36} s={1.2} seed={9} tone="#46433f" />
            {cutArt ? (
              <HeroArt x={HX + 40} y={GROUND_Y + 36} scale={lerp(1.15, 1.35, artK)} rotate={Math.sin(frame * 0.06) * 0.6} />
            ) : (
              <Hero x={HX} y={GROUND_Y + 30} scale={0.9} pose={rigPose} face={face} frame={frame} seed={3} idle={0.6} headFlip={look < -0.3} cloakLen={170} wind={0.1} />
            )}
          </HandDrawn>
          <Parallax depth={1.15}>
            <Fog frame={frame} y={GROUND_Y + 60} opacity={0.4} id="fogF1" color="#d7e2de" seed={7} speed={0.8} h={110} />
          </Parallax>
          <Foreground frame={frame} tod={tod} seed={2} />
        </Camera>
      </Svg>
      <PaintOverlay />
      <Grade tod={tod} />
      <Vignette amount={0.5} />
      {frame > titleIn - 4 ? <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0) 42%)', opacity: seg(frame, titleIn - 4, titleIn + 20)}} /> : null}
      <KineticText
        frame={frame}
        y={170}
        size={108}
        tracking={0.07}
        gap={0.24}
        maxWidth={1700}
        opacity={1 - clamp((frame - (dur - 22)) / 20)}
        words={[
          {text: 'WHAT', at: titleIn},
          {text: 'IF', at: titleIn + 6},
          {text: 'YOU', at: titleIn + 12},
          {text: 'WOKE', at: titleIn + 18},
          {text: 'UP', at: titleIn + 24},
          {text: 'IN', at: titleIn + 32},
          {text: 'THE', at: titleIn + 38},
          {text: 'STONE', at: titleIn + 46, color: '#e0a43a', italic: true},
          {text: 'AGE?', at: titleIn + 52, color: '#e0a43a', italic: true},
        ]}
      />
    </>
  );
};
