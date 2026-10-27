import React from "react";
import { clamp, easeInOut, easeOut, lerp, prog, rng } from "../common/math";
import { Astro, Bar, Earth, Label, Moon, Plume, Space, Stack } from "./art";
import { E, S } from "./time";

const font = "Inter, 'Helvetica Neue', Arial, sans-serif";
type P = { t: number };
const lin = (v: number) => clamp(v);
const pop = (t: number, at: number, d = 0.45) => easeOut((t - at) / d);

// ---- 7. Into the lifeboat ----------------------------------------------------------------------------------
export const Dock: React.FC<P> = ({ t }) => {
  const xs = [400, 540, 680];
  const lmLit = clamp((t - (S("l2") + 1.4)) / 1.2);
  return (
    <g>
      <Space t={t} top="#05070f" bottom="#0b1224" />
      {/* LM chamber */}
      <rect x={290} y={360} width={500} height={300} rx={46} fill={`rgb(${lerp(14, 40, lmLit)},${lerp(20, 56, lmLit)},${lerp(32, 88, lmLit)})`} stroke="#d9a441" strokeWidth={10} />
      <text x={540} y={420} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill="#f1d58a" letterSpacing={1}>
        AQUARIUS · LUNAR MODULE
      </text>
      {/* tunnel */}
      <rect x={496} y={660} width={88} height={110} fill="#2b3547" />
      {/* CM chamber */}
      <path d="M440 770 L640 770 L840 1130 L240 1130 Z" fill="#e9edf2" />
      <path d="M470 790 L610 790 L772 1100 L308 1100 Z" fill="#243049" />
      <text x={540} y={1180} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill="#fff" letterSpacing={3} stroke="#0b0f18" strokeWidth={8} paintOrder="stroke">
        ODYSSEY · COMMAND MODULE
      </text>
      {xs.map((x, i) => {
        const k = prog(t, S("l2") + 0.4 + i * 0.7, S("l2") + 1.7 + i * 0.7);
        const path = k < 0.5 ? { x: lerp(x, 540, k * 2), y: lerp(1050, 760, k * 2) } : { x: lerp(540, 430 + i * 110, k * 2 - 1), y: lerp(760, 590, k * 2 - 1) };
        return <Astro key={i} x={path.x} y={path.y + 60} s={0.5} pose="bust" t={t + i} hair={["#6b5a4a", "#2e2218", "#3b2b20"][i]} skin={["#e5b48f", "#d9a37a", "#f0c9a6"][i]} />;
      })}
      {t >= S("l2") && <Label x={190} y={730} text="LIFEBOAT" size={34} opacity={pop(t, S("l2") + 1.2)} />}
      {t < S("l2") && (
        <text x={540} y={560} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={160} fill="#f2b705" opacity={0.85 * (0.6 + 0.4 * Math.sin(t * 4))}>
          ?
        </text>
      )}
    </g>
  );
};

// ---- 8. Capacity -------------------------------------------------------------------------------------------------------------
const Days: React.FC<{ x: number; y: number; n: number; color: string; t: number; at: number }> = ({ x, y, n, color, t, at }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: n }).map((_, i) => {
      const a = pop(t, at + i * 0.18, 0.3);
      return (
        <g key={i} transform={`translate(${i * 96} 0) scale(${a})`}>
          <rect width={80} height={86} rx={12} fill="#f3f4f6" />
          <rect width={80} height={26} rx={12} fill={color} />
          <text x={40} y={70} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill="#1b2230">
            {i + 1}
          </text>
        </g>
      );
    })}
  </g>
);

