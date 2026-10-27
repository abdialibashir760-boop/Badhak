import React from "react";
import { clamp, easeOut, lerp, prog, rng } from "../common/math";
import { Astro, Bar, Earth, Fade, Label, Moon, Plume, Space, Stack } from "./art";
import { Tx, useL } from "./i18n";
import { useTL } from "./time";

const font = "Inter, 'Helvetica Neue', Arial, sans-serif";
type P = { t: number };
const lin = (v: number) => clamp(v);

// ---- 1. The bang (hook) -------------------------------------------------------------------
export const Bang: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const bang = E("h1") - 0.5;
  const after = t >= bang;
  const dt = Math.max(0, t - bang);
  const jolt = dt < 0.5 ? Math.sin(t * 90) * 12 * (1 - dt / 0.5) : 0;
  const rot = after ? -18 + dt * 6 : -18 + Math.sin(t * 1.3) * 2;
  const cx = 520 + jolt;
  const cy = 800 + Math.sin(t * 0.9) * 6;
  const ring = prog(t, S("h3") + 0.1, S("h3") + 0.8, easeOut);
  const arrow = prog(t, S("h4"), S("h4") + 1.0, easeOut);
  return (
    <g>
      <Space t={t} />
      <Earth x={850} y={1150} r={330} t={t} uid="bg" />
      <Moon x={170} y={470} r={85} uid="bm" />
      {t >= S("h3") && (
        <g transform="translate(170 470)" opacity={ring}>
          <circle r={118} fill="none" stroke="#f2b705" strokeWidth={5} strokeDasharray="14 12" transform={`rotate(${t * 20})`} />
          <line x1={-86} y1={-86} x2={86} y2={86} stroke="#e5352b" strokeWidth={14} strokeLinecap="round" />
          <line x1={86} y1={-86} x2={-86} y2={86} stroke="#e5352b" strokeWidth={14} strokeLinecap="round" />
        </g>
      )}
      <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(1.3)`}>
        <Stack x={0} y={0} />
        {after && <Plume x={-62} y={95} dx={-340} dy={-60} t={t} n={34} size={16} spread={90} speed={0.7} />}
        {after && dt < 0.4 && <circle cx={-60} cy={95} r={70 * (1 - dt / 0.4)} fill="#fff" opacity={0.9} />}
      </g>
      {t >= S("h4") && (
        <g opacity={arrow}>
          <path d="M560 930 Q650 1010 740 1030" fill="none" stroke="#7cc4ff" strokeWidth={7} strokeDasharray="16 14" strokeDashoffset={-t * 40} strokeLinecap="round" />
          <Label x={820} y={805} text={L.home} size={40} bg="#7cc4ff" />
        </g>
      )}
    </g>
  );
};

// ---- 2. Launch ---------------------------------------------------------------------------------------
const Rocket: React.FC<{ x: number; y: number; t: number; fire: number }> = ({ x, y, t, fire }) => (
  <g transform={`translate(${x} ${y})`}>
    {/* y = base of the first stage; rocket extends upward */}
    {[-1, 1].map((d) => (
      <path key={d} d={`M${d * 52} -20 L${d * 92} 0 L${d * 52} 0 Z`} fill="#20242b" />
    ))}
    <rect x={-52} y={-320} width={104} height={320} fill="#f3f4f6" />
    <rect x={-52} y={-320} width={52} height={320} fill="#20242b" opacity={0.0} />
    <rect x={-52} y={-250} width={26} height={250} fill="#1c2027" />
    <rect x={26} y={-250} width={26} height={250} fill="#1c2027" opacity={0.0} />
    <text transform="rotate(-90)" x={150} y={8} fontFamily={font} fontWeight={900} fontSize={30} fill="#1c2027" letterSpacing={4}>
      UNITED STATES
    </text>
    <rect x={-46} y={-330} width={92} height={14} fill="#b9bec7" />
    <rect x={-46} y={-520} width={92} height={190} fill="#f3f4f6" />
    <rect x={-46} y={-430} width={92} height={22} fill="#1c2027" />
    <rect x={-38} y={-620} width={76} height={100} fill="#f3f4f6" />
    <rect x={-38} y={-640} width={76} height={20} fill="#1c2027" />
    <path d="M-38 -640 L-30 -690 L30 -690 L38 -640 Z" fill="#e9ecf0" />
    <path d="M-30 -690 L0 -740 L30 -690 Z" fill="#cfd4db" />
    <line x1={0} y1={-740} x2={0} y2={-860} stroke="#2a2d33" strokeWidth={6} />
    <path d="M-10 -860 L0 -900 L10 -860 Z" fill="#e5352b" />
    {fire > 0 && (
      <g>
        <path d={`M-60 0 L60 0 L${24 + Math.sin(t * 40) * 8} ${240 * fire} L0 ${300 * fire} L${-24 - Math.sin(t * 37) * 8} ${240 * fire} Z`} fill="#ffb347" />
        <path d={`M-34 0 L34 0 L0 ${190 * fire} Z`} fill="#fff3b0" />
      </g>
    )}
  </g>
);

export const Launch: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const lift = Math.pow(prog(t, S("s2") + 0.9, S("s3") + 3.2, lin), 2.2) * 2100;
  const fire = prog(t, S("s2") + 0.3, S("s2") + 1.1, easeOut);
  const smoke = prog(t, S("s2") + 0.4, S("s3") + 4, lin);
  const cards = [
    { l: "APOLLO 11", ok: true },
    { l: "APOLLO 12", ok: true },
    { l: "APOLLO 13", ok: false },
  ];
  return (
    <g>
      <defs>
        <linearGradient id="lsky" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={1920}>
          <stop offset="0" stopColor="#1f2c5c" />
          <stop offset="0.7" stopColor="#c9708a" />
          <stop offset="1" stopColor="#f4b57a" />
        </linearGradient>
      </defs>
      <rect x={-1500} y={-1200} width={4200} height={4400} fill="url(#lsky)" />
      <rect x={-1500} y={1180} width={4200} height={1600} fill="#27332a" />
      <rect x={270} y={1180} width={540} height={34} fill="#7b8088" />
      {/* umbilical tower */}
      <g transform="translate(380 1180)">
        <rect x={-18} y={-640} width={36} height={640} fill="#6d737c" />
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M-18 ${-i * 46} L18 ${-i * 46 - 46}`} stroke="#4d535c" strokeWidth={3} />
        ))}
        <rect x={0} y={-560} width={58} height={10} fill="#6d737c" />
      </g>
      <Rocket x={540} y={1180 - lift} t={t} fire={fire} />
      {smoke > 0 &&
        Array.from({ length: 14 }).map((_, i) => {
          const r = rng(300 + i);
          const side = i % 2 ? 1 : -1;
          const k = clamp(smoke * 1.6 - r() * 0.4);
          return <circle key={i} cx={540 + side * (60 + k * (180 + r() * 220))} cy={1170 - r() * 40 - k * 20} r={30 + k * (90 + r() * 70)} fill="#f2f0ec" opacity={(1 - k) * 0.85 * clamp(k * 6)} />;
        })}
      {t >= S("s3") &&
        cards.map((c, i) => {
          const a = easeOut((t - S("s3") - 0.2 - i * 0.55) / 0.5);
          return (
            <g key={i} transform={`translate(${200 + i * 340} ${620 + (1 - a) * 40})`} opacity={a}>
              <circle r={104} fill={c.ok ? "#2f7d4f" : "#e0a21b"} stroke="#fff" strokeWidth={6} />
              <Moon x={0} y={-8} r={52} uid={`lc${i}`} />
              <text y={92} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill="#fff" transform="translate(0 40)" stroke="#0b0f18" strokeWidth={6} paintOrder="stroke">
                {c.l}
              </text>
              <text y={0} x={72} fontFamily={font} fontWeight={900} fontSize={64} fill="#fff" stroke="#0b0f18" strokeWidth={8} paintOrder="stroke" textAnchor="middle" transform="translate(0 -62)">
                {c.ok ? "✓" : "?"}
              </text>
            </g>
          );
        })}
    </g>
  );
};

