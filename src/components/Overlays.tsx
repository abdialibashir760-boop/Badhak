import React, {useLayoutEffect, useRef} from 'react';
import {HEIGHT, WIDTH} from '../config/types';
import {clamp, rng} from '../lib/anim';
import type {Cue} from '../lib/timing';
import {INK, RED} from './StickFigure';

export const SERIF = "'Cormorant Garamond', 'Times New Roman', serif";
export const SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";

/** Film grain, drawn to a small canvas with a per-frame deterministic seed. */
export const Grain: React.FC<{frame: number; amount?: number}> = ({frame, amount = 0.11}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const w = 480;
    const h = 270;
    const img = ctx.createImageData(w, h);
    const r = rng(1337 + (frame % 24) * 7919);
    for (let i = 0; i < w * h; i++) {
      const v = Math.floor(r() * 255);
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [frame]);
  return (
    <canvas
      ref={ref}
      width={480}
      height={270}
      style={{position: 'absolute', inset: 0, width: WIDTH, height: HEIGHT, mixBlendMode: 'overlay', opacity: amount * 2.6, pointerEvents: 'none', imageRendering: 'auto'}}
    />
  );
};

/** Karaoke-style subtitles: words brighten as they are spoken, *emphasis* turns red. */
export const Subtitles: React.FC<{cues: Cue[]; frame: number}> = ({cues, frame}) => {
  const cue = cues.find((c) => frame >= c.start - 3 && frame < c.showEnd);
  if (!cue) return null;
  const fadeIn = clamp((frame - (cue.start - 3)) / 6);
  const fadeOut = clamp((cue.showEnd - frame) / 6);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 74,
        textAlign: 'center',
        opacity: Math.min(fadeIn, fadeOut),
        transform: `translateY(${(1 - fadeIn) * 8}px)`,
        fontFamily: SERIF,
        fontSize: 52,
        fontWeight: 500,
        lineHeight: 1.18,
        textShadow: '0 2px 18px #000, 0 0 3px #000',
      }}
    >
      {cue.lines.map((line, li) => (
        <div key={li}>
          {line.map((w, wi) => {
            const spoken = frame >= w.start;
            const current = frame >= w.start && frame < w.end + 4;
            return (
              <React.Fragment key={wi}>
                {wi > 0 ? ' ' : null}
                <span
                  style={{
                    color: w.emph ? (spoken ? '#d2504b' : '#7a3532') : spoken ? INK : '#6d6a65',
                    fontStyle: w.emph ? 'italic' : 'normal',
                    fontWeight: w.emph ? 700 : 500,
                    transition: 'none',
                    display: 'inline-block',
                    transform: current ? 'translateY(-2px)' : 'none',
                  }}
                >
                  {w.text}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Kinetic typography: each word rises, un-blurs and tracks in on its own beat. */
export const KineticText: React.FC<{
  words: Array<{text: string; at: number; color?: string; italic?: boolean}>;
  frame: number;
  size?: number;
  x?: number;
  y?: number;
  tracking?: number;
  opacity?: number;
  gap?: number;
  weight?: number;
  family?: string;
  lineHeight?: number;
  maxWidth?: number;
}> = ({words, frame, size = 120, x = WIDTH / 2, y = HEIGHT / 2, tracking = 0.06, opacity = 1, gap = 0.3, weight = 600, family = SERIF, lineHeight = 1.05, maxWidth = 1600}) => (
  <div
    style={{
      position: 'absolute',
      left: x - maxWidth / 2,
      width: maxWidth,
      top: y,
      transform: 'translateY(-50%)',
      textAlign: 'center',
      fontFamily: family,
      fontSize: size,
      fontWeight: weight,
      lineHeight,
      opacity,
      color: INK,
    }}
  >
    {words.map((w, i) => {
      const t = clamp((frame - w.at) / 16);
      const e = 1 - Math.pow(1 - t, 4);
      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            marginRight: `${gap}em`,
            opacity: e,
            transform: `translateY(${(1 - e) * 36}px) scale(${1.08 - e * 0.08})`,
            filter: `blur(${(1 - e) * 14}px)`,
            letterSpacing: `${tracking * (1 + (1 - e) * 3)}em`,
            color: w.color ?? INK,
            fontStyle: w.italic ? 'italic' : 'normal',
          }}
        >
          {w.text}
        </span>
      );
    })}
  </div>
);

export const SmallCaps: React.FC<{text: string; x: number; y: number; opacity?: number; size?: number; color?: string; align?: 'left' | 'center' | 'right'; spacing?: number}> = ({
  text,
  x,
  y,
  opacity = 1,
  size = 22,
  color = '#9d9993',
  align = 'center',
  spacing = 0.42,
}) => (
  <text x={x} y={y} fill={color} opacity={opacity} fontFamily={SANS} fontSize={size} fontWeight={500} letterSpacing={size * spacing} textAnchor={align === 'center' ? 'middle' : align === 'left' ? 'start' : 'end'}>
    {text}
  </text>
);

export const RED_COLOR = RED;
