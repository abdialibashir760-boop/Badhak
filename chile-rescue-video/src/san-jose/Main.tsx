import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { World } from "./World";
import { Overlay, Chip } from "../common/Overlay";
import { camera } from "./camera";
import { E, FPS, T, clamp, prog } from "./geo";
import { shake } from "./state";
import { LINES, NARRATION_END } from "./timeline";

const CHIPS: Chip[] = [
  { from: T("s1"), to: E("s1"), text: "SAN JOSÉ MINE" },
  { from: T("s2"), to: E("s2"), text: "AUG 5, 2010" },
  { from: T("s3"), to: E("s3"), text: "ATACAMA DESERT · CHILE" },
  { from: T("u4"), to: E("u4"), text: "AUG 7" },
  { from: T("b1"), to: E("b1"), text: "AUG 22 · BEFORE DAWN" },
  { from: T("b3"), to: E("b3"), text: "2,257 FT DOWN" },
  { from: T("b9"), to: E("b11"), text: "DAY 17" },
  { from: T("h4"), to: E("h4"), text: (t) => `DAY ${1 + Math.floor(prog(t, T("h4") + 0.2, E("h4") - 0.3, (v) => clamp(v)) * 16)}` },
];

const END_CARD = (
  <>
    <div style={{ fontSize: 34, letterSpacing: 8, color: "#9aa7b8", fontWeight: 700 }}>THE 33</div>
    <div style={{ fontSize: 150, fontWeight: 900, color: "#fff", lineHeight: 1 }}>PART 2</div>
    <div style={{ fontSize: 44, color: "#f2b705", fontWeight: 800, letterSpacing: 2 }}>THE RESCUE</div>
    <div style={{ marginTop: 40, fontSize: 56, fontWeight: 900, color: "#14161a", background: "#f2b705", padding: "20px 64px", borderRadius: 999 }}>FOLLOW</div>
  </>
);

export const SanJose: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camera(t);
  const sh = shake(t);
  const shakeX = sh * (Math.sin(t * 57) + 0.6 * Math.sin(t * 91 + 1));
  const shakeY = sh * (Math.cos(t * 49) + 0.5 * Math.sin(t * 83));
  const flash = 0.9 * Math.max(0, 1 - clamp((t - T("c3")) / 0.5)) * (t >= T("c3") ? 1 : 0);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <World t={t} cx={cam.cx} cy={cam.cy} s={cam.s} shakeX={shakeX} shakeY={shakeY} />
      <Overlay t={t} flash={flash} lines={LINES} chips={CHIPS} narrationEnd={NARRATION_END} tag="THE 33 · PART 1" endCard={END_CARD} />
      <Audio src={staticFile("san-jose.mp3")} />
    </AbsoluteFill>
  );
};
