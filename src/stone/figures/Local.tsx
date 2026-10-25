import React from 'react';
import {Pose} from '../../lib/pose';
import {FlintBlade, HideBag, Spear} from '../art/Camp';
import {HERO_DIMS, POSES, pt, solveSkeleton} from './skeleton';
import {FACE, HeroFace, INK} from './Hero';

export type Held = {kind: 'spear' | 'flint' | 'bag' | 'stick' | 'meat' | 'torch' | 'flute'; hand?: 'A' | 'B'; rot?: number};

export type LocalLook = {
  skin: string;
  hair: string;
  hairStyle: 'long' | 'topknot' | 'short' | 'braid';
  beard?: boolean;
  tunic: string;
  trim: string;
  headR?: number;
};

export const LOOKS: Record<string, LocalLook> = {
  hunter: {skin: '#a57250', hair: '#22150e', hairStyle: 'long', beard: true, tunic: '#8c6a47', trim: '#d8c9a8'},
  elder: {skin: '#996846', hair: '#cfcac2', hairStyle: 'long', beard: true, tunic: '#6f5a42', trim: '#b9ab8c'},
  woman: {skin: '#b07c58', hair: '#2e1c11', hairStyle: 'braid', tunic: '#9a7a52', trim: '#e0d2b2'},
  forager: {skin: '#a06e4b', hair: '#33200f', hairStyle: 'topknot', tunic: '#7d6648', trim: '#cdbb94'},
  child: {skin: '#b88460', hair: '#25160d', hairStyle: 'short', tunic: '#a07f58', trim: '#e6d9b8', headR: 38},
};

export type LocalProps = {
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  pose?: Pose;
  face?: HeroFace;
  look: LocalLook;
  held?: Held[];
  frame: number;
  seed?: number;
  idle?: number;
  tremble?: number;
  opacity?: number;
  headScale?: number;
  shadow?: boolean;
  /** Dim colours for distance/night: multiplies via an overlay. */
  tint?: string;
};

const handFingers = (p: {x: number; y: number}, a: number) => {
  const r = (Math.PI / 180) * (90 - a);
  return [-30, 0, 30].map((o, i) => {
    const th = r + (o * Math.PI) / 180;
    return `M ${p.x.toFixed(1)},${p.y.toFixed(1)} l ${(Math.cos(th) * (i === 1 ? 15 : 12)).toFixed(1)},${(-Math.sin(th) * (i === 1 ? 15 : 12)).toFixed(1)}`;
  });
};

