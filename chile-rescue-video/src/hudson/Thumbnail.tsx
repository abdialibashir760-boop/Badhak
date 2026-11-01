import React from "react";
import { AbsoluteFill } from "remotion";
import type { Lang } from "../common/story";
import { Plane, River, Skyline, font } from "./art";

const COPY = {
  en: { top: "FLIGHT 1549", a: "3½", b: "MINUTES", chip: "155 PEOPLE · 1 RIVER" },
  tr: { top: "UÇUŞ 1549", a: "3,5", b: "DAKİKA", chip: "155 KİŞİ · 1 NEHİR" },
} as const;

const stroke = { stroke: "#050a14", strokeWidth: 16, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };

/** 1280×720 thumbnail (wide=true) or 1080×1920 vertical cover (wide=false). */
export const HudsonThumbnail: React.FC<{ lang: Lang; wide: boolean }> = ({ lang, wide }) => {
  const c = COPY[lang];
  const W = wide ? 1280 : 1080;
  const H = wide ? 720 : 1920;
  const base = wide ? 590 : 1500;
  const planeX = wide ? 920 : 690;
  const planeY = wide ? 330 : 1230;
  return (
    <AbsoluteFill style={{ background: "#0b1626" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="hsky" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={base}>
            <stop offset="0" stopColor="#3f78b5" />
            <stop offset="1" stopColor="#cfe3f3" />
          </linearGradient>
          <linearGradient id="hshade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#050a14" stopOpacity="0.9" />
            <stop offset="1" stopColor="#050a14" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#hsky)" />
        <Skyline base={base} />
        <River top={base} bottom={H} t={0} />
        <Plane x={planeX} y={planeY} s={wide ? 1.15 : 1.05} rot={wide ? -7 : -8} />
        <ellipse cx={planeX - 60} cy={base + (wide ? 60 : 90)} rx={wide ? 190 : 170} ry={20} fill="none" stroke="#eaf6ff" strokeWidth={6} opacity={0.7} />
        <rect width={wide ? 820 : W} height={wide ? H : 1080} fill={wide ? "url(#hshade)" : "none"} />
        {!wide && <rect y={250} width={W} height={820} fill="#050a14" opacity={0.55} />}
        <text x={56} y={wide ? 140 : 380} fontFamily={font} fontWeight={900} fontSize={wide ? 92 : 100} fill="#f2b705" textLength={wide ? 600 : 640} lengthAdjust="spacingAndGlyphs" {...stroke}>
          {c.top}
        </text>
        <text x={56} y={wide ? 370 : 700} fontFamily={font} fontWeight={900} fontSize={wide ? 250 : 330} fill="#fff" textLength={wide ? 340 : 440} lengthAdjust="spacingAndGlyphs" {...stroke}>
          {c.a}
        </text>
        <text x={56} y={wide ? 545 : 930} fontFamily={font} fontWeight={900} fontSize={wide ? 160 : 210} fill="#fff" textLength={wide ? 660 : 900} lengthAdjust="spacingAndGlyphs" {...stroke}>
          {c.b}
        </text>
        <rect x={56} y={wide ? 600 : 1000} width={c.chip.length * (wide ? 25 : 27) + 48} height={wide ? 66 : 72} rx={16} fill="#f2b705" />
        <text x={80} y={wide ? 647 : 1052} fontFamily={font} fontWeight={900} fontSize={wide ? 37 : 41} fill="#14161a" textLength={c.chip.length * (wide ? 25 : 27)} lengthAdjust="spacingAndGlyphs">
          {c.chip}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
