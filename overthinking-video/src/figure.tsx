import React from 'react';
import {INK, PAPER, WARM, Vec, add, clamp01, lerp, mix, rot, smooth} from './utils';

export const HIPS: Vec = {x: 900, y: 686};
export const HEAD_R = 48;
const LIMB_W = 15;
const SHADE_LIMB = '#ecdcc6';

export const getPose = (tc: number) => {
  const o = smooth(clamp01((tc - 2) / 5)); // overwhelm 2s -> 7s
  const hp = smooth(clamp01((tc - 3.4) / 2.2)); // hands to head
  const breath = Math.sin(tc * Math.PI * 2 * (0.4 + o * 1.6));
  const trem = o * o * (Math.sin(tc * 47) * 1.8 + Math.sin(tc * 31) * 1.2);
  const theta = 6 + o * 22 + breath * (1 + o * 1.2);
  const shoulder = add(HIPS, rot(0, -122, theta));
  const headAng = theta + o * 14 + Math.sin(tc * 0.9) * 2 * (1 - o);
  const head = add(add(shoulder, rot(0, -64, headAng)), {x: trem, y: trem * 0.5});

  const elbowA: Vec = {x: shoulder.x + 34, y: shoulder.y + 60};
  const handA: Vec = {x: HIPS.x + 108, y: HIPS.y - 8};
  const handBN = add(head, rot(-26, -28, headAng));
  const elbowBN: Vec = {
    x: lerp(shoulder.x, handBN.x, 0.5) + 46,
    y: lerp(shoulder.y, handBN.y, 0.5) + 14,
  };
  const handBF = add(head, rot(16, -46, headAng));
  const elbowBF: Vec = {
    x: lerp(shoulder.x, handBF.x, 0.5) + 38,
    y: lerp(shoulder.y, handBF.y, 0.5) - 12,
  };
  const elbowN = mix(elbowA, elbowBN, hp);
  const handN = mix(handA, handBN, hp);
  const elbowF = mix({x: elbowA.x - 14, y: elbowA.y + 4}, elbowBF, hp);
  const handF = mix({x: handA.x - 30, y: handA.y + 6}, handBF, hp);
  return {o, hp, shoulder, head, headAng, elbowN, handN, elbowF, handF};
};

const Limb: React.FC<{pts: Vec[]; w?: number; fill?: string}> = ({pts, w = LIMB_W, fill = PAPER}) => {
  const d = 'M' + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L');
  const common = {fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <g>
      <path d={d} {...common} stroke={INK} strokeWidth={w + 13} />
      <path d={d} {...common} stroke={fill} strokeWidth={w} />
      <path d={d} {...common} stroke={WARM} strokeWidth={w * 0.34} opacity={0.55} transform="translate(-2.5 3.8)" />
    </g>
  );
};

const Face: React.FC<{tc: number; o: number}> = ({tc, o}) => {
  const worry = clamp01((tc - 1.0) / 1.2);
  const wide = smooth(clamp01((tc - 3.5) / 2.5));
  const blinkPeriod = 3.1 - o * 1.2;
  const blink = tc % blinkPeriod < 0.13 && wide < 0.6 ? 0.12 : 1;
  const px = 1.5 + Math.sin(tc * (1 + o * 6)) * (1.5 + o * 3);
  const py = -2 + Math.cos(tc * (0.8 + o * 5)) * (1 + o * 2);
  const eyeRx = lerp(6.5, 10.5, wide);
  const eyeRy = lerp(7.5, 11, wide) * blink;
  const browLift = 8 * worry + 6 * wide;
  const mouthY = 27;
  const wob = Math.sin(tc * 30) * 2.5 * o;
  const mouth =
    o > 0.65
      ? null
      : `M12 ${mouthY} Q22 ${mouthY - 4 - 14 * worry + wob} 32 ${mouthY}`;
  return (
    <g>
      {[8, 30].map((ex, i) => (
        <g key={ex}>
          <ellipse cx={ex} cy={-6} rx={eyeRx} ry={Math.max(eyeRy, 1)} fill={PAPER} stroke={INK} strokeWidth={3.5} />
          {blink > 0.5 ? <circle cx={ex + px} cy={-6 + py} r={lerp(3.8, 3.1, wide)} fill={INK} /> : null}
          <path
            d={
              i === 0
                ? `M-2 ${-22 - eyeRy * 0.3} L18 ${-22 - eyeRy * 0.3 - browLift}`
                : `M22 ${-22 - eyeRy * 0.3 - browLift} L42 ${-22 - eyeRy * 0.3}`
            }
            stroke={INK}
            strokeWidth={4.5}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ))}
      {mouth ? (
        <path d={mouth} stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none" />
      ) : (
        <ellipse cx={22} cy={28} rx={7 + wob * 0.4} ry={9 + Math.abs(wob)} fill={INK} />
      )}
    </g>
  );
};

export const Figure: React.FC<{tc: number; part: 'body' | 'arms'}> = ({tc, part}) => {
  const p = getPose(tc);
  const farLeg: Vec[] = [HIPS, {x: 994, y: 700}, {x: 996, y: 850}, {x: 1034, y: 857}];
  const nearLeg: Vec[] = [HIPS, {x: 1020, y: 692}, {x: 1030, y: 852}, {x: 1070, y: 859}];

  if (part === 'arms') {
    // near arm (in front of head)
    return <Limb pts={[p.shoulder, p.elbowN, p.handN]} />;
  }
  return (
    <g>
      <Limb pts={farLeg} fill={SHADE_LIMB} />
      <Limb pts={[p.shoulder, p.elbowF, p.handF]} fill={SHADE_LIMB} />
      <Limb pts={[HIPS, p.shoulder]} w={18} />
      <Limb pts={nearLeg} />
      <g transform={`translate(${p.head.x.toFixed(1)} ${p.head.y.toFixed(1)}) rotate(${p.headAng.toFixed(2)})`}>
        <circle r={HEAD_R} fill={WARM} />
        <circle r={HEAD_R - 1} cx={10} cy={-8} fill={PAPER} />
        <circle r={HEAD_R} fill="none" stroke={INK} strokeWidth={7.5} />
        <Face tc={tc} o={p.o} />
      </g>
    </g>
  );
};
