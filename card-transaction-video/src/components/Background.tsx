import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../theme";

/** Pitch-black base, a faint drifting grid and a soft vignette. Lives for all 9000 frames. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.2) % 80;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: `${drift}px ${drift}px`,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};
