import React from "react";
import { Car } from "../common/Figures";
import { Person } from "../common/Figures";
import { clamp, easeInOut, easeOut, lerp, prog, rng } from "../common/math";
import { useTL } from "../common/story";
import { ALC_CEIL, ALC_X, BENCH_Y, BREACH, Backdrop, Crew, Dots, EXIT_TOP, FLOOR, GROUND_TOP, Label, Mine, Pipe, RIG_X, Ruler, SurfaceRig, X0, X1, font } from "./art";
import { useL } from "./i18n";

type P = { t: number };
const lin = (v: number) => clamp(v);
const pop = (t: number, at: number, d = 0.45) => easeOut((t - at) / d);

/** Final extent of the flood in the main corridor (water stops short of the alcove). */
const WATER_END = 540;

// ---- 1. Hook ------------------------------------------------------------------------------------------------
export const Hook: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const rigA = pop(t, S("h3"));
  const pipeY = lerp(GROUND_TOP, ALC_CEIL + 6, prog(t, S("h3") + 0.3, E("h3") + 0.6, lin));
  const tapT = S("h4") + 1.3;
  const lit = t >= tapT ? Math.min(9, Math.floor((t - tapT) / 0.3) + 1) : 0;
  return (
    <g>
      <Backdrop uid="hk" t={t} />
      <Mine uid="hk" t={t} waterL={X0} waterR={WATER_END} level={1} alcove={0} wet={1} />
      <Crew x={650} y={BENCH_Y} step={34} t={t} crew="b" pose="sit" />
      <g opacity={rigA}>
        <SurfaceRig x={RIG_X} t={t} active={t < E("h3") + 1} />
      </g>
      <Pipe x={RIG_X} y0={GROUND_TOP} y1={pipeY} />
      <Ruler x={990} y0={GROUND_TOP} y1={FLOOR} text={L.depth} opacity={pop(t, S("h1") + 0.6)} />
      <Label x={300} y={FLOOR - 60} text={L.water} size={30} bg="#3d8fd1" fg="#fff" opacity={pop(t, S("h2"))} />
      {Array.from({ length: lit }).map((_, k) => {
        const age = t - (tapT + k * 0.3);
        return <circle key={k} cx={RIG_X} cy={ALC_CEIL + 12} r={10 + age * 160} fill="none" stroke="#f2b705" strokeWidth={5} opacity={Math.max(0, 0.9 - age * 1.6)} />;
      })}
      <Dots x={540} y={392} n={9} lit={lit} />
    </g>
  );
};

// ---- 2. Setting -------------------------------------------------------------------------------------------------
export const Setting: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const crack = prog(t, S("s5") + 0.2, E("s5"), lin);
  return (
    <g>
      <Backdrop uid="st" t={t} />
      <Mine uid="st" t={t} />
      <Crew x={160} y={FLOOR} step={36} t={t} crew="a" />
      <Crew x={620} y={FLOOR} step={36} t={t} crew="b" />
      <Label x={540} y={GROUND_TOP - 70} text={L.county} size={34} bg="#fff" opacity={pop(t, S("s2"))} />
      <Label x={320} y={FLOOR + 50} text={L.crew1} size={30} bg="#f5c518" opacity={pop(t, S("s3"))} />
      <Label x={780} y={FLOOR + 50} text={L.crew2} size={30} bg="#f2f2f2" opacity={pop(t, S("s3") + 0.5)} />
      <Label x={540} y={FLOOR + 100} text={L.mine} size={30} bg="#2a3340" fg="#fff" opacity={pop(t, S("s3"))} />
      <Label x={420} y={590} text={L.abandoned} size={28} bg="#8a93a3" opacity={pop(t, S("s4"))} />
      {crack > 0 && (
        <path d={`M${BREACH[0]} ${BREACH[1] - 24} L${BREACH[0] - 12 * crack} ${BREACH[1] - 4} L${BREACH[0] + 8 * crack} ${BREACH[1] + 14} L${BREACH[0] - 6 * crack} ${BREACH[1] + 28}`} fill="none" stroke="#ff5a4a" strokeWidth={7} strokeLinecap="round" />
      )}
      {t >= S("s5") && (
        <g transform="translate(930 600)" opacity={pop(t, S("s5"))}>
          <circle r={62} fill="#f3f4f6" stroke="#2a3340" strokeWidth={8} />
          <line x1={0} y1={0} x2={-34} y2={0} stroke="#1b2230" strokeWidth={8} strokeLinecap="round" />
          <line x1={0} y1={0} x2={0} y2={-44} stroke="#1b2230" strokeWidth={5} strokeLinecap="round" />
          <circle r={6} fill="#1b2230" />
        </g>
      )}
    </g>
  );
};

