import { AbsoluteFill, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedWords } from "../components/AnimatedWords";
import { SceneFade } from "../components/SceneFade";
import { colors, WIDTH } from "../theme";

const labels = [
  "Reply to emails",
  "Fix bugs 🐛",
  "Update docs",
  "Client call notes",
  "Review PR #42",
  "Plan sprint",
  "Invoice follow-up",
  "Design review",
  "Write release notes",
  "Fix login page",
  "Book meeting",
  "Refactor API",
  "Test checkout",
  "Update roadmap",
  "Triage tickets",
  "Onboard Sam",
];
const tints = [colors.accent, colors.violet, "#F472B6", "#FBBF24", "#38BDF8", colors.success];

const CARD_W = 330;
const CARD_H = 104;

/** Scene 1 (frames 0-90): heavy, clumsy task cards crash down and scatter. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneFade fadeIn={4}>
      <AbsoluteFill style={{ padding: "170px 70px 0" }}>
        <AnimatedWords
          text="Stop wasting hours organizing tasks."
          fontSize={104}
          highlight={["wasting", "hours"]}
        />
      </AbsoluteFill>

      {labels.map((label, i) => {
        // Fixed seeds keep every render identical.
        const targetX = 20 + random(`x-${i}`) * (WIDTH - CARD_W - 40);
        const targetY = 640 + random(`y-${i}`) * 1000;
        const rotation = (random(`r-${i}`) - 0.5) * 40;
        const delay = 10 + i * 3.4;
        const tint = tints[Math.floor(random(`t-${i}`) * tints.length)];

        // Low stiffness + high mass = heavy; low damping = clumsy bounce.
        const fall = spring({
          frame: frame - delay,
          fps,
          config: { mass: 2.6, damping: 10, stiffness: 95 },
        });
        const wobble = spring({
          frame: frame - delay - 6,
          fps,
          config: { mass: 1.4, damping: 6, stiffness: 70 },
        });

        const y = -260 + (targetY + 260) * fall;
        const rot = rotation * wobble + (1 - wobble) * (random(`s-${i}`) - 0.5) * 70;

        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: targetX,
              top: 0,
              width: CARD_W,
              height: CARD_H,
              transform: `translateY(${y}px) rotate(${rot}deg)`,
              zIndex: i,
              borderRadius: 24,
              background: `linear-gradient(135deg, ${colors.card}, #0F1526)`,
              border: `2px solid ${tint}55`,
              boxShadow: `0 24px 50px rgba(0,0,0,0.55), 0 0 28px ${tint}22`,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "0 24px",
            }}
          >
            <div style={{ width: 14, height: 54, borderRadius: 8, background: tint }} />
            <div style={{ fontSize: 33, fontWeight: 700, color: colors.text, letterSpacing: -0.5 }}>{label}</div>
          </div>
        );
      })}
    </SceneFade>
  );
};
