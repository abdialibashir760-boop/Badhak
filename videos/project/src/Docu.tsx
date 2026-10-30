import React, { useEffect, useState } from "react";
import { Audio, AbsoluteFill, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/700.css";
import "@fontsource/oswald/latin-ext-500.css";
import "@fontsource/oswald/latin-ext-700.css";
import "@fontsource/special-elite/400.css";
import "@fontsource/special-elite/latin-ext-400.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/latin-ext-700.css";
import timelineEn from "./timeline.json";
import creditsEn from "./credits.json";
import timelineTr from "./timeline_tr.json";
import creditsTr from "./credits_tr.json";
import { C, F, FPS } from "./theme";
import { LangCtx, SceneData, ScCtx } from "./ui";
import { SCENES } from "./scenes";
import { SCENES as SCENES_TR } from "./tr/scenes";

const CREDITS_S = 18;
const clamp = (x: number) => Math.max(0, Math.min(1, x));

type Credit = { key: string; title: string; author: string; license: string };
type Timeline = { total: number; scenes: SceneData[] };
type Cfg = { timeline: Timeline; scenes: Record<string, React.FC>; credits: Credit[]; vo: string; lang: "en" | "tr" };

const TEXT = {
  en: { locale: "en-US", silhouette: "Illustrative silhouette", title: "IMAGE CREDITS", sub: "ARCHIVAL IMAGES VIA WIKIMEDIA COMMONS · ILLUSTRATIONS, MAPS & NARRATION ARE ORIGINAL / SYNTHETIC", foot: "MODERN BORDERS SHOWN ON MAPS · 1941 CONTROL APPROXIMATE · NATURAL EARTH DATA" },
  tr: { locale: "tr-TR", silhouette: "Sembolik siluet", title: "GÖRSEL KAYNAKLAR", sub: "ARŞİV GÖRSELLERİ WİKİMEDYA COMMONS ÜZERİNDEN · İLLÜSTRASYONLAR VE HARİTALAR ÖZGÜNDÜR", foot: "HARİTALARDA MODERN SINIRLAR · 1941 KONTROLÜ YAKLAŞIK · NATURAL EARTH VERİLERİ" },
};

// [scene id, sentence index, seconds of near-silence]
const DIPS: [string, number, number][] = [["1", 8, 2.4], ["2", 14, 2.2], ["6", 13, 2.6], ["8", 11, 2.0], ["10B", 7, 2.2], ["13", 6, 4]];

export const buildDocu = (cfg: Cfg) => {
  const { timeline, credits, lang } = cfg;
  const T = TEXT[lang];
  const frames = Math.ceil((timeline.total + 2 + CREDITS_S) * FPS);

  const dipWindows: [number, number][] = [];
  for (const [id, i, d] of DIPS) {
    const sc = timeline.scenes.find((s) => s.id === id);
    if (sc && sc.sentences[i]) dipWindows.push([sc.start + sc.sentences[i].start - 0.2, sc.start + sc.sentences[i].start + d]);
  }
  const musicVol = (f: number): number => {
    const t = f / FPS;
    let v = 0.21 * clamp(t / 3) * clamp((timeline.total + CREDITS_S - t) / 4);
    for (const [a, b] of dipWindows) if (t > a - 0.5 && t < b + 0.8) v *= 1 - 0.88 * clamp((t - (a - 0.5)) / 0.5) * (1 - clamp((t - b) / 0.8));
    return v;
  };

  const Subs: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame / FPS;
    let text = "";
    let op = 0;
    for (const sc of timeline.scenes) {
      for (const s of sc.sentences) {
        const a = sc.start + s.start;
        const b = a + s.dur + 0.25;
        if (t >= a && t <= b) {
          text = s.text;
          op = Math.min(clamp((t - a) / 0.25), clamp((b - t) / 0.25));
        }
      }
    }
    if (!text) return null;
    return (
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, display: "flex", justifyContent: "center", opacity: op }}>
        <div style={{
          maxWidth: 1040, textAlign: "center", fontFamily: F.head, fontWeight: 500, fontSize: 27, letterSpacing: 0.6, color: C.white, lineHeight: 1.25,
          background: "rgba(0,0,0,.55)", padding: "6px 18px", borderRadius: 4, textShadow: "0 2px 3px #000",
        }}>{text}</div>
      </div>
    );
  };

  const CreditsScene: React.FC = () => {
    const f = useCurrentFrame();
    const n = CREDITS_S * FPS;
    const y = 740 - (f / n) * (credits.length * 74 + 740);
    const op = Math.min(clamp(f / 12), clamp((n - f) / 24));
    return (
      <AbsoluteFill style={{ background: C.bg, opacity: op }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center" }}>
          <div style={{ fontFamily: F.head, fontWeight: 700, fontSize: 44, letterSpacing: 10, color: C.gold, marginBottom: 6 }}>{T.title}</div>
          <div style={{ fontFamily: F.head, fontSize: 18, letterSpacing: 4, color: C.grey, marginBottom: 34 }}>{T.sub}</div>
          {credits.map((c) => (
            <div key={c.key} style={{ marginBottom: 22 }}>
              <div style={{ fontFamily: F.head, fontWeight: 500, fontSize: 24, letterSpacing: 1.5, color: C.white }}>{c.title}</div>
              <div style={{ fontFamily: F.type, fontSize: 17, color: C.grey }}>{c.author} · {c.license}</div>
            </div>
          ))}
          <div style={{ fontFamily: F.head, fontSize: 18, letterSpacing: 3, color: C.grey, marginTop: 30 }}>{T.foot}</div>
        </div>
      </AbsoluteFill>
    );
  };

  const Frame: React.FC<{ sc: SceneData; children: React.ReactNode }> = ({ sc, children }) => {
    const f = useCurrentFrame();
    const n = Math.round(sc.dur * FPS);
    const a = Math.min(clamp(f / 8), clamp((n - f) / 8));
    const flick = 0.965 + 0.035 * Math.abs(Math.sin(f * 12.9898) * 43758.5453 % 1);
    return (
      <AbsoluteFill style={{ opacity: a * flick, background: C.bg }}>
        <ScCtx.Provider value={{ sc, S: (i) => sc.sentences[i].start, E: (i) => sc.sentences[i].start + sc.sentences[i].dur, D: sc.dur }}>
          {children}
        </ScCtx.Provider>
      </AbsoluteFill>
    );
  };

  const Component: React.FC = () => {
    const [handle] = useState(() => delayRender("fonts"));
    useEffect(() => {
      Promise.all([
        document.fonts.load("700 40px Oswald", "ĞŞİıçöü"), document.fonts.load("500 40px Oswald", "ĞŞİıçöü"),
        document.fonts.load("400 40px 'Special Elite'", "ĞŞİıçöü"), document.fonts.load("700 40px 'Playfair Display'", "ĞŞİıçöü"),
      ]).then(() => continueRender(handle)).catch(() => continueRender(handle));
    }, [handle]);
    const f = useCurrentFrame();
    return (
      <LangCtx.Provider value={{ locale: T.locale, silhouette: T.silhouette }}>
        <div lang={lang} style={{ position: "absolute", inset: 0 }}>
          <AbsoluteFill style={{ background: "#000" }}>
            <Audio src={staticFile(cfg.vo)} volume={1} />
            <Audio src={staticFile("music.m4a")} volume={musicVol} />
            {timeline.scenes.map((sc) => {
              const V = cfg.scenes[sc.id];
              return (
                <Sequence key={sc.id} from={Math.round(sc.start * FPS)} durationInFrames={Math.round(sc.dur * FPS) + 1}>
                  <Frame sc={sc}><V /></Frame>
                </Sequence>
              );
            })}
            <Sequence from={Math.round(timeline.total * FPS)} durationInFrames={CREDITS_S * FPS + FPS * 2}><CreditsScene /></Sequence>
            <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.65) 100%)", pointerEvents: "none" }} />
            <AbsoluteFill style={{
              backgroundImage: `url(${staticFile("grain.png")})`, backgroundSize: "cover", mixBlendMode: "overlay", opacity: 0.16,
              transform: `translate(${(f % 3) * 6 - 6}px, ${((f * 7) % 3) * 6 - 6}px) scale(1.05)`, pointerEvents: "none",
            }} />
            <Subs />
          </AbsoluteFill>
        </div>
      </LangCtx.Provider>
    );
  };
  return { Component, frames };
};

const en = buildDocu({ timeline: timelineEn as Timeline, scenes: SCENES, credits: creditsEn as Credit[], vo: "vo.m4a", lang: "en" });
const tr = buildDocu({ timeline: timelineTr as Timeline, scenes: SCENES_TR, credits: creditsTr as Credit[], vo: "vo_tr.m4a", lang: "tr" });
export const Docu = en.Component;
export const TOTAL_FRAMES = en.frames;
export const DocuTR = tr.Component;
export const TOTAL_FRAMES_TR = tr.frames;
