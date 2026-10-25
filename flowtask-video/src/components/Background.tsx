import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../theme";

/** Slowly drifting indigo glows plus a faint grid. Uses the global frame. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 70);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at ${30 + drift * 12}% ${18 + drift * 4}%, ${colors.accent}30, transparent 70%),
                       radial-gradient(900px 900px at ${75 - drift * 10}% ${85 - drift * 4}%, ${colors.violet}22, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${colors.panelBorder}55 1px, transparent 1px), linear-gradient(90deg, ${colors.panelBorder}55 1px, transparent 1px)`,
          backgroundSize: "90px 90px",
          opacity: 0.35,
          maskImage: "radial-gradient(circle at 50% 45%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 45%, black 20%, transparent 75%)",
        }}
      />
    </AbsoluteFill>
  );
};
