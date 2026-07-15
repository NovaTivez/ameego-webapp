"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelLoadingState } from "@/components/PixelLoadingState";
import { PixelPanel } from "@/components/PixelPanel";
import { readCourseProgress } from "@/lib/course-progress";
import { readExerciseProgress } from "@/lib/exercise-progress";
import { readInterviewAttempts } from "@/lib/interview/attempts";
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

export function ProgressDashboard() {
  const [state, setState] = useState<DashboardState>({ status: "loading" });
  const [selectedAttemptId, setSelectedAttemptId] = useState("");
  const [firstComparisonId, setFirstComparisonId] = useState("");
  const [secondComparisonId, setSecondComparisonId] = useState("");

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

  const selectedAttempt =
    state.status === "ready"
      ? state.attempts.find((attempt) => attempt.id === selectedAttemptId)
      : undefined;
  const comparison = useMemo(() => {
    if (state.status !== "ready" || !firstComparisonId || !secondComparisonId) {
      return null;
    }
    const first = state.attempts.find((attempt) => attempt.id === firstComparisonId);
    const second = state.attempts.find((attempt) => attempt.id === secondComparisonId);
    return first && second ? compareAttempts(first, second) : null;
  }, [firstComparisonId, secondComparisonId, state]);

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
      <PixelPanel className={`${styles.emptyState} progress-empty-state`}>
        <PixelBadge tone="amber">New learner checkpoint</PixelBadge>
        <h2>Your progress library is ready for its first record.</h2>
        <p>
          Complete the STAR lesson, try the arrangement exercise, then save an interview
          simulation. Only activity completed on this device will appear here.
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
    );
  }

  return (
    <div className={`${styles.dashboard} progress-dashboard`}>
      <section aria-labelledby="progress-overview-heading">
        <div className={styles.overviewHeading}>
          <div>
            <p>Stored Activity</p>
            <h2 id="progress-overview-heading">Your Progress</h2>
          </div>
          <span>Only completed activity saved in this browser is counted.</span>
        </div>
        <div className={styles.statGrid}>
          <article className={styles.statCard}>
            <span>Lessons Completed</span>
            <strong>{state.snapshot.completedLessons.length}</strong>
          </article>
          <article className={styles.statCard}>
            <span>Interviews Taken</span>
            <strong>{state.snapshot.simulationsCompleted}</strong>
            <small>{state.snapshot.evaluatedSimulations} with feedback</small>
          </article>
          <article className={styles.statCard}>
            <span>Current Streak</span>
            <strong>{state.snapshot.currentStreak}</strong>
            <small>
              {state.snapshot.currentStreak === 1 ? "Practice day" : "Practice days"}
            </small>
          </article>
          <article className={styles.statCard}>
            <span>Level</span>
            <strong>{String(state.snapshot.level).padStart(2, "0")}</strong>
            <small>{state.snapshot.xp} real activity XP</small>
          </article>
        </div>
      </section>

      <section
        className={styles.progressGrid}
        aria-label="Skill progress and recent activity"
      >
        <div className={styles.gamePanel}>
          <div className={styles.panelHeading}>
            <h2>Skill Progress</h2>
            <span>Validated rubric averages</span>
          </div>
          {state.snapshot.skillProgress.length ? (
            <div className={styles.skillList}>
              {state.snapshot.skillProgress.map((skill) => (
                <div className={styles.skillRow} key={skill.criterion}>
                  <div>
                    <span>{skill.label}</span>
                    <strong>{skill.percent}%</strong>
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
                  <small>
                    {skill.averageScore}/5 across {skill.evaluatedAttempts} validated{" "}
                    {skill.evaluatedAttempts === 1 ? "attempt" : "attempts"}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.panelEmpty}>
              Complete a simulation with validated feedback to unlock rubric-based skill
              bars.
            </p>
          )}
        </div>

        <div className={styles.gamePanel}>
          <div className={styles.panelHeading}>
            <h2>Recent Activity</h2>
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
        </div>
      </section>

      <section
        className={styles.recommendation}
        aria-labelledby="next-recommendation-heading"
      >
        <PixelIcon name="star" size="small" />
        <div>
          <span>Next Recommendation</span>
          <h2 id="next-recommendation-heading">{state.snapshot.recommendedNext.title}</h2>
          <p>{state.snapshot.recommendedNext.description}</p>
        </div>
        <PixelButton href={state.snapshot.recommendedNext.href}>Start</PixelButton>
      </section>

      <section
        className={`${styles.completionGrid} progress-completion-grid`}
        aria-label="Completed learning activities"
      >
        <PixelPanel className="progress-completion-card">
          <p className="eyebrow">Completed lessons</p>
          <h2>Lesson records</h2>
          {state.snapshot.completedLessons.length ? (
            <ul>
              {state.snapshot.completedLessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link href={lesson.href}>{lesson.title}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No completed lesson is stored yet.</p>
          )}
        </PixelPanel>
        <PixelPanel className="progress-completion-card">
          <p className="eyebrow">Completed exercises</p>
          <h2>Practice records</h2>
          {state.snapshot.completedExercises.length ? (
            <ul>
              {state.snapshot.completedExercises.map((exercise) => (
                <li key={exercise.id}>
                  <Link href={exercise.href}>{exercise.title}</Link>
                  <span>
                    {exercise.attemptCount}{" "}
                    {exercise.attemptCount === 1 ? "attempt" : "attempts"};{" "}
                    {exercise.correct ? "correct order recorded" : "completion recorded"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No completed exercise is stored yet.</p>
          )}
        </PixelPanel>
      </section>

      <section id="attempt-history" aria-labelledby="attempt-history-heading">
        <div className="progress-section-heading">
          <div>
            <p className="eyebrow">Attempt history</p>
            <h2 id="attempt-history-heading">Saved interview simulations</h2>
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
          <div className="attempt-history-list">
            {state.attempts.map((attempt, index) => (
              <article className="attempt-history-card" key={attempt.id}>
                <div>
                  <span className="attempt-number">
                    Attempt {state.attempts.length - index}
                  </span>
                  <h3>{attempt.context.setup.role}</h3>
                  <p>
                    {attempt.context.setup.organization} ·{" "}
                    {formatAttemptDate(attempt.completedAt)}
                  </p>
                </div>
                <div className="attempt-history-meta">
                  <PixelBadge tone={attempt.evaluation ? "mint" : "plum"}>
                    {attempt.evaluation ? "Feedback saved" : "Transcript saved"}
                  </PixelBadge>
                  <span>
                    {attempt.responses.length} confirmed{" "}
                    {attempt.responses.length === 1 ? "response" : "responses"}
                  </span>
                </div>
                <PixelButton
                  onClick={() => setSelectedAttemptId(attempt.id)}
                  variant="secondary"
                >
                  Open attempt
                </PixelButton>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedAttempt ? (
        <section className="attempt-detail" aria-labelledby="attempt-detail-heading">
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
              This attempt has a confirmed transcript but no saved validated feedback. No
              score is inferred.
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
        className="attempt-comparison"
        aria-labelledby="attempt-comparison-heading"
      >
        <div className="progress-section-heading">
          <div>
            <p className="eyebrow">Attempt comparison</p>
            <h2 id="attempt-comparison-heading">Compare two related practice attempts</h2>
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
            <div className="comparison-selectors">
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
                          <td>{change.delta > 0 ? `+${change.delta}` : change.delta}</td>
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
  );
}
