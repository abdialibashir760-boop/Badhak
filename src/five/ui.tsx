import React from 'react';
import {clamp, easeOut, lerp, seg} from '../lib/anim';
import {C} from './palette';
import {NOTE_RULE, S, SWIPES, batteryAt, clockMinutes, fmtClock, fmtMS, keysTyped, noteTextAt, timerLeft} from './timeline';

const SANS = "'Inter', system-ui, sans-serif";

/* ------------------------------------------------------------------ seven-segment digits (ghost timer) */
const SEG: Record<string, string> = {'0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg'};
const Digit: React.FC<{ch: string; w: number; h: number; color: string}> = ({ch, w, h, color}) => {
  const t = w * 0.17;
  const on = SEG[ch] ?? '';
  const horiz = (y: number) => `M ${t * 0.7},${y} L ${t * 1.4},${y - t / 2} L ${w - t * 1.4},${y - t / 2} L ${w - t * 0.7},${y} L ${w - t * 1.4},${y + t / 2} L ${t * 1.4},${y + t / 2} Z`;
  const vert = (x: number, y0: number, y1: number) => `M ${x},${y0 + t * 0.7} L ${x + t / 2},${y0 + t * 1.4} L ${x + t / 2},${y1 - t * 1.4} L ${x},${y1 - t * 0.7} L ${x - t / 2},${y1 - t * 1.4} L ${x - t / 2},${y0 + t * 1.4} Z`;
  const segs: Record<string, string> = {a: horiz(t / 2), g: horiz(h / 2), d: horiz(h - t / 2), f: vert(t / 2, 0, h / 2), b: vert(w - t / 2, 0, h / 2), e: vert(t / 2, h / 2, h), c: vert(w - t / 2, h / 2, h)};
  return (
    <g>
      {Object.entries(segs).map(([k, d]) => (
        <path key={k} d={d} fill={color} opacity={on.includes(k) ? 1 : 0.07} />
      ))}
    </g>
  );
};
export const Seg7: React.FC<{text: string; x: number; y: number; h: number; color: string; opacity?: number}> = ({text, x, y, h, color, opacity = 1}) => {
  const w = h * 0.55;
  const gap = h * 0.18;
  let cx = x;
  return (
    <g opacity={opacity}>
      {[...text].map((ch, i) => {
        const here = cx;
        cx += ch === ':' ? gap * 1.6 : w + gap;
        return ch === ':' ? (
          <g key={i}>
            <circle cx={here + gap * 0.5} cy={y + h * 0.32} r={h * 0.035} fill={color} />
            <circle cx={here + gap * 0.5} cy={y + h * 0.68} r={h * 0.035} fill={color} />
          </g>
        ) : (
          <g key={i} transform={`translate(${here},${y})`}>
            <Digit ch={ch} w={w} h={h} color={color} />
          </g>
        );
      })}
    </g>
  );
};
export const seg7Width = (text: string, h: number) => [...text].reduce((n, ch) => n + (ch === ':' ? h * 0.18 * 1.6 : h * 0.55 + h * 0.18), 0);

/* ------------------------------------------------------------------ phone screens (drawn in a 460 × 900 box) */
export const PHONE_W = 460;
export const PHONE_H = 900;

export const Battery: React.FC<{x: number; y: number; level: number; flash?: number}> = ({x, y, level, flash = 0}) => {
  const col = level <= 5 ? C.alarm : level <= 20 ? C.amber : C.white;
  return (
    <g transform={`translate(${x},${y})`} opacity={level <= 5 ? 0.55 + 0.45 * flash : 1}>
      <rect x={0} y={-12} width={34} height={17} rx={4} fill="none" stroke={col} strokeWidth={2} opacity={0.9} />
      <rect x={34} y={-7} width={3} height={7} rx={1.5} fill={col} />
      <rect x={3} y={-9} width={Math.max(2, (28 * level) / 100)} height={11} rx={2} fill={col} />
    </g>
  );
};

