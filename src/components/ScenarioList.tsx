"use client";

import Link from "next/link";
import { scenarios } from "@/data";
import { Icon } from "./Icon";
import { useProgress } from "./ProgressProvider";

export function ScenarioList({ limit }: { limit?: number }) {
  const { state } = useProgress();
  const list = limit ? scenarios.slice(0, limit) : scenarios;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {list.map((s) => {
        const done = state.completedScenarios[s.id];
        return (
          <Link
            key={s.id}
            href={`/practice/${s.id}`}
            className="card group flex flex-col gap-2 transition hover:-translate-y-0.5 hover:border-forest-300"
          >
            <span className="flex items-center justify-between">
              <span className="chip bg-forest-100 text-forest-800">{s.level}</span>
              {done && (
                <span className="chip bg-forest-700 text-white">
                  Done · {done.good}/{done.total}
                </span>
              )}
            </span>
            <span className="font-semibold text-forest-900">{s.title}</span>
            <span className="text-sm text-ink-soft">{s.setting}</span>
            <span className="mt-auto flex items-center gap-1 pt-1 text-sm font-semibold text-forest-700">
              {done ? "Practise again" : "Start"}
              <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
