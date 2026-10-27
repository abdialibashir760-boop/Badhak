import React from "react";
import { clamp, easeOut } from "./math";

export const font = "Inter, 'Helvetica Neue', Arial, sans-serif";

export type CapLine = { cap: string; start: number; end: number };
/** A pill shown near the top between two times (seconds). */
export type Chip = { from: number; to: number; text: string | ((t: number) => string) };

/** Where captions, chips and the series tag sit for a given canvas. */
export type Layout = { capTop: number; capH: number; capSide: number; capFont: number; capFontLong: number; longAt: number; chipTop: number; chipFont: number; tagTop: number; tagLeft: number; W: number };
export const PORTRAIT: Layout = { W: 1080, capTop: 1260, capH: 220, capSide: 60, capFont: 58, capFontLong: 50, longAt: 44, chipTop: 250, chipFont: 50, tagTop: 160, tagLeft: 40 };
export const LANDSCAPE: Layout = { W: 1920, capTop: 880, capH: 170, capSide: 160, capFont: 56, capFontLong: 50, longAt: 70, chipTop: 30, chipFont: 44, tagTop: 30, tagLeft: 40 };

type Props = {
  layout?: Layout;
  t: number;
  flash?: number;
  lines: CapLine[];
  chips: Chip[];
  narrationEnd: number;
  tag: string;
  endCard: React.ReactNode;
};

export const Overlay: React.FC<Props> = ({ t, flash = 0, lines, chips, narrationEnd, tag, endCard, layout = PORTRAIT }) => {
  const line = lines.find((l) => t >= l.start - 0.04 && t <= l.end + 0.3);
  const capIn = line ? easeOut((t - line.start) / 0.14) : 0;
  const capOut = line ? 1 - clamp((t - line.end) / 0.3) : 0;
  const chip = chips.find((c) => t >= c.from - 0.1 && t <= c.to + 0.9);
  const chipA = chip ? clamp((t - chip.from + 0.1) / 0.25) * (1 - clamp((t - chip.to - 0.6) / 0.3)) : 0;
  const endA = clamp((t - (narrationEnd + 0.4)) / 0.8);

  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: layout.tagLeft, top: layout.tagTop, fontFamily: font, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: "#fff", opacity: 0.85, textShadow: "0 2px 6px rgba(0,0,0,.6)" }}>{tag}</div>
      {chip && (
        <div style={{ position: "absolute", top: layout.chipTop, left: 0, width: layout.W, display: "flex", justifyContent: "center", opacity: chipA, transform: `translateY(${(1 - chipA) * -14}px)` }}>
          <div style={{ fontFamily: font, fontWeight: 900, fontSize: layout.chipFont, letterSpacing: 2, color: "#14161a", background: "#f2b705", padding: "12px 30px", borderRadius: 18, boxShadow: "0 6px 22px rgba(0,0,0,.45)" }}>
            {typeof chip.text === "string" ? chip.text : chip.text(t)}
          </div>
        </div>
      )}
      {line && (
        <div style={{ position: "absolute", left: layout.capSide, right: layout.capSide, top: layout.capTop, height: layout.capH, display: "flex", alignItems: "center", justifyContent: "center", opacity: capIn * capOut, transform: `scale(${0.96 + 0.04 * capIn})` }}>
          <div
            style={{
              fontFamily: font,
              fontWeight: 900,
              fontSize: line.cap.length > layout.longAt ? layout.capFontLong : layout.capFont,
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
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash, pointerEvents: "none" }} />
      {endA > 0 && (
        <div style={{ position: "absolute", inset: 0, background: "#0d1117", opacity: endA, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36, fontFamily: font }}>
          {endCard}
        </div>
      )}
    </>
  );
};
