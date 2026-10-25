"use client";

import Link from "next/link";
import type { Lesson } from "@/data";
import { Icon } from "./Icon";
import { useProgress } from "./ProgressProvider";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { state } = useProgress();
  const done = state.completedLessons[lesson.id];
  return (
    <Link
      href={`/learn/${lesson.id}`}
      className="card group flex items-center gap-4 transition hover:-translate-y-0.5 hover:border-forest-300"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          done ? "bg-forest-700 text-white" : "bg-forest-100 text-forest-700"
        }`}
      >
        <Icon name={done ? "check" : "learn"} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-forest-900">{lesson.title}</span>
        <span className="block text-sm text-ink-soft">{lesson.summary}</span>
        <span className="mt-1 block text-xs font-medium text-forest-600">
          {lesson.minutes} min · {lesson.phrases.length} expressions
          {done ? ` · Completed ${done.score}/${done.total}` : ""}
        </span>
      </span>
      <Icon name="arrow" className="h-5 w-5 shrink-0 text-forest-400 transition group-hover:translate-x-1" />
    </Link>
  );
}
