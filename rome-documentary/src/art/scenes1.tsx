// Illustrated scenes, part 1 — The Hook, The Beginning, The Republic. Each scene is a pure function of (f = frame, p = progress 0..1, d = duration frames).
import React from 'react';
import { W, H, rng, lerp, ease, ramp, clamp, INK, STONE, STONE2, SHADE, TERRA, RED, GOLD, PURPLE, WHITE, Sky, Sun, Ridge, Haze, Clouds, Column, Block, Arcade, Temple, Insula, Hut, Pine, Cypress, Mountain, Soldier, Person, Standard, Galley, Elephant, Flame, Smoke, Waves, Particles, Birds, Amphora, Awning, Rays, Colosseum } from './prims';
export type SceneProps = { f: number; p: number; d: number };
const goldSky: [number, string][] = [[0, '#34405f'], [0.35, '#b9694a'], [0.62, '#f0a35a'], [1, '#ffd48a']];
const Vig = () => <><defs><radialGradient id="vg2" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#120a04" stopOpacity="0.55" /></radialGradient></defs><rect width={W} height={H} fill="url(#vg2)" /></>;

export const Aerial = ({ f, p }: SceneProps) => {
  const rows = 8; const row = (k: number) => { const t = k / (rows - 1), sc = lerp(0.3, 1.5, t * t), y = lerp(500, 1170, Math.pow(t, 1.25)) + p * 70 * t; return { sc, y }; };
  return <g><Sky stops={goldSky} h={620} /><Sun x={1380} y={430} r={54} glow={640} /><Clouds f={f} o={0.4} /><Ridge seed={3} y={500} amp={50} color="#8a6a7a" base={620} /><Ridge seed={9} y={530} amp={34} color="#7a5a56" base={640} /><rect y="500" width={W} height={H} fill="#8f6a4a" />
    {Array.from({ length: rows }, (_, k) => { const { sc, y } = row(k); const rr = rng(100 + k); const items: React.ReactNode[] = []; let x = -80 - rr() * 60;
      while (x < W + 100) { const w = (50 + rr() * 80) * sc, h = (40 + rr() * 90) * sc, big = rr() < 0.06; items.push(big ? <Temple key={x} x={x} y={y} w={w * 1.5} h={h * 0.9} n={4} /> : <Insula key={x} x={x} y={y} w={w} h={h} seed={Math.floor(rr() * 99)} />); x += w + (6 + rr() * 16) * sc; }
      const river = k === 3 ? <path key="rv" d={`M-40 ${y + 30 * sc} C 500 ${y - 40 * sc}, 1100 ${y + 70 * sc}, 2000 ${y - 10 * sc} L2000 ${y + 60 * sc} C1100 ${y + 120 * sc}, 500 ${y + 20 * sc}, -40 ${y + 90 * sc} Z`} fill="#5f8fa0" opacity="0.9" /> : null;
      return <g key={k}>{river}{items}</g>; })}
    <Colosseum cx={560 - p * 90} y={row(5).y + 20} w={560 * row(5).sc * 1.2} h={210 * row(5).sc * 1.2} />
    {[0, 1, 2].map((i) => <Smoke key={i} x={300 + i * 520} y={620 + i * 20} f={f + i * 40} n={4} w={18} o={0.22} />)}
    <Haze y={470} h={230} color="#f2b983" o={0.55} /><Birds f={f} y0={150} y1={420} /><Particles kind="motes" n={50} f={f} color="#ffe6b0" o={0.5} /></g>;
};
export const ColosseumScene = ({ f }: SceneProps) => (
  <g><Sky stops={goldSky} /><Sun x={1500} y={330} r={58} glow={720} /><Clouds f={f} /><Ridge seed={4} y={640} amp={60} color="#7a5a56" /><Ridge seed={5} y={720} amp={40} color="#5d4339" />
    {[120, 260, 1560, 1720, 1820].map((x, i) => <Cypress key={i} x={x} y={900 + (i % 2) * 20} s={1.6 + (i % 3) * 0.3} />)}
    <rect y="900" width={W} height="200" fill="#6b4a33" /><Colosseum cx={960} y={900} w={1280} h={500} f={f} />
    {Array.from({ length: 26 }, (_, i) => <Person key={i} x={((i * 83 + f * (0.4 + (i % 4) * 0.2)) % (W + 120)) - 60} y={955 + (i % 5) * 18} s={0.5 + (i % 3) * 0.12} f={f} ph={i} col={['#b48f62', '#a36a4a', '#c9b48a', '#8a6a4a'][i % 4]} toga={i % 6 === 0} />)}
    <Rays x={1500} y={-40} o={0.2} f={f} /><Birds f={f} n={9} y0={100} y1={380} /><Haze y={720} h={200} o={0.4} /></g>
);
export const ColosseumDusk = ({ f }: SceneProps) => (
  <g><Sky stops={[[0, '#1b1f45'], [0.45, '#6a3a6a'], [0.75, '#e0714a'], [1, '#ffb868']]} /><Sun x={400} y={640} r={46} glow={560} color="#ffc27a" /><Clouds f={f} color="#c98aa0" o={0.35} /><Ridge seed={14} y={700} amp={50} color="#3a2a44" /><rect y="910" width={W} height="200" fill="#2e2030" />
    <Colosseum cx={1060} y={910} w={1300} h={520} f={f} dusk />{[300, 360, 1700].map((x, i) => <Cypress key={i} x={x} y={920} s={2 + i * 0.2} c="#14201a" />)}<Birds f={f} n={11} y0={120} y1={420} /><Particles kind="motes" n={50} f={f} color="#ffcf8a" o={0.4} /><Vig /></g>
);
export const Market = ({ f }: SceneProps) => {
  const stalls = [60, 520, 980, 1440]; return <g><Sky stops={[[0, '#f7d9a0'], [1, '#ffecc8']]} h={700} /><rect y="300" width={W} height="500" fill="#d9b98a" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <Block key={i} x={i * 300 - 40} y={560} w={280} h={260 + (i % 3) * 60} fill={['#c9a06c', '#d3ad7a', '#bf9462'][i % 3]} roof={30} />)}
    <rect y="560" width={W} height="540" fill="#a9825a" />{Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 150} y="560" width="2" height="540" fill="#8a6540" opacity="0.25" />)}
    {stalls.map((x, i) => <Awning key={i} x={x} y={700} w={380} c1={[RED, '#2f6a5a', GOLD, RED][i]} seed={i} goods={i % 2 ? 'grain' : 'fruit'} />)}
    {[200, 700, 1180, 1660].map((x, i) => <g key={i}><Amphora x={x} y={760} s={1.1} /><Amphora x={x + 34} y={766} s={0.95} /></g>)}
    {Array.from({ length: 30 }, (_, i) => { const dir = i % 2 ? 1 : -1, sp = 0.7 + (i % 5) * 0.25; return <Person key={i} x={((((i * 131) + f * sp * dir) % (W + 200)) + W + 200) % (W + 200) - 100} y={850 + (i % 6) * 34} s={0.9 + (i % 6) * 0.14} f={f} ph={i * 1.3} col={['#a36a4a', '#c9b48a', '#5a7a6a', '#b4532e', '#8a7a9a'][i % 5]} carry={i % 4 === 0 ? 'basket' : i % 7 === 0 ? 'amphora' : undefined} toga={i % 9 === 0} hat={i % 5 === 0} />; })}
    <Rays x={1700} y={-40} o={0.18} f={f} /><Particles kind="dust" n={40} f={f} color="#ffe6b0" o={0.4} /></g>;
};
export const March = ({ f }: SceneProps) => (
  <g><Sky stops={goldSky} /><Sun x={400} y={420} r={50} glow={600} /><Clouds f={f} /><Ridge seed={11} y={560} amp={70} color="#8a6a7a" /><Ridge seed={12} y={640} amp={50} color="#6a4a46" />{Array.from({ length: 12 }, (_, i) => <Cypress key={i} x={80 + i * 170} y={700 + (i % 3) * 12} s={1.2 + (i % 4) * 0.2} />)}
    <rect y="720" width={W} height="400" fill="#5b4330" /><polygon points="0,1080 0,860 1920,780 1920,1080" fill="#8d7658" />
    {[0, 1, 2].map((row) => Array.from({ length: 11 }, (_, i) => { const x = ((i * 190 + f * 3.2 + row * 60) % (W + 400)) - 200; return <Soldier key={`${row}${i}`} x={W - x} y={820 + row * 78 - (W - x) * 0.04} s={1.1 + row * 0.35} f={f} ph={i + row * 2} flip />; }))}
    {[300, 900, 1500].map((x, i) => <Standard key={i} x={W - (((x + f * 3.2) % (W + 300)) - 150)} y={900} s={1.5} f={f} kind={i % 2 ? 'sig' : 'eagle'} />)}
    <Particles kind="dust" n={90} f={f} color="#e9c88a" o={0.35} /><Haze y={780} h={300} color="#d9a05a" o={0.5} /></g>
);
export const Horizon = ({ f, p }: SceneProps) => {
  const rows = 10; return <g><Sky stops={[[0, '#2f3d63'], [0.4, '#c77a50'], [0.7, '#f4b36a'], [1, '#ffe0a0']]} h={640} /><Sun x={900 + p * 80} y={470} r={46} glow={700} />
    <Ridge seed={21} y={560} amp={34} color="#8a6a7a" base={700} /><rect y="560" width={W} height={H} fill="#a07650" />
    {Array.from({ length: rows }, (_, k) => { const t = k / (rows - 1), sc = lerp(0.22, 1.4, t * t), y = lerp(590, 1150, Math.pow(t, 1.3)), rr = rng(300 + k), items: React.ReactNode[] = []; let x = -100;
      while (x < W + 100) { const w = (45 + rr() * 90) * sc, h = (35 + rr() * 110) * sc; items.push(rr() < 0.07 ? <Temple key={x} x={x} y={y} w={w * 1.6} h={h * 0.8} n={5} /> : <Insula key={x} x={x} y={y} w={w} h={h} seed={Math.floor(rr() * 99)} />); x += w + (5 + rr() * 12) * sc; } return <g key={k}>{items}</g>; })}
    <path d="M-40 760 C 400 700, 900 760, 1400 690 S 2000 700 2000 700 L2000 720 C1400 730 900 790 400 740 L-40 800Z" fill="#6f9aa8" opacity="0.8" />
    <g transform={`translate(${-p * 140} 0)`}>{Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${i * 120 + 100} 640 v-70 a30 30 0 0 1 60 0 v70`} fill="#c9a06c" stroke="#8a6a46" />)}<rect x="100" y="566" width="1920" height="14" fill="#c9a06c" /></g>
    <Haze y={540} h={240} color="#f2b983" o={0.6} /><Birds f={f} y0={100} y1={340} /><Particles kind="motes" n={40} f={f} color="#ffe6b0" o={0.45} /></g>;
};
export const SevenHills = ({ f }: SceneProps) => (
  <g><Sky stops={[[0, '#3a3f66'], [0.4, '#a56a76'], [0.7, '#f1a766'], [1, '#ffd89a']]} /><Sun x={1250} y={620} r={52} glow={650} /><Clouds f={f} o={0.3} />
    <Ridge seed={31} y={700} amp={60} color="#7a6a86" /><Ridge seed={32} y={760} amp={50} color="#5f6a6a" />{[260, 700, 1100, 1560].map((x, i) => <g key={i}><path d={`M${x - 220} 900 Q${x} ${690 - i * 8} ${x + 220} 900Z`} fill={['#6b7a4a', '#5f7048', '#74804f', '#68754a'][i]} />{[0, 1, 2].map((h) => <Hut key={h} x={x - 50 + h * 46} y={792 - Math.abs(h - 1) * 6 - i * 3} s={0.45} />)}<Smoke x={x} y={760} f={f + i * 30} n={3} w={9} o={0.25} /></g>)}
    <path d="M-40 900 C 400 860, 800 950, 1300 880 S 2000 930 2000 930 L2000 1100 L-40 1100Z" fill="#4f7f8c" />
    {Array.from({ length: 22 }, (_, i) => <ellipse key={i} cx={(i * 91 + f * 0.6) % W} cy={930 + (i % 4) * 30} rx={50} ry="3" fill="#ffdca0" opacity={0.25 + 0.2 * Math.sin(f * 0.08 + i)} />)}
    <Haze y={640} h={300} color="#ffd9a8" o={0.6} /><Birds f={f} n={5} y0={160} y1={360} /></g>
);
export const Ford = ({ f }: SceneProps) => (
  <g><Sky stops={[[0, '#6d8fb0'], [0.6, '#f1c88a'], [1, '#ffe3b0']]} h={640} /><Ridge seed={41} y={560} amp={50} color="#7a8a6a" base={700} /><Ridge seed={42} y={620} amp={36} color="#5d7050" base={720} />{[200, 560, 1500].map((x, i) => <Pine key={i} x={x} y={690} s={1.6} />)}
    <rect y="690" width={W} height="400" fill="#8a7040" /><path d="M-40 760 C 600 700, 1300 790, 2000 720 L2000 900 C1300 960 600 880 -40 920Z" fill="#5f93a6" />{Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${i * 130 + ((f * 0.8) % 130) - 60} ${800 + (i % 3) * 36} q20 -6 44 0`} stroke="#d9f0f4" strokeWidth="2" fill="none" opacity="0.6" />)}
    <rect x="780" y="830" width="460" height="14" fill="#b8a070" opacity="0.65" />{Array.from({ length: 9 }, (_, i) => <Person key={i} x={560 + ((i * 130 + f * 1.4) % 900)} y={850 + (i % 2) * 8} s={0.95} f={f} ph={i} col={['#a36a4a', '#c9b48a', '#5a7a6a'][i % 3]} carry={i % 3 === 0 ? 'basket' : undefined} />)}
    {Array.from({ length: 4 }, (_, i) => <g key={i} transform={`translate(${((i * 300 + f * 1.1) % 1500) + 150} 870)`}><ellipse cx="0" cy="-30" rx="34" ry="20" fill="#7a5a3a" /><rect x="-26" y="-14" width="6" height="16" fill="#4a3322" /><rect x="22" y="-14" width="6" height="16" fill="#4a3322" /><circle cx="38" cy="-40" r="9" fill="#7a5a3a" /></g>)}
    <Haze y={620} h={200} o={0.4} /><Birds f={f} n={4} /></g>
);
export const Village = ({ f }: SceneProps) => (
  <g><Sky stops={[[0, '#2a2f55'], [0.5, '#a5586a'], [0.8, '#f09a5a'], [1, '#ffcf8a']]} /><Sun x={1450} y={700} r={60} glow={700} /><Clouds f={f} o={0.3} /><Ridge seed={51} y={720} amp={50} color="#6a5a74" /><Ridge seed={52} y={780} amp={40} color="#4e5a5a" />
    <path d="M-100 1100 L300 760 Q960 680 1620 770 L2000 1100Z" fill="#6f7c45" />{[[400, 880, 1.3], [700, 820, 1.0], [980, 900, 1.5], [1260, 840, 1.1], [1500, 920, 1.4], [560, 960, 1.6]].map(([x, y, s], i) => <g key={i}><Hut x={x} y={y} s={s} /><Smoke x={x} y={y - 80 * s} f={f + i * 30} n={3} w={9 * s} o={0.28} /></g>)}
    {[620, 1120, 1380].map((x, i) => <Person key={i} x={x} y={1000 + i * 20} s={1.4} f={f} ph={i} col="#a67a4a" walk={i === 1} carry={i === 2 ? 'basket' : undefined} />)}<Flame x={860} y={1030} s={0.8} f={f} /><Particles kind="ember" n={26} f={f} color="#ffb04a" o={0.8} /><Haze y={700} h={300} o={0.4} /></g>
);
export const EtruscanTemple = ({ f }: SceneProps) => (
  <g><Sky stops={[[0, '#6d8fb0'], [0.6, '#f1c88a'], [1, '#ffe3b0']]} /><Sun x={300} y={260} r={50} glow={600} /><Ridge seed={61} y={700} amp={60} color="#7a8a6a" /><Ridge seed={62} y={780} amp={40} color="#5d7050" />
    <rect y="860" width={W} height="300" fill="#8a6a46" /><Temple x={600} y={880} w={720} h={260} n={4} fill="#e8c9a0" roof="#c4552f" />{Array.from({ length: 14 }, (_, i) => <polygon key={i} points={`${586 + i * 54},${880 - 28 - 260 - 24} ${598 + i * 54},${880 - 28 - 260 - 24} ${592 + i * 54},${880 - 28 - 260 - 44}`} fill="#c4552f" />)}
    {[0, 1].map((i) => <g key={i} transform={`translate(${i ? 1320 : 460} 880)`}><rect x="-4" y="-340" width="6" height="340" fill="#6b4a2a" /><rect x="-26" y="-250" width="56" height="5" fill="#6b4a2a" /><rect x="-26" y="-170" width="56" height="5" fill="#6b4a2a" /></g>)}
    {Array.from({ length: 12 }, (_, i) => <Person key={i} x={300 + i * 110 + Math.sin(f * 0.04 + i) * 8} y={960 + (i % 3) * 22} s={1.2} f={f} ph={i} col={['#a36a4a', '#c9b48a', '#5a7a6a'][i % 3]} walk={i % 2 === 0} carry={i % 4 === 0 ? 'basket' : undefined} />)}<Birds f={f} n={5} /><Particles kind="dust" n={40} f={f} color="#ffe6b0" o={0.4} /></g>
);
export const Senate = ({ f }: SceneProps) => (
  <g><rect width={W} height={H} fill="#2a1d14" /><defs><linearGradient id="sn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a3422" /><stop offset="1" stopColor="#7a5a3a" /></linearGradient></defs><rect width={W} height="640" fill="url(#sn)" />{Array.from({ length: 9 }, (_, i) => <Column key={i} x={110 + i * 212} y={640} h={500} w={52} fill="#c9a77a" />)}
    <rect y="640" width={W} height="440" fill="#6b4a2c" />{Array.from({ length: 6 }, (_, i) => <rect key={i} x={0} y={640 + i * 70} width={W} height="3" fill="#3a2415" opacity="0.5" />)}
    {[0, 1, 2, 3].map((tier) => [0, 1].map((side) => <g key={`${tier}${side}`}><rect x={side ? 1200 : 0} y={700 + tier * 70} width="720" height="14" fill="#4a3220" />{Array.from({ length: 9 }, (_, i) => <Person key={i} x={(side ? 1260 : 70) + i * 72 + tier * 10} y={700 + tier * 70} s={1.15 + tier * 0.12} walk={false} toga col={WHITE} f={f} />)}</g>))}
    <Person x={930} y={920} s={2.2} toga walk={false} f={f} /><rect x={860} y={930} width="140" height="22" fill="#4a3220" /><rect x={0} y={0} width={W} height={H} fill="#ffb060" opacity={0.07 + 0.03 * Math.sin(f * 0.1)} /><Rays x={900} y={-60} o={0.22} f={f} /><Particles kind="motes" n={60} f={f} color="#ffe6b0" o={0.5} /></g>
);
export const Levy = ({ f }: SceneProps) => (
  <g><Sky stops={[[0, '#7fa0c0'], [0.6, '#f5d6a0'], [1, '#ffe8c0']]} h={640} /><Ridge seed={71} y={560} amp={60} color="#8a9a86" base={700} /><Ridge seed={72} y={620} amp={36} color="#6a8060" base={720} /><rect y="660" width={W} height="440" fill="#9a8450" />{Array.from({ length: 20 }, (_, i) => <rect key={i} x={i * 100} y="660" width="2" height="440" fill="#7a6838" opacity="0.2" />)}
    {[0, 1, 2, 3].map((row) => Array.from({ length: 11 }, (_, i) => <Soldier key={`${row}${i}`} x={160 + i * 150 + row * 20} y={760 + row * 85} s={1.0 + row * 0.22} f={f} ph={Math.floor(f / 24) % 2 ? 0 : 2} march={Math.floor(f / 24) % 2 === 0} tunic={row === 3 ? '#c9b48a' : RED} shield={row === 3 ? '#8a6a46' : RED} helm={row === 3 ? '#8a6a46' : '#a8895a'} />))}
    <Person x={1620} y={780} s={1.5} f={f} walk={false} col="#a3201f" /><Standard x={1700} y={800} s={1.6} f={f} /><Particles kind="dust" n={60} f={f} color="#e9c88a" o={0.35} /><Haze y={640} h={180} o={0.4} /></g>
);
export const Formation = ({ f, p }: SceneProps) => {
  const adv = p * 150, lines = [{ y: 330, n: 10, c: '#b32a24', label: 'HASTATI' }, { y: 500, n: 10, c: '#c86a2a', label: 'PRINCIPES' }, { y: 670, n: 10, c: '#d9a93f', label: 'TRIARII' }];
  return <g><defs><pattern id="gr" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#8a7a48" /><circle cx="8" cy="12" r="1.5" fill="#6e6034" /><circle cx="28" cy="30" r="1.5" fill="#a39058" /></pattern></defs><rect width={W} height={H} fill="url(#gr)" />
    {lines.map((L, li) => <g key={li}>{Array.from({ length: L.n }, (_, i) => { const x = 220 + i * 160 + (li % 2 ? 80 : 0) - 40, y = L.y - adv * (1 - li * 0.12) + 90; return <g key={i}><rect x={x} y={y} width="110" height="60" rx="4" fill={L.c} stroke="#1a1006" strokeWidth="3" />{Array.from({ length: 4 }, (_, a) => Array.from({ length: 8 }, (_, b) => <rect key={`${a}${b}`} x={x + 8 + b * 12} y={y + 8 + a * 12} width="8" height="8" fill="#1a1006" opacity="0.4" />))}<rect x={x + 54} y={y - 20} width="3" height="22" fill="#1a1006" /><circle cx={x + 55} cy={y - 22} r="5" fill={GOLD} /></g>; })}
      <text x="70" y={L.y - adv * (1 - li * 0.12) + 135} fill="#1a1006" fontFamily="Cinzel,serif" fontSize="24" fontWeight="700" letterSpacing="5" opacity="0.8">{L.label}</text></g>)}
    {Array.from({ length: 14 }, (_, i) => <g key={i} transform={`translate(${200 + i * 120} ${70 + Math.sin(f * 0.05 + i) * 4})`}><rect x="-26" y="-12" width="52" height="24" rx="6" fill="#4a2a5a" stroke="#1a1006" strokeWidth="2" /></g>)}
    <text x="960" y="1030" textAnchor="middle" fill="#1a1006" fontFamily="Cinzel,serif" fontSize="30" fontWeight="700" letterSpacing="10" opacity="0.85">THE MANIPULAR LEGION</text><Vig /></g>;
};
export const NavalBattle = ({ f, p }: SceneProps) => (
  <g><Sky stops={[[0, '#3a3f66'], [0.5, '#c87050'], [0.75, '#f4b26a'], [1, '#ffd88a']]} h={620} /><Sun x={1500} y={470} r={50} glow={600} /><Clouds f={f} o={0.35} /><Ridge seed={81} y={600} amp={20} color="#5f4a56" base={640} /><Waves y0={600} y1={1080} f={f} />
    {([[360, 780, 1.3], [760, 860, 1.6], [1180, 760, 1.2]] as number[][]).map(([x, y, s], i) => <g key={i}><Galley x={x + p * 120} y={y} s={s} f={f + i * 9} stripe={RED} sail="#e8d9b8" /><rect x={x + p * 120 + 150 * s} y={y - 40 * s} width={160 * s} height="8" fill="#6b4a2a" transform={`rotate(-8 ${x + p * 120 + 150 * s} ${y})`} /></g>)}
    {([[1240, 900, 1.5], [1580, 820, 1.3], [1000, 950, 1.1]] as number[][]).map(([x, y, s], i) => <Galley key={i} x={x - p * 90} y={y} s={s} f={f + i * 13} flip hull="#3a2a4a" stripe={PURPLE} sail="#b9a0d0" />)}
    <Particles kind="motes" n={40} f={f} color="#fff" o={0.3} /><Haze y={600} h={160} o={0.4} /></g>
);
export const Alps = ({ f, p }: SceneProps) => {
  const path = (t: number) => ({ x: lerp(-100, 2000, t), y: lerp(920, 560, t) + Math.sin(t * 9) * 12 }); return <g><Sky stops={[[0, '#4a5a78'], [0.6, '#aab6c8'], [1, '#dfe4e8']]} /><Clouds f={f} color="#ffffff" o={0.35} /><Mountain x={-100} y={700} w={1100} h={560} color="#6d7a90" seed={2} /><Mountain x={700} y={720} w={1300} h={620} color="#7e8aa0" seed={5} />
    <polygon points="-100,1080 -100,860 600,760 1200,600 2000,520 2000,1080" fill="#e8ecf0" /><polygon points="-100,1080 -100,960 700,840 1300,700 2000,620 2000,1080" fill="#cfd6de" />
    {Array.from({ length: 14 }, (_, i) => { const t = (i * 0.07 + p * 0.55 + 0.05) % 1, q = path(t), s = 0.8 + (1 - t) * 0.8; return i % 5 === 2 ? <Elephant key={i} x={q.x} y={q.y} s={0.5 * s} f={f} /> : <Soldier key={i} x={q.x} y={q.y} s={0.9 * s} f={f} ph={i} tunic="#5a3a6a" shield="#4a2a5a" plume="#2a1a3a" pilum={false} />; })}
    <Particles kind="snow" n={160} f={f} o={0.85} /><Haze y={800} h={280} color="#e8eef4" o={0.5} /></g>;
};
export const Cannae = ({ f, p }: SceneProps) => {
  const q = ease(p), rx = 960, squeeze = 1 - 0.45 * q; const cn = (i: number, j: number) => ({ x: rx + (i - 6.5) * 52 * squeeze, y: 640 + (j - 4) * 30 * squeeze }); return <g><defs><pattern id="gr2" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#a08e56" /><circle cx="10" cy="10" r="1.4" fill="#7e6e3c" /></pattern></defs><rect width={W} height={H} fill="url(#gr2)" />
    <path d="M-40 140 C 400 120, 1000 180, 2000 130 L2000 0 L-40 0Z" fill="#6d93a0" opacity="0.7" />
    {Array.from({ length: 14 }, (_, i) => Array.from({ length: 9 }, (_, j) => { const c = cn(i, j); return <rect key={`${i}${j}`} x={c.x - 10} y={c.y - 9} width="20" height="17" rx="2" fill={RED} stroke="#1a1006" strokeWidth="1.2" />; }))}
    {Array.from({ length: 14 }, (_, i) => { const base = (i - 6.5) * 60, bulge = (1 - q) * 120 * Math.cos((i - 6.5) / 8), concave = -q * 90 * Math.cos((i - 6.5) / 8); const y = 300 + bulge + concave + 90; return <rect key={i} x={rx + base - 14} y={y - 10} width="28" height="20" rx="3" fill="#6a3a8a" stroke="#1a1006" strokeWidth="1.4" />; })}
    {[-1, 1].map((s) => Array.from({ length: 8 }, (_, i) => { const t = clamp(q * 1.15 - i * 0.02), x = rx + s * (680 - 640 * t * 0.78), y = 360 + 300 * ease(t) + i * 4 * s; return <rect key={`${s}${i}`} x={x - 14 - i * 6 * s} y={y - 9} width="26" height="16" rx="3" fill="#8a4aa8" stroke="#1a1006" strokeWidth="1.2" />; }))}
    <path d={`M${rx - 700} 360 C ${rx - 760} 560, ${rx - 520} 820, ${rx - 90} 820`} stroke="#6a3a8a" strokeWidth="9" fill="none" strokeDasharray="22 14" opacity={ramp(p, 0.2, 0.5)} /><path d={`M${rx + 700} 360 C ${rx + 760} 560, ${rx + 520} 820, ${rx + 90} 820`} stroke="#6a3a8a" strokeWidth="9" fill="none" strokeDasharray="22 14" opacity={ramp(p, 0.2, 0.5)} />
    <rect x="70" y="990" width="28" height="22" fill="#6a3a8a" /><rect x="110" y="990" width="28" height="22" fill={RED} /><text x="156" y="1010" fill="#1a1006" fontFamily="Cinzel,serif" fontSize="26" fontWeight="700" letterSpacing="5">CARTHAGINIAN · ROMAN</text><Vig /></g>;
};
export const Resolve = ({ f }: SceneProps) => (
  <g><Sky stops={[[0, '#0c1226'], [0.6, '#2c2b44'], [1, '#6a3a3a']]} /><Particles kind="motes" n={90} f={f} color="#ffd9a0" o={0.5} /><Ridge seed={91} y={560} amp={40} color="#1c1822" />{Array.from({ length: 16 }, (_, i) => <Insula key={i} x={i * 130 - 40} y={600} w={110} h={120 + (i % 4) * 30} seed={i} />)}<rect width={W} height={H} fill="#080614" opacity="0.5" />
    <rect y="640" width={W} height="440" fill="#4a3a2c" />{Array.from({ length: 18 }, (_, i) => <rect key={i} x={i * 120} y="640" width="2" height="440" fill="#2a1d14" opacity="0.6" />)}<rect y="610" width={W} height="40" fill="#5a4636" />{Array.from({ length: 18 }, (_, i) => <rect key={i} x={i * 120 + 14} y="580" width="64" height="40" fill="#5a4636" />)}
    {[200, 620, 1040, 1460, 1820].map((x, i) => <g key={i}><rect x={x} y="520" width="6" height="90" fill="#2a1a10" /><Flame x={x + 3} y={520} s={0.9} f={f} seed={i} /><circle cx={x + 3} cy={500} r="120" fill="#ff9a4a" opacity="0.14" /></g>)}
    {Array.from({ length: 7 }, (_, i) => <Soldier key={i} x={260 + i * 240} y={800 + (i % 2) * 40} s={1.7} f={f} march={false} pilum />)}<Vig /></g>
);
export const Zama = ({ f, p }: SceneProps) => (
  <g><Sky stops={[[0, '#9ab0c4'], [0.6, '#f0d49a'], [1, '#ffe6b0']]} h={640} /><Ridge seed={101} y={600} amp={30} color="#c9a870" base={700} /><rect y="640" width={W} height="440" fill="#d3b27a" />{Array.from({ length: 30 }, (_, i) => <ellipse key={i} cx={(i * 97) % W} cy={700 + ((i * 53) % 380)} rx="30" ry="3" fill="#a8885a" opacity="0.35" />)}
    {[0, 1, 2].map((row) => Array.from({ length: 9 }, (_, i) => <Soldier key={`${row}${i}`} x={W - 160 - i * 70 - row * 20} y={800 + row * 70} s={1.2 + row * 0.2} f={f} march={false} flip />))}
    {[0, 1, 2, 3].map((i) => <Elephant key={i} x={lerp(-260 - i * 90, 980 + i * 70, ease(p))} y={760 + i * 70} s={1.0 + i * 0.12} f={f + i * 5} />)}<Standard x={1740} y={870} s={1.6} f={f} /><Particles kind="dust" n={140} f={f} color="#d9b47a" o={0.45} /><Haze y={640} h={240} color="#f2d9a0" o={0.5} /></g>
);
export const CarthageBurns = ({ f }: SceneProps) => (
  <g><Sky stops={[[0, '#150a0a'], [0.4, '#6a1f12'], [0.75, '#d9561f'], [1, '#ffb04a']]} /><Smoke x={600} y={700} f={f} n={9} w={70} o={0.55} /><Smoke x={1300} y={720} f={f + 30} n={9} w={80} o={0.55} /><path d="M-40 760 Q 960 700 2000 770 L2000 1080 L-40 1080Z" fill="#2a1a14" />
    {Array.from({ length: 16 }, (_, i) => <g key={i}><Block x={i * 130 - 40} y={800 - (i % 5) * 18} w={110} h={150 + (i % 4) * 50} fill="#4a3228" shade="#1a0e0a" />{i % 2 === 0 && <Flame x={i * 130 + 15} y={650 - (i % 4) * 50} s={1.4 + (i % 3) * 0.4} f={f} seed={i} />}</g>)}
    <rect y="900" width={W} height="180" fill="#1a0e0a" /><path d="M0 930 Q 960 900 1920 940 L1920 1080 L0 1080Z" fill="#7a2a14" opacity="0.5" />
    <Galley x={1500} y={960} s={0.8} f={f} fire hull="#2a1a22" /><Galley x={300} y={980} s={0.7} f={f + 9} fire hull="#2a1a22" flip /><Particles kind="ember" n={140} f={f} color="#ffb04a" o={0.9} /><Vig /></g>
);
