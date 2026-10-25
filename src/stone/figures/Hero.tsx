import React from 'react';
import {staticFile} from 'remotion';
import {clamp} from '../../lib/anim';
import type {Pose} from '../../lib/pose';
import {HERO_DIMS, POSES, pt, solveSkeleton} from './skeleton';

/** Head sprite geometry (public/stone/head.png, cut from the supplied character art). */
const HEAD = {w: 124, h: 113, cx: 83, cy: 71, eyeL: [71, 56], eyeR: [108, 53], mouth: [90, 85]} as const;
export const INK = '#0b0908';
const LIMB = 8.5;

/** Facial expression drawn as vector overlay on the (feature-free) head from the artwork. */
export type HeroFace = {
  eye: number; // 0 closed .. 1 open
  brow: number; // -1 worried .. 1 angry
  smile: number; // -1 frown .. 1 smile
  open: number; // 0 closed mouth .. 1 wide open
  gx: number; // gaze -1..1
  gy: number;
  sweat?: number;
  blush?: number;
};

export const FACE = {
  neutral: {eye: 1, brow: 0, smile: 0, open: 0, gx: 0, gy: 0},
  scared: {eye: 1, brow: -1, smile: -0.5, open: 0.6, gx: 0.2, gy: 0},
  asleep: {eye: 0.02, brow: 0, smile: 0.1, open: 0, gx: 0, gy: 0},
  groggy: {eye: 0.45, brow: -0.2, smile: -0.2, open: 0.15, gx: 0, gy: 0.3},
  confused: {eye: 1, brow: -0.6, smile: -0.25, open: 0.25, gx: 0, gy: 0},
  deadpan: {eye: 0.6, brow: 0.15, smile: -0.1, open: 0, gx: 0, gy: 0},
  awkward: {eye: 1, brow: -0.7, smile: 0.7, open: 0.2, gx: 0, gy: 0},
  smile: {eye: 0.85, brow: -0.1, smile: 0.9, open: 0.1, gx: 0, gy: 0},
  shout: {eye: 1, brow: -0.5, smile: -0.1, open: 1, gx: 0, gy: 0},
  hungry: {eye: 0.75, brow: -0.5, smile: -0.6, open: 0.1, gx: 0, gy: 0},
  focus: {eye: 0.7, brow: 0.5, smile: -0.1, open: 0, gx: 0.3, gy: 0.2},
  calm: {eye: 0.8, brow: -0.1, smile: 0.35, open: 0, gx: 0.2, gy: 0},
} satisfies Record<string, HeroFace>;

export const lerpHeroFace = (a: HeroFace, b: HeroFace, t: number): HeroFace => ({
  eye: a.eye + (b.eye - a.eye) * t,
  brow: a.brow + (b.brow - a.brow) * t,
  smile: a.smile + (b.smile - a.smile) * t,
  open: a.open + (b.open - a.open) * t,
  gx: a.gx + (b.gx - a.gx) * t,
  gy: a.gy + (b.gy - a.gy) * t,
  sweat: (a.sweat ?? 0) + ((b.sweat ?? 0) - (a.sweat ?? 0)) * t,
  blush: (a.blush ?? 0) + ((b.blush ?? 0) - (a.blush ?? 0)) * t,
});

const blinkOf = (frame: number, seed: number) => {
  const f = (frame + seed * 37) % 110;
  return f > 100 && f < 106 ? Math.sin(((f - 100) / 6) * Math.PI) : 0;
};