export const Capacity: React.FC<P> = ({ t }) => {
  const a1 = pop(t, S("l3"));
  const a2 = pop(t, S("l4"));
  return (
    <g>
      <Space t={t} top="#070b18" bottom="#101a35" stars={0.5} />
      <g opacity={a1} transform={`translate(0 ${(1 - a1) * 40})`}>
        <rect x={90} y={380} width={900} height={330} rx={34} fill="#12203d" stroke="#3be28b" strokeWidth={6} />
        <text x={130} y={440} fontFamily={font} fontWeight={900} fontSize={34} fill="#3be28b" letterSpacing={3}>
          BUILT FOR
        </text>
        {[0, 1].map((i) => (
          <Astro key={i} x={200 + i * 110} y={640} s={0.75} pose="bust" t={t + i} skin={["#e5b48f", "#d9a37a"][i]} hair={["#6b5a4a", "#2e2218"][i]} />
        ))}
        <Days x={520} y={500} n={2} color="#3be28b" t={t} at={S("l3") + 0.6} />
        <text x={520} y={640} fontFamily={font} fontWeight={800} fontSize={30} fill="#a9bbd8" letterSpacing={2}>
          2 MEN · 2 DAYS
        </text>
      </g>
      <g opacity={a2} transform={`translate(0 ${(1 - a2) * 40})`}>
        <rect x={90} y={780} width={900} height={400} rx={34} fill="#2a1620" stroke="#ff3b30" strokeWidth={6} />
        <text x={130} y={840} fontFamily={font} fontWeight={900} fontSize={34} fill="#ff6b61" letterSpacing={3}>
          NOW NEEDED
        </text>
        {[0, 1, 2].map((i) => (
          <Astro key={i} x={190 + i * 100} y={1070} s={0.75} pose="bust" t={t + i} skin={["#e5b48f", "#d9a37a", "#f0c9a6"][i]} hair={["#6b5a4a", "#2e2218", "#3b2b20"][i]} />
        ))}
        <Days x={500} y={880} n={4} color="#ff3b30" t={t} at={S("l4") + 0.5} />
        <text x={500} y={1030} fontFamily={font} fontWeight={800} fontSize={30} fill="#ffb3ad" letterSpacing={2}>
          3 MEN · 4 DAYS
        </text>
      </g>
    </g>
  );
};

// ---- 9. Cold, dark, thirsty cabin ---------------------------------------------------------------------------------------------
export const Cabin: React.FC<P> = ({ t }) => {
  const off = prog(t, S("l5") + 0.3, E("l5") - 0.2, (v) => clamp(v));
  const cold = prog(t, S("l6"), E("l6"), (v) => clamp(v));
  const water = pop(t, S("l7"));
  const level = lerp(0.85, 0.1, cold);
  const darkness = 0.1 + 0.5 * off;
  return (
    <g>
      <rect width={1080} height={1920} fill="#10202b" />
      <path d="M180 340 L900 340 L820 640 L260 640 Z" fill="#030611" stroke="#51647a" strokeWidth={14} />
      <Earth x={700} y={480} r={64} t={t} uid="cb" />
      {/* switch row */}
      <rect x={110} y={700} width={860} height={110} rx={18} fill="#1b2b3a" />
      {Array.from({ length: 10 }).map((_, i) => {
        const flipped = off * 10 > i + 0.5;
        return (
          <g key={i} transform={`translate(${170 + i * 82} 755)`}>
            <rect x={-14} y={-30} width={28} height={60} rx={8} fill="#0d1620" />
            <rect x={-9} y={flipped ? 2 : -26} width={18} height={24} rx={6} fill={flipped ? "#566579" : "#f2b705"} />
          </g>
        );
      })}
      {/* crew in blankets */}
      {[300, 540, 780].map((x, i) => (
        <g key={x}>
          <Astro x={x} y={1130} s={1.2} pose="bust" t={t + i} skin={["#e5b48f", "#d9a37a", "#f0c9a6"][i]} hair={["#6b5a4a", "#2e2218", "#3b2b20"][i]} />
          <path d={`M${x - 70} 1090 Q${x} 1010 ${x + 70} 1090 L${x + 78} 1180 L${x - 78} 1180 Z`} fill="#c9ced6" opacity={cold * 0.95} />
          {cold > 0.2 &&
            [0, 1, 2].map((k) => {
              const a = (t * 0.8 + k / 3 + i * 0.2) % 1;
              return <circle key={k} cx={x + 20 + a * 26} cy={920 - a * 50} r={8 + a * 16} fill="#e8f4ff" opacity={(1 - a) * 0.55 * cold} />;
            })}
        </g>
      ))}
      {/* thermometer */}
      <g transform="translate(940 860)">
        <rect x={-22} y={-170} width={44} height={290} rx={22} fill="#e8f1f8" opacity={0.95} />
        <rect x={-12} y={-160 + (1 - level) * 250} width={24} height={250 * level + 20} rx={12} fill={level > 0.4 ? "#ff7a45" : "#5bb6ff"} />
        <circle cy={118} r={34} fill={level > 0.4 ? "#ff7a45" : "#5bb6ff"} />
        <text x={0} y={-186} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill="#bfe4ff">
          ❄
        </text>
      </g>
      {cold > 0.3 && <Label x={540} y={672} text="NEAR FREEZING" size={32} bg="#5bb6ff" opacity={clamp(cold * 2)} />}
      {/* dim lights */}
      <rect width={1080} height={1920} fill="#02050a" opacity={darkness} />
      {t >= S("l7") && (
        <g opacity={water} transform={`translate(0 ${(1 - water) * 30})`}>
          <rect x={160} y={560} width={760} height={110} rx={26} fill="#0b1420" stroke="#5bb6ff" strokeWidth={5} />
          <path d="M240 590 Q220 620 240 645 Q260 620 240 590 Z" fill="#5bb6ff" />
          <Bar x={300} y={607} w={520} h={34} v={lerp(0.8, 0.15, prog(t, S("l7"), E("l7") + 0.8, lin))} label="" color="#5bb6ff" />
          <text x={560} y={540} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill="#bfe4ff" letterSpacing={3}>
            WATER
          </text>
        </g>
      )}
    </g>
  );
};

