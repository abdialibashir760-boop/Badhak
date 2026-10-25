"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPhrase, lessons, phraseOfTheDay, scenarios, type Phrase } from "@/data";
import { DAILY_GOAL, exercisesToday, percent } from "@/lib/progress";
import { Icon } from "./Icon";
import { PhraseCard } from "./PhraseCard";
import { useProgress } from "./ProgressProvider";
import { ProgressBar, SectionTitle } from "./ui";

export function HomeDashboard() {
  const { state, ready } = useProgress();
  const [daily, setDaily] = useState<Phrase | null>(null);

  // The date comes from the browser, so choose the phrase after the page loads.
  useEffect(() => setDaily(phraseOfTheDay()), []);

  const lessonsDone = lessons.filter((l) => state.completedLessons[l.id]).length;
  const scenariosDone = scenarios.filter((s) => state.completedScenarios[s.id]).length;
  const nextLesson = lessons.find((l) => !state.completedLessons[l.id]);
  const todayCount = exercisesToday(state);
  const goalPct = percent(Math.min(todayCount, DAILY_GOAL), DAILY_GOAL);
  const overall = percent(lessonsDone + scenariosDone, lessons.length + scenarios.length);
  const suggested = scenarios.filter((s) => !state.completedScenarios[s.id]).slice(0, 2);
  const savedPhrases = Object.keys(state.savedPhrases)
    .map((id) => getPhrase(id))
    .filter((p): p is Phrase => Boolean(p));
  const isNew = ready && lessonsDone === 0 && scenariosDone === 0 && savedPhrases.length === 0;

  return (
    <div className="space-y-8">
      <header className="animate-rise">
        <p className="text-sm font-semibold text-forest-600">Merhaba! 👋</p>
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">
          {isNew ? "Welcome to Türkçem" : "Welcome back"}
        </h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          Learn the Turkish you will actually use: with coworkers, classmates, in cafés and with new friends.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card" aria-labelledby="goal">
          <h2 id="goal" className="flex items-center gap-2 font-display text-xl font-bold text-forest-900">
            <Icon name="flame" className="h-5 w-5 text-forest-600" /> Daily goal
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Complete {DAILY_GOAL} exercises today: quiz questions, conversation replies, flashcards or recall questions.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar value={goalPct} label="Daily goal" />
            </div>
            <span className="text-sm font-semibold text-forest-800">
              {Math.min(todayCount, DAILY_GOAL)}/{DAILY_GOAL}
            </span>
          </div>
          {todayCount >= DAILY_GOAL && <p className="mt-2 text-sm font-semibold text-forest-700">Goal reached. Great work today!</p>}
        </section>

        <section className="card bg-forest-800 !border-forest-800 text-white" aria-labelledby="continue">
          <h2 id="continue" className="font-display text-xl font-bold">
            Continue learning
          </h2>
          {nextLesson ? (
            <>
              <p className="mt-2 font-semibold">{nextLesson.title}</p>
              <p className="text-sm text-forest-100">{nextLesson.summary}</p>
              <Link href={`/learn/${nextLesson.id}`} className="btn mt-4 bg-cream-50 text-forest-900 hover:bg-white">
                {lessonsDone === 0 ? "Start first lesson" : "Next lesson"} <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-forest-100">You have completed every lesson. Keep practising with conversations.</p>
              <Link href="/practice" className="btn mt-4 bg-cream-50 text-forest-900 hover:bg-white">
                Go to practice
              </Link>
            </>
          )}
        </section>
      </div>

      <section aria-labelledby="daily">
        <SectionTitle>
          <span id="daily">Daily phrase</span>
        </SectionTitle>
        {daily ? <PhraseCard phrase={daily} /> : <div className="card h-40 animate-pulse bg-forest-50" aria-hidden />}
      </section>

      <section aria-labelledby="scenarios">
        <SectionTitle
          action={
            <Link href="/practice" className="text-sm font-semibold text-forest-700 hover:underline">
              See all
            </Link>
          }
        >
          <span id="scenarios">Try a real conversation</span>
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {(suggested.length ? suggested : scenarios.slice(0, 2)).map((s) => (
            <Link key={s.id} href={`/practice/${s.id}`} className="card transition hover:-translate-y-0.5 hover:border-forest-300">
              <p className="font-semibold text-forest-900">{s.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.setting}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card" aria-labelledby="saved">
          <h2 id="saved" className="font-display text-xl font-bold text-forest-900">
            Saved words
          </h2>
          {savedPhrases.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">
              Nothing saved yet. Open a <Link href="/learn" className="font-semibold text-forest-700 underline">lesson</Link> and
              tap Save on an expression.
            </p>
          ) : (
            <>
              <ul className="mt-3 space-y-2">
                {savedPhrases.slice(0, 4).map((p) => (
                  <li key={p.id} className="rounded-xl bg-forest-50 px-3 py-2 text-sm">
                    <span lang="tr" className="font-semibold text-forest-900">
                      {p.tr}
                    </span>
                    <span className="text-ink-soft"> — {p.en}</span>
                  </li>
                ))}
              </ul>
              <Link href="/vocabulary" className="btn-soft mt-3">
                Review {savedPhrases.length} saved
              </Link>
            </>
          )}
        </section>

        <section className="card" aria-labelledby="summary">
          <h2 id="summary" className="font-display text-xl font-bold text-forest-900">
            Progress summary
          </h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Lessons completed</dt>
              <dd className="font-semibold">
                {lessonsDone}/{lessons.length}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Conversations finished</dt>
              <dd className="font-semibold">
                {scenariosDone}/{scenarios.length}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Expressions saved</dt>
              <dd className="font-semibold">{savedPhrases.length}</dd>
            </div>
          </dl>
          <div className="mt-3">
            <ProgressBar value={overall} label="Overall progress" />
          </div>
          <Link href="/progress" className="btn-soft mt-4">
            View progress
          </Link>
        </section>
      </div>
    </div>
  );
}
