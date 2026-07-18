"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelLoadingState } from "@/components/PixelLoadingState";
import { PixelPanel } from "@/components/PixelPanel";
import { interviewFoundationsCourse } from "@/content/interview-foundations";
import { readCourseProgress } from "@/lib/course-progress";
import { readExerciseProgress } from "@/lib/exercise-progress";
import { deleteInterviewAttempt, readInterviewAttempts } from "@/lib/interview/attempts";
import type { CompletedInterviewAttempt } from "@/lib/interview/contracts";
import {
  calculateProgress,
  compareAttempts,
  type ProgressSnapshot,
} from "@/lib/progress";

import styles from "./progress-dashboard.module.css";

type DashboardState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      attempts: CompletedInterviewAttempt[];
      snapshot: ProgressSnapshot;
      hasAnyActivity: boolean;
    };

function formatAttemptDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ProgressHero({ snapshot }: { snapshot: ProgressSnapshot }) {
  const lessonTotal = interviewFoundationsCourse.lessons.length;
  const lessonProgress = Math.round(
    (snapshot.completedLessons.length / lessonTotal) * 100,
  );
  const evidenceProgress = snapshot.simulationsCompleted
    ? Math.round((snapshot.evaluatedSimulations / snapshot.simulationsCompleted) * 100)
    : 0;
  const objectiveProgress = snapshot.skillProgress.length
    ? Math.round(
        snapshot.skillProgress.reduce((total, skill) => total + skill.percent, 0) /
          snapshot.skillProgress.length,
      )
    : 0;
  const latestInterview = snapshot.recentActivity.find(
    (activity) => activity.kind === "simulation" && activity.occurredAt,
  );
  const latestPracticeLabel = latestInterview?.occurredAt
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
        new Date(latestInterview.occurredAt),
      )
    : "Not started";
  const heroStats = [
    {
      label: "Lessons",
      value: snapshot.completedLessons.length,
      icon: "lesson" as const,
      className: styles.lessonStat,
      detail: `${lessonProgress}% course complete`,
      footer: `${snapshot.completedLessons.length}/${lessonTotal} completed`,
      progress: lessonProgress,
    },
    {
      label: "Interviews",
      value: snapshot.simulationsCompleted,
      icon: "speech" as const,
      className: styles.interviewStat,
      detail: `Last practice: ${latestPracticeLabel}`,
      footer: `${snapshot.simulationsCompleted} stored`,
      progress: null,
    },
    {
      label: "Evidence",
      value: snapshot.evaluatedSimulations,
      icon: "resume" as const,
      className: styles.evidenceStat,
      detail: `${evidenceProgress}% validated`,
      footer: `${snapshot.evaluatedSimulations}/${snapshot.simulationsCompleted} reports`,
      progress: evidenceProgress,
    },
    {
      label: "Objectives",
      value: snapshot.skillProgress.length,
      icon: "target" as const,
      className: styles.objectiveStat,
      detail: snapshot.skillProgress.length
        ? `${objectiveProgress}% rubric average`
        : "Awaiting feedback",
      footer: `${snapshot.skillProgress.length} active`,
      progress: objectiveProgress,
    },
  ];

  return (
    <header className={styles.pageTitle} aria-labelledby="progress-page-title">
      <div className={styles.heroContent}>
        <div className={styles.heroIntro}>
          <p>Progress Library · Learner Records</p>
          <h1 id="progress-page-title">Your Progress</h1>
          <span>
            Review stored lessons, interview attempts, rubric evidence, and your next
            learning objective.
          </span>
        </div>

        <div className={styles.heroStats} aria-label="Progress Library statistics">
          {heroStats.map((stat) => (
            <article className={stat.className} key={stat.label}>
              <span className={styles.statAccent} aria-hidden="true" />
              <span className={styles.statDecoration} aria-hidden="true">
                <PixelIcon name={stat.icon} size="large" />
              </span>
              <span className={styles.statIcon} aria-hidden="true">
                <PixelIcon name={stat.icon} size="large" />
              </span>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>{stat.label}</span>
                <div className={styles.statValueLine}>
                  <strong>{stat.value}</strong>
                  <small>{stat.detail}</small>
                </div>
                <div className={styles.statFooter}>
                  {stat.progress === null ? (
                    <span className={styles.activityIndicator} aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    <span className={styles.statProgress} aria-hidden="true">
                      <i style={{ width: `${stat.progress}%` }} />
                    </span>
                  )}
                  <span>{stat.footer}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </header>
  );
}

function ProgressGuidance({ snapshot }: { snapshot: ProgressSnapshot }) {
  const levelProgressPercent = Math.round(
    (snapshot.xpIntoLevel / snapshot.xpPerLevel) * 100,
  );
  const activityType = {
    lesson: "Lesson",
    exercise: "Exercise",
    simulation: "Simulation",
    history: "Review",
  }[snapshot.recommendedNext.kind];

  return (
    <section className={styles.progressGuidance} aria-label="Current learning guidance">
      <article className={`${styles.guidanceCard} ${styles.goalCard}`}>
        <span className={styles.cardAccent} aria-hidden="true" />
        <span className={styles.cardDecoration} aria-hidden="true">
          <PixelIcon name="target" size="large" />
        </span>
        <div className={styles.guidanceHeader}>
          <span className={styles.guidanceIcon} aria-hidden="true">
            <PixelIcon name="target" size="medium" />
          </span>
          <div>
            <span className={styles.guidanceEyebrow}>Current Goal</span>
            <strong>Advance your academy level</strong>
          </div>
        </div>
        <p>{snapshot.recommendedNext.description}</p>
        <div className={styles.goalProgress}>
          <div>
            <span>Level {snapshot.level} progress</span>
            <strong>{levelProgressPercent}%</strong>
          </div>
          <span aria-hidden="true">
            <i style={{ width: `${levelProgressPercent}%` }} />
          </span>
        </div>
        <Link className={styles.guidanceAction} href={snapshot.recommendedNext.href}>
          Continue <span aria-hidden="true">→</span>
        </Link>
      </article>

      <article className={`${styles.guidanceCard} ${styles.lessonCard}`}>
        <span className={styles.cardAccent} aria-hidden="true" />
        <span className={styles.cardDecoration} aria-hidden="true">
          <PixelIcon name="lesson" size="large" />
        </span>
        <div className={styles.guidanceHeader}>
          <span className={styles.guidanceIcon} aria-hidden="true">
            <PixelIcon name="lesson" size="medium" />
          </span>
          <div>
            <span className={styles.guidanceEyebrow}>Next Lesson</span>
            <strong>{snapshot.recommendedNext.title}</strong>
          </div>
        </div>
        <p>Continue with the recommended activity selected from your saved progress.</p>
        <dl className={styles.lessonMeta}>
          <div>
            <dt>Activity</dt>
            <dd>{activityType}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Recommended</dd>
          </div>
        </dl>
        <Link className={styles.guidanceAction} href={snapshot.recommendedNext.href}>
          {snapshot.recommendedNext.kind === "lesson" ? "Open Lesson" : "Open Activity"}{" "}
          <span aria-hidden="true">→</span>
        </Link>
      </article>

      <article className={`${styles.guidanceCard} ${styles.streakCard}`}>
        <span className={styles.cardAccent} aria-hidden="true" />
        <span className={styles.cardDecoration} aria-hidden="true">
          <PixelIcon name="fire" size="large" />
        </span>
        <div className={styles.guidanceHeader}>
          <span className={styles.guidanceIcon} aria-hidden="true">
            <PixelIcon name="fire" size="medium" />
          </span>
          <div>
            <span className={styles.guidanceEyebrow}>Current Streak</span>
            <strong>Keep your momentum</strong>
          </div>
        </div>
        <div className={styles.streakValue}>
          <strong>{snapshot.currentStreak}</strong>
          <span>{snapshot.currentStreak === 1 ? "active day" : "active days"}</span>
        </div>
        <p>Based on consecutive days with saved interview activity.</p>
        <Link className={styles.guidanceAction} href="#progress-overview-heading">
          View Progress <span aria-hidden="true">→</span>
        </Link>
      </article>
    </section>
  );
}

export function ProgressDashboard() {
  const [state, setState] = useState<DashboardState>({ status: "loading" });
  const [selectedAttemptId, setSelectedAttemptId] = useState("");
  const [firstComparisonId, setFirstComparisonId] = useState("");
  const [secondComparisonId, setSecondComparisonId] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const cancelDeleteButtonRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(() => {
    setState({ status: "loading" });
    try {
      const courseProgress = readCourseProgress(window.localStorage);
      const exerciseProgress = readExerciseProgress(window.localStorage);
      const attempts = readInterviewAttempts(window.localStorage).attempts.sort(
        (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt),
      );
      const snapshot = calculateProgress({ courseProgress, exerciseProgress, attempts });
      setState({
        status: "ready",
        attempts,
        snapshot,
        hasAnyActivity:
          snapshot.completedLessons.length > 0 ||
          snapshot.completedExercises.length > 0 ||
          attempts.length > 0,
      });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) load();
    });
    return () => {
      active = false;
    };
  }, [load]);

  useEffect(() => {
    if (!pendingDeleteId) return;
    cancelDeleteButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPendingDeleteId("");
        setDeleteError("");
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [pendingDeleteId]);

  const selectedAttempt =
    state.status === "ready"
      ? state.attempts.find((attempt) => attempt.id === selectedAttemptId)
      : undefined;
  const pendingDeleteAttempt =
    state.status === "ready"
      ? state.attempts.find((attempt) => attempt.id === pendingDeleteId)
      : undefined;
  const comparison = useMemo(() => {
    if (state.status !== "ready" || !firstComparisonId || !secondComparisonId) {
      return null;
    }
    const first = state.attempts.find((attempt) => attempt.id === firstComparisonId);
    const second = state.attempts.find((attempt) => attempt.id === secondComparisonId);
    return first && second ? compareAttempts(first, second) : null;
  }, [firstComparisonId, secondComparisonId, state]);

  const confirmDeleteAttempt = () => {
    if (!pendingDeleteId) return;
    try {
      deleteInterviewAttempt(window.localStorage, pendingDeleteId);
      if (selectedAttemptId === pendingDeleteId) setSelectedAttemptId("");
      if (firstComparisonId === pendingDeleteId) setFirstComparisonId("");
      if (secondComparisonId === pendingDeleteId) setSecondComparisonId("");
      setPendingDeleteId("");
      setDeleteError("");
      load();
    } catch {
      setDeleteError("This saved interview could not be deleted. Please try again.");
    }
  };

  if (state.status === "loading") {
    return (
      <PixelLoadingState
        label="Loading your progress library"
        detail="Reading stored lessons, exercises, and attempts"
      />
    );
  }

  if (state.status === "error") {
    return (
      <PixelPanel tone="warning" className="progress-dashboard-error" role="alert">
        <p className="eyebrow">Progress unavailable</p>
        <h2>Your saved activity could not be read.</h2>
        <p>
          No completion or improvement is being inferred. Restore browser storage access
          or remove invalid local records, then try again.
        </p>
        <PixelButton onClick={load}>Retry progress check</PixelButton>
      </PixelPanel>
    );
  }

  if (!state.hasAnyActivity) {
    return (
      <>
        <ProgressHero snapshot={state.snapshot} />
        <div className={styles.dashboard}>
          <ProgressGuidance snapshot={state.snapshot} />
          <PixelPanel className={`${styles.emptyState} progress-empty-state`}>
            <PixelBadge tone="amber">New learner checkpoint</PixelBadge>
            <h2>Your progress library is ready for its first record.</h2>
            <p>
              Complete the STAR lesson, try the arrangement exercise, then save an
              interview simulation. Only activity completed on this device will appear
              here.
            </p>
            <div className="button-row">
              <PixelButton href={state.snapshot.recommendedNext.href}>
                Start with the STAR lesson
              </PixelButton>
              <PixelButton href="/practice" variant="secondary">
                Open Interview Center
              </PixelButton>
            </div>
          </PixelPanel>
        </div>
      </>
    );
  }

  return (
    <>
      <ProgressHero snapshot={state.snapshot} />
      <div className={`${styles.dashboard} progress-dashboard`}>
        <ProgressGuidance snapshot={state.snapshot} />
        <section className={styles.overview} aria-labelledby="progress-overview-heading">
          <div className={styles.sectionHeading}>
            <div className={styles.headingIdentity}>
              <span className={styles.sectionIcon} aria-hidden="true">
                <PixelIcon name="progress" size="small" />
              </span>
              <div>
                <p>Player Checkpoint</p>
                <h2 id="progress-overview-heading">Progress Overview</h2>
              </div>
            </div>
            <span>Only completed activity saved in this browser is counted.</span>
          </div>
          <div className={styles.overviewCard}>
            <div
              className={styles.levelEmblem}
              aria-label={`Academy level ${state.snapshot.level}`}
            >
              <PixelIcon name="progress" size="large" />
              <span>Level</span>
              <strong>{String(state.snapshot.level).padStart(2, "0")}</strong>
            </div>
            <div className={styles.xpOverview}>
              <div>
                <span>Experience Progress</span>
                <strong>
                  {state.snapshot.xpIntoLevel} / {state.snapshot.xpPerLevel} XP
                </strong>
              </div>
              <div
                className={styles.xpTrack}
                role="progressbar"
                aria-label="Progress to next level"
                aria-valuemin={0}
                aria-valuemax={state.snapshot.xpPerLevel}
                aria-valuenow={state.snapshot.xpIntoLevel}
              >
                <span
                  style={{
                    width: `${Math.round((state.snapshot.xpIntoLevel / state.snapshot.xpPerLevel) * 100)}%`,
                  }}
                />
              </div>
              <p>
                {state.snapshot.xp} XP earned from verified lessons, exercises, saved
                simulations, and validated feedback.
              </p>
            </div>
            <dl className={styles.overviewMeta}>
              <div>
                <dt>Current Streak</dt>
                <dd>
                  {state.snapshot.currentStreak}{" "}
                  {state.snapshot.currentStreak === 1 ? "day" : "days"}
                </dd>
              </div>
              <div>
                <dt>Stored Records</dt>
                <dd>{state.snapshot.recentActivity.length}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          className={styles.progressGrid}
          aria-label="Skill progress and recent activity"
        >
          <section
            className={`${styles.gamePanel} ${styles.skillPanel}`}
            aria-labelledby="skill-progress-heading"
          >
            <div className={styles.panelHeading}>
              <div className={styles.headingIdentity}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <PixelIcon name="target" size="small" />
                </span>
                <div>
                  <p>Rubric Performance</p>
                  <h2 id="skill-progress-heading">Skill Progress</h2>
                </div>
              </div>
              <span>Validated rubric averages</span>
            </div>
            {state.snapshot.skillProgress.length ? (
              <div className={styles.skillList}>
                {state.snapshot.skillProgress.map((skill) => (
                  <div className={styles.skillRow} key={skill.criterion}>
                    <div className={styles.skillIdentity}>
                      <span className={styles.skillIcon} aria-hidden="true">
                        <PixelIcon name="star" size="small" />
                      </span>
                      <div>
                        <strong>{skill.label}</strong>
                        <small>{skill.averageScore}/5 rubric average</small>
                      </div>
                      <em>{skill.percent}%</em>
                    </div>
                    <div
                      className={styles.skillTrack}
                      role="progressbar"
                      aria-label={`${skill.label} validated rubric average`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={skill.percent}
                    >
                      <span style={{ width: `${skill.percent}%` }} />
                    </div>
                    <p>
                      Based on {skill.evaluatedAttempts} validated{" "}
                      {skill.evaluatedAttempts === 1 ? "attempt" : "attempts"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.compactEmpty}>
                <span aria-hidden="true">
                  <PixelIcon name="target" size="medium" />
                </span>
                <p>Complete a validated simulation to unlock rubric-based skill bars.</p>
                <div className={styles.emptySkillBars} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}
          </section>

          <section
            className={`${styles.gamePanel} ${styles.activityPanel}`}
            aria-labelledby="recent-activity-heading"
          >
            <div className={styles.panelHeading}>
              <div className={styles.headingIdentity}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <PixelIcon name="timer" size="small" />
                </span>
                <div>
                  <p>Activity Feed</p>
                  <h2 id="recent-activity-heading">Recent Activity</h2>
                </div>
              </div>
              <span>{state.snapshot.recentActivity.length} stored records</span>
            </div>
            <ul className={styles.activityList}>
              {state.snapshot.recentActivity.map((activity) => (
                <li key={activity.id}>
                  <PixelIcon
                    name={
                      activity.kind === "lesson"
                        ? "lesson"
                        : activity.kind === "exercise"
                          ? "star"
                          : "speech"
                    }
                    size="small"
                  />
                  <div>
                    <strong>{activity.title}</strong>
                    <span>{activity.detail}</span>
                  </div>
                  <time dateTime={activity.occurredAt}>
                    {activity.occurredAt
                      ? formatAttemptDate(activity.occurredAt)
                      : "Date not stored"}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <section
          className={styles.recommendation}
          aria-labelledby="next-recommendation-heading"
        >
          <span className={styles.recommendationIcon} aria-hidden="true">
            <PixelIcon name="star" size="large" />
          </span>
          <div>
            <span>Featured Quest</span>
            <h2 id="next-recommendation-heading">Next Recommendation</h2>
            <h3>{state.snapshot.recommendedNext.title}</h3>
            <p>{state.snapshot.recommendedNext.description}</p>
          </div>
          <PixelButton href={state.snapshot.recommendedNext.href}>
            Start Recommended Activity
          </PixelButton>
        </section>

        <section
          className={`${styles.completionGrid} progress-completion-grid`}
          aria-label="Completed learning activities"
        >
          <PixelPanel
            className={`${styles.completionCard} ${styles.lessonCompletion} progress-completion-card`}
          >
            <header className={styles.completionHeader}>
              <PixelIcon name="lesson" size="medium" />
              <div>
                <p>Learning Records</p>
                <h2>Completed Lessons</h2>
              </div>
              <span>{state.snapshot.completedLessons.length}</span>
            </header>
            <div
              className={styles.completionProgress}
              role="progressbar"
              aria-label="Completed lesson records"
              aria-valuemin={0}
              aria-valuemax={interviewFoundationsCourse.lessons.length}
              aria-valuenow={state.snapshot.completedLessons.length}
            >
              <span
                style={{
                  width: `${Math.round((state.snapshot.completedLessons.length / interviewFoundationsCourse.lessons.length) * 100)}%`,
                }}
              />
            </div>
            {state.snapshot.completedLessons.length ? (
              <ul>
                {state.snapshot.completedLessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link href={lesson.href}>{lesson.title}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.compactRecordEmpty}>
                <PixelIcon name="lesson" size="medium" />
                <p>No completed lesson is stored yet.</p>
              </div>
            )}
          </PixelPanel>
          <PixelPanel
            className={`${styles.completionCard} ${styles.exerciseCompletion} progress-completion-card`}
          >
            <header className={styles.completionHeader}>
              <PixelIcon name="star" size="medium" />
              <div>
                <p>Practice Records</p>
                <h2>Completed Exercises</h2>
              </div>
              <span>{state.snapshot.completedExercises.length}</span>
            </header>
            <div
              className={styles.completionProgress}
              role="progressbar"
              aria-label="Completed exercise records"
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={Math.min(state.snapshot.completedExercises.length, 1)}
            >
              <span
                style={{
                  width: `${Math.min(state.snapshot.completedExercises.length, 1) * 100}%`,
                }}
              />
            </div>
            {state.snapshot.completedExercises.length ? (
              <ul>
                {state.snapshot.completedExercises.map((exercise) => (
                  <li key={exercise.id}>
                    <Link href={exercise.href}>{exercise.title}</Link>
                    <span>
                      {exercise.attemptCount}{" "}
                      {exercise.attemptCount === 1 ? "attempt" : "attempts"};{" "}
                      {exercise.correct
                        ? "correct order recorded"
                        : "completion recorded"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.compactRecordEmpty}>
                <PixelIcon name="star" size="medium" />
                <p>No completed exercise is stored yet.</p>
              </div>
            )}
          </PixelPanel>
        </section>

        <section
          id="attempt-history"
          className={styles.attemptHistory}
          aria-labelledby="attempt-history-heading"
        >
          <div className={`${styles.sectionHeading} progress-section-heading`}>
            <div className={styles.headingIdentity}>
              <span className={styles.sectionIcon} aria-hidden="true">
                <PixelIcon name="speech" size="small" />
              </span>
              <div>
                <p>Attempt History</p>
                <h2 id="attempt-history-heading">Saved Interview Simulations</h2>
              </div>
            </div>
            <p>
              {state.attempts.length} stored{" "}
              {state.attempts.length === 1 ? "attempt" : "attempts"}
            </p>
          </div>
          {state.attempts.length === 0 ? (
            <PixelPanel className="attempt-history-empty">
              <h3>No interview attempts yet.</h3>
              <p>
                Your lesson and exercise activity is saved. Complete a simulation when you
                are ready to apply the skill.
              </p>
              <PixelButton href="/practice">Start a simulation</PixelButton>
            </PixelPanel>
          ) : (
            <div className={`${styles.attemptList} attempt-history-list`}>
              {state.attempts.map((attempt, index) => (
                <article
                  className={`${styles.attemptCard} attempt-history-card`}
                  key={attempt.id}
                >
                  <div className={styles.attemptSummary}>
                    <div className={styles.attemptTopline}>
                      <span className="attempt-number">
                        Attempt {state.attempts.length - index}
                      </span>
                      <div className={styles.transcriptStatus}>
                        <span>Transcript Status</span>
                        <PixelBadge tone="plum">Saved</PixelBadge>
                      </div>
                    </div>
                    <h3>{attempt.context.setup.role}</h3>
                    <p>
                      {attempt.context.setup.organization} ·{" "}
                      {formatAttemptDate(attempt.completedAt)}
                    </p>
                  </div>
                  <dl className={styles.attemptMetadata}>
                    <div>
                      <dt>Position</dt>
                      <dd>{attempt.context.setup.role}</dd>
                    </div>
                    <div>
                      <dt>Company</dt>
                      <dd>{attempt.context.setup.organization}</dd>
                    </div>
                    <div>
                      <dt>Date and Time</dt>
                      <dd>{formatAttemptDate(attempt.completedAt)}</dd>
                    </div>
                    <div>
                      <dt>Confirmed Responses</dt>
                      <dd>{attempt.responses.length}</dd>
                    </div>
                  </dl>
                  <div className={`${styles.attemptStatus} attempt-history-meta`}>
                    <span>Feedback Status</span>
                    <PixelBadge tone={attempt.evaluation ? "mint" : "plum"}>
                      {attempt.evaluation ? "Feedback saved" : "Not generated"}
                    </PixelBadge>
                  </div>
                  <div className={styles.attemptActions}>
                    <PixelButton
                      onClick={() => setSelectedAttemptId(attempt.id)}
                      variant="secondary"
                    >
                      Open Attempt
                    </PixelButton>
                    <button
                      type="button"
                      className={styles.deleteAttemptButton}
                      onClick={() => {
                        setDeleteError("");
                        setPendingDeleteId(attempt.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {selectedAttempt ? (
          <section
            className={`${styles.attemptDetail} attempt-detail`}
            aria-labelledby="attempt-detail-heading"
          >
            <div className="attempt-detail-heading">
              <div>
                <p className="eyebrow">Previous attempt</p>
                <h2 id="attempt-detail-heading">
                  {selectedAttempt.context.setup.role} at{" "}
                  {selectedAttempt.context.setup.organization}
                </h2>
                <p>{formatAttemptDate(selectedAttempt.completedAt)}</p>
              </div>
              <PixelButton onClick={() => setSelectedAttemptId("")} variant="ghost">
                Close attempt
              </PixelButton>
            </div>
            {selectedAttempt.retryGoal ? (
              <p className="attempt-retry-goal">
                <strong>Focused goal:</strong> {selectedAttempt.retryGoal}
              </p>
            ) : null}
            {selectedAttempt.evaluation ? (
              <div className="attempt-evaluation-summary">
                <h3>Validated feedback summary</h3>
                <p>{selectedAttempt.evaluation.summary}</p>
                <ul aria-label="Saved rubric scores">
                  {selectedAttempt.evaluation.rubricScores.map((item) => (
                    <li key={item.criterion}>
                      <strong>{item.criterion}</strong>
                      <span>{item.score}/5</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="attempt-no-evaluation">
                This attempt has a confirmed transcript but no saved validated feedback.
                No score is inferred.
              </p>
            )}
            <ol className="attempt-transcript-list">
              {selectedAttempt.questions.map((question) => {
                const response = selectedAttempt.responses.find(
                  (item) => item.questionId === question.id,
                );
                return (
                  <li key={question.id}>
                    <h3>{question.text}</h3>
                    <blockquote>{response?.transcript}</blockquote>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}

        <section
          className={`${styles.comparisonSection} attempt-comparison`}
          aria-labelledby="attempt-comparison-heading"
        >
          <div className={`${styles.sectionHeading} progress-section-heading`}>
            <div className={styles.headingIdentity}>
              <span className={styles.sectionIcon} aria-hidden="true">
                <PixelIcon name="progress" size="small" />
              </span>
              <div>
                <p className="eyebrow">Attempt comparison</p>
                <h2 id="attempt-comparison-heading">
                  Compare two related practice attempts
                </h2>
              </div>
            </div>
            <p>Only the same skill or scenario can be compared.</p>
          </div>
          {state.attempts.length < 2 ? (
            <PixelPanel className="comparison-empty-state">
              <h3>Two attempts are needed for comparison.</h3>
              <p>
                Your saved attempt remains available above. Complete another related
                simulation to compare rubric evidence.
              </p>
              <PixelButton href="/practice">Practice again</PixelButton>
            </PixelPanel>
          ) : (
            <>
              <div className={`${styles.comparisonSelectors} comparison-selectors`}>
                <div className={styles.comparisonChoice}>
                  <label htmlFor="comparison-first">First attempt</label>
                  <select
                    id="comparison-first"
                    value={firstComparisonId}
                    onChange={(event) => setFirstComparisonId(event.target.value)}
                  >
                    <option value="">Choose an attempt</option>
                    {state.attempts.map((attempt) => (
                      <option key={attempt.id} value={attempt.id}>
                        {attempt.context.setup.role} ·{" "}
                        {formatAttemptDate(attempt.completedAt)}
                      </option>
                    ))}
                  </select>
                </div>
                <span className={styles.comparisonIcon} aria-hidden="true">
                  <PixelIcon name="progress" size="medium" />
                </span>
                <div className={styles.comparisonChoice}>
                  <label htmlFor="comparison-second">Second attempt</label>
                  <select
                    id="comparison-second"
                    value={secondComparisonId}
                    onChange={(event) => setSecondComparisonId(event.target.value)}
                  >
                    <option value="">Choose an attempt</option>
                    {state.attempts.map((attempt) => (
                      <option key={attempt.id} value={attempt.id}>
                        {attempt.context.setup.role} ·{" "}
                        {formatAttemptDate(attempt.completedAt)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {comparison && !comparison.compatible ? (
                <div className="comparison-incompatible" role="alert">
                  <strong>These attempts cannot be compared.</strong>
                  <span>{comparison.reason}</span>
                </div>
              ) : null}
              {comparison?.compatible ? (
                <div className="comparison-report" aria-live="polite">
                  <div className="comparison-caution" role="note">
                    {comparison.caution}
                  </div>
                  <p className="comparison-basis">
                    Comparable by shared {comparison.basis}.
                  </p>
                  <div className="comparison-table-wrap">
                    <table>
                      <caption>
                        Rubric-level changes from the earlier to later attempt
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">Criterion</th>
                          <th scope="col">Earlier</th>
                          <th scope="col">Later</th>
                          <th scope="col">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.rubricChanges.map((change) => (
                          <tr key={change.criterion}>
                            <th scope="row">{change.label}</th>
                            <td>{change.earlierScore}/5</td>
                            <td>{change.laterScore}/5</td>
                            <td>
                              {change.delta > 0 ? `+${change.delta}` : change.delta}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="comparison-guidance-grid">
                    <section>
                      <h3>Specific improvements in this pair</h3>
                      <ul>
                        {comparison.specificImprovements.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <h3>Remaining practice areas</h3>
                      <ul>
                        {comparison.remainingPracticeAreas.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
      {pendingDeleteAttempt ? (
        <div className={styles.deleteDialogBackdrop}>
          <section
            className={styles.deleteDialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-attempt-heading"
            aria-describedby="delete-attempt-description"
          >
            <span className={styles.deleteDialogIcon} aria-hidden="true">
              <PixelIcon name="resume" size="large" />
            </span>
            <div>
              <p>Permanent Record Action</p>
              <h2 id="delete-attempt-heading">Delete saved interview?</h2>
            </div>
            <p id="delete-attempt-description">
              Delete the {pendingDeleteAttempt.context.setup.role} interview at{" "}
              {pendingDeleteAttempt.context.setup.organization}? Its transcript and saved
              feedback will be permanently removed from this browser.
            </p>
            {deleteError ? <p role="alert">{deleteError}</p> : null}
            <div className={styles.deleteDialogActions}>
              <button
                type="button"
                ref={cancelDeleteButtonRef}
                onClick={() => {
                  setPendingDeleteId("");
                  setDeleteError("");
                }}
              >
                Cancel
              </button>
              <button type="button" onClick={confirmDeleteAttempt}>
                Delete Saved Attempt
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
