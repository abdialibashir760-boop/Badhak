import React from 'react';

import {C} from './palette';
import {DOC_KEYS} from './timeline';
import {LAP_H, LAP_W, PHONE_H, PHONE_W} from './ui';

const INK = C.sil;

/** A thumb silhouette entering from the lower right. `tip` is where it touches the glass. */
export const Thumb: React.FC<{x: number; y: number; angle?: number; rim?: string; opacity?: number; scale?: number}> = ({x, y, angle = 58, rim = C.rimCold, opacity = 1, scale = 1}) => {
  const d = 'M 0,-40 A 40 40 0 0 0 0,40 L 520,52 L 520,-52 Z';
  return (
    <g transform={`translate(${x},${y}) rotate(${angle}) scale(${scale})`} opacity={opacity}>
      <path d={d} fill={rim} transform="translate(-5,-4)" opacity={0.85} />
      <path d={d} fill={INK} />
      <path d="M 14,-16 Q 40,-30 70,-26" stroke={rim} strokeWidth={4} fill="none" opacity={0.35} strokeLinecap="round" />
    </g>
  );
};

/** Phone seen close up: bezel, glow and a screen drawn in a 460 × 900 box. */
export const PhoneCU: React.FC<{children: React.ReactNode; glow?: number; zoom?: number; cx?: number; cy?: number; rot?: number; dead?: boolean; tint?: string}> = ({
  children,
  glow = 1,
  zoom = 1,
  cx = 960,
  cy = 540,
  rot = 0,
  dead = false,
  tint = C.rimCold,
}) => (
  <g transform={`translate(${cx},${cy}) rotate(${rot}) scale(${zoom}) translate(${-PHONE_W / 2 - 22},${-PHONE_H / 2 - 22})`}>
    <defs>
      <radialGradient id="pcu-glow">
        <stop offset="0" stopColor={tint} stopOpacity="0.5" />
        <stop offset="0.6" stopColor="#2B4C7E" stopOpacity="0.16" />
        <stop offset="1" stopColor="#2B4C7E" stopOpacity="0" />
      </radialGradient>
      <clipPath id="pcu-clip">
        <rect x={22} y={22} width={PHONE_W} height={PHONE_H} rx={46} />
      </clipPath>
    </defs>
    <ellipse cx={PHONE_W / 2 + 22} cy={PHONE_H / 2 + 22} rx={900} ry={760} fill="url(#pcu-glow)" opacity={glow} />
    <rect x={0} y={0} width={PHONE_W + 44} height={PHONE_H + 44} rx={64} fill="#080B14" stroke={C.ash} strokeWidth={5} />
    <g clipPath="url(#pcu-clip)">
      <g transform="translate(22,22)">{dead ? <rect width={PHONE_W} height={PHONE_H} fill="#05070D" /> : children}</g>
      <path d={`M 22,22 L ${PHONE_W + 22},22 L 22,${PHONE_H * 0.6} Z`} fill="#fff" opacity={dead ? 0.04 : 0.025} />
    </g>
  </g>
);

/** Fingers over a keyboard, bobbing on every keystroke (events shared with the sound track). */
export const TypingHands: React.FC<{t: number; y?: number; x?: number; scale?: number; rim?: string}> = ({t, y = 980, x = 500, scale = 1, rim = C.rimCold}) => {
  const recent = DOC_KEYS.filter((k) => k.t <= t && k.t > t - 0.14);
  const last = recent.at(-1);
  const phase = last ? (last.t - (t - 0.14)) / 0.14 : 1;
  const down = last ? Math.sin((1 - phase) * Math.PI) : 0;
  const idx = DOC_KEYS.filter((k) => k.t <= t).length;
  const hand = (hx: number, mirror: number, active: boolean) => (
    <g transform={`translate(${hx},0) scale(${mirror},1)`}>
      <path d="M -120,40 C -110,-70 110,-70 120,40 L 120,200 L -120,200 Z" fill={INK} />
      {[0, 1, 2, 3].map((i) => {
        const press = active && (idx + i) % 4 === 0 ? down * 26 : 0;
        return <rect key={i} x={-104 + i * 52} y={-76 + (i === 1 || i === 2 ? -12 : 0) + press} width={40} height={96} rx={20} fill={INK} stroke={rim} strokeWidth={0} />;
      })}
      <path d="M -112,24 C -100,-76 100,-76 112,24" stroke={rim} strokeWidth={5} fill="none" opacity={0.55} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {hand(240, 1, idx % 2 === 0)}
      {hand(760, -1, idx % 2 === 1)}
    </g>
  );
};

export const LaptopCU: React.FC<{children: React.ReactNode; t: number; zoom?: number; cx?: number; cy?: number; glow?: number; hands?: boolean; handsY?: number}> = ({children, t, zoom = 1, cx = 960, cy = 430, glow = 1, hands = true, handsY = 1010}) => (
  <g>
    <defs>
      <radialGradient id="lcu-glow">
        <stop offset="0" stopColor={C.rimCold} stopOpacity="0.4" />
        <stop offset="1" stopColor={C.screen} stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx={960} cy={500} rx={1200} ry={760} fill="url(#lcu-glow)" opacity={glow} />
    <g transform={`translate(${cx},${cy}) scale(${zoom}) translate(${-LAP_W / 2},${-LAP_H / 2})`}>
      <rect x={-26} y={-26} width={LAP_W + 52} height={LAP_H + 52} rx={22} fill="#0A0E18" stroke={C.ash} strokeWidth={5} />
      <svg x={0} y={0} width={LAP_W} height={LAP_H} viewBox={`0 0 ${LAP_W} ${LAP_H}`} overflow="hidden">
        {children}
      </svg>
    </g>
    {hands ? <TypingHands t={t} y={handsY} x={560} /> : null}
  </g>
);

