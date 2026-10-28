import React from "react";
import { Chip } from "../common/Overlay";
import { Lang, StoryVideo, TL } from "../common/story";
import { LangContext, STRINGS, Strings } from "./i18n";
import { Alarm, Bang, Crew, Cruise, Launch, Tank } from "./scenesA";
import { Cabin, Capacity, Dock, Ground, Path, Reentry, Scrub, Sep, Splash, Wait } from "./scenesB";
import * as EN from "./timeline";
import * as TR from "./timeline.tr";

const SCENES = [
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

const DATA = { en: EN, tr: TR };
const AUDIO = { en: "apollo13.mp3", tr: "apollo13-tr.mp3" };

export const apollo13Seconds = (lang: Lang) => DATA[lang].TOTAL_SECONDS;
export type Apollo13Props = { lang: Lang; wide: boolean };

const chips = ({ S, E }: TL, L: Strings): Chip[] => [
  { from: S("h1"), to: E("h1"), text: L.chipDist },
  { from: S("s2"), to: E("s2"), text: L.chipApr11 },
  { from: S("e1"), to: E("e1"), text: L.chipApr13 },
  { from: S("l3"), to: E("l3"), text: L.men2 },
  { from: S("l4"), to: E("l4"), text: L.men3 },
  { from: S("r9"), to: E("r9"), text: L.chipApr17 },
  { from: S("r10"), to: E("r10"), text: L.chipAlive },
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

export const Apollo13: React.FC<Apollo13Props> = ({ lang, wide }) => (
  <StoryVideo lang={lang} wide={wide} scenes={SCENES} data={DATA} audio={AUDIO} strings={STRINGS} StringsContext={LangContext} chips={chips} endCard={endCard} flashAt={({ S }) => S("e2") + 0.1} />
);
