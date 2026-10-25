import type { Metadata } from "next";
import { LessonCard } from "@/components/LessonCard";
import { PageHeader } from "@/components/ui";
import { categories, lessons } from "@/data";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Short lessons for real situations"
        subtitle="Each lesson gives you useful expressions, a natural conversation and a quick quiz."
      />
      <div className="space-y-8">
        {categories.map((cat) => {
          const items = lessons.filter((l) => l.category === cat.id);
          if (items.length === 0) return null;
          return (
            <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
              <h2 id={`cat-${cat.id}`} className="font-display text-xl font-bold text-forest-900">
                {cat.title}
              </h2>
              <p className="mb-3 text-sm text-ink-soft">{cat.blurb}</p>
              <div className="space-y-3">
                {items.map((l) => (
                  <LessonCard key={l.id} lesson={l} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