/** Face close-up: a big head silhouette in profile, glasses reflecting the light source. */
export const FaceCU: React.FC<{x?: number; y?: number; scale?: number; tilt?: number; jaw?: number; light?: string; lightAt?: {x: number; y: number}; glint?: number; reflect?: React.ReactNode; flip?: boolean; eyes?: number; frame: number}> = ({
  x = 960,
  y = 540,
  scale = 1,
  tilt = 0,
  jaw = 0,
  light = C.rimCold,
  lightAt = {x: 1500, y: 700},
  glint = 1,
  reflect,
  flip = false,
  eyes = 1,
  frame,
}) => {
  const breathe = Math.sin(frame / 30 * 1.6) * 3;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale}) rotate(${tilt})`}>
      <defs>
        <radialGradient id="face-light" gradientUnits="userSpaceOnUse" cx={lightAt.x - x} cy={lightAt.y - y} r={900}>
          <stop offset="0" stopColor={light} stopOpacity="0.6" />
          <stop offset="0.5" stopColor={light} stopOpacity="0.14" />
          <stop offset="1" stopColor={light} stopOpacity="0" />
        </radialGradient>
        <clipPath id="lens"><circle r={72} /></clipPath>
        <clipPath id="face-clip">
          <path d={headPath(jaw)} />
        </clipPath>
      </defs>
      {/* hood + shoulders */}
      <path d="M -520,520 C -480,260 -330,160 -160,150 L 60,170 C 200,200 330,300 420,520 Z" fill={INK} />
      <path d="M -300,60 C -420,-40 -400,-250 -230,-300 C -300,-120 -230,0 -140,70 Z" fill={INK} />
      <path d={headPath(jaw)} fill={INK} />
      <path d={headPath(jaw)} fill="none" stroke={light} strokeWidth={6} opacity={0.65} transform="translate(8,-5)" />
      <g clipPath="url(#face-clip)">
        <rect x={-500} y={-500} width={1000} height={1000} fill="url(#face-light)" />
      </g>
      {/* hair tuft */}
      <path d="M -40,-236 Q 10,-330 100,-300 Q 40,-280 30,-236 Z" fill={INK} stroke={light} strokeWidth={3} opacity={1} />
      {/* eye (negative space) and glasses */}
      <g transform={`translate(138,${-18 + breathe * 0.2})`}>
        <circle r={74} fill="#0B1226" stroke={light} strokeWidth={6} opacity={0.95} />
        <g clipPath="url(#lens)">{reflect}</g>
        <ellipse cx={4} cy={6} rx={21} ry={26 * eyes} fill="#DCE8F5" opacity={0.9} />
        <ellipse cx={10} cy={8} rx={8} ry={10 * eyes} fill="#0B1226" />
        <path d="M -44,-34 A 56,56 0 0 1 14,-58" stroke={C.white} strokeWidth={8} strokeLinecap="round" fill="none" opacity={glint} />
        <path d="M -74,0 L -190,-24" stroke={INK} strokeWidth={7} />
      </g>
    </g>
  );
};
const headPath = (jaw: number) =>
  `M -220,-60 C -230,-230 -90,-290 40,-270 C 170,-250 232,-150 224,-50 C 222,0 236,30 224,70 C 214,106 180,110 ${176 + jaw * 10},${140 + jaw * 34} C 120,${200 + jaw * 40} 20,214 -70,180 C -170,150 -214,70 -220,-60 Z`;

/** Lying face seen from above, on a pillow (scene 9). */
export const PillowFace: React.FC<{frame: number; t: number; light?: number}> = ({frame, light = 1}) => {
  const breathe = Math.sin(frame / 30 * 1.4) * 4;
  return (
    <g>
      <defs>
        <radialGradient id="pf-light" gradientUnits="userSpaceOnUse" cx={960} cy={180} r={760}>
          <stop offset="0" stopColor={C.rimCold} stopOpacity="0.6" />
          <stop offset="0.55" stopColor={C.screen} stopOpacity="0.16" />
          <stop offset="1" stopColor={C.screen} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={960} cy={560 + breathe} rx={620} ry={420} fill="#1C2440" stroke={INK} strokeWidth={6} />
      <path d={`M 340,780 C 520,${640 + breathe} 1400,${640 + breathe} 1580,780 L 1580,1100 L 340,1100 Z`} fill="#111830" />
      <circle cx={960} cy={540 + breathe} r={210} fill={INK} />
      <path d={`M 800,${430 + breathe} Q 960,${290 + breathe} 1130,${440 + breathe} Q 1000,${380 + breathe} 800,${430 + breathe} Z`} fill={INK} />
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${880 + i * 160},${520 + breathe})`}>
          <circle r={52} fill="none" stroke={C.rimCold} strokeWidth={5} opacity={0.9} />
          <ellipse cy={4} rx={16} ry={20} fill="#DCE8F5" opacity={0.85} />
          <ellipse cy={6} rx={6} ry={8} fill="#0B1226" />
          <path d="M -34,-26 A 42,42 0 0 1 10,-44" stroke={C.white} strokeWidth={6} strokeLinecap="round" fill="none" />
        </g>
      ))}
      <path d={`M 910,${620 + breathe} Q 960,${640 + breathe} 1010,${620 + breathe}`} stroke="#0B1226" strokeWidth={6} fill="none" opacity={0.5} />
      <rect x={0} y={0} width={1920} height={1080} fill="url(#pf-light)" opacity={light} />
    </g>
  );
};
