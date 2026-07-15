"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { EvaluationFeedback } from "@/components/EvaluationFeedback";
import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelLoadingState } from "@/components/PixelLoadingState";
import { PixelPanel } from "@/components/PixelPanel";
import { PixelRoomBackground } from "@/components/PixelRoomBackground";
import { PixelStatusBar } from "@/components/PixelStatusBar";
import { useProgressDashboard } from "@/hooks/useProgressDashboard";
import { COURSE_PROGRESS_STORAGE_KEY } from "@/lib/course-progress";
import { EXERCISE_PROGRESS_STORAGE_KEY } from "@/lib/exercise-progress";
import type { CompletedInterviewAttempt } from "@/lib/interview/contracts";
import { INTERVIEW_ATTEMPTS_STORAGE_KEY } from "@/lib/interview/attempts";
import {
  compareAttempts,
  describeAttemptScenario,
  hasSavedEvaluation,
} from "@/lib/progress/compare";

function formatAttemptDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AttemptSummaryCard({
  attempt,
  selected,
  onOpen,
  onToggleCompare,
  compareSelected,
}: {
  attempt: CompletedInterviewAttempt;
  selected: boolean;
  onOpen: () => void;
  onToggleCompare: () => void;
  compareSelected: boolean;
}) {
  const evaluated = hasSavedEvaluation(attempt);
  return (
    <article className={`attempt-history-card${selected ? " is-selected" : ""}`}>
      <div className="attempt-history-card-copy">
        <p className="eyebrow">{formatAttemptDate(attempt.completedAt)}</p>
        <h3>{describeAttemptScenario(attempt)}</h3>
        <p>
          {attempt.questions.length} questions ·{" "}
          {evaluated ? "STAR evaluation saved" : "Transcript only (not evaluated)"}
        </p>
      </div>
      <div className="button-row">
        <PixelButton onClick={onOpen} variant={selected ? "primary" : "secondary"}>
          {selected ? "Viewing attempt" : "Open attempt"}
        </PixelButton>
        <PixelButton
          onClick={onToggleCompare}
          variant={compareSelected ? "primary" : "ghost"}
          disabled={!evaluated}
        >
          {compareSelected ? "Selected for compare" : "Select to compare"}
        </PixelButton>
      </div>
    </article>
  );
}

