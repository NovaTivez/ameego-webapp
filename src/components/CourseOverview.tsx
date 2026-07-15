"use client";

import { CourseState } from "@/components/CourseState";
import { LearningScene } from "@/components/LearningScene";
import { PixelCourseCard } from "@/components/PixelCourseCard";
import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import type { Course } from "@/content/interview-foundations";
import { useLessonCompletion } from "@/hooks/useLessonCompletion";

type CourseOverviewProps = {
  course: Course;
};

export function CourseOverview({ course }: CourseOverviewProps) {
  const featuredLesson = course.lessons.find(
    (lesson) => lesson.id === course.featuredLessonId,
  );
  const completion = useLessonCompletion(featuredLesson?.id);

  if (course.lessons.length === 0 || !featuredLesson) {
    return <CourseState state="empty" />;
  }

  return (
    <div className="course-overview">
      <header className="course-header">
        <PixelBadge tone="mint">Interview Center course</PixelBadge>
        <p className="eyebrow">Course 01</p>
        <h1>{course.title}</h1>
        <p className="hero-lede">{course.description}</p>
      </header>

      <LearningScene variant="course" />

      {completion.status === "loading" ? <CourseState state="loading" /> : null}
      {completion.status === "error" ? (
        <CourseState state="error" onRetry={completion.reload} />
      ) : null}

      {completion.status === "ready" ? (
        <section aria-labelledby="featured-lesson-title">
          <PixelCourseCard className="featured-lesson-card">
            <div className="featured-lesson-copy">
              <div className="lesson-status-row" aria-live="polite">
                <PixelBadge tone="amber">Featured lesson</PixelBadge>
                <PixelBadge tone={completion.completed ? "mint" : "plum"}>
                  {completion.completed ? "Completed" : "Available"}
                </PixelBadge>
              </div>
              <p className="lesson-duration">{featuredLesson.durationMinutes} minutes</p>
              <h2 id="featured-lesson-title">{featuredLesson.title}</h2>
              <p>{featuredLesson.summary}</p>
              <div className="lesson-objective">
                <strong>Learning objective</strong>
                <span>{featuredLesson.objective}</span>
              </div>
              <PixelButton href={`/learn/${featuredLesson.slug}`}>
                {completion.completed
                  ? "Review STAR Method lesson"
                  : "Open STAR Method lesson"}
              </PixelButton>
            </div>
          </PixelCourseCard>
        </section>
      ) : null}
    </div>
  );
}
