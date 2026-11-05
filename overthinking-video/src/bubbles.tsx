import React from 'react';
import {
  CREAM, FPS, FREEZE_T, INK, Vec, WARM, blobPath, clamp01, easeOutBack, lerp, rand, smooth,
} from './utils';
import {Font} from './font';

export const MAIN_THOUGHT = "What if they think I'm weird?";

const THOUGHTS = [
  'Did I say that wrong?', 'They hate me', 'Why did I say that?', 'What if I fail?',
  'Everyone noticed', "I'm so awkward", 'What if…', "Should've said…",
  "They're judging me", 'Stupid.', 'Why am I like this?', 'Replay it again',
  'Do they like me?', 'What did that look mean?', '?', '?!', '…', 'Not good enough',
  'What if they leave?', 'I ruined it', 'Was that rude?', 'They think I\'m weird',
  'Again…', 'What will they think?',
];

type Bubble = {
  id: number; spawn: number; off: Vec; text: string; fs: number; base: number;
  front: boolean; seed: number; rotBase: number; maxGrow: number;
};

const N = 48;
export const BUBBLES: Bubble[] = Array.from({length: N}, (_, i) => {
  const u = i / (N - 1);
  const front = i >= 20 && i % 2 === 0;
  const spawn = 2.0 + 3.6 * Math.pow(u, 1.7); // spawn faster and faster
  const ang = i * 2.39996 + rand(i + 3) * 0.5;
  const dist = front ? 250 + 260 * rand(i + 9) : 210 + 430 * Math.sqrt(rand(i + 5));
  const text = i % 9 === 4 ? MAIN_THOUGHT : (THOUGHTS[(i * 7) % THOUGHTS.length] as string);
  const short = text.length <= 3;
  return {
    id: i, spawn, text, front,
    off: {x: Math.cos(ang) * dist * 1.5, y: Math.sin(ang) * dist * 0.88},
    fs: short ? 76 : 32,
    base: 0.75 + rand(i + 21) * 0.4,
    seed: i * 13.7,
    rotBase: (rand(i + 33) - 0.5) * 12,
    maxGrow: front ? 1.9 : 1.55,
  };
});

const Tail: React.FC<{from: Vec; to: Vec; rx: number; ry: number; s: number}> = ({from, to, rx, ry, s}) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const edge = (rx * ry) / Math.sqrt((ry * ux) ** 2 + (rx * uy) ** 2);
  if (edge + 90 > len) return null;
  return (
    <g>
      {[{d: 20, r: 13}, {d: 46, r: 8}].map(({d, r}) => (
        <circle
          key={d}
          cx={from.x + ux * (edge + d * s)}
          cy={from.y + uy * (edge + d * s)}
          r={r * Math.min(s, 1.4)}
          fill={CREAM}
          stroke={INK}
          strokeWidth={4.5}
        />
      ))}
    </g>
  );
};

export const BubbleLayer: React.FC<{tc: number; head: Vec; front: boolean}> = ({tc, head, front}) => {
  return (
    <g>
      {BUBBLES.filter((b) => b.front === front && tc > b.spawn).map((b) => {
        const local = tc - b.spawn;
        const pop = easeOutBack(clamp01(local / 0.4));
        const grow = smooth(clamp01(local / 3.5));
        const freq = 1.2 + tc * 0.5;
        const pulse = 1 + (0.015 + 0.012 * tc) * Math.sin(tc * (4 + tc * 2) + b.seed);
        const s = b.base * pop * lerp(0.7, b.maxGrow, grow) * pulse;
        const inward = 1 - 0.28 * grow;
        const pos: Vec = {
          x: head.x + b.off.x * inward + Math.sin(tc * freq + b.seed) * 14,
          y: head.y + b.off.y * inward + Math.cos(tc * freq * 0.8 + b.seed) * 12,
        };
        const rotate = b.rotBase + Math.sin(tc * freq + b.seed * 2) * 3;
        const w = Math.max(120, b.text.length * b.fs * 0.43 + 84);
        const h = b.fs * 2.1;
        const rx = w / 2;
        const ry = h / 2;
        const path = blobPath(rx, ry, b.seed);
        return (
          <g key={b.id}>
            <Tail from={pos} to={head} rx={rx * s} ry={ry * s} s={s} />
            <g transform={`translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)}) rotate(${rotate.toFixed(2)}) scale(${s.toFixed(3)})`}>
              <path d={path} fill={WARM} opacity={0.5} transform="translate(7 9)" />
              <path d={path} fill={CREAM} stroke={INK} strokeWidth={5.5 / Math.max(s, 0.5)} strokeLinejoin="round" />
              <text
                textAnchor="middle" dy="0.35em" fontSize={b.fs}
                fontFamily={Font} fill={INK}
              >
                {b.text}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};

/** The first, small speech bubble above the head. */
export const SpeechBubble: React.FC<{tc: number; head: Vec; o: number}> = ({tc, head, o}) => {
  const appear = 1.1;
  if (tc < appear) return null;
  const pop = easeOutBack(clamp01((tc - appear) / 0.45));
  const cx = 930;
  const cy = 258;
  const w = 660;
  const h = 124;
  const sc = pop * (1 + 0.06 * o + 0.015 * Math.sin(tc * (3 + o * 12)));
  const tilt = Math.sin(tc * (2 + o * 10)) * (0.6 + o * 2.2);
  const tip: Vec = {x: head.x + 12, y: head.y - 62};
  return (
    <g transform={`translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) scale(${sc.toFixed(3)}) rotate(${tilt.toFixed(2)}) translate(${(-tip.x).toFixed(1)} ${(-tip.y).toFixed(1)})`}>
      <rect x={cx - w / 2 + 8} y={cy - h / 2 + 10} width={w} height={h} rx={44} fill={WARM} opacity={0.5} />
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={44} fill={CREAM} stroke={INK} strokeWidth={7} />
      <path d={`M${cx - 70} ${cy + h / 2 - 4} L${tip.x} ${tip.y} L${cx - 10} ${cy + h / 2 - 4} Z`} fill={CREAM} />
      <path
        d={`M${cx - 70} ${cy + h / 2 + 2} L${tip.x} ${tip.y} L${cx - 10} ${cy + h / 2 + 2}`}
        fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round"
      />
      <text x={cx} y={cy} textAnchor="middle" dy="0.35em" fontSize={50} fontFamily={Font} fill={INK}>
        {MAIN_THOUGHT}
      </text>
    </g>
  );
};

export const SPAWN_END = FREEZE_T * FPS;
