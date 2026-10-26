import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { C, H, W } from "../theme";
import { hash } from "../utils/animation";

const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
};

/** Off-white paper. `dark` (0..1) sinks the room into grey; `constrict` (0..1) closes in the vignette. */
export const PaperBackground: React.FC<{
  dark?: number; constrict?: number; spot?: [number, number]; floorY?: number; children?: React.ReactNode;
}> = ({ dark = 0, constrict = 0, spot = [0.5, 0.5], floorY = 830, children }) => {
  const base = mix(C.paper, "#58564f", dark);
  const floor = mix("#e4e0d3", "#3f3e39", dark);
  const inner = 0.95 - constrict * 0.55;
  return (
    <AbsoluteFill style={{ background: base }}>
      <AbsoluteFill style={{ background: `linear-gradient(to bottom, transparent ${(floorY / H) * 100 - 6}%, ${floor} ${(floorY / H) * 100 + 14}%)` }} />
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile("images/paper.jpg")})`, backgroundSize: "cover", mixBlendMode: "soft-light", opacity: 0.85 }} />
      {children}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${inner * 78}% ${inner * 92}% at ${spot[0] * 100}% ${spot[1] * 100}%, rgba(0,0,0,0) 20%, rgba(12,12,10,${0.16 + dark * 0.5 + constrict * 0.45}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Subtle animated film grain + a hairline of flicker; drawn once above every scene. */
export const FilmGrain: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 2);
  const ox = Math.floor(hash(k * 1.3) * 512), oy = Math.floor(hash(k * 2.7) * 512);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile(`images/grain${k % 6}.png`)})`, backgroundSize: "512px 512px", backgroundPosition: `${ox}px ${oy}px`, mixBlendMode: "overlay", opacity: 0.2 }} />
      <AbsoluteFill style={{ background: `rgba(255,255,255,${(hash(k * 5.1) - 0.5) * 0.012})` }} />
    </AbsoluteFill>
  );
};

/** Faint dust motes drifting through the frame (deterministic). */
export const Dust: React.FC<{ n?: number; opacity?: number }> = ({ n = 22, opacity = 0.35 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity }}>
      {Array.from({ length: n }, (_, i) => {
        const x = (hash(i * 3.7) * (W + 200) + f * (0.25 + hash(i) * 0.4)) % (W + 200) - 100;
        const y = (hash(i * 9.1) * H + Math.sin(f * 0.012 + i) * 30 - f * 0.1) % H;
        return <circle key={i} cx={x} cy={(y + H) % H} r={0.8 + hash(i * 2.2) * 1.6} fill="#fff" opacity={0.4 + hash(i * 6.6) * 0.5} />;
      })}
    </svg>
  );
};
