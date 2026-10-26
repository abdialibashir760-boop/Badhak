import React from "react";
import { AbsoluteFill } from "remotion";
import { BoundHero } from "./components/BoundHero";
import { World } from "./components/CameraMotion";
import { LightDefs, Light } from "./components/ApprovalLights";
import { Mask } from "./components/Mask";
import { P } from "./utils/rig";

/** YouTube thumbnail (render as a still: `npx remotion still src/index.ts Thumbnail dist/thumbnail.png`). */
export const Thumbnail: React.FC = () => {
  const pose = P({ lean: 7, head: 12, smile: 1, eyes: 0.6, brow: 0.6, mask: 1, aL1: -34, aL2: -20, aR1: 34, aR2: 20, lL1: -9, lR1: 9 });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 72% 55%, #ffd36b 0%, #f3b02e 55%, #d98a12 100%)" }}>
      <World>
        <LightDefs />
        <BoundHero x={1480} ground={1030} scale={3.1} pose={pose} frame={0} wraps={12} tension={0.8} reach={900} anchorY={-200} tremble={0} color="#0b0b0b" />
        <Mask x={1000} y={900} r={1} opacity={0} />
        <Light x={1100} y={160} on={0} frame={0} />
      </World>
      <AbsoluteFill style={{ padding: "110px 0 0 90px", fontFamily: "Inter, 'DejaVu Sans', sans-serif", fontWeight: 900, color: "#0b0b0b" }}>
        <div style={{ fontSize: 150, lineHeight: 0.98, letterSpacing: "-0.03em", textTransform: "uppercase" }}>Why you<br />can’t say</div>
        <div style={{ alignSelf: "flex-start", marginTop: 18, background: "#0b0b0b", color: "#fff", fontSize: 330, lineHeight: 1, padding: "0 46px 14px", letterSpacing: "-0.02em", transform: "rotate(-3deg)" }}>NO</div>
        <div style={{ marginTop: 40, fontSize: 56, fontWeight: 800, letterSpacing: "0.01em" }}>The prison of being liked</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
