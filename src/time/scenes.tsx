import React from 'react';
import {clamp, easeInOut, easeOut, lerp, rng, seg} from '../lib/anim';
import {walkPose} from '../lib/pose';
import type {SceneProps} from '../scenes/types';
import {Eli, ELI} from '../five/Eli';
import {C} from '../five/palette';
import {TIME_STARTS} from './config';

const SANS = "'Inter', system-ui, sans-serif";
const NAVY = '#0B0F1A';
const GOLD = C.gold;

/** `t` is the time in the voice-over track (seconds); `l` is local to the scene. */
const scene =
  (n: number, build: (c: {frame: number; l: number; t: number; d: number}) => React.ReactNode, bg = NAVY): React.FC<SceneProps> =>
  ({frame, dur}) => {
    const l = frame / 30;
    return (
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, background: bg}}>
        {build({frame, l, t: TIME_STARTS[n - 1] + l, d: dur / 30})}
      </svg>
    );
  };

/** fade a thing in at time a (audio seconds) and optionally out at b */
const vis = (t: number, a: number, b?: number, f = 0.4) => seg(t, a, a + f) * (b === undefined ? 1 : 1 - seg(t, b, b + f));

const Txt: React.FC<{x: number; y: number; size?: number; color?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; o?: number; spacing?: number; children: React.ReactNode}> = ({x, y, size = 64, color = C.white, weight = 600, anchor = 'middle', o = 1, spacing = 0, children}) => (
  <text x={x} y={y} fontFamily={SANS} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor} opacity={o} letterSpacing={spacing}>
    {children}
  </text>
);

const Vig: React.FC = () => (
  <g pointerEvents="none">
    <defs>
      <radialGradient id="tv" cx="50%" cy="50%" r="75%">
        <stop offset="0.6" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.45" />
      </radialGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#tv)" />
  </g>
);

const Clock: React.FC<{x: number; y: number; r: number; minutes: number; color?: string; face?: string; o?: number}> = ({x, y, r, minutes, color = C.white, face = '#141B2D', o = 1}) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <circle r={r} fill={face} stroke={color} strokeWidth={r * 0.06} />
    {Array.from({length: 12}, (_, i) => (
      <line key={i} x1={0} y1={-r * 0.86} x2={0} y2={-r * (i % 3 === 0 ? 0.72 : 0.8)} stroke={color} strokeWidth={i % 3 === 0 ? r * 0.04 : r * 0.02} transform={`rotate(${i * 30})`} />
    ))}
    <line y2={-r * 0.5} stroke={color} strokeWidth={r * 0.06} strokeLinecap="round" transform={`rotate(${((minutes / 60) % 12) * 30})`} />
    <line y2={-r * 0.76} stroke={color} strokeWidth={r * 0.035} strokeLinecap="round" transform={`rotate(${(minutes % 60) * 6})`} />
    <circle r={r * 0.05} fill={C.alarm} />
  </g>
);