// ---- 10. Free-return path --------------------------------------------------------------------------------------------------------
type Pt = [number, number];
const bez = (a: Pt, b: Pt, c: Pt, d: Pt, u: number): Pt => {
  const m = 1 - u;
  return [m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u * u * u * d[0], m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u * u * u * d[1]];
};
const SEGS: [Pt, Pt, Pt, Pt][] = [
  [[330, 1000], [470, 780], [610, 470], [690, 420]],
  [[690, 420], [790, 380], [930, 440], [930, 560]],
  [[930, 560], [930, 680], [860, 740], [790, 690]],
  [[790, 690], [640, 820], [520, 960], [380, 1060]],
];
const TRAJ: Pt[] = SEGS.flatMap((s) => Array.from({ length: 60 }).map((_, i) => bez(s[0], s[1], s[2], s[3], i / 60)));
TRAJ.push(SEGS[3][3]);
const trajAt = (k: number): Pt => {
  const f = clamp(k) * (TRAJ.length - 1);
  const i = Math.floor(f);
  const a = TRAJ[i];
  const b = TRAJ[Math.min(TRAJ.length - 1, i + 1)];
  return [lerp(a[0], b[0], f - i), lerp(a[1], b[1], f - i)];
};

export const Path: React.FC<P> = ({ t }) => {
  const k = prog(t, S("t1") + 0.3, E("t3"), lin);
  const draw = Math.floor(k * (TRAJ.length - 1));
  const [mx, my] = trajAt(k);
  const far = pop(t, S("t3") + 0.2);
  return (
    <g>
      <Space t={t} />
      <Earth x={230} y={1110} r={150} t={t} uid="pe" />
      <Moon x={790} y={560} r={95} uid="pm" />
      <polyline points={TRAJ.map((p) => p.join(",")).join(" ")} fill="none" stroke="#7cc4ff" strokeWidth={4} strokeDasharray="10 12" opacity={0.35} />
      <polyline points={TRAJ.slice(0, draw + 1).map((p) => p.join(",")).join(" ")} fill="none" stroke="#7cc4ff" strokeWidth={8} strokeLinecap="round" />
      {t >= S("t1") && (
        <g opacity={pop(t, S("t1") + 0.3)}>
          {[0, 1, 2, 3].map((i) => {
            const a = i * 1.57 + t * 0.6;
            return <path key={i} d={`M${790 + Math.cos(a) * 150} ${560 + Math.sin(a) * 150} l${-Math.cos(a) * 26} ${-Math.sin(a) * 26}`} stroke="#f2b705" strokeWidth={7} strokeLinecap="round" />;
          })}
          <Label x={790} y={372} text="MOON'S GRAVITY" size={28} />
        </g>
      )}
      <circle cx={mx} cy={my} r={18} fill="#fff" />
      <circle cx={mx} cy={my} r={34} fill="#fff" opacity={0.25} />
      {far > 0 && (
        <g opacity={far}>
          <circle cx={930} cy={560} r={26 + 10 * Math.sin(t * 5)} fill="none" stroke="#f2b705" strokeWidth={6} />
          <Label x={700} y={1190} text="FARTHEST EVER" size={36} />
        </g>
      )}
    </g>
  );
};

