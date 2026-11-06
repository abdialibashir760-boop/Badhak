import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { CONFIG } from "./config";
import { ShotCtx } from "./components/context";
import { clamp01, easeInOut, smoothstep } from "./engine/math3d";
import { SHOT_COMPONENTS } from "./shots";
import { FPS, HEIGHT, SECTIONS_AT, SHOTS, SLOTS, TOTAL_S, WIDTH, sectionAt } from "./timeline";
import { SECTIONS } from "./narration";

const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";
/** seconds of overlap used to blend a shot into the previous one */
const PRE: Record<string, number> = { fade: 0.4, cut: 0, flash: 0, sweep: 0.55 };

const ShotLayer: React.FC<{ shotIndex: number; tAbs: number }> = ({ shotIndex, tAbs }) => {
  const shot = SHOTS[shotIndex];
  const trans = shot.trans ?? "fade";
  const pre = PRE[trans];
  if (tAbs < shot.start - pre || tAbs >= shot.end + 0.02) return null;
  const t = tAbs - shot.start;
  const Comp = SHOT_COMPONENTS[shot.id];
  const inP = pre > 0 ? clamp01((tAbs - (shot.start - pre)) / pre) : 1;
  const style: React.CSSProperties = { position: "absolute", inset: 0 };
  if (trans === "fade") style.opacity = easeInOut(inP);
  if (trans === "sweep") {
    const x = easeInOut(inP) * 130 - 15; // diagonal wipe, %
    style.clipPath = `polygon(0 0, ${x + 15}% 0, ${x - 15}% 100%, 0 100%)`;
  }
  return (
    <div style={style}>
      <ShotCtx.Provider value={{ id: shot.id, t, dur: shot.dur, p: clamp01(t / shot.dur), frame: Math.round(tAbs * FPS) }}>
        <Comp />
      </ShotCtx.Provider>
      {trans === "sweep" && inP > 0 && inP < 1 && (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${easeInOut(inP) * 130 - 18}%, rgba(111,214,255,0.85) ${easeInOut(inP) * 130 - 15}%, transparent ${easeInOut(inP) * 130 - 12}%)`, mixBlendMode: "screen" }} />
      )}
    </div>
  );
};

const Flash: React.FC<{ tAbs: number }> = ({ tAbs }) => {
  let o = 0;
  for (const s of SHOTS) if (s.trans === "flash") o = Math.max(o, 1 - smoothstep(0, 0.45, tAbs - s.start) * (tAbs >= s.start ? 1 : 0) - (tAbs < s.start ? 1 : 0));
  return <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, #ffffff, #bfeaff)", opacity: Math.max(0, o) * 0.85 }} />;
};

const Captions: React.FC<{ tAbs: number }> = ({ tAbs }) => {
  if (!CONFIG.captions) return null;
  const slot = SLOTS.find((s) => s.text && tAbs >= s.speechStart - 0.1 && tAbs < s.speechStart + s.speechDur + 0.35);
  if (!slot) return null;
  const a = smoothstep(slot.speechStart - 0.1, slot.speechStart + 0.25, tAbs) * (1 - smoothstep(slot.speechStart + slot.speechDur, slot.speechStart + slot.speechDur + 0.35, tAbs));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 62, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 8}px)` }}>
      <div style={{ maxWidth: 1380, padding: "14px 30px", borderRadius: 16, background: "rgba(3,8,18,0.62)", border: "1px solid rgba(150,205,255,0.14)", backdropFilter: "blur(10px)", fontFamily: FONT, fontSize: 34, lineHeight: 1.32, fontWeight: 500, color: "#f2f8ff", textAlign: "center", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
        {slot.text}
      </div>
    </div>
  );
};

const ChapterTag: React.FC<{ tAbs: number }> = ({ tAbs }) => {
  const firsts = SLOTS.filter((s) => s.id === "P0" || SECTIONS_AT.has(s.id));
  const cur = [...firsts].reverse().find((s) => tAbs >= s.start);
  if (!cur || cur.id === "P0") return null;
  const local = tAbs - cur.start - 0.2;
  const a = smoothstep(0, 0.5, local) * (1 - smoothstep(3.2, 3.8, local));
  if (a <= 0.01) return null;
  const sec = SECTIONS.find((x) => x.n === cur.section)!;
  return (
    <div style={{ position: "absolute", left: 96, top: 70, opacity: a, transform: `translateX(${(1 - a) * -14}px)`, fontFamily: FONT }}>
      <div style={{ fontSize: 15, letterSpacing: 4, fontWeight: 600, color: "#6fd6ff" }}>CHAPTER {String(sec.n).padStart(2, "0")}</div>
      <div style={{ fontSize: 34, fontWeight: 650, color: "#eaf4ff", marginTop: 6, letterSpacing: -0.3, textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}>{sec.title}</div>
    </div>
  );
};

const Rail: React.FC<{ tAbs: number }> = ({ tAbs }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 5, background: "rgba(150,200,255,0.08)" }}>
    <div style={{ width: `${(tAbs / TOTAL_S) * 100}%`, height: "100%", background: "linear-gradient(90deg,#4fd8ff,#7dffc0)" }} />
    {SLOTS.filter((s) => SECTIONS_AT.has(s.id)).map((s) => <div key={s.id} style={{ position: "absolute", left: `${(s.start / TOTAL_S) * 100}%`, top: 0, width: 2, height: 5, background: "rgba(255,255,255,0.35)" }} />)}
  </div>
);

const CUES = SHOTS.flatMap((s) => (s.sfx ?? []).map(([name, at, vol]) => ({ name, from: Math.max(0, Math.round((s.start + at) * FPS)), vol })));

/** Music bed (ducked under narration when present) and sound-effect cues placed from the shot list. */
const AudioLayer: React.FC = () => (
  <>
    {CONFIG.music && <Audio src={staticFile("audio/music.mp3")} volume={CONFIG.narration ? CONFIG.musicVolume * 0.55 : CONFIG.musicVolume} />}
    {CONFIG.sfx && CUES.map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={Math.ceil(3.6 * FPS)} layout="none">
        <Audio src={staticFile(`audio/sfx/${c.name}.wav`)} volume={c.vol} />
      </Sequence>
    ))}
  </>
);

export const Documentary: React.FC = () => {
  const frame = useCurrentFrame();
  const tAbs = frame / FPS;
  const fadeIn = 1 - smoothstep(0, 0.35, tAbs);
  const fadeOut = smoothstep(TOTAL_S - 0.8, TOTAL_S, tAbs);
  return (
    <AbsoluteFill style={{ background: "#02040b", fontFamily: FONT, overflow: "hidden" }}>
      {SHOTS.map((s) => <ShotLayer key={s.id} shotIndex={s.index} tAbs={tAbs} />)}
      <Flash tAbs={tAbs} />
      <ChapterTag tAbs={tAbs} />
      <Captions tAbs={tAbs} />
      <Rail tAbs={tAbs} />
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: Math.max(fadeIn, fadeOut), pointerEvents: "none" }} />
      <AudioLayer />
      {CONFIG.narration && <Audio src={staticFile(`narration/${CONFIG.narration}`)} volume={1} />}
      <span style={{ display: "none" }}>{WIDTH}{HEIGHT}</span>
    </AbsoluteFill>
  );
};
