import type { Metadata } from "next";
import { ScenarioList } from "@/components/ScenarioList";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Real conversations"
        subtitle="Choose a situation, read what the other person says, and pick the reply that fits. You get feedback on every option."
      />
      <ScenarioList />
    </>
  );
}