// ---- 11. Carbon dioxide and the adapter ------------------------------------------------------------------------------------------
const Item: React.FC<{ kind: "bag" | "card" | "hose" | "tape"; x: number; y: number; s?: number; opacity?: number }> = ({ kind, x, y, s = 1, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    {kind === "bag" && (
      <g>
        <path d="M-50 -40 Q-60 0 -44 44 L44 44 Q60 0 50 -40 Z" fill="#cfe6f5" opacity={0.85} stroke="#8fb4cc" strokeWidth={4} />
        <path d="M-30 -20 Q-10 10 -30 30 M10 -26 Q30 0 14 34" fill="none" stroke="#9cc0d8" strokeWidth={3} />
      </g>
    )}
    {kind === "card" && (
      <g>
        <rect x={-52} y={-40} width={104} height={80} rx={4} fill="#b98a55" />
        <path d="M-52 -14 L52 -14 M-52 12 L52 12" stroke="#8d6538" strokeWidth={4} />
      </g>
    )}
    {kind === "hose" && <path d="M-60 20 Q-30 -50 0 0 T60 -20" fill="none" stroke="#6c7480" strokeWidth={16} strokeLinecap="round" />}
    {kind === "tape" && (
      <g>
        <circle r={38} fill="#9aa1ac" />
        <circle r={20} fill="#10202b" />
        <path d="M30 28 L74 54" stroke="#9aa1ac" strokeWidth={14} strokeLinecap="round" />
      </g>
    )}
  </g>
);

export const Scrub: React.FC<P> = ({ t }) => {
  const rise = prog(t, S("c1") + 0.8, E("c1") + 1.2, lin);
  const fix = prog(t, S("c7") - 0.2, E("c7") + 1.6, lin);
  const co2 = lerp(0.12, 0.92, rise) * (1 - fix) + 0.14 * fix;
  const col = co2 > 0.6 ? "#ff3b30" : co2 > 0.35 ? "#f2b705" : "#3be28b";
  const full = clamp((t - S("c2")) / 1.2);
  const items: { kind: "bag" | "card" | "hose" | "tape"; label: string; x: number }[] = [
    { kind: "bag", label: "BAG", x: 190 },
    { kind: "card", label: "CARDBOARD", x: 400 },
    { kind: "hose", label: "HOSE", x: 640 },
    { kind: "tape", label: "TAPE", x: 860 },
  ];
  const merge = prog(t, S("c6"), S("c6") + 2.2, lin);
  const bump = prog(t, S("c3") + 1.4, S("c3") + 2.2, lin);
  const approach = prog(t, S("c3"), S("c3") + 1.4, easeInOut);
  const sqX = t < S("c4") ? lerp(190, 400, approach) - (bump > 0 ? Math.sin(bump * 3.14) * 40 : 0) : 270;
  return (
    <g>
      <rect width={1080} height={1920} fill="#0e1a24" />
      <Bar x={140} y={400} w={800} h={56} v={co2} label="CARBON DIOXIDE (CO₂)" color={col} />
      {co2 > 0.6 && <text x={940} y={372} textAnchor="end" fontFamily={font} fontWeight={900} fontSize={30} fill="#ff6b61" opacity={0.6 + 0.4 * Math.sin(t * 9)}>DANGER</text>}
      {/* the two filters */}
      <g transform="translate(0 760)">
        {/* round LM canister (clogged) */}
        <g transform="translate(790 120)">
          <circle r={110} fill="#2b3a4a" stroke="#8fb4cc" strokeWidth={8} />
          <circle r={110 * Math.max(0.01, full)} fill="#6b6f77" />
          <circle r={64} fill="none" stroke="#1b2733" strokeWidth={6} />
          <text y={12} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill="#fff" opacity={full}>FULL</text>
        </g>
        <text x={790} y={290} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={24} fill="#a9bbd8" letterSpacing={2}>LM FILTER · ROUND</text>
        {/* square CM filter */}
        <g transform={`translate(${sqX} 120)`} opacity={t >= S("c3") - 0.3 ? 1 : 0.0}>
          <rect x={-90} y={-90} width={180} height={180} rx={10} fill="#d8dce2" stroke="#8d939d" strokeWidth={6} />
          {[-50, -20, 10, 40].map((y) => (
            <line key={y} x1={-70} x2={70} y1={y} y2={y} stroke="#8d939d" strokeWidth={5} />
          ))}
        </g>
        {t >= S("c3") - 0.3 && t < S("c4") && (
          <text x={sqX} y={290} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={24} fill="#a9bbd8" letterSpacing={2}>CM FILTER · SQUARE</text>
        )}
        {bump > 0 && bump < 1 && <text x={600} y={150} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={110} fill="#ff3b30">✕</text>}
        {/* adapter once built */}
        {merge >= 1 && (
          <g>
            <rect x={360} y={80} width={330} height={80} rx={30} fill="#b98a55" />
            <rect x={420} y={70} width={26} height={100} fill="#9aa1ac" />
            <rect x={590} y={70} width={26} height={100} fill="#9aa1ac" />
            <path d="M362 120 L350 120" stroke="#6c7480" strokeWidth={22} strokeLinecap="round" />
          </g>
        )}
      </g>
      {/* ground team */}
      {t >= S("c4") && (
        <g opacity={pop(t, S("c4"))}>
          <Earth x={160} y={620} r={72} t={t} uid="sc" />
          <Label x={300} y={540} text="GROUND TEAM" size={30} bg="#7cc4ff" anchor="start" />
          {[0, 1, 2].map((i) => {
            const a = (t * 0.9 + i / 3) % 1;
            return <circle key={i} cx={160} cy={620} r={90 + a * 260} fill="none" stroke="#7cc4ff" strokeWidth={4} opacity={(1 - a) * 0.4} />;
          })}
        </g>
      )}
      {/* items */}
      {t >= S("c5") &&
        items.map((it, i) => {
          const a = pop(t, S("c5") + 0.3 + i * 0.7, 0.4);
          const toX = lerp(it.x, 525, merge);
          const toY = lerp(1130, 880, merge);
          return (
            <g key={it.kind} opacity={a * (1 - clamp((merge - 0.85) * 7))}>
              <Item kind={it.kind} x={toX} y={toY} s={lerp(1.15, 0.8, merge)} />
              <text x={toX} y={toY + 84} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={26} fill="#fff" letterSpacing={2} opacity={1 - merge}>
                {it.label}
              </text>
            </g>
          );
        })}
      {fix > 0.5 && (
        <g opacity={clamp((fix - 0.5) * 3)}>
          <circle cx={560} cy={660} r={64} fill="#1f7a4d" />
          <text x={560} y={692} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={96} fill="#fff">✓</text>
        </g>
      )}
    </g>
  );
};

// ---- 12/14. Mission control ----------------------------------------------------------------------------------------------------------
const CONSOLE = (() => {
  const r = rng(21);
  return Array.from({ length: 36 }).map((_, i) => ({ row: Math.floor(i / 12), col: i % 12, ph: r() * 6, hue: r() }));
})();

export const MissionControl: React.FC<{ t: number; lost?: boolean; children?: React.ReactNode }> = ({ t, lost = false, children }) => (
  <g>
    <rect width={1080} height={1920} fill="#0b1020" />
    <rect x={80} y={330} width={920} height={380} rx={22} fill="#05080f" stroke="#33415f" strokeWidth={10} />
    {lost ? (
      <g>
        <text x={540} y={500} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={84} fill="#ff3b30" opacity={0.55 + 0.45 * (Math.sin(t * 6) > 0 ? 1 : 0)} letterSpacing={6}>
          SIGNAL LOST
        </text>
        <text x={540} y={580} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={34} fill="#ff8a82" letterSpacing={4}>
          NO TELEMETRY
        </text>
      </g>
    ) : (
      <g>
        <Earth x={230} y={540} r={90} t={t} uid="mce" />
        <Moon x={830} y={470} r={60} uid="mcm" />
        <path d="M300 520 Q520 330 800 450" fill="none" stroke="#7cc4ff" strokeWidth={5} strokeDasharray="10 10" />
        <circle cx={lerp(300, 800, (t * 0.15) % 1)} cy={470 - Math.sin(((t * 0.15) % 1) * 3.14) * 90} r={11} fill="#fff" />
      </g>
    )}
    {[0, 1, 2].map((row) => (
      <g key={row}>
        <rect x={40 + row * 20} y={780 + row * 130} width={1000 - row * 40} height={70} rx={10} fill="#1c2438" />
        {CONSOLE.filter((c) => c.row === row).map((c) => (
          <rect key={c.col} x={80 + row * 24 + c.col * (74 - row * 3)} y={788 + row * 130} width={50} height={32} rx={4} fill={lost ? "#3b1a1a" : c.hue > 0.5 ? "#1f6f5a" : "#2a4f86"} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 1.5 + c.ph))} />
        ))}
        {Array.from({ length: 9 - row }).map((_, i) => (
          <g key={i} transform={`translate(${110 + row * 24 + i * (108 - row * 5)} ${862 + row * 130})`}>
            <circle r={24 - row * 2} fill="#2b2f3a" />
            <rect x={-34 + row * 3} y={14} width={68 - row * 6} height={48} rx={22} fill={["#6b7c97", "#5a6b86", "#7b8aa3"][(i + row) % 3]} />
          </g>
        ))}
      </g>
    ))}
    {children}
  </g>
);

