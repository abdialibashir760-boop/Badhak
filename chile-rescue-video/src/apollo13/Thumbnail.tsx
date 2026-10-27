import React from "react";
import { AbsoluteFill } from "remotion";
import { Earth, Moon, Plume, Space, Stack } from "./art";
import { Lang, STRINGS } from "./i18n";

const font = "Inter, 'Helvetica Neue', Arial, sans-serif";
const COPY = {
  en: { top: "APOLLO 13", a: "THE", b: "BANG" },
  tr: { top: "APOLLO 13", a: "BİR", b: "PATLAMA" },
} as const;

/** 1280×720 YouTube thumbnail. High contrast, three words, readable at 168 px wide. */
export const Thumbnail: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  const L = STRINGS[lang];
  const stroke = { stroke: "#05070f", strokeWidth: 16, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };
  return (
    <AbsoluteFill style={{ background: "#05070f" }}>
      <svg width={1280} height={720} viewBox="0 0 1280 720">
        <defs>
          <radialGradient id="burst">
            <stop offset="0" stopColor="#fff7c2" />
            <stop offset="0.45" stopColor="#ffb347" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ff5a2a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <Space t={0.4} top="#02030a" bottom="#101a3a" />
        <Earth x={1060} y={800} r={400} t={0} uid="th" />
        <Moon x={1180} y={92} r={64} uid="thm" />
        <g transform="translate(1180 92)">
          <line x1={-56} y1={-56} x2={56} y2={56} stroke="#e5352b" strokeWidth={14} strokeLinecap="round" />
          <line x1={56} y1={-56} x2={-56} y2={56} stroke="#e5352b" strokeWidth={14} strokeLinecap="round" />
        </g>
        <g transform="translate(900 360) rotate(24) scale(1.1)">
          <circle cx={62} cy={95} r={120} fill="url(#burst)" />
          <Stack x={0} y={0} />
          <Plume x={62} y={95} dx={330} dy={40} t={0.37} n={30} size={20} spread={110} speed={1} />
          <path d="M62 40 L74 84 L118 95 L74 106 L62 150 L50 106 L6 95 L50 84 Z" fill="#fff7c2" />
        </g>
        <text x={56} y={150} fontFamily={font} fontWeight={900} fontSize={104} fill="#f2b705" textLength={640} lengthAdjust="spacingAndGlyphs" {...stroke}>
          {c.top}
        </text>
        <text x={56} y={318} fontFamily={font} fontWeight={900} fontSize={150} fill="#ffffff" textLength={lang === "en" ? 300 : 230} lengthAdjust="spacingAndGlyphs" {...stroke}>
          {c.a}
        </text>
        <text x={56} y={520} fontFamily={font} fontWeight={900} fontSize={lang === "en" ? 230 : 190} fill="#ffffff" textLength={650} lengthAdjust="spacingAndGlyphs" {...stroke}>
          {c.b}
        </text>
        <rect x={56} y={596} width={L.chipDist.length * 25 + 48} height={66} rx={16} fill="#f2b705" />
        <text x={80} y={643} fontFamily={font} fontWeight={900} fontSize={37} fill="#14161a" textLength={L.chipDist.length * 25} lengthAdjust="spacingAndGlyphs">
          {L.chipDist}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