/* ---------------------------------------------------------------- 1: the question */
const MONTHS = ['JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const S1 = scene(1, ({frame, l, t}) => {
  const summer = 1 - seg(t, 7.0, 7.5);
  const cal = vis(t, 7.4, 12.2, 0.3);
  const head = vis(t, 12.3);
  const idx = clamp(Math.floor(((t - 8.3) / 2.1) * 6), 0, 5);
  const flip = ((t - 8.3) / 2.1) * 6 - Math.floor(((t - 8.3) / 2.1) * 6);
  const sunX = lerp(520, 760, seg(t, 0, 7));
  const kidX = lerp(260, 1320, seg(t, 0.3, 7, (x) => x));
  const pose = walkPose((kidX - 260) * 0.7, {...ELI.stand, aU: 22, aF: 40, lean: 4}, 0.9);
  const r = rng(9);
  return (
    <>
      {summer > 0.01 ? (
        <g opacity={summer}>
          <defs>
            <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F7C98A" />
              <stop offset="1" stopColor="#FFE9C4" />
            </linearGradient>
          </defs>
          <rect width={1920} height={1080} fill="url(#sk)" />
          <circle cx={sunX} cy={330} r={150} fill={C.cream} opacity={0.6} />
          <circle cx={sunX} cy={330} r={104} fill="#FFD27D" />
          {Array.from({length: 5}, (_, i) => (
            <ellipse key={i} cx={(i * 480 + l * 10) % 2400 - 200} cy={170 + (i % 3) * 90} rx={150} ry={34} fill="#fff" opacity={0.55} />
          ))}
          <path d="M 0,820 Q 500,740 1000,800 T 1920,780 L 1920,1080 L 0,1080 Z" fill="#9BC1A0" />
          <path d="M 0,900 Q 600,850 1200,900 T 1920,880 L 1920,1080 L 0,1080 Z" fill="#7FA886" />
          <Eli x={kidX} y={880} scale={0.95} facing={1} pose={pose} frame={frame} rim="#FFF1D6" rimStrength={0.7} glint={0.8} />
          <g transform={`translate(${kidX + 130},${620 + Math.sin(l * 1.6) * 20})`}>
            <path d="M 0,-60 L 40,0 L 0,70 L -40,0 Z" fill={C.rose} stroke="#05070D" strokeWidth={3} />
            <path d={`M 0,70 q -26,40 0,80 q 26,40 0,80`} stroke="#05070D" strokeWidth={4} fill="none" />
            <path d={`M 0,70 L ${-kidX * 0 - 130},${210 - Math.sin(l * 1.6) * 20 + 40}`} stroke="#05070D" strokeWidth={2} />
          </g>
        </g>
      ) : null}
      {cal > 0.01 ? (
        <g opacity={cal}>
          <rect width={1920} height={1080} fill="#0F1626" />
          {Array.from({length: 40}, (_, i) => <circle key={i} cx={r() * 1920} cy={(r() * 1080 + l * 40) % 1080} r={2.5} fill="#fff" opacity={idx >= 5 ? 0.5 : 0} />)}
          <g transform="translate(960,520)">
            <rect x={-300} y={-300} width={600} height={560} rx={32} fill={C.cream} />
            <rect x={-300} y={-300} width={600} height={120} rx={32} fill={idx >= 5 ? C.alarm : C.rose} />
            <rect x={-300} y={-230} width={600} height={50} fill={idx >= 5 ? C.alarm : C.rose} />
            <g transform={`scale(1,${1 - 0.5 * Math.sin(flip * Math.PI)})`}>
              <Txt x={0} y={90} size={190} color="#1B2030" weight={700}>{MONTHS[idx]}</Txt>
            </g>
          </g>
          <Txt x={960} y={940} size={64} color={C.white} o={vis(t, 10.3, 12.2)} spacing={6}>…AGAIN.</Txt>
        </g>
      ) : null}
      {head > 0.01 ? (
        <g opacity={head}>
          <rect width={1920} height={1080} fill="#0B1020" />
          <radialGradient id="hg" cx="50%" cy="45%" r="55%"><stop offset="0" stopColor="#2B4C7E" stopOpacity="0.7" /><stop offset="1" stopColor="#2B4C7E" stopOpacity="0" /></radialGradient>
          <rect width={1920} height={1080} fill="url(#hg)" />
          <g transform="translate(960,470)">
            <path d="M -230,60 C -300,-160 -140,-280 40,-270 C 220,-260 300,-120 260,0 C 250,30 270,60 250,90 C 230,120 190,110 170,150 C 150,230 40,250 -50,230 C -120,210 -200,160 -230,60 Z" fill="#05070D" stroke={C.rimCold} strokeWidth={6} />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={-60 + i * 90} cy={-110 + (i % 2) * 50} r={34 + i * 6} fill="none" stroke={GOLD} strokeWidth={5} opacity={0.4 + 0.6 * vis(t, 14.2 + i * 1.3)} strokeDasharray="10 12" transform={`rotate(${frame * (i % 2 ? -1.4 : 1.4)} ${-60 + i * 90} ${-110 + (i % 2) * 50})`} />
            ))}
          </g>
          <Txt x={960} y={900} size={78} o={vis(t, 14.3)} weight={500}>It's in your head.</Txt>
          <Txt x={960} y={990} size={44} o={vis(t, 16.9)} color={C.rimCold} spacing={8}>BUT THERE ARE REAL REASONS</Txt>
        </g>
      ) : null}
      <Vig />
    </>
  );
}, '#F7C98A');