export const Ground: React.FC<P> = ({ t }) => {
  const plan = ["POWER UP SEQUENCE", "ORDER OF SWITCHES", "BATTERY BUDGET", "TIMING"];
  const toSim = prog(t, S("r2") - 0.3, S("r2") + 0.3, (v) => clamp(v));
  return (
    <g>
      <g opacity={1 - toSim}>
        <MissionControl t={t} />
        <g opacity={pop(t, S("r1") + 0.4)}>
          <rect x={290} y={950} width={500} height={250} rx={14} fill="#f3f0e6" />
          <text x={540} y={1000} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={28} fill="#1b2230" letterSpacing={3}>RESTART PLAN</text>
          {plan.map((l, i) => (
            <g key={l} opacity={pop(t, S("r1") + 1.2 + i * 0.9, 0.3)}>
              <text x={330} y={1050 + i * 36} fontFamily={font} fontWeight={700} fontSize={24} fill="#1b2230">
                ✓ {l}
              </text>
            </g>
          ))}
        </g>
      </g>
      <g opacity={toSim}>
        <rect width={1080} height={1920} fill="#101826" />
        <rect x={180} y={430} width={720} height={640} rx={40} fill="#c9ced6" />
        <rect x={220} y={470} width={640} height={560} rx={28} fill="#1c2638" />
        {Array.from({ length: 24 }).map((_, i) => {
          const on = t > S("r2") + 0.6 + i * 0.12;
          return <circle key={i} cx={290 + (i % 8) * 70} cy={560 + Math.floor(i / 8) * 56} r={12} fill={on ? "#3be28b" : "#3a4558"} />;
        })}
        <Astro x={540} y={1060} s={1.4} pose="bust" t={t} hair="#4a3a2c" skin="#e5b48f" />
        <rect x={220} y={880} width={640} height={150} rx={20} fill="#1c2638" opacity={0.95} />
        <Label x={540} y={1130} text="SIMULATOR" size={34} bg="#9fb0cf" />
        <Label x={540} y={400} text="KEN MATTINGLY" size={30} bg="#f2b705" />
      </g>
    </g>
  );
};