export const HeroFaceOverlay: React.FC<{face: HeroFace; frame: number; seed?: number}> = ({face, frame, seed = 1}) => {
  const eye = Math.max(0.04, face.eye * (1 - blinkOf(frame, seed)));
  const gx = face.gx * 4;
  const gy = face.gy * 3;
  const [lx, ly] = HEAD.eyeL;
  const [rx, ry] = HEAD.eyeR;
  const [mx, my] = HEAD.mouth;
  const browY = (y: number) => y - 11 - face.brow * 0;
  const bl = face.brow;
  // worried brows: inner ends (toward face centre) rise
  const lbrow = `M ${lx - 8} ${browY(ly) + bl * 3 * -1 + 0} L ${lx + 7} ${browY(ly) + bl * 5}`;
  const rbrow = `M ${rx - 7} ${browY(ry) + bl * 5} L ${rx + 6} ${browY(ry) + bl * 3 * -1}`;
  const curve = face.smile * 9;
  const o = face.open * 11;
  // open mouth: a slanted gasp (like the original art) when unhappy, a round-bottomed grin when happy
  const mouth =
    o > 2
      ? face.smile < 0.25
        ? `M ${mx - 11} ${my - 2} L ${mx + 11} ${my - 7} Q ${mx + 12} ${my + o * 0.9} ${mx + 2} ${my + o * 1.05} Q ${mx - 9} ${my + o * 1.0} ${mx - 11} ${my - 2} Z`
        : `M ${mx - 11} ${my - 2 + curve * 0.2} Q ${mx} ${my - 5 + curve * 0.4} ${mx + 11} ${my - 3} Q ${mx + 4} ${my + o * 1.5} ${mx - 11} ${my - 2 + curve * 0.2} Z`
      : `M ${mx - 11} ${my} Q ${mx} ${my + curve * 1.4} ${mx + 11} ${my - 1}`;
  return (
    <g>
      {[
        [lx, ly],
        [rx, ry],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x + gx} cy={y + gy} rx={3.7} ry={5.4 * eye} fill={INK} transform={`rotate(${i === 0 ? -8 : 6} ${x} ${y})`} />
      ))}
      <path d={lbrow} stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.85} />
      <path d={rbrow} stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.85} />
      <path d={mouth} stroke={INK} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill={o > 2 ? INK : 'none'} />
      {(face.blush ?? 0) > 0.05 ? <ellipse cx={mx + 6} cy={my - 12} rx={11} ry={5} fill="#e0707a" opacity={0.35 * (face.blush ?? 0)} /> : null}
      {(face.sweat ?? 0) > 0.05 ? (
        <path
          d={`M ${HEAD.w - 14} ${22 + (1 - face.sweat!) * -6 + Math.sin(frame * 0.15) * 2} q 6 10 0 16 q -6 -6 0 -16 z`}
          fill="#9fd4ee"
          stroke={INK}
          strokeWidth={1.5}
          opacity={clamp(face.sweat!)}
        />
      ) : null}
    </g>
  );
};

export const CLOAK = {light: '#6f5650', mid: '#473a36', dark: '#2a2321', rim: '#8a6a5c'};

export type HeroProps = {
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  pose?: Pose;
  face?: HeroFace;
  headScale?: number;
  frame: number;
  seed?: number;
  idle?: number;
  tremble?: number;
  breath?: number;
  opacity?: number;
  /** Cloak length along the torso (source px). */
  cloakLen?: number;
  /** Cloak billow (0..1). */
  wind?: number;
  /** Turn the head to look back over the other shoulder. */
  headFlip?: boolean;
  shadow?: boolean;
};

const hand = (p: {x: number; y: number}, a: number) => {
  // three splayed fingers continuing the forearm direction (as in the supplied art's raised hands)
  const r = (Math.PI / 180) * (90 - a);
  return [-34, 0, 34].map((o, i) => {
    const th = r + (o * Math.PI) / 180;
    return `M ${p.x.toFixed(1)},${p.y.toFixed(1)} l ${(Math.cos(th) * (i === 1 ? 17 : 14)).toFixed(1)},${(-Math.sin(th) * (i === 1 ? 17 : 14)).toFixed(1)}`;
  });
};

/**
 * The supplied character, rigged: original head + beanie artwork, black stick body in the artwork's line
 * weight, a hand-drawn cloak in the artwork's colours. The sitting/scared hero shot uses the untouched art.
 */
