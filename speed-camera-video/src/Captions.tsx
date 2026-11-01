import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "./theme";
import type { Word } from "./timing";

type Group = { words: Word[]; start: number; end: number };

/** Split the word list into short caption lines (break at punctuation, max ~7 words). */
const makeGroups = (words: Word[], maxWords: number): Group[] => {
  const groups: Group[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) {
      groups.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
    }
  };
  for (const w of words) {
    cur.push(w);
    const hard = /[.?:;]$/.test(w.text);
    const soft = /,$/.test(w.text) && cur.length >= Math.min(4, maxWords - 1);
    if (hard || soft || cur.length >= maxWords) flush();
  }
  flush();
  return groups;
};

export const Captions: React.FC<{
  words: Word[];
  fontSize?: number;
  maxWords?: number;
  top?: number;
  pad?: number;
}> = ({ words, fontSize = 58, maxWords = 7, top, pad = 120 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = useMemo(() => makeGroups(words, maxWords), [words, maxWords]);
  let gi = groups.findIndex((g, i) => t >= g.start - 0.05 && (t < groups[i + 1]?.start - 0.05 || i === groups.length - 1));
  if (gi < 0) gi = 0;
  const g = groups[gi];
  if (!g || t > g.end + 0.8) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        ...(top !== undefined ? { top } : { bottom: 54 }),
        display: "flex",
        justifyContent: "center",
        padding: `0 ${pad}px`,
      }}
    >
      <div
        style={{
          background: "rgba(5,9,18,0.78)",
          borderRadius: 28,
          padding: "16px 38px",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize,
          color: C.text,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: fontSize * 0.28,
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: 1620,
          boxSizing: "border-box",
          border: "2px solid rgba(255,255,255,0.08)",
        }}
      >
        {g.words.map((w, i) => {
          const active = t >= w.start - 0.02 && t < w.end + 0.12;
          const past = t >= w.end + 0.12;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                scale: active ? "1.1" : "1",
                color: active ? C.accent : past ? C.text : "rgba(248,250,252,0.55)",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
