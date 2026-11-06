// Reusable SVG illustration primitives (all procedural, no external images). Canvas is 1920×1080.
import React from 'react';
export const W = 1920, H = 1080;
export const rng = (seed: number) => { let a = seed >>> 0; return () => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; }; };
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t));
export const ramp = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
export const INK = '#1d130c', STONE = '#dcbc8c', STONE2 = '#b48f62', SHADE = '#7b5a3a', TERRA = '#b4532e', RED = '#a3201f', GOLD = '#d9a93f', PURPLE = '#5a3478', WHITE = '#efe3c8';

export const Sky = ({ id = 'sky', stops, h = H }: { id?: string; stops: [number, string][]; h?: number }) => (
  <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}</linearGradient></defs><rect width={W} height={h} fill={`url(#${id})`} /></>
);
export const Sun = ({ x, y, r = 60, color = '#ffe2a0', glow = 520 }: any) => (
  <><defs><radialGradient id={`sun${x}${y}`}><stop offset="0" stopColor={color} stopOpacity="0.95" /><stop offset="0.25" stopColor="#ffbf6a" stopOpacity="0.5" /><stop offset="1" stopColor="#ff9a4a" stopOpacity="0" /></radialGradient></defs>
    <circle cx={x} cy={y} r={glow} fill={`url(#sun${x}${y})`} /><circle cx={x} cy={y} r={r} fill={color} /></>
);
export const Ridge = ({ seed = 1, y, amp = 80, color = '#6b4a35', step = 30, freq = 1, base = H, x0 = -80, x1 = W + 80, id }: any) => {
  const r = rng(seed); const ph = [r() * 6, r() * 6, r() * 6]; let d = `M${x0} ${base} L${x0} ${y}`;
  for (let x = x0; x <= x1; x += step) d += ` L${x} ${y - amp * (0.5 * Math.sin(x * 0.004 * freq + ph[0]) + 0.3 * Math.sin(x * 0.011 * freq + ph[1]) + 0.2 * Math.sin(x * 0.027 * freq + ph[2]))}`;
  return <path d={d + ` L${x1} ${base} Z`} fill={color} />;
};
export const Haze = ({ y, h = 220, color = '#f4c88a', o = 0.5 }: any) => (
  <><defs><linearGradient id={`hz${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0" /><stop offset="1" stopColor={color} stopOpacity={o} /></linearGradient></defs><rect x="0" y={y} width={W} height={h} fill={`url(#hz${y})`} /></>
);
export const Clouds = ({ seed = 3, n = 6, y0 = 60, y1 = 380, f = 0, color = '#ffe3b8', o = 0.35 }: any) => {
  const r = rng(seed); return <g opacity={o}>{Array.from({ length: n }, (_, i) => { const x = ((r() * (W + 600) + f * (0.15 + r() * 0.3)) % (W + 600)) - 300, y = lerp(y0, y1, r()), s = 0.6 + r(); return <g key={i} transform={`translate(${x} ${y}) scale(${s})`} fill={color}><ellipse cx="0" cy="0" rx="150" ry="22" /><ellipse cx="-60" cy="-14" rx="80" ry="20" /><ellipse cx="50" cy="-18" rx="90" ry="24" /></g>; })}</g>;
};
export const Column = ({ x, y, h, w = 34, fill = STONE, cap = true }: any) => (
  <g><rect x={x - w / 2} y={y - h} width={w} height={h} fill={fill} /><rect x={x + w * 0.12} y={y - h} width={w * 0.38} height={h} fill={SHADE} opacity="0.35" />
    {Array.from({ length: 4 }, (_, i) => <line key={i} x1={x - w / 2 + (i + 1) * (w / 5)} y1={y - h} x2={x - w / 2 + (i + 1) * (w / 5)} y2={y} stroke={SHADE} strokeOpacity="0.4" />)}
    {cap && <><rect x={x - w * 0.68} y={y - h - 12} width={w * 1.36} height="12" fill={fill} /><rect x={x - w * 0.6} y={y - h - 20} width={w * 1.2} height="8" fill={STONE2} /></>}
    <rect x={x - w * 0.62} y={y - 10} width={w * 1.24} height="10" fill={STONE2} /></g>
);
export const Block = ({ x, y, w, h, fill = STONE, shade = SHADE, roof }: any) => (
  <g><rect x={x} y={y - h} width={w} height={h} fill={fill} /><rect x={x + w * 0.7} y={y - h} width={w * 0.3} height={h} fill={shade} opacity="0.35" />{roof && <polygon points={`${x - 6},${y - h} ${x + w / 2},${y - h - roof} ${x + w + 6},${y - h}`} fill={TERRA} />}</g>
);
export const Arcade = ({ x, y, w, h, n, fill = STONE, dark = '#2a1a10', pil = 8 }: any) => {
  const cw = w / n; return <g><rect x={x} y={y - h} width={w} height={h} fill={fill} />{Array.from({ length: n }, (_, i) => { const ax = x + i * cw + cw * 0.18, aw = cw * 0.64; return <path key={i} d={`M${ax} ${y} L${ax} ${y - h * 0.55} A${aw / 2} ${aw / 2} 0 0 1 ${ax + aw} ${y - h * 0.55} L${ax + aw} ${y} Z`} fill={dark} />; })}
    <rect x={x} y={y - h} width={w} height={pil * 0.6} fill={STONE2} /><rect x={x + w * 0.75} y={y - h} width={w * 0.25} height={h} fill={SHADE} opacity="0.25" /></g>;
};
export const Temple = ({ x, y, w, h, n = 6, fill = STONE, roof = TERRA }: any) => (
  <g><rect x={x - 12} y={y - 14} width={w + 24} height="14" fill={STONE2} /><rect x={x - 6} y={y - 28} width={w + 12} height="14" fill={fill} />
    {Array.from({ length: n }, (_, i) => <Column key={i} x={x + 18 + (i * (w - 36)) / (n - 1)} y={y - 28} h={h} w={Math.min(30, w / n / 1.6)} fill={fill} />)}
    <polygon points={`${x - 14},${y - 28 - h - 22} ${x + w / 2},${y - 28 - h - 22 - h * 0.32} ${x + w + 14},${y - 28 - h - 22}`} fill={fill} stroke={STONE2} strokeWidth="3" />
    <polygon points={`${x + 10},${y - 28 - h - 26} ${x + w / 2},${y - 28 - h - 26 - h * 0.22} ${x + w - 10},${y - 28 - h - 26}`} fill={roof} opacity="0.55" />
    <rect x={x - 14} y={y - 28 - h - 22} width={w + 28} height="22" fill={fill} /></g>
);
export const Insula = ({ x, y, w, h, seed = 1 }: any) => {
  const r = rng(seed); const rows = Math.floor(h / 34), cols = Math.max(2, Math.floor(w / 30)); const wall = ['#c9a06c', '#bf9462', '#d3ad7a', '#b98a5a'][Math.floor(r() * 4)];
  return <g><rect x={x} y={y - h} width={w} height={h} fill={wall} /><rect x={x + w * 0.72} y={y - h} width={w * 0.28} height={h} fill={SHADE} opacity="0.3" /><polygon points={`${x - 5},${y - h} ${x + w / 2},${y - h - 18} ${x + w + 5},${y - h}`} fill={TERRA} />
    {Array.from({ length: rows }, (_, a) => Array.from({ length: cols }, (_, b) => <rect key={`${a}${b}`} x={x + 8 + b * ((w - 16) / cols)} y={y - h + 10 + a * 34} width="9" height="14" fill={r() < 0.25 ? '#ffcf7a' : '#3a2415'} />))}</g>;
};
export const Hut = ({ x, y, s = 1 }: any) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x="-26" y="-34" width="52" height="34" fill="#8a6540" /><polygon points="-36,-32 0,-78 36,-32" fill="#b99552" /><polygon points="0,-78 36,-32 8,-32" fill="#7b5d2e" opacity="0.6" /><rect x="-7" y="-22" width="14" height="22" fill="#2a1a10" /></g>
);
export const Pine = ({ x, y, s = 1, c = '#2f4a2c' }: any) => (<g transform={`translate(${x} ${y}) scale(${s})`}><rect x="-4" y="-30" width="8" height="30" fill="#4a3322" /><ellipse cx="0" cy="-62" rx="34" ry="26" fill={c} /><ellipse cx="-10" cy="-72" rx="22" ry="16" fill={c} opacity="0.8" /></g>);
export const Cypress = ({ x, y, s = 1, c = '#26391f' }: any) => (<g transform={`translate(${x} ${y}) scale(${s})`}><rect x="-3" y="-20" width="6" height="20" fill="#3f2d1e" /><ellipse cx="0" cy="-70" rx="14" ry="56" fill={c} /></g>);
export const Mountain = ({ x, y, w, h, color = '#7e8aa0', snow = true, seed = 1 }: any) => {
  const r = rng(seed), pk = [[0, 0], [0.18, -0.45 - r() * 0.1], [0.34, -0.3], [0.5, -1], [0.66, -0.55], [0.82, -0.7], [1, 0]]; const pts = pk.map(([a, b]) => `${x + a * w},${y + b * h}`).join(' ');
  return <g><polygon points={pts} fill={color} />{snow && <polygon points={`${x + 0.5 * w},${y - h} ${x + 0.4 * w},${y - 0.72 * h} ${x + 0.47 * w},${y - 0.78 * h} ${x + 0.52 * w},${y - 0.68 * h} ${x + 0.58 * w},${y - 0.75 * h} ${x + 0.62 * w},${y - 0.6 * h}`} fill="#f4f1ea" />}<polygon points={`${x + 0.5 * w},${y - h} ${x + 0.66 * w},${y - 0.55 * h} ${x + 0.82 * w},${y - 0.7 * h} ${x + w},${y} ${x + 0.55 * w},${y}`} fill="#000" opacity="0.18" /></g>;
};
export const Soldier = ({ x, y, s = 1, f = 0, ph = 0, flip = false, tunic = RED, shield = RED, plume = RED, march = true, pilum = true, helm = '#a8895a' }: any) => {
  const sw = march ? Math.sin(f * 0.28 + ph) : 0, b = march ? Math.abs(Math.cos(f * 0.28 + ph)) * 2 : 0;
  return <g transform={`translate(${x} ${y - b * s}) scale(${flip ? -s : s} ${s})`}>
    <line x1="-3" y1="-40" x2={-3 + sw * 11} y2="0" stroke="#2a1a10" strokeWidth="6" strokeLinecap="round" /><line x1="3" y1="-40" x2={3 - sw * 11} y2="0" stroke="#2a1a10" strokeWidth="6" strokeLinecap="round" />
    <rect x="-9" y="-80" width="18" height="42" rx="4" fill={tunic} /><rect x="-9" y="-50" width="18" height="5" fill="#3a2415" /><rect x="-9" y="-44" width="18" height="8" fill={tunic} opacity="0.85" />
    {pilum && <line x1="9" y1="-30" x2="14" y2="-118" stroke="#3a2415" strokeWidth="2.4" />}{pilum && <polygon points="14,-118 11.5,-128 16.5,-128" fill="#9aa0a6" />}
    <circle cx="0" cy="-88" r="8" fill="#d9a97f" /><path d="M-9 -88 A9 9 0 0 1 9 -88 L9 -84 L-9 -84 Z" fill={helm} /><path d={`M-2 -97 Q4 -112 12 -98 L2 -96 Z`} fill={plume} />
    <rect x="1" y="-76" width="17" height="38" rx="5" fill={shield} stroke="#2a1a10" strokeWidth="1.6" /><circle cx="9.5" cy="-57" r="3.6" fill={GOLD} /><line x1="9.5" y1="-76" x2="9.5" y2="-38" stroke={GOLD} strokeWidth="1.4" opacity="0.8" /></g>;
};
export const Person = ({ x, y, s = 1, f = 0, ph = 0, col = '#c9a46c', head = '#d9a97f', hat, carry, walk = true, toga }: any) => {
  const sw = walk ? Math.sin(f * 0.22 + ph) : 0; return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1="-3" y1="-34" x2={-3 + sw * 8} y2="0" stroke="#3a2415" strokeWidth="5" strokeLinecap="round" /><line x1="3" y1="-34" x2={3 - sw * 8} y2="0" stroke="#3a2415" strokeWidth="5" strokeLinecap="round" />
    <path d={toga ? 'M-12 -78 L12 -78 L16 -8 L-16 -8 Z' : 'M-10 -76 L10 -76 L12 -30 L-12 -30 Z'} fill={toga ? WHITE : col} />{toga && <path d="M-12 -78 L-4 -78 L8 -8 L0 -8 Z" fill={PURPLE} opacity="0.85" />}
    <circle cx="0" cy="-85" r="8" fill={head} />{hat && <ellipse cx="0" cy="-90" rx="12" ry="3.5" fill="#6b4a2a" />}{carry === 'basket' && <ellipse cx="12" cy="-48" rx="10" ry="6" fill="#8a6a3a" />}{carry === 'amphora' && <path d="M10 -72 q-6 10 0 26 q6 10 12 0 q6 -16 0 -26 z" fill={TERRA} />}</g>;
};
export const Standard = ({ x, y, s = 1, f = 0, kind = 'eagle' }: any) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><line x1="0" y1="0" x2="0" y2="-150" stroke="#3a2415" strokeWidth="4" />{kind === 'eagle' ? <path d="M-16 -168 Q0 -186 16 -168 Q6 -164 0 -154 Q-6 -164 -16 -168Z" fill={GOLD} /> : <rect x="-18" y="-160" width="36" height="22" fill={RED} stroke={GOLD} strokeWidth="2" />}
    <circle cx="0" cy="-112" r="6" fill={GOLD} /><circle cx="0" cy="-96" r="6" fill={GOLD} /><rect x="-14" y="-82" width={28} height="18" fill={RED} transform={`skewX(${Math.sin(f * 0.1) * 4})`} /></g>
);
export const Galley = ({ x, y, s = 1, f = 0, flip = false, hull = '#5a3a22', sail = '#efe3c8', stripe = RED, oars = true, fire = false, ram = true }: any) => {
  const bob = Math.sin(f * 0.07 + x) * 3, rock = Math.sin(f * 0.05 + x) * 1.5;
  return <g transform={`translate(${x} ${y + bob}) rotate(${rock}) scale(${flip ? -s : s} ${s})`}>
    {oars && Array.from({ length: 9 }, (_, i) => { const ox = -100 + i * 24, sw = Math.sin(f * 0.14 + i * 0.5) * 10; return <line key={i} x1={ox} y1="6" x2={ox - 14 + sw} y2="40" stroke="#3a2415" strokeWidth="3" />; })}
    <path d="M-135 -14 Q-110 22 0 26 Q110 22 150 -22 L140 -26 Q100 6 0 6 Q-100 6 -125 -22 Z" fill={hull} /><path d="M-135 -14 Q-110 22 0 26 Q110 22 150 -22" fill="none" stroke={stripe} strokeWidth="5" />
    {ram && <polygon points="150,-22 176,-6 150,-4" fill="#8a6a2a" />}<rect x="-6" y="-120" width="5" height="108" fill="#3a2415" /><path d={`M-1 -116 Q56 -90 52 -26 L-1 -26 Z`} fill={sail} /><path d={`M-1 -80 Q40 -68 40 -26 L-1 -26 Z`} fill={stripe} opacity="0.5" />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={-100 + i * 26} cy="-12" r="7" fill={stripe} stroke="#2a1a10" strokeWidth="1.5" />)}{fire && <Flame x={20} y={-60} s={1.6} f={f} />}</g>;
};
export const Elephant = ({ x, y, s = 1, f = 0, flip = false, col = '#6f6a66' }: any) => {
  const sw = Math.sin(f * 0.14 + x) * 7; return <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    {[-54, -26, 22, 50].map((lx, i) => <rect key={i} x={lx - 9 + (i % 2 ? sw : -sw) * 0.4} y="-30" width="18" height="38" rx="6" fill={i % 2 ? '#5a5551' : col} />)}
    <ellipse cx="0" cy="-60" rx="82" ry="52" fill={col} /><ellipse cx="86" cy="-76" rx="34" ry="32" fill={col} /><path d={`M108 -66 Q128 -30 ${108 + sw} 4`} stroke={col} strokeWidth="16" fill="none" strokeLinecap="round" /><path d="M104 -56 Q130 -50 138 -28" stroke="#efe3c8" strokeWidth="5" fill="none" /><ellipse cx="68" cy="-84" rx="20" ry="26" fill="#5a5551" /><circle cx="94" cy="-82" r="3.5" fill="#111" />
    <rect x="-40" y="-122" width="68" height="20" rx="6" fill={PURPLE} /><rect x="-30" y="-142" width="46" height="22" rx="4" fill="#3b2250" /><circle cx="-6" cy="-152" r="7" fill="#c89a6c" /></g>;
};
export const Flame = ({ x, y, s = 1, f = 0, seed = 1 }: any) => {
  const k = 1 + 0.18 * Math.sin(f * 0.6 + seed * 3) + 0.1 * Math.sin(f * 1.3 + seed); return <g transform={`translate(${x} ${y}) scale(${s} ${s * k})`}><path d="M0 0 C-22 -18 -14 -48 0 -78 C4 -50 22 -36 14 -14 C10 -4 4 0 0 0Z" fill="#ff7a1f" /><path d="M0 0 C-12 -10 -8 -30 0 -46 C3 -30 12 -22 8 -8Z" fill="#ffd25a" /></g>;
};
export const Smoke = ({ x, y, f = 0, n = 6, w = 40, color = '#2a2420', o = 0.35 }: any) => (<g>{Array.from({ length: n }, (_, i) => { const t = ((f * 0.8 + i * (200 / n)) % 200) / 200; return <ellipse key={i} cx={x + Math.sin(t * 6 + i) * 22 + t * 60} cy={y - t * 260} rx={w * (0.6 + t * 1.8)} ry={w * (0.4 + t * 1.2)} fill={color} opacity={o * (1 - t)} />; })}</g>);
export const Waves = ({ y0, y1, f = 0, c1 = '#2d5a6a', c2 = '#173542', amp = 7 }: any) => {
  const rows = 9; return <g>{Array.from({ length: rows }, (_, i) => { const y = lerp(y0, y1, i / (rows - 1)), a = amp * (0.4 + i / rows); let d = `M-40 ${y1 + 40} L-40 ${y}`; for (let x = -40; x <= W + 40; x += 30) d += ` L${x} ${y + a * Math.sin(x * (0.01 + i * 0.002) + f * 0.06 * (1 + i * 0.1) + i)}`; return <path key={i} d={d + ` L${W + 40} ${y1 + 40} Z`} fill={i % 2 ? c1 : c2} opacity={0.55 + 0.05 * i} />; })}</g>;
};
export const Particles = ({ n = 80, f = 0, seed = 1, kind = 'snow', color = '#fff', o = 0.8 }: any) => {
  const r = rng(seed); return <g fill={color} opacity={o}>{Array.from({ length: n }, (_, i) => { const x0 = r() * W, y0 = r() * H, sp = 0.5 + r() * 1.5, sz = 1 + r() * 2.4; let x = x0, y = y0, rr = sz;
    if (kind === 'snow') { y = (y0 + f * sp * 1.6) % H; x = (x0 + f * sp * 0.9 + Math.sin(f * 0.04 + i) * 14) % W; } else if (kind === 'ember') { y = H - ((H - y0 + f * sp * 1.4) % H); x = x0 + Math.sin(f * 0.05 + i) * 30; rr = sz * (0.6 + Math.sin(f * 0.2 + i) * 0.3); } else if (kind === 'dust') { x = (x0 + f * sp * 0.8) % W; y = y0 + Math.sin(f * 0.03 + i) * 8; rr = sz * 1.4; } else if (kind === 'motes') { x = x0 + Math.sin(f * 0.01 * sp + i) * 40; y = y0 + Math.cos(f * 0.012 * sp + i) * 30; }
    return <circle key={i} cx={x} cy={y} r={rr} />; })}</g>;
};
export const Birds = ({ f = 0, n = 7, seed = 2, y0 = 120, y1 = 400, color = INK }: any) => {
  const r = rng(seed); return <g stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round">{Array.from({ length: n }, (_, i) => { const x = ((r() * W + f * (1 + r() * 1.4)) % (W + 100)) - 50, y = lerp(y0, y1, r()) + Math.sin(f * 0.04 + i) * 14, fl = Math.sin(f * 0.3 + i * 2) * 5; return <path key={i} d={`M${x - 12} ${y - fl} Q${x - 5} ${y - 6} ${x} ${y} Q${x + 5} ${y - 6} ${x + 12} ${y - fl}`} />; })}</g>;
};
export const Amphora = ({ x, y, s = 1, c = TERRA }: any) => (<g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-8 -52 q-18 14 -14 34 q4 18 22 22 q18 -4 22 -22 q4 -20 -14 -34 z" fill={c} /><rect x="-7" y="-64" width="14" height="14" fill={c} /><path d="M-8 -60 q-14 4 -12 18 M8 -60 q14 4 12 18" stroke={c} strokeWidth="4" fill="none" /></g>);
export const Awning = ({ x, y, w, h = 120, c1 = RED, c2 = WHITE, goods = 'fruit', seed = 1 }: any) => {
  const r = rng(seed), n = Math.round(w / 26); return <g><rect x={x} y={y - h} width="6" height={h} fill="#3a2415" /><rect x={x + w - 6} y={y - h} width="6" height={h} fill="#3a2415" />{Array.from({ length: n }, (_, i) => <polygon key={i} points={`${x + i * (w / n)},${y - h} ${x + (i + 1) * (w / n)},${y - h} ${x + (i + 1) * (w / n) + 3},${y - h + 34} ${x + i * (w / n) - 3},${y - h + 34}`} fill={i % 2 ? c1 : c2} />)}
    <rect x={x} y={y - 40} width={w} height="40" fill="#6b4a2a" />{Array.from({ length: Math.round(w / 22) }, (_, i) => <circle key={i} cx={x + 12 + i * 22} cy={y - 46 - r() * 6} r="9" fill={goods === 'fruit' ? ['#c4452b', '#d9a93f', '#6b8f3a'][i % 3] : '#c9a46c'} />)}</g>;
};
export const Vignette = ({ o = 0.55 }: any) => (<><defs><radialGradient id="vg" cx="0.5" cy="0.5" r="0.75"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#120a04" stopOpacity={o} /></radialGradient></defs><rect width={W} height={H} fill="url(#vg)" /></>);
export const Rays = ({ x = 1500, y = -50, o = 0.16, f = 0 }: any) => (<g opacity={o * (0.8 + 0.2 * Math.sin(f * 0.03))} style={{ mixBlendMode: 'screen' } as any}>{Array.from({ length: 6 }, (_, i) => <polygon key={i} points={`${x},${y} ${x - 380 - i * 140},${H} ${x - 260 - i * 140},${H}`} fill="#ffd9a0" />)}</g>);
export const Colosseum = ({ cx, y, w = 1100, h = 420, f = 0, dusk = false }: any) => {
  const x = cx - w / 2, tiers = [0.27, 0.27, 0.27, 0.19]; let yy = y;
  return <g>{tiers.map((t, i) => { const th = h * t, tx = x + i * 14, tw = w - i * 28, node = i < 3 ? <Arcade key={i} x={tx} y={yy} w={tw} h={th} n={Math.round(tw / 52)} fill={i % 2 ? STONE : '#e3c597'} pil={10} /> : <g key={i}><rect x={tx} y={yy - th} width={tw} height={th} fill={STONE2} />{Array.from({ length: Math.round(tw / 52) }, (_, k) => <rect key={k} x={tx + 12 + k * (tw / Math.round(tw / 52))} y={yy - th + 16} width="14" height={th - 30} fill="#3a2415" />)}</g>; yy -= th; return node; })}
    <rect x={x + 34} y={yy - 8} width={w - 68} height="8" fill={STONE2} />{dusk && <rect x={x} y={y - h} width={w} height={h} fill="#2b1a3a" opacity="0.18" />}
    <defs><linearGradient id="colsh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="0.75" stopColor="#000" stopOpacity="0.05" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></linearGradient></defs><rect x={x} y={y - h} width={w} height={h} fill="url(#colsh)" /></g>;
};
