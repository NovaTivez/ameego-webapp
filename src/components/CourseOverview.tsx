"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CourseState } from "@/components/CourseState";
import { PixelIcon } from "@/components/PixelIcon";
import {
  COURSE_COMPLETION_BADGE,
  COURSE_COMPLETION_BONUS_XP,
  getAcademyLessonHref,
  interviewAcademyPhases,
  type Course,
} from "@/content/interview-foundations";
import { readCourseProgress, type CourseProgress } from "@/lib/course-progress";

import styles from "./course-pages.module.css";

type CourseOverviewProps = {
  course: Course;
};

type ProgressState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; progress: CourseProgress };

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
}

export function CourseOverview({ course }: CourseOverviewProps) {
  const [progressState, setProgressState] = useState<ProgressState>({
    status: "loading",
  });

  const loadProgress = useCallback(() => {
    try {
      setProgressState({
        status: "ready",
        progress: readCourseProgress(window.localStorage),
      });
    } catch {
      setProgressState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadProgress);
  }, [loadProgress]);

  const allLessons = useMemo(
    () => interviewAcademyPhases.flatMap((phase) => phase.lessons),
    [],
  );
  const completedIds =
    progressState.status === "ready"
      ? new Set(progressState.progress.completedLessonIds)
      : new Set<string>();
  const completedLessons = allLessons.filter((lesson) => completedIds.has(lesson.id));
  const courseComplete = completedLessons.length === allLessons.length;
  const progressPercentage = Math.round(
    (completedLessons.length / allLessons.length) * 100,
  );
  const lessonXp = completedLessons.reduce((sum, lesson) => sum + lesson.xpReward, 0);
  const totalXp = lessonXp + (courseComplete ? COURSE_COMPLETION_BONUS_XP : 0);
  const totalMinutes = allLessons.reduce(
    (sum, lesson) => sum + lesson.durationMinutes,
    0,
  );
  const remainingMinutes = allLessons
    .filter((lesson) => !completedIds.has(lesson.id))
    .reduce((sum, lesson) => sum + lesson.durationMinutes, 0);

  const isLessonUnlocked = (lessonId: string) => {
    if (completedIds.has(lessonId)) return true;
    const lessonIndex = allLessons.findIndex((lesson) => lesson.id === lessonId);
    return allLessons
      .slice(0, Math.max(0, lessonIndex))
      .every((lesson) => completedIds.has(lesson.id));
  };

  const currentLesson =
    allLessons.find(
      (lesson) => !completedIds.has(lesson.id) && isLessonUnlocked(lesson.id),
    ) ?? allLessons.at(-1);
  const earnedBadges = interviewAcademyPhases
    .filter((phase) => phase.lessons.every((lesson) => completedIds.has(lesson.id)))
    .map((phase) => phase.badge);
  const rank = courseComplete
    ? "Interview Master"
    : progressPercentage >= 65
      ? "Specialist"
      : progressPercentage >= 30
        ? "Apprentice"
        : "Novice";

  if (course.lessons.length === 0) {
    return <CourseState state="empty" />;
  }

  return (
    <section
      className={`${styles.courseScreen} ${styles.academyScreen}`}
      aria-labelledby="course-title"
    >
      <header className={styles.academyHero}>
        <div className={styles.heroIcon} aria-hidden="true">
          <PixelIcon name="academy" size="large" />
        </div>
        <div className={styles.heroCopy}>
          <p>Courses Building · Learning Path 01</p>
          <h1 id="course-title">Interview Skills Academy</h1>
          <span>
            Clear 17 practical lessons, earn academy badges, and prepare for a complete AI
            interview practice run.
          </span>
        </div>
        <div className={styles.heroRank} aria-label={`Course rank ${rank}`}>
          <span>Rank</span>
          <strong>{rank}</strong>
        </div>
      </header>

      {progressState.status === "loading" ? <CourseState state="loading" /> : null}
      {progressState.status === "error" ? (
        <CourseState state="error" onRetry={loadProgress} />
      ) : null}

      {progressState.status === "ready" ? (
        <>
          <section className={styles.dashboard} aria-labelledby="dashboard-title">
            <div className={styles.dashboardHeading}>
              <div>
                <p>Active Course</p>
                <h2 id="dashboard-title">{course.title}</h2>
              </div>
              <strong>{progressPercentage}% Complete</strong>
            </div>
            <div
              className={styles.academyProgress}
              role="progressbar"
              aria-label="Interview Foundations progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercentage}
            >
              <span style={{ width: `${progressPercentage}%` }} />
            </div>
            <dl className={styles.dashboardStats}>
              <div>
                <dt>Lessons Completed</dt>
                <dd>
                  {completedLessons.length} / {allLessons.length}
                </dd>
              </div>
              <div>
                <dt>Current Lesson</dt>
                <dd>{courseComplete ? "Course Complete" : currentLesson?.title}</dd>
              </div>
              <div>
                <dt>Total XP Earned</dt>
                <dd>{totalXp} XP</dd>
              </div>
              <div>
                <dt>Estimated Time</dt>
                <dd>
                  {completedLessons.length === 0
                    ? formatDuration(totalMinutes)
                    : courseComplete
                      ? "Complete"
                      : `${formatDuration(remainingMinutes)} left`}
                </dd>
              </div>
            </dl>
          </section>

          {!courseComplete && currentLesson ? (
            <section
              className={styles.currentQuest}
              aria-labelledby="current-quest-title"
            >
              <div>
                <p>Continue Your Quest</p>
                <h2 id="current-quest-title">{currentLesson.title}</h2>
                <span>{currentLesson.objective}</span>
              </div>
              <Link
                className="pixel-button pixel-button-primary"
                href={getAcademyLessonHref(currentLesson)}
              >
                Open Current Lesson
              </Link>
            </section>
          ) : null}

          <section className={styles.badgeShelf} aria-labelledby="badge-shelf-title">
            <div>
              <p>Achievement Shelf</p>
              <h2 id="badge-shelf-title">Academy Badges</h2>
            </div>
            <ul>
              {interviewAcademyPhases.map((phase) => {
                const earned = earnedBadges.includes(phase.badge);
                return (
                  <li className={earned ? styles.badgeEarned : ""} key={phase.badge}>
                    <PixelIcon name={earned ? "star" : "lock"} size="small" />
                    <span>{phase.badge}</span>
                    <small>{earned ? "Earned" : `Clear Phase ${phase.number}`}</small>
                  </li>
                );
              })}
              <li className={courseComplete ? styles.badgeEarned : ""}>
                <PixelIcon name={courseComplete ? "star" : "lock"} size="small" />
                <span>{COURSE_COMPLETION_BADGE}</span>
                <small>
                  {courseComplete
                    ? `Earned · +${COURSE_COMPLETION_BONUS_XP} XP`
                    : "Clear all lessons"}
                </small>
              </li>
            </ul>
          </section>

          {courseComplete ? (
            <section className={styles.masterReward} aria-labelledby="master-title">
              <PixelIcon name="star" size="large" />
              <div>
                <p>Course Complete · +{COURSE_COMPLETION_BONUS_XP} XP</p>
                <h2 id="master-title">Interview Master Badge Unlocked</h2>
                <span>
                  Complete a graduation interview to generate a validated feedback report.
                </span>
              </div>
              <Link className="pixel-button pixel-button-primary" href="/practice">
                Start Graduation Interview
              </Link>
            </section>
          ) : null}

          <nav className={styles.curriculum} aria-label="Interview course phases">
            <div className={styles.sectionTitle}>
              <span>Complete Learning Path</span>
              <small>Lessons unlock in order</small>
            </div>
            {interviewAcademyPhases.map((phase) => {
              const phaseComplete = phase.lessons.every((lesson) =>
                completedIds.has(lesson.id),
              );
              const phaseUnlocked = isLessonUnlocked(phase.lessons[0].id);
              const phaseCompletedCount = phase.lessons.filter((lesson) =>
                completedIds.has(lesson.id),
              ).length;

              return (
                <section
                  className={`${styles.phaseCard} ${
                    phaseUnlocked ? styles.phaseUnlocked : styles.phaseLocked
                  } ${phaseComplete ? styles.phaseComplete : ""}`}
                  key={phase.id}
                  aria-labelledby={`phase-${phase.id}`}
                >
                  <header className={styles.phaseHeader}>
                    <span className={styles.phaseNumber}>{phase.number}</span>
                    <div>
                      <small>Phase {phase.number}</small>
                      <h3 id={`phase-${phase.id}`}>{phase.title}</h3>
                      <p>{phase.goal}</p>
                    </div>
                    <span className={styles.phaseState}>
                      {phaseComplete ? (
                        <PixelIcon name="check" size="small" />
                      ) : phaseUnlocked ? (
                        `${phaseCompletedCount}/${phase.lessons.length}`
                      ) : (
                        <PixelIcon name="lock" size="small" />
                      )}
                    </span>
                  </header>
                  <ol className={styles.lessonCardGrid}>
                    {phase.lessons.map((lesson, lessonIndex) => {
                      const lessonComplete = completedIds.has(lesson.id);
                      const lessonUnlocked = isLessonUnlocked(lesson.id);
                      const cardContent = (
                        <>
                          <span className={styles.lessonCardNumber}>
                            {phase.number}.{lessonIndex + 1}
                          </span>
                          <span className={styles.lessonCardCopy}>
                            <strong>{lesson.title}</strong>
                            <small>{lesson.summary}</small>
                            <span className={styles.lessonCardMeta}>
                              <span>{lesson.durationMinutes} min</span>
                              <span>{lesson.difficulty}</span>
                              <span>+{lesson.xpReward} XP</span>
                            </span>
                          </span>
                          <span
                            className={`${styles.lessonCardState} ${
                              lessonComplete ? styles.lessonCardDone : ""
                            }`}
                          >
                            <PixelIcon
                              name={
                                lessonComplete
                                  ? "check"
                                  : lessonUnlocked
                                    ? "lesson"
                                    : "lock"
                              }
                              size="small"
                            />
                            <span>
                              {lessonComplete
                                ? "Completed"
                                : lessonUnlocked
                                  ? "Unlocked"
                                  : "Locked"}
                            </span>
                          </span>
                        </>
                      );

                      return (
                        <li key={lesson.id}>
                          {lessonUnlocked ? (
                            <Link
                              className={`${styles.lessonCard} ${
                                lessonComplete ? styles.lessonCardComplete : ""
                              }`}
                              href={getAcademyLessonHref(lesson)}
                              aria-label={`${lessonComplete ? "Review" : "Open"} ${lesson.title} lesson`}
                            >
                              {cardContent}
                            </Link>
                          ) : (
                            <div
                              className={`${styles.lessonCard} ${styles.lessonCardLocked}`}
                              aria-label={`${lesson.title} lesson locked`}
                              aria-disabled="true"
                            >
                              {cardContent}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                  <footer className={styles.phaseReward}>
                    <PixelIcon name={phaseComplete ? "star" : "lock"} size="small" />
                    <span>
                      Phase reward: <strong>{phase.badge}</strong>
                    </span>
                  </footer>
                </section>
              );
            })}
          </nav>
        </>
      ) : null}
    </section>
  );
}