// ---- 3. The flood ----------------------------------------------------------------------------------------------------
const flee = (u: number, x0: number): { x: number; y: number } => {
  if (u < 0.35) return { x: lerp(x0, 150, u / 0.35), y: FLOOR };
  const v = (u - 0.35) / 0.65;
  return { x: lerp(150, EXIT_TOP[0] + 14, v), y: lerp(FLOOR, EXIT_TOP[1] + 30, v) };
};

export const Flood: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const spread = prog(t, S("f1") + 0.2, E("f3"), lin);
  const settle = prog(t, S("f3"), E("f3") + 0.8, easeInOut);
  return (
    <g>
      <Backdrop uid="fl" t={t} />
      <Mine uid="fl" t={t} waterL={lerp(BREACH[0], X0, spread)} waterR={lerp(BREACH[0], WATER_END, spread)} level={Math.min(1, 0.3 + spread)} alcove={0} wet={1} />
      {/* water jet from the breach */}
      {t >= S("f1") &&
        Array.from({ length: 26 }).map((_, i) => {
          const r = rng(40 + i);
          const age = (t * 1.5 + i / 26) % 1;
          const fade = 1 - clamp((t - E("f2")) / 1.5);
          return <circle key={i} cx={BREACH[0] + (r() - 0.5) * 60 + age * (r() - 0.5) * 120} cy={BREACH[1] + age * 110} r={8 + r() * 8} fill="#7fc0f0" opacity={(1 - age) * 0.9 * fade} />;
        })}
      {/* crew 1 runs for the exit */}
      {Array.from({ length: 9 }).map((_, i) => {
        const u = prog(t, S("f1") + 0.4 + i * 0.1, E("f2") + 1.0 + i * 0.1, lin);
        const { x, y } = flee(u, 160 + i * 36);
        const vanish = 1 - clamp((u - 0.92) / 0.08);
        return <Person key={i} x={x} y={y} t={t} phase={i} pose={u > 0 && u < 1 ? "walk" : "stand"} suit={i % 2 ? "#f0892a" : "#2f6fb2"} helmet="#f5c518" scale={1.15} facing={-1} opacity={vanish} />;
      })}
      {/* crew 2 climbs onto the bench */}
      {Array.from({ length: 9 }).map((_, i) => {
        const bx = 650 + i * 34;
        return <Person key={i} x={lerp(620 + i * 36, bx, settle)} y={lerp(FLOOR, BENCH_Y, settle)} t={t} phase={i * 0.8} pose={settle > 0.95 ? "sit" : "stand"} suit={i % 2 ? "#f0892a" : "#2f6fb2"} helmet="#f2f2f2" scale={1.15} facing={i % 2 ? 1 : -1} />;
      })}
      <Label x={300} y={GROUND_TOP + 110} text={L.escaped} size={32} bg="#2f9e5b" fg="#fff" opacity={pop(t, S("f2") + 0.2)} />
      <Label x={790} y={ALC_CEIL - 40} text={L.trapped} size={32} bg="#d8372b" fg="#fff" opacity={pop(t, S("f3") + 0.2)} />
    </g>
  );
};

