import React from 'react';
import {HEIGHT, WIDTH} from '../config/types';
import {rng} from '../lib/anim';

export type TransitionKind = 'iris' | 'blink' | 'glitch' | 'wipe' | 'pulse' | 'cut';
export type TransitionSpec = {kind: TransitionKind; x?: number; y?: number; frames?: number};

/**
 * Story-motivated transitions. `amount` 0 = scene fully visible, 1 = fully black.
 *  - iris: the world closes down to a point of attention (a head, an eye)
 *  - blink: eyelids close/open
 *  - glitch: tape-slice dropouts (memory / rewind)
 *  - wipe: a slow soft edge of darkness
 *  - pulse: a heartbeat dip
 */
export const Transition: React.FC<{spec: TransitionSpec; amount: number; frame: number}> = ({spec, amount, frame}) => {
  if (amount <= 0.001 || spec.kind === 'cut') return null;
  const W = WIDTH;
  const H = HEIGHT;
  const black = '#000';
  switch (spec.kind) {
    case 'iris': {
      const cx = spec.x ?? W / 2;
      const cy = spec.y ?? H / 2;
      const r = Math.pow(1 - amount, 1.6) * 1500;
      const hole = r > 0.5 ? `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z` : '';
      return (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <path d={`M0 0H${W}V${H}H0Z ${hole}`} fill={black} fillRule="evenodd" />
          {r > 0.5 && r < 1200 ? <circle cx={cx} cy={cy} r={r} fill="none" stroke="#b2403d" strokeWidth={2} opacity={0.6} /> : null}
        </svg>
      );
    }
    case 'blink': {
      const lid = amount * (H / 2 + 60);
      const bulge = 90 * (1 - Math.abs(amount * 2 - 1) * 0.0) * Math.min(1, amount * 2);
      return (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <path d={`M0 0 H${W} V${lid} Q ${W / 2} ${lid + bulge} 0 ${lid} Z`} fill={black} />
          <path d={`M0 ${H} H${W} V${H - lid} Q ${W / 2} ${H - lid - bulge} 0 ${H - lid} Z`} fill={black} />
        </svg>
      );
    }
    case 'glitch': {
      const f = Math.floor(frame / 2);
      const r = rng(f * 131 + 7);
      const bars = Array.from({length: 18}, (_, i) => {
        const y = r() * H;
        const h = 20 + r() * 120;
        const on = r() < amount * 1.15;
        const dx = (r() - 0.5) * 260 * amount;
        return on ? <rect key={i} x={dx} y={y} width={W} height={h} fill={black} /> : null;
      });
      return (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          {amount > 0.96 ? <rect width={W} height={H} fill={black} /> : bars}
          {amount > 0.15 ? <rect x={0} y={r() * H} width={W} height={2} fill="#b2403d" opacity={0.7} /> : null}
        </svg>
      );
    }
    case 'wipe': {
      const x = -400 + amount * (W + 800);
      return (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <defs>
            <linearGradient id="wipe-g" x1="0" x2="1">
              <stop offset="0" stopColor={black} stopOpacity="1" />
              <stop offset="1" stopColor={black} stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x={-W} y={0} width={W + x - 400} height={H} fill={black} />
          <rect x={x - 400 - 0.5} y={0} width={400} height={H} fill="url(#wipe-g)" />
        </svg>
      );
    }
    case 'pulse':
    default:
      return <div style={{position: 'absolute', inset: 0, background: black, opacity: amount}} />;
  }
};