/* ---------------------------------------------------------------- 2: proportion */
const LifeBar: React.FC<{y: number; years: number; age: number; slice: number; show: number; hl?: string; label: string}> = ({y, years, age, slice, show, hl = GOLD, label}) => {
  const W = 1500;
  const fill = (age / 80) * W;
  return (
    <g opacity={show}>
      <Txt x={210} y={y - 36} size={40} anchor="start" color={C.white} weight={500}>{label}</Txt>
      <rect x={210} y={y} width={W} height={56} rx={10} fill="#141B2D" stroke={C.ash} strokeWidth={3} />
      <rect x={210} y={y} width={fill} height={56} rx={10} fill={C.screen} />
      <rect x={210 + fill - (years / 80) * W * slice} y={y} width={(years / 80) * W * slice} height={56} fill={hl} />
    </g>
  );
};
const S2 = scene(2, ({l, t}) => {
  const a = vis(t, 21.3, 28);
  const b = vis(t, 27.6);
  const pct1 = seg(t, 24.0, 26.8);
  const pct2 = seg(t, 28.6, 30.4);
  const slice = vis(t, 31.2);
  const q = vis(t, 36.2);
  const split = vis(t, 38.6);
  const wk = seg(t, 39.6, 41.6, easeOut);
  const mo = seg(t, 41.6, 43.4, easeOut);
  return (
    <>
      <LifeBar y={380} years={1} age={10} slice={1} show={a} label="Age 10" />
      <Txt x={960} y={600} size={190} color={GOLD} o={a * pct1} weight={700}>10%</Txt>
      <Txt x={960} y={720} size={46} color={C.white} o={a * pct1} weight={400}>of your whole life, in one year</Txt>
      <LifeBar y={300} years={1} age={10} slice={1} show={b * 0} label="" />
      <g opacity={b}>
        <LifeBar y={360} years={1} age={50} slice={1} show={1} label="Age 50" />
        <Txt x={960} y={600} size={190} color={C.rimCold} o={pct2} weight={700}>2%</Txt>
        <Txt x={960} y={720} size={46} o={pct2} weight={400}>one year is a thin slice</Txt>
      </g>
      <g opacity={slice * (1 - split)}>
        <Txt x={960} y={900} size={84} weight={500}>A smaller slice <tspan fill={GOLD}>feels</tspan> shorter.</Txt>
      </g>
      {q > 0.01 ? (
        <g opacity={q * (1 - split)}>
          <Txt x={960} y={1010} size={52} color={C.alarm} weight={500} spacing={4}>…BUT IT CAN'T BE THE WHOLE STORY</Txt>
        </g>
      ) : null}
      {split > 0.01 ? (
        <g opacity={split}>
          <rect width={1920} height={1080} fill={NAVY} />
          <Txt x={480} y={250} size={46} color={C.rimCold} spacing={6}>A BORING WEEK</Txt>
          <Txt x={1440} y={250} size={46} color={GOLD} spacing={6}>A BUSY MONTH</Txt>
          <rect x={140} y={330} width={680} height={90} rx={12} fill="#141B2D" />
          <rect x={140} y={330} width={680 * wk} height={90} rx={12} fill={C.rimCold} opacity={0.8} />
          <rect x={1100} y={330} width={680} height={90} rx={12} fill="#141B2D" />
          <rect x={1100} y={330} width={680 * 0.12 * mo} height={90} rx={12} fill={GOLD} />
          <Txt x={480} y={560} size={110} o={wk} weight={300}>drags</Txt>
          <Txt x={1440} y={560} size={110} o={mo} weight={300} color={GOLD}>vanishes</Txt>
          <Txt x={960} y={860} size={52} color={C.white} o={vis(t, 42.2)} weight={400}>The proportion idea can't explain that.</Txt>
        </g>
      ) : null}
      <Txt x={960} y={140} size={40} color={C.ash} spacing={10} o={1 - split}>THE PROPORTION THEORY</Txt>
      <Vig />
      {l < 0 ? null : null}
    </>
  );
});

