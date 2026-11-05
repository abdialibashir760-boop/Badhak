import React from 'react';
import {clamp, easeInOut, easeOut, easeOutBack, lerp, rng, seg} from '../lib/anim';
import {walkPose} from '../lib/pose';
import type {SceneProps} from '../scenes/types';
import {Eli, ELI} from '../five/Eli';
import {LUST_BEATS, LUST_CAPTIONS, LUST_STARTS} from './config';

const SANS = "'Inter', system-ui, sans-serif";
const PINK = '#FF3D81';
const GOLD = '#FFB703';
const VIOLET = '#8B5CF6';
const RED = '#E5383B';
const WHITE = '#F4F7FA';
const COL: Record<string, string> = {pink: PINK, gold: GOLD, violet: VIOLET, red: RED, white: WHITE};
const BG: Record<string, [string, string]> = {
  night: ['#0B0714', '#2A0F3A'],
  crimson: ['#1A0510', '#6B1030'],
  violet: ['#0F0828', '#3B1A7A'],
  paper: ['#E8D5B0', '#F4E7C8'],
  warm: ['#2A0F1A', '#FF8A5C'],
};

type P = Record<string, unknown>;
type TplArgs = {l: number; d: number; t: number; frame: number; p: P};
type Tpl = (a: TplArgs) => React.ReactNode;

const Txt: React.FC<{x: number; y: number; size?: number; color?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; o?: number; spacing?: number; rot?: number; children: React.ReactNode}> = ({x, y, size = 64, color = WHITE, weight = 800, anchor = 'middle', o = 1, spacing = 0, rot = 0, children}) => (
  <text x={x} y={y} fontFamily={SANS} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor} opacity={o} letterSpacing={spacing} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
    {children}
  </text>
);

const pop = (l: number, at: number, dur = 0.35) => easeOutBack(clamp((l - at) / dur));
const heart = (s: number) => `M 0,${s * 0.35} C ${-s},${-s * 0.2} ${-s * 0.5},${-s} 0,${-s * 0.4} C ${s * 0.5},${-s} ${s},${-s * 0.2} 0,${s * 0.35} Z`;

/* ---------------------------------------------------------------- kinetic words */
const kinetic: Tpl = ({l, d, p}) => {
  const words = p.words as string[];
  const size = (p.size as number) ?? 200;
  const hl = (p.hl as number[]) ?? [];
  const step = Math.max(0.28, (d - 0.5) / words.length);
  const fs = words.map((w) => Math.min(size, 1760 / (0.6 * w.length)));
  const total = fs.reduce((a, b) => a + b * 0.98, 0);
  let y = 540 - total / 2;
  const flash = words.reduce((m, _, i) => Math.max(m, 1 - clamp((l - i * step) / 0.12)), 0);
  const shake = (p.shake as number) ? Math.sin(l * 90) * 6 * (1 - seg(l, 0, 1.2)) : 0;
  return (
    <g transform={`translate(${shake},0)`}>
      <rect x={-400} y={-300} width={2720} height={1700} fill="#fff" opacity={0.1 * flash} />
      {words.map((w, i) => {
        const f = fs[i];
        y += f * 0.98;
        const a = i * step;
        const k = pop(l, a, 0.28);
        const sc = lerp(1.6, 1, clamp(k));
        const col = hl.includes(i) ? (i % 2 ? GOLD : PINK) : WHITE;
        return (
          <g key={i} opacity={clamp((l - a) / 0.08)} transform={`translate(960,${y - f * 0.2}) scale(${sc})`}>
            <text fontFamily={SANS} fontWeight={900} fontSize={f} textAnchor="middle" fill={col} stroke="#05020A" strokeWidth={f * 0.04} paintOrder="stroke">{w}</text>
          </g>
        );
      })}
    </g>
  );
};

/* ---------------------------------------------------------------- stamp / strike */
const stamp: Tpl = ({l, p}) => {
  const k = easeOut(clamp((l - 0.5) / 0.18));
  const shake = l > 0.5 && l < 0.8 ? Math.sin(l * 140) * 14 : 0;
  return (
    <g transform={`translate(${shake},0)`}>
      <Txt x={960} y={250} size={70} color="#5A3A20" weight={700} spacing={14} o={seg(l, 0, 0.4)}>{p.sub as string}</Txt>
      <g transform={`translate(960,640) rotate(-8) scale(${lerp(3.2, 1, k)})`} opacity={k}>
        <rect x={-520} y={-250} width={1040} height={420} rx={20} fill="none" stroke={RED} strokeWidth={26} />
        <Txt x={0} y={100} size={400} color={RED} weight={900}>{p.word as string}</Txt>
      </g>
      {Array.from({length: 7}, (_, i) => (
        <line key={i} x1={100 + i * 280} y1={0} x2={150 + i * 270} y2={1080} stroke="#8A6A40" strokeWidth={2} opacity={0.15} />
      ))}
    </g>
  );
};
const strike: Tpl = ({l, p}) => {
  const line = seg(l, 0.5, 1.0, easeOut);
  const flash = 1 - clamp((l - 3.0) / 0.15);
  return (
    <g>
      <rect x={-400} y={-300} width={2720} height={1700} fill="#fff" opacity={0.18 * flash * (l > 3 ? 1 : 0)} />
      <Txt x={960} y={420} size={340} color={RED} weight={900} o={1 - seg(l, 1.2, 1.8) * 0.6}>{p.from as string}</Txt>
      <rect x={380} y={330} width={1160 * line} height={26} fill={WHITE} />
      <Txt x={960} y={760} size={70} color={WHITE} weight={600} spacing={8} o={seg(l, 1.3, 1.8) * (1 - seg(l, 2.8, 3.1))}>SCIENTISTS CALL IT SOMETHING ELSE…</Txt>
      <g transform={`translate(960,820) scale(${lerp(2, 1, pop(l, 3.0, 0.3))})`} opacity={seg(l, 3.0, 3.1)}>
        <Txt x={0} y={0} size={250} color={GOLD} weight={900}>{p.to as string}</Txt>
      </g>
    </g>
  );
};

