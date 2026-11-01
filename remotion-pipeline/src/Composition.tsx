import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

// Safe zones: keep top 15% and bottom 20% clear for YouTube UI.
const SAFE_TOP = HEIGHT * 0.15;
const SAFE_BOTTOM = HEIGHT * 0.2;
const STAGGER = 4; // frames between elements

const LINES = ["Remotion", "Pipeline", "Ready"];

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1f17", opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          top: SAFE_TOP,
          height: HEIGHT - SAFE_TOP - SAFE_BOTTOM,
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
        }}
      >
        {LINES.map((text, i) => {
          const progress = spring({
            frame: frame - i * STAGGER,
            fps,
            config: { damping: 14, stiffness: 120 },
          });
          return (
            <div
              key={text}
              style={{
                color: "#f6f1e7",
                fontFamily: "sans-serif",
                fontSize: 140,
                fontWeight: 800,
                opacity: progress,
                transform: `translateY(${interpolate(progress, [0, 1], [80, 0])}px)`,
              }}
            >
              {text}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