/* ---------------------------------------------------------------- 3: memory */
const MEM = [
  {label: 'FIRST DAY OF SCHOOL', c: C.rose, from: 56.0},
  {label: 'FIRST TRIP ABROAD', c: C.rimCold, from: 58.4},
  {label: 'FIRST LOVE', c: '#F4A6C0', from: 60.4},
];
const ROUT = [
  {label: 'SAME COMMUTE', from: 68.7},
  {label: 'SAME COFFEE', from: 69.8},
  {label: 'SAME SCREEN', from: 70.9},
];
const S3 = scene(3, ({frame, t}) => {
  const clock = vis(t, 44.6, 48.6, 0.5);
  const mem = vis(t, 49.2, 66.4, 0.5);
  const novelty = vis(t, 52.4, 66.4, 0.5);
  const routine = vis(t, 66.9, 76.2, 0.5);
  const bars = vis(t, 77.2);
  const minutes = t * 40;
  return (
    <>
      <g opacity={clock}>
        <Clock x={960} y={500} r={260} minutes={minutes} color={C.white} />
        <Txt x={960} y={900} size={64} weight={400}>Your brain doesn't measure time with a clock.</Txt>
      </g>
      <g opacity={mem}>
        {/* film strip of memories */}
        <g transform="translate(0,450)">
          <rect x={-40} y={-30} width={2000} height={300} fill="#05070D" />
          {Array.from({length: 22}, (_, i) => (
            <g key={i}>
              <rect x={i * 100 - ((frame * 2) % 100) - 30} y={-18} width={40} height={20} rx={4} fill="#1B2540" />
              <rect x={i * 100 - ((frame * 2) % 100) - 30} y={238} width={40} height={20} rx={4} fill="#1B2540" />
            </g>
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={160 + i * 330 - ((frame * 2) % 330)} y={20} width={290} height={200} rx={10} fill={[C.rose, C.rimCold, GOLD, C.sage, '#F4A6C0'][i]} opacity={0.75} />
          ))}
        </g>
        <Txt x={960} y={900} size={80} weight={500} o={vis(t, 49.3, 52)}>It measures time by <tspan fill={GOLD}>what it remembers.</tspan></Txt>
      </g>
      <g opacity={novelty}>
        <Txt x={960} y={160} size={46} color={GOLD} spacing={10}>NEW = ATTENTION + DETAIL</Txt>
        {MEM.map((m, i) => {
          const p = seg(t, m.from, m.from + 0.5, easeOut);
          return (
            <g key={i} transform={`translate(${340 + i * 620},${460 - (1 - p) * 60}) rotate(${(i - 1) * 3})`} opacity={p}>
              <rect x={-250} y={-230} width={500} height={460} rx={26} fill={m.c} />
              {Array.from({length: 7}, (_, k) => (
                <circle key={k} cx={-150 + ((k * 97) % 300)} cy={-130 + ((k * 61) % 160)} r={20 + (k % 3) * 8} fill="#fff" opacity={0.28} />
              ))}
              <rect x={-190} y={110} width={380} height={14} rx={7} fill="#fff" opacity={0.7} />
              <rect x={-190} y={140} width={260} height={14} rx={7} fill="#fff" opacity={0.5} />
              <Txt x={0} y={-40} size={42} color="#05070D" weight={700}>{m.label}</Txt>
            </g>
          );
        })}
        <Txt x={960} y={920} size={64} weight={500} o={vis(t, 62.2)}>Full of memories, so they feel <tspan fill={GOLD}>long.</tspan></Txt>
      </g>
      <g opacity={routine}>
        <Txt x={960} y={160} size={46} color={C.ash} spacing={10}>ROUTINE = ALMOST NOTHING SAVED</Txt>
        {ROUT.map((m, i) => {
          const p = seg(t, m.from, m.from + 0.4, easeOut);
          const fade = 1 - seg(t, 72.6, 75.6) * 0.85;
          return (
            <g key={i} transform={`translate(${340 + i * 620},520)`} opacity={p * fade}>
              <rect x={-250} y={-200} width={500} height={400} rx={26} fill="#252C3D" stroke={C.ash} strokeWidth={4} />
              <Txt x={0} y={10} size={44} color="#8793AE" weight={600}>{m.label}</Txt>
            </g>
          );
        })}
        <Txt x={960} y={900} size={64} o={vis(t, 72.8)} weight={400}>Your brain quietly saves <tspan fill={C.rimCold}>almost nothing.</tspan></Txt>
      </g>
      <g opacity={bars}>
        <Txt x={960} y={170} size={46} color={C.white} spacing={8}>LOOKING BACK AT A YEAR</Txt>
        <Txt x={300} y={340} size={44} anchor="start" color={GOLD}>New year</Txt>
        <rect x={300} y={370} width={1320} height={90} rx={12} fill="#141B2D" />
        {Array.from({length: 18}, (_, i) => (
          <rect key={i} x={304 + i * 72 * seg(t, 77.4, 79, easeOut) } y={374} width={64} height={82} rx={8} fill={[C.rose, C.rimCold, GOLD, C.sage][i % 4]} opacity={0.9} />
        ))}
        <Txt x={300} y={600} size={44} anchor="start" color={C.rimCold}>Routine year</Txt>
        <rect x={300} y={630} width={1320} height={90} rx={12} fill="#141B2D" />
        {Array.from({length: 3}, (_, i) => (
          <rect key={i} x={304 + i * 90 * seg(t, 78.4, 80, easeOut)} y={634} width={64} height={82} rx={8} fill="#3C4457" />
        ))}
        <Txt x={960} y={920} size={64} o={vis(t, 80.9)} weight={500}>Little to count feels <tspan fill={C.rimCold}>short.</tspan></Txt>
      </g>
      <Vig />
    </>
  );
});