const StatusBar: React.FC<{t: number; frame: number; dark?: boolean}> = ({t, frame}) => (
  <g fill={C.white} fontFamily={SANS}>
    <text x={28} y={44} fontSize={20} fontWeight={600}>
      {fmtClock(clockMinutes(t), false)}
    </text>
    <Battery x={380} y={40} level={batteryAt(t)} flash={Math.sin(frame * 0.4) > 0 ? 1 : 0} />
  </g>
);

const Bg: React.FC<{color?: string}> = ({color = '#0E1424'}) => <rect width={PHONE_W} height={PHONE_H} fill={color} />;

export const ScreenCalendar: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const p = seg(t, S(1) + 0.4, S(1) + 3.2, easeOut);
  const saved = seg(t, S(1) + 3.6, S(1) + 4, easeOut);
  const title = 'DREAM PROJECT'.slice(0, Math.ceil(13 * p));
  return (
    <g fontFamily={SANS}>
      <Bg color="#10172A" />
      <StatusBar t={t} frame={frame} />
      <text x={28} y={120} fontSize={26} fill={C.rimCold} fontWeight={600}>Cancel</text>
      <text x={PHONE_W - 28} y={120} fontSize={26} fill={C.rimCold} fontWeight={700} textAnchor="end">Save</text>
      <text x={PHONE_W / 2} y={120} fontSize={24} fill={C.white} textAnchor="middle" fontWeight={600}>New Event</text>
      <rect x={20} y={160} width={420} height={96} rx={18} fill="#18213A" />
      <text x={44} y={222} fontSize={36} fill={C.white} fontWeight={700}>{title}{Math.floor(frame / 15) % 2 && p < 1 ? '|' : ''}</text>
      <rect x={20} y={280} width={420} height={140} rx={18} fill="#18213A" />
      <text x={44} y={334} fontSize={22} fill={C.white} opacity={0.65}>Starts</text>
      <text x={416} y={334} fontSize={24} fill={C.white} textAnchor="end" fontWeight={600}>Tonight · 8:00 PM</text>
      <text x={44} y={394} fontSize={22} fill={C.white} opacity={0.65}>Ends</text>
      <text x={416} y={394} fontSize={24} fill={C.white} textAnchor="end" fontWeight={600}>12:00 AM</text>
      <rect x={20} y={444} width={420} height={104} rx={18} fill="#18213A" />
      <text x={44} y={506} fontSize={28} fill={C.amber} fontWeight={700} opacity={seg(t, S(1) + 2.0, S(1) + 2.6)}>4 HRS. NO EXCUSES.</text>
      <rect x={20} y={572} width={420} height={72} rx={18} fill="#18213A" />
      <text x={44} y={618} fontSize={22} fill={C.white} opacity={0.65}>Alert</text>
      <text x={416} y={618} fontSize={22} fill={C.white} textAnchor="end">10 minutes before</text>
      <g opacity={saved} transform={`translate(0,${(1 - saved) * -30})`}>
        <rect x={40} y={70} width={380} height={64} rx={20} fill={C.sage} />
        <text x={PHONE_W / 2} y={112} fontSize={24} fill="#0B0F1A" textAnchor="middle" fontWeight={700}>✓ Event added</text>
      </g>
    </g>
  );
};

