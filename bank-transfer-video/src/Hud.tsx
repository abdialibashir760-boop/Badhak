import React from "react";
import { useCurrentFrame } from "remotion";
import { C, DURATION, FONT, H, W } from "./theme";
import { bell, prog } from "./math";

const STEPS = [
  { from: 0, to: 60, n: "01", title: "INITIATE", text: "You approve a $1,000 payment in your banking app." },
  { from: 60, to: 150, n: "02", title: "AUTHORISE", text: "Your bank encrypts the request and checks your funds." },
  { from: 150, to: 240, n: "03", title: "CLEAR", text: "Your bank debits you and routes the payment through the clearing network." },
  { from: 240, to: DURATION, n: "04", title: "SETTLE", text: "The receiving bank credits the account and the balance updates." },
];

const LEFT = 96;
const BAR_W = W - LEFT * 2;

export const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const intro = prog(f, 0, 14);
  return (
    <g fontFamily={FONT}>
      {/* lower gradient for legibility */}
      <rect x={0} y={H - 260} width={W} height={260} fill="url(#vigBottom)" />
      <rect width={W} height={H} fill="url(#vignette)" />

      {/* eyebrow */}
      <g opacity={intro}>
        <circle cx={LEFT + 8} cy={78} r={7} fill={C.teal} opacity={0.6 + 0.4 * Math.sin(f / 5)} />
        <text x={LEFT + 30} y={86} fill={C.mute} fontSize={24} fontWeight={600} letterSpacing={6}>
          HOW MONEY MOVES BETWEEN BANKS
        </text>
      </g>

      {/* step caption */}
      {STEPS.map((s, i) => {
        const last = i === STEPS.length - 1;
        const inP = prog(f, s.from, s.from + 12);
        const outP = last ? 0 : prog(f, s.to - 8, s.to);
        const o = f >= s.from && f < s.to + (last ? 1 : 0) ? inP * (1 - outP) : 0;
        if (o <= 0) return null;
        return (
          <g key={s.n} opacity={o} transform={`translate(0 ${(1 - inP) * 14})`}>
            <text x={LEFT} y={956} fill={C.teal} fontSize={30} fontWeight={800} letterSpacing={4}>
              {s.n}
            </text>
            <text x={LEFT + 62} y={956} fill="#fff" fontSize={30} fontWeight={800} letterSpacing={6}>
              {s.title}
            </text>
            <text x={LEFT} y={1006} fill={C.text} fontSize={38} fontWeight={500}>
              {s.text}
            </text>
          </g>
        );
      })}

      {/* segmented progress */}
      {STEPS.map((s, i) => {
        const gap = 14;
        const total = BAR_W - gap * 3;
        const unit = total / DURATION;
        const x = LEFT + s.from * unit + i * gap;
        const w = (s.to - s.from) * unit;
        const p = prog(f, s.from, s.to);
        return (
          <g key={s.n}>
            <rect x={x} y={1042} width={w} height={6} rx={3} fill="rgba(255,255,255,0.12)" />
            <rect x={x} y={1042} width={w * p} height={6} rx={3} fill={C.teal} />
          </g>
        );
      })}

      {/* fade in from black at the very start */}
      <rect width={W} height={H} fill="#000" opacity={1 - prog(f, 0, 10)} />
      {/* soft cut-to-black at the very end is intentionally omitted: final frame holds */}
      <circle cx={0} cy={0} r={0} opacity={bell(f, 0, 1)} />
    </g>
  );
};
