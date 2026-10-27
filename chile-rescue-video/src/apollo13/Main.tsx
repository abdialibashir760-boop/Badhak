import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Chip, Overlay } from "../common/Overlay";
import { FPS, clamp } from "../common/math";
import { Alarm, Bang, Crew, Cruise, Launch, Tank } from "./scenesA";
import { Cabin, Capacity, Dock, Ground, Path, Reentry, Scrub, Sep, Splash, Wait } from "./scenesB";
import { LINES, NARRATION_END } from "./timeline";
import { E, S } from "./time";

type SceneDef = { from: string; C: React.FC<{ t: number }> };

/** Scenes in order. Each starts just before its first narration line and crossfades into the next. */
const SCENES: SceneDef[] = [
  { from: "h1", C: Bang },
  { from: "s1", C: Launch },
  { from: "s4", C: Crew },
  { from: "s7", C: Cruise },
  { from: "e1", C: Tank },
  { from: "e4", C: Alarm },
  { from: "l1", C: Dock },
  { from: "l3", C: Capacity },
  { from: "l5", C: Cabin },
  { from: "t1", C: Path },
  { from: "c1", C: Scrub },
  { from: "r1", C: Ground },
  { from: "r3", C: Sep },
  { from: "r5", C: Reentry },
  { from: "r7", C: Wait },
  { from: "r8", C: Splash },
];

const XFADE = 0.35;
const starts = SCENES.map((s, i) => (i === 0 ? 0 : S(s.from) - 0.25));

const CHIPS: Chip[] = [
  { from: S("h1"), to: E("h1"), text: "~205,000 MILES FROM EARTH" },
  { from: S("s2"), to: E("s2"), text: "APRIL 11, 1970" },
  { from: S("e1"), to: E("e1"), text: "APRIL 13, 1970" },
  { from: S("l3"), to: E("l3"), text: "2 MEN · 2 DAYS" },
  { from: S("l4"), to: E("l4"), text: "3 MEN · 4 DAYS" },
  { from: S("r9"), to: E("r9"), text: "APRIL 17, 1970" },
  { from: S("r10"), to: E("r10"), text: "ALL 3 ALIVE" },
];

const END_CARD = (
  <>
    <div style={{ fontSize: 34, letterSpacing: 8, color: "#9aa7b8", fontWeight: 700 }}>NEXT STORY</div>
    <div style={{ fontSize: 120, fontWeight: 900, color: "#fff", lineHeight: 1.05, textAlign: "center" }}>THE THAI<br />CAVE RESCUE</div>
    <div style={{ fontSize: 44, color: "#f2b705", fontWeight: 800, letterSpacing: 2 }}>13 TRAPPED · 18 DAYS</div>
    <div style={{ marginTop: 40, fontSize: 56, fontWeight: 900, color: "#14161a", background: "#f2b705", padding: "20px 64px", borderRadius: 999 }}>FOLLOW</div>
  </>
);

export const Apollo13: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const flash = 0.85 * Math.max(0, 1 - clamp((t - (S("e2") + 0.1)) / 0.45)) * (t >= S("e2") + 0.1 ? 1 : 0);
  return (
    <AbsoluteFill style={{ background: "#05070f" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        {SCENES.map(({ C }, i) => {
          const a0 = starts[i];
          const a1 = i + 1 < SCENES.length ? starts[i + 1] : Infinity;
          if (t < a0 || t > a1 + XFADE) return null;
          const fin = i === 0 ? 1 : clamp((t - a0) / XFADE);
          const fout = t < a1 ? 1 : 1 - clamp((t - a1) / XFADE);
          return (
            <g key={i} opacity={fin * fout}>
              <C t={t} />
            </g>
          );
        })}
      </svg>
      <Overlay t={t} flash={flash} lines={LINES} chips={CHIPS} narrationEnd={NARRATION_END} tag="APOLLO 13 · 1970" endCard={END_CARD} />
      <Audio src={staticFile("apollo13.mp3")} />
    </AbsoluteFill>
  );
};