/* ---------------------------------------------------------------- 4: the holiday paradox */
const Lane: React.FC<{y: number; label: string; during: number; after: number; p1: number; p2: number; color: string}> = ({y, label, during, after, p1, p2, color}) => (
  <g>
    <Txt x={180} y={y - 20} size={42} anchor="start" color={color} weight={600}>{label}</Txt>
    <Txt x={180} y={y + 56} size={30} anchor="start" color={C.ash} spacing={4}>WHILE LIVING IT</Txt>
    <rect x={620} y={y + 18} width={1100} height={36} rx={10} fill="#141B2D" />
    <rect x={620} y={y + 18} width={1100 * during * p1} height={36} rx={10} fill={color} />
    <Txt x={180} y={y + 136} size={30} anchor="start" color={C.ash} spacing={4}>LOOKING BACK</Txt>
    <rect x={620} y={y + 98} width={1100} height={36} rx={10} fill="#141B2D" />
    <rect x={620} y={y + 98} width={1100 * after * p2} height={36} rx={10} fill={color} opacity={0.75} />
  </g>
);
const S4 = scene(4, ({t}) => {
  const hol = vis(t, 85.6);
  const dull = vis(t, 96.2);
  const end = vis(t, 101.4);
  return (
    <>
      <Txt x={960} y={140} size={46} color={GOLD} spacing={10}>THE HOLIDAY PARADOX</Txt>
      <g opacity={hol}>
        <Lane y={260} label="A HOLIDAY" during={0.18} after={0.96} p1={seg(t, 87.0, 89.6)} p2={seg(t, 90.4, 93.4)} color={GOLD} />
      </g>
      <g opacity={dull}>
        <Lane y={560} label="A DULL STRETCH" during={0.95} after={0.14} p1={seg(t, 97.2, 99.8, (x) => x)} p2={seg(t, 99.6, 101.2)} color={C.rimCold} />
      </g>
      <g opacity={end}>
        <rect width={1920} height={1080} fill={NAVY} opacity={seg(t, 101.8, 102.6)} />
        <Txt x={960} y={480} size={90} weight={500} o={vis(t, 102.0)}>Time isn't speeding up.</Txt>
        <Txt x={960} y={620} size={90} weight={500} o={vis(t, 103.9)} color={GOLD}>Your memories are getting thinner.</Txt>
      </g>
      <Vig />
    </>
  );
});

