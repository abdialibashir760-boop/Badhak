import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { Captions } from "./Captions";
import { SCENES, timingFor } from "./SpeedCamera";
import { C, FONT, H, W, pop } from "./theme";
import { getStrings, type Lang } from "./strings";

/** Vertical 9:16 (Shorts / Reels / TikTok). Reuses the 16:9 scenes inside a panel. */
export const SHORT_W = 1080;
export const SHORT_H = 1920;
const PANEL_SCALE = SHORT_W / W; // 0.5625
const PANEL_H = H * PANEL_SCALE; // 607.5
const PANEL_TOP = 540;

const ACCENTS = [C.accent, C.accent, C.wave, C.laser, C.accent, C.bad, C.wave, C.ok, C.accent];

const Backdrop: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.6) % 90;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 28%, ${C.bg2}, ${C.bg} 72%)` }}>
      <div
        style={{
          position: "absolute",
          inset: -90,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.06) 2px, transparent 2px), linear-gradient(90deg, rgba(148,163,184,0.06) 2px, transparent 2px)",
          backgroundSize: "90px 90px",
          translate: `${-drift}px ${-drift}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -200,
          right: -200,
          top: 1250,
          height: 600,
          background: `radial-gradient(ellipse at 50% 0%, ${accent}22, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Headline: React.FC<{ text: string; accent: string; index: number }> = ({ text, accent, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = Math.min(1, pop(frame, fps, 0.05, 11));
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 250,
        textAlign: "center",
        opacity: p,
        translate: `0 ${(1 - p) * -40}px`,
        scale: 0.9 + 0.1 * p,
      }}
    >
      <div
        style={{
          display: "inline-block",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 28,
          letterSpacing: 4,
          color: "#0b1220",
          background: accent,
          borderRadius: 999,
          padding: "6px 22px",
          marginBottom: 18,
        }}
      >
        {index + 1} / {SCENES.length}
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, lineHeight: 1.05, color: C.text }}>
        {text}
      </div>
    </div>
  );
};

/** Scene panel: a 1920×1080 scene scaled to the 1080-wide frame, with a punch-in on entry. */
const Panel: React.FC<{ accent: string; children: React.ReactNode }> = ({ accent, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = interpolate(frame, [0, 0.35 * fps], [1.06, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: PANEL_TOP,
        width: SHORT_W,
        height: PANEL_H,
        overflow: "hidden",
        borderTop: `6px solid ${accent}`,
        borderBottom: `6px solid ${accent}`,
        boxSizing: "border-box",
        scale: String(punch),
        background: "rgba(5,9,18,0.45)",
        boxShadow: `0 0 80px ${accent}33`,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", scale: String(PANEL_SCALE) }}>
        {children}
      </div>
    </div>
  );
};

const SegmentedProgress: React.FC<{ starts: number[]; ends: number[]; total: number }> = ({ starts, ends, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const gap = 8;
  const left = 40;
  const width = SHORT_W - 80;
  return (
    <div style={{ position: "absolute", left, top: 70, width, height: 10, display: "flex", gap }}>
      {starts.map((s, i) => {
        const w = ((ends[i] - s) / total) * (width - gap * (starts.length - 1));
        const fill = Math.max(0, Math.min(1, (t - s) / (ends[i] - s)));
        return (
          <div key={i} style={{ width: w, height: 10, borderRadius: 5, background: "rgba(148,163,184,0.25)", overflow: "hidden" }}>
            <div style={{ width: `${fill * 100}%`, height: "100%", background: ACCENTS[i] }} />
          </div>
        );
      })}
    </div>
  );
};

const FadeWrap: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 6, dur - 6, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const SpeedCameraShort: React.FC<{ lang: Lang }> = ({ lang }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const tm = timingFor(lang);
  const t = getStrings(lang);
  const idx = Math.max(
    0,
    tm.scenes.findIndex((s) => frame / fps >= s.start && frame / fps < s.end),
  );
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Backdrop accent={ACCENTS[idx]} />
      <Audio src={staticFile(`voice-${lang}.mp3`)} />
      {tm.scenes.map((sc, i) => {
        const Scene = SCENES[i];
        const from = Math.round(sc.start * fps);
        const dur = Math.round((sc.end - sc.start) * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <FadeWrap dur={dur}>
              <Headline text={t.headlines[i]} accent={ACCENTS[i]} index={i} />
              <Panel accent={ACCENTS[i]}>
                <Scene sc={sc} t={t} />
              </Panel>
            </FadeWrap>
          </Sequence>
        );
      })}
      {/* The 16:9 captions are not used here; big word-by-word captions go under the panel. */}
      <Captions words={tm.words} fontSize={76} maxWords={4} top={PANEL_TOP + PANEL_H + 100} pad={40} />
      <SegmentedProgress
        starts={tm.scenes.map((s) => s.start)}
        ends={tm.scenes.map((s) => s.end)}
        total={tm.duration}
      />
    </AbsoluteFill>
  );
};