const FEED = [
  {c1: '#7A3E9D', c2: '#2D1B5E', cap: '10 HABITS OF MILLIONAIRES'},
  {c1: '#1E7A8C', c2: '#0F3B5C', cap: 'WAIT FOR IT…'},
  {c1: '#B35C2E', c2: '#5E2A1B', cap: "WHY YOU'RE STILL TIRED"},
  {c1: '#4B8A4A', c2: '#1B3D2A', cap: 'cat does a thing 😺'},
  {c1: '#9D3E6A', c2: '#42193A', cap: 'THIS CHANGES EVERYTHING'},
  {c1: '#3E5E9D', c2: '#1B2A5E', cap: 'You won\'t believe #7'},
];
export const ScreenFeed: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const n = SWIPES.filter((s) => s <= t).length;
  const last = SWIPES.filter((s) => s <= t).at(-1) ?? -9;
  const sw = easeOut(clamp((t - last) / 0.18));
  const off = n === 0 ? 0 : (n - 1 + sw) * 760;
  const cards = [n - 1, n, n + 1].filter((i) => i >= 0);
  return (
    <g fontFamily={SANS}>
      <Bg color="#05070D" />
      {cards.map((i) => {
        const f = FEED[i % FEED.length];
        const y = i * 760 - off + 70;
        return (
          <g key={i} transform={`translate(0,${y})`}>
            <defs>
              <linearGradient id={`feed-${i % FEED.length}`} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor={f.c1} />
                <stop offset="1" stopColor={f.c2} />
              </linearGradient>
            </defs>
            <rect x={0} y={0} width={PHONE_W} height={760} fill={`url(#feed-${i % FEED.length})`} />
            <circle cx={PHONE_W / 2} cy={330 + Math.sin(frame * 0.2 + i) * 14} r={90} fill="#fff" opacity={0.12} />
            <text x={28} y={640} fontSize={34} fill="#fff" fontWeight={800}>{f.cap}</text>
            <text x={28} y={690} fontSize={20} fill="#fff" opacity={0.7}>@loopfeed · 2.4M views</text>
            <circle cx={PHONE_W - 50} cy={520} r={22} fill="#fff" opacity={0.85} />
            <circle cx={PHONE_W - 50} cy={580} r={22} fill="#fff" opacity={0.6} />
          </g>
        );
      })}
      <StatusBar t={t} frame={frame} />
    </g>
  );
};

export const ScreenTimeCard: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const p = seg(t, S(6) + 0.5, S(6) + 1.1, easeOut) * (1 - seg(t, S(6) + 4.6, S(6) + 5));
  return (
    <g fontFamily={SANS}>
      <ScreenFeed t={S(4) + 9} frame={frame} />
      <rect width={PHONE_W} height={PHONE_H} fill="#000" opacity={0.45} />
      <g transform={`translate(0,${(1 - p) * 500})`} opacity={p}>
        <rect x={24} y={250} width={412} height={330} rx={28} fill="#1A2238" stroke={C.ash} />
        <text x={52} y={310} fontSize={20} fill={C.white} opacity={0.6} letterSpacing={3}>WEEKLY SCREEN TIME</text>
        <text x={52} y={392} fontSize={56} fill={C.white} fontWeight={800}>6h 52m</text>
        <text x={52} y={432} fontSize={22} fill={C.white} opacity={0.7}>Daily average</text>
        <text x={52} y={480} fontSize={24} fill={C.alarm} fontWeight={700}>↑ 18% from last week</text>
        <rect x={52} y={510} width={356} height={52} rx={26} fill="#2A3454" />
        <text x={PHONE_W / 2} y={545} fontSize={22} fill={C.white} textAnchor="middle" fontWeight={600}>Ignore</text>
      </g>
    </g>
  );
};

export const ScreenBatteryDead: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const warn = seg(t, S(11) + 0.2, S(11) + 0.6) * (1 - seg(t, S(11) + 2.2, S(11) + 2.4));
  return (
    <g fontFamily={SANS}>
      <Bg color="#0A0F1E" />
      <g opacity={warn}>
        <rect x={50} y={320} width={360} height={250} rx={28} fill="#1A1220" stroke={C.alarm} strokeWidth={3} />
        <text x={PHONE_W / 2} y={400} fontSize={30} fill={C.white} textAnchor="middle" fontWeight={700}>Battery 1%</text>
        <text x={PHONE_W / 2} y={440} fontSize={22} fill={C.white} textAnchor="middle" opacity={0.7}>Low Power Mode</text>
        <g transform="translate(150,470) scale(2.4)">
          <Battery x={0} y={0} level={1} flash={Math.sin(frame * 0.5) > 0 ? 1 : 0} />
        </g>
      </g>
    </g>
  );
};

