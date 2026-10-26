import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { FilmGrain } from "./components/PaperBackground";
import { SceneFrame } from "./components/SceneFrame";
import { sceneRanges, SceneId } from "./data/timing";
import { C } from "./theme";
import { OpeningScene } from "./scenes/OpeningScene";
import { AutomaticYesScene } from "./scenes/AutomaticYesScene";
import { ApprovalScene } from "./scenes/ApprovalScene";
import { DisappearingScene } from "./scenes/DisappearingScene";
import { FirstNoScene } from "./scenes/FirstNoScene";
import { ResolutionScene } from "./scenes/ResolutionScene";
import { FinalScene } from "./scenes/FinalScene";

const SCENES: Record<SceneId, React.FC> = {
  opening: OpeningScene,
  response: AutomaticYesScene,
  approval: ApprovalScene,
  disappearing: DisappearingScene,
  firstNo: FirstNoScene,
  resolution: ResolutionScene,
  final: FinalScene,
};

const FONT_CSS = `
@font-face { font-family: 'Cormorant Garamond'; font-weight: 500; font-style: normal; src: url(${staticFile("fonts/cormorant-500.ttf")}) format('truetype'); }
@font-face { font-family: 'Cormorant Garamond'; font-weight: 600; font-style: normal; src: url(${staticFile("fonts/cormorant-600.ttf")}) format('truetype'); }
@font-face { font-family: 'Cormorant Garamond'; font-weight: 500; font-style: italic; src: url(${staticFile("fonts/cormorant-italic-500.ttf")}) format('truetype'); }
`;

export const Video: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper }}>
    <style>{FONT_CSS}</style>
    {sceneRanges.map((r, k) => {
      const S = SCENES[r.id];
      return (
        <SceneFrame key={r.id} from={r.from} to={r.to} first={k === 0} last={k === sceneRanges.length - 1}>
          <S />
        </SceneFrame>
      );
    })}
    <FilmGrain />
    {/* stems are pre-balanced (music ducked under narration offline, see scripts/synth_audio.py) */}
    <Audio src={staticFile("audio/narration.mp3")} volume={1} />
    <Audio src={staticFile("audio/music.mp3")} volume={1} />
    <Audio src={staticFile("audio/sfx.mp3")} volume={1} />
  </AbsoluteFill>
);
