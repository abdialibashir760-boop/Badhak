import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/** Fades a scene in and out using the frame local to its <Sequence>. */
export const SceneFade: React.FC<{
  children: React.ReactNode;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ children, fadeIn = 6, fadeOut = 8 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeInValue = interpolate(frame, [0, fadeIn], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // fadeOut={0} keeps the scene fully visible until the last frame.
  const fadeOutValue =
    fadeOut > 0
      ? interpolate(frame, [durationInFrames - fadeOut, durationInFrames], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const opacity = fadeInValue * fadeOutValue;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