// ---- 3. Crew ------------------------------------------------------------------------------------------------
export const Crew: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const crew = [
    { name: "LOVELL", role: [L.commander, ""], x: 270, hair: "#6b5a4a", skin: "#e5b48f", at: S("s4") },
    { name: "HAISE", role: [L.lmPilotA, L.pilot], x: 540, hair: "#2e2218", skin: "#d9a37a", at: S("s4") + 0.5 },
    { name: "SWIGERT", role: [L.cmPilotA, L.pilot], x: 810, hair: "#3b2b20", skin: "#f0c9a6", at: S("s4") + 1.0 },
  ];
  const focus = prog(t, S("s5"), S("s5") + 0.5, lin);
  const ghost = prog(t, S("s6") + 0.4, S("s6") + 1.2, easeOut);
  return (
    <g>
      <Space t={t} top="#0a1330" bottom="#1d2b57" stars={0.7} />
      <Moon x={540} y={560} r={250} uid="cm" />
      <rect x={-1500} y={-1200} width={4200} height={4400} fill="#050a1c" opacity={0.55} />
      {crew.map((c, i) => {
        const a = easeOut((t - c.at) / 0.5);
        const dim = i === 2 ? 1 : 1 - 0.5 * focus;
        const glow = i === 2 ? focus : 0;
        return (
          <g key={c.name} opacity={a * dim}>
            {glow > 0 && <ellipse cx={c.x} cy={900} rx={150} ry={420} fill="#f2b705" opacity={0.18 * glow} />}
            <Astro x={c.x} y={1050 + (1 - a) * 60} s={1.75} hair={c.hair} skin={c.skin} t={t} />
            <text x={c.x} y={1112} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill="#fff" letterSpacing={3}>
              {c.name}
            </text>
            {c.role.map((line, k) => (
              <text key={k} x={c.x} y={1146 + k * 24} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={20} fill="#9fb0cf" letterSpacing={2}>
                {line}
              </text>
            ))}
          </g>
        );
      })}
      {t >= S("s5") && <Label x={810} y={470} text={L.lateReplacement} size={30} opacity={focus} />}
      {t >= S("s6") && (
        <g opacity={ghost}>
          <Astro x={130} y={600} s={0.9} gray t={t} opacity={0.75} />
          <circle cx={130} cy={505} r={92} fill="none" stroke="#e5352b" strokeWidth={10} />
          <line x1={64} y1={439} x2={196} y2={571} stroke="#e5352b" strokeWidth={10} />
          <Label x={130} y={680} text="MATTINGLY" size={28} bg="#9fb0cf" />
          <Label x={130} y={730} text={L.grounded} size={24} bg="#e5352b" fg="#fff" />
        </g>
      )}
    </g>
  );
};

