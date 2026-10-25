import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFade } from "../components/SceneFade";
import { colors } from "../theme";

const Logo: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.26,
      background: `linear-gradient(135deg, ${colors.accent}, ${colors.violet})`,
      boxShadow: `0 0 80px ${colors.accent}88`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3.5" width="5" height="17" rx="1.6" fill="#fff" />
      <rect x="9.5" y="3.5" width="5" height="11" rx="1.6" fill="#fff" opacity="0.85" />
      <rect x="16" y="3.5" width="5" height="6.5" rx="1.6" fill="#fff" opacity="0.7" />
    </svg>
  </div>
);

/** Scene 4 (frames 360-450): logo, pulsating button and the link reminder. */
export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = spring({ frame: frame - 2, fps, config: { damping: 11, stiffness: 120 } });
  const name = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  const button = spring({ frame: frame - 22, fps, config: { damping: 10, stiffness: 130 } });
  const link = spring({ frame: frame - 44, fps, config: { damping: 16 } });

  const pulse = Math.sin((frame - 30) / 5);
  const live = frame > 30 ? 1 : 0;
  const buttonScale = (0.6 + 0.4 * button) * (1 + 0.045 * pulse * live);
  const glowSize = 40 + 36 * (0.5 + 0.5 * pulse) * live;
  const ring = interpolate((frame - 30) % 36, [0, 36], [0, 1]);

  return (
    <SceneFade fadeIn={4} fadeOut={0}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, marginTop: -140 }}>
          <div style={{ transform: `scale(${logo}) rotate(${(1 - logo) * -25}deg)`, opacity: logo }}>
            <Logo size={230} />
          </div>
          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: -3,
              opacity: name,
              transform: `translateY(${(1 - name) * 40}px)`,
            }}
          >
            Flow<span style={{ color: colors.accentSoft }}>Task</span> AI
          </div>

          <div style={{ position: "relative", marginTop: 90 }}>
            {frame > 30 && (
              <div
                style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: 999,
                  border: `4px solid ${colors.accentSoft}`,
                  opacity: (1 - ring) * 0.7,
                  transform: `scale(${1 + ring * 0.35})`,
                }}
              />
            )}
            <div
              style={{
                padding: "42px 96px",
                borderRadius: 999,
                fontSize: 62,
                fontWeight: 800,
                letterSpacing: -1,
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.violet})`,
                boxShadow: `0 0 ${glowSize}px ${colors.accent}, 0 24px 60px rgba(0,0,0,0.5)`,
                opacity: Math.min(1, button * 1.5),
                transform: `scale(${buttonScale})`,
                whiteSpace: "nowrap",
              }}
            >
              Try FlowTask Free
            </div>
          </div>

          <div
            style={{
              marginTop: 40,
              fontSize: 54,
              fontWeight: 600,
              color: colors.muted,
              opacity: link,
              transform: `translateY(${(1 - link) * 30}px)`,
            }}
          >
            Link in description. ↓
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};
