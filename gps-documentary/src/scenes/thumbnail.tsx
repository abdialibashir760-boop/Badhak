import React from "react";
import { ShotCtx } from "../components/context";
import { poseLocal } from "../engine/cam";
import { NearBase, Stage } from "./globe";
import { ACCENT, MINT } from "../components/Hud";

/** 1920×1080 YouTube thumbnail: the lock-on moment with a big three-line title. */
export const Thumbnail: React.FC = () => (
  <ShotCtx.Provider value={{ id: "thumb", t: 9.3, dur: 10, p: 0.9, frame: 12 }}>
    <Stage
      pose={poseLocal(205, 30, 2100, 60)}
      dim={0.1}
      overlay={() => (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(95deg, rgba(2,5,12,0.94) 0%, rgba(2,5,12,0.78) 34%, rgba(2,5,12,0) 62%)", display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 96 }}>
          <div style={{ fontSize: 30, letterSpacing: 10, fontWeight: 700, color: ACCENT }}>TECHNOLOGY EXPLAINED</div>
          <div style={{ marginTop: 18, fontSize: 168, fontWeight: 800, lineHeight: 0.96, letterSpacing: -5, color: "#fff", textShadow: "0 8px 60px rgba(0,0,0,0.9)" }}>HOW GPS</div>
          <div style={{ fontSize: 168, fontWeight: 800, lineHeight: 0.96, letterSpacing: -5, color: MINT, textShadow: "0 0 70px rgba(125,255,192,0.45)" }}>KNOWS</div>
          <div style={{ fontSize: 168, fontWeight: 800, lineHeight: 0.96, letterSpacing: -5, color: "#fff", textShadow: "0 8px 60px rgba(0,0,0,0.9)" }}>WHERE</div>
          <div style={{ fontSize: 168, fontWeight: 800, lineHeight: 0.96, letterSpacing: -5, color: "#fff", textShadow: "0 8px 60px rgba(0,0,0,0.9)" }}>YOU ARE</div>
        </div>
      )}
    >
      {({ cam, D, t }) => <NearBase cam={cam} D={D} t={t} lockT={1.2} ret={1} beams={1} packets={t} pulse={false} />}
    </Stage>
  </ShotCtx.Provider>
);
