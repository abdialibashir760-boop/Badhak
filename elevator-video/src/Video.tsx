import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS, SCENE_BOUNDS, WORDS } from "./timing";

// ---------------------------------------------------------------- palette
const C = {
  cream: "#faf5e9",
  creamDark: "#efe6cf",
  forest: "#2f5d3a",
  forestDark: "#1f3f27",
  clay: "#c8643c",
  gold: "#e0a93b",
  sea: "#3f7fa6",
  ink: "#1d2a21",
  shaft: "#463d36",
  rail: "#9a9a9a",
  steel: "#2b2b2f",
  red: "#d6443a",
};
const FONT = "Ubuntu, 'Trebuchet MS', 'DejaVu Sans', Verdana, sans-serif";

// ---------------------------------------------------------------- helpers
const ease = Easing.inOut(Easing.cubic);
const seg = (t: number, a: number, b: number, v0 = 0, v1 = 1) =>
  interpolate(t, [a, b], [v0, v1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
const lin = (t: number, a: number, b: number, v0 = 0, v1 = 1) =>
  interpolate(t, [a, b], [v0, v1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// ---------------------------------------------------------------- world geometry
const GROUND = 2300; // ground floor surface
const FLOOR_H = 200;
const floorY = (k: number) => GROUND - FLOOR_H * k; // surface of floor k (0..8)
const ROOF = floorY(8) - FLOOR_H; // 500
const SHEAVE = { x: 560, y: 330, r: 100 };
const CAB = { x: 375, w: 170, h: 150 }; // cabin lane
const CW = { x: 610, w: 100, h: 200 };
const CAB_ROPE_X = 460;
const CW_ROPE_X = 660;
const CT_MID = 1350; // cabin top when level with floor 4
const cwFromCabin = (ct: number) => ROOF + (2150 - ct);

// ---------------------------------------------------------------- simulation (cabin / counterweight over time)
const T_SNAP = 30.7;
const T_CLAMP = 35.3;
const A_FALL = 48;
const RESET = 37.4;

type Sim = { ct: number; cw: number; broken: boolean; clamped: boolean; sinceClamp: number; reset: boolean };

function ctNormal(t: number): number {
  if (t < 14.7) return CT_MID;
  if (t < 16.8) return CT_MID + 400 * seg(t, 14.7, 16.8);
  if (t < 18.0) return CT_MID + 400;
  if (t < 20.2) return CT_MID + 400 - 400 * seg(t, 18.0, 20.2);
  return CT_MID;
}

function sim(t: number): Sim {
  if (t >= RESET) {
    // after the reset: fresh cabin at ground floor, then rides to the top
    const ct = t < 40.03 ? 2150 : 2150 - 1600 * seg(t, 40.03, 42.45);
    return { ct, cw: cwFromCabin(ct), broken: false, clamped: false, sinceClamp: 0, reset: true };
  }
  if (t < T_SNAP) {
    const ct = ctNormal(t);
    return { ct, cw: cwFromCabin(ct), broken: false, clamped: false, sinceClamp: 0, reset: false };
  }
  const dt = t - T_SNAP;
  const fall = 0.5 * A_FALL * dt * dt;
  const dC = 0.5 * A_FALL * (T_CLAMP - T_SNAP) ** 2;
  const vC = A_FALL * (T_CLAMP - T_SNAP);
  let ct: number;
  let clamped = false;
  let since = 0;
  if (t < T_CLAMP) {
    ct = CT_MID + fall;
  } else {
    clamped = true;
    since = t - T_CLAMP;
    const stop = 0.5 * vC * 0.35 * seg(since, 0, 0.35);
    const b = since > 0.35 ? 5 * Math.sin((since - 0.35) * 18) * Math.exp(-(since - 0.35) * 5) : 0;
    ct = CT_MID + dC + stop + b;
  }
  const cwDrop = Math.min(fall, 800);
  const cwBounce = fall > 800 ? 6 * Math.sin((dt - Math.sqrt(1600 / A_FALL)) * 16) * Math.exp(-(dt - Math.sqrt(1600 / A_FALL)) * 4) : 0;
  return { ct, cw: 1300 + cwDrop + cwBounce, broken: true, clamped, sinceClamp: since, reset: false };
}

// ---------------------------------------------------------------- camera
type Key = [number, number, number, number]; // t, cx, cy, zoom
const KEYS: Key[] = [
  [0, 540, 1300, 0.62],
  [1.5, 540, 1300, 0.62],
  [4.2, 480, 1120, 1.2],
  [6.9, 470, 1150, 1.3],
  [7.9, 545, 400, 1.4],
  [8.93, 545, 420, 1.4],
  [10.4, 620, 1000, 1.0],
  [12.2, 620, 1000, 1.0],
  [13.0, 560, 430, 1.5],
  [14.4, 560, 430, 1.5],
  [15.2, 545, 1100, 0.8],
  [20.6, 545, 1100, 0.8],
  [21.8, 560, 520, 1.15],
  [29.1, 560, 520, 1.15],
  [30.2, 545, 1250, 0.7],
  [31.2, 520, 1450, 1.0],
  [33.0, 480, 1600, 1.1],
  [35.0, 480, 1700, 1.2],
  [37.2, 480, 1700, 1.2],
  [37.4, 540, 1500, 0.62],
  [40.0, 540, 1500, 0.62],
  [42.84, 540, 1200, 0.7],
];

function cam(t: number): { cx: number; cy: number; z: number } {
  if (t <= KEYS[0][0]) return { cx: KEYS[0][1], cy: KEYS[0][2], z: KEYS[0][3] };
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (t < b[0]) {
      const u = b[0] === a[0] ? 1 : ease((t - a[0]) / (b[0] - a[0]));
      return { cx: a[1] + (b[1] - a[1]) * u, cy: a[2] + (b[2] - a[2]) * u, z: a[3] + (b[3] - a[3]) * u };
    }
  }
  const l = KEYS[KEYS.length - 1];
  return { cx: l[1], cy: l[2], z: l[3] };
}

// ---------------------------------------------------------------- small drawing pieces
const Person: React.FC<{ x: number; y: number; color: string; s?: number }> = ({ x, y, color, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle cx={0} cy={-38} r={9} fill="#e8b98f" />
    <rect x={-10} y={-29} width={20} height={29} rx={8} fill={color} />
  </g>
);

const ROOM_COLORS = ["#efe0c4", "#d9e3cf", "#ecd0bd"];
const SOFA = ["#6b8e5a", "#c8643c", "#3f7fa6", "#d9a441"];
const PERSON_COLORS = ["#3f6fb0", "#d9a441", "#b34a4a", "#4a8a6a"];

const Room: React.FC<{ x: number; k: number; side: "L" | "R" }> = ({ x, k, side }) => {
  const y = floorY(k);
  const top = y - FLOOR_H;
  const seed = k * 2 + (side === "L" ? 0 : 1);
  const winX = side === "L" ? x + 18 : x + 230 - 18 - 60;
  const furX = side === "L" ? x + 90 : x + 20;
  const hasPerson = seed % 3 === 0;
  return (
    <g>
      <rect x={x} y={top} width={230} height={FLOOR_H} fill={ROOM_COLORS[seed % 3]} />
      <rect x={x} y={top} width={230} height={14} fill="rgba(255,255,255,.45)" />
      <rect x={winX} y={top + 40} width={60} height={70} rx={4} fill="#9cc8e0" stroke="#fff" strokeWidth={5} />
      <rect x={furX} y={y - 42} width={90} height={42} rx={10} fill={SOFA[seed % 4]} />
      <rect x={furX + 6} y={y - 60} width={78} height={22} rx={8} fill={SOFA[seed % 4]} opacity={0.85} />
      <rect x={side === "L" ? x + 196 : x + 14} y={y - 100} width={10} height={100} fill="#7a5a3a" />
      <circle cx={side === "L" ? x + 201 : x + 19} cy={y - 104} r={14} fill="#ffe9a8" />
      {hasPerson && <Person x={side === "L" ? x + 150 : x + 150} y={y} color={PERSON_COLORS[seed % 4]} s={0.95} />}
      <rect x={x} y={y} width={230} height={14} fill="#8a6a4a" />
    </g>
  );
};

const Building: React.FC<{ t: number }> = ({ t }) => {
  const floors = Array.from({ length: 9 }, (_, k) => k);
  return (
    <g>
      {/* neighbour blocks */}
      <rect x={-420} y={900} width={500} height={1400} fill="#d17a4f" />
      <rect x={1000} y={760} width={480} height={1540} fill="#9fae86" />
      {Array.from({ length: 12 }).map((_, r) =>
        [0, 1, 2].map((c) => (
          <React.Fragment key={`${r}-${c}`}>
            <rect x={-400 + c * 150} y={940 + r * 110} width={60} height={70} rx={4} fill={(r + c) % 3 === 0 ? "#f3dfb8" : "#3d5a85"} />
            <rect x={1030 + c * 140} y={800 + r * 118} width={60} height={70} rx={4} fill={(r + c) % 4 === 0 ? "#f3dfb8" : "#4e6f8f"} />
          </React.Fragment>
        )),
      )}
      {/* soil */}
      <rect x={-500} y={GROUND} width={2100} height={400} fill="#a86f45" />
      {Array.from({ length: 30 }).map((_, i) => (
        <circle key={i} cx={-400 + ((i * 197) % 1900)} cy={GROUND + 30 + ((i * 53) % 330)} r={4 + (i % 3)} fill="#8c5a36" />
      ))}
      {/* shell */}
      <rect x={90} y={ROOF} width={900} height={GROUND - ROOF + 14} fill="#c9bea6" />
      {floors.map((k) => (
        <g key={k}>
          <Room x={100} k={k} side="L" />
          <Room x={750} k={k} side="R" />
        </g>
      ))}
      {/* shaft */}
      <rect x={345} y={ROOF} width={390} height={GROUND - ROOF + 100} fill={C.shaft} />
      {/* floor numbers on the shaft wall */}
      {floors.map((k) => (
        <text key={k} x={356} y={floorY(k) - 8} fontFamily={FONT} fontSize={26} fontWeight={700} fill="rgba(255,255,255,.35)">
          {k === 0 ? "G" : k}
        </text>
      ))}
      {/* rails */}
      {[368, 552, 603, 717].map((x) => (
        <rect key={x} x={x - 3} y={ROOF} width={6} height={GROUND - ROOF + 100} fill={C.rail} />
      ))}
      {/* buffer pit */}
      <rect x={380} y={GROUND + 80} width={160} height={20} rx={6} fill="#6b6b70" />
      <rect x={610} y={GROUND + 80} width={100} height={20} rx={6} fill="#6b6b70" />
      {/* machine room */}
      <rect x={330} y={200} width={450} height={ROOF - 200} fill="#e9dcc0" />
      <rect x={320} y={186} width={470} height={16} rx={4} fill="#6b5a48" />
      <rect x={330} y={ROOF} width={450} height={14} fill="#8a6a4a" />
      {/* control panel with dial + lights (like the reference) */}
      <rect x={344} y={330} width={64} height={120} rx={6} fill="#1f1f22" />
      <circle cx={376} cy={362} r={20} fill="#f3efe2" />
      <line x1={376} y1={362} x2={376 + 14 * Math.cos(-0.9 + Math.sin(t * 2) * 0.1)} y2={362 + 14 * Math.sin(-0.9 + Math.sin(t * 2) * 0.1)} stroke={C.red} strokeWidth={3} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={356 + i * 20} cy={422} r={6} fill={["#d6443a", "#e0a93b", "#4cae6a"][i]} />
      ))}
      {/* ground / lobby floor */}
      <rect x={90} y={GROUND} width={900} height={14} fill="#6b5a48" />
    </g>
  );
};

const Sheave: React.FC<{ travel: number; hot: boolean }> = ({ travel, hot }) => {
  const rot = -(travel / SHEAVE.r) * (180 / Math.PI);
  return (
    <g>
      {/* motor */}
      <rect x={640} y={296} width={130} height={70} rx={10} fill="#1f1f22" />
      <rect x={700} y={304} width={60} height={54} rx={6} fill="#f08a62" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={706 + i * 11} y1={308} x2={706 + i * 11} y2={354} stroke="#c8643c" strokeWidth={3} />
      ))}
      <rect x={620} y={380} width={160} height={14} rx={4} fill="#1f1f22" />
      <g transform={`translate(${SHEAVE.x},${SHEAVE.y}) rotate(${rot})`}>
        <circle r={SHEAVE.r} fill="#34343a" stroke={hot ? C.gold : "#17171a"} strokeWidth={hot ? 8 : 5} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={58 * Math.cos((i * Math.PI) / 3)} cy={58 * Math.sin((i * Math.PI) / 3)} r={15} fill="#17171a" />
        ))}
        <circle r={20} fill="#17171a" />
        <rect x={-4} y={-SHEAVE.r + 8} width={8} height={26} rx={3} fill={C.red} />
      </g>
    </g>
  );
};

