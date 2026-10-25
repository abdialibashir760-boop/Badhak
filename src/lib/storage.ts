import { emptyProgress, emptyStats, type ProgressState } from "./progress";

/**
 * Storage is hidden behind this small interface. To move to a database
 * (for example Supabase) later, write another adapter with the same two
 * methods and pass it to ProgressProvider.
 */
export interface ProgressStorage {
  load(): ProgressState;
  save(state: ProgressState): boolean;
  clear(): void;
}

export const STORAGE_KEY = "turkcem.progress.v1";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0);
const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Rebuilds a valid state from unknown data, dropping anything malformed. */
export function sanitizeProgress(raw: unknown): ProgressState {
  const state = emptyProgress();
  if (!isRecord(raw)) return state;

  if (isRecord(raw.completedLessons)) {
    for (const [id, v] of Object.entries(raw.completedLessons)) {
      if (isRecord(v)) state.completedLessons[id] = { score: num(v.score), total: num(v.total), completedAt: str(v.completedAt) };
    }
  }
  if (isRecord(raw.completedScenarios)) {
    for (const [id, v] of Object.entries(raw.completedScenarios)) {
      if (isRecord(v)) state.completedScenarios[id] = { good: num(v.good), total: num(v.total), completedAt: str(v.completedAt) };
    }
  }
  if (isRecord(raw.savedPhrases)) {
    for (const [id, v] of Object.entries(raw.savedPhrases)) {
      if (!isRecord(v)) continue;
      const difficulty = v.difficulty === "easy" || v.difficulty === "difficult" ? v.difficulty : null;
      state.savedPhrases[id] = { savedAt: str(v.savedAt), difficulty };
    }
  }
  if (isRecord(raw.stats)) {
    const base = emptyStats();
    for (const key of Object.keys(base) as (keyof typeof base)[]) base[key] = num(raw.stats[key]);
    state.stats = base;
  }
  if (isRecord(raw.dailyExercises)) {
    for (const [day, n] of Object.entries(raw.dailyExercises)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(day)) state.dailyExercises[day] = num(n);
    }
  }
  if (Array.isArray(raw.activity)) {
    const types = ["lesson", "scenario", "save", "remove"];
    state.activity = raw.activity
      .filter(isRecord)
      .filter((a) => types.includes(a.type as string) && typeof a.label === "string")
      .map((a) => ({ type: a.type as ProgressState["activity"][number]["type"], label: a.label as string, at: str(a.at) }))
      .slice(0, 30);
  }
  return state;
}

export const localProgressStorage: ProgressStorage = {
  load() {
    try {
      const text = window.localStorage.getItem(STORAGE_KEY);
      return text ? sanitizeProgress(JSON.parse(text)) : emptyProgress();
    } catch {
      return emptyProgress();
    }
  },
  save(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clear */
    }
  },
};
