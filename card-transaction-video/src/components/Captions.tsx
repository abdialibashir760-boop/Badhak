import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

export interface CaptionItem {
  from: number;
  to: number;
  text: string;
  kicker?: string;
  color?: string;
}

/** Splits a time window evenly between several lines of text. */
export function slices(from: number, to: number, texts: string[], kicker?: string, color?: string): CaptionItem[] {
  const step = (to - from) / texts.length;
  return texts.map((text, i) => ({ from: from + i * step, to: from + (i + 1) * step, text, kicker, color }));
}

/** Shows whichever caption is active (frames are local to the surrounding Sequence). */
export const Captions: React.FC<{ items: CaptionItem[]; top?: number; height?: number; size?: number }> = ({
  items,
  top = 930,
  height = 130,
  size = 40,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const item = items.find((i) => frame >= i.from && frame < i.to);
  if (!item) return null;

  const enter = spring({ frame: frame - item.from, fps, config: { damping: 18, stiffness: 140 } });
  const exit = interpolate(frame, [item.to - 10, item.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        top,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        opacity: Math.min(1, enter * 1.4) * exit,
        transform: `translateY(${(1 - enter) * 22}px)`,
      }}
    >
      {item.kicker && (
        <div style={{ fontSize: size * 0.5, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", color: item.color ?? colors.muted, marginBottom: 6 }}>
          {item.kicker}
        </div>
      )}
      <div style={{ fontSize: size, fontWeight: 650, lineHeight: 1.18, color: colors.text, textShadow: "0 2px 18px rgba(0,0,0,0.9)" }}>{item.text}</div>
    </div>
  );
};
