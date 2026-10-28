import React from 'react';
import {Parallax} from '../components/Stage';
import {clamp, lerp, rng} from '../lib/anim';
import {mix} from '../stone/art/Nature';
import {C} from './palette';
import {clockMinutes} from './timeline';

export const FLOOR = 900;
const INK = '#04060B';

/** Rain streaks (deterministic). `amount` 0..1. */
export const Rain: React.FC<{frame: number; amount: number; x0: number; y0: number; w: number; h: number; color?: string; seed?: number}> = ({frame, amount, x0, y0, w, h, color = '#9DB9D8', seed = 3}) => {
  if (amount <= 0.01) return null;
  const r = rng(seed);
  const n = Math.round(90 * amount);
  return (
    <g stroke={color} strokeWidth={1.6} strokeLinecap="round">
      {Array.from({length: n}, (_, i) => {
        const bx = r() * w;
        const sp = 18 + r() * 14;
        const len = 18 + r() * 26;
        const y = (((r() * h + frame * sp) % (h + 60)) + h + 60) % (h + 60) - 30;
        const x = x0 + ((bx - y * 0.12) % w + w) % w;
        return <line key={i} x1={x} y1={y0 + y} x2={x - len * 0.12} y2={y0 + y + len} opacity={0.15 + 0.35 * r()} />;
      })}
    </g>
  );
};

const CityWindow: React.FC<{frame: number; m: number; rain: number; x: number; y: number; w: number; h: number}> = ({frame, m, rain, x, y, w, h}) => {
  const r = rng(11);
  const sky0 = mix(C.void, '#6A93B8', m);
  const sky1 = mix('#18223D', C.peach, m);
  const buildings = Array.from({length: 13}, (_, i) => ({bx: x + (i / 13) * w + r() * 20 - 10, bw: 36 + r() * 46, bh: 90 + r() * 200}));
  return (
    <g>
      <defs>
        <linearGradient id="win-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={sky0} />
          <stop offset="1" stopColor={sky1} />
        </linearGradient>
        <clipPath id="win-clip">
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill="url(#win-sky)" />
      <g clipPath="url(#win-clip)">
        {m > 0.1 ? <circle cx={x + w * 0.7} cy={y + h * (0.86 - 0.5 * m)} r={70} fill={C.gold} opacity={0.75 * m} /> : null}
        {buildings.map((b, i) => (
          <g key={i}>
            <rect x={b.bx} y={y + h - b.bh} width={b.bw} height={b.bh} fill={mix('#0A0F1C', '#3A4A66', m * 0.7)} />
            {Array.from({length: Math.floor(b.bh / 34)}, (_, k) => (
              <rect key={k} x={b.bx + 6 + (k % 2) * 16} y={y + h - b.bh + 12 + k * 30} width={8} height={11} fill={C.lamp} opacity={(r() < 0.35 ? 0.85 : 0) * (1 - m * 0.8)} />
            ))}
          </g>
        ))}
        <Rain frame={frame} amount={rain} x0={x} y0={y} w={w} h={h} seed={5} />
      </g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={mix(C.ash, '#8B6B52', m)} strokeWidth={14} />
      <path d={`M ${x + w / 2},${y} V ${y + h} M ${x},${y + h * 0.5} H ${x + w}`} stroke={mix(C.ash, '#8B6B52', m)} strokeWidth={9} />
      {rain > 0.3 ? Array.from({length: 9}, (_, i) => <circle key={i} cx={x + 40 + ((i * 131) % (w - 80))} cy={y + 60 + ((i * 97 + frame * 0.6) % (h - 120))} r={2.4} fill="#CFE2F5" opacity={0.35} />) : null}
    </g>
  );
};