export const ScreenLock: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const p = seg(t, S(12) + 5.0, S(12) + 5.8, easeOut);
  const boot = seg(t, S(12) + 3.1, S(12) + 3.9);
  return (
    <g fontFamily={SANS} opacity={boot}>
      <Bg color="#0B1226" />
      <StatusBar t={t} frame={frame} />
      <text x={PHONE_W / 2} y={124} fontSize={22} fill={C.white} textAnchor="middle" opacity={0.75} letterSpacing={4}>TUESDAY</text>
      <text x={PHONE_W / 2} y={232} fontSize={112} fill={C.white} textAnchor="middle" fontWeight={300}>11:45</text>
      <rect x={110} y={270} width={240} height={56} rx={16} fill="#18213A" />
      <text x={PHONE_W / 2} y={306} fontSize={22} fill={C.rimCold} textAnchor="middle">☂ Rain · 9°C</text>
      <g opacity={p} transform={`translate(0,${(1 - p) * 20})`}>
        <rect x={24} y={400} width={412} height={150} rx={24} fill="#2A0F1A" stroke={C.badge} strokeWidth={2} />
        <text x={50} y={448} fontSize={19} fill={C.badge} fontWeight={700} letterSpacing={2}>CALENDAR</text>
        <text x={50} y={494} fontSize={29} fill={C.white} fontWeight={800}>DREAM PROJECT</text>
        <text x={50} y={530} fontSize={22} fill={C.alarm} fontWeight={700}>OVERDUE 12 DAYS</text>
        <rect x={270} y={452} width={142} height={44} rx={22} fill="#3A2A44" />
        <text x={341} y={482} fontSize={19} fill={C.white} textAnchor="middle">Snooze 1 day</text>
      </g>
    </g>
  );
};

export const ScreenAlertMissed: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const p = seg(t, S(7) + 3.2, S(7) + 3.7, easeOut);
  return (
    <g fontFamily={SANS}>
      <Bg color="#0B1020" />
      <StatusBar t={t} frame={frame} />
      <g opacity={p} transform={`translate(0,${(1 - p) * -40})`}>
        <rect x={24} y={90} width={412} height={140} rx={24} fill={C.badge} />
        <text x={50} y={138} fontSize={18} fill={C.white} opacity={0.85} fontWeight={700} letterSpacing={2}>CALENDAR</text>
        <text x={50} y={186} fontSize={29} fill={C.white} fontWeight={800}>DREAM PROJECT · 4 HRS</text>
        <text x={50} y={216} fontSize={22} fill={C.white} fontWeight={700}>MISSED</text>
      </g>
    </g>
  );
};

export const ScreenNotes: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const text = noteTextAt(t);
  const lines = text.split('\n');
  const rule = text.length > 0 && !'Build the dream project for 4 hours.'.startsWith(text) && lines.length >= 1 && NOTE_RULE[0].startsWith(lines[0].slice(0, 4));
  const caret = Math.floor(frame / 15) % 2 === 0;
  return (
    <g fontFamily={SANS}>
      <Bg color="#161B2B" />
      <StatusBar t={t} frame={frame} />
      <text x={28} y={120} fontSize={24} fill={C.amber} fontWeight={700}>‹ Notes</text>
      <text x={PHONE_W - 28} y={120} fontSize={24} fill={C.amber} textAnchor="end" fontWeight={700}>Done</text>
      <text x={28} y={190} fontSize={38} fill={C.white} fontWeight={800} opacity={rule ? 1 : 0.0}>THE RULE</text>
      {lines.map((l, i) => (
        <g key={i}>
          <text x={28} y={(rule ? 262 : 230) + i * 58} fontSize={rule && i === 1 ? 44 : 30} fill={C.white} fontWeight={rule && i === 1 ? 800 : 500}>
            {l}
            {i === lines.length - 1 && caret ? <tspan fill={C.amber}>|</tspan> : null}
          </text>
          {rule && i === 1 ? <rect x={28} y={(rule ? 262 : 230) + i * 58 + 8} width={Math.min(260, l.length * 24)} height={7} rx={3} fill={C.amber} /> : null}
        </g>
      ))}
    </g>
  );
};

