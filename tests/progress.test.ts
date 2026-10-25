import { describe, expect, it } from "vitest";
import { allPhrases, lessons, scenarios } from "@/data";
import * as P from "@/lib/progress";
import { sanitizeProgress } from "@/lib/storage";

const now = new Date(2026, 5, 10, 12, 0, 0);

describe("progress logic", () => {
  it("saves and removes phrases", () => {
    let s = P.savePhrase(P.emptyProgress(), "a.1", "Merhaba", now);
    expect(Object.keys(s.savedPhrases)).toEqual(["a.1"]);
    expect(P.savePhrase(s, "a.1", "Merhaba", now)).toBe(s); // no duplicate
    s = P.removePhrase(s, "a.1", "Merhaba", now);
    expect(s.savedPhrases).toEqual({});
    expect(s.activity.map((a) => a.type)).toEqual(["remove", "save"]);
  });

  it("marks difficulty only on saved phrases", () => {
    const empty = P.emptyProgress();
    expect(P.setDifficulty(empty, "x", "easy")).toBe(empty);
    let s = P.savePhrase(empty, "x", "x", now);
    s = P.setDifficulty(s, "x", "difficult");
    expect(s.savedPhrases.x.difficulty).toBe("difficult");
  });

  it("counts answers and daily exercises", () => {
    let s = P.recordPracticeAnswer(P.emptyProgress(), true, now);
    s = P.recordQuizAnswer(s, false, now);
    s = P.recordRecallAnswer(s, true, now);
    expect(s.stats).toMatchObject({ practiceAnswered: 1, practiceGood: 1, quizAnswered: 1, quizCorrect: 0, recallAnswered: 1, recallCorrect: 1 });
    expect(P.exercisesToday(s, now)).toBe(3);
    expect(P.exercisesToday(s, new Date(2026, 5, 11))).toBe(0);
  });

  it("keeps the best lesson score", () => {
    let s = P.completeLesson(P.emptyProgress(), "l", "Lesson", 3, 3, now);
    s = P.completeLesson(s, "l", "Lesson", 1, 3, now);
    expect(s.completedLessons.l.score).toBe(3);
  });

  it("flashcard answers update difficulty", () => {
    let s = P.savePhrase(P.emptyProgress(), "x", "x", now);
    s = P.recordFlashcard(s, "x", false, now);
    expect(s.savedPhrases.x.difficulty).toBe("difficult");
    s = P.recordFlashcard(s, "x", true, now);
    expect(s.savedPhrases.x.difficulty).toBe("easy");
    expect(s.stats.flashcardsReviewed).toBe(2);
  });
});

describe("storage sanitising", () => {
  it("survives malformed data", () => {
    for (const bad of [null, 5, "text", [], { savedPhrases: 3, stats: "x", activity: "no" }]) {
      expect(sanitizeProgress(bad)).toEqual(P.emptyProgress());
    }
  });

  it("keeps valid parts and drops invalid parts", () => {
    const s = sanitizeProgress({
      savedPhrases: { a: { savedAt: "t", difficulty: "easy" }, b: { difficulty: "weird" }, c: 4 },
      stats: { practiceAnswered: 4, quizAnswered: -2 },
      activity: [{ type: "lesson", label: "L", at: "t" }, { type: "bogus", label: "x" }],
    });
    expect(s.savedPhrases.a.difficulty).toBe("easy");
    expect(s.savedPhrases.b.difficulty).toBeNull();
    expect(s.savedPhrases.c).toBeUndefined();
    expect(s.stats.practiceAnswered).toBe(4);
    expect(s.stats.quizAnswered).toBe(0);
    expect(s.activity).toHaveLength(1);
  });
});

describe("content integrity", () => {
  it("has unique ids and valid quiz answers", () => {
    const ids = allPhrases.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of lessons) {
      expect(l.phrases.length).toBeGreaterThan(0);
      for (const q of l.quiz) {
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      }
    }
  });

  it("every scenario step has exactly one best option and a wrong option", () => {
    for (const s of scenarios) {
      for (const step of s.steps) {
        expect(step.options.filter((o) => o.fit === "best")).toHaveLength(1);
        expect(step.options.some((o) => o.fit === "off")).toBe(true);
      }
    }
  });
});
