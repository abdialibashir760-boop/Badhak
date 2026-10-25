import type { Metadata } from "next";
import { Vocabulary } from "@/components/Vocabulary";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Vocabulary" };

export default function VocabularyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Vocabulary"
        title="Your saved expressions"
        subtitle="Review what you saved, mark what feels easy or difficult, and practise with flashcards."
      />
      <Vocabulary />
    </>
  );
}