export const ScreenTimer: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const left = timerLeft(t);
  const reset = t >= S(23);
  const running = t >= S(14) + 5.5 && !reset;
  const wheel = reset ? 1 : seg(t, S(14) + 0.8, S(14) + 3.6, easeOut);
  const ring = t > S(20) + 2.7 && t < S(20) + 4.4;
  const ghost = reset ? 300 : !running ? lerp(14400, 300, wheel) : left;
  const hours = Math.floor(ghost / 3600);
  const text = running || wheel >= 1 ? fmtMS(ghost) : `${String(hours).padStart(2, '0')}:${fmtMS(ghost % 3600)}`;
  const press = seg(t, S(14) + 5.4, S(14) + 5.55) * (1 - seg(t, S(14) + 5.55, S(14) + 5.7));
  return (
    <g fontFamily={SANS}>
      <Bg color="#101522" />
      <StatusBar t={t} frame={frame} />
      <text x={PHONE_W / 2} y={150} fontSize={22} fill={C.white} opacity={0.6} textAnchor="middle" letterSpacing={5}>TIMER</text>
      <text x={PHONE_W / 2} y={380} fontSize={running || wheel >= 1 ? 112 : 84} fill={ring ? C.white : C.amber} textAnchor="middle" fontWeight={300} opacity={ring ? 0.6 + 0.4 * Math.sin(frame * 0.8) : 1}>
        {text}
      </text>
      {ring ? <text x={PHONE_W / 2} y={470} fontSize={28} fill={C.white} textAnchor="middle" fontWeight={700}>Time's up</text> : null}
      <g transform={`translate(${PHONE_W / 2},${640}) scale(${1 - press * 0.08})`}>
        <circle r={86} fill={ring ? '#3A2A44' : running ? '#3A2A18' : C.amber} opacity={0.95} />
        <text y={12} fontSize={34} fill={running && !ring ? C.amber : ring ? C.white : '#1A1305'} textAnchor="middle" fontWeight={700}>
          {ring ? 'Stop' : running ? 'Pause' : 'Start'}
        </text>
      </g>
    </g>
  );
};

export const ScreenBanner: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const p = seg(t, S(18) + 0.2, S(18) + 0.5, easeOut) * (1 - seg(t, S(18) + 3.0, S(18) + 3.3));
  const text = timerLeft(t) > 0 ? fmtMS(timerLeft(t)) : '00:00';
  return (
    <g fontFamily={SANS}>
      <Bg color="#0D1222" />
      <StatusBar t={t} frame={frame} />
      <text x={PHONE_W / 2} y={420} fontSize={96} fill={C.amber} textAnchor="middle" fontWeight={300}>{text}</text>
      <g opacity={p} transform={`translate(0,${(1 - p) * -30})`}>
        <rect x={24} y={90} width={412} height={128} rx={24} fill="#242B45" />
        <text x={50} y={136} fontSize={18} fill={C.white} opacity={0.6} fontWeight={700} letterSpacing={2}>LOOP</text>
        <text x={50} y={182} fontSize={26} fill={C.white} fontWeight={700}>14 new videos you might like</text>
      </g>
    </g>
  );
};

