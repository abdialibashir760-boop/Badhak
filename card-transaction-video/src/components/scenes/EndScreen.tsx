import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, font } from "../../theme";

const Placeholder: React.FC<{ x: number; label: string; delay: number }> = ({ x, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 430,
        width: 480,
        height: 270,
        borderRadius: 24,
        border: `3px dashed ${colors.glassBorder}`,
        background: "rgba(255,255,255,0.03)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
      }}
    >
      <svg width="64" height="64" viewBox="0 0 24 24" fill={colors.muted}>
        <path d="M8 5v14l11-7z" />
      </svg>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 3, color: colors.muted }}>{label}</div>
    </div>
  );
};

/** YouTube end screen: dark overlay, headline, pulsing SUBSCRIBE and two slots for suggested videos. Frames are local to its Sequence. */
export const EndScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fade = interpolate(frame, [0, 45], [0, 1], { extrapolateRight: "clamp" });
  const title = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  const button = spring({ frame: frame - 30, fps, config: { damping: 9, stiffness: 120 } });
  // slow pulse: one full beat every ~2.7 seconds
  const beat = 0.5 + 0.5 * Math.sin((frame / 80) * Math.PI * 2);
  const pulse = 1 + 0.06 * beat;
  const glow = 40 + 60 * beat;

  return (
    <AbsoluteFill style={{ opacity: fade, fontFamily: font }}>
      <AbsoluteFill style={{ background: "rgba(5,7,11,0.55)" }} />

      <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center", opacity: title, transform: `translateY(${(1 - title) * 40}px)` }}>
        <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -2, color: colors.text }}>Thanks for watching!</div>
        <div style={{ fontSize: 38, fontWeight: 600, color: colors.muted, marginTop: 12 }}>More explainers on how money really moves.</div>
      </div>

      <Placeholder x={150} label="WATCH NEXT" delay={20} />
      <Placeholder x={1290} label="WATCH NEXT" delay={30} />

      <div
        style={{
          position: "absolute",
          left: 960 - 270,
          top: 440,
          width: 540,
          height: 150,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "linear-gradient(135deg, #FF2D2D, #D90000)",
          color: "#fff",
          fontSize: 64,
          fontWeight: 900,
          letterSpacing: 4,
          boxShadow: `0 0 ${glow}px rgba(255,40,40,0.9), 0 20px 60px rgba(0,0,0,0.6)`,
          border: "3px solid rgba(255,255,255,0.35)",
          opacity: Math.min(1, button * 1.6),
          transform: `scale(${(0.4 + 0.6 * button) * pulse})`,
        }}
      >
        <svg width="70" height="70" viewBox="0 0 24 24" fill="#fff">
          <path d="M12 2a6 6 0 0 0-6 6v3.6c0 .9-.3 1.8-.9 2.5L3.6 16.5c-.5.6-.1 1.5.7 1.5h15.4c.8 0 1.2-.9.7-1.5l-1.5-2.4a4 4 0 0 1-.9-2.5V8a6 6 0 0 0-6-6zM9.8 19.5a2.3 2.3 0 0 0 4.4 0z" />
        </svg>
        SUBSCRIBE
      </div>
      <div style={{ position: "absolute", top: 760, left: 0, right: 0, textAlign: "center", fontSize: 34, fontWeight: 600, color: colors.muted, opacity: interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        New videos every week
      </div>
    </AbsoluteFill>
  );
};
