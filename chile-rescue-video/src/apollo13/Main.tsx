import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Chip, LANDSCAPE, Overlay, PORTRAIT } from "../common/Overlay";
import { FPS, clamp } from "../common/math";
import { LangContext, Lang, STRINGS } from "./i18n";
import { Alarm, Bang, Crew, Cruise, Launch, Tank } from "./scenesA";
import { Cabin, Capacity, Dock, Ground, Path, Reentry, Scrub, Sep, Splash, Wait } from "./scenesB";
import * as EN from "./timeline";
import * as TR from "./timeline.tr";
import { TLContext, makeTL } from "./time";

type SceneDef = { from: string; C: React.FC<{ t: number }> };

/** Scenes in order. Each starts just before its first narration line and crossfades into the next. */
const SCENES: SceneDef[] = [
  { from: "h1", C: Bang },
  { from: "s1", C: Launch },
  { from: "s4", C: Crew },
  { from: "s7", C: Cruise },
  { from: "e1", C: Tank },
  { from: "e4", C: Alarm },
  { from: "l1", C: Dock },
  { from: "l3", C: Capacity },
  { from: "l5", C: Cabin },
  { from: "t1", C: Path },
  { from: "c1", C: Scrub },
  { from: "r1", C: Ground },
  { from: "r3", C: Sep },
  { from: "r5", C: Reentry },
  { from: "r7", C: Wait },
  { from: "r8", C: Splash },
];

const XFADE = 0.35;
const DATA = { en: EN, tr: TR } as const;
const AUDIO = { en: "apollo13.mp3", tr: "apollo13-tr.mp3" } as const;

/** Scenes are drawn in a 1080×1920 design space. For 16:9 the art zone (design y 320–1240) is scaled and centred. */
const WIDE_K = 0.9;
const WIDE_TOP = 75; // screen y where design y 320 lands
const WIDE_TRANSFORM = `translate(${960 - 540 * WIDE_K} ${WIDE_TOP - 320 * WIDE_K}) scale(${WIDE_K})`;

export const apollo13Seconds = (lang: Lang) => DATA[lang].TOTAL_SECONDS;

export type Apollo13Props = { lang: Lang; wide: boolean };

export const Apollo13: React.FC<Apollo13Props> = ({ lang, wide }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const d = DATA[lang];
  const tl = useMemo(() => makeTL(d.LINES), [d]);
  const L = STRINGS[lang];
  const starts = useMemo(() => SCENES.map((s, i) => (i === 0 ? 0 : tl.S(s.from) - 0.25)), [tl]);
  const { S, E } = tl;

  const chips: Chip[] = [
    { from: S("h1"), to: E("h1"), text: L.chipDist },
    { from: S("s2"), to: E("s2"), text: L.chipApr11 },
    { from: S("e1"), to: E("e1"), text: L.chipApr13 },
    { from: S("l3"), to: E("l3"), text: L.men2 },
    { from: S("l4"), to: E("l4"), text: L.men3 },
    { from: S("r9"), to: E("r9"), text: L.chipApr17 },
    { from: S("r10"), to: E("r10"), text: L.chipAlive },
  ];
  const endCard = (
    <>
      <div style={{ fontSize: 34, letterSpacing: 8, color: "#9aa7b8", fontWeight: 700 }}>{L.endKicker}</div>
      <div style={{ fontSize: wide ? 96 : 110, fontWeight: 900, color: "#fff", lineHeight: 1.05, textAlign: "center" }}>
        {L.endTitleA}
        <br />
        {L.endTitleB}
      </div>
      <div style={{ fontSize: 44, color: "#f2b705", fontWeight: 800, letterSpacing: 2 }}>{L.endSub}</div>
      <div style={{ marginTop: wide ? 16 : 40, fontSize: 56, fontWeight: 900, color: "#14161a", background: "#f2b705", padding: "20px 64px", borderRadius: 999 }}>{L.endCta}</div>
    </>
  );

  const flash = 0.85 * Math.max(0, 1 - clamp((t - (S("e2") + 0.1)) / 0.45)) * (t >= S("e2") + 0.1 ? 1 : 0);
  const [w, h] = wide ? [1920, 1080] : [1080, 1920];

  return (
    <AbsoluteFill style={{ background: "#05070f" }}>
      <TLContext.Provider value={tl}>
        <LangContext.Provider value={L}>
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0 }}>
            <g transform={wide ? WIDE_TRANSFORM : undefined}>
              {SCENES.map(({ C }, i) => {
                const a0 = starts[i];
                const a1 = i + 1 < SCENES.length ? starts[i + 1] : Infinity;
                if (t < a0 || t > a1 + XFADE) return null;
                const fin = i === 0 ? 1 : clamp((t - a0) / XFADE);
                const fout = t < a1 ? 1 : 1 - clamp((t - a1) / XFADE);
                return (
                  <g key={i} opacity={fin * fout}>
                    <C t={t} />
                  </g>
                );
              })}
            </g>
          </svg>
        </LangContext.Provider>
      </TLContext.Provider>
      <Overlay t={t} flash={flash} lines={d.LINES} chips={chips} narrationEnd={d.NARRATION_END} tag={L.tag} endCard={endCard} layout={wide ? LANDSCAPE : PORTRAIT} />
      <Audio src={staticFile(AUDIO[lang])} />
    </AbsoluteFill>
  );
};
