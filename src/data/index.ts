import { categories } from "./categories";
import { lessons } from "./lessons";
import { scenarios } from "./scenarios";
import type { Phrase } from "./types";

export { categories, lessons, scenarios };
export * from "./types";

export const allPhrases: Phrase[] = lessons.flatMap((l) => l.phrases);

const phraseById = new Map(allPhrases.map((p) => [p.id, p]));
const lessonById = new Map(lessons.map((l) => [l.id, l]));
const scenarioById = new Map(scenarios.map((s) => [s.id, s]));

export const getPhrase = (id: string) => phraseById.get(id);
export const getLesson = (id: string) => lessonById.get(id);
export const getScenario = (id: string) => scenarioById.get(id);

/** Lesson that a phrase belongs to (phrase ids look like "lesson-id.3"). */
export const getLessonForPhrase = (phraseId: string) =>
  lessonById.get(phraseId.split(".")[0]);

/** The phrase of the day changes at midnight and repeats on a fixed cycle. */
export function phraseOfTheDay(date = new Date()): Phrase {
  const dayNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return allPhrases[dayNumber % allPhrases.length];
}