/* ---------------------------------------------------------------- icons */
const Icon: React.FC<{kind: string; l: number}> = ({kind, l}) => {
  if (kind === 'bolt') return <path d="M 20,-190 L -90,20 L -10,20 L -40,190 L 100,-40 L 10,-40 Z" fill={GOLD} stroke="#05020A" strokeWidth={8} />;
  if (kind === 'eye')
    return (
      <g>
        <path d="M -200,0 Q 0,-170 200,0 Q 0,170 -200,0 Z" fill={WHITE} stroke="#05020A" strokeWidth={8} />
        <circle cx={Math.sin(l * 3) * 40} r={70} fill={PINK} />
        <circle cx={Math.sin(l * 3) * 40} r={30} fill="#05020A" />
      </g>
    );
  if (kind === 'hourglass')
    return (
      <g stroke="#05020A" strokeWidth={8}>
        <path d="M -110,-180 L 110,-180 L 20,0 L 110,180 L -110,180 L -20,0 Z" fill={WHITE} opacity={0.9} />
        <path d={`M -90,-160 L 90,-160 L ${lerp(0, 8, (l * 0.4) % 1)},-20 Z`} fill={GOLD} stroke="none" />
        <rect x={-6} y={-20} width={12} height={170} fill={GOLD} stroke="none" opacity={0.8} />
      </g>
    );
  return (
    <g>
      <circle cx={-90} r={90} fill="none" stroke={PINK} strokeWidth={30} />
      <circle cx={90} r={90} fill="none" stroke={GOLD} strokeWidth={30} />
    </g>
  );
};
const number: Tpl = ({l, p}) => {
  const k = pop(l, 0.1, 0.4);
  const label = p.label as string;
  const shown = label.slice(0, Math.floor(clamp((l - 0.5) / 0.7) * label.length));
  return (
    <g>
      <g transform={`translate(520,520) scale(${k})`}>
        <circle r={290 + 14 * Math.sin(l * 8)} fill="none" stroke={PINK} strokeWidth={6} opacity={0.4} />
        <circle r={260} fill={PINK} />
        <Txt x={0} y={100} size={300} color="#fff" weight={900}>{p.n as string}</Txt>
      </g>
      <g transform={`translate(1380,360) scale(${pop(l, 0.3, 0.4) * 1.1})`}>
        <Icon kind={p.icon as string} l={l} />
      </g>
      <Txt x={1250} y={840} size={78} anchor="middle" color={WHITE} weight={900}>{shown}</Txt>
    </g>
  );
};

/* ---------------------------------------------------------------- two systems */
const twosys: Tpl = ({l, frame}) => {
  const a = pop(l, 0.2, 0.4);
  const b = pop(l, 2.4, 0.4);
  const c = seg(l, 3.6, 4.0);
  return (
    <g>
      <g transform={`translate(480,470) scale(${a})`}>
        <circle r={230} fill={PINK} opacity={0.25 + 0.15 * Math.sin(frame / 4)} />
        <path d="M -120,0 L 90,0 M 20,-80 L 110,0 L 20,80" stroke={PINK} strokeWidth={40} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Txt x={0} y={340} size={110} color={PINK}>WANTING</Txt>
      </g>
      <g transform={`translate(1440,470) scale(${b})`}>
        <circle r={150} fill={GOLD} opacity={0.3} />
        <path d="M -70,10 Q 0,100 70,10" stroke={GOLD} strokeWidth={30} fill="none" strokeLinecap="round" />
        <circle cx={-50} cy={-40} r={16} fill={GOLD} />
        <circle cx={50} cy={-40} r={16} fill={GOLD} />
        <Txt x={0} y={340} size={110} color={GOLD}>ENJOYING</Txt>
      </g>
      <rect x={955} y={120 * (1 - c)} width={10} height={840 * c} fill={WHITE} opacity={0.6} />
      <Txt x={960} y={960} size={74} o={seg(l, 3.9, 4.3)} spacing={6}>TWO DIFFERENT SYSTEMS</Txt>
      <Txt x={960} y={1040} size={44} o={seg(l, 4.6, 5.0)} color={VIOLET} spacing={10}>IN YOUR BRAIN</Txt>
    </g>
  );
};

