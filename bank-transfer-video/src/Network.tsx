import React from "react";
import { Easing, interpolateColors, random, useCurrentFrame } from "remotion";
import { Bank } from "./Bank";
import { C, FONT, T } from "./theme";
import { bell, clamp, lerp, money, prog, splineAt, splinePath, type Pt } from "./math";

const ROUTE: Pt[] = [
  { x: 484, y: 652 },
  { x: 700, y: 444 },
  { x: 960, y: 336 },
  { x: 1220, y: 444 },
  { x: 1436, y: 652 },
];
const ROUTE_D = splinePath(ROUTE);
const HUB = ROUTE[2];

const N = 60;
const EMIT = 36;
const TRAVEL = 56;
const travelEase = Easing.bezier(0.42, 0.05, 0.58, 0.95);

const particles = Array.from({ length: N }, (_, i) => {
  const start = T.emitStart + (i / N) * EMIT;
  const dur = TRAVEL * (0.93 + random(`pd${i}`) * 0.07);
  return {
    start,
    dur,
    arrive: start + dur,
    lane: (random(`pl${i}`) - 0.5) * 2,
    size: 4 + random(`ps${i}`) * 4.5,
    coin: i % 7 === 3,
    color: i % 5 === 0 ? "gold" : i % 2 ? "teal" : "cyan",
  };
});

const COLOR = { teal: C.teal, cyan: C.cyan, gold: C.gold } as const;
const GLOW = { teal: "url(#glowTeal)", cyan: "url(#glowCyan)", gold: "url(#glowGold)" } as const;

// faint background payments network
const NODES: Pt[] = Array.from({ length: 30 }, (_, i) => ({
  x: 60 + random(`nx${i}`) * 1800,
  y: 90 + random(`ny${i}`) * 760,
}));
const EDGES: [number, number][] = [];
NODES.forEach((a, i) => {
  NODES.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
    .filter((o) => o.j !== i)
    .sort((p, q) => p.d - q.d)
    .slice(0, 2)
    .forEach((o) => {
      if (!EDGES.some(([p, q]) => (p === i && q === o.j) || (p === o.j && q === i))) EDGES.push([i, o.j]);
    });
});

const Card: React.FC<{
  x: number;
  y: number;
  title: string;
  value: number;
  valueColor: string;
  delta?: { text: string; color: string; p: number };
  status: string;
  statusColor: string;
  active: number;
}> = ({ x, y, title, value, valueColor, delta, status, statusColor, active }) => (
  <g fontFamily={FONT} transform={`translate(${x} ${y})`}>
    <rect width={400} height={206} rx={28} fill="rgba(9,24,44,0.88)" stroke={C.teal} strokeOpacity={0.25 + active * 0.6} strokeWidth={2 + active * 2} />
    <text x={32} y={52} fill={C.mute} fontSize={20} fontWeight={600} letterSpacing={3}>
      {title}
    </text>
    <text x={32} y={128} fill={valueColor} fontSize={72} fontWeight={800} letterSpacing={-1.5} style={{ fontVariantNumeric: "tabular-nums" }}>
      {money(value)}
    </text>
    {delta && (
      <g opacity={delta.p} transform={`translate(32 ${150 + (1 - delta.p) * 8})`}>
        <rect width={150} height={38} rx={19} fill={delta.color} fillOpacity={0.16} stroke={delta.color} strokeOpacity={0.6} />
        <text x={75} y={27} textAnchor="middle" fill={delta.color} fontSize={23} fontWeight={800}>
          {delta.text}
        </text>
      </g>
    )}
    <text x={368} y={178} textAnchor="end" fill={statusColor} fontSize={19} fontWeight={700} letterSpacing={3}>
      {status}
    </text>
  </g>
);

