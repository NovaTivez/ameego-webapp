import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AcademyLesson } from "@/components/AcademyLesson";
import {
  getAcademyLessonBySlug,
  interviewAcademyPhases,
} from "@/content/interview-foundations";

type LessonPageProps = {
  params: Promise<{ lessonSlug: string }>;
};

export function generateStaticParams() {
  return interviewAcademyPhases.flatMap((phase) =>
    phase.lessons
      .filter((lesson) => !lesson.href)
      .map((lesson) => ({ lessonSlug: lesson.slug })),
  );
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = getAcademyLessonBySlug(lessonSlug);
  return { title: lesson?.title ?? "Academy Lesson" };
}

export default async function AcademyLessonRoute({ params }: LessonPageProps) {
  const { lessonSlug } = await params;
  const lesson = getAcademyLessonBySlug(lessonSlug);
  if (!lesson || lesson.href) notFound();

  const phase = interviewAcademyPhases.find((item) =>
    item.lessons.some((phaseLesson) => phaseLesson.id === lesson.id),
  );
  if (!phase) notFound();

  const lessonNumber = phase.lessons.findIndex((item) => item.id === lesson.id) + 1;

  return (
    <div className="page-stack academy-lesson-page">
      <AcademyLesson lesson={lesson} phase={phase} lessonNumber={lessonNumber} />
    </div>
  );
}
