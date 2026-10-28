import React from "react";
import { AbsoluteFill } from "remotion";
import type { Lang } from "../common/story";
import { Crew, Dots, font } from "./art";
import { STRINGS } from "./i18n";

const COPY = {
  en: { top: "QUECREEK", a: "NINE", b: "TAPS" },
  tr: { top: "QUECREEK", a: "DOKUZ", b: "VURUŞ" },
} as const;

/** 1280×720 thumbnail: nine taps from a flooded mine. Three big words, readable small. */
export const QuecreekThumbnail: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  const L = STRINGS[lang];
  const stroke = { stroke: "#0a0705", strokeWidth: 16, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };
  const chip = `${L.chipDepth} · ${L.chipHours}`;
  return (
    <AbsoluteFill style={{ background: "#120d09" }}>
      <svg width={1280} height={720} viewBox="0 0 1280 720">
        <defs>
          <linearGradient id="qbg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a2c20" />
            <stop offset="1" stopColor="#120d09" />
          </linearGradient>
          <radialGradient id="qglow">
            <stop offset="0" stopColor="#ffd88a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd88a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={1280} height={720} fill="url(#qbg)" />
        {/* the air pocket */}
        <path d="M660 720 L660 470 Q950 330 1250 470 L1250 720 Z" fill="#0b0c0f" stroke="#1d2026" strokeWidth={16} />
        <ellipse cx={955} cy={500} rx={260} ry={130} fill="url(#qglow)" />
        <rect x={660} y={640} width={600} height={90} fill="#3d8fd1" opacity={0.9} />
        <rect x={660} y={640} width={600} height={8} fill="#8ccaf5" />
        <Crew x={715} y={650} step={58} t={0} crew="b" pose="sit" scale={1.75} />
        {/* the pipe and nine taps */}
        <rect x={946} y={0} width={20} height={500} fill="#b9c0ca" />
        <rect x={950} y={0} width={5} height={500} fill="#eef2f6" />
        <rect x={930} y={490} width={52} height={16} fill="#8d95a0" />
        <Dots x={956} y={78} n={9} lit={9} r={17} gap={50} />
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={956} cy={520} rx={60 + i * 55} ry={22 + i * 14} fill="none" stroke="#f2b705" strokeWidth={6} opacity={0.75 - i * 0.2} />
        ))}
        <text x={56} y={150} fontFamily={font} fontWeight={900} fontSize={96} fill="#f2b705" textLength={560} lengthAdjust="spacingAndGlyphs" {...stroke}>
          {c.top}
        </text>
        <text x={56} y={330} fontFamily={font} fontWeight={900} fontSize={190} fill="#ffffff" textLength={lang === "en" ? 420 : 520} lengthAdjust="spacingAndGlyphs" {...stroke}>
          {c.a}
        </text>
        <text x={56} y={530} fontFamily={font} fontWeight={900} fontSize={200} fill="#ffffff" textLength={lang === "en" ? 430 : 560} lengthAdjust="spacingAndGlyphs" {...stroke}>
          {c.b}
        </text>
        <rect x={56} y={596} width={chip.length * 25 + 48} height={66} rx={16} fill="#f2b705" />
        <text x={80} y={643} fontFamily={font} fontWeight={900} fontSize={37} fill="#14161a" textLength={chip.length * 25} lengthAdjust="spacingAndGlyphs">
          {chip}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