// ---- 4. Drilling and air ---------------------------------------------------------------------------------------------------
export const Drill: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const pipeY = lerp(GROUND_TOP, ALC_CEIL + 6, prog(t, S("d3") + 0.3, E("d4") + 0.3, lin));
  const airOn = t >= S("d5");
  const map = pop(t, S("d2")) * (1 - clamp((t - E("d2") - 1.2) / 0.5));
  const bracket = pop(t, S("w1"));
  return (
    <g>
      <Backdrop uid="dr" t={t} />
      <Mine uid="dr" t={t} waterL={X0} waterR={WATER_END} level={1} alcove={0} wet={1} />
      <Crew x={650} y={BENCH_Y} step={34} t={t} crew="b" pose="sit" />
      {/* surface crew */}
      <g transform={`translate(0 ${GROUND_TOP})`}>
        <Car x={520} />
      </g>
      {[640, 676, 712].map((x, i) => (
        <Person key={x} x={x} y={GROUND_TOP} t={t} phase={i} suit="#2b3340" suitStyle="vest" helmet="#e8c51b" scale={0.9} lamp={false} facing={-1} />
      ))}
      <g opacity={pop(t, S("d1"))}>
        <SurfaceRig x={RIG_X} t={t} active={t >= S("d3")} />
      </g>
      <Pipe x={RIG_X} y0={GROUND_TOP} y1={pipeY} />
      {/* air compressor and hose */}
      {airOn && (
        <g>
          <rect x={870} y={GROUND_TOP - 46} width={86} height={46} rx={6} fill="#2f6fb2" />
          <text x={913} y={GROUND_TOP - 16} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22} fill="#fff">
            {L.air}
          </text>
          <path d={`M870 ${GROUND_TOP - 20} Q830 ${GROUND_TOP - 60} ${RIG_X + 6} ${GROUND_TOP - 8}`} fill="none" stroke="#2a3340" strokeWidth={7} />
          {Array.from({ length: 5 }).map((_, i) => {
            const y = GROUND_TOP + 20 + ((t * 120 + i * 88) % (ALC_CEIL - GROUND_TOP - 20));
            return <path key={i} d={`M${RIG_X - 14} ${y} L${RIG_X} ${y + 16} L${RIG_X + 14} ${y} Z`} fill="#7fd4ff" opacity={0.9} />;
          })}
        </g>
      )}
      {/* the old map */}
      {map > 0 && (
        <g transform={`translate(190 720) scale(${0.7 + 0.3 * map})`} opacity={map}>
          <rect x={-120} y={-86} width={240} height={172} rx={8} fill="#f1e6c8" stroke="#b79a5b" strokeWidth={5} />
          <path d="M-90 -40 H-20 V20 H60 M-90 30 H-40 M20 -60 V-10 H80" fill="none" stroke="#7a6a45" strokeWidth={5} />
          <path d="M44 24 L74 54 M74 24 L44 54" stroke="#d8372b" strokeWidth={9} strokeLinecap="round" />
          <text x={0} y={-100} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={24} fill="#fff" stroke="#05070f" strokeWidth={6} paintOrder="stroke">
            {L.map}
          </text>
        </g>
      )}
      {bracket > 0 && (
        <g opacity={bracket}>
          <line x1={WATER_END} x2={650} y1={ALC_CEIL + 90} y2={ALC_CEIL + 90} stroke="#f2b705" strokeWidth={6} />
          <line x1={WATER_END} x2={WATER_END} y1={ALC_CEIL + 75} y2={ALC_CEIL + 105} stroke="#f2b705" strokeWidth={6} />
          <line x1={650} x2={650} y1={ALC_CEIL + 75} y2={ALC_CEIL + 105} stroke="#f2b705" strokeWidth={6} />
          <Label x={595} y={ALC_CEIL + 40} text={L.within} size={32} />
        </g>
      )}
    </g>
  );
};

// ---- 5. Taps on the pipe (close-up) ----------------------------------------------------------------------------------------------------
const Hammer: React.FC<{ x: number; y: number; swing: number }> = ({ x, y, swing }) => (
  <g transform={`translate(${x} ${y}) rotate(${-50 + swing * 60})`}>
    <rect x={-6} y={0} width={12} height={110} rx={5} fill="#8a5a2e" />
    <rect x={-34} y={-22} width={68} height={32} rx={6} fill="#6c7480" />
  </g>
);

