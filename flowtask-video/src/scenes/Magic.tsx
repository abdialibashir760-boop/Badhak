import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedWords } from "../components/AnimatedWords";
import { SceneFade } from "../components/SceneFade";
import { colors } from "../theme";

// ---- Board geometry (all in video pixels) ----
const COL_W = 320;
const COL_X = [40, 380, 720];
const BOARD_Y = 400;
const BOARD_H = 780;
const FIRST_CARD_Y = 505;
const SLOT = 130;
const CARD_W = 280;
const CARD_H = 112;
const cardX = (col: number) => COL_X[col] + (COL_W - CARD_W) / 2;
const cardY = (slot: number) => FIRST_CARD_Y + slot * SLOT;

// ---- Timeline (frames local to this scene) ----
const CURSOR_ARRIVES = 50;
const GRAB = 56;
const DRAG_START = 64;
const DROP = 110;
const SORTED = 112;

const columns = ["To Do", "In Progress", "Done"];

type Card = { label: string; col: number; slot: number; tint: string };
const staticCards: Card[] = [
  { label: "Write release notes", col: 0, slot: 1, tint: "#FBBF24" },
  { label: "Review PR #42", col: 0, slot: 2, tint: "#38BDF8" },
  { label: "Design onboarding", col: 1, slot: 0, tint: colors.violet },
  { label: "Update API docs", col: 1, slot: 1, tint: "#F472B6" },
  { label: "Set up CI", col: 2, slot: 0, tint: colors.success },
];

const Cursor: React.FC<{ x: number; y: number; scale: number; opacity: number }> = ({ x, y, scale, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      filter: `drop-shadow(0 0 14px ${colors.accent}) drop-shadow(0 0 30px ${colors.accent}aa)`,
      zIndex: 50,
    }}
  >
    <svg width="76" height="88" viewBox="0 0 24 28">
      <path
        d="M2 1.5 L2 20.5 L7 16 L10.4 24 L13.6 22.6 L10.2 14.8 L17 14.6 Z"
        fill={colors.accentSoft}
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