/** Scene C/D: the money crosses the clearing network and is credited. */
export const Network: React.FC = () => {
  const f = useCurrentFrame();
  const opacity = prog(f, 146, 172);
  if (opacity <= 0) return null;

  // camera: emerge from the tunnel, then a slow push toward the receiving bank
  const entry = 1 + 0.6 * (1 - prog(f, 148, 196, Easing.out(Easing.cubic)));
  const drift = prog(f, 148, 300, Easing.inOut(Easing.quad));
  const s = entry * (1 + 0.045 * drift);
  const camX = lerp(930, 985, drift);

  const arrived = particles.filter((p) => f >= p.arrive).length / N;
  const leadU = clamp(travelEase((f - T.emitStart) / (TRAVEL * 0.96)));
  const litLen = leadU;

  // balances
  const sendFrac = prog(f, T.emitStart, T.emitStart + EMIT + 6, Easing.inOut(Easing.sin));
  const senderBal = 1000 * (1 - sendFrac);
  const credit = prog(f, T.settleStart, T.settleEnd, Easing.out(Easing.cubic));
  const receiverBal = 250 + 1000 * credit;
  const settled = f >= T.settleEnd;

  const senderGlow = 0.35 + bell(f, T.emitStart + 18, 16) * 1.1;
  const receiverGlow = 0.3 + arrived * 0.55 + bell(f, T.settleStart + 14, 14) * 0.8;

  const hubPulse = particles.reduce((acc, p) => acc + bell(f, p.start + p.dur * 0.5, 3), 0) / 5;
  const arrivalFlash = particles.reduce((acc, p) => acc + bell(f, p.arrive, 1.6), 0) / 4;
  const orbIn = 1 - prog(f, T.settleStart + 6, T.settleStart + 22);

  return (
    <g opacity={opacity} fontFamily={FONT}>
      <g transform={`translate(960 540) scale(${s}) translate(${-camX} -540)`}>
        {/* ambient payments network */}
        <g>
          {EDGES.map(([a, b], i) => (
            <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke={C.line} strokeOpacity={0.4} strokeWidth={1.5} />
          ))}
          {NODES.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={3 + (i % 3)} fill={C.cyan} opacity={0.35 + 0.25 * Math.sin(f / 14 + i)} />
          ))}
          {EDGES.slice(0, 14).map(([a, b], i) => {
            const u = (f * 0.012 + random(`ep${i}`)) % 1;
            return (
              <circle
                key={i}
                cx={lerp(NODES[a].x, NODES[b].x, u)}
                cy={lerp(NODES[a].y, NODES[b].y, u)}
                r={3.5}
                fill={C.teal}
                opacity={0.6}
              />
            );
          })}
        </g>

        {/* banks */}
        <Bank id="send" x={140} y={772} scale={1.3} glow={senderGlow} />
        <Bank id="recv" x={1780} y={772} scale={1.3} mirror glow={receiverGlow} />

        {/* route */}
        <path d={ROUTE_D} fill="none" stroke={C.line} strokeWidth={6} strokeLinecap="round" opacity={0.9} />
        <path d={ROUTE_D} fill="none" stroke={C.line} strokeWidth={2} strokeDasharray="4 12" opacity={0.9} transform="translate(0 -0)" />
        <path d={ROUTE_D} pathLength={1} fill="none" stroke={C.teal} strokeWidth={22} opacity={0.16} strokeDasharray={`${litLen} 2`} />
        <path d={ROUTE_D} pathLength={1} fill="none" stroke={C.teal} strokeWidth={5} strokeDasharray={`${litLen} 2`} />

        {/* transaction arrows */}
        {Array.from({ length: 8 }, (_, i) => {
          const u = 0.07 + i * 0.123;
          const pt = splineAt(ROUTE, u);
          const passed = leadU > u ? 1 : 0;
          const hit = bell((leadU - u) * 60, 0, 4);
          const o = passed ? 0.5 + 0.2 * Math.sin(f * 0.25 - i * 1.2) + hit * 0.5 : 0.16;
          return (
            <g key={i} transform={`translate(${pt.x} ${pt.y}) rotate(${pt.angle}) scale(${1 + hit * 0.5})`} opacity={clamp(o)}>
              <path d="M-12 -15 L8 0 L-12 15" fill="none" stroke={passed ? C.mint : C.mute} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}

        {/* intermediate nodes */}
        {[ROUTE[1], ROUTE[3]].map((n, i) => {
          const hit = bell(f, T.emitStart + (i === 0 ? 0.28 : 0.72) * TRAVEL + 12, 14);
          return (
            <g key={i} transform={`translate(${n.x} ${n.y})`}>
              <circle r={50} fill="url(#glowCyan)" opacity={0.2 + hit * 0.6} />
              <circle r={17} fill={C.navy} stroke={C.cyan} strokeWidth={3} />
              <circle r={7} fill={C.cyan} opacity={0.6 + hit * 0.4} />
              <text x={i === 0 ? 34 : -34} y={52} textAnchor={i === 0 ? "start" : "end"} fill={C.text} fontSize={23} fontWeight={600}>
                {i === 0 ? "Debit & verify" : "Credit & confirm"}
              </text>
            </g>
          );
        })}

        {/* clearing hub */}
        <g transform={`translate(${HUB.x} ${HUB.y})`}>
          <circle r={120} fill="url(#glowTeal)" opacity={0.25 + clamp(hubPulse) * 0.6} />
          <g transform={`rotate(${f * 0.8})`}>
            <circle r={76} fill="none" stroke={C.cyan} strokeWidth={2.5} strokeDasharray="16 22" opacity={0.8} />
          </g>
          <g transform={`rotate(${-f * 1.2})`}>
            <circle r={92} fill="none" stroke={C.teal} strokeWidth={1.5} strokeDasharray="4 14" opacity={0.6} />
          </g>
          <polygon
            points={Array.from({ length: 6 }, (_, k) => {
              const a = (Math.PI / 3) * k + Math.PI / 6;
              return `${Math.cos(a) * 54},${Math.sin(a) * 54}`;
            }).join(" ")}
            fill="#0b2340"
            stroke={C.teal}
            strokeWidth={4}
          />
          {[0, 1, 2].map((k) => (
            <circle key={k} cx={Math.cos((k * 2 * Math.PI) / 3 - Math.PI / 2) * 24} cy={Math.sin((k * 2 * Math.PI) / 3 - Math.PI / 2) * 24} r={7} fill={C.teal} />
          ))}
          <path d="M0 -24 L20.8 12 L-20.8 12 Z" fill="none" stroke={C.teal} strokeWidth={2.5} opacity={0.8} />
          <text y={-114} textAnchor="middle" fill="#fff" fontSize={26} fontWeight={700} letterSpacing={3}>
            CLEARING NETWORK
          </text>
        </g>

        {/* sender bursts */}
        <circle cx={ROUTE[0].x} cy={ROUTE[0].y} r={70 + bell(f, T.emitStart + 18, 12) * 60} fill="url(#glowTeal)" opacity={0.15 + bell(f, T.emitStart + 18, 12) * 0.85} />

        {/* receiver collector orb */}
        <circle
          cx={ROUTE[4].x}
          cy={ROUTE[4].y}
          r={26 + arrived * 62 + arrivalFlash * 18}
          fill="url(#glowMint)"
          opacity={clamp(arrived * 1.4) * orbIn}
        />

        {/* particles */}
        {particles.map((p, i) => {
          const raw = (f - p.start) / p.dur;
          if (raw <= 0 || raw >= 1.02) return null;
          const u = travelEase(clamp(raw));
          const fade = clamp(raw * 12) * (1 - prog(raw, 0.97, 1.02));
          const col = COLOR[p.color as keyof typeof COLOR];
          const glow = GLOW[p.color as keyof typeof GLOW];
          const wob = Math.sin(raw * 14 + i * 1.7) * 16 * Math.sin(Math.PI * u) * p.lane;
          const trail = [0, 1, 2, 3, 4, 5].map((k) => {
            const uk = Math.max(0, u - k * 0.011);
            const pt = splineAt(ROUTE, uk);
            const nx = -Math.sin((pt.angle * Math.PI) / 180);
            const ny = Math.cos((pt.angle * Math.PI) / 180);
            return { x: pt.x + nx * wob, y: pt.y + ny * wob, k };
          });
          return (
            <g key={i} opacity={fade}>
              {trail.map((t) =>
                t.k === 0 ? (
                  p.coin ? (
                    <g key={t.k} transform={`translate(${t.x} ${t.y})`}>
                      <circle r={30} fill={glow} />
                      <circle r={13} fill="#1a1405" stroke={C.gold} strokeWidth={2.5} />
                      <text y={6} textAnchor="middle" fill={C.gold} fontSize={16} fontWeight={800}>
                        $
                      </text>
                    </g>
                  ) : (
                    <g key={t.k}>
                      <circle cx={t.x} cy={t.y} r={p.size * 4} fill={glow} />
                      <circle cx={t.x} cy={t.y} r={p.size} fill="#fff" />
                    </g>
                  )
                ) : (
                  <circle key={t.k} cx={t.x} cy={t.y} r={p.size * (1 - t.k * 0.13)} fill={col} opacity={0.5 - t.k * 0.08} />
                ),
              )}
            </g>
          );
        })}

        {/* bank labels */}
        <g textAnchor="middle">
          <text x={320} y={846} fill="#fff" fontSize={28} fontWeight={700}>
            Northgate Bank
          </text>
          <text x={320} y={876} fill={C.mute} fontSize={20} letterSpacing={2}>
            SENDING BANK
          </text>
          <text x={1600} y={846} fill="#fff" fontSize={28} fontWeight={700}>
            Harbor Bank
          </text>
          <text x={1600} y={876} fill={C.mute} fontSize={20} letterSpacing={2}>
            RECEIVING BANK
          </text>
        </g>

        {/* balance cards */}
        <line x1={320} y1={384} x2={320} y2={452} stroke={C.teal} strokeOpacity={0.4} strokeDasharray="4 8" strokeWidth={2} />
        <line x1={1600} y1={384} x2={1600} y2={452} stroke={C.teal} strokeOpacity={0.4} strokeDasharray="4 8" strokeWidth={2} />
        <Card
          x={120}
          y={178}
          title="CHECKING BALANCE"
          value={senderBal}
          valueColor={interpolateColors(sendFrac, [0, 1], ["#ffffff", "#ffa393"])}
          delta={{ text: "−$1,000", color: C.red, p: prog(f, T.emitStart + 2, T.emitStart + 14) }}
          status={sendFrac >= 1 ? "DEBITED" : "DEBITING"}
          statusColor={sendFrac >= 1 ? C.red : C.gold}
          active={bell(f, T.emitStart + 18, 18)}
        />
        <Card
          x={1400}
          y={178}
          title="CHECKING BALANCE"
          value={receiverBal}
          valueColor={credit > 0 ? C.mint : "#ffffff"}
          delta={{ text: "+$1,000", color: C.mint, p: prog(f, T.settleStart, T.settleStart + 12) }}
          status={settled ? "CREDITED" : f >= T.settleStart ? "CREDITING" : arrived > 0 ? "INCOMING" : "WAITING"}
          statusColor={settled ? C.mint : C.gold}
          active={bell(f, T.settleStart + 14, 20) + (settled ? 0.6 : 0)}
        />
        {/* success badge */}
        {settled && (
          <g transform={`translate(1770 178) scale(${0.6 + 0.4 * prog(f, T.settleEnd, T.settleEnd + 10, Easing.out(Easing.back(2)))})`}>
            <circle r={34} fill={C.mint} />
            <circle r={34} fill="none" stroke={C.mint} strokeWidth={3} opacity={1 - prog(f, T.settleEnd, T.settleEnd + 22)} transform={`scale(${1 + prog(f, T.settleEnd, T.settleEnd + 22) * 1.2})`} />
            <path d="M-14 1 l9 10 l19 -22" fill="none" stroke={C.navy} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(f, T.settleEnd + 2, T.settleEnd + 14)} />
          </g>
        )}
      </g>
    </g>
  );
};