export const Taps: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const tap = (t0: number, n: number, gap: number) => Array.from({ length: n }).map((_, k) => t0 + k * gap);
  const top = tap(S("p1") + 0.5, 3, 0.45);
  const bangs = tap(S("p2") + 0.35, 3, 0.55);
  const nine = tap(S("p3") + 1.0, 9, 0.33);
  const lit = nine.filter((x) => t >= x).length;
  const ring = (t0: number, up: boolean, key: string, color: string) => {
    const age = t - t0;
    if (age < 0 || age > 0.9) return null;
    const y = up ? 1000 - age * 520 : 470 + age * 520;
    return <ellipse key={key} cx={540} cy={y} rx={30 + age * 30} ry={10 + age * 8} fill="none" stroke={color} strokeWidth={5} opacity={1 - age / 0.9} />;
  };
  const hit = (arr: number[]) => arr.some((x) => t >= x && t < x + 0.16);
  const swingTop = hit(top) || hit(nine) ? 1 : 0;
  return (
    <g>
      <rect x={-1500} y={-1200} width={4200} height={4400} fill="#2a2018" />
      <rect x={-1500} y={820} width={4200} height={420} fill="#11141a" />
      {/* the air pocket */}
      <path d="M130 1130 L130 900 Q540 760 950 900 L950 1130 Z" fill="#0b0c0f" stroke="#1d2026" strokeWidth={14} />
      <rect x={130} y={1130} width={820} height={140} fill="#3d8fd1" opacity={0.85} />
      <rect x={130} y={1130} width={820} height={8} fill="#7fc0f0" />
      {/* pipe from the surface */}
      <rect x={532} y={330} width={16} height={560} fill="#b9c0ca" />
      <rect x={535} y={330} width={4} height={560} fill="#e8edf3" />
      <rect x={520} y={880} width={40} height={14} fill="#8d95a0" />
      <Crew x={235} y={1120} step={72} t={t} crew="b" pose="sit" scale={1.45} />
      <Hammer x={640} y={350} swing={swingTop} />
      {top.map((x, k) => ring(x, false, `a${k}`, "#f2b705"))}
      {bangs.map((x, k) => ring(x, true, `b${k}`, "#ff6b4a"))}
      {nine.map((x, k) => ring(x, true, `c${k}`, "#f2b705"))}
      {bangs.map((x, k) => (t >= x && t < x + 0.7 ? <Label key={k} x={700 + k * 60} y={990 - k * 40} text={L.bang} size={34} bg="#ff6b4a" fg="#fff" opacity={1 - (t - x) / 0.7} /> : null))}
      <Dots x={540} y={392} n={9} lit={lit} r={19} gap={60} />
    </g>
  );
};

// ---- 6. Setback: the bit breaks -------------------------------------------------------------------------------------------------------------
export const Setback: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const broke = pop(t, S("b2") + 0.9, 0.3);
  const second = prog(t, S("b3") + 0.3, E("b4"), lin);
  const lift = prog(t, S("b3") + 0.8, S("b4") + 1.2, easeInOut);
  const resumed = t >= S("b4") + 1.2;
  return (
    <g>
      <Backdrop uid="sb" t={t} />
      <Mine uid="sb" t={t} waterL={X0} waterR={WATER_END} level={1} alcove={0} wet={1} />
      <Crew x={650} y={BENCH_Y} step={34} t={t} crew="b" pose="sit" />
      <SurfaceRig x={290} t={t} active={t < S("b2") + 1 || resumed} s={0.75} />
      <SurfaceRig x={720} t={t} active={t >= S("b3") + 0.3} s={0.75} />
      {/* first hole and its broken bit */}
      <line x1={290} x2={290} y1={GROUND_TOP} y2={lerp(900, GROUND_TOP + 10, lift)} stroke="#b9c0ca" strokeWidth={6} opacity={t >= S("b2") + 0.9 ? 0.0 : 1} />
      <line x1={290} x2={290} y1={GROUND_TOP} y2={880} stroke="#b9c0ca" strokeWidth={6} opacity={t < S("b2") + 0.9 ? 1 : 0.25} />
      <g transform={`translate(290 ${lerp(880, GROUND_TOP + 8, lift)})`} opacity={broke}>
        <path d="M-26 -10 L26 -10 L18 28 L-18 28 Z" fill="#ff9d2e" stroke="#7a3a00" strokeWidth={3} />
        <path d="M-30 -14 L-8 -2 L-22 8 L-4 14" fill="none" stroke="#fff" strokeWidth={5} />
      </g>
      {t >= S("b2") + 0.9 && t < S("b3") + 0.8 && (
        <g opacity={broke}>
          <path d="M250 840 L330 920 M330 840 L250 920" stroke="#e5352b" strokeWidth={14} strokeLinecap="round" />
          <Label x={290} y={800} text={L.broke} size={32} bg="#e5352b" fg="#fff" />
        </g>
      )}
      {/* second hole */}
      <line x1={720} x2={720} y1={GROUND_TOP} y2={lerp(GROUND_TOP, 960, second)} stroke="#b9c0ca" strokeWidth={6} />
      {/* clock */}
      <g transform="translate(900 660)" opacity={pop(t, S("b3"))}>
        <circle r={58} fill="#f3f4f6" stroke="#2a3340" strokeWidth={8} />
        <line x1={0} y1={0} x2={0} y2={-42} stroke="#1b2230" strokeWidth={5} strokeLinecap="round" transform={`rotate(${(t - S("b3")) * 90})`} />
        <line x1={0} y1={0} x2={28} y2={0} stroke="#1b2230" strokeWidth={8} strokeLinecap="round" transform={`rotate(${(t - S("b3")) * 8})`} />
        <circle r={6} fill="#1b2230" />
      </g>
    </g>
  );
};

