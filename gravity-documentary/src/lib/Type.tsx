import React from 'react';
import { CYAN, DIM, FONT, GOLD, INK } from './theme';
import { seg, ease } from './math';

/** Cinematic chapter card: numeral, title, subtitle with staggered reveal. */
export const ChapterCard: React.FC<{ num: string; title: string; sub?: string; t: number; dur: number; accent?: string; y?: number }> = ({
  num, title, sub, t, dur, accent = GOLD, y = 360,
}) => {
  const a = ease.out(seg(t, 0.2, 1.1));
  const b = ease.out(seg(t, 0.5, 1.5));
  const c = ease.out(seg(t, 1.0, 2.0));
  const out = 1 - seg(t, dur - 0.6, dur);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: FONT, opacity: out }}>
      <div style={{ color: accent, fontSize: 30, letterSpacing: 14, fontWeight: 600, opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>{num}</div>
      <div style={{ height: 2, width: 260 * b, background: accent, margin: '26px auto 30px', opacity: 0.8 }} />
      <div style={{ color: INK, fontSize: 118, fontWeight: 800, letterSpacing: 6, opacity: b, transform: `translateY(${(1 - b) * 24}px)`, textShadow: '0 4px 40px rgba(0,0,0,.7)' }}>{title}</div>
      {sub && <div style={{ color: DIM, fontSize: 36, marginTop: 26, letterSpacing: 2, opacity: c }}>{sub}</div>}
    </div>
  );
};

/** Small corner label that identifies what the viewer is looking at. */
export const Label: React.FC<{ x: number; y: number; text: string; sub?: string; opacity?: number; color?: string }> = ({ x, y, text, sub, opacity = 1, color = CYAN }) => (
  <div style={{ position: 'absolute', left: x, top: y, fontFamily: FONT, opacity, borderLeft: `4px solid ${color}`, paddingLeft: 18 }}>
    <div style={{ color: INK, fontSize: 36, fontWeight: 700 }}>{text}</div>
    {sub && <div style={{ color: DIM, fontSize: 26, marginTop: 4 }}>{sub}</div>}
  </div>
);

/** Large centred statement that fades in/out. */
export const Statement: React.FC<{ text: string; sub?: string; t: number; dur: number; y?: number; size?: number; color?: string }> = ({
  text, sub, t, dur, y = 420, size = 76, color = INK,
}) => {
  const o = Math.min(seg(t, 0.2, 0.9), 1 - seg(t, dur - 0.6, dur));
  return (
    <div style={{ position: 'absolute', left: 120, right: 120, top: y, textAlign: 'center', fontFamily: FONT, opacity: o, transform: `translateY(${(1 - o) * 18}px)` }}>
      <div style={{ color, fontSize: size, fontWeight: 800, lineHeight: 1.1, textShadow: '0 4px 40px rgba(0,0,0,.8)' }}>{text}</div>
      {sub && <div style={{ color: GOLD, fontSize: 38, marginTop: 22, letterSpacing: 1 }}>{sub}</div>}
    </div>
  );
};
