import type { Phrase } from "@/data";
import { RegisterChip } from "./ui";
import { SaveButton } from "./SaveButton";

export function PhraseCard({ phrase }: { phrase: Phrase }) {
  return (
    <article className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 lang="tr" className="font-display text-2xl font-bold text-forest-900">
            {phrase.tr}
          </h3>
          <p className="mt-1 text-base font-medium text-ink">{phrase.en}</p>
          {phrase.literal && (
            <p className="mt-0.5 text-sm italic text-ink-soft">Literally: “{phrase.literal}”</p>
          )}
        </div>
        <SaveButton phrase={phrase} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <RegisterChip register={phrase.register} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{phrase.usage}</p>
      {phrase.example && (
        <div className="mt-3 rounded-2xl bg-forest-50 px-4 py-3 text-sm">
          <p lang="tr" className="font-semibold text-forest-900">
            {phrase.example.tr}
          </p>
          <p className="text-ink-soft">{phrase.example.en}</p>
        </div>
      )}
    </article>
  );
}