// ---- 7. The bigger drill breaks through -----------------------------------------------------------------------------------------------------------
export const Super: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const down = prog(t, S("g1") - 0.2, S("g1") + 1.4, lin);
  const brk = t - (S("g1") + 1.4);
  const wide = pop(t, S("g2"));
  const cheer = t >= S("g3");
  return (
    <g>
      <Backdrop uid="su" t={t} />
      <Mine uid="su" t={t} waterL={X0} waterR={WATER_END} level={1} alcove={0} wet={1} />
      <SurfaceRig x={RIG_X} t={t} active={t < S("g1") + 1.6} s={0.9} />
      <rect x={RIG_X - 18} y={GROUND_TOP} width={36} height={lerp(0, ALC_CEIL - GROUND_TOP, down)} fill="#0b0c0f" opacity={0.0} />
      <line x1={RIG_X} x2={RIG_X} y1={GROUND_TOP} y2={lerp(GROUND_TOP, ALC_CEIL + 4, down)} stroke="#c9d0da" strokeWidth={26} />
      <path d={`M${RIG_X - 24} ${lerp(GROUND_TOP, ALC_CEIL + 4, down)} L${RIG_X + 24} ${lerp(GROUND_TOP, ALC_CEIL + 4, down)} L${RIG_X} ${lerp(GROUND_TOP, ALC_CEIL + 4, down) + 40} Z`} fill="#ff9d2e" />
      {brk > 0 && brk < 1.2 && (
        <g>
          <circle cx={RIG_X} cy={ALC_CEIL + 10} r={Math.min(150, brk * 320)} fill="#ffe08a" opacity={Math.max(0, 0.8 - brk * 0.9)} />
          {Array.from({ length: 12 }).map((_, i) => {
            const r = rng(90 + i);
            return <rect key={i} x={RIG_X + (r() - 0.5) * 160 * brk} y={ALC_CEIL + 20 + brk * 140 * r()} width={8} height={8} fill="#6b5a46" />;
          })}
        </g>
      )}
      <Crew x={650} y={BENCH_Y} step={34} t={t} crew="b" pose={cheer ? "cheer" : "sit"} />
      {wide > 0 && (
        <g opacity={wide}>
          <line x1={RIG_X - 13} x2={RIG_X + 13} y1={GROUND_TOP + 80} y2={GROUND_TOP + 80} stroke="#f2b705" strokeWidth={5} />
          <Label x={RIG_X + 120} y={GROUND_TOP + 130} text={L.inches24} size={40} />
        </g>
      )}
      {cheer && <Label x={790} y={ALC_CEIL - 40} text={L.alive} size={40} bg="#2f9e5b" fg="#fff" opacity={pop(t, S("g3"))} />}
    </g>
  );
};

