import React from "react";
import { clamp, easeInOut, easeOut, lerp, prog, rng } from "../common/math";
import { Person } from "../common/Figures";
import { useTL } from "../common/story";
import { Ferry, Geese, Label, Pilot, Plane, River, Skyline, Sky, Timer, fmt, font } from "./art";
import { useL } from "./i18n";

type P = { t: number };
const lin = (v: number) => clamp(v);
const pop = (t: number, at: number, d = 0.45) => easeOut((t - at) / d);
const BASE = 930; // shoreline: skyline stands here, river below

// ---- 1. Hook ---------------------------------------------------------------------------------------------------
export const Hook: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const fly = prog(t, S("h1"), S("h4"), lin);
  const px = lerp(180, 700, fly);
  const py = lerp(560, 640, fly);
  const out = t >= S("h1") + 2.2;
  const left = pop(t, S("h3") + 0.4);
  const countdown = prog(t, S("h4"), E("h4") + 0.3, lin);
  return (
    <g>
      <Sky uid="hk" t={t} />
      <Skyline base={BASE} />
      <River top={BASE} t={t} glow={pop(t, S("h3") + 2.0)} />
      {/* LaGuardia runway on the left shore */}
      <g opacity={left}>
        <rect x={-40} y={BASE - 14} width={340} height={14} fill="#4a4f58" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={0 + i * 50} y={BASE - 9} width={26} height={3} fill="#e8edf3" />
        ))}
        <Label x={130} y={BASE - 50} text={L.runway} size={28} bg="#8a93a3" />
        <g transform={`translate(130 ${BASE - 150})`} opacity={pop(t, S("h3") + 1.2)}>
          <circle r={34} fill="#d8372b" />
          <path d="M-14 -14 L14 14 M14 -14 L-14 14" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
        </g>
        <Label x={130} y={BASE - 210} text={L.tooFar} size={28} bg="#d8372b" fg="#fff" opacity={pop(t, S("h3") + 1.2)} />
      </g>
      <Plane x={px} y={py} s={0.9} rot={out ? 2 : -8} smoke={out} t={t} />
      {pop(t, S("h3") + 2.0) > 0 && <Label x={760} y={BASE + 150} text={L.river} size={38} bg="#7fd4ff" opacity={pop(t, S("h3") + 2.0)} />}
      {t >= S("h4") && <Timer x={540} y={470} text={fmt(lerp(210, 0, countdown))} size={110} color={countdown > 0.8 ? "#ff6b61" : "#fff"} />}
    </g>
  );
};

// ---- 2. Setting the scene ----------------------------------------------------------------------------------------------
export const Setup: React.FC<P> = ({ t }) => {
  const { S } = useTL();
  const L = useL();
  const card = pop(t, S("s1"));
  const route = prog(t, S("s3") + 0.2, S("s3") + 2.2, lin);
  const crew = pop(t, S("s4"));
  return (
    <g>
      <rect x={-1500} y={-1200} width={4200} height={4400} fill="#0f1b2e" />
      <g opacity={card} transform={`translate(0 ${(1 - card) * 40})`}>
        <rect x={110} y={400} width={860} height={380} rx={34} fill="#f3f5f8" />
        <rect x={110} y={400} width={860} height={90} rx={34} fill="#1f4e8c" />
        <rect x={110} y={460} width={860} height={30} fill="#1f4e8c" />
        <text x={150} y={462} fontFamily={font} fontWeight={900} fontSize={48} fill="#fff" letterSpacing={4}>
          FLIGHT 1549
        </text>
        <text x={930} y={460} textAnchor="end" fontFamily={font} fontWeight={800} fontSize={36} fill="#cfe0f5">
          {L.aircraft}
        </text>
        <text x={150} y={620} fontFamily={font} fontWeight={900} fontSize={44} fill="#14161a" letterSpacing={2}>
          {L.route}
        </text>
        <g transform="translate(150 680)" opacity={pop(t, S("s2"))}>
          <rect x={0} y={-6} width={360} height={64} rx={14} fill="#e5eaf1" />
          <text x={24} y={40} fontFamily={font} fontWeight={800} fontSize={40} fill="#c0392b" letterSpacing={2}>
            {L.date}
          </text>
        </g>
        <path d="M150 740 Q540 640 930 740" fill="none" stroke="#9fb0c4" strokeWidth={5} strokeDasharray="10 12" opacity={0.0} />
      </g>
      <g opacity={route > 0 ? 1 : 0}>
        <path d="M150 860 Q540 690 930 860" fill="none" stroke="#2a3a55" strokeWidth={6} strokeDasharray="12 12" />
        <path d="M150 860 Q540 690 930 860" fill="none" stroke="#f2b705" strokeWidth={8} strokeDasharray={`${route * 900} 1000`} />
        <circle cx={150} cy={860} r={14} fill="#f2b705" />
        <circle cx={930} cy={860} r={14} fill={route > 0.98 ? "#f2b705" : "#2a3a55"} />
        <g transform={`translate(${lerp(150, 930, route)} ${860 - Math.sin(route * Math.PI) * 85}) rotate(${lerp(-14, 14, route)})`}>
          <Plane x={0} y={0} s={0.22} />
        </g>
      </g>
      <g opacity={crew} transform={`translate(0 ${(1 - crew) * 40})`}>
        <Pilot x={300} y={1200} s={1.05} t={t} skin="#e5b48f" />
        <Pilot x={780} y={1200} s={1.05} t={t} skin="#d9a37a" />
        <Label x={300} y={1230} text={L.captain} size={26} bg="#f2b705" />
        <Label x={780} y={1230} text={L.officer} size={26} bg="#e8edf3" />
      </g>
    </g>
  );
};

