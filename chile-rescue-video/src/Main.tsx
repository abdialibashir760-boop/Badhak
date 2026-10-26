import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { World } from "./World";
import { Overlay } from "./Overlay";
import { camera } from "./camera";
import { FPS, T, clamp } from "./geo";
import { shake } from "./state";

export const Main: React.FC = () => {
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
      <Overlay t={t} flash={flash} />
      <Audio src={staticFile("voiceover.mp3")} />
    </AbsoluteFill>
  );
};