const Governor: React.FC<{ ct: number; alarm: boolean; t: number }> = ({ ct, alarm, t }) => {
  const rot = ct * 0.9;
  return (
    <g transform="translate(715,445)">
      {alarm && <circle r={52 + Math.sin(t * 30) * 4} fill="none" stroke={C.red} strokeWidth={6} opacity={0.8} />}
      <g transform={`rotate(${rot})`}>
        <circle r={36} fill="#3a3a40" stroke="#17171a" strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={22 * Math.cos((i * Math.PI) / 2)} cy={22 * Math.sin((i * Math.PI) / 2)} r={7} fill={alarm ? C.red : C.gold} />
        ))}
        <circle r={7} fill="#17171a" />
      </g>
    </g>
  );
};

// pseudo-random sparks
const Sparks: React.FC<{ x: number; y: number; age: number; n?: number; life?: number }> = ({ x, y, age, n = 14, life = 0.6 }) => {
  if (age < 0 || age > life) return null;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const a = i * 2.399 + 0.7;
        const sp = 90 + ((i * 37) % 110);
        const px = x + Math.cos(a) * sp * age;
        const py = y + Math.sin(a) * sp * age + 160 * age * age;
        return <circle key={i} cx={px} cy={py} r={4 - 2 * (age / life)} fill={i % 2 ? "#ffd36a" : "#ff8a3d"} opacity={1 - age / life} />;
      })}
    </g>
  );
};

