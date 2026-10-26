import timing from "./timing.json";
import storyboard from "./storyboard.json";

export const FPS: number = timing.fps;
export const TOTAL_FRAMES: number = timing.totalFrames;
export const WIDTH: number = storyboard.width;
export const HEIGHT: number = storyboard.height;

export const sec = (s: number) => Math.round(s * FPS);

export type Sentence = { i: number; text: string; start: number; end: number };
export const sentences: Sentence[] = timing.sentences;

/** Global start/end frame of a narration sentence. */
export const sStart = (i: number) => sec(sentences[i].start);
export const sEnd = (i: number) => sec(sentences[i].end);

const events = timing.events as Record<string, number>;
/** Global frame of an authored event ("scene.name", see src/data/events.json). */
export function ev(key: string, offsetSeconds = 0): number {
  const t = events[key];
  if (t === undefined) throw new Error(`Unknown timeline event: ${key}`);
  return sec(t + offsetSeconds);
}

export type SceneId = "opening" | "response" | "approval" | "disappearing" | "firstNo" | "resolution" | "final";
export const FADE = 14; // cross-fade frames between scenes

export const sceneRanges: { id: SceneId; from: number; to: number }[] = timing.scenes.map((s, k, all) => ({
  id: s.id as SceneId,
  from: sec(s.start),
  to: k === all.length - 1 ? TOTAL_FRAMES : sec(all[k + 1].start) + FADE,
}));
