import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { Captions } from "./Captions";
import { C, FONT } from "./theme";
import { getStrings, type Lang } from "./strings";
import { timing_en, timing_tr, type Timing } from "./timing";
import {
  SceneAverage,
  SceneCore,
  SceneFine,
  SceneHook,
  SceneLaser,
  ScenePhoto,
  SceneRadar,
  SceneSensors,
  SceneWrap,
  type SceneProps,
} from "./scenes";

export const SCENES: React.FC<SceneProps>[] = [
  SceneHook,
  SceneCore,
  SceneRadar,
  SceneLaser,
  SceneSensors,
  SceneAverage,
  ScenePhoto,
  SceneFine,
  SceneWrap,
];

export const timingFor = (lang: Lang): Timing => (lang === "en" ? timing_en : timing_tr);

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.4) % 80;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, ${C.bg2}, ${C.bg} 70%)` }}>
      <div
        style={{
          position: "absolute",
          inset: -80,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.06) 2px, transparent 2px), linear-gradient(90deg, rgba(148,163,184,0.06) 2px, transparent 2px)",
          backgroundSize: "80px 80px",
          translate: `${-drift}px ${-drift}px`,
        }}
      />
    </AbsoluteFill>
  );
};

export const SpeedCamera: React.FC<{ lang: Lang }> = ({ lang }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const tm = timingFor(lang);
  const t = getStrings(lang);
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Background />
      <Audio src={staticFile(`voice-${lang}.mp3`)} />
      {tm.scenes.map((sc, i) => {
        const Scene = SCENES[i];
        const from = Math.round(sc.start * fps);
        const dur = Math.round((sc.end - sc.start) * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <FadeWrap dur={dur}>
              <Scene sc={sc} t={t} />
            </FadeWrap>
          </Sequence>
        );
      })}
      <Captions words={tm.words} />
      {/* progress bar */}
      <div style={{ position: "absolute", left: 0, top: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: C.accent }} />
    </AbsoluteFill>
  );
};

const FadeWrap: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8, dur - 8, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