// ---- 4. Cruise -----------------------------------------------------------------------------------------------------
export const Cruise: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const k = prog(t, S("s7"), E("s7") + 0.5, lin);
  const px = lerp(330, 780, k);
  const py = lerp(980, 520, k);
  const tick = prog(t, S("s7") + 0.8, S("s7") + 1.3, easeOut);
  return (
    <g>
      <Space t={t} />
      <Earth x={240} y={1160} r={190} t={t} uid="cr" />
      <Moon x={880} y={430} r={68} uid="crm" />
      <path d="M330 1000 Q560 760 800 500" fill="none" stroke="#7cc4ff" strokeWidth={4} strokeDasharray="12 14" opacity={0.7} />
      <Stack x={px} y={py} s={0.42} rot={42} />
      <g opacity={tick} transform="translate(540 330)">
        <rect x={-290} y={-40} width={580} height={86} rx={20} fill="#1f7a4d" />
        <text x={0} y={20} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill="#fff" letterSpacing={2}>
          ✓ {L.allSystems}
        </text>
      </g>
    </g>
  );
};

// ---- 5. The tank explodes --------------------------------------------------------------------------------------------
export const Tank: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const spark = t >= S("e1") + 3.0 && t < S("e2") ? Math.sin(t * 40) > 0 : false;
  const boom = S("e2") + 0.1;
  const dt = Math.max(0, t - boom);
  const hole = t >= boom;
  const shakeAmt = dt < 1.4 ? 16 * (1 - dt / 1.4) : 0;
  const sx = Math.sin(t * 70) * shakeAmt;
  const sy = Math.cos(t * 63) * shakeAmt;
  const wire = (y: number) => <path d={`M470 ${y} Q560 ${y - 40} 640 ${y - 70}`} fill="none" stroke="#e08a2c" strokeWidth={8} strokeLinecap="round" />;
  return (
    <g>
      <rect x={-1500} y={-1200} width={4200} height={4400} fill="#090d15" />
      <g transform={`translate(${sx} ${sy})`}>
        <rect x={170} y={290} width={740} height={960} rx={26} fill="#cfd4db" />
        <rect x={196} y={316} width={688} height={908} rx={14} fill="#161c2a" />
        {/* hydrogen tanks */}
        {[360, 700].map((x) => (
          <g key={x}>
            <circle cx={x} cy={900} r={90} fill="#7ba89a" />
            <text x={x} y={912} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill="#173c33">
              H₂
            </text>
          </g>
        ))}
        {/* fuel cells */}
        {[270, 440, 610].map((x) => (
          <rect key={x} x={x} y={1050} width={150} height={120} rx={12} fill="#d6a63a" />
        ))}
        <text x={540} y={1200} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={24} fill="#f1d58a" letterSpacing={3}>
          {L.fuelCells}
        </text>
        {/* oxygen tanks */}
        <circle cx={360} cy={600} r={104} fill="#aab6c8" />
        <text x={360} y={616} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={52} fill="#2a3a55">
          O₂
        </text>
        {!hole && (
          <g>
            <circle cx={700} cy={600} r={104} fill="#c6d0e0" stroke={spark ? "#ffe26a" : "none"} strokeWidth={6} />
            <text x={700} y={616} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={52} fill="#2a3a55">
              O₂
            </text>
            {wire(780)}
            <path d="M470 780 L470 1050" stroke="#e08a2c" strokeWidth={8} />
            {spark && (
              <g transform="translate(640 710)">
                <path d="M0 -30 L8 -8 L30 0 L8 8 L0 30 L-8 8 L-30 0 L-8 -8 Z" fill="#fff3a0" />
                <circle r={36} fill="#ffe26a" opacity={0.45} />
              </g>
            )}
            <Label x={700} y={430} text={L.oxygenTank2} size={28} opacity={clamp((t - S("e1") - 0.3) / 0.4)} />
          </g>
        )}
        {hole && (
          <g>
            {/* blast */}
            <circle cx={700} cy={600} r={Math.min(330, dt * 700)} fill="#ff9d2e" opacity={Math.max(0, 0.75 - dt * 1.3)} />
            <circle cx={700} cy={600} r={Math.min(220, dt * 500)} fill="#fff1a8" opacity={Math.max(0, 0.95 - dt * 2.2)} />
            <circle cx={700} cy={600} r={Math.min(640, dt * 1200)} fill="none" stroke="#fff" strokeWidth={8} opacity={Math.max(0, 0.8 - dt * 1.4)} />
            <path d="M600 540 L660 520 L690 590 L650 660 L600 640 Z" fill="#6d7686" />
            <path d="M910 420 L866 470 L900 520 L868 570 L910 620 Z" fill="#161c2a" />
          </g>
        )}
        {/* the panel that blows off */}
        <g transform={`translate(${hole ? dt * 700 : 0} ${hole ? -dt * 260 : 0}) rotate(${hole ? dt * 340 : 0} 880 480)`}>
          <rect x={860} y={320} width={50} height={300} rx={6} fill="#cfd4db" opacity={hole ? Math.max(0, 1 - dt * 0.8) : 1} />
        </g>
        {/* leak */}
        {t >= S("e3") && <Plume x={890} y={520} dx={420} dy={-120} t={t} n={34} size={22} spread={140} speed={0.75} />}
      </g>
    </g>
  );
};