/* ---------------------------------------------------------------- 5: firsts vs repeats, attention */
const S5 = scene(5, ({frame, t}) => {
  const kid = vis(t, 106.9, 111.0, 0.5);
  const adult = vis(t, 108.8, 119.2, 0.5);
  const att = vis(t, 119.4);
  const r = rng(14);
  const dots = Array.from({length: 46}, () => ({x: 120 + r() * 1680, y: 250 + r() * 300, c: [C.rose, C.rimCold, GOLD, C.sage, '#F4A6C0'][Math.floor(r() * 5)], s: 10 + r() * 22}));
  const loopA = ((t - 111.4) / 2) * Math.PI * 2;
  const scroll = (t * 6) % 1;
  const jar = clamp((t - 119.5) * 0.0);
  void jar;
  return (
    <>
      <g opacity={kid}>
        <Txt x={960} y={150} size={52} color={GOLD} spacing={10}>CHILDHOOD: FIRSTS</Txt>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y + Math.sin(frame / 18 + i) * 8} r={d.s * seg(t, 107 + (i % 12) * 0.2, 107.5 + (i % 12) * 0.2, easeOut)} fill={d.c} opacity={0.9} />
        ))}
      </g>
      <g opacity={adult}>
        <Txt x={960} y={150} size={52} color={C.rimCold} spacing={10} o={vis(t, 109, 119)}>ADULT LIFE: REPEATS</Txt>
        {[0, 1, 2].map((i) => {
          const a = loopA + (i * Math.PI * 2) / 3;
          return (
            <g key={i} opacity={seg(t, 111.4 + i * 0.5, 111.9 + i * 0.5)}>
              <circle cx={960 + Math.cos(a) * 280} cy={560 + Math.sin(a) * 200} r={70} fill="#252C3D" stroke={C.ash} strokeWidth={4} />
              <Txt x={960 + Math.cos(a) * 280} y={570 + Math.sin(a) * 200} size={30} color="#8793AE" weight={600}>{['WORK', 'HOME', 'SLEEP'][i]}</Txt>
            </g>
          );
        })}
        <ellipse cx={960} cy={560} rx={280} ry={200} fill="none" stroke={C.ash} strokeWidth={4} strokeDasharray="14 14" opacity={seg(t, 112, 113)} />
        <Txt x={960} y={940} size={58} weight={400} o={vis(t, 114.7)}>Fewer firsts. <tspan fill={C.rimCold}>The years blur together.</tspan></Txt>
        {/* the years blur */}
        {Array.from({length: 10}, (_, i) => (
          <rect key={i} x={160 + i * 170} y={860} width={140} height={14} rx={7} fill={C.ash} opacity={0.25 + 0.6 * seg(t, 115.2 + i * 0.1, 117)} />
        ))}
      </g>
      <g opacity={att}>
        <rect width={1920} height={1080} fill={NAVY} />
        <g transform="translate(700,560)">
          <rect x={-170} y={-330} width={340} height={660} rx={40} fill="#05070D" stroke={C.ash} strokeWidth={5} />
          <clipPath id="ph"><rect x={-150} y={-310} width={300} height={620} rx={26} /></clipPath>
          <g clipPath="url(#ph)">
            {Array.from({length: 4}, (_, i) => (
              <rect key={i} x={-150} y={-310 + ((i - scroll) * 260)} width={300} height={240} rx={20} fill={[C.rose, C.rimCold, C.sage, GOLD][i]} opacity={0.7} />
            ))}
          </g>
        </g>
        <g transform="translate(1260,560)">
          <path d="M -120,-240 L -80,-300 L 80,-300 L 120,-240 L 130,220 Q 130,300 0,300 Q -130,300 -130,220 Z" fill="none" stroke={C.white} strokeWidth={6} opacity={0.8} />
          {Array.from({length: Math.round(8 * (1 - seg(t, 121, 126.5)) + 1)}, (_, i) => (
            <circle key={i} cx={-60 + (i % 3) * 60} cy={220 - Math.floor(i / 3) * 56} r={22} fill={[C.rose, C.rimCold, GOLD][i % 3]} opacity={0.9} />
          ))}
          <Txt x={0} y={380} size={36} color={C.ash} spacing={6}>MEMORIES</Txt>
        </g>
        <Txt x={960} y={150} size={52} color={C.white} o={vis(t, 119.5)} spacing={8}>DISTRACTED = NOTHING STORED</Txt>
        <Txt x={960} y={1010} size={56} o={vis(t, 124.4)} weight={400}>Hours of scrolling leave <tspan fill={C.alarm}>almost no memory.</tspan></Txt>
      </g>
      <Vig />
    </>
  );
});

