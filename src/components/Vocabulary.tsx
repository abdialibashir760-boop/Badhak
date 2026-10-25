"use client";

import Link from "next/link";
import { useState } from "react";
import { allPhrases, getLessonForPhrase, getPhrase, type Phrase } from "@/data";
import { shuffle } from "@/lib/shuffle";
import { Icon } from "./Icon";
import { useProgress } from "./ProgressProvider";
import { EmptyState, RegisterChip } from "./ui";

type Tab = "list" | "flashcards" | "quiz";
type Filter = "all" | "easy" | "difficult" | "unmarked";

export function Vocabulary() {
  const { state, ready } = useProgress();
  const [tab, setTab] = useState<Tab>("list");

  const saved = Object.keys(state.savedPhrases)
    .map((id) => getPhrase(id))
    .filter((p): p is Phrase => Boolean(p));

  if (!ready) return <p className="text-ink-soft">Loading your saved words…</p>;

  const tabs: { id: Tab; label: string }[] = [
    { id: "list", label: `Saved (${saved.length})` },
    { id: "flashcards", label: "Flashcards" },
    { id: "quiz", label: "Recall quiz" },
  ];

  return (
    <div>
      <div role="tablist" aria-label="Vocabulary tools" className="mb-5 inline-flex rounded-full bg-forest-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${
              tab === t.id ? "bg-forest-700 text-white" : "text-forest-800 hover:bg-forest-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {saved.length === 0 ? (
        <EmptyState
          title="No saved expressions yet"
          body="Open a lesson and tap Save on any expression. It will show up here for review, flashcards and quizzes."
          href="/learn"
          action="Browse lessons"
        />
      ) : tab === "list" ? (
        <SavedList saved={saved} />
      ) : tab === "flashcards" ? (
        <Flashcards saved={saved} />
      ) : (
        <RecallQuiz saved={saved} />
      )}
    </div>
  );
}

