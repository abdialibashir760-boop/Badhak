"use client";

import Link from "next/link";
import { categories, type Lesson } from "@/data";
import { Dialogue } from "./Dialogue";
import { LessonQuiz } from "./LessonQuiz";
import { PhraseCard } from "./PhraseCard";
import { useProgress } from "./ProgressProvider";
import { SectionTitle } from "./ui";

export function LessonView({ lesson }: { lesson: Lesson }) {
  const { state } = useProgress();
  const done = state.completedLessons[lesson.id];
  const category = categories.find((c) => c.id === lesson.category);

  return (
    <div className="space-y-8">
      <div className="animate-rise">
        <Link href="/learn" className="text-sm font-semibold text-forest-600 hover:underline">
          ← All lessons
        </Link>
        <p className="mt-3 text-sm font-semibold text-forest-600">{category?.title}</p>
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{lesson.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span>{lesson.minutes} min</span>
          <span aria-hidden>·</span>
          <span>{lesson.phrases.length} expressions</span>
          {done && (
            <span className="chip bg-forest-700 text-white">
              Completed · {done.score}/{done.total}
            </span>
          )}
        </div>
      </div>

      <section aria-labelledby="situation" className="card bg-forest-50">
        <h2 id="situation" className="font-display text-xl font-bold text-forest-900">
          The situation
        </h2>
        <p className="mt-2 text-ink">{lesson.situation}</p>
      </section>

      <section aria-labelledby="expressions" className="space-y-4">
        <SectionTitle>
          <span id="expressions">Useful expressions</span>
        </SectionTitle>
        <p className="-mt-2 text-sm text-ink-soft">
          Tap <strong>Save</strong> to add an expression to your vocabulary for flashcard review.
        </p>
        {lesson.phrases.map((p) => (
          <PhraseCard key={p.id} phrase={p} />
        ))}
      </section>

      <section aria-labelledby="dialogue" className="space-y-3">
        <SectionTitle>
          <span id="dialogue">Example conversation</span>
        </SectionTitle>
        <Dialogue lines={lesson.dialogue} />
      </section>

      <section aria-labelledby="practice" className="space-y-3">
        <SectionTitle>
          <span id="practice">Quick practice</span>
        </SectionTitle>
        <LessonQuiz lesson={lesson} />
      </section>
    </div>
  );
}