/** Scene 2 (frames 90-240): the kanban UI where a card moves itself to Done. */
export const Magic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The star card
  const start = { x: cardX(0), y: cardY(0) };
  const end = { x: cardX(2), y: cardY(1) };
  const t = interpolate(frame, [DRAG_START, DROP], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const arc = Math.sin(Math.PI * t);
  const fx = start.x + (end.x - start.x) * t;
  const fy = start.y + (end.y - start.y) * t - arc * 110;
  const tilt = arc * 7;

  const glow = interpolate(frame, [CURSOR_ARRIVES - 6, GRAB + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glowFade = 1 - interpolate(frame, [DROP + 2, DROP + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const g = glow * glowFade;
  const done = interpolate(frame, [DROP, DROP + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lift = spring({ frame: frame - GRAB, fps, config: { damping: 14, stiffness: 160 } });
  const landBump = interpolate(frame, [DROP, DROP + 5, DROP + 16], [0, 0.09, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = 1 + 0.07 * lift * (1 - done) + landBump;
  // Messy, restless card before the AI picks it up
  const chaos = Math.sin(frame / 2.6) * 2.2 * (1 - glow);

  // To Do cards close the gap once the card leaves
  const shift = spring({ frame: frame - DRAG_START - 4, fps, config: { damping: 200 } });

  // Cursor: flies in, clicks, carries the card, then leaves
  const grabOffset = { x: 215, y: 62 };
  const cursorIn = interpolate(frame, [4, CURSOR_ARRIVES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cursorStart = { x: 930, y: 1250 };
  let cursorX = cursorStart.x + (start.x + grabOffset.x - cursorStart.x) * cursorIn;
  let cursorY = cursorStart.y + (start.y + grabOffset.y - cursorStart.y) * cursorIn;
  if (frame >= DRAG_START) {
    cursorX = fx + grabOffset.x;
    cursorY = fy + grabOffset.y;
  }
  const exit = interpolate(frame, [DROP + 16, DROP + 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  cursorX += exit * 260;
  cursorY += exit * 320;
  const click = interpolate(frame, [GRAB - 3, GRAB, GRAB + 5], [1, 0.82, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursorOpacity =
    interpolate(frame, [4, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - exit);

  // Landing ripple
  const ripple = interpolate(frame, [DROP, DROP + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  const statusSorted = frame >= SORTED;
  const pill = spring({ frame: frame - 14, fps, config: { damping: 12 } });

  return (
    <SceneFade fadeIn={4}>
      {/* Headline + status pill */}
      <AbsoluteFill style={{ padding: "150px 60px 0", alignItems: "center" }}>
        <AnimatedWords text="Meet FlowTask AI" fontSize={84} highlight={["FlowTask", "AI"]} />
        <div
          style={{
            marginTop: 36,
            transform: `scale(${0.8 + 0.2 * pill})`,
            opacity: pill,
            padding: "14px 34px",
            borderRadius: 999,
            fontSize: 34,
            fontWeight: 700,
            color: statusSorted ? colors.success : colors.accentSoft,
            background: statusSorted ? `${colors.success}1f` : `${colors.accent}22`,
            border: `2px solid ${statusSorted ? colors.success : colors.accent}66`,
          }}
        >
          {statusSorted ? "✓ Sorted automatically" : "✨ AI is sorting…"}
        </div>
      </AbsoluteFill>

      {/* Columns */}
      {columns.map((name, i) => {
        const p = spring({ frame: frame - i * 4, fps, config: { damping: 16, stiffness: 110 } });
        const isDone = i === 2;
        return (
          <div
            key={name}
            style={{
              position: "absolute",
              left: COL_X[i],
              top: BOARD_Y,
              width: COL_W,
              height: BOARD_H,
              borderRadius: 34,
              background: `${colors.panel}f0`,
              border: `2px solid ${colors.panelBorder}`,
              boxShadow: isDone && done > 0 ? `0 0 ${60 * done}px ${colors.success}22` : "0 30px 60px rgba(0,0,0,0.4)",
              opacity: p,
              transform: `translateY(${(1 - p) * 80}px)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "34px 30px" }}>
              <div style={{ width: 16, height: 16, borderRadius: 99, background: isDone ? colors.success : i === 1 ? colors.violet : colors.muted }} />
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>{name}</div>
            </div>
          </div>
        );
      })}

      {/* Plain cards */}
      {staticCards.map((c) => {
        const slot = c.col === 0 ? c.slot - shift : c.slot;
        const p = spring({ frame: frame - 8 - c.col * 4 - c.slot * 3, fps, config: { damping: 14, stiffness: 120 } });
        return (
          <div
            key={c.label}
            style={{
              position: "absolute",
              left: cardX(c.col),
              top: cardY(slot),
              width: CARD_W,
              height: CARD_H,
              borderRadius: 24,
              background: colors.card,
              border: `2px solid ${colors.panelBorder}`,
              opacity: p,
              transform: `translateY(${(1 - p) * 40}px)`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "0 22px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: 10, height: 48, borderRadius: 6, background: c.tint }} />
            <div style={{ fontSize: 27, fontWeight: 600, lineHeight: 1.15 }}>{c.label}</div>
            {c.col === 2 && <div style={{ marginLeft: "auto", color: colors.success, fontSize: 30 }}>✓</div>}
          </div>
        );
      })}

      {/* Landing ripple in the Done column */}
      {frame >= DROP && (
        <div
          style={{
            position: "absolute",
            left: end.x + CARD_W / 2 - 160,
            top: end.y + CARD_H / 2 - 160,
            width: 320,
            height: 320,
            borderRadius: 999,
            border: `4px solid ${colors.success}`,
            opacity: (1 - ripple) * 0.8,
            transform: `scale(${0.3 + ripple * 1.1})`,
          }}
        />
      )}

      {/* The star card: "Fix Bugs 🐛" */}
      <div
        style={{
          position: "absolute",
          left: fx,
          top: fy,
          width: CARD_W,
          height: CARD_H,
          boxSizing: "border-box",
          borderRadius: 24,
          zIndex: 40,
          transform: `rotate(${tilt + chaos}deg) scale(${scale})`,
          background: `linear-gradient(135deg, rgba(99,102,241,${0.25 + 0.75 * g}), rgba(167,139,250,${0.2 + 0.7 * g}))`,
          border: `2px solid ${done > 0.5 ? colors.success : colors.accentSoft}`,
          boxShadow: `0 0 ${20 + 60 * g}px ${colors.accent}${Math.round(60 + 140 * g).toString(16)}, 0 30px 50px rgba(0,0,0,0.5)`,
          opacity: 1,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 24px",
        }}
      >
        <div style={{ fontSize: 33, fontWeight: 800, letterSpacing: -0.5 }}>Fix Bugs 🐛</div>
        <div style={{ marginLeft: "auto", fontSize: 32, color: "#fff", opacity: done }}>✓</div>
      </div>

      <Cursor x={cursorX} y={cursorY} scale={click} opacity={cursorOpacity} />

      {/* Caption */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 1290 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: colors.muted,
            opacity: interpolate(frame, [DROP + 6, DROP + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(frame, [DROP + 6, DROP + 22], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
          }}
        >
          No dragging. No sorting.
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};
