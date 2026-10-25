import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, font, mono } from "../theme";

/** Centre panel between the cards: a big number on the left, a ticking checklist on the right. */
export const Hub: React.FC<{
  label: string;
  value: string;
  sub?: string;
  color: string;
  checklistTitle?: string;
  items?: string[];
  progress?: number;
  opacity?: number;
  placeholder?: string;
}> = ({ label, value, sub, color, checklistTitle, items, progress = 0, opacity = 1, placeholder }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = items?.length ?? 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 480,
        top: 385,
        width: 960,
        height: 230,
        boxSizing: "border-box",
        borderRadius: 28,
        display: "flex",
        opacity,
        background: "rgba(255,255,255,0.035)",
        border: `1.5px solid ${colors.glassBorder}`,
        fontFamily: font,
        color: colors.text,
        overflow: "hidden",
      }}
    >
      <div style={{ width: 400, padding: "26px 34px", borderRight: `1.5px solid ${colors.glassBorder}`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 19, letterSpacing: 3, fontWeight: 800, color: colors.muted }}>{label}</div>
        <div style={{ fontFamily: mono, fontSize: 60, fontWeight: 800, lineHeight: 1.1, marginTop: 6, color, textShadow: `0 0 28px ${color}88`, fontVariantNumeric: "tabular-nums" }}>{value}</div>
        {sub && <div style={{ fontSize: 22, color: colors.muted, marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ flex: 1, padding: "22px 30px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {checklistTitle && <div style={{ fontSize: 21, fontWeight: 800, color, letterSpacing: 1, marginBottom: 8 }}>{checklistTitle}</div>}
        {!items && placeholder && <div style={{ fontSize: 30, fontWeight: 600, color: colors.muted, lineHeight: 1.3 }}>{placeholder}</div>}
        {items?.map((item, i) => {
          const start = (i + 0.15) / n;
          const done = progress >= start + 0.12;
          const appear = interpolate(progress, [start - 0.05, start + 0.05], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const pop = spring({ frame: frame - Math.round(start * 100), fps, config: { damping: 20 } });
          return (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 14, height: 42, opacity: 0.25 + 0.75 * appear, transform: `translateX(${(1 - appear) * 14}px)`, fontSize: 27, fontWeight: 600 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 99,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: done ? color : "transparent",
                  border: `2px solid ${done ? color : colors.muted}`,
                  color: "#05070B",
                  fontSize: 18,
                  fontWeight: 900,
                  transform: `scale(${done ? 0.9 + 0.1 * pop : 1})`,
                }}
              >
                {done ? "✓" : ""}
              </div>
              <span style={{ whiteSpace: "nowrap" }}>{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
