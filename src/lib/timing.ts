import type {SceneConfig} from '../config/types';
import {FPS} from '../config/types';

export type Word = {text: string; emph: boolean; start: number; end: number};
export type Cue = {words: Word[]; lines: Word[][]; start: number; end: number; showEnd: number};
export type SceneTiming = {
  cues: Cue[];
  words: Word[];
  speechStart: number;
  speechEnd: number;
  /** Local frame at which the first word matching `keyword` starts (undefined if absent). */
  find: (keyword: string, nth?: number) => number | undefined;
  /** Same as find, but falls back to a fraction of the scene when the word was edited out. */
  at: (keyword: string, fallbackP: number, nth?: number) => number;
  /** Local frame at which the n-th sentence begins. */
  sentence: (n: number) => number;
  dur: number;
};

export const sceneFrames = (s: SceneConfig) => Math.max(15, Math.round(s.durationSec * FPS));

const MAX_CUE_CHARS = 62;
const MAX_LINE_CHARS = 34;

const clean = (t: string) => t.replace(/\*/g, '');

/** Break a list of words into cues (<= ~62 chars), preferring comma boundaries. */
const chunk = (ws: Word[]): Word[][] => {
  const len = ws.reduce((n, w) => n + w.text.length + 1, 0);
  if (len <= MAX_CUE_CHARS || ws.length < 4) return [ws];
  let best = Math.floor(ws.length / 2);
  let bestScore = Infinity;
  let acc = 0;
  for (let i = 0; i < ws.length - 1; i++) {
    acc += ws[i].text.length + 1;
    const comma = /[,;:—-]$/.test(ws[i].text) ? -8 : 0;
    const score = Math.abs(acc - len / 2) + comma;
    if (score < bestScore) {
      bestScore = score;
      best = i + 1;
    }
  }
  return [...chunk(ws.slice(0, best)), ...chunk(ws.slice(best))];
};

const breakLines = (ws: Word[]): Word[][] => {
  const total = ws.reduce((n, w) => n + w.text.length + 1, 0);
  if (total <= MAX_LINE_CHARS) return [ws];
  let acc = 0;
  let split = 1;
  let best = Infinity;
  for (let i = 0; i < ws.length - 1; i++) {
    acc += ws[i].text.length + 1;
    const d = Math.abs(acc - total / 2);
    if (d < best) {
      best = d;
      split = i + 1;
    }
  }
  return [ws.slice(0, split), ws.slice(split)];
};

export const buildTiming = (scene: SceneConfig): SceneTiming => {
  const dur = sceneFrames(scene);
  const speechStart = Math.round(scene.leadSec * FPS);
  const speechEnd = Math.max(speechStart + 10, dur - Math.round(scene.tailSec * FPS));

  // Tokenise, tracking *emphasis* across tokens. `[pause:1.5]` inserts 1.5 s of silence (and ends the subtitle cue).
  let emph = false;
  type Tok = {text: string; emph: boolean; weight: number; sentenceEnd: boolean; pauseFrames: number};
  const tokens: Tok[] = [];
  for (const raw of scene.narration.trim().split(/\s+/).filter(Boolean)) {
    const pm = /^\[pause:([\d.]+)\]$/.exec(raw);
    if (pm) {
      if (tokens.length) tokens[tokens.length - 1].sentenceEnd = true;
      tokens.push({text: '', emph: false, weight: 0, sentenceEnd: false, pauseFrames: Math.round(parseFloat(pm[1]) * FPS)});
      continue;
    }
    const startsEmph = raw.startsWith('*') || emph;
    const toggles = (raw.match(/\*/g) ?? []).length;
    const text = clean(raw);
    if (!text) continue;
    const sentenceEnd = /[.!?…]$/.test(text);
    const comma = /[,;:—]$/.test(text);
    tokens.push({
      text,
      emph: startsEmph,
      weight: Math.max(3, text.length + 1) + (sentenceEnd ? 7 : comma ? 3 : 0),
      sentenceEnd,
      pauseFrames: 0,
    });
    if (toggles % 2 === 1) emph = !emph;
  }

  const pauseTotal = tokens.reduce((n, t) => n + t.pauseFrames, 0);
  const totalW = tokens.reduce((n, t) => n + t.weight, 0) || 1;
  const span = Math.max(10, speechEnd - speechStart - pauseTotal);
  let cursor = speechStart;
  const words: Word[] = [];
  const wordTokens: Tok[] = [];
  for (const t of tokens) {
    if (t.pauseFrames) {
      cursor += t.pauseFrames;
      continue;
    }
    const start = cursor;
    cursor += (t.weight / totalW) * span;
    const pause = t.sentenceEnd ? 0.22 : 0;
    words.push({text: t.text, emph: t.emph, start, end: cursor - (cursor - start) * pause});
    wordTokens.push(t);
  }

  // Sentences -> cues.
  const sentences: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    if (wordTokens[i].sentenceEnd) {
      sentences.push(cur);
      cur = [];
    }
  });
  if (cur.length) sentences.push(cur);

  const sentenceStarts = sentences.map((s) => s[0].start);
  const groups = sentences.flatMap(chunk);
  const cues: Cue[] = groups.map((g, i) => {
    const start = g[0].start;
    const end = g[g.length - 1].end;
    const next = groups[i + 1]?.[0].start ?? dur;
    return {words: g, lines: breakLines(g), start, end, showEnd: Math.min(next, end + 0.55 * FPS)};
  });

  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const find = (keyword: string, nth = 0) => {
    const k = norm(keyword);
    const hits = words.filter((w) => norm(w.text).startsWith(k));
    return hits[nth]?.start;
  };

  return {
    cues,
    words,
    speechStart,
    speechEnd,
    dur,
    find,
    at: (keyword, fallbackP, nth = 0) => find(keyword, nth) ?? fallbackP * dur,
    sentence: (n) => sentenceStarts[Math.min(n, sentenceStarts.length - 1)] ?? speechStart,
  };
};

/** Absolute start frame of every scene. */
export const sceneStarts = (scenes: SceneConfig[]) => {
  let f = 0;
  return scenes.map((s) => {
    const start = f;
    f += sceneFrames(s);
    return start;
  });
};

export const totalFrames = (scenes: SceneConfig[]) => scenes.reduce((n, s) => n + sceneFrames(s), 0);

/**
 * Re-time scenes so the whole film matches `audioSec`. Each scene receives a
 * share proportional to how much speech it holds (plus its lead/tail silence).
 */
export const fitScenesToAudio = (scenes: SceneConfig[], audioSec: number): SceneConfig[] => {
  const weights = scenes.map((s) => {
    const tm = buildTiming({...s, leadSec: 0, tailSec: 0});
    return tm.words.reduce((n, w) => n + (w.end - w.start), 0) / FPS + s.leadSec + s.tailSec;
  });
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  return scenes.map((s, i) => ({...s, durationSec: Math.round(((weights[i] / sum) * audioSec) * 10) / 10}));
};
