"use client";

import Link from "next/link";
import { useState } from "react";
import { lessons, scenarios } from "@/data";
import { percent } from "@/lib/progress";
import { useProgress } from "./ProgressProvider";
import { EmptyState, ProgressBar, SectionTitle } from "./ui";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card !p-4">
      <p className="text-sm font-medium text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-forest-900">{value}</p>
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

const activityLabel = { lesson: "Completed lesson", scenario: "Finished conversation", save: "Saved", remove: "Removed" } as const;

export function ProgressView() {
  const { state, ready, resetAll } = useProgress();
  const [confirming, setConfirming] = useState(false);

  if (!ready) return <p className="text-ink-soft">Loading your progress…</p>;

  const lessonsDone = Object.keys(state.completedLessons).filter((id) => lessons.some((l) => l.id === id)).length;
  const scenariosDone = Object.keys(state.completedScenarios).filter((id) => scenarios.some((s) => s.id === id)).length;
  const totalItems = lessons.length + scenarios.length;
  const overall = percent(lessonsDone + scenariosDone, totalItems);
  const s = state.stats;
  const savedCount = Object.keys(state.savedPhrases).length;
  const hasActivity = state.activity.length > 0 || s.practiceAnswered + s.quizAnswered + s.recallAnswered + s.flashcardsReviewed > 0;

  return (
    <div className="space-y-8">
      <section className="card" aria-labelledby="overall">
        <h2 id="overall" className="font-display text-xl font-bold text-forest-900">
          Overall progress
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {lessonsDone} of {lessons.length} lessons and {scenariosDone} of {scenarios.length} conversations completed.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar value={overall} label="Overall progress" />
          </div>
          <span className="w-12 text-right font-semibold text-forest-800">{overall}%</span>
        </div>
      </section>

      <section aria-labelledby="numbers">
        <SectionTitle>
          <span id="numbers">Your numbers</span>
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat label="Lessons completed" value={`${lessonsDone}/${lessons.length}`} />
          <Stat
            label="Practice questions answered"
            value={s.practiceAnswered + s.quizAnswered + s.recallAnswered}
            hint={`${s.practiceGood + s.quizCorrect + s.recallCorrect} good answers`}
          />
          <Stat label="Expressions saved" value={savedCount} />
          <Stat label="Conversations finished" value={`${scenariosDone}/${scenarios.length}`} />
          <Stat label="Flashcards reviewed" value={s.flashcardsReviewed} />
          <Stat
            label="Accuracy"
            value={
              s.practiceAnswered + s.quizAnswered + s.recallAnswered === 0
                ? "—"
                : `${percent(
                    s.practiceGood + s.quizCorrect + s.recallCorrect,
                    s.practiceAnswered + s.quizAnswered + s.recallAnswered,
                  )}%`
            }
            hint="Across all questions"
          />
        </div>
      </section>

      <section aria-labelledby="recent">
        <SectionTitle>
          <span id="recent">Recent activity</span>
        </SectionTitle>
        {state.activity.length === 0 ? (
          <EmptyState
            title={hasActivity ? "Nothing to list yet" : "No activity yet"}
            body="Complete a lesson or a conversation, or save an expression, and it will appear here."
            href="/learn"
            action="Start a lesson"
          />
        ) : (
          <ul className="card divide-y divide-forest-100 !p-0">
            {state.activity.slice(0, 10).map((a, i) => (
              <li key={`${a.at}-${i}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span>
                  <span className="font-semibold text-forest-800">{activityLabel[a.type]}:</span> {a.label}
                </span>
                <time dateTime={a.at} className="shrink-0 text-xs text-ink-soft">
                  {a.at ? new Date(a.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : ""}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="font-display text-lg font-bold text-forest-900">Reset progress</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Progress is stored only in this browser. Resetting deletes completed lessons, saved words and statistics.
        </p>
        {confirming ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-red-700">Delete everything? This cannot be undone.</span>
            <button
              type="button"
              className="btn bg-red-700 text-white hover:bg-red-800"
              onClick={() => {
                resetAll();
                setConfirming(false);
              }}
            >
              Yes, reset
            </button>
            <button type="button" className="btn-ghost" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="btn-ghost mt-3" onClick={() => setConfirming(true)}>
            Reset all progress
          </button>
        )}
      </section>
      <p className="text-center text-xs text-ink-soft">
        Want to keep going? <Link href="/learn" className="font-semibold text-forest-700 underline">Open the lessons</Link>.
      </p>
    </div>
  );
}
