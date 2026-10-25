import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/LessonView";
import { getLesson, lessons } from "@/data";

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const lesson = getLesson((await params).id);
  return { title: lesson?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const lesson = getLesson((await params).id);
  if (!lesson) notFound();
  return <LessonView lesson={lesson} />;
}