/* ---------------------------------------------------------------- brain */
const BrainShape: React.FC<{glow: number; frame: number; scale?: number}> = ({glow, frame, scale = 1}) => {
  const r = rng(5);
  const nodes = Array.from({length: 22}, () => ({x: (r() - 0.5) * 520, y: (r() - 0.5) * 320}));
  return (
    <g transform={`scale(${scale})`}>
      <path d="M -330,40 C -400,-170 -170,-260 0,-200 C 170,-260 400,-170 330,40 C 360,200 140,260 0,200 C -140,260 -360,200 -330,40 Z" fill="#1B1030" stroke={VIOLET} strokeWidth={10} />
      <path d="M 0,-200 C 20,-60 -20,60 0,200" stroke={VIOLET} strokeWidth={6} fill="none" opacity={0.6} />
      {nodes.map((n, i) => {
        const on = Math.sin(frame / 3 + i * 1.7) > 1 - glow * 1.3;
        return (
          <g key={i}>
            {i > 0 ? <line x1={nodes[i - 1].x} y1={nodes[i - 1].y} x2={n.x} y2={n.y} stroke={VIOLET} strokeWidth={2} opacity={0.4} /> : null}
            <circle cx={n.x} cy={n.y} r={on ? 18 : 8} fill={on ? PINK : VIOLET} opacity={on ? 1 : 0.6} />
          </g>
        );
      })}
    </g>
  );
};
const brain: Tpl = ({l, frame, p}) => {
  const mode = p.mode as string;
  if (mode === 'dopamine') {
    return (
      <g>
        <g transform="translate(700,520)"><BrainShape glow={0.6} frame={frame} /></g>
        {Array.from({length: 14}, (_, i) => {
          const x = 1060 + ((i * 160 + l * 520) % 900);
          return <circle key={i} cx={x} cy={520 + Math.sin(i * 2) * 120} r={18 + (i % 3) * 6} fill={GOLD} opacity={0.9} />;
        })}
        <Txt x={1300} y={300} size={120} color={GOLD} o={pop(l, 0.2, 0.3)}>DOPAMINE</Txt>
        <Txt x={960} y={980} size={70} color={WHITE} o={seg(l, 1.0, 1.4)} spacing={6}>THE “WANTING” CHEMICAL</Txt>
      </g>
    );
  }
  return (
    <g>
      <g transform={`translate(960,500) scale(${1 + 0.04 * Math.sin(frame / 4)})`}><BrainShape glow={1} frame={frame} scale={1.25} /></g>
      {Array.from({length: 6}, (_, i) => {
        const a = pop(l, 0.1 + i * 0.25, 0.25);
        const x = 240 + ((i * 337) % 1440);
        const y = 160 + ((i * 211) % 700);
        return (
          <g key={i} transform={`translate(${x},${y}) scale(${a})`} opacity={0.95}>
            <path d={heart(60)} fill={PINK} />
          </g>
        );
      })}
      <Txt x={960} y={1000} size={80} o={seg(l, 0.3, 0.7)}>EVERY PROMISE LIGHTS IT UP</Txt>
    </g>
  );
};

/* ---------------------------------------------------------------- chase */
const chase: Tpl = ({l, frame, p}) => {
  const mode = p.mode as string;
  const speed = 900;
  const orbX = mode === 'chase' ? 1350 + 40 * Math.sin(l * 5) : 1100 + l * 130;
  const figX = mode === 'chase' ? 560 : 540 + l * 40;
  const pose = mode === 'chase' ? walkPose(l * 520, {...ELI.stand, lean: 12}, 1.3) : {...ELI.stand, lean: 14, aU: 100, aF: 92, bU: 85, bF: 85};
  return (
    <g>
      {Array.from({length: 14}, (_, i) => (
        <line key={i} x1={((i * 220 - l * speed) % 2640 + 2640) % 2640 - 360} y1={900 + (i % 3) * 22} x2={((i * 220 - l * speed) % 2640 + 2640) % 2640 - 160} y2={900 + (i % 3) * 22} stroke={WHITE} strokeWidth={4} opacity={0.25} />
      ))}
      <rect x={0} y={900} width={1920} height={6} fill={PINK} opacity={0.6} />
      <g transform={`translate(${orbX},${540 + Math.sin(l * 4) * 26})`}>
        <circle r={150} fill={PINK} opacity={0.22} />
        <circle r={96} fill={PINK} opacity={0.5} />
        <circle r={56} fill={GOLD} />
        {Array.from({length: 8}, (_, i) => <line key={i} x1={0} y1={-110} x2={0} y2={-150 - 14 * Math.sin(frame / 4 + i)} stroke={GOLD} strokeWidth={6} transform={`rotate(${i * 45 + frame * 2})`} />)}
      </g>
      <Eli x={figX} y={900} scale={1.7} facing={1} pose={pose} frame={frame} rim={PINK} glint={1} />
      <Txt x={960} y={170} size={96} color={WHITE} o={pop(l, 0.15, 0.3)}>{p.label as string}</Txt>
    </g>
  );
};

