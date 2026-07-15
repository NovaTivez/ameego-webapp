"use client";

import Link from "next/link";

import { CharacterPortrait } from "@/components/CharacterPortrait";
import { CourseState } from "@/components/CourseState";
import { PixelIcon } from "@/components/PixelIcon";
import type { Course } from "@/content/interview-foundations";
import { useLessonCompletion } from "@/hooks/useLessonCompletion";

import styles from "./course-pages.module.css";

type CourseOverviewProps = {
  course: Course;
};

const moduleDefinitions = [
  { id: "preparing", title: "Preparing for Interviews", status: "planned" },
  { id: "answering", title: "Answering Clearly", status: "planned" },
  { id: "star", title: "STAR Method", status: "published" },
  { id: "delivery", title: "Interview Delivery", status: "planned" },
] as const;

export function CourseOverview({ course }: CourseOverviewProps) {
  const featuredLesson = course.lessons.find(
    (lesson) => lesson.id === course.featuredLessonId,
  );
  const completion = useLessonCompletion(featuredLesson?.id);

  if (course.lessons.length === 0 || !featuredLesson) {
    return <CourseState state="empty" />;
  }

  const completedLessons = completion.status === "ready" && completion.completed ? 1 : 0;
  const publishedLessons = course.lessons.length;
  const progressPercentage = Math.round((completedLessons / publishedLessons) * 100);

  return (
    <section className={styles.courseScreen} aria-labelledby="course-title">
      <header className={styles.panelTitle}>
        <PixelIcon name="lesson" size="small" />
        <div>
          <p>{course.title}</p>
          <h1 id="course-title">Interview Skills Course</h1>
        </div>
      </header>

      <div className={styles.courseLayout}>
        <div className={styles.modulePanel}>
          <div className={styles.sectionHeading}>
            <span>Course Modules</span>
            <small>{publishedLessons} published lesson</small>
          </div>

          {completion.status === "loading" ? <CourseState state="loading" /> : null}
          {completion.status === "error" ? (
            <CourseState state="error" onRetry={completion.reload} />
          ) : null}

          {completion.status === "ready" ? (
            <ol className={styles.moduleList}>
              {moduleDefinitions.map((module, index) => {
                const isPublished = module.status === "published";
                const count = isPublished
                  ? `${completion.completed ? 1 : 0}/${publishedLessons}`
                  : "0/0";
                const content = (
                  <>
                    <span className={styles.moduleNumber}>{index + 1}</span>
                    <span className={styles.moduleName}>{module.title}</span>
                    <span className={styles.moduleCount}>{count}</span>
                    <span className={styles.moduleState}>
                      {isPublished
                        ? completion.completed
                          ? "Review"
                          : "Open"
                        : "Coming Soon"}
                    </span>
                  </>
                );

                return (
                  <li key={module.id}>
                    {isPublished ? (
                      <Link
                        className={styles.moduleLink}
                        href={`/learn/${featuredLesson.slug}`}
                        aria-label={`${completion.completed ? "Review" : "Open"} STAR Method lesson`}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className={styles.moduleLocked}>{content}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : null}
        </div>

        <aside className={styles.courseStatus} aria-label="Course progress panel">
          <div className={styles.sectionHeading}>Course Progress</div>
          {completion.status === "ready" ? (
            <>
              <div className={styles.progressReadout} aria-live="polite">
                <strong>{progressPercentage}%</strong>
                <span>
                  {completedLessons}/{publishedLessons} lessons complete
                </span>
              </div>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-label="Interview Foundations progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercentage}
              >
                <span style={{ width: `${progressPercentage}%` }} />
              </div>
            </>
          ) : (
            <p className={styles.progressPending} aria-live="polite">
              {completion.status === "loading"
                ? "Reading saved progress..."
                : "Saved progress unavailable"}
            </p>
          )}

          <div className={styles.portrait}>
            <CharacterPortrait variant="student" name="Ari, academy learner" compact />
          </div>

          <div className={styles.guideMessage}>
            <span aria-hidden="true">◆</span>
            <p>
              {completion.status === "ready" && completion.completed
                ? "Lesson cleared. Review STAR or continue to the exercise."
                : "Begin with STAR Method and build one clear behavioral story."}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