export const Wait: React.FC<P> = ({ t }) => {
  const sec = (t - S("r7")) * 2;
  return (
    <MissionControl t={t} lost>
      <g transform="translate(540 1250)">
        <circle r={86} fill="#f3f4f6" stroke="#33415f" strokeWidth={8} />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={0} y1={-72} x2={0} y2={-62} stroke="#1b2230" strokeWidth={4} transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-64} stroke="#e5352b" strokeWidth={5} strokeLinecap="round" transform={`rotate(${sec * 6})`} />
        <circle r={7} fill="#1b2230" />
      </g>
    </MissionControl>
  );
};

// ---- 13. Letting go of the service module -----------------------------------------------------------------------------------------------
export const Sep: React.FC<P> = ({ t }) => {
  const k = prog(t, S("r3") + 0.5, S("r3") + 3.0, (v) => easeInOut(clamp(v)));
  const hi = pop(t, S("r4") + 0.1);
  return (
    <g>
      <Space t={t} />
      <Earth x={900} y={1250} r={300} t={t} uid="sp" />
      <Stack x={lerp(540, 800, k)} y={lerp(640, 420, k)} s={0.62} lm={false} sm={false} rot={lerp(0, 24, k)} />
      <g transform={`translate(${lerp(540, 330, k)} ${lerp(660, 860, k)})`}>
        <Stack x={0} y={0} s={lerp(0.9, 1.45, k)} rot={lerp(0, -16, k)} lm={false} cm={false} panelOff={1} />
        {k > 0.05 && k < 0.9 && <Plume x={50} y={-40} dx={60} dy={-90} t={t} n={14} size={8} spread={30} speed={1.4} color="#fff2cf" />}
      </g>
      {hi > 0 && (
        <g opacity={hi}>
          <circle cx={432} cy={988} r={104 + 8 * Math.sin(t * 6)} fill="none" stroke="#ff3b30" strokeWidth={8} strokeDasharray="16 12" />
          <Label x={432} y={1150} text="PANEL MISSING" size={34} bg="#ff3b30" fg="#fff" />
        </g>
      )}
    </g>
  );
};