// ---- 3. The birds ---------------------------------------------------------------------------------------------------------------
export const Birds: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const climb = prog(t, S("b1"), S("b2") + 1.0, lin);
  const hitT = S("b2") + 0.9;
  const px = lerp(110, 460, climb);
  const py = lerp(1040, 760, climb);
  const hit = t >= hitT;
  const glide = prog(t, S("b5"), E("b5") + 1.5, lin);
  const gx = hit ? lerp(460, 640, glide) : px;
  const gy = hit ? lerp(760, 880, glide) : py;
  const flockX = lerp(1250, 560, prog(t, S("b2") - 0.1, hitT, lin));
  const thrust = hit ? 1 - clamp((t - S("b4") - 0.2) / 0.8) * 0.96 : 1;
  const feath = t - hitT;
  return (
    <g>
      <Sky uid="bd" t={t} />
      <Skyline base={BASE + 100} opacity={0.9} />
      <River top={BASE + 100} t={t} />
      <rect x={-200} y={BASE + 100 - 14} width={460} height={14} fill="#4a4f58" />
      <Plane x={gx} y={gy} s={0.8} rot={hit ? lerp(-3, 6, glide) : -10} smoke={hit && t > S("b4")} t={t} />
      {!hit || t < hitT + 0.4 ? <Geese x={hit ? 590 : flockX} y={hit ? 700 : 690} t={t} s={0.8} /> : null}
      {hit && feath < 1.4 &&
        Array.from({ length: 22 }).map((_, i) => {
          const r = rng(500 + i);
          return <ellipse key={i} cx={560 + (r() - 0.5) * 260 * feath} cy={720 + (r() - 0.3) * 200 * feath + feath * feath * 90} rx={8} ry={3} fill="#e8e3d8" opacity={Math.max(0, 1 - feath / 1.4)} transform={`rotate(${r() * 360} 560 720)`} />;
        })}
      {t >= S("b1") && t < S("b2") && <Label x={300} y={480} text="3:25 P.M." size={42} opacity={pop(t, S("b1"))} />}
      {t >= S("b4") && (
        <g transform="translate(540 440)">
          <Label x={0} y={-60} text={L.thrust} size={30} bg="#2a3340" fg="#fff" />
          {[-90, 90].map((dx, i) => (
            <g key={i} transform={`translate(${dx} 0)`}>
              <rect x={-70} y={-20} width={140} height={32} rx={16} fill="#0b101a" stroke="#3a4558" strokeWidth={4} />
              <rect x={-66} y={-16} width={Math.max(4, 132 * thrust)} height={24} rx={12} fill={thrust > 0.3 ? "#3be28b" : "#ff3b30"} />
            </g>
          ))}
        </g>
      )}
      {glide > 0 && (
        <g opacity={pop(t, S("b5"))}>
          <path d="M470 770 L880 960" stroke="#f2b705" strokeWidth={6} strokeDasharray="14 14" />
          <Label x={800} y={BASE - 120} text={L.glider} size={34} bg="#f2b705" />
        </g>
      )}
    </g>
  );
};

