import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Background } from "./components/Background";
import { Scene1TapZoom } from "./components/scenes/Scene1TapZoom";
import { Scene2Architecture } from "./components/scenes/Scene2Architecture";
import { Scene3Relay } from "./components/scenes/Scene3Relay";
import { Scene4Settlement } from "./components/scenes/Scene4Settlement";
import { colors, font, scenes } from "./theme";

/**
 * Master composition: "How a Credit Card Transaction Clears in 2 Seconds".
 * 9000 frames at 30 fps = 5:00. The voice-over file public/voiceover.mp3 plays across the whole timeline.
 */
export const CardTransactionMaster: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: font, color: colors.text }}>
    <Audio src={staticFile("voiceover.mp3")} />
    <Background />

    <Sequence name="Scene 1 · The tap & digital zoom" from={scenes.tap.from} durationInFrames={scenes.tap.duration}>
      <Scene1TapZoom />
    </Sequence>
    <Sequence name="Scene 2 · The 4-node architecture" from={scenes.architecture.from} durationInFrames={scenes.architecture.duration}>
      <Scene2Architecture />
    </Sequence>
    <Sequence name="Scene 3 · The high-speed relay race" from={scenes.relay.from} durationInFrames={scenes.relay.duration}>
      <Scene3Relay />
    </Sequence>
    <Sequence name="Scene 4 · Settlement & outro" from={scenes.settlement.from} durationInFrames={scenes.settlement.duration}>
      <Scene4Settlement />
    </Sequence>
  </AbsoluteFill>
);