// ---- 14. Reentry --------------------------------------------------------------------------------------------------------------------------
export const Reentry: React.FC<P> = ({ t }) => {
  const sway = Math.sin(t * 1.4) * 4;
  return (
    <g>
      <defs>
        <linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#04050c" />
          <stop offset="0.6" stopColor="#2c1a3c" />
          <stop offset="1" stopColor="#7b3a30" />
        </linearGradient>
        <linearGradient id="rfire" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff6c8" />
          <stop offset="0.35" stopColor="#ffb347" />
          <stop offset="1" stopColor="#ff5a2a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#rsky)" />
      {Array.from({ length: 40 }).map((_, i) => {
        const r = rng(500 + i);
        return <circle key={i} cx={r() * 1080} cy={r() * 1000} r={1.6} fill="#fff" opacity={0.5} />;
      })}
      <g transform={`translate(540 760) rotate(${sway})`}>
        <path d={`M-150 70 Q-170 -200 -${40 + Math.sin(t * 20) * 8} -520 Q0 -640 ${40 + Math.cos(t * 17) * 8} -520 Q170 -200 150 70 Z`} fill="url(#rfire)" opacity={0.95} />
        <path d={`M-80 60 Q-90 -140 0 -330 Q90 -140 80 60 Z`} fill="#fff6c8" opacity={0.55} />
        <Stack x={0} y={0} s={1.5} lm={false} sm={false} />
        <ellipse cx={0} cy={12} rx={92} ry={20} fill="#ffcf70" opacity={0.9} />
      </g>
      {Array.from({ length: 22 }).map((_, i) => {
        const r = rng(700 + i);
        const a = (t * 1.2 + r()) % 1;
        return <circle key={i} cx={540 + (r() - 0.5) * 360 + (r() - 0.5) * 120 * a} cy={820 - a * 720} r={3 + r() * 5} fill="#ffd27a" opacity={1 - a} />;
      })}
      {/* radio blackout static */}
      {Array.from({ length: 26 }).map((_, i) => {
        const r = rng(Math.floor(t * 14) * 31 + i);
        return <rect key={i} x={r() * 700} y={300 + r() * 1000} width={120 + r() * 360} height={3} fill="#fff" opacity={0.12 + r() * 0.12} />;
      })}
      <g opacity={t > S("r5") + 1.4 ? 1 : 0}>
        <Label x={540} y={400} text="RADIO BLACKOUT" size={44} bg={Math.sin(t * 6) > 0 ? "#ff3b30" : "#8b1f19"} fg="#fff" />
      </g>
    </g>
  );
};

