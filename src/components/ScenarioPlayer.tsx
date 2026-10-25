"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Fit, Scenario } from "@/data";
import { shuffleWithSeed } from "@/lib/shuffle";
import { Icon } from "./Icon";
import { useProgress } from "./ProgressProvider";

const fitLabel: Record<Fit, { text: string; style: string }> = {
  best: { text: "Most natural", style: "bg-forest-700 text-white" },
  good: { text: "Works fine", style: "bg-forest-200 text-forest-900" },
  off: { text: "Doesn't fit", style: "bg-red-100 text-red-800" },
};

export function ScenarioPlayer({ scenario }: { scenario: Scenario }) {
  const { recordPracticeAnswer, completeScenario } = useProgress();

  const steps = useMemo(
    () => scenario.steps.map((s) => ({ ...s, options: shuffleWithSeed(s.options, s.id) })),
    [scenario],
  );

  // Conversation so far: finished steps with the learner's chosen reply.
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [history, setHistory] = useState<{ stepId: string; reply: string; replyEn: string }[]>([]);
  const [goodCount, setGoodCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = steps[index];
  const chosen = picked !== null ? step.options[picked] : null;

  function choose(i: number) {
    if (picked !== null) return;
    const opt = step.options[i];
    const good = opt.fit !== "off";
    setPicked(i);
    if (good) setGoodCount((c) => c + 1);
    recordPracticeAnswer(good);
  }

  function next() {
    if (!chosen) return;
    const entry = { stepId: step.id, reply: chosen.tr, replyEn: chosen.en };
    setHistory((h) => [...h, entry]);
    if (index + 1 < steps.length) {
      setIndex(index + 1);
      setPicked(null);
    } else {
      completeScenario(scenario.id, scenario.title, goodCount, steps.length);
      setFinished(true);
    }
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setHistory([]);
    setGoodCount(0);
    setFinished(false);
  }

  return (
    <div className="space-y-4">
      {/* Earlier turns */}
      {history.map((h, i) => (
        <div key={h.stepId} className="space-y-2 opacity-80">
          <Bubble who={steps[i].speaker} tr={steps[i].tr} en={steps[i].en} />
          <Bubble who="You" tr={h.reply} en={h.replyEn} mine />
        </div>
      ))}

      {finished ? (
        <div className="card animate-rise text-center" role="status">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-700 text-white">
            <Icon name="check" className="h-7 w-7" />
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold text-forest-900">Conversation finished</h2>
          <p className="mt-1 text-ink-soft">
            {goodCount} of {steps.length} replies fit the situation. Your result has been saved.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={restart} className="btn-primary">
              Try again
            </button>
            <Link href="/practice" className="btn-soft">
              More scenarios
            </Link>
          </div>
        </div>
      ) : (
        <div className="animate-rise space-y-4" key={step.id}>
          <p className="text-sm font-semibold text-forest-600">
            Turn {index + 1} of {steps.length}
          </p>
          <Bubble who={step.speaker} tr={step.tr} en={step.en} />

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-forest-900">How do you reply?</legend>
            <ul className="space-y-2.5">
              {step.options.map((opt, i) => {
                const isPicked = picked === i;
                let style = "border-forest-200 bg-white hover:bg-forest-50";
                if (picked !== null) {
                  if (isPicked) style = opt.fit === "off" ? "border-red-400 bg-red-50" : "border-forest-600 bg-forest-100";
                  else style = "border-forest-100 bg-white";
                }
                return (
                  <li key={opt.tr}>
                    <button
                      type="button"
                      disabled={picked !== null}
                      onClick={() => choose(i)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${style}`}
                    >
                      <span lang="tr" className="block font-semibold text-forest-900">
                        {opt.tr}
                      </span>
                      {picked !== null && <span className="block text-sm text-ink-soft">{opt.en}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          {chosen && (
            <div role="status" className="animate-rise card space-y-4 !bg-forest-50">
              <div>
                <span className={`chip ${fitLabel[chosen.fit].style}`}>{fitLabel[chosen.fit].text}</span>
                <p className="mt-2 text-sm leading-relaxed">{chosen.why}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-forest-900">All the options explained</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {step.options.map((o) => (
                    <li key={o.tr} className="rounded-xl bg-white px-3 py-2">
                      <span className={`chip mr-2 ${fitLabel[o.fit].style}`}>{fitLabel[o.fit].text}</span>
                      <span lang="tr" className="font-semibold">
                        {o.tr}
                      </span>
                      <span className="text-ink-soft"> — “{o.en}” </span><span className="text-ink-soft">{o.why}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm">
                <strong>Most useful in real life:</strong>{" "}
                <span lang="tr">{step.options.find((o) => o.fit === "best")?.tr}</span>
              </p>
              <button type="button" onClick={next} className="btn-primary">
                {index + 1 < steps.length ? "Continue conversation" : "Finish"}
                <Icon name="arrow" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Bubble({ who, tr, en, mine = false }: { who: string; tr: string; en: string; mine?: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-3xl px-4 py-3 sm:max-w-[75%] ${
          mine ? "rounded-br-md bg-forest-700 text-white" : "rounded-bl-md bg-forest-100 text-forest-900"
        }`}
      >
        <p className={`text-xs font-semibold ${mine ? "text-forest-200" : "text-forest-600"}`}>{who}</p>
        <p lang="tr" className="text-base font-semibold">
          {tr}
        </p>
        <p className={`text-sm ${mine ? "text-forest-100" : "text-ink-soft"}`}>{en}</p>
      </div>
    </div>
  );
}