export function ProgressDashboard() {
  const { status, snapshot, error, reload } = useProgressDashboard();
  const [openAttemptId, setOpenAttemptId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const openHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const historyHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const openAttempt = useMemo(
    () => snapshot?.attempts.find((attempt) => attempt.id === openAttemptId) ?? null,
    [openAttemptId, snapshot],
  );

  // The opened attempt renders far below the activating button, so move
  // keyboard focus to it; closing returns focus to the history section.
  useEffect(() => {
    if (openAttemptId) {
      openHeadingRef.current?.focus();
    }
  }, [openAttemptId]);

  const closeAttempt = () => {
    setOpenAttemptId(null);
    setAnnouncement("Attempt closed.");
    historyHeadingRef.current?.focus();
  };

  const resetStoredProgress = () => {
    try {
      window.localStorage.removeItem(COURSE_PROGRESS_STORAGE_KEY);
      window.localStorage.removeItem(EXERCISE_PROGRESS_STORAGE_KEY);
      window.localStorage.removeItem(INTERVIEW_ATTEMPTS_STORAGE_KEY);
    } catch {
      // Storage unavailable; reload() will surface the same error state.
    }
    reload();
  };

  const compareSelection = useMemo(() => {
    if (!snapshot || compareIds.length !== 2) return null;
    const first = snapshot.attempts.find((attempt) => attempt.id === compareIds[0]);
    const second = snapshot.attempts.find((attempt) => attempt.id === compareIds[1]);
    if (!first || !second) return null;
    return compareAttempts(first, second);
  }, [compareIds, snapshot]);

  const toggleCompare = (attemptId: string) => {
    const next = compareIds.includes(attemptId)
      ? compareIds.filter((id) => id !== attemptId)
      : compareIds.length >= 2
        ? [compareIds[1], attemptId]
        : [...compareIds, attemptId];
    setCompareIds(next);
    setAnnouncement(
      next.length === 2
        ? "Two attempts selected. Comparison is shown below the attempt list."
        : `${next.length} of 2 attempts selected for comparison.`,
    );
  };

  if (status === "loading") {
    return (
      <div className="page-stack progress-library-page">
        <header className="progress-library-header">
          <p className="eyebrow">Progress Library</p>
          <h1>Loading your saved progress.</h1>
        </header>
        <PixelLoadingState label="Loading progress records from this device..." />
      </div>
    );
  }

  if (status === "error" || !snapshot) {
    return (
      <div className="page-stack progress-library-page">
        <header className="progress-library-header">
          <p className="eyebrow">Progress Library</p>
          <h1>Progress records unavailable</h1>
        </header>
        <PixelPanel className="progress-library-card">
          <p>{error ?? "Stored activity could not be read."}</p>
          <div className="button-row">
            <PixelButton onClick={reload}>Retry</PixelButton>
            <PixelButton variant="secondary" onClick={resetStoredProgress}>
              Reset stored progress
            </PixelButton>
          </div>
          <p role="note">
            Resetting removes saved lessons, exercises, and interview attempts from this
            browser so the library can start clean.
          </p>
        </PixelPanel>
      </div>
    );
  }

  if (snapshot.isEmpty) {
    return (
      <div className="page-stack progress-library-page">
        <header className="progress-library-header">
          <PixelBadge tone="mint">Library ready</PixelBadge>
          <p className="eyebrow">Progress Library</p>
          <h1>No saved activity yet.</h1>
          <p className="hero-lede">
            Lesson completions, exercises, and interview simulations appear here only
            after you save them on this device. Nothing is invented ahead of time.
          </p>
        </header>
        <PixelRoomBackground variant="library" label="Pixel-art progress library">
          <div className="library-desk">
            <PixelIcon name="progress" size="large" />
            <span>Empty records desk</span>
          </div>
        </PixelRoomBackground>
        <PixelPanel className="progress-library-card progress-empty-state">
          <PixelIcon name="lesson" size="large" />
          <h2>Start with the recommended next activity</h2>
          <p>{snapshot.recommendedNext.reason}</p>
          <div className="button-row">
            <PixelButton href={snapshot.recommendedNext.href}>
              {snapshot.recommendedNext.title}
            </PixelButton>
            <PixelButton href="/learn" variant="secondary">
              Browse Interview Foundations
            </PixelButton>
          </div>
        </PixelPanel>
      </div>
    );
  }

  return (
    <div className="page-stack progress-library-page">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <header className="progress-library-header">
        <PixelBadge tone="mint">Local records</PixelBadge>
        <p className="eyebrow">Progress Library</p>
        <h1>Evidence from this device only.</h1>
        <p className="hero-lede">
          Open a saved attempt, compare two evaluated runs from the same scenario, and
          follow the next activity derived from real stored progress.
        </p>
      </header>

      <PixelRoomBackground variant="library" label="Pixel-art progress library">
        <div className="library-desk">
          <PixelIcon name="progress" size="large" />
          <span>Local records desk</span>
        </div>
      </PixelRoomBackground>

      <div className="progress-summary-grid">
        <PixelPanel tone="dark" className="progress-library-console">
          <p className="eyebrow">Activity ledger</p>
          <h2>What is saved</h2>
          <PixelStatusBar
            label="Lessons completed"
            value={String(snapshot.completedLessons.length)}
            tone="success"
          />
          <PixelStatusBar
            label="Exercises completed"
            value={String(snapshot.completedExercises.length)}
            tone="success"
          />
          <PixelStatusBar
            label="Simulations completed"
            value={String(snapshot.simulationsCompleted)}
            tone="info"
          />
          <PixelStatusBar
            label="Evaluated attempts"
            value={String(snapshot.evaluatedAttempts)}
            tone={snapshot.evaluatedAttempts > 0 ? "success" : "warning"}
            icon="timer"
          />
        </PixelPanel>

        <PixelPanel className="progress-library-card">
          <PixelBadge tone="amber">Recommended next</PixelBadge>
          <h2>{snapshot.recommendedNext.title}</h2>
          <p>{snapshot.recommendedNext.reason}</p>
          <PixelButton href={snapshot.recommendedNext.href}>
            Continue recommended activity
          </PixelButton>
        </PixelPanel>
      </div>

      <div className="progress-library-grid">
        <PixelPanel className="progress-library-card">
          <h2>Completed lessons</h2>
          {snapshot.completedLessons.length === 0 ? (
            <p>No lesson completions are saved yet.</p>
          ) : (
            <ul className="progress-activity-list">
              {snapshot.completedLessons.map((lesson) => (
                <li key={lesson.id}>
                  <a href={lesson.href}>{lesson.title}</a>
                </li>
              ))}
            </ul>
          )}
        </PixelPanel>
        <PixelPanel className="progress-library-card">
          <h2>Completed exercises</h2>
          {snapshot.completedExercises.length === 0 ? (
            <p>No exercise completions are saved yet.</p>
          ) : (
            <ul className="progress-activity-list">
              {snapshot.completedExercises.map((exercise) => (
                <li key={exercise.id}>
                  <a href={exercise.href}>{exercise.title}</a>
                  {exercise.detail ? <span> — {exercise.detail}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </PixelPanel>
      </div>

      <PixelPanel className="progress-library-card attempt-history-panel">
        <div className="attempt-history-heading">
          <div>
            <p className="eyebrow">Attempt history</p>
            <h2 tabIndex={-1} ref={historyHeadingRef}>
              Saved interview simulations
            </h2>
          </div>
          <p>
            Select two evaluated attempts from the same scenario to compare rubric-level
            changes. Broad improvement is never claimed from a single isolated score.
          </p>
        </div>

        {snapshot.attempts.length === 0 ? (
          <p>No interview simulations are saved yet.</p>
        ) : (
          <div className="attempt-history-list">
            {snapshot.attempts.map((attempt) => (
              <AttemptSummaryCard
                key={attempt.id}
                attempt={attempt}
                selected={openAttemptId === attempt.id}
                compareSelected={compareIds.includes(attempt.id)}
                onOpen={() => {
                  setOpenAttemptId(attempt.id);
                  setAnnouncement("Attempt opened below the comparison section.");
                }}
                onToggleCompare={() => toggleCompare(attempt.id)}
              />
            ))}
          </div>
        )}

        {compareIds.length === 2 ? (
          <section className="attempt-comparison" aria-labelledby="comparison-heading">
            <h3 id="comparison-heading">Attempt comparison</h3>
            {compareSelection?.comparable ? (
              <>
                <p className="comparison-narrative">{compareSelection.narrative}</p>
                <p className="comparison-disclaimer" role="note">
                  Comparison uses saved rubric scores only. It does not invent an overall
                  grade or claim broad improvement from one isolated change.
                </p>
                <div className="comparison-meta">
                  <p>
                    Earlier: {formatAttemptDate(compareSelection.earlier.completedAt)}
                  </p>
                  <p>Later: {formatAttemptDate(compareSelection.later.completedAt)}</p>
                </div>
                <div
                  className="comparison-table-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Rubric comparison table"
                >
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th scope="col">Rubric</th>
                        <th scope="col">Earlier</th>
                        <th scope="col">Later</th>
                        <th scope="col">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compareSelection.rubricChanges.map((change) => (
                        <tr key={change.criterion}>
                          <th scope="row">{change.label}</th>
                          <td>{change.earlierScore}/5</td>
                          <td>{change.laterScore}/5</td>
                          <td>
                            {change.status === "improved"
                              ? `+${change.delta} improved`
                              : change.status === "declined"
                                ? `${change.delta} declined`
                                : "unchanged"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="comparison-lists">
                  <section>
                    <h4>Specific improvements</h4>
                    {compareSelection.specificImprovements.length === 0 ? (
                      <p>No rubric area improved between these attempts.</p>
                    ) : (
                      <ul>
                        {compareSelection.specificImprovements.map((item) => (
                          <li key={item.criterion}>
                            {item.label}: {item.earlierScore}/5 → {item.laterScore}/5
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                  <section>
                    <h4>Remaining practice areas</h4>
                    {compareSelection.remainingPracticeAreas.length === 0 ? (
                      <p>No weak or declined rubric areas remain in the later attempt.</p>
                    ) : (
                      <ul>
                        {compareSelection.remainingPracticeAreas.map((item) => (
                          <li key={item.criterion}>
                            {item.label}: {item.laterScore}/5
                            {item.status === "declined" ? " (declined)" : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </>
            ) : (
              <div className="interview-inline-error" role="alert">
                <strong>These attempts cannot be compared.</strong>
                <span>
                  {compareSelection && !compareSelection.comparable
                    ? compareSelection.reason
                    : "Choose two compatible evaluated attempts from the same scenario."}
                </span>
              </div>
            )}
          </section>
        ) : compareIds.length === 1 ? (
          <p className="comparison-hint">Select one more evaluated attempt to compare.</p>
        ) : null}
      </PixelPanel>

      {openAttempt ? (
        <PixelPanel className="progress-library-card attempt-detail-panel">
          <div className="attempt-history-heading">
            <div>
              <p className="eyebrow">Opened attempt</p>
              <h2 id="opened-attempt-heading" tabIndex={-1} ref={openHeadingRef}>
                {describeAttemptScenario(openAttempt)}
              </h2>
            </div>
            <PixelButton variant="ghost" onClick={closeAttempt}>
              Close attempt
            </PixelButton>
          </div>
          <p>Completed {formatAttemptDate(openAttempt.completedAt)}</p>
          <ol className="attempt-transcript-list">
            {openAttempt.questions.map((question) => {
              const response = openAttempt.responses.find(
                (item) => item.questionId === question.id,
              );
              return (
                <li key={question.id}>
                  <h3>{question.text}</h3>
                  <blockquote>{response?.transcript ?? "Missing response"}</blockquote>
                </li>
              );
            })}
          </ol>
          {openAttempt.evaluation ? (
            <EvaluationFeedback evaluation={openAttempt.evaluation} />
          ) : (
            <p>
              This attempt has no saved STAR evaluation yet. Generate feedback from a new
              Interview Center completion to unlock rubric comparison.
            </p>
          )}
        </PixelPanel>
      ) : null}
    </div>
  );
}