// ---- 6. Alarm in the cockpit ---------------------------------------------------------------------------------
const PANEL = (() => {
  const r = rng(12);
  return Array.from({ length: 60 }).map((_, i) => ({ x: 70 + (i % 20) * 49, y: 960 + Math.floor(i / 20) * 50, c: ["#3be28b", "#f2b705", "#7cc4ff", "#8a93a3"][Math.floor(r() * 4)], ph: r() * 6 }));
})();

export const Alarm: React.FC<P> = ({ t }) => {
  const { S, E } = useTL();
  const L = useL();
  const blink = Math.sin(t * 15) > 0;
  const drain = prog(t, S("e5"), E("e5") + 0.5, lin);
  const power = lerp(0.88, 0.1, drain);
  const oxy = lerp(0.8, 0.06, drain);
  const arcs = [0, 1, 2].map((i) => ((t * 0.9 + i / 3) % 1));
  return (
    <g>
      <rect x={-1500} y={-1200} width={4200} height={4400} fill="#0b1019" />
      {/* window */}
      <path d="M90 330 L990 330 L930 700 L150 700 Z" fill="#030611" stroke="#38445c" strokeWidth={14} />
      <Earth x={800} y={470} r={74} t={t} uid="al" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={220 + i * 90} cy={400 + (i % 3) * 60} r={2.4} fill="#fff" opacity={0.7} />
      ))}
      {/* crew */}
      <Astro x={260} y={870} s={1.1} t={t} hair="#6b5a4a" pose="bust" />
      <Astro x={540} y={870} s={1.1} t={t} hair="#2e2218" skin="#d9a37a" pose="bust" />
      <Astro x={820} y={870} s={1.1} t={t} skin="#f0c9a6" pose="bust" />
      {/* instrument panel */}
      <path d="M-1500 780 L2600 780 L2600 1280 L-1500 1280 Z" fill="#1a2130" />
      <rect x={-1500} y={770} width={4200} height={16} fill="#2c3750" />
      {PANEL.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y + 80} r={9} fill={p.c} opacity={0.35 + 0.5 * Math.abs(Math.sin(t * 2 + p.ph))} />
      ))}
      {/* master alarm */}
      <g transform="translate(540 868)">
        <circle r={62} fill={blink ? "#ff3b30" : "#5b1612"} />
        {blink && <circle r={104} fill="#ff3b30" opacity={0.28} />}
        <text y={14} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill="#fff">
          ALARM
        </text>
      </g>
      <Bar x={90} y={1090} w={380} h={46} v={power} label={L.power} color={power < 0.35 ? "#ff3b30" : "#3be28b"} />
      <Bar x={610} y={1090} w={380} h={46} v={oxy} label={L.oxygen} color={oxy < 0.35 ? "#ff3b30" : "#3be28b"} />
      {/* radio arcs toward Earth */}
      {t < E("e4") + 0.5 &&
        arcs.map((a, i) => (
          <circle key={i} cx={540} cy={600} r={40 + a * 330} fill="none" stroke="#7cc4ff" strokeWidth={5} opacity={(1 - a) * 0.6} />
        ))}
    </g>
  );
};
