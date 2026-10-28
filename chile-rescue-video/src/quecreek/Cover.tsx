import React from "react";
import { AbsoluteFill } from "remotion";
import type { Lang } from "../common/story";
import { Crew, Dots, font } from "./art";
import { STRINGS } from "./i18n";

const COPY = {
  en: { top: "QUECREEK", a: "NINE", b: "TAPS" },
  tr: { top: "QUECREEK", a: "DOKUZ", b: "VURUŞ" },
} as const;

/** 1080×1920 vertical cover for Shorts / Reels / TikTok. Everything important sits above y≈1560 (clear of the app UI). */
export const QuecreekCover: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  const L = STRINGS[lang];
  const stroke = { stroke: "#0a0705", strokeWidth: 20, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };
  const chip = `${L.chipDepth} · ${L.chipHours}`;
  return (
    <AbsoluteFill style={{ background: "#120d09" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="cbg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a2c20" />
            <stop offset="1" stopColor="#120d09" />
          </linearGradient>
          <radialGradient id="cglow">
            <stop offset="0" stopColor="#ffd88a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd88a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#cbg)" />
        <text x={60} y={380} fontFamily={font} fontWeight={900} fontSize={96} fill="#f2b705" textLength={640} lengthAdjust="spacingAndGlyphs" {...stroke}>
          {c.top}
        </text>
        <text x={60} y={660} fontFamily={font} fontWeight={900} fontSize={290} fill="#ffffff" textLength={lang === "en" ? 700 : 900} lengthAdjust="spacingAndGlyphs" {...stroke}>
          {c.a}
        </text>
        <text x={60} y={950} fontFamily={font} fontWeight={900} fontSize={300} fill="#ffffff" textLength={lang === "en" ? 700 : 900} lengthAdjust="spacingAndGlyphs" {...stroke}>
          {c.b}
        </text>
        <rect x={60} y={1010} width={chip.length * 27 + 52} height={72} rx={18} fill="#f2b705" />
        <text x={86} y={1062} fontFamily={font} fontWeight={900} fontSize={41} fill="#14161a" textLength={chip.length * 27} lengthAdjust="spacingAndGlyphs">
          {chip}
        </text>
        <Dots x={540} y={1180} n={9} lit={9} r={20} gap={60} />
        <rect x={530} y={1210} width={20} height={130} fill="#b9c0ca" />
        <rect x={534} y={1210} width={5} height={130} fill="#eef2f6" />
        <path d="M90 1570 L90 1400 Q540 1250 990 1400 L990 1570 Z" fill="#0b0c0f" stroke="#1d2026" strokeWidth={16} />
        <ellipse cx={540} cy={1420} rx={330} ry={110} fill="url(#cglow)" />
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={540} cy={1352} rx={60 + i * 50} ry={20 + i * 12} fill="none" stroke="#f2b705" strokeWidth={6} opacity={0.75 - i * 0.2} />
        ))}
        <rect x={90} y={1520} width={900} height={50} fill="#3d8fd1" opacity={0.9} />
        <Crew x={254} y={1528} step={68} t={0} crew="b" pose="sit" scale={2.0} />
      </svg>
    </AbsoluteFill>
  );
};
