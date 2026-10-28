import React from "react";
import { Chip } from "../common/Overlay";
import { Lang, StoryVideo, TL } from "../common/story";
import { LangContext, STRINGS, Strings } from "./i18n";
import { Drill, Flood, Hook, Recap, Rescue, Setback, Setting, Super, Taps } from "./scenes";
import * as EN from "./timeline";
import * as TR from "./timeline.tr";
import * as ENS from "./timeline.short";
import * as TRS from "./timeline.short.tr";

const SCENES = [
  { from: "h1", C: Hook },
  { from: "s1", C: Setting },
  { from: "f1", C: Flood },
  { from: "d1", C: Drill },
  { from: "p1", C: Taps },
  { from: "b1", C: Setback },
  { from: "g1", C: Super },
  { from: "r1", C: Rescue },
  { from: "r6", C: Recap },
];

const DATA = { en: EN, tr: TR };
const AUDIO = { en: "quecreek.mp3", tr: "quecreek-tr.mp3" };

export const quecreekSeconds = (lang: Lang) => DATA[lang].TOTAL_SECONDS;
export type QuecreekProps = { lang: Lang; wide: boolean };

const chips = ({ S, E }: TL, L: Strings): Chip[] => [
  { from: S("s2"), to: E("s2"), text: L.chipJul24 },
  { from: S("f3"), to: E("f3"), text: L.chipDepth },
  { from: S("d3"), to: E("d3"), text: L.chipJul25 },
  { from: S("b2"), to: E("b2"), text: L.chipJul26 },
  { from: S("g1"), to: E("g1"), text: L.chipJul27 },
  { from: S("r3"), to: E("r3"), text: L.chipJul28 },
  { from: S("r4"), to: E("r4"), text: L.chipHours },
];

const endCard = (L: Strings, wide: boolean) => (
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

export const Quecreek: React.FC<QuecreekProps> = ({ lang, wide }) => (
  <StoryVideo lang={lang} wide={wide} scenes={SCENES} data={DATA} audio={AUDIO} strings={STRINGS} StringsContext={LangContext} chips={chips} endCard={endCard} flashAt={({ S }) => S("f1") - 0.1} />
);

/** Short cut (~55 s, 9:16 only): same scenes, condensed script. See scripts/stories/quecreek_short.py. */
const SHORT_DATA = { en: ENS, tr: TRS };
const SHORT_AUDIO = { en: "quecreek-short.mp3", tr: "quecreek-short-tr.mp3" };
export const quecreekShortSeconds = (lang: Lang) => SHORT_DATA[lang].TOTAL_SECONDS;
export const QuecreekShort: React.FC<{ lang: Lang }> = ({ lang }) => (
  <StoryVideo lang={lang} wide={false} scenes={SCENES} data={SHORT_DATA} audio={SHORT_AUDIO} strings={STRINGS} StringsContext={LangContext} chips={chips} endCard={endCard} flashAt={({ S }) => S("f1") - 0.1} />
);
