import React from 'react';
import {Camera, HandDrawn, Parallax, Particles, Vignette} from '../../components/Stage';
import {Svg} from '../../scenes/kit';
import type {SceneProps} from '../../scenes/types';
import {useKeys, useText} from '../i18n';
import {easeInOut, easeOut, easeOutBack, lerp, seg} from '../../lib/anim';
import {lerpPose, type Pose} from '../../lib/pose';
import {Backdrop, Foreground, GROUND_Y} from '../art/Backdrop';
import {CampBack, CampFire, Log} from '../art/CampSet';
import {Grade, PaintOverlay} from '../art/Nature';
import {FlintBlade} from '../art/Camp';
import {Sketch} from '../art/Glyphs';
import {Berries, GrindStone, HollowStump, Spit} from '../art/FoodProps';
import {FACE, Hero, lerpHeroFace} from '../figures/Hero';
import {Local, LOOKS} from '../figures/Local';
import {POSES} from '../figures/skeleton';

const FX = 1330;

export const S4Food: React.FC<SceneProps> = ({frame, dur, tm}) => {
  const K = useKeys(tm);
  const TX = useText();
  const tod = lerp(0.4, 0.5, frame / dur);
  const tStomach = K.at('stomach', 0.1);
  const tShops = K.at('shops', 0.22);
  const tSnacks = K.at('snacks', 0.27);
  const tApps = K.at('apps', 0.31);
  const tKnow = K.at('Finding', 0.4);
  const tArch = K.at('Archaeologists', 0.6);
  const tNever = K.at('never', 0.82, 1);
  const tFridge = K.at('fridge', 0.9);
  const tBerry = Math.min(dur - 150, tFridge + 70);

  const osc = Math.sin(frame * 0.3);
  const rub = Math.sin(frame * 0.28);
  // --- hero
  const belly = seg(frame, tStomach - 6, tStomach + 12) * (1 - seg(frame, tShops - 20, tShops - 4));
  const sad = seg(frame, tShops, tApps + 20);
  const heroX = frame < tNever - 40 ? 640 : 520;
  const fridgeMime = seg(frame, tNever - 20, tNever + 6) * (1 - seg(frame, tFridge + 50, tFridge + 80));
  const door = seg(frame, tFridge - 8, tFridge + 22, easeOutBack);
  const bellyPose: Pose = {...POSES.hold, aU: 70, aF: 118, bU: 52, bF: 108, lean: 18, headDrop: 12, tilt: 6};
  let heroPose: Pose = lerpPose(POSES.stand, bellyPose, belly);
  heroPose = lerpPose(heroPose, {...POSES.shrug, headDrop: 10, lean: 6}, sad * (1 - fridgeMime));
  const handleReach: Pose = {...POSES.point, aU: 76 + Math.sin(frame * 0.3) * 2, aF: 92, lean: 8};
  heroPose = lerpPose(heroPose, handleReach, fridgeMime * (1 - seg(frame, tFridge, tFridge + 6)));
  heroPose = lerpPose(heroPose, {...POSES.shrug, aU: 48, aF: 100, bU: -48, bF: -100, headDrop: 12}, fridgeMime * seg(frame, tFridge + 8, tFridge + 30));
  const eat = seg(frame, tBerry + 40, tBerry + 60) * (1 - seg(frame, tBerry + 90, tBerry + 100));
  heroPose = lerpPose(heroPose, {...POSES.hold, aU: lerp(40, 88, eat), aF: lerp(95, 170, eat), bU: 30, bF: 90}, eat);
  let heroFace = lerpHeroFace(lerpHeroFace(FACE.confused, FACE.hungry, belly), FACE.deadpan, sad);
  heroFace = lerpHeroFace(heroFace, FACE.focus, fridgeMime * (1 - seg(frame, tFridge, tFridge + 4)));
  heroFace = lerpHeroFace(heroFace, {...FACE.scared, open: 0.2, smile: -0.8}, seg(frame, tFridge + 10, tFridge + 30) * (1 - seg(frame, tBerry, tBerry + 20)));
  heroFace = lerpHeroFace(heroFace, {...FACE.awkward, brow: -1, smile: -0.9, open: 0.5, sweat: 1} as typeof FACE.awkward, seg(frame, tBerry + 64, tBerry + 76) * (1 - seg(frame, tBerry + 100, tBerry + 120)));
  heroFace = lerpHeroFace(heroFace, FACE.smile, seg(frame, tBerry + 112, tBerry + 140));

  // --- locals at work
  const L = LOOKS;
  const forager: Pose = {...POSES.work, aU: 60 + rub * 14, aF: 100 + rub * 16, bU: 40, bF: 94, lean: 30};
  const slice = Math.sin(frame * 0.45);
  const woman: Pose = {...POSES.work, aU: 70 + slice * 18, aF: 110 + slice * 22, bU: 30, bF: 90, lean: 26};
  const hunter: Pose = {...POSES.hold, aU: 66, aF: 100, bU: 50, bF: 96, lean: 6};
  const elder: Pose = {...POSES.sitCalm, bU: 10, bF: 8, lean: 4};
  const childGive = seg(frame, tBerry - 10, tBerry + 24, easeInOut);
  const childX = lerp(1500, 700, childGive);
  const child: Pose = lerpPose({...POSES.work, lean: 24}, {...POSES.point, aU: 70, aF: 80}, childGive);

  // --- imagination sketches over the hero's head
  const pop = (a: number) => seg(frame, a, a + 12, easeOutBack) * (1 - seg(frame, a + 62, a + 76));
  const cross = (a: number) => seg(frame, a + 26, a + 34, easeOut);

  // --- camera cuts
  const camList: Array<[number, {x: number; y: number; zoom: number}]> = [
    [0, {x: lerp(820, 1000, seg(frame, 0, tStomach, easeInOut)), y: 640, zoom: lerp(1.05, 1.3, seg(frame, 0, tStomach, easeInOut))}],
    [tStomach + 4, {x: 700, y: 760, zoom: 1.9}],
    [tShops - 24, {x: 700, y: 560, zoom: lerp(1.7, 1.95, seg(frame, tShops - 24, tKnow, easeInOut))}],
    [tKnow - 4, {x: 1080, y: 760, zoom: 2.3}], // grinding
    [tKnow + 100, {x: 1230, y: 740, zoom: 2.3}], // slicing
    [tArch - 14, {x: FX, y: 640, zoom: 1.9}], // spit
    [tArch + 90, {x: 1500, y: 720, zoom: 2.1}], // gathered plants
    [tNever - 70, {x: lerp(760, 640, seg(frame, tNever - 70, tFridge, easeInOut)), y: 660, zoom: lerp(1.3, 1.7, seg(frame, tNever - 70, tFridge, easeInOut))}],
    [tFridge + 40, {x: 640, y: 660, zoom: 1.6}],
    [tBerry - 20, {x: 620, y: 640, zoom: lerp(1.5, 1.9, seg(frame, tBerry - 20, dur, easeInOut))}],
  ];
  let cam = camList[0][1];
  for (const [t, c] of camList) if (frame >= t) cam = c;

  const growl = seg(frame, tStomach, tStomach + 8) * (1 - seg(frame, tStomach + 70, tStomach + 90));

  return (
    <>
      <Svg>
        <Camera cam={{...cam, rot: 0}} frame={frame} shake={growl * 2.5}>
          <Backdrop frame={frame} tod={tod} seed={9} clearing={[1000, 2300]} giant={false} snow={3} />
          <HandDrawn frame={frame}>
            <CampBack frame={frame} tod={tod} glow={0.4} rack />
            <HollowStump x={420} y={GROUND_Y + 40} s={1.15} open={door * (1 - seg(frame, tFridge + 60, tFridge + 80))} beetle={seg(frame, tFridge + 24, tFridge + 70)} frame={frame} />
            <Log x={1190} y={GROUND_Y + 56} w={140} />
            <GrindStone x={1070} y={GROUND_Y + 50} s={1.0} rub={rub} />
            <Spit x={FX} y={GROUND_Y + 28} s={0.78} turn={(frame * 2.2) % 360} />
            <CampFire frame={frame} intensity={0.8} s={0.72} />
            {frame > tKnow + 90 && frame < tKnow + 200 ? <FlintBlade x={1275} y={GROUND_Y - 58} s={0.9} rot={-12 + slice * 10} /> : null}

            <Local x={1030} y={GROUND_Y + 36} scale={0.82} facing={1} look={L.forager} pose={forager} face={{...FACE.focus, gx: 0.5}} frame={frame} seed={21} />
            <Local x={1230} y={GROUND_Y + 34} scale={0.82} facing={1} look={L.woman} pose={woman} face={{...FACE.focus, gx: 0.5}} frame={frame} seed={22} />
            <Local x={1480} y={GROUND_Y + 30} scale={0.86} facing={-1} look={L.hunter} pose={hunter} face={{...FACE.focus, gx: -0.4}} frame={frame} seed={23} held={[{kind: 'meat', hand: 'A'}]} />
            <Local x={1700} y={GROUND_Y + 34} scale={0.84} facing={-1} look={L.elder} pose={elder} face={FACE.calm} frame={frame} seed={24} held={[{kind: 'stick', hand: 'B'}]} />
            <Local x={childX} y={GROUND_Y + 30} scale={0.62} facing={childGive > 0.5 ? -1 : -1} look={L.child} pose={child} face={childGive > 0.5 ? FACE.smile : FACE.focus} frame={frame} seed={25} headScale={1.15} />
            {frame < tBerry + 60 ? <Berries x={childX - 24} y={GROUND_Y - 64 + (1 - childGive) * 70} s={1.2} /> : null}
            <Hero x={heroX} y={GROUND_Y + 30} scale={0.85} pose={heroPose} face={heroFace} frame={frame} seed={3} idle={0.8} wind={0.2} />
            {/* the imagined fridge (dashed) around the hollow stump */}
            {fridgeMime > 0.1 ? (
              <g opacity={fridgeMime * (1 - seg(frame, tFridge + 56, tFridge + 78))}>
                <Sketch kind="fridge" x={420} y={GROUND_Y - 140} s={1.5} opacity={0.9} />
                <g transform={`translate(${420 - 88},${GROUND_Y - 250}) scale(${Math.cos((door * 100 * Math.PI) / 180)},1)`}>
                  <rect x={0} y={0} width={176} height={330} fill="#f2ead8" opacity={0.08} stroke="#f2ead8" strokeWidth={4} strokeDasharray="14 9" />
                </g>
              </g>
            ) : null}
            {/* three things he wishes for, crossed out */}
            {[
              ['shop', tShops, 560],
              ['bag', tSnacks, 700],
              ['phone', tApps, 840],
            ].map(([k, t, x]) => (
              <g key={k as string} opacity={pop(t as number)} transform={`translate(${(x as number) + 0},${GROUND_Y - 560})`}>
                <Sketch kind={k as 'shop' | 'bag' | 'phone'} x={0} y={0} s={1.05} frame={frame} />
                <path d="M -70,-70 L 70,70 M 70,-70 L -70,70" stroke="#d2504b" strokeWidth={10} strokeLinecap="round" strokeDasharray="200" strokeDashoffset={200 * (1 - cross(t as number))} />
              </g>
            ))}
          </HandDrawn>
          {growl > 0.2 ? (
            <text x={heroX + 20} y={GROUND_Y - 190} textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontWeight={700} fontStyle="italic" fontSize={74} fill="#e0a43a" stroke="#0d0907" strokeWidth={5} paintOrder="stroke" opacity={growl} transform={`rotate(${-5 + osc * 2.5} ${heroX} ${GROUND_Y - 190}) translate(${osc * 3},0)`}>
              {TX.growl}
            </text>
          ) : null}
          <Parallax depth={1.1}>
            <Particles frame={frame} count={16} opacity={0.3} area={[-200, 200, 3200, 700]} />
          </Parallax>
          <Foreground frame={frame} tod={tod} seed={9} trunks={[-300, 2300]} />
        </Camera>
      </Svg>
      <PaintOverlay />
      <Grade tod={tod} />
      <Vignette amount={0.5} />
    </>
  );
};
