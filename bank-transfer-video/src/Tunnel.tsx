import React from "react";
import { random, useCurrentFrame } from "remotion";
import { C, FONT, MONO, T } from "./theme";
import { bell, clamp, prog } from "./math";

const RINGS = 14;
const STREAKS = 44;
const CHIPS = 26;
const CX = 960;
const CY = 540;

const STEPS = [
  { at: 96, label: "Payment encrypted" },
  { at: 112, label: "Funds verified" },
  { at: 128, label: "Transfer authorised" },
];

const Check: React.FC<{ p: number }> = ({ p }) => (
  <path
    d="M-9 1 l6 7 l12 -14"
    fill="none"
    stroke={C.navy}
    strokeWidth={4}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeDasharray={1}
    pathLength={1}
    strokeDashoffset={1 - p}
  />
);

/** Scene B: inside the digital transaction — an authorisation tunnel. */
export const Tunnel: React.FC = () => {
  const f = useCurrentFrame();
  const opacity = prog(f, T.tunnelIn, T.tunnelIn + 18) * (1 - prog(f, 150, 168));
  if (opacity <= 0) return null;
  const local = Math.max(0, f - T.tunnelIn);
  const tau = local * 0.022 + local * local * 0.00042;
  const coinShrink = 1 - prog(f, 140, 150);

  return (
    <g opacity={opacity} fontFamily={FONT}>
      <circle cx={CX} cy={CY} r={620} fill="url(#glowTeal)" opacity={0.28} />
      {/* rushing frames */}
      {Array.from({ length: RINGS }, (_, k) => {
        const z = (tau + k / RINGS) % 1;
        const w = 40 + z ** 2.4 * 3400;
        const h = w * 0.5625;
        const o = clamp(z / 0.08) * (1 - z ** 5) * 0.8;
        return (
          <rect
            key={k}
            x={CX - w / 2}
            y={CY - h / 2}
            width={w}
            height={h}
            rx={8 + z * 90}
            fill="none"
            stroke={k % 3 === 0 ? C.cyan : C.teal}
            strokeWidth={1.5 + z * 5}
            opacity={o}
          />
        );
      })}
      {/* streaks */}
      {Array.from({ length: STREAKS }, (_, i) => {
        const a = (i / STREAKS) * Math.PI * 2 + random(`sa${i}`) * 0.12;
        const u = (tau * 1.5 + random(`su${i}`)) % 1;
        const r0 = 70 + u ** 2 * 1500;
        const r1 = r0 + 24 + u * 420;
        return (
          <line
            key={i}
            x1={CX + Math.cos(a) * r0}
            y1={CY + Math.sin(a) * r0}
            x2={CX + Math.cos(a) * r1}
            y2={CY + Math.sin(a) * r1}
            stroke={i % 4 === 0 ? C.gold : i % 2 ? C.cyan : C.teal}
            strokeWidth={1.5 + u * 3}
            strokeLinecap="round"
            opacity={clamp(u * 5) * (1 - u) * 0.9}
          />
        );
      })}
      {/* data fragments */}
      {Array.from({ length: CHIPS }, (_, i) => {
        const a = random(`ca${i}`) * Math.PI * 2;
        const u = (tau * 0.9 + random(`cu${i}`)) % 1;
        const r = 130 + u ** 1.8 * 1000;
        const hex = Math.floor(random(`ch${i}`) * 65535)
          .toString(16)
          .toUpperCase()
          .padStart(4, "0");
        return (
          <text
            key={i}
            x={CX + Math.cos(a) * r}
            y={CY + Math.sin(a) * r * 0.62}
            fill={C.cyan}
            fontFamily={MONO}
            fontSize={16 + u * 22}
            opacity={clamp(u * 4) * (1 - u) * 0.6}
            textAnchor="middle"
          >
            {hex}
          </text>
        );
      })}
      {/* core: the $1,000 packet */}
      <g transform={`translate(${CX} ${CY - 20}) scale(${coinShrink})`}>
        <circle r={190 + Math.sin(f / 5) * 12} fill="url(#glowGold)" opacity={0.5} />
        <g transform={`rotate(${f * 3})`}>
          <circle r={118} fill="none" stroke={C.teal} strokeWidth={4} strokeDasharray="70 40 20 40" opacity={0.9} />
        </g>
        <g transform={`rotate(${-f * 4.5})`}>
          <circle r={146} fill="none" stroke={C.cyan} strokeWidth={2.5} strokeDasharray="10 26" opacity={0.8} />
        </g>
        <circle r={80} fill="#1a1405" stroke={C.gold} strokeWidth={6} />
        <circle r={66} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.6} />
        <text y={26} textAnchor="middle" fill={C.gold} fontSize={80} fontWeight={800}>
          $
        </text>
      </g>
      <text
        x={CX}
        y={CY + 190}
        textAnchor="middle"
        fill="#fff"
        fontSize={44}
        fontWeight={800}
        style={{ fontVariantNumeric: "tabular-nums" }}
        opacity={coinShrink}
      >
        $1,000.00
      </text>
      {/* authorisation checkpoints */}
      {STEPS.map((s, i) => {
        const p = prog(f, s.at, s.at + 8);
        const chk = prog(f, s.at + 4, s.at + 12);
        const x = CX + (i - 1) * 400;
        return (
          <g key={s.label} transform={`translate(${x} 790) scale(${0.8 + 0.2 * p})`} opacity={p * coinShrink}>
            <rect x={-170} y={-34} width={340} height={68} rx={34} fill="rgba(9,24,44,0.85)" stroke={C.teal} strokeOpacity={0.6} strokeWidth={2} />
            <circle cx={-128} cy={0} r={20} fill={C.teal} />
            <g transform="translate(-128 0)">
              <Check p={chk} />
            </g>
            <text x={-92} y={9} fill="#fff" fontSize={25} fontWeight={600}>
              {s.label}
            </text>
          </g>
        );
      })}
      {/* burst flare at the end */}
      <circle cx={CX} cy={CY} r={60 + bell(f, T.burst, 5) * 600} fill="url(#glowWhite)" opacity={bell(f, T.burst, 5)} />
    </g>
  );
};