const Cabin: React.FC<{ y: number; vib: number; clamped: boolean; sinceClamp: number; falling: boolean }> = ({ y, vib, clamped, sinceClamp, falling }) => {
  const grip = clamped ? seg(sinceClamp, -0.05, 0.2) : 0;
  return (
    <g transform={`translate(${vib},${y})`}>
      <rect x={CAB.x - 6} y={-14} width={CAB.w + 12} height={14} rx={4} fill="#2a2a2e" />
      <rect x={CAB.x} y={0} width={CAB.w} height={CAB.h} rx={10} fill="#e9dcc0" stroke="#1d1d20" strokeWidth={6} />
      <rect x={CAB.x + 8} y={8} width={CAB.w - 16} height={CAB.h - 20} rx={6} fill="#f4ead2" />
      <line x1={CAB.x + CAB.w / 2} y1={8} x2={CAB.x + CAB.w / 2} y2={CAB.h - 12} stroke="#cdbf9e" strokeWidth={3} />
      <rect x={CAB.x + 8} y={CAB.h - 14} width={CAB.w - 16} height={8} fill="#b9a780" />
      <Person x={CAB.x + 50} y={CAB.h - 14} color="#3f6fb0" s={1.15} />
      <Person x={CAB.x + 88} y={CAB.h - 14} color="#d9a441" s={1.3} />
      <Person x={CAB.x + 125} y={CAB.h - 14} color="#b34a4a" s={1.1} />
      {/* safety clamps (red) */}
      <g>
        <path d={`M${CAB.x - 6 - 8 + grip * 6},${CAB.h - 70} l22,0 l0,46 l-22,0 z`} fill={C.red} stroke="#7a1f19" strokeWidth={3} />
        <path d={`M${CAB.x + CAB.w + 6 + 8 - grip * 6},${CAB.h - 70} l-22,0 l0,46 l22,0 z`} fill={C.red} stroke="#7a1f19" strokeWidth={3} />
      </g>
      {falling && !clamped && (
        <g stroke="rgba(255,255,255,.55)" strokeWidth={4} strokeLinecap="round">
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={CAB.x - 30 + i * 70} y1={-90 - (i % 2) * 30} x2={CAB.x - 30 + i * 70} y2={-30} />
          ))}
        </g>
      )}
    </g>
  );
};

