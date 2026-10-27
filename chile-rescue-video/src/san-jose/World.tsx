import React from "react";
import {
  BLOCK,
  BOTTOM,
  E,
  FLOOR_OFF,
  CY,
  H,
  HOLE_TARGET,
  PATH,
  RIGS,
  RUBBLE,
  RULER_X,
  SHAFT,
  SHELTER,
  SURF,
  T,
  TUNNEL_W,
  W,
  clamp,
  groundY,
  lerp,
  pathAt,
  prog,
  rng,
} from "./geo";
import { Camera, Car, Flag, Person, Rig, SKINS, Tent, Truck } from "../common/Figures";
import {
  LEADER,
  N_MINERS,
  bitX,
  blockSlide,
  dayness,
  drilling,
  holeDepth,
  holesVisible,
  inHook,
  isCollapsed,
  minerLook,
  minerState,
  rigsVisible,
  truckF,
} from "./state";

const hex = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: string, b: string, u: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${Math.round(lerp(A[0], B[0], u))},${Math.round(lerp(A[1], B[1], u))},${Math.round(lerp(A[2], B[2], u))})`;
};

const poly = (pts: [number, number][]) => pts.map((p) => p.join(",")).join(" ");
const pathD = (pts: [number, number][]) => "M" + pts.map((p) => p.join(" ")).join(" L");

// ---- static texture data (seeded, computed once) ----------------------------------
const TILE = 260;
const flecks = (() => {
  const r = rng(11);
  return Array.from({ length: 70 }).map(() => {
    const x = r() * TILE;
    const y = r() * TILE;
    const s = 3 + r() * 11;
    return { x, y, s, a: r() * 6.28, light: r() > 0.5, k: r() };
  });
})();
const cracks = (() => {
  const r = rng(23);
  return Array.from({ length: 9 }).map(() => {
    let x = r() * TILE;
    let y = r() * TILE;
    const pts: [number, number][] = [[x, y]];
    for (let i = 0; i < 4; i++) {
      x += (r() - 0.5) * 60;
      y += (r() - 0.3) * 50;
      pts.push([x, y]);
    }
    return pts;
  });
})();
const strata = (() => {
  const r = rng(5);
  return Array.from({ length: 22 }).map((_, i) => ({ y: i * 100 - 120 + r() * 40, h: 22 + r() * 60, amp: 8 + r() * 26, f: 0.002 + r() * 0.004, ph: r() * 6, c: r() }));
})();
const hills = (() => {
  const r = rng(77);
  return Array.from({ length: 3 }).map((_, k) => ({ k, ph: r() * 6, amp: 30 + k * 18 }));
})();
const rubbleRocks = (() => {
  const r = rng(404);
  return Array.from({ length: 34 }).map(() => {
    const a = r() * 6.28;
    const d = Math.sqrt(r());
    return { x: Math.cos(a) * d * 58, y: Math.sin(a) * d * 34, s: 8 + r() * 15, a: r() * 6, tone: Math.floor(r() * 4) };
  });
})();
const camp = (() => {
  const r = rng(909);
  const tents = ["#e4572e", "#f3a712", "#4aa3a2", "#e9d758", "#7d5ba6", "#3d84c6"];
  return {
    tents: Array.from({ length: 9 }).map((_, i) => ({ x: 1380 + i * 92 + r() * 20, w: 68 + r() * 26, h: 46 + r() * 22, c: tents[i % tents.length] })),
    people: Array.from({ length: 16 }).map((_, i) => ({ x: 1330 + r() * 640, ph: r() * 6, skin: SKINS[i % 5], suit: ["#3d6f9e", "#c25b4a", "#6a9a5b", "#d8b24a", "#8a6bb0"][i % 5], f: (r() > 0.5 ? 1 : -1) as 1 | -1 })),
  };
})();
const stars = (() => {
  const r = rng(31);
  return Array.from({ length: 90 }).map(() => ({ x: -1000 + r() * 3600, y: -900 + r() * 700, s: 1 + r() * 2.2 }));
})();

type Props = { t: number; cx: number; cy: number; s: number; shakeX: number; shakeY: number };

export const World: React.FC<Props> = ({ t, cx, cy, s, shakeX, shakeY }) => {
  const day = dayness(t);
  const hook = inHook(t);
  const collapsed = isCollapsed(t);
  const skyTop = mix("#0a1230", "#5f9bd6", day);
  const skyBot = mix("#2b2a4f", "#f6dca9", day);

  // --- helper: constant-size label in world space
  const Tag: React.FC<{ x: number; y: number; text: string; px?: number; bg?: string; fg?: string; o?: number }> = ({ x, y, text, px = 30, bg = "#f2b705", fg = "#14161a", o = 1 }) => {
    const fs = px / s;
    const w = (text.length * px * 0.62 + px * 1.2) / s;
    return (
      <g opacity={o} transform={`translate(${x} ${y})`}>
        <rect x={-w / 2} y={-fs * 0.95} width={w} height={fs * 1.6} rx={fs * 0.35} fill={bg} />
        <text x={0} y={fs * 0.28} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={fs} fill={fg} letterSpacing={fs * 0.04}>
          {text}
        </text>
      </g>
    );
  };

  const tunnelPts = PATH as [number, number][];
  const floorPts = tunnelPts.map(([x, y]) => [x, y + FLOOR_OFF] as [number, number]);

  // --- lighting dots along the tunnel
  const lamps: [number, number][] = [];
  for (let f = 0.03; f < 0.985; f += 0.022) {
    const { p } = pathAt(f);
    lamps.push([p[0], p[1] - 15]);
  }

  // --- block + collapse
  const slide = blockSlide(t);
  const blockOn = !hook && t >= T("c1") && t < T("c3") + 0.5;
  const blockFade = 1 - clamp((t - T("c3")) / 0.5);
  const blockPulse = 0.12 + 0.05 * Math.sin(t * 9);
  const rubbleIn = hook ? 1 : prog(t, T("c3"), T("c3") + 0.45);
  const dustT = t - T("c3");

  // --- ruler
  const rulerShow = (a: number, b: number) => clamp((t - a) / 0.5) * (1 - clamp((t - b) / 0.5));
  const rulerA = Math.max(rulerShow(T("s6"), E("s6") + 1.6), rulerShow(T("b12"), E("b13") + 1.5));
  const rulerGrow = t < T("b12") - 1 ? prog(t, T("s6") + 0.2, T("s6") + 1.8) : prog(t, T("b12") + 0.1, T("b12") + 1.3);
  const holeRuler = rulerShow(T("b3") - 0.2, E("b3") + 1.5);

  // --- surface note state
  const noteAttached = t >= T("b5") + 0.6;
  const tipY = clamp(holeDepth(0, t), -62, 1800);
  const tipX = bitX(0, t);
  const writing = prog(t, T("b8") + 0.1, E("b8") + 0.7, (u) => u);

  // dust puffs
  const puffs = Array.from({ length: 16 }).map((_, i) => {
    const r = rng(60 + i);
    return { x: (r() - 0.5) * 150, y: (r() - 0.5) * 70, v: 14 + r() * 26, sz: 24 + r() * 40, d: r() * 0.6 };
  });

  const showFlashPres = t >= T("b10") && t < E("b10") + 0.8;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1={0} y1={-1100} x2={0} y2={0}>
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBot} />
        </linearGradient>
        <linearGradient id="depth" gradientUnits="userSpaceOnUse" x1={0} y1={-300} x2={0} y2={2300}>
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <pattern id="tex" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          {flecks.map((f, i) => (
            <polygon key={i} transform={`translate(${f.x} ${f.y}) rotate(${(f.a * 180) / 3.14})`} points={`${-f.s},${-f.s * 0.5} ${f.s * 0.2},${-f.s * 0.8} ${f.s},${f.s * 0.3} ${-f.s * 0.3},${f.s * 0.7}`} fill={f.light ? "#5b6068" : "#25272c"} opacity={0.35 + f.k * 0.3} />
          ))}
          {cracks.map((c, i) => (
            <path key={i} d={pathD(c)} fill="none" stroke="#1b1d21" strokeWidth={2.2} opacity={0.55} />
          ))}
        </pattern>
        <clipPath id="ground">
          <polygon points={poly([...SURF, [2600, BOTTOM], [-1200, BOTTOM]])} />
        </clipPath>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#ffd88a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffd88a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="noteReveal">
          <rect x={-17} y={-12} width={34 * writing} height={24} />
        </clipPath>
      </defs>

      <g transform={`translate(${W / 2 + shakeX} ${CY + shakeY}) scale(${s}) translate(${-cx} ${-cy})`}>
        {/* ---------- sky ---------- */}
        <rect x={-1400} y={-3400} width={4200} height={3400} fill="url(#sky)" />
        {day < 0.8 && stars.map((st, i) => <circle key={i} cx={st.x} cy={st.y} r={st.s} fill="#fff" opacity={(1 - day) * 0.8} />)}
        {/* far Andes silhouette */}
        <path d={`M-1200 -330 ${Array.from({ length: 30 }).map((_, i) => `L${-1200 + i * 130} ${-380 - 60 * Math.abs(Math.sin(i * 1.7)) - 30 * Math.sin(i * 0.6)}`).join(" ")} L2700 -330 Z`} fill={mix("#141a33", "#9aa9c4", day)} />
        {hills.map((h) => (
          <path key={h.k} d={`M-1200 0 ${Array.from({ length: 40 }).map((_, i) => `L${-1200 + i * 100} ${-70 - h.k * 45 - h.amp * Math.sin(i * 0.5 + h.ph)}`).join(" ")} L2800 0 Z`} fill={mix("#1a1f33", ["#d3b17a", "#c79f66", "#bb9358"][h.k], day)} opacity={0.95} />
        ))}

        {/* ---------- ground ---------- */}
        <g clipPath="url(#ground)">
          <rect x={-1200} y={-400} width={3900} height={BOTTOM + 420} fill="#474b52" />
          {strata.map((b, i) => (
            <path
              key={i}
              d={`M-1200 ${b.y} ${Array.from({ length: 40 }).map((_, k) => `L${-1200 + k * 100} ${b.y + b.amp * Math.sin(k * 100 * b.f + b.ph)}`).join(" ")} L2700 ${b.y + b.h} ${Array.from({ length: 40 }).map((_, k) => `L${2700 - k * 100} ${b.y + b.h + b.amp * Math.sin((2700 - k * 100) * b.f + b.ph)}`).join(" ")} Z`}
              fill={b.c > 0.5 ? "#44484f" : "#35383d"}
              opacity={0.65}
            />
          ))}
          <rect x={-1200} y={-400} width={3900} height={BOTTOM + 420} fill="url(#tex)" />
          <rect x={-1200} y={-400} width={3900} height={BOTTOM + 420} fill="url(#depth)" />
          {/* surface sand layer */}
          <path d={`${pathD(SURF as [number, number][])} L2600 22 L600 22 L480 -48 L200 -178 L-300 -278 L-1200 -318 Z`} fill={mix("#2a2f3e", "#c4a06a", day)} opacity={0.0} />
        </g>
        <path d={pathD(SURF as [number, number][])} fill="none" stroke={mix("#202638", "#d8b983", day)} strokeWidth={10} strokeLinejoin="round" />

        {/* ---------- tunnels ---------- */}
        <polyline points={poly(tunnelPts)} fill="none" stroke="#15181d" strokeWidth={TUNNEL_W + 12} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={poly(tunnelPts)} fill="none" stroke="#06070a" strokeWidth={TUNNEL_W} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={poly(floorPts)} fill="none" stroke="#454b55" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />
        {lamps.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={16} fill="url(#glow)" opacity={0.25} />
            <circle cx={p[0]} cy={p[1]} r={2.4} fill="#ffe7a8" />
          </g>
        ))}

        {/* mine portal + sign */}
        <g transform={`translate(60 ${groundY(60)})`}>
          <rect x={-34} y={-30} width={9} height={36} fill="#6b4a2b" transform="rotate(-24 -30 0)" />
          <rect x={26} y={-26} width={9} height={36} fill="#6b4a2b" transform="rotate(-24 30 0)" />
          <rect x={-38} y={-46} width={78} height={9} fill="#7b5632" transform="rotate(-24 0 -40)" />
        </g>
        {t >= T("s1") - 0.5 && (
          <g transform={`translate(-70 ${groundY(-70) - 12})`}>
            <rect x={-3} y={-34} width={6} height={36} fill="#8a939e" />
            <rect x={-72} y={-92} width={144} height={62} rx={7} fill="#1f3a5f" stroke="#e8edf3" strokeWidth={3} />
            <text x={0} y={-66} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={17} fill="#fff">SAN JOSÉ</text>
            <text x={0} y={-45} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={600} fontSize={13} fill="#c9d7ea">COPPER · GOLD MINE</text>
          </g>
        )}

        {/* ---------- vent shaft + ladder ---------- */}
        <g>
          <rect x={SHAFT.x - SHAFT.w / 2 - 5} y={SHAFT.y0} width={SHAFT.w + 10} height={SHAFT.y1 - SHAFT.y0} fill="#15181d" />
          <rect x={SHAFT.x - SHAFT.w / 2} y={SHAFT.y0} width={SHAFT.w} height={SHAFT.y1 - SHAFT.y0} fill="#06070a" />
          <line x1={SHAFT.x - 8} x2={SHAFT.x - 8} y1={SHAFT.ladderTop} y2={SHAFT.y1} stroke="#9b6b3a" strokeWidth={2.4} />
          <line x1={SHAFT.x + 8} x2={SHAFT.x + 8} y1={SHAFT.ladderTop} y2={SHAFT.y1} stroke="#9b6b3a" strokeWidth={2.4} />
          {Array.from({ length: Math.floor((SHAFT.y1 - SHAFT.ladderTop) / 13) }).map((_, i) => (
            <line key={i} x1={SHAFT.x - 8} x2={SHAFT.x + 8} y1={SHAFT.y1 - 8 - i * 13} y2={SHAFT.y1 - 8 - i * 13} stroke="#9b6b3a" strokeWidth={2} />
          ))}
          {/* the part of the ladder that was never installed */}
          {t >= T("l2") - 0.2 && t < T("sh1") &&
            Array.from({ length: 12 }).map((_, i) => (
              <line key={i} x1={SHAFT.x - 8} x2={SHAFT.x + 8} y1={SHAFT.ladderTop - 12 - i * 24} y2={SHAFT.ladderTop - 12 - i * 24} stroke="#ff5a4a" strokeWidth={2} strokeDasharray="4 4" opacity={0.35 + 0.35 * Math.sin(t * 6)} />
            ))}
        </g>

        {/* ---------- shelter ---------- */}
        <g>
          <rect x={SHELTER.x0 - 8} y={SHELTER.y0 - 8} width={SHELTER.x1 - SHELTER.x0 + 16} height={SHELTER.y1 - SHELTER.y0 + 16} rx={8} fill="#15181d" />
          <rect x={SHELTER.x0} y={SHELTER.y0} width={SHELTER.x1 - SHELTER.x0} height={SHELTER.y1 - SHELTER.y0} rx={5} fill="#2a2d33" />
          <rect x={SHELTER.x0} y={SHELTER.y0} width={SHELTER.x1 - SHELTER.x0} height={SHELTER.y1 - SHELTER.y0} rx={5} fill="url(#glow)" opacity={0.18 * (1 - 0.7 * prog(t, T("d6"), E("d6") + 1) * (t < T("b2") ? 1 : 0))} />
          <rect x={SHELTER.x0} y={SHELTER.y1 - 6} width={SHELTER.x1 - SHELTER.x0} height={8} fill="#454b55" />
          {/* bulb */}
          <line x1={570} x2={570} y1={SHELTER.y0} y2={SHELTER.y0 + 12} stroke="#777" strokeWidth={1.5} />
          <circle cx={570} cy={SHELTER.y0 + 15} r={36} fill="url(#glow)" opacity={0.55 * (1 - 0.8 * (t > T("d6") && t < T("b2") ? prog(t, T("d6"), E("d6") + 1) : 0))} />
          <circle cx={570} cy={SHELTER.y0 + 15} r={4} fill="#fff3c4" />
          {/* supply table */}
          <rect x={392} y={SHELTER.y1 - 34} width={44} height={4} fill="#8a6a45" />
          <rect x={395} y={SHELTER.y1 - 30} width={3} height={30} fill="#6b4f31" />
          <rect x={430} y={SHELTER.y1 - 30} width={3} height={30} fill="#6b4f31" />
          {[0, 1, 2].map((i) => {
            const empty = t >= T("d4"); // supplies are gone by the time the food runs out
            return <rect key={i} x={399 + i * 11} y={SHELTER.y1 - 44} width={9} height={10} rx={1.5} fill={empty ? "#3a3d44" : "#3b82c4"} opacity={empty ? 0.5 : 1} />;
          })}
        </g>

        {/* ration icons popping above the table during f3 */}
        {t >= T("f3") && t < E("f3") + 1.2 &&
          [0, 1, 2].map((i) => {
            const u = prog(t, T("f3") + 0.5 + i * 1.3, T("f3") + 0.9 + i * 1.3, (v) => v);
            const out = 1 - clamp((t - E("f3")) / 1.0);
            return (
              <g key={i} transform={`translate(${424 + i * 22} ${SHELTER.y1 - 74 - 4 * Math.sin(t * 3 + i)}) scale(${u * 0.8})`} opacity={out}>
                {i === 0 && (<><rect x={-8} y={-6} width={16} height={12} rx={2} fill="#3b82c4" /><ellipse cx={0} cy={-6} rx={8} ry={2.4} fill="#cfd6de" /><rect x={-8} y={-2} width={16} height={3} fill="#e8edf3" /></>)}
                {i === 1 && (<><rect x={-6} y={-9} width={12} height={17} rx={1.5} fill="#f5f7fa" /><path d="M-6 -9 L0 -14 L6 -9 Z" fill="#dfe6ee" /><rect x={-6} y={-3} width={12} height={5} fill="#5fa8e8" /></>)}
                {i === 2 && (<><rect x={-8} y={-7} width={16} height={14} rx={2} fill="#d9a15a" />{[-3, 3].map((k) => <circle key={k} cx={k} cy={0} r={1.1} fill="#8a5a22" />)}</>)}
              </g>
            );
          })}

        {/* ---------- miners ---------- */}
        {Array.from({ length: N_MINERS }).map((_, k) => {
          // paint back row first
          const i = k;
          const st = minerState(i, t);
          const look = minerLook(i);
          const lieOffset = st.pose === "lie" ? 9 : 0;
          return <Person key={i} x={st.p[0]} y={st.p[1] + lieOffset} t={t} phase={i * 0.9} pose={st.pose} facing={st.facing} skin={look.skin} suit={look.suit} helmet={look.helmet} scale={0.95} lamp={i % 3 !== 1} />;
        })}

        {/* ---------- truck ---------- */}
        {t >= T("s4") - 0.5 && t < E("s6") + 0.6 && (() => {
          const f = truckF(t);
          const { p, ang } = pathAt(f);
          const off = FLOOR_OFF;
          const px = p[0] - Math.sin(ang) * off;
          const py = p[1] + Math.cos(ang) * off;
          return <Truck x={px} y={py} ang={ang} />;
        })()}

        {/* ---------- rescuers in the shaft (u3/u4) ---------- */}
        {t >= T("u3") && t < T("u4") + 1.8 && (() => {
          const down = prog(t, T("u3"), T("u4") + 0.1);
          const up = prog(t, T("u4") + 0.4, T("u4") + 1.7);
          const y = lerp(SHAFT.y0 + 8, SHAFT.y0 + 240, down) - up * 240;
          return (
            <g>
              <line x1={SHAFT.x} x2={SHAFT.x} y1={SHAFT.y0 - 40} y2={y - 48} stroke="#f2c14e" strokeWidth={2} />
              <Person x={SHAFT.x} y={y} t={t} phase={2} pose="climb" suit="#e8c51b" suitStyle="vest" helmet="#d33" />
            </g>
          );
        })()}

        {/* shaft top sealed after the mountain moves again */}
        {t >= T("u4") + 0.3 && (
          <g opacity={prog(t, T("u4") + 0.3, T("u4") + 1.0)}>
            {rubbleRocks.slice(0, 14).map((r, i) => (
              <polygon key={i} transform={`translate(${SHAFT.x + r.x * 0.2} ${SHAFT.y0 + 10 + ((i * 17) % 120)}) rotate(${r.a * 57})`} points={`${-r.s * 0.7},${-r.s * 0.4} ${r.s * 0.1},${-r.s * 0.7} ${r.s * 0.7},${r.s * 0.2} ${-r.s * 0.2},${r.s * 0.6}`} fill={["#59606a", "#4a4f57", "#6a717b", "#3d4249"][r.tone]} />
            ))}
          </g>
        )}
        {t >= T("u4") && t < T("u4") + 2.2 &&
          Array.from({ length: 10 }).map((_, i) => {
            const r = rng(300 + i);
            const u = (t - T("u4") - r() * 0.5) * 1.5;
            return u > 0 ? <rect key={i} x={SHAFT.x - 8 + r() * 16} y={SHAFT.y0 + u * 160 + i * 6} width={5} height={5} fill="#7d838c" /> : null;
          })}

        {/* ---------- falling block (c1–c3) ---------- */}
        {blockOn && (
          <g transform={`translate(0 ${slide * BLOCK.slide})`} opacity={blockFade}>
            <rect x={BLOCK.x0} y={BLOCK.y0} width={BLOCK.x1 - BLOCK.x0} height={BLOCK.y1 - BLOCK.y0} rx={14} fill="#7fa6cf" fillOpacity={blockPulse} stroke="#bcd7f2" strokeWidth={4} strokeDasharray="14 9" />
            <path d={`M${BLOCK.x0 + 60} ${BLOCK.y0 + 40} L${BLOCK.x0 + 180} ${BLOCK.y0 + 210} L${BLOCK.x0 + 120} ${BLOCK.y0 + 330}`} fill="none" stroke="#bcd7f2" strokeWidth={3} opacity={0.5} />
            <path d={`M${BLOCK.x1 - 80} ${BLOCK.y0 + 60} L${BLOCK.x1 - 200} ${BLOCK.y0 + 220}`} fill="none" stroke="#bcd7f2" strokeWidth={3} opacity={0.5} />
            {t >= T("c1") && t < T("c2") + 1.4 && (
              <g transform={`translate(${(BLOCK.x0 + BLOCK.x1) / 2} ${BLOCK.y0 - 30})`}>
                <Tag x={0} y={0} text="45-STORY BLOCK OF ROCK" px={26} bg="#e8f1fb" />
              </g>
            )}
          </g>
        )}

        {/* ---------- rubble that seals the tunnel ---------- */}
        {collapsed && (
          <g transform={`translate(${RUBBLE[0]} ${RUBBLE[1]}) scale(${0.4 + 0.6 * rubbleIn})`} opacity={rubbleIn}>
            <ellipse cx={0} cy={4} rx={74} ry={42} fill="#2b2e33" />
            {rubbleRocks.map((r, i) => (
              <polygon key={i} transform={`translate(${r.x} ${r.y}) rotate(${r.a * 57})`} points={`${-r.s},${-r.s * 0.5} ${r.s * 0.1},${-r.s * 0.9} ${r.s},${r.s * 0.2} ${-r.s * 0.3},${r.s * 0.8}`} fill={["#6a717b", "#59606a", "#7d848e", "#4a4f57"][r.tone]} stroke="#25282d" strokeWidth={1.2} />
            ))}
          </g>
        )}
        {/* blocked marker */}
        {collapsed && ((t >= T("h3") && t < E("h3") + 0.8) || (t >= T("c5") && t < E("c5") + 1.2)) && (
          <g transform={`translate(${RUBBLE[0]} ${RUBBLE[1] - 90})`} opacity={0.85 + 0.15 * Math.sin(t * 8)}>
            <circle r={26 / s} fill="#d8372b" stroke="#fff" strokeWidth={3 / s} />
            <path d={`M${-11 / s} ${-11 / s} L${11 / s} ${11 / s} M${11 / s} ${-11 / s} L${-11 / s} ${11 / s}`} stroke="#fff" strokeWidth={5 / s} strokeLinecap="round" />
          </g>
        )}
        {/* dust after the blast */}
        {!hook && t >= T("c3") && t < E("c5") + 1.5 &&
          puffs.map((p, i) => {
            const u = dustT - p.d;
            if (u < 0) return null;
            const a = Math.min(0.42, u * 0.9) * (1 - clamp((t - E("c4")) / 3));
            return <circle key={i} cx={RUBBLE[0] + p.x + u * 6 * (i % 2 ? 1 : -1)} cy={RUBBLE[1] + p.y - u * p.v} r={p.sz + u * 10} fill="#a79d8d" opacity={a} />;
          })}

        {/* ---------- drill holes ---------- */}
        {holesVisible(t) &&
          RIGS.map((x, i) => {
            const d = holeDepth(i, t);
            const bx = bitX(i, t);
            const lit = drilling(t) || (i === 0 && t < E("b7"));
            return (
              <g key={i} opacity={prog(t, T("d1") - 0.6, T("d1") - 0.1, (v) => v) * (hook ? 0 : 1) + (hook ? 1 : 0)}>
                <line x1={x} x2={bx} y1={0} y2={Math.max(d, -50)} stroke="#aeb6c0" strokeWidth={Math.max(4.2, 3.2 / s)} />
                <line x1={x} x2={bx} y1={0} y2={Math.max(d, -50)} stroke="#3b414a" strokeWidth={1.2} />
                <g transform={`translate(${bx} ${d})`}>
                  <path d="M-7 -10 L7 -10 L0 8 Z" fill="#ff9d2e" stroke="#7a3a00" strokeWidth={1.3} />
                  {lit && <circle r={11} cy={2} fill="url(#glow)" />}
                </g>
              </g>
            );
          })}

        {/* ---------- ruler ---------- */}
        {rulerA > 0 && (
          <g opacity={rulerA}>
            <line x1={RULER_X} x2={RULER_X} y1={0} y2={1790 * rulerGrow} stroke="#e8edf3" strokeWidth={4} />
            {Array.from({ length: 19 }).map((_, i) => (i * 100 <= 1790 * rulerGrow ? <line key={i} x1={RULER_X - 12} x2={RULER_X + 12} y1={i * 100} y2={i * 100} stroke="#e8edf3" strokeWidth={3} /> : null))}
            <Tag x={RULER_X - 130} y={900} text="2,300 FT" px={44} bg="#f2b705" />
          </g>
        )}
        {holeRuler > 0 && (
          <g opacity={holeRuler}>
            <line x1={RIGS[0]} x2={RULER_X} y1={HOLE_TARGET[0]} y2={HOLE_TARGET[0]} stroke="#ffb347" strokeWidth={3} strokeDasharray="10 8" />
            <line x1={RULER_X} x2={RULER_X} y1={0} y2={HOLE_TARGET[0]} stroke="#ffb347" strokeWidth={4} />
            <Tag x={RULER_X - 130} y={HOLE_TARGET[0] - 120} text="2,257 FT" px={42} bg="#ffb347" />
          </g>
        )}

        {/* ---------- surface: rigs, camp, vehicles ---------- */}
        {rigsVisible(t) && RIGS.map((x, i) => <Rig key={x} x={x} t={t + i} active={drilling(t)} />)}
        {t >= T("u1") - 0.5 && (
          <g>
            <Car x={1250} />
            <Car x={1990} color="#d5d9de" />
            <g transform="translate(1700 0)">
              <rect x={-60} y={-46} width={120} height={46} fill="#2f6fb2" />
              <rect x={-60} y={-46} width={120} height={6} fill="#245a93" />
            </g>
            {camp.tents.map((tn, i) => <Tent key={i} x={tn.x} w={tn.w} h={tn.h} color={tn.c} />)}
            <Flag x={1320} t={t} />
            <Flag x={2040} t={t + 1} />
            {camp.people.map((p, i) => <Person key={i} x={p.x} y={0} t={t} phase={p.ph} pose={i % 4 === 0 ? "wave" : "stand"} skin={p.skin} suit={p.suit} suitStyle="vest" lamp={false} helmet="#00000000" facing={p.f} scale={1.05} />)}
            {/* Camp Hope sign */}
            <g transform={`translate(1560 0) scale(${0.6 + 0.4 * prog(t, T("u2") - 0.3, T("u2") + 0.4)})`} opacity={prog(t, T("u2") - 0.3, T("u2") + 0.2, (v) => v)}>
              <rect x={-95} y={-150} width={7} height={150} fill="#7b5632" />
              <rect x={88} y={-150} width={7} height={150} fill="#7b5632" />
              <rect x={-120} y={-230} width={240} height={86} rx={9} fill="#f7f0de" stroke="#7b5632" strokeWidth={5} />
              <text x={0} y={-182} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={36} fill="#1f5a3d">CAMP HOPE</text>
              <text x={0} y={-155} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={600} fontSize={13} fill="#7b5632" letterSpacing={1.5}>CAMPAMENTO ESPERANZA</text>
            </g>
          </g>
        )}

        {/* ---------- the note (b5 → b9) ---------- */}
        {noteAttached && t < E("b10") + 3 && (
          <g transform={`translate(${tipX + 22} ${tipY - 2}) rotate(${t > T("b7") ? -4 : 0})`}>
            <rect x={-17} y={-11} width={34} height={22} rx={1.4} fill="#f7f3e8" stroke="#d8d1bf" strokeWidth={0.6} />
            {t >= T("b8") && (
              <g clipPath="url(#noteReveal)" fontFamily="Inter, sans-serif" fontWeight={800} fontStyle="italic" fill="#c1272d" textAnchor="middle" fontSize={4.6}>
                <text x={0} y={-3.6}>ESTAMOS BIEN</text>
                <text x={0} y={2}>EN EL REFUGIO</text>
                <text x={0} y={7.6}>LOS 33</text>
              </g>
            )}
          </g>
        )}
        {t >= T("b7") && t < E("b10") + 3 && (
          <Person x={RIGS[0] + 118} y={0} t={t} phase={4} pose="stand" facing={-1} suit="#f0892a" scale={1.15} skin={SKINS[1]} />
        )}

        {/* ---------- president + cameras (b10) ---------- */}
        {t >= T("b9") + 0.5 && t < E("b10") + 3 && (() => {
          const pf = 1.5;
          return (
            <g>
              <Person x={1190} y={0} t={t} phase={1} pose="wave" suitStyle="suit" suit="#1c2434" skin={SKINS[4]} scale={pf} lamp={false} />
              <g transform={`translate(${1190 + 14 * pf} ${-50 * pf}) rotate(-8)`}>
                <rect x={-14} y={-22} width={28} height={22} rx={1.5} fill="#f7f3e8" stroke="#d8d1bf" strokeWidth={1} />
                <text x={0} y={-12} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontStyle="italic" fontSize={4.6} fill="#c1272d">ESTAMOS BIEN EN EL</text>
                <text x={0} y={-6} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontStyle="italic" fontSize={4.6} fill="#c1272d">REFUGIO LOS 33</text>
              </g>
              {[1285, 1335, 1385].map((x, i) => (
                <Camera key={x} x={x} t={t} phase={i + 2} flash={showFlashPres && (t * 3 + i * 0.37) % 1 < 0.09} />
              ))}
            </g>
          );
        })()}

        {/* ---------- labels ---------- */}
        {t >= T("sh3") && t < E("sh3") + 1.2 && <Tag x={570} y={SHELTER.y0 - 34} text="SHELTER" px={36} bg="#f2b705" o={clamp((t - T("sh3")) / 0.3) * (1 - clamp((t - E("sh3")) / 1.0))} />}

        {/* pre-dawn tint over the surface */}
        <rect x={-1400} y={-3400} width={4200} height={3400} fill="#0a1030" opacity={(1 - day) * 0.25} />
      </g>
    </svg>
  );
};