// ---- 4. The decision ------------------------------------------------------------------------------------------------------------------
const MapPin: React.FC<{ x: number; y: number; text: string; color?: string; o?: number }> = ({ x, y, text, color = "#2a3340", o = 1 }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={14} fill={color} stroke="#fff" strokeWidth={5} />
    <Label x={x} y={y - 42} text={text} size={26} bg={color} fg="#fff" />
  </g>
);

export const Decision: React.FC<P> = ({ t }) => {
  const { S } = useTL();
  const L = useL();
  const tet = pop(t, S("d3") + 0.6);
  const far = pop(t, S("d4") + 0.3);
  const hud = pop(t, S("d5") + 0.4);
  const tick = (k: number) => clamp((t - (S("d2") + 0.5 + k * 0.5)) / 0.25);
  const planeX = lerp(350, 560, prog(t, S("d1"), S("d5") + 3, lin));
  const planeY = lerp(560, 640, prog(t, S("d1"), S("d5") + 3, lin));
  return (
    <g>
      <rect x={-1500} y={-1200} width={4200} height={4400} fill="#0f1b2e" />
      {/* map */}
      <rect x={70} y={350} width={940} height={560} rx={28} fill="#2f3b4d" />
      <path d="M70 350 H1010 V910 H70 Z" fill="#40505f" opacity={0.4} />
      <path d="M690 350 Q640 540 700 640 Q760 760 720 910 H830 Q880 760 820 640 Q760 520 810 350 Z" fill="#4c86c0" opacity={0.9} />
      {hud > 0 && <path d="M690 350 Q640 540 700 640 Q760 760 720 910 H830 Q880 760 820 640 Q760 520 810 350 Z" fill="none" stroke="#9fe3ff" strokeWidth={8} opacity={hud * (0.6 + 0.4 * Math.sin(t * 6))} />}
      <Label x={920} y={500} text={L.river} size={26} bg="#4c86c0" fg="#fff" opacity={hud} />
      <MapPin x={260} y={760} text={L.lga} color="#556377" />
      <MapPin x={430} y={480} text={L.teterboro} color="#b9770e" o={tet} />
      <g transform={`translate(${planeX} ${planeY})`}>
        <circle r={26} fill="#fff" opacity={0.25} />
        <Plane x={0} y={0} s={0.15} rot={12} />
      </g>
      {far > 0 && (
        <g opacity={far}>
          <circle cx={planeX} cy={planeY} r={140} fill="none" stroke="#f2b705" strokeWidth={5} strokeDasharray="12 12" />
          <g transform="translate(430 480)">
            <circle r={26} fill="#d8372b" />
            <path d="M-10 -10 L10 10 M10 -10 L-10 10" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
          </g>
          <Label x={430} y={560} text={L.tooFar} size={26} bg="#d8372b" fg="#fff" />
        </g>
      )}
      {hud > 0.2 && <path d={`M${planeX + 20} ${planeY + 10} Q${lerp(planeX, 700, 0.6)} ${planeY + 60} 720 700`} fill="none" stroke="#7fd4ff" strokeWidth={8} strokeDasharray="14 12" opacity={hud} />}
      {/* crew + checklist */}
      <g opacity={pop(t, S("d1"))}>
        <Pilot x={760} y={1215} s={1.0} t={t} skin="#e5b48f" />
        <Label x={760} y={1245} text="SULLY" size={26} bg="#f2b705" />
      </g>
      <g opacity={pop(t, S("d2"))}>
        <rect x={90} y={960} width={470} height={250} rx={18} fill="#f3f0e6" />
        <text x={325} y={1005} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22} fill="#1b2230" letterSpacing={2}>
          {L.checklist}
        </text>
        {[0, 1, 2, 3].map((k) => (
          <g key={k} opacity={tick(k)}>
            <rect x={120} y={1035 + k * 42} width={26} height={26} rx={5} fill="#1f7a4d" />
            <path d={`M126 ${1049 + k * 42} l7 8 l12 -16`} stroke="#fff" strokeWidth={5} fill="none" />
            <rect x={164} y={1044 + k * 42} width={300 - k * 30} height={8} rx={4} fill="#b6b09b" />
          </g>
        ))}
      </g>
    </g>
  );
};

