import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {Figure, HEAD_R, getPose} from './figure';
import {BubbleLayer, SpeechBubble} from './bubbles';
import {Interior} from './interior';
import {Room} from './room';
import {Font} from './font';
import {CREAM, FPS, FREEZE_T, H, INK, W, clamp01, lerp, smooth} from './utils';

const zoomCurve = Easing.bezier(0.5, 0, 0.15, 1);
const S0 = 1.07;
const S_END = 9.2;

export const Overthinking: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tc = Math.min(t, FREEZE_T); // content time: frozen from second 7
  const pose = getPose(tc);
  const o = pose.o;

  // Camera
  const x = clamp01((t - FREEZE_T) / 3);
  const e = t < FREEZE_T ? 0 : zoomCurve(x);
  const S = t < FREEZE_T ? 1 + 0.07 * (t / FREEZE_T) : S0 * Math.pow(S_END / S0, e);
  const cx = lerp(960, pose.head.x, e);
  const cy = lerp(540, pose.head.y, e);
  const shakeAmp = t < FREEZE_T ? 12 * Math.pow(o, 2.2) : 0;
  const shakeX = (Math.sin(frame * 2.3) + 0.5 * Math.sin(frame * 5.1)) * shakeAmp;
  const shakeY = (Math.cos(frame * 2.9) + 0.5 * Math.sin(frame * 4.3)) * shakeAmp;

  // Inside the head
  const inside = clamp01((S - 4.2) / 2.0);
  const interiorScale = (HEAD_R * S) / 400;

  const boilSeed = t < FREEZE_T ? Math.floor(frame / 3) % 7 : Math.floor(frame / 6) % 7;
  const grainSeed = frame % 11;
  const cold = smooth(clamp01((t - FREEZE_T) / 0.6)) * (1 - inside) * 0.12;
  const flash = t >= FREEZE_T ? Math.max(0, 1 - (t - FREEZE_T) / 0.22) * 0.5 : 0;
  const vig = 0.35 + 0.45 * o + 0.04 * Math.sin(frame * (0.2 + o));

  const titleOp =
    interpolate(t, [0.2, 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    interpolate(t, [1.8, 2.4], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const endOp = interpolate(t, [8.7, 9.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: '#181311'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display: 'block'}}>
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a3338" />
            <stop offset="1" stopColor="#3b4249" />
          </linearGradient>
          <radialGradient id="lampGlow">
            <stop offset="0" stopColor="#ffb561" stopOpacity="0.42" />
            <stop offset="1" stopColor="#ffb561" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.5" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="1" />
          </radialGradient>
          <filter id="boil" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves={2} seed={boilSeed} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={8} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={1} seed={grainSeed} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        {/* World (camera) */}
        <g transform={`translate(960 540) scale(${S.toFixed(4)}) translate(${(-cx + shakeX).toFixed(2)} ${(-cy + shakeY).toFixed(2)})`}>
          <g filter="url(#boil)">
            <Room tc={tc} />
            <BubbleLayer tc={tc} head={pose.head} front={false} />
            <Figure tc={tc} part="body" />
            <Figure tc={tc} part="arms" />
            <BubbleLayer tc={tc} head={pose.head} front />
            <SpeechBubble tc={tc} head={pose.head} o={o} />
          </g>
        </g>

        <rect width={W} height={H} fill="#7fa8d6" opacity={cold} />

        {/* Inside the head */}
        {inside > 0 ? (
          <g>
            <rect width={W} height={H} fill="#1b1512" opacity={inside} />
            <g filter="url(#boil)">
              <Interior frame={frame} scale={interiorScale} opacity={inside} />
            </g>
          </g>
        ) : null}

        <rect width={W} height={H} fill="url(#vig)" opacity={vig} />
        <rect width={W} height={H} filter="url(#grain)" opacity={0.14} style={{mixBlendMode: 'overlay'}} />
        <rect width={W} height={H} fill="#fff" opacity={flash} />

        <text x={W / 2} y={104} textAnchor="middle" fontFamily={Font} fontSize={50} letterSpacing={8} fill={CREAM} opacity={titleOp} stroke={INK} strokeWidth={8} paintOrder="stroke">
          WHY YOUR BRAIN OVERTHINKS
        </text>
        <text x={W / 2} y={1030} textAnchor="middle" fontFamily={Font} fontSize={54} fill={CREAM} opacity={endOp} stroke={INK} strokeWidth={9} paintOrder="stroke">
          the same thought. again. and again.
        </text>
      </svg>
    </AbsoluteFill>
  );
};
