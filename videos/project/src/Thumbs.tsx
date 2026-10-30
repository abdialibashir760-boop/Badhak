import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { C, F } from "./theme";
import { RAIL } from "./data";
import { G } from "./geo";
import { Arrow, MapView, Pt, Route } from "./Map";
import { Rock } from "./ui";
import { Carriage } from "./scenes3";

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all([document.fonts.load("700 40px Oswald"), document.fonts.load("500 40px Oswald")]).then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

const outline = "0 6px 0 #000, 0 0 28px rgba(0,0,0,.9), 3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000";
const word = (size: number, color: string): React.CSSProperties => ({ fontFamily: F.head, fontWeight: 700, fontSize: size, color, lineHeight: 0.95, letterSpacing: 2, textTransform: "uppercase", textShadow: outline });

const Chip: React.FC<{ text: string; color: string; fg?: string; style?: React.CSSProperties }> = ({ text, color, fg = "#fff", style }) => (
  <div style={{ position: "absolute", background: color, color: fg, fontFamily: F.head, fontWeight: 700, fontSize: 40, letterSpacing: 6, padding: "6px 22px", border: "4px solid #000", boxShadow: "0 6px 0 #000", ...style }}>{text}</div>
);

const WorldMap: React.FC<{ lon?: number; lat?: number; k?: number; gold?: string }> = ({ lon = 30, lat = 43.5, k = 1250, gold = "#a07a18" }) => (
  <MapView
    cam={[{ t: 0, lon, lat, k }]}
    fills={[{ names: G.axis, color: "#5a2420", from: -5 }, { names: G.turkey, color: gold, from: -5 }, { names: G.ussr, color: "#3a1c1a", from: -5 }]}
  >
    <Route pts={RAIL} from={-20} dur={5} color={C.red} width={8} rail />
    <Arrow from={[24.5, 43.2]} to={[27.6, 41.7]} at={-5} dur={1} color={C.red} width={12} curve={0.1} />
    <Arrow from={[23.0, 44.2]} to={[26.6, 41.9]} at={-5} dur={1} color={C.red} width={9} curve={0.12} />
    <Pt lon={32.86} lat={39.93} from={-5} r={9} color={C.gold} pulse={false} />
  </MapView>
);

/* A — "NEVER INVADED": map, red rail, blocked arrows, glowing ore */
export const ThumbA: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <WorldMap lon={37} lat={41.5} k={1500} gold="#d6a526" />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,.93) 0%, rgba(0,0,0,.62) 36%, rgba(0,0,0,0) 62%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 78% 78%, rgba(230,181,60,.35), transparent 45%)" }} />
      <div style={{ position: "absolute", left: 800, top: 360, filter: "drop-shadow(0 0 40px rgba(230,181,60,.9))" }}><Rock size={400} rot={-8} /></div>
      <Chip text="TURKEY · WW2" color={C.red} style={{ left: 44, top: 42 }} />
      <div style={{ position: "absolute", left: 44, top: 150 }}>
        <div style={word(210, "#fff")}>NEVER</div>
        <div style={word(190, C.gold)}>INVADED</div>
      </div>
      <Chip text="WHY?" color={C.gold} fg="#000" style={{ left: 44, top: 590, fontSize: 64, padding: "2px 30px" }} />
    </AbsoluteFill>
  );
};

/* B — "THE ROCK": giant glowing chromite, faint map */
export const ThumbB: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <WorldMap lon={33} lat={41} k={1700} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.75) 50%, rgba(0,0,0,.45) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 72% 52%, rgba(230,181,60,.55), transparent 48%)" }} />
      <div style={{ position: "absolute", left: 600, top: 70, filter: "drop-shadow(0 0 50px rgba(230,181,60,.95))" }}><Rock size={640} rot={6} /></div>
      <div style={{ position: "absolute", left: 44, top: 70 }}>
        <div style={word(230, "#fff")}>THE</div>
        <div style={word(230, "#fff")}>ROCK</div>
        <div style={{ ...word(78, C.gold), marginTop: 18 }}>THAT KEPT</div>
        <div style={word(78, C.gold)}>TURKEY OUT</div>
      </div>
    </AbsoluteFill>
  );
};

/* C — "WHY NOT?": the carriage meeting, silhouettes, red question */
export const ThumbC: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Carriage />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,.9) 0%, rgba(0,0,0,.2) 55%, rgba(0,0,0,.45) 100%)" }} />
      <Chip text="30 JAN 1943" color={C.gold} fg="#000" style={{ left: 44, top: 40 }} />
      <Chip text="NEUTRAL TURKEY" color={C.red} style={{ right: 44, top: 40 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center" }}>
        <div style={word(260, C.red)}>WHY NOT?</div>
      </div>
    </AbsoluteFill>
  );
};