// ---- 15. Parachutes and splashdown ---------------------------------------------------------------------------------------------------------------------------------
export const Splash: React.FC<P> = ({ t }) => {
  const down = prog(t, S("r8") + 0.2, S("r9") + 1.0, (v) => clamp(v));
  const landed = t >= S("r9") + 1.0;
  const ls = Math.max(0, t - (S("r9") + 1.0));
  const sway = Math.sin(t * 1.6) * (landed ? 0 : 6);
  const capY = landed ? 1040 + Math.sin(t * 1.6) * 6 : lerp(180, 1040, down);
  const canopy = 1 - prog(t, S("r9") + 1.1, S("r9") + 2.6, (v) => clamp(v));
  const waveUp = pop(t, S("r10"));
  const stamp = pop(t, S("r11") + 0.2, 0.35);
  const drops = Array.from({ length: 26 }).map((_, i) => {
    const r = rng(1200 + i);
    const a = clamp(ls * 1.2 - r() * 0.15);
    const ang = -Math.PI * (0.15 + r() * 0.7);
    return { x: 540 + Math.cos(ang) * 280 * a * (0.5 + r()), y: 1060 + Math.sin(ang) * 380 * a * (1 - a * 0.6) + a * a * 160, a };
  });
  return (
    <g>
      <defs>
        <linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fa2dd" />
          <stop offset="1" stopColor="#d6ecf9" />
        </linearGradient>
        <linearGradient id="ssea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a78a8" />
          <stop offset="1" stopColor="#123f63" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#ssky)" />
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={200 + i * 330 + Math.sin(t * 0.2 + i) * 20} cy={430 + (i % 2) * 90} rx={130} ry={34} fill="#fff" opacity={0.75} />
      ))}
      <rect y={1000} width={1080} height={920} fill="url(#ssea)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${60 + i * 190} ${1060 + (i % 3) * 70} q30 -16 60 0 t60 0`} fill="none" stroke="#9cd2ee" strokeWidth={5} opacity={0.5} />
      ))}
      {/* carrier + helicopter */}
      {landed && (
        <g opacity={clamp(ls / 1.2)}>
          <g transform="translate(790 1000)">
            <path d="M-200 0 L260 0 L230 40 L-170 40 Z" fill="#59616c" />
            <rect x={-170} y={-18} width={400} height={18} fill="#7a828d" />
            <rect x={40} y={-70} width={60} height={52} fill="#69717c" />
            <rect x={52} y={-62} width={36} height={14} fill="#bfe3f2" />
            <text x={20} y={32} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={20} fill="#e8edf3">IWO JIMA</text>
          </g>
          <g transform={`translate(${300 + Math.sin(t * 0.8) * 18} 620)`}>
            <rect x={-60} y={-14} width={120} height={44} rx={20} fill="#4a525d" />
            <rect x={50} y={-4} width={80} height={10} fill="#4a525d" />
            <line x1={-100} x2={100} y1={-26} y2={-26} stroke="#222" strokeWidth={6} strokeLinecap="round" transform={`scale(${Math.cos(t * 30)} 1)`} />
            <rect x={-6} y={-26} width={12} height={12} fill="#222" />
          </g>
        </g>
      )}
      {/* capsule + chutes */}
      <g transform={`translate(${540 + sway} ${capY})`}>
        {canopy > 0 &&
          [-1, 0, 1].map((d) => {
            const cy = -520 + (1 - canopy) * 330 + Math.abs(d) * 40;
            const cx = d * 210 * (0.5 + 0.5 * canopy);
            return (
              <g key={d} opacity={Math.min(1, canopy * 2)}>
                <line x1={0} y1={-60} x2={cx - 80} y2={cy} stroke="#e8edf3" strokeWidth={3} />
                <line x1={0} y1={-60} x2={cx + 80} y2={cy} stroke="#e8edf3" strokeWidth={3} />
                <path d={`M${cx - 130} ${cy} Q${cx} ${cy - 190 * canopy - 20} ${cx + 130} ${cy} Z`} fill="#f3f4f6" />
                <path d={`M${cx - 130} ${cy} Q${cx - 70} ${cy - 120 * canopy} ${cx - 44} ${cy} Z M${cx + 44} ${cy} Q${cx + 70} ${cy - 120 * canopy} ${cx + 130} ${cy} Z`} fill="#e5352b" />
              </g>
            );
          })}
        <Stack x={0} y={landed ? 0 : -30} s={1.0} lm={false} sm={false} rot={landed ? -8 : 180 * 0 + 0} />
      </g>
      {landed &&
        drops.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={9 + 5 * (1 - d.a)} fill="#e6f6ff" opacity={(1 - d.a) * 0.9} />)}
      {landed && [0, 1].map((i) => <ellipse key={i} cx={540} cy={1100} rx={90 + ls * 130 + i * 70} ry={16 + ls * 18 + i * 12} fill="none" stroke="#e6f6ff" strokeWidth={5} opacity={Math.max(0, 0.8 - ls * 0.25 - i * 0.2)} />)}
      {/* astronauts in the raft */}
      {t >= S("r10") && (
        <g opacity={waveUp} transform={`translate(0 ${(1 - waveUp) * 40})`}>
          <ellipse cx={540} cy={1150} rx={260} ry={46} fill="#f08a2a" />
          <ellipse cx={540} cy={1136} rx={230} ry={30} fill="#10345a" />
          {[400, 540, 680].map((x, i) => (
            <Astro key={x} x={x} y={1155} s={0.55} pose={i === 1 ? "cheer" : "wave"} t={t + i} skin={["#e5b48f", "#d9a37a", "#f0c9a6"][i]} hair={["#6b5a4a", "#2e2218", "#3b2b20"][i]} />
          ))}
        </g>
      )}
      {stamp > 0 && (
        <g transform={`translate(540 560) rotate(-8) scale(${0.6 + 0.4 * stamp})`} opacity={stamp}>
          <rect x={-380} y={-84} width={760} height={168} rx={26} fill="#fff" fillOpacity={0.9} stroke="#c1272d" strokeWidth={10} />
          <text y={-6} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={70} fill="#c1272d" letterSpacing={4}>
            SUCCESSFUL
          </text>
          <text y={62} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={70} fill="#c1272d" letterSpacing={4}>
            FAILURE
          </text>
        </g>
      )}
    </g>
  );
};