function SavedList({ saved }: { saved: Phrase[] }) {
  const { state, removePhrase, setDifficulty } = useProgress();
  const [filter, setFilter] = useState<Filter>("all");

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "difficult", label: "Difficult" },
    { id: "easy", label: "Easy" },
    { id: "unmarked", label: "Not marked" },
  ];

  const shown = saved.filter((p) => {
    const d = state.savedPhrases[p.id]?.difficulty ?? null;
    return filter === "all" || (filter === "unmarked" ? d === null : d === filter);
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter saved words">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`chip !px-3.5 !py-1.5 text-sm ${
              filter === f.id ? "bg-forest-700 text-white" : "bg-white text-forest-800 ring-1 ring-forest-200 hover:bg-forest-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="card text-sm text-ink-soft">No saved expressions match this filter yet.</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((p) => {
            const d = state.savedPhrases[p.id]?.difficulty ?? null;
            const lesson = getLessonForPhrase(p.id);
            return (
              <li key={p.id} className="card !p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p lang="tr" className="font-display text-xl font-bold text-forest-900">
                      {p.tr}
                    </p>
                    <p>{p.en}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                      <RegisterChip register={p.register} />
                      {lesson && (
                        <Link href={`/learn/${lesson.id}`} className="font-semibold text-forest-600 hover:underline">
                          From: {lesson.title}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      aria-pressed={d === "easy"}
                      onClick={() => setDifficulty(p.id, d === "easy" ? null : "easy")}
                      className={`${d === "easy" ? "btn-primary" : "btn-ghost"} !min-h-9 !px-3`}
                    >
                      Easy
                    </button>
                    <button
                      type="button"
                      aria-pressed={d === "difficult"}
                      onClick={() => setDifficulty(p.id, d === "difficult" ? null : "difficult")}
                      className={`${d === "difficult" ? "btn-primary" : "btn-ghost"} !min-h-9 !px-3`}
                    >
                      Difficult
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${p.tr}`}
                      onClick={() => removePhrase(p.id, p.tr)}
                      className="btn-ghost !min-h-9 !px-3 !text-red-700"
                    >
                      <Icon name="x" className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Flashcards({ saved }: { saved: Phrase[] }) {
  const { state, recordFlashcard } = useProgress();
  const [deck, setDeck] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knew, setKnew] = useState(0);

  const difficultCount = saved.filter((p) => state.savedPhrases[p.id]?.difficulty === "difficult").length;

  function start(onlyDifficult: boolean) {
    const pool = onlyDifficult ? saved.filter((p) => state.savedPhrases[p.id]?.difficulty === "difficult") : saved;
    setDeck(shuffle(pool.map((p) => p.id)));
    setIndex(0);
    setFlipped(false);
    setKnew(0);
  }

  if (!deck) {
    return (
      <div className="card space-y-3">
        <h2 className="font-display text-xl font-bold text-forest-900">Flashcards</h2>
        <p className="text-sm text-ink-soft">
          See the English meaning, say the Turkish out loud, then flip the card to check. Mark whether you knew it.
          Your answers update the Easy / Difficult labels.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={() => start(false)}>
            Review all ({saved.length})
          </button>
          <button type="button" className="btn-soft" disabled={difficultCount === 0} onClick={() => start(true)}>
            Difficult only ({difficultCount})
          </button>
        </div>
      </div>
    );
  }

  const phrase = index < deck.length ? getPhrase(deck[index]) : undefined;

  if (index >= deck.length || !phrase) {
    return (
      <div className="card text-center" role="status">
        <h2 className="font-display text-2xl font-bold text-forest-900">Review finished</h2>
        <p className="mt-1 text-ink-soft">
          You knew {knew} of {deck.length} cards.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <button type="button" className="btn-primary" onClick={() => start(false)}>
            Review again
          </button>
          <button type="button" className="btn-ghost" onClick={() => setDeck(null)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  function answer(didKnow: boolean) {
    recordFlashcard(phrase!.id, didKnow);
    if (didKnow) setKnew((k) => k + 1);
    setIndex((i) => i + 1);
    setFlipped(false);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-forest-600">
        Card {index + 1} of {deck.length}
      </p>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Showing Turkish. Tap to see English" : "Showing English. Tap to reveal Turkish"}
        className="card flex min-h-56 w-full flex-col items-center justify-center gap-2 text-center transition hover:border-forest-300"
      >
        {flipped ? (
          <>
            <span lang="tr" className="font-display text-3xl font-bold text-forest-900">
              {phrase.tr}
            </span>
            <span className="text-ink-soft">{phrase.en}</span>
            <span className="mt-2 max-w-md text-sm text-ink-soft">{phrase.usage}</span>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold uppercase tracking-wide text-forest-500">How do you say…</span>
            <span className="font-display text-3xl font-bold text-forest-900">{phrase.en}</span>
            <span className="mt-2 inline-flex items-center gap-1 text-sm text-forest-600">
              <Icon name="flip" className="h-4 w-4" /> Tap to flip
            </span>
          </>
        )}
      </button>
      {flipped ? (
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-ghost" onClick={() => answer(false)}>
            Still learning
          </button>
          <button type="button" className="btn-primary" onClick={() => answer(true)}>
            I knew it
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-ink-soft">Flip the card to answer.</p>
      )}
    </div>
  );
}

interface RecallQuestion {
  phraseId: string;
  direction: "en-to-tr" | "tr-to-en";
  options: string[];
  answer: string;
}

function buildQuestions(saved: Phrase[]): RecallQuestion[] {
  return shuffle(saved)
    .slice(0, 10)
    .map((p, i) => {
      const direction = i % 2 === 0 ? "en-to-tr" : "tr-to-en";
      const pick = (x: Phrase) => (direction === "en-to-tr" ? x.tr : x.en);
      const answer = pick(p);
      const distractors = shuffle(allPhrases.filter((x) => x.id !== p.id && pick(x) !== answer))
        .slice(0, 3)
        .map(pick);
      return { phraseId: p.id, direction, answer, options: shuffle([answer, ...distractors]) };
    });
}

function RecallQuiz({ saved }: { saved: Phrase[] }) {
  const { recordRecallAnswer } = useProgress();
  const [questions, setQuestions] = useState<RecallQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  function start() {
    setQuestions(buildQuestions(saved));
    setIndex(0);
    setPicked(null);
    setScore(0);
  }

  if (!questions) {
    return (
      <div className="card space-y-3">
        <h2 className="font-display text-xl font-bold text-forest-900">Recall quiz</h2>
        <p className="text-sm text-ink-soft">
          Up to 10 questions drawn from your saved expressions. You will translate in both directions.
        </p>
        <button type="button" className="btn-primary" onClick={start}>
          Start quiz
        </button>
      </div>
    );
  }

  if (index >= questions.length) {
    return (
      <div className="card text-center" role="status">
        <h2 className="font-display text-2xl font-bold text-forest-900">Quiz finished</h2>
        <p className="mt-1 text-ink-soft">
          You got {score} of {questions.length} right.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <button type="button" className="btn-primary" onClick={start}>
            Try again
          </button>
          <button type="button" className="btn-ghost" onClick={() => setQuestions(null)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const q = questions[index];
  const phrase = getPhrase(q.phraseId);
  if (!phrase) return null;
  const toTurkish = q.direction === "en-to-tr";

  function choose(option: string) {
    if (picked !== null) return;
    const correct = option === q.answer;
    setPicked(option);
    if (correct) setScore((s) => s + 1);
    recordRecallAnswer(correct);
  }

  return (
    <div className="card">
      <p className="mb-2 text-sm font-semibold text-forest-600">
        Question {index + 1} of {questions.length}
      </p>
      <p className="text-sm text-ink-soft">{toTurkish ? "Which Turkish expression means…" : "What does this mean?"}</p>
      <h2 lang={toTurkish ? undefined : "tr"} className="mt-1 font-display text-2xl font-bold text-forest-900">
        {toTurkish ? phrase.en : phrase.tr}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {q.options.map((o) => {
          let style = "border-forest-200 bg-white hover:bg-forest-50";
          if (picked !== null) {
            if (o === q.answer) style = "border-forest-600 bg-forest-100";
            else if (o === picked) style = "border-red-400 bg-red-50";
            else style = "border-forest-100 bg-white opacity-70";
          }
          return (
            <li key={o}>
              <button
                type="button"
                disabled={picked !== null}
                onClick={() => choose(o)}
                lang={toTurkish ? "tr" : undefined}
                className={`min-h-12 w-full rounded-2xl border px-4 py-3 text-left font-semibold transition ${style}`}
              >
                {o}
              </button>
            </li>
          );
        })}
      </ul>
      {picked !== null && (
        <div role="status" className="mt-4 animate-rise rounded-2xl bg-forest-50 p-4 text-sm">
          <p className="font-semibold text-forest-900">{picked === q.answer ? "Correct!" : "Not quite."}</p>
          <p className="mt-1 text-ink-soft">
            <span lang="tr">{phrase.tr}</span> = {phrase.en}
          </p>
          <button
            type="button"
            className="btn-primary mt-3"
            onClick={() => {
              setIndex(index + 1);
              setPicked(null);
            }}
          >
            {index + 1 < questions.length ? "Next" : "See results"}
          </button>
        </div>
      )}
    </div>
  );
}
