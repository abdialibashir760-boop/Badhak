import React, { createContext, useContext, useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Chip, LANDSCAPE, Overlay, PORTRAIT } from "./Overlay";
import { FPS, clamp } from "./math";

export type Lang = "en" | "tr";
export type Line = { id: string; cap: string; start: number; end: number };

/** Start/end lookups for one language's narration timeline. */
export const makeTL = (lines: Line[]) => ({
  lines,
  S: (id: string): number => {
    const l = lines.find((x) => x.id === id);
    if (!l) throw new Error(`unknown line ${id}`);
    return l.start;
  },
  E: (id: string): number => lines.find((x) => x.id === id)!.end,
});
export type TL = ReturnType<typeof makeTL>;
export const TLContext = createContext<TL>(makeTL([]));
export const useTL = () => useContext(TLContext);

export type SceneDef = { from: string; C: React.FC<{ t: number }> };
export type StoryData = { LINES: Line[]; NARRATION_END: number; TOTAL_SECONDS: number };

type Props<S extends { tag: string }> = {
  lang: Lang;
  wide: boolean;
  /** Scenes in order; each starts just before its first narration line and crossfades into the next. */
  scenes: SceneDef[];
  data: Record<Lang, StoryData>;
  audio: Record<Lang, string>;
  strings: Record<Lang, S>;
  StringsContext: React.Context<S>;
  chips: (tl: TL, L: S) => Chip[];
  endCard: (L: S, wide: boolean) => React.ReactNode;
  /** Seconds at which a white flash starts (optional). */
  flashAt?: (tl: TL) => number;
};

const XFADE = 0.35;
/** Scenes are drawn in a 1080×1920 design space. For 16:9 the art zone (design y 320–1240) is scaled and centred. */
const WIDE_K = 0.9;
const WIDE_TOP = 75; // screen y where design y 320 lands
const WIDE_TRANSFORM = `translate(${960 - 540 * WIDE_K} ${WIDE_TOP - 320 * WIDE_K}) scale(${WIDE_K})`;

export function StoryVideo<S extends { tag: string }>({ lang, wide, scenes, data, audio, strings, StringsContext, chips, endCard, flashAt }: Props<S>) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const d = data[lang];
  const tl = useMemo(() => makeTL(d.LINES), [d]);
  const L = strings[lang];
  const starts = useMemo(() => scenes.map((s, i) => (i === 0 ? 0 : tl.S(s.from) - 0.25)), [tl, scenes]);
  const f0 = flashAt ? flashAt(tl) : Infinity;
  const flash = 0.85 * Math.max(0, 1 - clamp((t - f0) / 0.45)) * (t >= f0 ? 1 : 0);
  const [w, h] = wide ? [1920, 1080] : [1080, 1920];

  return (
    <AbsoluteFill style={{ background: "#05070f" }}>
      <TLContext.Provider value={tl}>
        <StringsContext.Provider value={L}>
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0 }}>
            <g transform={wide ? WIDE_TRANSFORM : undefined}>
              {scenes.map(({ C }, i) => {
                const a0 = starts[i];
                const a1 = i + 1 < scenes.length ? starts[i + 1] : Infinity;
                if (t < a0 || t > a1 + XFADE) return null;
                const fin = i === 0 ? 1 : clamp((t - a0) / XFADE);
                const fout = t < a1 ? 1 : 1 - clamp((t - a1) / XFADE);
                return (
                  <g key={i} opacity={fin * fout}>
                    <C t={t} />
                  </g>
                );
              })}
            </g>
          </svg>
        </StringsContext.Provider>
      </TLContext.Provider>
      <Overlay t={t} flash={flash} lines={d.LINES} chips={chips(tl, L)} narrationEnd={d.NARRATION_END} tag={L.tag} endCard={endCard(L, wide)} layout={wide ? LANDSCAPE : PORTRAIT} />
      <Audio src={staticFile(audio[lang])} />
    </AbsoluteFill>
  );
}