/** Prehistoric person in the same stick-figure language as the hero: black limbs, hide tunic, tools. */
export const Local: React.FC<LocalProps> = ({x, y, scale = 1, facing = 1, pose = POSES.stand, face = FACE.neutral, look, held = [], frame, seed = 1, idle = 1, tremble = 0, opacity = 1, headScale = 1, shadow = true}) => {
  const k = solveSkeleton(pose, HERO_DIMS, {frame, seed, idle, tremble});
  const d = {x: k.hip.x - k.neck.x, y: k.hip.y - k.neck.y};
  const len = Math.hypot(d.x, d.y) || 1;
  const U = {x: d.x / len, y: d.y / len};
  const V = {x: -U.y, y: U.x};
  const at = (u: number, v: number) => ({x: k.neck.x + U.x * u + V.x * v, y: k.neck.y + U.y * u + V.y * v});
  const sh = k.shoulder;
  const limb = {stroke: INK, strokeWidth: 8.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none'};
  const R = (look.headR ?? 44) * headScale;
  const tunicLen = 118;
  const sway = Math.sin(frame / 30 * 2 + seed) * 4;
  const tunic = [
    `M ${pt({x: sh.x - V.x * 30, y: sh.y - V.y * 30})}`,
    `L ${pt(at(tunicLen, -44 + sway))}`,
    `Q ${pt(at(tunicLen + 12, 0))} ${pt(at(tunicLen, 44 - sway))}`,
    `L ${pt({x: sh.x + V.x * 30, y: sh.y + V.y * 30})}`,
    `Q ${pt({x: sh.x - U.x * 6, y: sh.y - 8})} ${pt({x: sh.x - V.x * 30, y: sh.y - V.y * 30})} Z`,
  ].join(' ');
  // zig-zag fur trim along the hem
  const trim = Array.from({length: 7}, (_, i) => {
    const v = -44 + (88 * i) / 6;
    return `${i === 0 ? 'M' : 'L'} ${pt(at(tunicLen + (i % 2 ? 10 : -2), v))}`;
  }).join(' ');
  const heldNode = (h: Held) => {
    const p = h.hand === 'B' ? k.handB : k.handA;
    const a = h.hand === 'B' ? k.forearmB : k.forearmA;
    const rot = 90 - a + (h.rot ?? 0);
    switch (h.kind) {
      case 'spear':
        return <Spear key={h.kind + (h.hand ?? 'A')} x={p.x} y={p.y} rot={(h.rot ?? -78)} len={360} />;
      case 'flint':
        return <FlintBlade key="flint" x={p.x + 10} y={p.y} s={0.9} rot={rot} />;
      case 'bag':
        return <HideBag key="bag" x={p.x} y={p.y + 26} s={0.9} rot={(h.rot ?? 0) + Math.sin(frame * 0.06) * 3} />;
      case 'stick':
        return <line key="stick" x1={p.x - 40} y1={p.y + 30} x2={p.x + 60} y2={p.y - 150} stroke="#5a3e27" strokeWidth={8} strokeLinecap="round" />;
      case 'meat':
        return <path key="meat" d={`M ${p.x - 4},${p.y - 4} l 14,-8 q 26,-6 34,12 q -2,22 -26,26 q -18,-4 -22,-30 z`} fill="#a64d38" stroke={INK} strokeWidth={3} />;
      case 'torch':
        return (
          <g key="torch" transform={`translate(${p.x},${p.y}) rotate(${rot - 90 + (h.rot ?? 0)})`}>
            <line x1={0} y1={30} x2={0} y2={-70} stroke="#5a3e27" strokeWidth={8} strokeLinecap="round" />
            <path d={`M -10,-70 q -8,-26 10,-44 q 22,20 10,44 z`} fill="#f2a43a" stroke={INK} strokeWidth={2.5} />
          </g>
        );
      case 'flute':
        return <line key="flute" x1={p.x - 10} y1={p.y + 6} x2={p.x - 70} y2={p.y - 28} stroke="#e6dcc3" strokeWidth={9} strokeLinecap="round" />;
    }
  };
  const hairBack =
    look.hairStyle === 'long' ? (
      <path d={`M ${-R * 0.95},${-R * 0.2} C ${-R * 1.4},${R * 0.6} ${-R * 1.2},${R * 1.5} ${-R * 0.6},${R * 1.7} L ${R * 0.1},${R * 0.8} Z`} fill={look.hair} stroke={INK} strokeWidth={3.5} />
    ) : look.hairStyle === 'braid' ? (
      <path d={`M ${-R * 0.9},${-R * 0.1} C ${-R * 1.5},${R * 0.7} ${-R * 1.0},${R * 1.2} ${-R * 1.3},${R * 2.0}`} stroke={look.hair} strokeWidth={13} fill="none" strokeLinecap="round" />
    ) : null;
  return (
    <g transform={`translate(${x},${y}) scale(${scale * facing},${scale})`} opacity={opacity}>
      {shadow ? <ellipse cx={k.hip.x + 8} cy={3} rx={86} ry={8} fill="#000" opacity={0.26} /> : null}
      <path d={`M ${pt(k.hip)} L ${pt(k.kneeR)} L ${pt(k.footR)} l 16,3`} {...limb} />
      <path d={`M ${pt(k.hip)} L ${pt(k.kneeL)} L ${pt(k.footL)} l 16,3`} {...limb} />
      {/* hide leggings below the knee */}
      <path d={`M ${pt(k.kneeR)} L ${pt(k.footR)}`} stroke="#6a4f35" strokeWidth={13} strokeLinecap="round" opacity={0.95} />
      <path d={`M ${pt(k.kneeL)} L ${pt(k.footL)}`} stroke="#7a5c3d" strokeWidth={13} strokeLinecap="round" opacity={0.95} />
      <path d={`M ${pt(k.neck)} L ${pt(k.hip)}`} {...limb} />
      <path d={`M ${pt(k.shoulder)} L ${pt(k.elbowB)} L ${pt(k.handB)}`} {...limb} />
      {held.filter((h) => h.hand === 'B').map(heldNode)}
      <path d={tunic} fill={look.tunic} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={trim} fill="none" stroke={look.trim} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
      <path d={`M ${pt(at(60, -40))} L ${pt(at(60, 40))}`} stroke="#3b2a1b" strokeWidth={7} strokeLinecap="round" />
      <path d={`M ${pt(at(20, -18))} l 6,40 M ${pt(at(40, 10))} l 5,30`} stroke="#4c3926" strokeWidth={2.4} opacity={0.6} fill="none" strokeLinecap="round" />
      <path d={`M ${pt(k.shoulder)} L ${pt(k.elbowA)} L ${pt(k.handA)}`} {...limb} />
      <path d={handFingers(k.handA, k.forearmA).join(' ')} {...limb} strokeWidth={5} />
      <path d={handFingers(k.handB, k.forearmB).join(' ')} {...limb} strokeWidth={5} />
      {held.filter((h) => h.hand !== 'B').map(heldNode)}
      {/* head */}
      <g transform={`translate(${k.head.x},${k.head.y + (R - 44)}) rotate(${pose.tilt + k.lean * 0.4})`}>
        {hairBack}
        <circle r={R} fill={look.skin} stroke={INK} strokeWidth={5} />
        <path d={`M ${-R * 0.98},${-R * 0.05} C ${-R * 0.95},${-R * 1.1} ${R * 0.9},${-R * 1.2} ${R * 1.0},${-R * 0.1} C ${R * 0.6},${-R * 0.55} ${-R * 0.5},${-R * 0.6} ${-R * 0.98},${-R * 0.05} Z`} fill={look.hair} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        {look.hairStyle === 'topknot' ? <circle cx={-R * 0.1} cy={-R * 1.15} r={R * 0.28} fill={look.hair} stroke={INK} strokeWidth={3.5} /> : null}
        {look.beard ? <path d={`M ${-R * 0.7},${R * 0.35} C ${-R * 0.6},${R * 1.3} ${R * 0.7},${R * 1.3} ${R * 0.78},${R * 0.3} C ${R * 0.4},${R * 0.62} ${-R * 0.3},${R * 0.62} ${-R * 0.7},${R * 0.35} Z`} fill={look.hair} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /> : null}
        <g transform={`scale(${R / 44})`}>
          <FaceFeatures face={face} frame={frame} seed={seed} />
        </g>
      </g>
    </g>
  );
};

const FaceFeatures: React.FC<{face: HeroFace; frame: number; seed: number}> = ({face, frame, seed}) => {
  const f = (frame + seed * 41) % 120;
  const blink = f > 110 && f < 116 ? Math.sin(((f - 110) / 6) * Math.PI) : 0;
  const eye = Math.max(0.05, face.eye * (1 - blink));
  const curve = face.smile * 8;
  const o = face.open * 10;
  const bl = face.brow;
  return (
    <g>
      {[-1, 1].map((s) => (
        <ellipse key={s} cx={s * 15 + 5 + face.gx * 3.5} cy={-2 + face.gy * 3} rx={3.8} ry={5.2 * eye} fill={INK} />
      ))}
      <path d={`M -24,${-14 - bl * 3 * -1} L -6,${-14 + bl * 4}`} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      <path d={`M 16,${-14 + bl * 4} L 34,${-14 + bl * 3 * -1}`} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      <path
        d={o > 2 ? `M -9,18 Q 6,${16 + curve * 0.3} 20,18 Q 6,${18 + o * 1.3} -9,18 Z` : `M -9,18 Q 6,${18 + curve * 1.4} 20,17`}
        stroke={INK}
        strokeWidth={2.8}
        strokeLinecap="round"
        fill={o > 2 ? INK : 'none'}
      />
    </g>
  );
};
