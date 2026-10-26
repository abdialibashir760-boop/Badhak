import React from "react";
import { AbsoluteFill } from "remotion";
import { H, W } from "../theme";
import { kf, noise } from "../utils/animation";
import { useGF } from "./SceneFrame";

export type CamKey = readonly [number, { cx: number; cy: number; s: number }];

/** World-space camera: centre (cx,cy) + zoom `s`, keyed in global frames, with a trace of handheld drift. */
export const CameraMotion: React.FC<{ keys: ReadonlyArray<CamKey>; drift?: number; children: React.ReactNode }> = ({ keys, drift = 3, children }) => {
  const f = useGF();
  const at = (fr: number) => ({
    cx: kf(fr, keys.map(([t, v]) => [t, v.cx] as const)),
    cy: kf(fr, keys.map(([t, v]) => [t, v.cy] as const)),
    s: kf(fr, keys.map(([t, v]) => [t, v.s] as const)),
  });
  const { cx, cy, s } = at(f);
  const prev = at(f - 1);
  // fast whip-pans pick up a little motion blur
  const blur = Math.min(9, Math.max(0, (Math.abs(cx - prev.cx) * s - 28) / 14));
  const dx = noise(f * 0.012, 3) * drift, dy = noise(f * 0.014, 8) * drift;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${W / 2 - cx * s + dx}px, ${H / 2 - cy * s + dy}px) scale(${s})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Full-frame world SVG (content may extend beyond the viewBox for side-scrolling shots). */
export const World: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    {children}
  </svg>
);
