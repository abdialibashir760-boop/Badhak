import type { Metadata } from "next";
import { ProgressView } from "@/components/ProgressView";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Progress" };

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        eyebrow="Progress"
        title="How you're doing"
        subtitle="Everything here is calculated from what you have actually done in the app."
      />
      <ProgressView />
    </>
  );
}