// ---- 8. The cage ---------------------------------------------------------------------------------------------------------------------------------------------
export const Rescue: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const period = (E("r3") - S("r2") - 0.6) / 9;
  const k = (t - S("r2")) / period;
  const count = t >= S("r2") ? Math.min(9, Math.floor(k) + 1) : 0;
  const ph = k - Math.floor(k);
  const hoisting = t >= S("r2") && k < 9;
  const upY = lerp(BENCH_Y - 30, GROUND_TOP - 6, easeInOut(clamp(ph / 0.62)));
  const dnY = lerp(GROUND_TOP - 6, BENCH_Y - 30, easeInOut(clamp((ph - 0.62) / 0.38)));
  const goingUp = ph < 0.62;
  const cageY = t < S("r2") ? lerp(GROUND_TOP, BENCH_Y - 30, prog(t, S("r1"), E("r1"), easeInOut)) : hoisting ? (goingUp ? upY : dnY) : GROUND_TOP - 6;
  const done = t >= E("r3");
  const hours = prog(t, S("r4"), E("r4") + 0.5, lin);
  return (
    <g>
      <Backdrop uid="rs" t={t} />
      <Mine uid="rs" t={t} waterL={X0} waterR={WATER_END} level={1} alcove={0} wet={1} />
      <SurfaceRig x={RIG_X} t={t} active={false} s={0.9} />
      <rect x={RIG_X - 14} y={GROUND_TOP} width={28} height={ALC_CEIL - GROUND_TOP + 6} fill="#0b0c0f" />
      <line x1={RIG_X} x2={RIG_X} y1={GROUND_TOP - 120} y2={cageY} stroke="#9aa3ae" strokeWidth={3} />
      <Crew x={650} y={BENCH_Y} step={34} t={t} crew="b" pose="sit" n={9 - Math.min(9, count)} opacity={1} />
      {/* the cage */}
      <g transform={`translate(${RIG_X} ${cageY})`}>
        <rect x={-14} y={0} width={28} height={40} rx={5} fill="#c9d0da" stroke="#5c646e" strokeWidth={3} />
        {goingUp && hoisting && <Person x={0} y={38} t={t} pose="stand" suit="#f0892a" helmet="#f2f2f2" scale={0.55} lamp={false} />}
      </g>
      {/* rescued miners waiting at the surface */}
      {t < S("r5") ? (
        <Crew x={860} y={GROUND_TOP} step={14} t={t} crew="b" pose="stand" scale={0.75} n={Math.min(9, Math.max(0, count - (hoisting && goingUp ? 1 : 0)))} />
      ) : (
        <g transform={`translate(0 ${(1 - pop(t, S("r5"))) * 30})`} opacity={pop(t, S("r5"))}>
          <Crew x={300} y={GROUND_TOP + 4} step={56} t={t} crew="b" pose="cheer" scale={1.7} />
        </g>
      )}
      <Dots x={540} y={392} n={9} lit={count - (hoisting && goingUp ? 1 : 0)} />
      <Label x={780} y={ALC_CEIL - 40} text={L.cage22} size={28} opacity={pop(t, S("r1")) * (1 - clamp((t - S("r2")) / 0.5))} />
      {t >= S("r4") && (
        <g opacity={pop(t, S("r4"))}>
          <rect x={120} y={FLOOR + 70} width={840} height={26} rx={13} fill="#0b101a" stroke="#3a4558" strokeWidth={4} />
          <rect x={124} y={FLOOR + 74} width={Math.max(0, 832 * hours)} height={18} rx={9} fill="#f2b705" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={124 + i * 208} x2={124 + i * 208} y1={FLOOR + 60} y2={FLOOR + 106} stroke="#fff" strokeWidth={3} opacity={0.7} />
          ))}
        </g>
      )}
      {t >= S("r5") && <Label x={540} y={GROUND_TOP + 170} text={L.survived} size={52} bg="#2f9e5b" fg="#fff" opacity={pop(t, S("r5"))} />}
    </g>
  );
};

// ---- 9. Recap ---------------------------------------------------------------------------------------------------------------------------------------------------------
export const Recap: React.FC<P> = ({ t }) => {
  const { S } = useTL();
  const L = useL();
  const cards = [
    { x: 190, text: L.recapFlood, at: S("r6") },
    { x: 540, text: L.recapHole, at: S("r6") + 0.9 },
    { x: 890, text: L.recapTaps, at: S("r6") + 1.8 },
  ];
  return (
    <g>
      <rect x={-1500} y={-1200} width={4200} height={4400} fill="#0d1520" />
      {cards.map((c, i) => {
        const a = pop(t, c.at);
        return (
          <g key={i} transform={`translate(${c.x} ${760 + (1 - a) * 40})`} opacity={a}>
            <rect x={-150} y={-230} width={300} height={400} rx={30} fill="#16233a" stroke="#2f4568" strokeWidth={5} />
            {i === 0 && (
              <g>
                <rect x={-110} y={-40} width={220} height={90} fill="#0b0c0f" />
                <path d="M-110 10 Q-80 -10 -55 10 T0 10 T55 10 T110 10 V50 H-110 Z" fill="#3d8fd1" />
              </g>
            )}
            {i === 1 && (
              <g>
                <rect x={-12} y={-150} width={24} height={230} fill="#b9c0ca" />
                <path d="M-18 80 L18 80 L0 120 Z" fill="#ff9d2e" />
              </g>
            )}
            {i === 2 && <Dots x={0} y={-10} n={3} lit={3} r={18} gap={50} />}
            <text y={140} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill="#fff" letterSpacing={2}>
              {c.text}
            </text>
          </g>
        );
      })}
    </g>
  );
};