export const Hero: React.FC<HeroProps> = ({
  x,
  y,
  scale = 1,
  facing = 1,
  pose = POSES.stand,
  face = FACE.neutral,
  headScale = 1,
  frame,
  seed = 1,
  idle = 1,
  tremble = 0,
  breath = 1,
  opacity = 1,
  cloakLen = 190,
  wind = 0.3,
  headFlip = false,
  shadow = true,
}) => {
  const k = solveSkeleton(pose, HERO_DIMS, {frame, seed, idle, tremble, breath});
  const leanR = (k.lean * Math.PI) / 180;
  // torso frame: u points from neck toward hip, v is perpendicular (toward facing side)
  const ux = Math.sin(leanR) * -1;
  const uy = Math.cos(leanR);
  const ux2 = k.hip.x - k.neck.x;
  const uy2 = k.hip.y - k.neck.y;
  const len = Math.hypot(ux2, uy2) || 1;
  const U = {x: ux2 / len, y: uy2 / len};
  const V = {x: -U.y, y: U.x};
  void ux;
  void uy;
  const at = (u: number, v: number) => ({x: k.neck.x + U.x * u + V.x * v, y: k.neck.y + U.y * u + V.y * v});
  const t = frame / 30;
  const w1 = Math.sin(t * 2.1 + seed) * (6 + 14 * wind);
  const w2 = Math.sin(t * 2.7 + seed * 2) * (5 + 12 * wind);
  const sh = k.shoulder;
  const hem = cloakLen;
  const flare = 58 + 18 * wind;
  const cloak = [
    `M ${pt({x: sh.x - V.x * 34, y: sh.y - V.y * 34})}`,
    `C ${pt(at(40, -62 - w1 * 0.3))} ${pt(at(hem * 0.6, -flare - 12 + w2))} ${pt(at(hem, -flare - 26 + w1))}`,
    `Q ${pt(at(hem + 12, -flare * 0.4 + w2))} ${pt(at(hem - 4, flare * 0.1))}`,
    `Q ${pt(at(hem + 16, flare * 0.6 + w1))} ${pt(at(hem - 2, flare + 22 + w2))}`,
    `C ${pt(at(hem * 0.6, flare + 10 - w1))} ${pt(at(40, 58))} ${pt({x: sh.x + V.x * 30, y: sh.y + V.y * 30})}`,
    `Q ${pt({x: sh.x + U.x * -8, y: sh.y - 10})} ${pt({x: sh.x - V.x * 34, y: sh.y - V.y * 34})} Z`,
  ].join(' ');
  const fold = (a: number, b: number, c: number) =>
    `M ${pt(at(30 + a, -20 + b))} Q ${pt(at(hem * 0.5 + a, c + w1 * 0.3))} ${pt(at(hem - 20, c * 1.25 + w2 * 0.4))}`;

  const limb = {stroke: INK, strokeWidth: LIMB, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none'};
  const foot = (f: {x: number; y: number}, a: number) => `M ${pt(f)} l ${Math.cos((a * Math.PI) / 180) * 0 + 17},${3}`;
  const sc = headScale;
  const flip = headFlip ? -1 : 1;

  return (
    <g transform={`translate(${x},${y}) scale(${scale * facing},${scale})`} opacity={opacity}>
      {shadow ? <ellipse cx={k.hip.x + 8} cy={3} rx={96} ry={9} fill="#000" opacity={0.28} /> : null}
      {/* legs + torso */}
      <path d={`M ${pt(k.hip)} L ${pt(k.kneeR)} L ${pt(k.footR)} ${foot(k.footR, pose.rS)}`} {...limb} />
      <path d={`M ${pt(k.hip)} L ${pt(k.kneeL)} L ${pt(k.footL)} ${foot(k.footL, pose.lS)}`} {...limb} />
      <path d={`M ${pt(k.neck)} L ${pt(k.hip)}`} {...limb} />
      {/* arm B behind the cloak, arm A in front (as in the artwork) */}
      <path d={`M ${pt(k.shoulder)} L ${pt(k.elbowB)} L ${pt(k.handB)}`} {...limb} />
      <path d={hand(k.handB, k.forearmB).join(' ')} {...limb} strokeWidth={5} />
      {/* cloak */}
      <path d={cloak} fill={CLOAK.mid} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={fold(0, -6, -34)} stroke={CLOAK.dark} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
      <path d={fold(6, 8, 22)} stroke={CLOAK.dark} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
      <path d={fold(-4, 0, -8)} stroke={CLOAK.light} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.35} />
      <path
        d={`M ${pt({x: sh.x - V.x * 30, y: sh.y - V.y * 30})} Q ${pt(at(26, 8))} ${pt({x: sh.x + V.x * 28, y: sh.y + V.y * 28})}`}
        stroke={CLOAK.rim}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
        opacity={0.55}
      />
      <path d={`M ${pt(k.shoulder)} L ${pt(k.elbowA)} L ${pt(k.handA)}`} {...limb} />
      <path d={hand(k.handA, k.forearmA).join(' ')} {...limb} strokeWidth={5} />
      {/* head: original artwork, features redrawn */}
      <g transform={`translate(${k.head.x},${k.head.y}) rotate(${pose.tilt + k.lean * 0.4}) scale(${sc * flip},${sc})`}>
        <g transform={`translate(${-HEAD.cx},${-HEAD.cy})`}>
          <image href={staticFile('stone/head.png')} x={0} y={0} width={HEAD.w} height={HEAD.h} />
          <HeroFaceOverlay face={face} frame={frame} seed={seed} />
        </g>
      </g>
    </g>
  );
};

/** The untouched artwork (sitting, arms raised): used for the "wrong world" hero shot. */
export const HeroArt: React.FC<{x: number; y: number; scale?: number; rotate?: number; opacity?: number; flip?: boolean}> = ({
  x,
  y,
  scale = 1,
  rotate = 0,
  opacity = 1,
  flip = false,
}) => (
  <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${flip ? -scale : scale},${scale})`} opacity={opacity}>
    <image href={staticFile('stone/character.png')} x={-383 / 2} y={-306} width={383} height={306} />
  </g>
);
