import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "./components/Background";
import { CallToAction } from "./scenes/CallToAction";
import { Hook } from "./scenes/Hook";
import { Magic } from "./scenes/Magic";
import { ValueDrop } from "./scenes/ValueDrop";
import { colors, font, scenes } from "./theme";

export const MyVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: font, color: colors.text }}>
    <Background />
    <Sequence name="1 · Hook" from={scenes.hook.from} durationInFrames={scenes.hook.duration}>
      <Hook />
    </Sequence>
    <Sequence name="2 · Magic (UI)" from={scenes.magic.from} durationInFrames={scenes.magic.duration}>
      <Magic />
    </Sequence>
    <Sequence name="3 · Value drop" from={scenes.value.from} durationInFrames={scenes.value.duration}>
      <ValueDrop />
    </Sequence>
    <Sequence name="4 · Call to action" from={scenes.cta.from} durationInFrames={scenes.cta.duration}>
      <CallToAction />
    </Sequence>
  </AbsoluteFill>
);
