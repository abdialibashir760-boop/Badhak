import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedWords } from "../components/AnimatedWords";
import { SceneFade } from "../components/SceneFade";
import { colors } from "../theme";

const SIZE = 640;
const R = 240;
const STROKE = 40;
const CIRC = 2 * Math.PI * R;
const FILL_START = 24;
const FILL_END = 84;
const POP = FILL_END;
const PARTICLES = 32;
const particleColors = [colors.accent, colors.accentSoft, colors.violet, "#FFFFFF", colors.success];

/** Scene 3 (frames 240-360): headline, ring counting 0 → 100 %, particle pop. */
export const ValueDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [FILL_START, FILL_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const pct = Math.round(progress * 100);

  const enter = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 100 } });
  const bump = spring({ frame: frame - POP, fps, config: { damping: 6, stiffness: 180, mass: 0.6 } });
  const ringScale = (0.7 + 0.3 * enter) * (1 + 0.07 * bump * (frame >= POP ? 1 : 0));
  const popT = interpolate(frame, [POP, POP + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = interpolate(frame, [POP, POP + 4, POP + 18], [0, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const reached = frame >= POP;
  const label = spring({ frame: frame - POP - 4, fps, config: { damping: 12 } });

  return (
    <SceneFade fadeIn={4}>
      <AbsoluteFill style={{ padding: "190px 70px 0" }}>
        <AnimatedWords text="FlowTask AI does it instantly." fontSize={100} highlight={["instantly"]} />
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 260 }}>
        <div style={{ position: "relative", width: SIZE, height: SIZE, opacity: enter, transform: `scale(${ringScale})` }}>
          {/* flash behind ring */}
          <div
            style={{
              position: "absolute",
              inset: -80,
              borderRadius: 999,
              background: `radial-gradient(circle, ${colors.accent}, transparent 65%)`,
              opacity: 0.18 + flash,
            }}
          />
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={colors.accentSoft} />
                <stop offset="100%" stopColor={reached ? colors.success : colors.violet} />
              </linearGradient>
            </defs>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={colors.panelBorder} strokeWidth={STROKE} />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="url(#ring)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              style={{ filter: `drop-shadow(0 0 18px ${colors.accent})` }}
            />
          </svg>

          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 170, fontWeight: 800, letterSpacing: -6, fontVariantNumeric: "tabular-nums" }}>
              {pct}
              <span style={{ fontSize: 80, color: colors.accentSoft }}>%</span>
            </div>
            <div style={{ fontSize: 38, fontWeight: 600, color: colors.muted }}>Tasks sorted</div>
          </div>

          {/* particle pop */}
          {frame >= POP &&
            Array.from({ length: PARTICLES }).map((_, i) => {
              const angle = (i / PARTICLES) * Math.PI * 2 + random(`a-${i}`) * 0.3;
              const dist = R + 20 + Easing.out(Easing.cubic)(popT) * (130 + random(`d-${i}`) * 170);
              const size = (8 + random(`s-${i}`) * 16) * (1 - popT * 0.8);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: SIZE / 2 + Math.cos(angle) * dist - size / 2,
                    top: SIZE / 2 + Math.sin(angle) * dist - size / 2,
                    width: size,
                    height: size,
                    borderRadius: i % 3 === 0 ? 3 : 999,
                    background: particleColors[i % particleColors.length],
                    opacity: 1 - popT,
                    boxShadow: `0 0 14px ${colors.accent}`,
                    transform: `rotate(${popT * 200 * (random(`q-${i}`) - 0.5)}deg)`,
                  }}
                />
              );
            })}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 170 }}>
        <div
          style={{
            padding: "16px 40px",
            borderRadius: 999,
            fontSize: 40,
            fontWeight: 700,
            color: colors.success,
            background: `${colors.success}1f`,
            border: `2px solid ${colors.success}66`,
            opacity: label,
            transform: `scale(${0.7 + 0.3 * label})`,
          }}
        >
          ✓ Board organized
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};
