import React, { createContext, useContext } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { FADE } from "../data/timing";
import { prog } from "../utils/animation";

const Ctx = createContext(0);

/** Global film frame inside a scene (scenes are authored in global frames). */
export const useGF = () => useCurrentFrame() + useContext(Ctx);

/** Sequences a scene on the master timeline with soft cross-fades (no black gaps: paper is always underneath). */
export const SceneFrame: React.FC<{ from: number; to: number; first?: boolean; last?: boolean; children: React.ReactNode }> = ({ from, to, first, last, children }) => {
  return (
    <Sequence from={from} durationInFrames={to - from} layout="none">
      <Ctx.Provider value={from}>
        <Fader dur={to - from} first={first} last={last}>{children}</Fader>
      </Ctx.Provider>
    </Sequence>
  );
};

const Fader: React.FC<{ dur: number; first?: boolean; last?: boolean; children: React.ReactNode }> = ({ dur, first, last, children }) => {
  const f = useCurrentFrame();
  // The incoming scene dissolves in over the outgoing one, which stays fully opaque underneath
  // (it is extended by FADE frames in sceneRanges) — so there is never a dip to the paper colour.
  const a = first ? 1 : prog(f, 0, FADE);
  void dur; void last;
  return <AbsoluteFill style={{ opacity: a }}>{children}</AbsoluteFill>;
};