const Counterweight: React.FC<{ y: number; glow: number }> = ({ y, glow }) => (
  <g transform={`translate(0,${y})`}>
    {glow > 0 && <rect x={CW.x - 14} y={-14} width={CW.w + 28} height={CW.h + 28} rx={16} fill="none" stroke={C.gold} strokeWidth={8} opacity={glow} />}
    <rect x={CW.x} y={0} width={CW.w} height={CW.h} rx={8} fill="#55565d" stroke="#25262a" strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={CW.x + 8} y={12 + i * 38} width={CW.w - 16} height={30} rx={4} fill={i % 2 ? "#6a6b73" : "#7a7b84"} />
    ))}
    <rect x={CW.x + CW.w / 2 - 12} y={-12} width={24} height={14} rx={3} fill="#25262a" />
  </g>
);

const Ropes: React.FC<{ s: Sim; travel: number; t: number }> = ({ s, travel, t }) => {
  const vib = !s.broken ? Math.sin(t * 40) * (t > 3 && t < 7 ? 1.4 : 0.4) : 0;
  const dash = "16 10";
  const off = -travel;
  const ropeStyle = { stroke: "#26262a", strokeWidth: 5, strokeDasharray: dash, fill: "none" } as const;
  const cabY = s.ct;
  const cwY = s.cw;
  const sinceBreak = Math.max(0, t - T_SNAP);
  return (
    <g>
      {/* counterweight side always connected */}
      {[-8, 8].map((d) => (
        <line key={`r${d}`} x1={CW_ROPE_X + d} y1={SHEAVE.y} x2={CW_ROPE_X + d + vib} y2={cwY - 12} {...ropeStyle} strokeDashoffset={-off} />
      ))}
      {/* over the sheave */}
      <path d={`M${CAB_ROPE_X - 8},${SHEAVE.y} A${SHEAVE.r + 8},${SHEAVE.r + 8} 0 0 1 ${CW_ROPE_X + 8},${SHEAVE.y}`} {...ropeStyle} strokeDashoffset={0} stroke="#26262a" strokeDasharray="none" opacity={0.55} />
      {/* cabin side */}
      {!s.broken &&
        [-8, 8].map((d) => (
          <line key={`l${d}`} x1={CAB_ROPE_X + d} y1={SHEAVE.y} x2={CAB_ROPE_X + d + vib} y2={cabY - 14} {...ropeStyle} strokeDashoffset={off} />
        ))}
      {s.broken && (
        <g>
          {/* dangling upper rope */}
          {[-8, 8].map((d) => (
            <line key={`u${d}`} x1={CAB_ROPE_X + d} y1={SHEAVE.y} x2={CAB_ROPE_X + d} y2={SHEAVE.y + Math.max(0, 150 - 120 * sinceBreak)} {...ropeStyle} />
          ))}
          {/* frayed stubs on the cabin */}
          {[-8, 8].map((d) => (
            <path key={`s${d}`} d={`M${CAB_ROPE_X + d},${cabY - 14} l${d > 0 ? 4 : -4},-18 l${d > 0 ? -6 : 6},-12 l${d > 0 ? 6 : -6},-14`} stroke="#26262a" strokeWidth={5} fill="none" strokeLinecap="round" />
          ))}
          <Sparks x={CAB_ROPE_X} y={cabY - 30} age={t - T_SNAP} n={16} life={0.7} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- HUD cards
const Card: React.FC<{ x: number; y: number; w: number; h: number; opacity: number; children: React.ReactNode }> = ({ x, y, w, h, opacity, children }) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity} transform={`translate(${x},${y + (1 - opacity) * 30})`}>
      <rect width={w} height={h} rx={36} fill={C.cream} stroke={C.forestDark} strokeWidth={6} />
      {children}
    </g>
  );
};

const Seesaw: React.FC<{ angle: number }> = ({ angle }) => (
  <g>
    <polygon points="0,20 -40,100 40,100" fill={C.forestDark} />
    <g transform={`rotate(${-angle})`}>
      <rect x={-210} y={4} width={420} height={16} rx={8} fill="#7a5a3a" />
      <rect x={-200} y={-72} width={76} height={76} rx={10} fill={C.forest} />
      <text x={-162} y={-26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.cream}>cabin</text>
      <rect x={124} y={-72} width={76} height={76} rx={10} fill="#55565d" />
      <text x={162} y={-34} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={16} fill={C.cream}>counter-</text>
      <text x={162} y={-14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={16} fill={C.cream}>weight</text>
    </g>
  </g>
);

const WeightCard: React.FC<{ t: number }> = ({ t }) => {
  const vis = lin(t, 21.6, 22.1) * (1 - lin(t, 29.0, 29.3));
  const grow = seg(t, 22.2, 23.5);
  const p2 = seg(t, 24.6, 26.2);
  const g1 = 1 - lin(t, 27.0, 27.3);
  const g2 = lin(t, 27.1, 27.5);
  const K = 0.3167;
  const base = 560;
  const hL = 1200 * K * grow;
  const hR = 1000 * K * grow;
  const xR = 510 - 340 * p2;
  const rightOpacity = 1 - lin(t, 25.4, 26.3);
  return (
    <Card x={90} y={470} w={900} h={760} opacity={vis}>
      <text x={450} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={C.forestDark}>
        {t < 27.1 ? "Weight the motor must lift" : "Motor power needed"}
      </text>
      <text x={450} y={112} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={28} fill={C.forest} opacity={0.8}>
        (example numbers)
      </text>
      <g opacity={g1}>
        <line x1={110} y1={base} x2={790} y2={base} stroke={C.forestDark} strokeWidth={5} />
        {/* cabin + people: bottom 1000 part and top 200 part */}
        <rect x={170} y={base - 1000 * K * grow} width={220} height={1000 * K * grow} fill={C.forest} />
        <rect x={170} y={base - 1000 * K * grow} width={220} height={1000 * K * grow} fill="#9a9a9a" opacity={p2} />
        <rect x={170} y={base - hL} width={220} height={200 * K * grow} fill={C.forest} />
        <rect x={170} y={base - hL} width={220} height={200 * K * grow} fill={C.gold} opacity={p2} />
        {/* counterweight bar slides over and fades */}
        <rect x={xR} y={base - hR} width={220} height={hR} fill="#55565d" opacity={rightOpacity} />
        <text x={280} y={base + 44} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={C.forestDark}>Cabin + people</text>
        <text x={280} y={base + 80} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={C.forest}>1,200 kg</text>
        <g opacity={rightOpacity}>
          <text x={620} y={base + 44} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={C.forestDark}>Counterweight</text>
          <text x={620} y={base + 80} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill="#55565d">1,000 kg</text>
        </g>
        <g opacity={p2}>
          <text x={620} y={base - 150} fontFamily={FONT} fontWeight={800} fontSize={40} fill={C.forestDark}>Only 200 kg</text>
          <text x={620} y={base - 106} fontFamily={FONT} fontWeight={800} fontSize={40} fill={C.forestDark}>left to lift!</text>
          <line x1={600} y1={base - 270} x2={400} y2={base - 1000 * K - 30} stroke={C.gold} strokeWidth={6} />
          <text x={280} y={base - 1000 * K - 110} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill="#7a7a7a">cancelled</text>
        </g>
      </g>
      <g opacity={g2}>
        <text x={100} y={190} fontFamily={FONT} fontWeight={700} fontSize={34} fill={C.forestDark}>Without counterweight</text>
        <rect x={100} y={210} width={700} height={80} rx={14} fill="rgba(31,63,39,.12)" />
        <rect x={100} y={210} width={700 * seg(t, 27.3, 28.0)} height={80} rx={14} fill={C.red} />
        <text x={100} y={440} fontFamily={FONT} fontWeight={700} fontSize={34} fill={C.forestDark}>With counterweight</text>
        <rect x={100} y={460} width={700} height={80} rx={14} fill="rgba(31,63,39,.12)" />
        <rect x={100} y={460} width={700 * 0.17 * seg(t, 27.6, 28.3)} height={80} rx={14} fill="#4cae6a" />
        <text x={100 + 700 * 0.17 + 24} y={515} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#2f7a4a" opacity={seg(t, 28.0, 28.5)}>far less!</text>
      </g>
    </Card>
  );
};

const SpeedCard: React.FC<{ t: number; speed: number }> = ({ t, speed }) => {
  const vis = lin(t, 31.4, 31.9) * (1 - lin(t, 36.4, 36.8));
  const max = 260;
  const limit = 160;
  const a = -Math.PI + clamp(speed / max, 0, 1) * Math.PI;
  const aLim = -Math.PI + (limit / max) * Math.PI;
  const over = speed > limit;
  const R = 150;
  const arc = (a0: number, a1: number) => `M${Math.cos(a0) * R},${Math.sin(a0) * R} A${R},${R} 0 0 1 ${Math.cos(a1) * R},${Math.sin(a1) * R}`;
  return (
    <Card x={150} y={150} w={780} h={400} opacity={vis}>
      <text x={390} y={64} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill={C.forestDark}>Speed sensor</text>
      <g transform="translate(390,300)">
        <path d={arc(-Math.PI, aLim)} stroke="#4cae6a" strokeWidth={30} fill="none" />
        <path d={arc(aLim, 0)} stroke={C.red} strokeWidth={30} fill="none" />
        <line x1={0} y1={0} x2={Math.cos(a) * (R - 18)} y2={Math.sin(a) * (R - 18)} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
        <circle r={16} fill={C.ink} />
      </g>
      <text x={390} y={372} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={over ? 54 : 32} fill={over ? C.red : C.forest}>
        {over ? "TOO FAST!" : "speed limit: ok"}
      </text>
    </Card>
  );
};

const SeesawCard: React.FC<{ opacity: number; angle: number }> = ({ opacity, angle }) => (
  <Card x={290} y={150} w={500} h={250} opacity={opacity}>
    <g transform="translate(250,125)">
      <Seesaw angle={angle} />
    </g>
  </Card>
);

// ---------------------------------------------------------------- captions
const Captions: React.FC<{ t: number }> = ({ t }) => {
  let cur = WORDS[0];
  for (const w of WORDS) {
    if (t >= w.t0) cur = w;
  }
  const started = t >= WORDS[0].t0;
  const age = (t - cur.t0) / Math.max(0.01, cur.t1 - cur.t0);
  const pop = interpolate(age, [0, 0.22], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gap = t > cur.t1 + 0.6; // long silence: fade out
  if (!started) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1450, height: 260, display: "flex", alignItems: "center", justifyContent: "center", opacity: gap ? 0 : 1, transition: "none" }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: cur.w.length > 9 ? 120 : 150,
          color: cur.hot ? C.gold : C.cream,
          transform: `scale(${pop})`,
          textShadow: "0 6px 0 rgba(0,0,0,.35), 4px 4px 0 #1d2a21, -4px -4px 0 #1d2a21, 4px -4px 0 #1d2a21, -4px 4px 0 #1d2a21, 0 0 24px rgba(0,0,0,.45)",
          letterSpacing: 1,
          whiteSpace: "nowrap",
        }}
      >
        {cur.w}
      </div>
    </div>
  );
};