/** Group chat notification (scene 3). */
export const ScreenChat: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const p = seg(t, S(3) + 1.4, S(3) + 1.8, easeOut);
  return (
    <g fontFamily={SANS}>
      <Bg color="#0B1020" />
      <StatusBar t={t} frame={frame} />
      <text x={PHONE_W / 2} y={420} fontSize={96} fill={C.white} textAnchor="middle" fontWeight={300} opacity={0.9}>
        {fmtClock(clockMinutes(t), false)}
      </text>
      <g opacity={p} transform={`translate(0,${(1 - p) * -30})`}>
        <rect x={24} y={90} width={412} height={120} rx={24} fill="#242B45" />
        <text x={50} y={134} fontSize={18} fill={C.white} opacity={0.6} fontWeight={700} letterSpacing={2}>GROUP CHAT</text>
        <text x={50} y={178} fontSize={28} fill={C.white} fontWeight={700}>12 unread</text>
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ laptop screens (drawn in a 1000 × 620 box) */
export const LAP_W = 1000;
export const LAP_H = 620;

export const LapDesktop: React.FC<{t: number; frame: number; cursor?: {x: number; y: number}}> = ({t, cursor}) => (
  <g fontFamily={SANS}>
    <rect width={LAP_W} height={LAP_H} fill="#0F1626" />
    <rect width={LAP_W} height={34} fill="#0A0F1C" />
    <text x={LAP_W - 24} y={23} fontSize={17} fill={C.white} textAnchor="end" opacity={0.85}>{fmtClock(clockMinutes(t))}</text>
    <g transform="translate(80,90)">
      <path d="M 0,18 L 0,66 Q 0,72 6,72 L 80,72 Q 86,72 86,66 L 86,26 Q 86,20 80,20 L 40,20 L 32,8 L 6,8 Q 0,8 0,14 Z" fill="#3D5A8C" />
      <text x={43} y={106} fontSize={17} fill={C.white} textAnchor="middle" fontWeight={600}>DREAM_PROJECT_v1</text>
    </g>
    {cursor ? <path transform={`translate(${cursor.x},${cursor.y})`} d="M 0,0 L 0,26 L 7,20 L 12,32 L 17,30 L 12,19 L 21,19 Z" fill={C.white} stroke="#000" strokeWidth={1.5} /> : null}
  </g>
);

const DOC_TEXT = ['IDEA 1:', 'Make something small that works.'];
export const LapDoc: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const n = Math.max(0, keysTyped(t));
  const total = DOC_TEXT.join('\n');
  const typed = total.slice(0, Math.min(total.length, n));
  const [l1, l2 = ''] = typed.split('\n');
  const extra = Math.max(0, n - total.length);
  const bars = Math.min(14, Math.floor(extra / 9));
  const words = Math.floor(n / 5.2);
  const caret = Math.floor(frame / 15) % 2 === 0;
  return (
    <g fontFamily={SANS}>
      <rect width={LAP_W} height={LAP_H} fill={C.cream} />
      <rect width={LAP_W} height={46} fill="#E9DDBF" />
      <text x={LAP_W / 2} y={30} fontSize={18} fill="#3C4457" textAnchor="middle" fontWeight={600}>{n > 0 ? 'Untitled' : 'Untitled'}</text>
      <text x={LAP_W - 24} y={30} fontSize={18} fill="#3C4457" textAnchor="end">{words} words</text>
      <text x={90} y={140} fontSize={44} fill="#1B2030" fontWeight={800}>
        {l1}
        {typed.indexOf('\n') < 0 && caret ? <tspan fill={C.rose}>|</tspan> : null}
      </text>
      <text x={90} y={200} fontSize={32} fill="#2A3040">
        {l2}
        {typed.indexOf('\n') >= 0 && extra === 0 && caret ? <tspan fill={C.rose}>|</tspan> : null}
      </text>
      {Array.from({length: bars}, (_, i) => (
        <rect key={i} x={90} y={250 + i * 26} width={i === bars - 1 ? 60 + ((extra % 9) / 9) * 600 : 560 + ((i * 97) % 220)} height={11} rx={5} fill="#2A3040" opacity={0.55} />
      ))}
    </g>
  );
};
