import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "./theme";
import type { Word } from "./timing";

type Group = { words: Word[]; start: number; end: number };

/** Split the word list into short caption lines (break at punctuation, max ~7 words). */
const makeGroups = (words: Word[]): Group[] => {
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
    const soft = /,$/.test(w.text) && cur.length >= 4;
    if (hard || soft || cur.length >= 7) flush();
  }
  flush();
  return groups;
};

export const Captions: React.FC<{ words: Word[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = useMemo(() => makeGroups(words), [words]);
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
        bottom: 54,
        display: "flex",
        justifyContent: "center",
        padding: "0 120px",
      }}
    >
      <div
        style={{
          background: "rgba(5,9,18,0.78)",
          borderRadius: 28,
          padding: "16px 38px",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 58,
          color: C.text,
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: 1620,
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
                color: active ? C.accent : past ? C.text : "rgba(248,250,252,0.55)",
                marginRight: i < g.words.length - 1 ? 16 : 0,
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