/* ---------------------------------------------------------------- 6: what you can do */
const Tip: React.FC<{x: number; title: string; sub: string; p: number; color: string; children: React.ReactNode}> = ({x, title, sub, p, color, children}) => (
  <g transform={`translate(${x},${540 + (1 - p) * 50})`} opacity={p}>
    <rect x={-270} y={-300} width={540} height={620} rx={36} fill="#141B2D" stroke={color} strokeWidth={5} />
    <g transform="translate(0,-110)">{children}</g>
    <Txt x={0} y={150} size={48} color={color} weight={700}>{title}</Txt>
    <Txt x={0} y={215} size={26} color={C.white} weight={400}>{sub}</Txt>
  </g>
);
const S6 = scene(6, ({frame, t}) => {
  const hdr = vis(t, 128.6);
  const p1 = seg(t, 131.5, 132.2, easeOut);
  const p2 = seg(t, 139.0, 139.7, easeOut);
  const p3 = seg(t, 145.0, 145.7, easeOut);
  const pulse = (a: number) => 1 + 0.04 * Math.sin(Math.max(0, t - a) * 6) * (t > a ? 1 : 0);
  return (
    <>
      <Txt x={960} y={150} size={72} weight={500} o={hdr}>You can slow it down.</Txt>
      <Tip x={400} title="DO SOMETHING NEW" sub="a new route, a new skill, a new city" p={p1} color={C.rimCold}>
        <g transform={`scale(${pulse(131.5)})`}>
          <path d="M -150,100 C -100,-100 100,100 150,-100" stroke={C.rimCold} strokeWidth={10} fill="none" strokeDasharray="22 16" strokeDashoffset={-frame * 1.5} />
          <circle cx={-150} cy={100} r={22} fill={C.white} />
          <path d="M 150,-100 m -22,0 a 22,22 0 1 1 44,0 c 0,24 -22,50 -22,50 c 0,0 -22,-26 -22,-50 Z" fill={C.alarm} />
        </g>
      </Tip>
      <Tip x={960} title="PAY ATTENTION" sub="phone down. actually taste it" p={p2} color={GOLD}>
        <g transform={`scale(${pulse(139)})`}>
          <ellipse cx={0} cy={60} rx={150} ry={42} fill={C.cream} />
          <ellipse cx={0} cy={50} rx={96} ry={24} fill="#E0B070" />
          <path d="M -40,-40 q 18,-50 0,-90 M 20,-40 q 18,-50 0,-90" stroke={C.white} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(frame / 10)} />
        </g>
      </Tip>
      <Tip x={1520} title="MARK YOUR LIFE" sub="a photo, or one line a day" p={p3} color={C.sage}>
        <g transform={`scale(${pulse(145)})`}>
          <rect x={-120} y={-80} width={240} height={190} rx={22} fill={C.white} opacity={0.9} />
          <rect x={-60} y={-110} width={120} height={36} rx={10} fill={C.white} opacity={0.9} />
          <circle cx={0} cy={15} r={58} fill="#141B2D" />
          <circle cx={0} cy={15} r={36} fill={C.rimCold} />
          <rect x={80} y={-60} width={26} height={16} rx={4} fill={C.alarm} opacity={0.5 + 0.5 * (Math.sin(frame / 6) > 0 ? 1 : 0)} />
        </g>
      </Tip>
      <Txt x={960} y={960} size={52} color={C.white} o={vis(t, 149.6)} weight={400}>Give your brain <tspan fill={GOLD}>something to count.</tspan></Txt>
      <Vig />
    </>
  );
});

