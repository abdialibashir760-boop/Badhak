import React from 'react';
import type {SceneTiming} from '../lib/timing';
import {clamp, seg} from '../lib/anim';

/** Tongue-in-cheek "odds of surviving the day" counter — a comedy device, not a statistic. */
const ODDS: Array<(f: number, tm: SceneTiming) => number> = [
  (f) => 4 - seg(f, 200, 260) * 2,
  (f, tm) => 2 - (f > tm.at('supermarket', 0.5) ? 1 : 0),
  (f, tm) => 2 + seg(f, tm.at('skills', 0.2), tm.at('skills', 0.2) + 40) * 6,
  (f, tm) => 7 - (f > tm.at('shops', 0.2) ? 2 : 0) + (f > tm.at('Finding', 0.4) ? 6 : 0) - (f > tm.at('fridge', 0.9) ? 3 : 0),
  (f, tm) => 11 - seg(f, tm.at('watching', 0.1), tm.at('watching', 0.1) + 30) * 8 + seg(f, tm.at('back', 0.6), tm.at('back', 0.6) + 200) * 14,
  (f, tm) => 22 + seg(f, 0, tm.dur) * 26,
  (f, tm) => 48 + seg(f, 0, tm.at('hotline', 0.9)) * 26,
];

export const StoneHud: React.FC<{frame: number; scene: number; dur: number; tm: SceneTiming}> = ({frame, scene, dur, tm}) => {
  const odds = Math.round(clamp(ODDS[scene]?.(frame, tm) ?? 0, 1, 99));
  const show = seg(frame, 40, 70) * (1 - seg(frame, dur - 40, dur - 12));
  const hide = scene === 0 && frame > tm.at('biggest', 0.7);
  return (
    <div
      style={{
        position: 'absolute',
        top: 54,
        right: 72,
        textAlign: 'right',
        opacity: hide ? 0 : show * 0.9,
        fontFamily: "'Inter', sans-serif",
        color: '#e8e0cf',
        textShadow: '0 2px 12px #000',
      }}
    >
      <div style={{fontSize: 14, letterSpacing: '0.34em', opacity: 0.75}}>ODDS OF SURVIVING THE DAY</div>
      <div style={{fontSize: 44, fontWeight: 500, fontFamily: "'Cormorant Garamond', serif", marginTop: 2, color: odds < 8 ? '#e06a5f' : odds > 45 ? '#c9d79a' : '#e8e0cf'}}>{odds}%</div>
      <div style={{width: 190, height: 3, background: 'rgba(232,224,207,0.2)', marginLeft: 'auto'}}>
        <div style={{width: `${odds}%`, height: '100%', background: odds < 8 ? '#e06a5f' : '#e8e0cf'}} />
      </div>
    </div>
  );
};
