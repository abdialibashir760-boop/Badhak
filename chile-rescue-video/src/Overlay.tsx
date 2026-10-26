import React from "react";
import { E, H, T, W, clamp, easeOut, prog } from "./geo";
import { LINES, NARRATION_END } from "./timeline";

const font = "Inter, 'Helvetica Neue', Arial, sans-serif";

type Chip = { from: string; to: string; text: string | ((t: number) => string) };
const CHIPS: Chip[] = [
  { from: "s1", to: "s1", text: "SAN JOSÉ MINE" },
  { from: "s2", to: "s2", text: "AUG 5, 2010" },
  { from: "s3", to: "s3", text: "ATACAMA DESERT · CHILE" },
  { from: "u4", to: "u4", text: "AUG 7" },
  { from: "b1", to: "b1", text: "AUG 22 · BEFORE DAWN" },
  { from: "b3", to: "b3", text: "2,257 FT DOWN" },
  { from: "b9", to: "b11", text: "DAY 17" },
  {
    from: "h4",
    to: "h4",
    text: (t) => `DAY ${1 + Math.floor(prog(t, T("h4") + 0.2, E("h4") - 0.3, (v) => clamp(v)) * 16)}`,
  },
];

export const Overlay: React.FC<{ t: number; flash: number }> = ({ t, flash }) => {
  const line = LINES.find((l) => t >= l.start - 0.04 && t <= l.end + 0.3);
  const capIn = line ? easeOut((t - line.start) / 0.14) : 0;
  const capOut = line ? 1 - clamp((t - line.end) / 0.3) : 0;
  const chip = CHIPS.find((c) => t >= T(c.from) - 0.1 && t <= E(c.to) + 0.9);
  const chipA = chip ? clamp((t - T(chip.from) + 0.1) / 0.25) * (1 - clamp((t - E(chip.to) - 0.6) / 0.3)) : 0;
  const endA = clamp((t - (NARRATION_END + 0.4)) / 0.8);

  return (
    <>
      {/* vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none" }} />
      {/* part tag */}
      <div style={{ position: "absolute", left: 40, top: 48, fontFamily: font, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: "#fff", opacity: 0.85, textShadow: "0 2px 6px rgba(0,0,0,.6)" }}>
        THE 33 · PART 1
      </div>
      {/* chip */}
      {chip && (
        <div style={{ position: "absolute", top: 104, left: 0, width: W, display: "flex", justifyContent: "center", opacity: chipA, transform: `translateY(${(1 - chipA) * -14}px)` }}>
          <div style={{ fontFamily: font, fontWeight: 900, fontSize: 50, letterSpacing: 2, color: "#14161a", background: "#f2b705", padding: "12px 30px", borderRadius: 18, boxShadow: "0 6px 22px rgba(0,0,0,.45)" }}>
            {typeof chip.text === "string" ? chip.text : chip.text(t)}
          </div>
        </div>
      )}
      {/* captions */}
      {line && (
        <div style={{ position: "absolute", left: 60, right: 60, top: H - 250, height: 200, display: "flex", alignItems: "center", justifyContent: "center", opacity: capIn * capOut, transform: `scale(${0.96 + 0.04 * capIn})` }}>
          <div
            style={{
              fontFamily: font,
              fontWeight: 900,
              fontSize: line.cap.length > 44 ? 50 : 58,
              lineHeight: 1.14,
              textAlign: "center",
              color: "#fff",
              letterSpacing: 1,
              WebkitTextStroke: "9px #000",
              paintOrder: "stroke fill",
              textShadow: "0 4px 14px rgba(0,0,0,.55)",
            }}
          >
            {line.cap}
          </div>
        </div>
      )}
      {/* blast flash */}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash, pointerEvents: "none" }} />
      {/* end card */}
      {endA > 0 && (
        <div style={{ position: "absolute", inset: 0, background: "#0d1117", opacity: endA, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36, fontFamily: font }}>
          <div style={{ fontSize: 34, letterSpacing: 8, color: "#9aa7b8", fontWeight: 700 }}>THE 33</div>
          <div style={{ fontSize: 150, fontWeight: 900, color: "#fff", lineHeight: 1 }}>PART 2</div>
          <div style={{ fontSize: 44, color: "#f2b705", fontWeight: 800, letterSpacing: 2 }}>THE RESCUE</div>
          <div style={{ marginTop: 40, fontSize: 56, fontWeight: 900, color: "#14161a", background: "#f2b705", padding: "20px 64px", borderRadius: 999, transform: `scale(${1 + 0.04 * Math.sin(t * 5)})` }}>FOLLOW</div>
        </div>
      )}
    </>
  );
};
