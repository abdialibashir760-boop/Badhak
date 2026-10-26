import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT_SERIF } from "../theme";
import { prog } from "../utils/animation";
import { useGF } from "./SceneFrame";

/** Minimal on-screen text. Frames are global; fades in/out with a slow tracking settle. */
export const Caption: React.FC<{
  text: string; from: number; to: number; at?: "center" | "lower" | "upper"; size?: number; italic?: boolean;
  color?: string; plate?: string; weight?: number; tracking?: number; fadeIn?: number; fadeOut?: number; maxWidth?: number; shadow?: string;
}> = ({ text, from, to, at = "lower", size = 54, italic = false, color = C.ink, plate = "244,241,233", weight = 500, tracking = 0.01, fadeIn = 22, fadeOut = 22, maxWidth = 1500, shadow }) => {
  const f = useGF();
  const a = Math.min(prog(f, from, fadeIn), 1 - prog(f, to - fadeOut, fadeOut));
  if (a <= 0.001) return null;
  const y = at === "center" ? 540 : at === "lower" ? 905 : 190;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", left: "50%", top: y, width: maxWidth + 360, height: size * 4.2, transform: "translate(-50%, -50%)", opacity: a,
          background: `radial-gradient(ellipse at center, rgba(${plate},0.82) 0%, rgba(${plate},0.55) 42%, rgba(${plate},0) 72%)`,
        }}
      />
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: y, transform: `translateY(calc(-50% + ${(1 - a) * 14}px))`, textAlign: "center",
          fontFamily: FONT_SERIF, fontWeight: weight, fontStyle: italic ? "italic" : "normal", fontSize: size, color,
          letterSpacing: `${tracking + (1 - a) * 0.05}em`, lineHeight: 1.22, opacity: a, whiteSpace: "pre-line",
          margin: "0 auto", maxWidth, textShadow: shadow,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
