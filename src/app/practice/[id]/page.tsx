import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScenarioPlayer } from "@/components/ScenarioPlayer";
import { getScenario, scenarios } from "@/data";

export function generateStaticParams() {
  return scenarios.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const s = getScenario((await params).id);
  return { title: s?.title ?? "Practice" };
}

export default async function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const scenario = getScenario((await params).id);
  if (!scenario) notFound();
  return (
    <div className="space-y-5">
      <div className="animate-rise">
        <Link href="/practice" className="text-sm font-semibold text-forest-600 hover:underline">
          ← All scenarios
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold text-forest-900 sm:text-4xl">{scenario.title}</h1>
        <p className="mt-2 rounded-2xl bg-forest-50 px-4 py-3 text-ink">
          <strong>Scenario:</strong> {scenario.setting}
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Replies are pre-written and scored by fixed rules. This is not an AI conversation.
        </p>
      </div>
      <ScenarioPlayer scenario={scenario} />
    </div>
  );
}