export const WallClock: React.FC<{x: number; y: number; t: number; r?: number; m?: number}> = ({x, y, t, r = 64, m = 0}) => {
  const mins = clockMinutes(t);
  const hAng = ((mins / 60) % 12) * 30;
  const mAng = (mins % 60) * 6;
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={r} fill={mix('#1A2236', C.cream, m)} stroke={INK} strokeWidth={6} />
      {Array.from({length: 12}, (_, i) => (
        <line key={i} x1={0} y1={-r + 8} x2={0} y2={-r + (i % 3 === 0 ? 20 : 14)} stroke={mix('#8793AE', '#3C4457', m)} strokeWidth={i % 3 === 0 ? 4 : 2} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={mix(C.white, INK, m)} strokeWidth={6} strokeLinecap="round" transform={`rotate(${hAng})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.78} stroke={mix(C.white, INK, m)} strokeWidth={4} strokeLinecap="round" transform={`rotate(${mAng})`} />
      <circle r={5} fill={C.alarm} />
    </g>
  );
};

type RoomProps = {
  frame: number;
  t: number;
  /** 0 = night, 1 = morning */
  m?: number;
  lamp?: number;
  /** laptop lid 0 closed .. 1 open, and screen glow 0..1 */
  lid?: number;
  glow?: number;
  phoneGlow?: number;
  phoneX?: number;
  rain?: number;
  dust?: number;
  notes?: number;
  /** mattress sink 0..1 */
  sink?: number;
  /** blackout 0..1 (everything dims, only streetlight slats remain) */
  dark?: number;
  streetlight?: number;
  children?: React.ReactNode;
  front?: React.ReactNode;
  clockOn?: boolean;
  plant?: number;
  pages?: number;
  duvetCover?: number;
};

/** The apartment, drawn in four planes (far / back / mid / front) so the camera can parallax through it. */
export const Room: React.FC<RoomProps> = ({frame, t, m = 0, lamp = 0, lid = 0, glow = 0, phoneGlow = 0, phoneX = 950, rain = 1, dust = 0, notes = 0, sink = 0, dark = 0, streetlight = 1, children, front, plant = 0, pages = 0, duvetCover = 0}) => {
  const wall = mix('#141B2D', '#E9C9A4', m);
  const wall2 = mix('#0E1423', '#D9AE86', m);
  const floor = mix('#0C101B', '#8B6A52', m);
  const wood = mix('#1D2438', '#A27B58', m);
  const woodDark = mix('#111726', '#7C5A40', m);
  const r = rng(21);
  const lampCone = lamp;
  return (
    <g>
      <rect x={-1500} y={-900} width={4900} height={2900} fill={mix('#06080F', '#C8A27F', m)} />
      {/* FAR: the window onto the city */}
      <Parallax depth={0.55}>
        <rect x={-300} y={-100} width={2500} height={FLOOR + 100} fill={wall} />
        <CityWindow frame={frame} m={m} rain={rain} x={130} y={150} w={520} h={470} />
        {streetlight > 0.02 ? <polygon points={`130,620 650,620 1010,${FLOOR} 330,${FLOOR}`} fill={mix('#6FA8DC', C.gold, m)} opacity={(0.05 + 0.06 * m) * streetlight} /> : null}
      </Parallax>
      {/* BACK: wall dressing */}
      <Parallax depth={0.8}>
        <rect x={-300} y={560} width={2500} height={400} fill={wall2} />
        <WallClock x={820} y={250} t={t} m={m} />
        <g>
          <rect x={980} y={330} width={330} height={14} fill={wood} stroke={INK} strokeWidth={3} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={996 + i * 30} y={330 - 70 - (i % 3) * 14} width={24} height={70 + (i % 3) * 14} fill={['#2A3858', '#5C2A3A', '#33503E', '#6A5530', '#2E4A6A', '#4A3358'][i]} opacity={lerp(0.7, 1, m)} stroke={INK} strokeWidth={2} />
          ))}
          <g transform="translate(1270,330)">
            <path d="M -22,0 L -30,-46 L 30,-46 L 22,0 Z" fill={mix('#3A2A22', '#B07040', m)} stroke={INK} strokeWidth={3} />
            {Array.from({length: 5 + Math.round(plant * 6)}, (_, i) => (
              <path key={i} d={`M 0,-46 Q ${(i - 4) * 14},${-90 - i * 10 - plant * 24} ${(i - 3) * 26},${-60 - i * 6 - plant * 18}`} stroke={mix('#1F3B2C', C.sage, m)} strokeWidth={9} fill="none" strokeLinecap="round" />
            ))}
          </g>
        </g>
        {/* sticky notes: the pile of broken promises */}
        {Array.from({length: Math.min(notes, 9)}, (_, i) => (
          <g key={i} transform={`translate(${440 + (i % 3) * 78},${360 + Math.floor(i / 3) * 70}) rotate(${(r() - 0.5) * 12})`}>
            <rect width={66} height={60} fill={i % 2 ? C.amber : '#F4D56A'} opacity={0.9} stroke={INK} strokeWidth={2} />
            <text x={33} y={36} fontSize={11} fontFamily="'Inter', sans-serif" fontWeight={800} textAnchor="middle" fill="#3A2A05">{['TOMORROW', 'TOMORROW!!', 'TOMORROW (for real)'][i % 3].split(' ')[0]}</text>
          </g>
        ))}
        <g transform={`translate(1500,${FLOOR - 400})`} opacity={0.0} />
      </Parallax>
      {/* MID: floor, desk, chair, bed, props and the characters */}
      <rect x={-1500} y={FLOOR} width={4900} height={1200} fill={floor} />
      <rect x={-1500} y={FLOOR} width={4900} height={6} fill={INK} />
      <g>
        {/* desk */}
        <rect x={300} y={706} width={800} height={22} fill={wood} stroke={INK} strokeWidth={4} />
        <rect x={330} y={728} width={18} height={FLOOR - 728} fill={woodDark} stroke={INK} strokeWidth={3} />
        <rect x={1040} y={728} width={18} height={FLOOR - 728} fill={woodDark} stroke={INK} strokeWidth={3} />
        <rect x={640} y={728} width={330} height={96} fill={woodDark} stroke={INK} strokeWidth={3} />
        {/* laptop (side view): base, hinge at x=470 */}
        <rect x={640} y={692} width={240} height={14} rx={4} fill={mix('#222B40', '#7A6A5A', m)} stroke={INK} strokeWidth={3} />
        <g transform={`translate(665,692) rotate(${lerp(0, -105, lid)})`}>
          <rect x={0} y={-8} width={215} height={9} rx={3} fill={mix('#2A3550', '#8A7B6A', m)} stroke={INK} strokeWidth={3} />
          {lid < 0.1 ? <text x={108} y={-1} fontSize={8} fontFamily="'Inter', sans-serif" fill={C.white} opacity={0.5} textAnchor="middle">SHIP IT</text> : null}
        </g>
        {dust > 0.02 ? Array.from({length: Math.round(26 * dust)}, (_, i) => <circle key={i} cx={680 + ((i * 53) % 190)} cy={686 - ((i * 7) % 6)} r={1.6} fill="#8793AE" opacity={0.55} />) : null}
        {/* the laptop's light */}
        {glow > 0.02 ? <ellipse cx={820} cy={640} rx={560} ry={330} fill={`url(#glow-blue)`} opacity={glow} /> : null}
        {/* pages stack */}
        {pages > 0 ? Array.from({length: Math.min(9, pages)}, (_, i) => <rect key={i} x={950} y={700 - i * 4} width={92} height={4} fill={C.cream} stroke={INK} strokeWidth={1.4} />) : null}
        {/* phone on desk (lying down) */}
        <g transform={`translate(${phoneX},706)`}>
          <rect x={-34} y={-8} width={70} height={8} rx={3} fill={phoneGlow > 0.02 ? mix('#1B2540', '#6FA8DC', phoneGlow) : '#0B1020'} stroke={INK} strokeWidth={2.5} />
        </g>
        {phoneGlow > 0.02 ? <ellipse cx={phoneX} cy={690} rx={240} ry={120} fill="url(#glow-blue)" opacity={phoneGlow * 0.75} /> : null}
        {/* desk lamp */}
        <g transform="translate(330,706) scale(-1,1)">
          <path d="M 0,0 L 0,-26 L -30,-130 L -96,-190" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M 0,0 L 0,-26 L -30,-130 L -96,-190" stroke={mix('#3C4457', '#C2884A', m)} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M -128,-176 L -64,-176 L -76,-196 L -116,-196 Z" fill={mix('#2A3550', '#D7A15A', m)} stroke={INK} strokeWidth={3} />
          {lampCone > 0.02 ? <polygon points="-120,-176 -72,-176 140,26 -330,26" fill={C.lamp} opacity={0.28 * lampCone} /> : null}
          {lampCone > 0.02 ? <ellipse cx={-96} cy={-176} rx={150 * lampCone} ry={120 * lampCone} fill="url(#glow-warm)" opacity={lampCone} /> : null}
        </g>
        {/* chair */}
        <g>
          <rect x={920} y={812} width={170} height={16} rx={6} fill={mix('#222B40', '#6A4A38', m)} stroke={INK} strokeWidth={3.5} />
          <rect x={1082} y={650} width={14} height={170} rx={5} fill={mix('#222B40', '#6A4A38', m)} stroke={INK} strokeWidth={3.5} />
          <rect x={1000} y={828} width={12} height={50} fill={INK} />
          <path d={`M 914,${FLOOR - 6} H 1104 M 954,${FLOOR - 6} l -16,-4 M 1064,${FLOOR - 6} l 16,-4`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <path d="M 1090,700 l 6,38 l -14,0 z" fill={C.white} opacity={0.5} />
        </g>
        {/* bed */}
        <g>
          <rect x={1370} y={812} width={520} height={FLOOR - 812} fill={mix('#1A2238', '#7A5A44', m)} stroke={INK} strokeWidth={4} />
          <rect x={1860} y={620} width={34} height={FLOOR - 620} fill={mix('#222B40', '#6A4A38', m)} stroke={INK} strokeWidth={4} />
          <path d={`M 1370,${812 + sink * 10} Q 1620,${790 + sink * 34} 1860,${812 + sink * 10} L 1860,834 L 1370,834 Z`} fill={mix('#232C48', '#E8D2B0', m)} stroke={INK} strokeWidth={4} />
          <ellipse cx={1790} cy={782 + sink * 8} rx={78} ry={22} fill={mix('#2B3558', C.cream, m)} stroke={INK} strokeWidth={3.5} />
          {duvetCover > 0.02 ? <path d={`M 1460,${806 + sink * 10} Q 1640,${744 + sink * 20} 1850,${782 + sink * 8} L 1850,830 L 1460,830 Z`} fill={mix('#2E3A5E', '#F2DCC0', m)} stroke={INK} strokeWidth={4} opacity={duvetCover} /> : null}
        </g>
        {/* bedside clock */}
        <g transform="translate(1310,808)">
          <rect x={-40} y={-62} width={80} height={62} rx={8} fill="#0B1020" stroke={INK} strokeWidth={3} />
          <rect x={-60} y={-4} width={120} height={92} fill={mix('#1D2438', '#A27B58', m)} stroke={INK} strokeWidth={3} />
        </g>
      </g>
      {children}
      <defs>
        <radialGradient id="glow-blue">
          <stop offset="0" stopColor="#6FA8DC" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#2B4C7E" stopOpacity="0.22" />
          <stop offset="1" stopColor="#2B4C7E" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow-warm">
          <stop offset="0" stopColor="#FFD27D" stopOpacity="0.6" />
          <stop offset="0.5" stopColor="#F7B267" stopOpacity="0.22" />
          <stop offset="1" stopColor="#F7B267" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* FRONT: out-of-focus foreground */}
      <Parallax depth={1.35}>{front}</Parallax>
      <rect x={-1500} y={-900} width={4900} height={2900} fill="#02030A" opacity={clamp(dark)} />
    </g>
  );
};

export const Slats: React.FC<{opacity: number}> = ({opacity}) => (
  <g opacity={opacity}>
    {[0, 1, 2, 3, 4].map((i) => (
      <polygon key={i} points={`${120 + i * 36},150 ${150 + i * 36},150 ${700 + i * 90},${FLOOR} ${660 + i * 90},${FLOOR}`} fill="#6FA8DC" opacity={0.06} />
    ))}
  </g>
);