// ---- 5. Brace for impact ------------------------------------------------------------------------------------------------------------------------
export const Brace: React.FC<P> = ({ t }) => {
  const { S } = useTL();
  const L = useL();
  const shake = t >= S("c1") ? Math.sin(t * 55) * 5 * (0.5 + 0.5 * Math.sin(t * 4)) : 0;
  const rows = [0, 1, 2, 3];
  return (
    <g transform={`translate(${shake} 0)`}>
      <rect x={-1500} y={-1200} width={4200} height={4400} fill="#223048" />
      <rect x={-1500} y={400} width={4200} height={900} fill="#2b3c58" />
      {rows.map((r) => {
        const y = 520 + r * 150;
        const sc = 0.7 + r * 0.18;
        return (
          <g key={r}>
            {[-2, -1, 0, 1, 2].filter((c) => c !== 0).map((c) => {
              const x = 540 + c * 190 * sc;
              const bow = t >= S("c1") + 0.4 ? 1 : 0;
              return (
                <g key={c} transform={`translate(${x} ${y})`}>
                  <rect x={-52 * sc} y={-20 * sc} width={104 * sc} height={130 * sc} rx={16 * sc} fill="#3a4d70" />
                  <circle cx={0} cy={(-18 + bow * 38) * sc} r={26 * sc} fill={["#e5b48f", "#c58d63", "#f0c9a6", "#a8694a"][(r + c + 8) % 4]} />
                  <path d={`M${-26 * sc} ${(-26 + bow * 38) * sc} Q0 ${(-62 + bow * 38) * sc} ${26 * sc} ${(-26 + bow * 38) * sc} Z`} fill={["#4a3a2c", "#2e2218", "#8a6a3a", "#222"][(r + c + 9) % 4]} />
                </g>
              );
            })}
          </g>
        );
      })}
      <rect x={-1500} y={1120} width={4200} height={90} fill="#1a2438" />
      {t >= S("c2") && (
        <g opacity={pop(t, S("c2"))}>
          <Person x={170} y={1180} t={t} phase={1} pose="wave" suit="#1d2d4d" suitStyle="vest" helmet="#00000000" lamp={false} scale={3.2} />
          <Person x={910} y={1180} t={t} phase={3} pose="wave" suit="#1d2d4d" suitStyle="vest" helmet="#00000000" lamp={false} scale={3.2} skin="#c68a62" facing={-1} />
        </g>
      )}
      <Label x={540} y={400} text={L.brace} size={58} bg={Math.sin(t * 8) > 0 ? "#d8372b" : "#a82a20"} fg="#fff" opacity={pop(t, S("c1"))} />
    </g>
  );
};

// ---- 6. Touchdown on the Hudson --------------------------------------------------------------------------------------------------------------------------------
export const Landing: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const descend = prog(t, S("l1") - 0.2, S("l1") + 1.6, lin);
  const landed = t >= S("l1") + 1.6;
  const ls = Math.max(0, t - (S("l1") + 1.6));
  const px = lerp(160, 560, descend);
  const py = landed ? 930 + Math.sin(t * 1.6) * 4 : lerp(520, 930, descend);
  const wings = pop(t, S("l3") + 0.6);
  return (
    <g>
      <Sky uid="ld" t={t} />
      <Skyline base={BASE + 40} />
      <River top={BASE + 40} t={t} />
      <Plane x={px} y={py} s={0.85} rot={landed ? 3 : lerp(-2, 5, descend)} />
      {landed &&
        Array.from({ length: 26 }).map((_, i) => {
          const r = rng(800 + i);
          const a = clamp(ls * 1.1 - r() * 0.15);
          return <circle key={i} cx={560 + (r() - 0.5) * 520 * a} cy={BASE + 40 + 70 - a * (1 - a) * 260} r={8 + 6 * (1 - a)} fill="#eaf6ff" opacity={(1 - a) * 0.9} />;
        })}
      {landed && [0, 1].map((i) => <ellipse key={i} cx={560} cy={BASE + 118} rx={200 + ls * 160 + i * 90} ry={22 + ls * 14 + i * 10} fill="none" stroke="#eaf6ff" strokeWidth={5} opacity={Math.max(0, 0.8 - ls * 0.2 - i * 0.2)} />)}
      {t >= S("l2") && <Timer x={540} y={470} text={L.threeHalf} size={110} />}
      {wings > 0 && (
        <g opacity={wings}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Person key={i} x={520 + i * 22} y={py + 74 - (i % 2) * 2} t={t} phase={i} pose={i % 3 === 0 ? "wave" : "stand"} suit={["#f0892a", "#2f6fb2", "#d9d3c4", "#b8433a"][i % 4]} helmet="#00000000" lamp={false} scale={0.62} />
          ))}
          <ellipse cx={560} cy={py + 100} rx={110} ry={16} fill="#f08a2a" />
          <ellipse cx={700} cy={py + 96} rx={70} ry={12} fill="#f08a2a" />
          <Label x={560} y={py + 175} text={L.rafts} size={26} bg="#f08a2a" />
        </g>
      )}
    </g>
  );
};

