import beatsJson from '../docs/beats.json';
import synced from './generated/narration.json';

export const FPS = 30;
export const TOTAL_SECONDS = 240;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;

export type SectionId = 'hook' | 'newton' | 'einstein' | 'orbits' | 'time' | 'finale';
export const SECTIONS: { id: SectionId; title: string; from: number; to: number; lead: number; tail: number }[] = [
  { id: 'hook', title: 'The Hook', from: 0, to: 25, lead: 0.8, tail: 0.5 },
  { id: 'newton', title: "Newton's Explanation", from: 25, to: 65, lead: 1.4, tail: 0.6 },
  { id: 'einstein', title: 'Einstein Changes the Picture', from: 65, to: 115, lead: 1.4, tail: 0.6 },
  { id: 'orbits', title: 'Why Planets Orbit', from: 115, to: 160, lead: 1.2, tail: 0.6 },
  { id: 'time', title: 'Gravity and Time', from: 160, to: 205, lead: 1.2, tail: 0.6 },
  { id: 'finale', title: 'The Big Picture', from: 205, to: 240, lead: 0.8, tail: 3.5 },
];

export type Beat = { id: string; section: SectionId; text: string; start: number; end: number; real: boolean };

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/**
 * Beat timings. With no narration audio yet, each beat gets a share of its section's speaking window
 * proportional to its word count. `scripts/sync-narration.mjs` replaces this with real audio durations
 * (written to src/generated/narration.json) once the voice-over files exist.
 */
export const BEATS: Beat[] = (() => {
  const real = synced as Record<string, { start: number; end: number }>;
  const out: Beat[] = [];
  for (const sec of SECTIONS) {
    const bs = (beatsJson as { id: string; section: string; text: string }[]).filter((b) => b.section === sec.id);
    const a = sec.from + sec.lead, z = sec.to - sec.tail;
    const gap = 0.45;
    const usable = z - a - gap * (bs.length - 1);
    const totalW = bs.reduce((n, b) => n + words(b.text), 0);
    let cur = a;
    for (const b of bs) {
      const d = (words(b.text) / totalW) * usable;
      const r = real[b.id];
      out.push({ id: b.id, section: sec.id, text: b.text, start: r ? r.start : cur, end: r ? r.end : cur + d, real: !!r });
      cur += d + gap;
    }
  }
  return out;
})();

export type Caption = { text: string; start: number; end: number };

/** Sentence-level captions; each sentence gets time proportional to its length inside its beat. */
export const CAPTIONS: Caption[] = BEATS.flatMap((b) => {
  const sentences = b.text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [b.text];
  const total = sentences.reduce((n, s) => n + s.length, 0);
  let cur = b.start;
  return sentences.map((s) => {
    const d = ((b.end - b.start) * s.length) / total;
    const c = { text: s, start: cur, end: cur + d };
    cur += d;
    return c;
  });
});
