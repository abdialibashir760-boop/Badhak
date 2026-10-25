/**
 * Pure functions that describe the learner's progress. No browser APIs live
 * here, so the same logic can be tested and later reused with a database.
 */

export type Difficulty = "easy" | "difficult";

export type ActivityType = "lesson" | "scenario" | "save" | "remove";

export interface ActivityItem {
  type: ActivityType;
  label: string;
  at: string; // ISO timestamp
}

export interface SavedPhrase {
  savedAt: string;
  difficulty: Difficulty | null;
}

export interface Stats {
  practiceAnswered: number;
  practiceGood: number;
  quizAnswered: number;
  quizCorrect: number;
  recallAnswered: number;
  recallCorrect: number;
  flashcardsReviewed: number;
}

export interface ProgressState {
  version: 1;
  completedLessons: Record<string, { score: number; total: number; completedAt: string }>;
  completedScenarios: Record<string, { good: number; total: number; completedAt: string }>;
  savedPhrases: Record<string, SavedPhrase>;
  stats: Stats;
  /** Number of exercises done per local day, keyed "YYYY-MM-DD". */
  dailyExercises: Record<string, number>;
  activity: ActivityItem[]; // newest first
}

export const DAILY_GOAL = 10;
const MAX_ACTIVITY = 30;
const MAX_DAYS_KEPT = 60;

export const emptyStats = (): Stats => ({
  practiceAnswered: 0,
  practiceGood: 0,
  quizAnswered: 0,
  quizCorrect: 0,
  recallAnswered: 0,
  recallCorrect: 0,
  flashcardsReviewed: 0,
});

export const emptyProgress = (): ProgressState => ({
  version: 1,
  completedLessons: {},
  completedScenarios: {},
  savedPhrases: {},
  stats: emptyStats(),
  dailyExercises: {},
  activity: [],
});

export function dayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

function withActivity(state: ProgressState, item: ActivityItem): ProgressState {
  return { ...state, activity: [item, ...state.activity].slice(0, MAX_ACTIVITY) };
}

function bumpDay(state: ProgressState, now: Date): ProgressState {
  const key = dayKey(now);
  const days = { ...state.dailyExercises, [key]: (state.dailyExercises[key] ?? 0) + 1 };
  const keys = Object.keys(days).sort();
  for (const old of keys.slice(0, Math.max(0, keys.length - MAX_DAYS_KEPT))) delete days[old];
  return { ...state, dailyExercises: days };
}

export function savePhrase(state: ProgressState, phraseId: string, label: string, now = new Date()): ProgressState {
  if (state.savedPhrases[phraseId]) return state;
  const next = {
    ...state,
    savedPhrases: { ...state.savedPhrases, [phraseId]: { savedAt: now.toISOString(), difficulty: null } },
  };
  return withActivity(next, { type: "save", label, at: now.toISOString() });
}

export function removePhrase(state: ProgressState, phraseId: string, label: string, now = new Date()): ProgressState {
  if (!state.savedPhrases[phraseId]) return state;
  const saved = { ...state.savedPhrases };
  delete saved[phraseId];
  return withActivity({ ...state, savedPhrases: saved }, { type: "remove", label, at: now.toISOString() });
}

export function setDifficulty(state: ProgressState, phraseId: string, difficulty: Difficulty | null): ProgressState {
  const current = state.savedPhrases[phraseId];
  if (!current) return state;
  return { ...state, savedPhrases: { ...state.savedPhrases, [phraseId]: { ...current, difficulty } } };
}

export function recordPracticeAnswer(state: ProgressState, good: boolean, now = new Date()): ProgressState {
  const stats = {
    ...state.stats,
    practiceAnswered: state.stats.practiceAnswered + 1,
    practiceGood: state.stats.practiceGood + (good ? 1 : 0),
  };
  return bumpDay({ ...state, stats }, now);
}

export function recordQuizAnswer(state: ProgressState, correct: boolean, now = new Date()): ProgressState {
  const stats = {
    ...state.stats,
    quizAnswered: state.stats.quizAnswered + 1,
    quizCorrect: state.stats.quizCorrect + (correct ? 1 : 0),
  };
  return bumpDay({ ...state, stats }, now);
}

export function recordRecallAnswer(state: ProgressState, correct: boolean, now = new Date()): ProgressState {
  const stats = {
    ...state.stats,
    recallAnswered: state.stats.recallAnswered + 1,
    recallCorrect: state.stats.recallCorrect + (correct ? 1 : 0),
  };
  return bumpDay({ ...state, stats }, now);
}

export function recordFlashcard(state: ProgressState, phraseId: string, knew: boolean, now = new Date()): ProgressState {
  const stats = { ...state.stats, flashcardsReviewed: state.stats.flashcardsReviewed + 1 };
  const next = setDifficulty({ ...state, stats }, phraseId, knew ? "easy" : "difficult");
  return bumpDay(next, now);
}

export function completeLesson(
  state: ProgressState,
  lessonId: string,
  title: string,
  score: number,
  total: number,
  now = new Date(),
): ProgressState {
  const previous = state.completedLessons[lessonId];
  const best = previous && previous.score > score ? previous : { score, total, completedAt: now.toISOString() };
  const next = { ...state, completedLessons: { ...state.completedLessons, [lessonId]: best } };
  return withActivity(next, { type: "lesson", label: `${title} (${score}/${total})`, at: now.toISOString() });
}

export function completeScenario(
  state: ProgressState,
  scenarioId: string,
  title: string,
  good: number,
  total: number,
  now = new Date(),
): ProgressState {
  const previous = state.completedScenarios[scenarioId];
  const best = previous && previous.good > good ? previous : { good, total, completedAt: now.toISOString() };
  const next = { ...state, completedScenarios: { ...state.completedScenarios, [scenarioId]: best } };
  return withActivity(next, { type: "scenario", label: `${title} (${good}/${total})`, at: now.toISOString() });
}

export function exercisesToday(state: ProgressState, now = new Date()): number {
  return state.dailyExercises[dayKey(now)] ?? 0;
}

export function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}
