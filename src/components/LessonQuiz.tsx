"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Lesson } from "@/data";
import { shuffleWithSeed } from "@/lib/shuffle";
import { Icon } from "./Icon";
import { useProgress } from "./ProgressProvider";

export function LessonQuiz({ lesson }: { lesson: Lesson }) {
  const { recordQuizAnswer, completeLesson } = useProgress();

  // Each question's options are shuffled in a fixed way, so the first option isn't always right.
  const questions = useMemo(
    () =>
      lesson.quiz.map((q) => {
        const order = shuffleWithSeed(q.options.map((text, index) => ({ text, index })), q.id);
        return { ...q, order, answerPos: order.findIndex((o) => o.index === q.answer) };
      }),
    [lesson],
  );

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const q = questions[step];

  function choose(pos: number) {
    if (picked !== null) return;
    const correct = pos === q.answerPos;
    setPicked(pos);
    if (correct) setScore((s) => s + 1);
    recordQuizAnswer(correct);
  }

  function next() {
    if (step + 1 < total) {
      setStep(step + 1);
      setPicked(null);
    } else {
      completeLesson(lesson.id, lesson.title, score, total);
      setDone(true);
    }
  }

  function restart() {
    setStep(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  if (done) {
    return (
      <div className="card animate-rise text-center" role="status">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-700 text-white">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <h3 className="mt-3 font-display text-2xl font-bold text-forest-900">Lesson complete!</h3>
        <p className="mt-1 text-ink-soft">
          You answered {score} of {total} correctly. Your progress has been saved.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/learn" className="btn-primary">
            Back to lessons
          </Link>
          <Link href="/practice" className="btn-soft">
            Practise a conversation
          </Link>
          <button type="button" onClick={restart} className="btn-ghost">
            Retake quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-forest-700">
        <span>
          Question {step + 1} of {total}
        </span>
        <span>Score: {score}</span>
      </div>
      <h3 className="text-lg font-semibold text-forest-900">{q.prompt}</h3>
      <ul className="mt-4 space-y-2.5">
        {q.order.map((opt, pos) => {
          const isPicked = picked === pos;
          const isAnswer = pos === q.answerPos;
          let style = "border-forest-200 bg-white hover:bg-forest-50";
          if (picked !== null) {
            if (isAnswer) style = "border-forest-600 bg-forest-100";
            else if (isPicked) style = "border-red-400 bg-red-50";
            else style = "border-forest-100 bg-white opacity-70";
          }
          return (
            <li key={opt.index}>
              <button
                type="button"
                onClick={() => choose(pos)}
                disabled={picked !== null}
                className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left font-semibold transition ${style}`}
              >
                <span>{opt.text}</span>
                {picked !== null && isAnswer && <span className="text-sm text-forest-700">Correct</span>}
                {picked !== null && isPicked && !isAnswer && <span className="text-sm text-red-700">Not quite</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {picked !== null && (
        <div role="status" className="mt-4 animate-rise rounded-2xl bg-forest-50 p-4 text-sm leading-relaxed">
          <p className="font-semibold text-forest-900">{picked === q.answerPos ? "Correct!" : "Not quite."}</p>
          <p className="mt-1 text-ink-soft">{q.explanation}</p>
          <button type="button" onClick={next} className="btn-primary mt-3">
            {step + 1 < total ? "Next question" : "Finish lesson"}
            <Icon name="arrow" className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
