import React from 'react';
import type {SceneTiming} from '../lib/timing';
import {clamp, seg} from '../lib/anim';
import {keysFor, useLang, useText} from './i18n';

/** Tongue-in-cheek "odds of surviving the day" counter — a comedy device, not a statistic. */
type KF = ReturnType<typeof keysFor>;
const ODDS: Array<(f: number, tm: SceneTiming, K: KF) => number> = [
  (f) => 4 - seg(f, 200, 260) * 2,
  (f, _tm, K) => 2 - (f > K.at('supermarket', 0.5) ? 1 : 0),
  (f, _tm, K) => 2 + seg(f, K.at('skills', 0.2), K.at('skills', 0.2) + 40) * 6,
  (f, _tm, K) => 7 - (f > K.at('shops', 0.2) ? 2 : 0) + (f > K.at('Finding', 0.4) ? 6 : 0) - (f > K.at('fridge', 0.9) ? 3 : 0),
  (f, _tm, K) => 11 - seg(f, K.at('watching', 0.1), K.at('watching', 0.1) + 30) * 8 + seg(f, K.at('back', 0.6), K.at('back', 0.6) + 200) * 14,
  (f, tm) => 22 + seg(f, 0, tm.dur) * 26,
  (f, _tm, K) => 48 + seg(f, 0, K.at('hotline', 0.9)) * 26,
];

export const StoneHud: React.FC<{frame: number; scene: number; dur: number; tm: SceneTiming}> = ({frame, scene, dur, tm}) => {
  const K = keysFor(useLang(), tm);
  const TX = useText();
  const odds = Math.round(clamp(ODDS[scene]?.(frame, tm, K) ?? 0, 1, 99));
  const show = seg(frame, 40, 70) * (1 - seg(frame, dur - 40, dur - 12));
  const hide = scene === 0 && frame > K.at('biggest', 0.7);
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
      <div style={{fontSize: 14, letterSpacing: '0.34em', opacity: 0.75}}>{TX.odds}</div>
      <div style={{fontSize: 44, fontWeight: 500, fontFamily: "'Cormorant Garamond', serif", marginTop: 2, color: odds < 8 ? '#e06a5f' : odds > 45 ? '#c9d79a' : '#e8e0cf'}}>{odds}%</div>
      <div style={{width: 190, height: 3, background: 'rgba(232,224,207,0.2)', marginLeft: 'auto'}}>
        <div style={{width: `${odds}%`, height: '100%', background: odds < 8 ? '#e06a5f' : '#e8e0cf'}} />
      </div>
    </div>
  );
};