// ---- 7. Ferries to the rescue --------------------------------------------------------------------------------------------------------------------------------------
const BOATS: { x: number; y: number; flip: boolean; at: number }[] = [
  { x: 250, y: 1090, flip: false, at: 0 },
  { x: 870, y: 1080, flip: true, at: 0.45 },
  { x: 140, y: 1000, flip: false, at: 0.9 },
  { x: 930, y: 1000, flip: true, at: 1.35 },
  { x: 330, y: 1160, flip: false, at: 1.8 },
  { x: 760, y: 1170, flip: true, at: 2.25 },
];

export const Rescue: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const first = prog(t, S("r1"), E("r1") + 0.6, easeInOut);
  const fill = prog(t, S("r3"), E("r4") + 1.5, lin);
  const dots = Math.floor(155 * fill);
  return (
    <g>
      <Sky uid="rs" t={t} />
      <Skyline base={BASE} opacity={0.9} />
      <River top={BASE} t={t} />
      <Plane x={540} y={BASE + 20} s={0.75} rot={3} />
      <Ferry x={lerp(1250, 740, first)} y={BASE + 150} s={0.9} flip t={t} people={Math.floor(first * 6)} />
      {t >= S("r1") && <Label x={740} y={BASE + 30} text={L.ferry} size={28} bg="#f2b705" opacity={pop(t, S("r1") + 0.3)} />}
      {BOATS.map((b, i) => {
        const a = prog(t, S("r2") + b.at, S("r2") + b.at + 1.2, easeOut);
        return a > 0 ? <Ferry key={i} x={lerp(b.flip ? 1400 : -300, b.x, a)} y={b.y} s={0.6} flip={b.flip} t={t} people={4} /> : null;
      })}
      {fill > 0 && (
        <g>
          {Array.from({ length: dots }).map((_, i) => (
            <circle key={i} cx={150 + (i % 31) * 25} cy={400 + Math.floor(i / 31) * 26} r={9} fill={["#f0892a", "#2f6fb2", "#d9d3c4", "#2f9e5b"][i % 4]} />
          ))}
          <Label x={540} y={560} text={`${Math.min(155, dots)} / 155`} size={44} bg="#2f9e5b" fg="#fff" />
        </g>
      )}
    </g>
  );
};