/* ---------------------------------------------------------------- 7: close */
const S7 = scene(7, ({frame, l, t}) => {
  const day = vis(t, 152.0, 157.6, 0.6);
  const fillN = Math.round(24 * seg(t, 154.2, 156.8));
  const fin = vis(t, 158.2, 163.8, 0.8);
  const out = seg(l, 12.4, 14.4);
  const r = rng(31);
  const stars = Array.from({length: 70}, () => ({x: r() * 1920, y: r() * 1080, c: [C.rose, C.rimCold, GOLD, C.sage][Math.floor(r() * 4)], s: 3 + r() * 7}));
  return (
    <>
      <g opacity={day}>
        <Txt x={960} y={150} size={64} weight={500} o={vis(t, 152)}>You can't add hours to the day.</Txt>
        <g transform="translate(960,560)">
          <circle r={290} fill="none" stroke={C.ash} strokeWidth={8} />
          {Array.from({length: 24}, (_, i) => {
            const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
            const on = i < fillN;
            return <circle key={i} cx={Math.cos(a) * 290} cy={Math.sin(a) * 290} r={on ? 26 : 12} fill={on ? [C.rose, C.rimCold, GOLD, C.sage][i % 4] : C.ash} />;
          })}
          <Txt x={0} y={30} size={110} weight={300}>24h</Txt>
        </g>
        <Txt x={960} y={980} size={56} o={vis(t, 154.3)} weight={400}>…but you can fill them with <tspan fill={GOLD}>moments worth remembering.</tspan></Txt>
      </g>
      <g opacity={fin}>
        <rect width={1920} height={1080} fill="#0B0F1A" />
        {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y + Math.sin(frame / 25 + i) * 6} r={s.s * seg(t, 158.4 + (i % 20) * 0.2, 159.4 + (i % 20) * 0.2)} fill={s.c} opacity={0.7} />)}
        <Txt x={960} y={500} size={74} weight={400} o={vis(t, 158.4)}>A long life isn't the one with the most years.</Txt>
        <Txt x={960} y={640} size={92} weight={600} color={GOLD} o={vis(t, 161.0)}>It's the one with the most memories.</Txt>
      </g>
      <rect width={1920} height={1080} fill="#000" opacity={out} />
      <Vig />
    </>
  );
});

export const TIME_SCENE_COMPONENTS: React.FC<SceneProps>[] = [S1, S2, S3, S4, S5, S6, S7];
void easeInOut;
