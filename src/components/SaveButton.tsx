"use client";

import type { Phrase } from "@/data";
import { Icon } from "./Icon";
import { useProgress } from "./ProgressProvider";

export function SaveButton({ phrase, compact = false }: { phrase: Phrase; compact?: boolean }) {
  const { state, savePhrase, removePhrase } = useProgress();
  const saved = Boolean(state.savedPhrases[phrase.id]);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove "${phrase.tr}" from saved words` : `Save "${phrase.tr}" to vocabulary`}
      onClick={() => (saved ? removePhrase(phrase.id, phrase.tr) : savePhrase(phrase.id, phrase.tr))}
      className={`${saved ? "btn-primary" : "btn-ghost"} ${compact ? "!min-h-9 !px-3" : ""}`}
    >
      <Icon name="bookmark" className="h-4 w-4" filled={saved} />
      {!compact && (saved ? "Saved" : "Save")}
    </button>
  );
}
