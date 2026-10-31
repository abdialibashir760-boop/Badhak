import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, Scene, Tag } from "./script";

const font =
  '"Montserrat", "Helvetica Neue", Arial, system-ui, -apple-system, sans-serif';
const mono = '"SF Mono", "Courier New", ui-monospace, monospace';

export const Chip: React.FC<{ side: Scene["side"]; clock?: string }> = ({
  side,
  clock,
}) => {
  if (side === "title" || side === "outro") return null;
  const crim = side === "criminal";
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 60,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 26px",
        borderRadius: 999,
        background: "rgba(10,14,24,0.72)",
        border: "2px solid rgba(255,255,255,0.18)",
        fontFamily: mono,
        fontSize: 30,
        letterSpacing: 2,
        color: COLORS.white,
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 99,
          background: crim ? COLORS.red : COLORS.blue,
        }}
      />
      {crim ? `THE CRIMINAL · ${clock ?? ""}` : "THE DETECTIVES"}
    </div>
  );
};

const tagColor = (c: Tag["color"]) => COLORS[c];

export const TagLabel: React.FC<{ tag: Tag; sceneFrames: number }> = ({
  tag,
  sceneFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = Math.round(tag.at * sceneFrames);
  const s = spring({ frame: frame - start, fps, config: { damping: 14 } });
  if (frame < start) return null;
  const dark = tag.color === "yellow";
  return (
    <div
      style={{
        position: "absolute",
        top: tag.y,
        left: tag.x ?? 540,
        transform: `translateX(-50%) scale(${0.6 + 0.4 * s})`,
        opacity: s,
        padding: "16px 34px",
        borderRadius: 14,
        background: tagColor(tag.color),
        color: dark ? "#1a1400" : COLORS.white,
        fontFamily: font,
        fontWeight: 800,
        fontSize: 40,
        letterSpacing: 1,
        whiteSpace: "nowrap",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
      }}
    >
      {tag.text}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "100%",
          width: 3,
          height: 80 * s,
          background: COLORS.white,
        }}
      />
    </div>
  );
};

export const Captions: React.FC<{ scene: Scene; sceneFrames: number }> = ({
  scene,
  sceneFrames,
}) => {
  const frame = useCurrentFrame();
  const words = scene.text.split(/\s+/);
  const per = sceneFrames / words.length;
  const idx = Math.min(words.length - 1, Math.floor(frame / per));
  const w = words[idx];
  const local = frame - idx * per;
  const pop = interpolate(local, [0, 4], [0.82, 1], {
    extrapolateRight: "clamp",
  });
  const hl = (scene.highlight ?? []).some(
    (h) => h.toLowerCase() === w.toLowerCase(),
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1380,
        textAlign: "center",
        fontFamily: font,
        fontWeight: 900,
        fontSize: 120,
        textTransform: "uppercase",
        color: hl ? COLORS.yellow : COLORS.white,
        transform: `scale(${pop})`,
        textShadow: "0 6px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.6)",
        padding: "0 40px",
      }}
    >
      {w.replace(/[.,]/g, "")}
    </div>
  );
};

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: font,
        opacity: s,
        transform: `translateY(${(1 - s) * -30}px)`,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "10px 30px",
          borderRadius: 999,
          border: `2px solid ${COLORS.yellow}`,
          color: COLORS.yellow,
          fontFamily: mono,
          fontSize: 30,
          letterSpacing: 3,
        }}
      >
        CASE FILE #07
      </div>
      <div
        style={{
          marginTop: 26,
          fontWeight: 900,
          fontSize: 150,
          color: COLORS.yellow,
          textShadow: "0 8px 0 rgba(0,0,0,0.5)",
        }}
      >
        REPAIRED?
      </div>
    </div>
  );
};