const spark: Tpl = ({l, d, frame, p}) => {
  const grow = seg(l, 0.2, 0.6, easeOut) * (1 - seg(l, d * 0.55, d - 0.2));
  return (
    <g>
      <g transform="translate(960,470)">
        {Array.from({length: 14}, (_, i) => (
          <line key={i} x1={0} y1={-50 * grow} x2={0} y2={-(90 + 60 * ((i * 7) % 5) / 5 + 12 * Math.sin(frame / 2 + i)) * grow} stroke={GOLD} strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * (360 / 14)})`} />
        ))}
        <circle r={40 * grow} fill={GOLD} />
      </g>
      <Txt x={960} y={900} size={84} o={seg(l, 0.3, 0.7)}>{p.label as string}</Txt>
    </g>
  );
};

/* ---------------------------------------------------------------- compare bars */
const compare: Tpl = ({l, p}) => {
  const [al, av, ac] = p.a as [string, number, string];
  const [bl, bv, bc] = p.b as [string, number, string];
  const ga = easeOutBack(clamp((l - 0.2) / 0.8));
  const gb = easeOutBack(clamp((l - 0.9) / 0.7));
  const H = 600;
  const bar = (x: number, v: number, g: number, col: string, label: string) => (
    <g>
      <rect x={x - 170} y={880 - H} width={340} height={H} rx={18} fill="#ffffff" opacity={0.08} />
      <rect x={x - 170} y={880 - H * v * g} width={340} height={H * v * g} rx={18} fill={COL[col]} />
      <Txt x={x} y={980} size={label.length > 12 ? 48 : 64} color={COL[col]} o={clamp(g)}>{label}</Txt>
    </g>
  );
  return (
    <g>
      <Txt x={960} y={150} size={92} o={pop(l, 0, 0.3)}>{p.title as string}</Txt>
      {bar(520, av, ga, ac, al)}
      {bar(1400, bv, gb, bc, bl)}
    </g>
  );
};

/* ---------------------------------------------------------------- carrot */
const carrot: Tpl = ({l, frame, p}) => {
  const pose = walkPose(l * 520, {...ELI.stand, lean: 10, aU: 80, aF: 70}, 1.1);
  const bob = Math.sin(l * 6) * 10;
  return (
    <g>
      {Array.from({length: 12}, (_, i) => <line key={i} x1={((i * 240 - l * 700) % 2880 + 2880) % 2880 - 400} y1={910} x2={((i * 240 - l * 700) % 2880 + 2880) % 2880 - 200} y2={910} stroke={WHITE} strokeWidth={4} opacity={0.25} />)}
      <Eli x={620} y={900} scale={1.8} pose={pose} frame={frame} rim={PINK} />
      <line x1={860} y1={600} x2={1360} y2={500 + bob} stroke={WHITE} strokeWidth={8} />
      <g transform={`translate(1380,${510 + bob}) rotate(70)`}>
        <path d="M 0,-26 L 110,0 L 0,26 Z" fill={GOLD} />
        <path d="M 0,-4 l -30,-28 l 22,0 M 0,0 l -34,-8 l 14,24" stroke="#6BCB77" strokeWidth={10} fill="none" strokeLinecap="round" />
      </g>
      <Txt x={960} y={170} size={78} o={seg(l, 0.1, 0.5)}>{p.label as string}</Txt>
    </g>
  );
};

/* ---------------------------------------------------------------- phone / cards */
const feedCard = (i: number) => [PINK, GOLD, VIOLET, '#2EC4B6', '#FF6B6B'][i % 5];
const phone: Tpl = ({l, p}) => (
  <g>
    <g transform="translate(960,490) rotate(-6) scale(0.86)">
      <rect x={-210} y={-420} width={420} height={840} rx={60} fill="#05020A" stroke={WHITE} strokeWidth={6} />
      <clipPath id="lp"><rect x={-190} y={-400} width={380} height={800} rx={44} /></clipPath>
      <g clipPath="url(#lp)">
        {Array.from({length: 6}, (_, i) => {
          const y = -400 + i * 300 - ((l * 900) % 300);
          return (
            <g key={i}>
              <rect x={-170} y={y} width={340} height={270} rx={26} fill={feedCard(i + Math.floor((l * 900) / 300))} opacity={0.85} />
              <circle cx={-120} cy={y + 50} r={24} fill="#fff" opacity={0.7} />
            </g>
          );
        })}
      </g>
    </g>
    {Array.from({length: 9}, (_, i) => {
      const k = (l * 1.6 + i * 0.37) % 1;
      const x = 460 + ((i * 331) % 1000) + (i % 2) * 400;
      return (
        <g key={i} transform={`translate(${x},${860 - k * 700}) scale(${0.7 + k * 0.5})`} opacity={1 - k}>
          <path d={heart(50)} fill={PINK} />
        </g>
      );
    })}
    <Txt x={960} y={1010} size={72} o={seg(l, 0.1, 0.4)}>{p.label as string}</Txt>
  </g>
);
const cards: Tpl = ({l, frame, p}) => {
  const kind = p.kind as string;
  return (
    <g>
      <Txt x={960} y={150} size={104} color={WHITE} o={pop(l, 0, 0.25)}>{p.label as string}</Txt>
      {kind === 'photos' &&
        Array.from({length: 20}, (_, i) => {
          const x = 280 + (i % 5) * 340;
          const y = 270 + Math.floor(i / 5) * 190;
          const flip = Math.abs(Math.cos((l * 2.2 + i * 0.3) * Math.PI));
          return <rect key={i} x={x - 150 * flip} y={y} width={300 * flip} height={170} rx={16} fill={feedCard(i + Math.floor(l * 2.2 + i * 0.3))} opacity={0.9} />;
        })}
      {kind === 'profiles' &&
        Array.from({length: 5}, (_, i) => {
          const k = (l * 2.2 + i * 0.5) % 2.5;
          const gone = clamp((k - 1) / 1.2);
          const dir = i % 2 ? 1 : -1;
          return (
            <g key={i} transform={`translate(${960 + dir * gone * 1400},${600 + i * 6}) rotate(${dir * gone * 40 + (i - 2) * 2})`} opacity={1 - gone * 0.5}>
              <rect x={-230} y={-330} width={460} height={620} rx={36} fill={feedCard(i)} stroke="#05020A" strokeWidth={6} />
              <circle cy={-120} r={110} fill="#05070D" />
              <rect x={-170} y={60} width={340} height={26} rx={13} fill="#fff" opacity={0.85} />
              <rect x={-170} y={110} width={220} height={20} rx={10} fill="#fff" opacity={0.6} />
            </g>
          );
        })}
      {kind === 'videos' &&
        [0, 1, 2].map((r) =>
          Array.from({length: 4}, (_, i) => {
            const x = ((i * 520 + (r % 2 ? 1 : -1) * l * 380) % 2080 + 2080) % 2080 - 240;
            return (
              <g key={`${r}${i}`} transform={`translate(${x},${330 + r * 230})`}>
                <rect width={460} height={200} rx={20} fill={feedCard(i + r)} opacity={0.9} />
                <path d="M 190,60 L 290,100 L 190,140 Z" fill="#fff" opacity={0.95} />
              </g>
            );
          }),
        )}
      <rect x={0} y={0} width={1920} height={1080} fill="#fff" opacity={0.05 * Math.sin(frame * 1.3) } />
    </g>
  );
};

/* ---------------------------------------------------------------- promise / feast / meter */
const promise: Tpl = ({l, frame}) => {
  const items = Array.from({length: 12}, (_, i) => i);
  return (
    <g>
      {items.map((i) => {
        const k = (l * 0.9 + i * 0.5) % 6;
        const x = 2000 - k * 420;
        const wob = Math.sin(l * 9 + i) * 6;
        return (
          <g key={i} transform={`translate(${x},${560 + wob}) rotate(${Math.sin(l * 3 + i) * 5})`}>
            <rect x={-90} y={-30} width={180} height={140} rx={12} fill={feedCard(i)} />
            <rect x={-100} y={-70} width={200} height={50} rx={10} fill={feedCard(i)} stroke="#05020A" strokeWidth={5} />
            <rect x={-14} y={-70} width={28} height={180} fill="#fff" opacity={0.9} />
            <path d="M 0,-70 q -50,-70 -70,-20 q 30,20 70,20 q 40,0 70,-20 q -20,-50 -70,20 Z" fill="#fff" opacity={0.9} />
          </g>
        );
      })}
      <Txt x={960} y={170} size={92} o={seg(l, 0.1, 0.4)}>A TINY PROMISE…</Txt>
      <g transform={`translate(${900 + Math.sin(frame / 5) * 30},880)`} opacity={seg(l, 1.4, 1.8)}>
        <path d="M -220,0 L 180,0 M 100,-60 L 190,0 L 100,60" stroke={WHITE} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Txt x={0} y={140} size={80} color={GOLD}>ONE SWIPE AWAY</Txt>
      </g>
    </g>
  );
};
const feast: Tpl = ({l}) => {
  const a = pop(l, 0.2, 0.4);
  const b = pop(l, 1.0, 0.4);
  const x = seg(l, 1.6, 1.9, easeOut);
  return (
    <g>
      <g transform={`translate(480,560) scale(${a})`}>
        <ellipse cx={0} cy={80} rx={230} ry={50} fill={WHITE} opacity={0.85} />
        <path d={heart(36)} fill={PINK} transform="translate(0,40)" />
        <Txt x={0} y={260} size={90} color={PINK}>PROMISE</Txt>
      </g>
      <g transform={`translate(1440,560) scale(${b})`}>
        <ellipse cx={0} cy={110} rx={340} ry={70} fill={WHITE} opacity={0.85} />
        {[-190, -90, 10, 120, 210].map((fx, i) => <circle key={i} cx={fx} cy={30 - (i % 2) * 40} r={56 - (i % 3) * 8} fill={[GOLD, PINK, '#6BCB77', RED, VIOLET][i]} />)}
        <Txt x={0} y={260} size={90} color={GOLD}>FEAST</Txt>
      </g>
      <Txt x={960} y={600} size={260} color={RED} o={x} weight={900}>≠</Txt>
    </g>
  );
};
const meter: Tpl = ({l, frame}) => {
  const level = 0.5 + 0.3 * Math.sin(l * 2.4);
  const drops = Array.from({length: 6}, (_, i) => (l * 1.6 + i / 6) % 1);
  return (
    <g>
      <g transform="translate(560,560)">
        <path d="M -190,-330 L 190,-330 L 150,330 L -150,330 Z" fill="none" stroke={WHITE} strokeWidth={10} />
        <clipPath id="gl"><path d="M -185,-326 L 185,-326 L 146,326 L -146,326 Z" /></clipPath>
        <g clipPath="url(#gl)">
          <rect x={-200} y={330 - 650 * level} width={400} height={650 * level} fill={PINK} opacity={0.85} />
        </g>
        <circle cx={0} cy={330} r={14} fill="#05020A" />
        {drops.map((k, i) => <circle key={i} cx={Math.sin(i) * 4} cy={344 + k * 320} r={10} fill={PINK} opacity={1 - k} />)}
      </g>
      <g transform="translate(1340,560)">
        {Array.from({length: 5}, (_, i) => {
          const y = -330 + i * 190 - ((l * 700) % 190);
          return <rect key={i} x={-200} y={y} width={400} height={150} rx={22} fill={feedCard(i + Math.floor((l * 700) / 190))} opacity={0.85} />;
        })}
      </g>
      <Txt x={960} y={130} size={100} o={seg(l, 0.2, 0.6)}>SCROLL. WANT. REPEAT.</Txt>
      <Txt x={960} y={1030} size={90} color={GOLD} o={seg(l, 2.2, 2.6) * (Math.sin(frame / 3) > -0.3 ? 1 : 0.4)}>NEVER FULL</Txt>
    </g>
  );
};

/* ---------------------------------------------------------------- two figures, curves */
const twofig: Tpl = ({l, frame, p}) => {
  const bubble = pop(l, 1.0, 0.4);
  return (
    <g>
      <Eli x={640} y={880} scale={1.9} facing={1} pose={ELI.stand} frame={frame} rim={PINK} />
      <Eli x={1280} y={880} scale={1.9} facing={-1} pose={ELI.stand} frame={frame} rim={GOLD} />
      <g transform={`translate(960,${430 - bubble * 0})  scale(${bubble})`}>
        <circle r={120} fill={PINK} opacity={0.3} />
        <path d={heart(80)} fill={PINK} transform="translate(0,10)" />
      </g>
      <g transform={`translate(640,170) scale(${pop(l, 1.4, 0.3)})`}>
        <ellipse rx={150} ry={80} fill={VIOLET} opacity={0.9} />
        <circle cx={0} cy={0} r={22 + 6 * Math.sin(frame / 3)} fill={GOLD} />
      </g>
      <Txt x={960} y={1030} size={76} o={seg(l, 0.1, 0.5)}>{p.label as string}</Txt>
    </g>
  );
};
const curve: Tpl = ({l, d, frame, p}) => {
  const mode = p.mode as string;
  const W = 1500;
  if (mode === 'anticipation') {
    const prog = seg(l, 0.1, d - 0.3, easeInOut);
    const pts = Array.from({length: 61}, (_, i) => {
      const u = i / 60;
      const y = u < 0.75 ? 780 - 520 * Math.pow(u / 0.75, 2.2) : lerp(260, 640, easeOut((u - 0.75) / 0.25));
      return [210 + u * W, y] as const;
    });
    const n = Math.floor(prog * 60);
    const path = pts.slice(0, n + 1).map((q, i) => `${i ? 'L' : 'M'} ${q[0]},${q[1]}`).join(' ');
    const head = pts[n];
    return (
      <g>
        <path d={path} stroke={PINK} strokeWidth={14} fill="none" strokeLinecap="round" />
        <circle cx={head[0]} cy={head[1]} r={22} fill={GOLD} />
        <Txt x={960} y={150} size={90}>ANTICIPATION</Txt>
        <Txt x={960} y={1010} size={52} color={GOLD} o={seg(l, d - 1.1, d - 0.7)}>THE PEAK IS BEFORE THE PRIZE</Txt>
      </g>
    );
  }
  const amp = (p.amp as number) ?? 1;
  const phase = l * 1.8;
  const path = Array.from({length: 120}, (_, i) => {
    const u = i / 119;
    const y = 560 - Math.sin(u * Math.PI * 4 - phase) * 200 * amp;
    return `${i ? 'L' : 'M'} ${210 + u * W},${y}`;
  }).join(' ');
  const dotU = (((phase * 0.25) % 1) + 1) % 1;
  const dy = 560 - Math.sin(dotU * Math.PI * 4 - phase) * 200 * amp;
  return (
    <g>
      <path d={path} stroke={PINK} strokeWidth={14} fill="none" strokeLinecap="round" />
      <circle cx={210 + dotU * W} cy={dy} r={26} fill={GOLD} />
      <Txt x={960} y={160} size={100}>CRAVINGS ARE WAVES</Txt>
      <Txt x={200} y={900} size={50} anchor="start" color={WHITE} o={0.6}>RISE</Txt>
      <Txt x={1720} y={900} size={50} anchor="end" color={WHITE} o={0.6}>FALL</Txt>
      <circle cx={960} cy={960} r={10 + 3 * Math.sin(frame / 3)} fill={GOLD} opacity={0} />
    </g>
  );
};

/* ---------------------------------------------------------------- new / fade / gears */
const newTpl: Tpl = ({l, frame}) => (
  <g>
    {Array.from({length: 14}, (_, i) => {
      const a = pop(l, 0.05 + i * 0.09, 0.3);
      const x = 160 + ((i * 487) % 1600);
      const y = 140 + ((i * 263) % 800);
      return (
        <g key={i} transform={`translate(${x},${y}) rotate(${(i - 7) * 5}) scale(${a})`}>
          <rect x={-90} y={-36} width={180} height={72} rx={36} fill={[PINK, GOLD, VIOLET][i % 3]} />
          <Txt x={0} y={14} size={44} color="#05020A">NEW</Txt>
        </g>
      );
    })}
    <g transform={`translate(960,540) scale(${1 + 0.06 * Math.sin(frame / 3)})`}>
      <Txt x={0} y={90} size={300} color={WHITE}>NEW</Txt>
    </g>
  </g>
);
const fade: Tpl = ({l, p}) => {
  void p;
  return (
    <g>
      <Txt x={960} y={150} size={90}>THE SAME SIGNAL…</Txt>
      {Array.from({length: 5}, (_, i) => {
        const on = pop(l, 0.3 + i * 0.6, 0.3);
        const strength = 1 - i * 0.22;
        return (
          <g key={i} transform={`translate(${330 + i * 330},560) scale(${on})`}>
            <path d={heart(86)} fill={PINK} opacity={strength} />
            {[0, 1, 2].map((b) => <rect key={b} x={-50 + b * 38} y={170 - 100 * strength * (0.4 + b * 0.3)} width={26} height={100 * strength * (0.4 + b * 0.3)} rx={6} fill={GOLD} opacity={0.9} />)}
          </g>
        );
      })}
      <Txt x={960} y={1010} size={90} color={GOLD} o={seg(l, 3.4, 3.8)}>…FADES</Txt>
    </g>
  );
};
const Gear: React.FC<{x: number; y: number; r: number; rot: number; color: string; teeth?: number}> = ({x, y, r, rot, color, teeth = 12}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    {Array.from({length: teeth}, (_, i) => <rect key={i} x={-r * 0.14} y={-r * 1.18} width={r * 0.28} height={r * 0.4} fill={color} transform={`rotate(${i * (360 / teeth)})`} />)}
    <circle r={r} fill={color} />
    <circle r={r * 0.45} fill="#0B0714" />
  </g>
);
const gears: Tpl = ({l, p}) => (
  <g>
    <Gear x={700} y={520} r={190} rot={l * 50} color={PINK} />
    <Gear x={1090} y={640} r={130} rot={-l * 76 + 8} color={GOLD} teeth={9} />
    <Gear x={1360} y={400} r={90} rot={l * 110} color={VIOLET} teeth={7} />
    <Txt x={960} y={160} size={84} o={seg(l, 0.1, 0.5)}>{p.label as string}</Txt>
  </g>
);

/* ---------------------------------------------------------------- versus / slider / timer / chem / energy */
const versus: Tpl = ({l, p}) => {
  const safe = Boolean(p.safe);
  const a = pop(l, 0.1, 0.35);
  const b = pop(l, safe ? 0.9 : 1.1, 0.35);
  return (
    <g>
      <g transform={`translate(520,540) scale(${a})`}>
        <circle r={260} fill={safe ? RED : PINK} opacity={0.22} />
        <Txt x={0} y={30} size={safe ? 110 : 100} color={safe ? RED : PINK}>{p.a as string}</Txt>
      </g>
      <Txt x={960} y={580} size={110} color={WHITE} o={seg(l, 0.6, 0.9)} weight={900}>{safe ? '→' : '≠'}</Txt>
      <g transform={`translate(1400,540) scale(${b})`}>
        <circle r={260} fill={GOLD} opacity={0.25} />
        {safe ? <path d="M 0,-170 L 150,-110 L 130,50 Q 100,150 0,190 Q -100,150 -130,50 L -150,-110 Z" fill="none" stroke={GOLD} strokeWidth={14} /> : null}
        <Txt x={0} y={safe ? 30 : 30} size={safe ? 120 : 100} color={GOLD}>{p.b as string}</Txt>
      </g>
    </g>
  );
};
const slider: Tpl = ({l, d}) => {
  const k = easeInOut(seg(l, 0.6, d - 0.6));
  const needle = lerp(70, -70, k);
  return (
    <g>
      <Txt x={960} y={150} size={92}>NAME IT. SLOW DOWN.</Txt>
      <g transform="translate(960,700)">
        <path d="M -380,0 A 380 380 0 0 1 380,0" stroke={WHITE} strokeWidth={30} fill="none" opacity={0.25} />
        <path d="M -380,0 A 380 380 0 0 1 380,0" stroke={PINK} strokeWidth={30} fill="none" strokeDasharray={`${1190 * (1 - k)} 2000`} />
        <line x1={0} y1={0} x2={0} y2={-330} stroke={GOLD} strokeWidth={16} strokeLinecap="round" transform={`rotate(${needle})`} />
        <circle r={36} fill={GOLD} />
        <Txt x={-380} y={90} size={50} color={PINK}>FAST</Txt>
        <Txt x={380} y={90} size={50} color={GOLD}>SLOW</Txt>
      </g>
    </g>
  );
};
const timer: Tpl = ({l, d, frame}) => {
  const k = seg(l, 0.2, d - 0.4);
  const secs = Math.round(lerp(300, 0, k));
  return (
    <g>
      <Txt x={960} y={150} size={90}>MOST PASS IN MINUTES</Txt>
      <g transform="translate(560,590)">
        <circle r={250} fill="#1B1030" stroke={WHITE} strokeWidth={14} />
        <line y2={-190} stroke={GOLD} strokeWidth={14} strokeLinecap="round" transform={`rotate(${k * 360})`} />
        <circle r={16} fill={PINK} />
        <Txt x={0} y={400} size={100} color={GOLD}>{`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`}</Txt>
      </g>
      <path d={Array.from({length: 80}, (_, i) => `${i ? 'L' : 'M'} ${1000 + i * 10},${590 - Math.sin(i / 6 - frame / 10) * 180 * (1 - k)}`).join(' ')} stroke={PINK} strokeWidth={14} fill="none" strokeLinecap="round" />
      <rect x={1000} y={600} width={790} height={6} fill={WHITE} opacity={0.3} />
    </g>
  );
};
const chem: Tpl = ({l, frame}) => {
  const words: Array<[string, number, string]> = [['CLOSENESS', 0.1, PINK], ['TRUST', 1.1, GOLD], ['ATTENTION', 1.8, VIOLET]];
  return (
    <g>
      <Eli x={520} y={900} scale={1.7} facing={1} pose={ELI.stand} frame={frame} rim={PINK} />
      <Eli x={1400} y={900} scale={1.7} facing={-1} pose={ELI.stand} frame={frame} rim={GOLD} />
      <path d="M 640,520 Q 960,380 1280,520" stroke={PINK} strokeWidth={8} fill="none" strokeDasharray="16 14" strokeDashoffset={-frame * 2} />
      {words.map(([w, at, col], i) => {
        const k = pop(l, at, 0.35);
        return (
          <g key={w} transform={`translate(${960},${250 + i * 150}) scale(${k})`}>
            <rect x={-250} y={-58} width={500} height={110} rx={55} fill={col} />
            <Txt x={0} y={20} size={62} color="#05020A">{w}</Txt>
          </g>
        );
      })}
      <g transform={`translate(960,${640}) scale(${pop(l, 2.6, 0.4) * (1 + 0.08 * Math.sin(frame / 4))})`}>
        <path d={heart(110)} fill={PINK} />
      </g>
    </g>
  );
};
const energy: Tpl = ({l, frame, p}) => {
  if (p.mode === 'bolt') {
    return (
      <g>
        <g transform={`translate(960,520) scale(${pop(l, 0.1, 0.4) * 2.4}) rotate(${Math.sin(frame / 3) * 2})`}>
          <path d="M 20,-190 L -90,20 L -10,20 L -40,190 L 100,-40 L 10,-40 Z" fill={GOLD} stroke="#05020A" strokeWidth={8} />
        </g>
        {Array.from({length: 16}, (_, i) => <line key={i} x1={960} y1={520} x2={960 + Math.cos(i) * (500 + 80 * Math.sin(frame / 2 + i))} y2={520 + Math.sin(i) * (400 + 60 * Math.sin(frame / 3 + i))} stroke={GOLD} strokeWidth={4} opacity={0.35} />)}
        <Txt x={960} y={1000} size={110} color={WHITE} o={seg(l, 0.9, 1.3)}>LUST IS ENERGY</Txt>
      </g>
    );
  }
  const conv = easeInOut(seg(l, 0.3, 1.8));
  return (
    <g>
      {Array.from({length: 9}, (_, i) => {
        const y = 200 + i * 90;
        const chaos = Math.sin(i * 3.1 + l * 7) * 220 * (1 - conv);
        return <path key={i} d={`M 160,${y + chaos} C 600,${y - chaos} 900,${540 + (y - 540) * (1 - conv)} 1420,${540 + (y - 540) * (1 - conv) * 0.2}`} stroke={i % 2 ? PINK : GOLD} strokeWidth={9} fill="none" opacity={0.85} />;
      })}
      <g transform="translate(1480,540)" opacity={seg(l, 1.2, 1.6)}>
        <path d="M 0,-110 L 220,0 L 0,110 Z" fill={WHITE} />
      </g>
      <Txt x={960} y={1010} size={100} color={WHITE} o={seg(l, 0.8, 1.2)}>GIVE IT A DIRECTION</Txt>
    </g>
  );
};

/* ---------------------------------------------------------------- closing */
const closing: Tpl = ({l, d, frame}) => {
  const walk = seg(l, 0, d - 0.8, easeInOut);
  const fig = lerp(300, 1250, walk);
  const pose = walkPose(walk * 900, {...ELI.stand, lean: 4}, 0.9);
  const fadeOut = seg(l, d - 1.2, d - 0.2);
  return (
    <g>
      <rect x={-400} y={-300} width={2720} height={1700} fill="#2A0F1A" />
      <circle cx={1500} cy={560} r={420} fill="#FF8A5C" opacity={0.35} />
      <g transform={`translate(1500,540)`}>
        <circle r={220} fill="none" stroke={GOLD} strokeWidth={26} opacity={0.5 + 0.5 * Math.sin(frame / 12)} />
        <circle r={150} fill={GOLD} opacity={0.8} />
      </g>
      <rect x={-400} y={900} width={2720} height={500} fill="#12060D" />
      <Eli x={fig} y={900} scale={1.8} pose={pose} frame={frame} rim={GOLD} />
      <Txt x={760} y={230} size={150} color={WHITE} o={seg(l, 1.8, 2.4)} weight={900}>CHOOSE.</Txt>
      <rect x={-400} y={-300} width={2720} height={1700} fill="#000" opacity={fadeOut} />
    </g>
  );
};

const TPL: Record<string, Tpl> = {kinetic, stamp, strike, number, twosys, brain, chase, spark, compare, carrot, phone, cards, promise, feast, meter, twofig, curve, new: newTpl, fade, gears, versus, slider, timer, chem, energy, closing};

const bgFor = (b: P | undefined, tpl: string) => {
  const name = (b?.bg as string) ?? (tpl === 'stamp' || tpl === 'strike' ? 'paper' : tpl === 'closing' ? 'warm' : 'night');
  return BG[name] ?? BG.night;
};

const wrap = (tpl: string, p: P | undefined, index: number): React.FC<SceneProps> => {
  const Tp = TPL[tpl];
  const paper = tpl === 'stamp';
  const Comp: React.FC<SceneProps> = ({frame, dur}) => {
    const l = frame / 30;
    const d = dur / 30;
    const [c1, c2] = bgFor(p, tpl);
    const punch = 1 + 0.04 * (l / d) + 0.05 * Math.exp(-l * 12);
    const r = rng(index + 3);
    return (
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id={`bg${index}`} cx="50%" cy="45%" r="75%">
            <stop offset="0" stopColor={c2} />
            <stop offset="1" stopColor={c1} />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill={`url(#bg${index})`} />
        {!paper
          ? Array.from({length: 24}, (_, i) => {
              const x = r() * 1920;
              const y = (r() * 1080 - l * (20 + (i % 5) * 12) + 2160) % 1080;
              return <circle key={i} cx={x} cy={y} r={2 + (i % 4)} fill={WHITE} opacity={0.12 + 0.1 * (i % 3)} />;
            })
          : null}
        <g transform={`translate(960,460) scale(${punch * 0.9}) translate(-960,-460)`}>{Tp({l, d, t: LUST_STARTS[index] + l, frame, p: p ?? {}})}</g>
        <g pointerEvents="none">
          <radialGradient id={`vv${index}`} cx="50%" cy="50%" r="75%">
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity={paper ? 0.25 : 0.5} />
          </radialGradient>
          <rect width={1920} height={1080} fill={`url(#vv${index})`} />
        </g>
      </svg>
    );
  };
  return Comp;
};

export const LUST_SCENE_COMPONENTS: React.FC<SceneProps>[] = LUST_BEATS.map((b, i) => wrap(b.tpl, b.p, i));

/** Burned-in captions: sentence cues from the recording, drawn above every scene. */
export const LustCaptions: React.FC<{frame: number; scene: number; dur: number}> = ({frame, scene}) => {
  const t = LUST_STARTS[scene] + frame / 30;
  const cue = LUST_CAPTIONS.find(([a, b]) => t >= a - 0.05 && t <= b + 0.2);
  if (!cue) return null;
  const text = cue[2];
  const w = Math.min(1700, 24 * text.length + 80);
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <rect x={960 - w / 2} y={992} width={w} height={72} rx={20} fill="#05020A" opacity={0.78} />
      <text x={960} y={1042} fontFamily={SANS} fontSize={40} fontWeight={600} fill={WHITE} textAnchor="middle">{text}</text>
    </svg>
  );
};
