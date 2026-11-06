import override from "./beats.override.json";
import { BEATS, SECTIONS, wordCount } from "./narration";
import { SHOT_LIST, type ShotMeta } from "./shotList";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL_S = 240;
export const TOTAL_FRAMES = TOTAL_S * FPS;

/** Narration pace used until real audio is supplied (documentary read ≈ 150 wpm). */
const WORDS_PER_SEC = 2.5;
/** Breath between beats, and extra air at the start of a new chapter. */
const GAP = 0.45;
const CHAPTER_AIR = 0.6;
/** Dramatic pauses in the finale (the pull-back needs room to breathe). */
const EXTRA_AIR: Record<string, number> = { B26: 2.5, B27: 2.0, B28: 1.5, B29: 2.0 };
/** Beat → speech duration (s) measured from the recorded voice; written by `npm run retime`. */
const measured = (override as { speech?: Record<string, number> }).speech ?? {};

export type Slot = { id: string; text: string; section: number; start: number; dur: number; speechStart: number; speechDur: number };

/** Ordered timeline: silent pre-roll, 29 narration beats, a title beat after the hook, end card. */
export function buildSlots(): Slot[] {
  const raw: { id: string; text: string; section: number; dur: number; speech: number; lead: number }[] = [];
  raw.push({ id: "P0", text: "", section: 1, dur: 2.0, speech: 0, lead: 0 });
  let lastSection = 1;
  for (const b of BEATS) {
    const speech = measured[b.id] ?? wordCount(b.text) / WORDS_PER_SEC;
    const air = b.section !== lastSection ? CHAPTER_AIR : 0;
    lastSection = b.section;
    raw.push({ id: b.id, text: b.text, section: b.section, dur: speech + GAP + air + (EXTRA_AIR[b.id] ?? 0), speech, lead: air * 0.6 });
    if (b.id === "B03") raw.push({ id: "T1", text: "", section: 1, dur: 3.5, speech: 0, lead: 0 });
  }
  const used = raw.reduce((a, r) => a + r.dur, 0);
  raw.push({ id: "END", text: "", section: 6, dur: Math.max(4, TOTAL_S - used), speech: 0, lead: 0 });
  let t = 0;
  return raw.map((r) => {
    const s: Slot = { id: r.id, text: r.text, section: r.section, start: t, dur: r.dur, speechStart: t + r.lead + 0.1, speechDur: r.speech };
    t += r.dur;
    return s;
  });
}

export const SLOTS = buildSlots();
export const slotById = (id: string) => SLOTS.find((s) => s.id === id)!;

export type Shot = ShotMeta & { start: number; dur: number; end: number; index: number };

/** Shots share their beat's window in proportion to their weights. */
export function buildShots(): Shot[] {
  const out: Shot[] = [];
  const groups = new Map<string, ShotMeta[]>();
  for (const s of SHOT_LIST) groups.set(s.beat, [...(groups.get(s.beat) ?? []), s]);
  for (const [beat, list] of groups) {
    const slot = slotById(beat);
    const wsum = list.reduce((a, s) => a + s.w, 0);
    let t = slot.start;
    for (const s of list) {
      const dur = (slot.dur * s.w) / wsum;
      out.push({ ...s, start: t, dur, end: t + dur, index: 0 });
      t += dur;
    }
  }
  out.sort((a, b) => a.start - b.start);
  return out.map((s, i) => ({ ...s, index: i }));
}

export const SHOTS = buildShots();
export const sectionAt = (t: number) => {
  const slot = [...SLOTS].reverse().find((s) => t >= s.start) ?? SLOTS[0];
  return SECTIONS.find((x) => x.n === slot.section)!;
};

/** First beat of every chapter (used for chapter tags and rail ticks). */
export const SECTIONS_AT = new Set(['B01', 'B04', 'B09', 'B14', 'B20', 'B26']);