// ---- 8. What the investigators found --------------------------------------------------------------------------------------------------------------------------------------
export const Aftermath: React.FC<P> = ({ t }) => {
  const { S } = useTL();
  const L = useL();
  const s1 = pop(t, S("e1"));
  const s2 = pop(t, S("e2"));
  const s3 = pop(t, S("e3"));
  const s4 = pop(t, S("e4"));
  const s5 = pop(t, S("e5"));
  const phase = t < S("e2") ? 1 : t < S("e3") ? 2 : t < S("e4") ? 3 : t < S("e5") ? 4 : 5;
  const fade = (n: number) => (phase === n ? 1 : 0);
  return (
    <g>
      <rect x={-1500} y={-1200} width={4200} height={4400} fill="#0f1b2e" />
      {/* 1: engines with birds */}
      <g opacity={fade(1) * s1}>
        {[330, 750].map((x, i) => (
          <g key={x} transform={`translate(${x} 700)`}>
            <circle r={150} fill="#aeb8c4" stroke="#6c7480" strokeWidth={10} />
            <circle r={105} fill="#2a3340" />
            {Array.from({ length: 12 }).map((_, k) => (
              <rect key={k} x={-8} y={-100} width={16} height={92} rx={6} fill="#6c7480" transform={`rotate(${k * 30 + t * 60 * (i ? -1 : 1) * 0.0})`} />
            ))}
            <circle r={26} fill="#e8edf3" />
            <g transform="translate(60 -50) scale(0.7)">
              <path d="M0 0 Q-14 -10 -30 -2 Q-14 -2 0 3 Q14 -2 30 -2 Q14 -10 0 0 Z" fill="#fff" stroke="#2a2e36" strokeWidth={4} />
            </g>
          </g>
        ))}
        <Label x={540} y={950} text={L.engines} size={38} />
      </g>
      {/* 2: return to the airport? */}
      <g opacity={fade(2) * s2}>
        <rect x={70} y={380} width={940} height={540} rx={28} fill="#2f3b4d" />
        <path d="M690 380 Q640 560 700 660 Q760 780 720 920 H830 Q880 780 820 660 Q760 540 810 380 Z" fill="#4c86c0" opacity={0.9} />
        <rect x={110} y={830} width={260} height={12} fill="#c9d0da" />
        <path d="M560 540 C 420 450 260 560 250 820" fill="none" stroke="#f2b705" strokeWidth={7} strokeDasharray="14 12" />
        <text x={330} y={640} fontFamily={font} fontWeight={900} fontSize={120} fill="#f2b705" opacity={0.9}>
          ?
        </text>
        <g transform="translate(560 540) rotate(-30)">
          <Plane x={0} y={0} s={0.2} />
        </g>
        <Label x={240} y={880} text={L.turn} size={26} bg="#8a93a3" />
      </g>
      {/* 3: the time it takes to realize */}
      <g opacity={fade(3) * s3}>
        <rect x={90} y={620} width={900} height={90} rx={20} fill="#1a2740" />
        <rect x={90} y={620} width={230} height={90} rx={20} fill="#d8372b" />
        <rect x={320} y={620} width={400} height={90} fill="#f2b705" />
        <rect x={720} y={620} width={270} height={90} rx={20} fill="#2f9e5b" />
        <Label x={205} y={590} text={L.strike} size={26} bg="#d8372b" fg="#fff" />
        <Label x={520} y={590} text={L.delay} size={30} />
        <Label x={855} y={590} text={L.turn} size={26} bg="#2f9e5b" fg="#fff" />
        <text x={540} y={820} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={130} fill="#f2b705">
          ⏱
        </text>
      </g>
      {/* 4: miracle or tragedy */}
      <g opacity={fade(4) * s4}>
        <g transform="translate(290 690)">
          <rect x={-230} y={-250} width={460} height={500} rx={30} fill="#16324f" stroke="#2f9e5b" strokeWidth={8} />
          <ellipse cx={0} cy={80} rx={190} ry={30} fill="#1f4f78" />
          <g transform="translate(0 20)">
            <Plane x={0} y={0} s={0.34} rot={2} />
          </g>
          <Label x={0} y={-170} text={L.miracle} size={42} bg="#2f9e5b" fg="#fff" />
        </g>
        <g transform="translate(790 690)">
          <rect x={-230} y={-250} width={460} height={500} rx={30} fill="#2a1620" stroke="#d8372b" strokeWidth={8} />
          <ellipse cx={0} cy={80} rx={190} ry={30} fill="#3a2a30" />
          <text x={0} y={60} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={190} fill="#d8372b" opacity={0.85}>
            ?
          </text>
          <Label x={0} y={-170} text={L.tragedy} size={42} bg="#d8372b" fg="#fff" />
        </g>
      </g>
      {/* 5: what made the difference */}
      <g opacity={fade(5) * s5}>
        {[L.skill, L.training, L.decisions].map((txt, i) => (
          <g key={i} transform={`translate(${540} ${480 + i * 190})`} opacity={pop(t, S("e5") + i * 0.5)}>
            <rect x={-380} y={-70} width={760} height={140} rx={30} fill="#16233a" stroke="#f2b705" strokeWidth={6} />
            <text x={0} y={22} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={64} fill="#fff" letterSpacing={4}>
              {txt}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
};
