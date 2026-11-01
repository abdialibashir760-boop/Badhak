import React from "react";
import { Chip } from "../common/Overlay";
import { Lang, StoryVideo, TL } from "../common/story";
import { LangContext, STRINGS, Strings } from "./i18n";
import { Aftermath, Birds, Brace, Decision, Hook, Landing, Rescue, Setup } from "./scenes";
import * as EN from "./timeline";
import * as DRAFT from "./timeline.draft";

const SCENES = [
  { from: "h1", C: Hook },
  { from: "s1", C: Setup },
  { from: "b1", C: Birds },
  { from: "d1", C: Decision },
  { from: "c1", C: Brace },
  { from: "l1", C: Landing },
  { from: "r1", C: Rescue },
  { from: "e1", C: Aftermath },
];

const DATA = { en: EN, tr: EN }; // Turkish narration not recorded yet
const AUDIO = { en: "hudson.mp3", tr: "hudson.mp3" };

export const hudsonSeconds = (lang: Lang) => DATA[lang].TOTAL_SECONDS;
export type HudsonProps = { lang: Lang; wide: boolean };

const chips = ({ S, E }: TL, L: Strings): Chip[] => [
  { from: S("h2"), to: E("h2"), text: L.chipBoard },
  { from: S("s2"), to: E("s2"), text: L.chipDate },
  { from: S("l1"), to: E("l1"), text: L.chipTime },
  { from: S("r1"), to: E("r1"), text: L.chipFerry },
  { from: S("r4"), to: E("r4"), text: L.chipAll },
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

export const Hudson: React.FC<HudsonProps> = ({ lang, wide }) => (
  <StoryVideo lang={lang} wide={wide} scenes={SCENES} data={DATA} audio={AUDIO} strings={STRINGS} StringsContext={LangContext} chips={chips} endCard={endCard} />
);

/** Preview with a placeholder voice for the lines that have not been recorded yet. */
const DRAFT_DATA = { en: DRAFT, tr: DRAFT };
const DRAFT_AUDIO = { en: "hudson-draft.mp3", tr: "hudson-draft.mp3" };
export const hudsonDraftSeconds = () => DRAFT.TOTAL_SECONDS;
export const HudsonDraft: React.FC<HudsonProps> = ({ lang, wide }) => (
  <StoryVideo lang={lang} wide={wide} scenes={SCENES} data={DRAFT_DATA} audio={DRAFT_AUDIO} strings={STRINGS} StringsContext={LangContext} chips={chips} endCard={endCard} />
);
