import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

/** Headline whose words spring up one after another. */
export const AnimatedWords: React.FC<{
  text: string;
  fontSize?: number;
  delay?: number;
  stagger?: number;
  highlight?: string[];
  align?: "center" | "left";
}> = ({ text, fontSize = 96, delay = 0, stagger = 4, highlight = [], align = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: fontSize * 0.28,
        rowGap: fontSize * 0.08,
        fontSize,
        fontWeight: 800,
        lineHeight: 1.08,
        letterSpacing: -2,
        textAlign: align,
      }}
    >
      {words.map((word, i) => {
        const p = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 14, stiffness: 120, mass: 0.7 },
        });
        const clean = word.replace(/[.,!?]/g, "");
        const isHighlight = highlight.includes(clean);
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              opacity: Math.min(1, p * 1.6),
              transform: `translateY(${(1 - p) * 60}px) scale(${0.85 + p * 0.15})`,
              color: isHighlight ? colors.accentSoft : colors.text,
              textShadow: isHighlight ? `0 0 40px ${colors.accent}aa` : "none",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