const Progress: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", top: 54, left: 60, right: 60, display: "flex", gap: 10 }}>
    {SCENE_BOUNDS.slice(0, -1).map((a, i) => {
      const b = SCENE_BOUNDS[i + 1];
      const p = lin(t, a, b);
      return (
        <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,.45)", overflow: "hidden" }}>
          <div style={{ width: `${p * 100}%`, height: "100%", background: "#fff" }} />
        </div>
      );
    })}
  </div>
);

// ---------------------------------------------------------------- main
export const Elevator: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = sim(t);
  const { cx, cy, z } = cam(t);
  const shake = t > 4.9 && t < 6.9 ? 1 : 0;
  const sx = Math.sin(t * 61) * 3 * shake;
  const sy = Math.cos(t * 53) * 3 * shake;

  const travel = s.reset || s.broken ? -(s.cw - 1300) : s.ct - CT_MID;
  const speed = Math.abs(sim(t).ct - sim(t - 1 / FPS).ct) * FPS;
  const falling = s.broken && !s.clamped;

  // overlays
  const qBubble = lin(t, 4.9, 5.3) * (1 - lin(t, 6.8, 7.2));
  const cwGlow = lin(t, 10.7, 11.1) * (1 - lin(t, 12.8, 13.3)) * (0.6 + 0.4 * Math.sin(t * 8));
  const cwLabel = lin(t, 10.8, 11.3) * (1 - lin(t, 12.6, 13.1));
  const loopHot = t > 12.57 && t < 14.4;
  const seesawA = lin(t, 18.6, 19.0) * (1 - lin(t, 20.6, 21.0));
  const seesawB = lin(t, 40.4, 40.9);
  const angle = clamp((s.ct - CT_MID) / 40, -14, 14);
  const overAlarm = speed > 160 && t < T_CLAMP + 0.1 && t > 33;
  const flash = interpolate(t, [37.1, 37.4, 37.9], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const impact = s.clamped ? lin(s.sinceClamp, 0, 0.05) * (1 - lin(s.sinceClamp, 0.05, 0.4)) : 0;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#8fb5d0 0%,#f2cfa5 60%,#f4dcc0 100%)" }}>
      <Audio src={staticFile("narration.wav")} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${540 + sx + impact * 6},${700 + sy + impact * 5}) scale(${z}) translate(${-cx},${-cy})`}>
          <Building t={t} />
          <Sheave travel={travel} hot={loopHot} />
          <Governor ct={s.ct} alarm={overAlarm} t={t} />
          <Ropes s={s} travel={travel} t={t} />
          <Counterweight y={s.cw} glow={cwGlow} />
          <Cabin y={s.ct} vib={s.broken ? 0 : Math.sin(t * 40) * (t > 3 && t < 7 ? 1.2 : 0.3)} clamped={s.clamped} sinceClamp={s.sinceClamp} falling={falling} />
          {s.clamped && (
            <>
              <Sparks x={CAB.x - 14} y={s.ct + CAB.h - 40} age={s.sinceClamp} n={18} life={0.7} />
              <Sparks x={CAB.x + CAB.w + 14} y={s.ct + CAB.h - 40} age={s.sinceClamp} n={18} life={0.7} />
            </>
          )}
          {/* ? bubble over the cabin in the hook */}
          {qBubble > 0 && (
            <g transform={`translate(560,${s.ct - 170 + Math.sin(t * 6) * 6}) scale(${0.6 + 0.4 * qBubble})`} opacity={qBubble}>
              <circle r={64} fill={C.gold} stroke={C.forestDark} strokeWidth={6} />
              <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={90} fill={C.forestDark}>?</text>
            </g>
          )}
          {/* counterweight label */}
          {cwLabel > 0 && (
            <g opacity={cwLabel}>
              <line x1={712} y1={s.cw + 100} x2={790} y2={s.cw + 100} stroke={C.gold} strokeWidth={6} />
              <rect x={790} y={s.cw + 60} width={250} height={80} rx={16} fill={C.gold} stroke={C.forestDark} strokeWidth={5} />
              <text x={915} y={s.cw + 114} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.forestDark}>COUNTERWEIGHT</text>
            </g>
          )}
        </g>
        <WeightCard t={t} />
        <SpeedCard t={t} speed={speed} />
        <SeesawCard opacity={Math.max(seesawA, seesawB)} angle={angle} />
      </svg>

      <Progress t={t} />
      <Captions t={t} />
      <AbsoluteFill style={{ background: C.cream, opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: C.red, opacity: overAlarm ? 0.12 + 0.08 * Math.sin(t * 30) : 0, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
