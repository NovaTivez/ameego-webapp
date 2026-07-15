"use client";

import Link from "next/link";
import { useMemo, useState, type DragEvent } from "react";

import { ExerciseProgressState } from "@/components/ExerciseProgressState";
import { LearningScene } from "@/components/LearningScene";
import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelPanel } from "@/components/PixelPanel";
import { PixelProgress } from "@/components/PixelProgress";
import { PixelStatusBar } from "@/components/PixelStatusBar";
import type {
  StarArrangementExerciseData,
  StarSegmentId,
} from "@/content/star-arrangement-exercise";
import { useExerciseProgress } from "@/hooks/useExerciseProgress";
import {
  getCorrectStarOrder,
  moveStarSegment,
  moveStarSegmentToTarget,
  validateStarOrder,
  type StarOrderValidation,
} from "@/lib/star-exercise-validation";

type StarArrangementExerciseProps = {
  exercise: StarArrangementExerciseData;
};

export function StarArrangementExercise({ exercise }: StarArrangementExerciseProps) {
  const [order, setOrder] = useState<StarSegmentId[]>(exercise.initialOrder);
  const [validation, setValidation] = useState<StarOrderValidation | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [draggedSegmentId, setDraggedSegmentId] = useState<StarSegmentId | null>(null);
  const [dropTargetId, setDropTargetId] = useState<StarSegmentId | null>(null);
  const progress = useExerciseProgress(exercise.id);
  const segmentMap = useMemo(
    () => new Map(exercise.segments.map((segment) => [segment.id, segment])),
    [exercise.segments],
  );

  const moveSegment = (fromIndex: number, toIndex: number) => {
    const movedId = order[fromIndex];
    const movedSegment = segmentMap.get(movedId);
    const nextOrder = moveStarSegment(order, fromIndex, toIndex);
    setOrder(nextOrder);
    setAnnouncement(
      movedSegment && nextOrder !== order
        ? `${movedSegment.label} moved to position ${nextOrder.indexOf(movedId) + 1}.`
        : "The answer order did not change.",
    );
    setValidation(null);
  };

  const handleDrop = (event: DragEvent<HTMLLIElement>, targetId: StarSegmentId) => {
    event.preventDefault();
    const transferredId = event.dataTransfer.getData("text/plain") as StarSegmentId;
    const draggedId = draggedSegmentId ?? transferredId;

    if (segmentMap.has(draggedId) && segmentMap.has(targetId)) {
      const nextOrder = moveStarSegmentToTarget(order, draggedId, targetId);
      const movedSegment = segmentMap.get(draggedId);
      setOrder(nextOrder);
      setAnnouncement(
        movedSegment
          ? `${movedSegment.label} moved to position ${nextOrder.indexOf(draggedId) + 1}.`
          : "Answer segment moved.",
      );
      setValidation(null);
    }

    setDraggedSegmentId(null);
    setDropTargetId(null);
  };

  const handleValidate = () => {
    const result = validateStarOrder(order, exercise);
    setValidation(result);
    progress.saveAttempt(result.correct);
    setAnnouncement(
      result.correct
        ? "Correct. Your STAR answer is in the right order."
        : "Your attempt is complete. Review the placement guidance and try again if you want.",
    );
  };

  const handleRetry = () => {
    setOrder([...exercise.initialOrder]);
    setValidation(null);
    setAnnouncement("Exercise reset to its starting order.");
  };

  const correctOrder = getCorrectStarOrder(exercise);

  return (
    <div className="star-exercise">
      <nav className="lesson-breadcrumbs" aria-label="Course breadcrumb">
        <Link href="/learn">Interview Foundations</Link>
        <span aria-hidden="true">/</span>
        <Link href="/learn/star-method">STAR Method</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Arrangement exercise</span>
      </nav>

      <header className="exercise-header">
        <PixelBadge tone="amber">Interactive exercise</PixelBadge>
        <p className="eyebrow">STAR sequence</p>
        <h1>{exercise.title}</h1>
        <p className="hero-lede">{exercise.instructions}</p>
      </header>

      <LearningScene variant="exercise" />

      {progress.status === "loading" ? <ExerciseProgressState state="loading" /> : null}
      {progress.status === "error" ? (
        <ExerciseProgressState
          state="error"
          errorKind={progress.errorKind}
          onRetry={progress.retrySave}
        />
      ) : null}
      {progress.status === "ready" && progress.completed ? (
        <div className="exercise-saved-status" role="status">
          <PixelBadge tone="mint">Completion saved</PixelBadge>
          <PixelStatusBar
            label="Exercise checkpoint"
            value={progress.correct ? "Correct order saved" : "Attempt saved"}
            tone="success"
          />
          <span>
            {progress.correct
              ? "A correct arrangement has been recorded."
              : "An attempt has been recorded; perfection is not required to continue."}
          </span>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <section aria-labelledby="arrangement-heading">
        <PixelProgress
          label="STAR exercise progress"
          current={validation ? 1 : 0}
          total={1}
        />
        <div className="exercise-section-heading">
          <div>
            <p className="eyebrow">Your arrangement</p>
            <h2 id="arrangement-heading">Put the answer in a useful sequence.</h2>
          </div>
          <span className="exercise-help" id="exercise-reorder-help">
            Mouse or trackpad: drag cards. Keyboard or touch: use Move up / Move down.
          </span>
        </div>

        <ol className="exercise-segment-list" aria-describedby="exercise-reorder-help">
          {order.map((segmentId, index) => {
            const segment = segmentMap.get(segmentId);
            if (!segment) {
              return null;
            }

            return (
              <li
                key={segment.id}
                className={`exercise-segment${dropTargetId === segment.id ? " is-drop-target" : ""}`}
                draggable
                data-testid={`segment-${segment.id}`}
                onDragStart={(event) => {
                  setDraggedSegmentId(segment.id);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", segment.id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDropTargetId(segment.id);
                }}
                onDragEnd={() => {
                  setDraggedSegmentId(null);
                  setDropTargetId(null);
                }}
                onDrop={(event) => handleDrop(event, segment.id)}
              >
                <span className="exercise-position" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="exercise-segment-copy">
                  <span className="exercise-drag-label">Answer segment</span>
                  <p>{segment.text}</p>
                </div>
                <div
                  className="exercise-move-controls"
                  role="group"
                  aria-label={`Move ${segment.label}`}
                >
                  <button
                    type="button"
                    onClick={() => moveSegment(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move ${segment.label} up`}
                  >
                    <span aria-hidden="true">Up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSegment(index, index + 1)}
                    disabled={index === order.length - 1}
                    aria-label={`Move ${segment.label} down`}
                  >
                    <span aria-hidden="true">Down</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="exercise-action-row">
          <PixelButton onClick={handleValidate} disabled={progress.status === "loading"}>
            Check my order
          </PixelButton>
          <PixelButton onClick={handleRetry} variant="secondary">
            Reset arrangement
          </PixelButton>
        </div>
      </section>

      {validation ? (
        <section className="exercise-feedback" aria-live="polite" aria-atomic="true">
          <PixelPanel
            tone={validation.correct ? "dark" : "warning"}
            className="exercise-feedback-summary"
          >
            <PixelBadge tone={validation.correct ? "mint" : "amber"}>
              {validation.correct ? "Correct order" : "Attempt complete"}
            </PixelBadge>
            <h2>
              {validation.correct
                ? "Situation, Task, Action, Result."
                : "A few segments need a different position."}
            </h2>
            <p>
              {validation.correct
                ? "You built a sequence that lets the listener follow cause and effect."
                : "You can continue now, or use the guidance below and retry for a stronger understanding."}
            </p>
          </PixelPanel>

          {!validation.correct ? (
            <div className="exercise-placement-feedback">
              <h2>What should move?</h2>
              <ul>
                {validation.placements
                  .filter((placement) => !placement.correct)
                  .map((placement) => (
                    <li key={placement.segmentId}>{placement.explanation}</li>
                  ))}
              </ul>
            </div>
          ) : null}

          <div className="exercise-correct-order">
            <p className="eyebrow">Why the correct order works</p>
            <h2>Context, responsibility, decisions, evidence.</h2>
            <p>{exercise.correctOrderExplanation}</p>
            <ol>
              {correctOrder.map((segmentId) => {
                const segment = segmentMap.get(segmentId);
                return segment ? <li key={segmentId}>{segment.label}</li> : null;
              })}
            </ol>
          </div>

          <div className="exercise-completion-actions">
            <PixelButton onClick={handleRetry} variant="secondary">
              Retry exercise
            </PixelButton>
            <PixelButton href={exercise.simulatorHref}>
              Continue to Interview Center
            </PixelButton>
          </div>
        </section>
      ) : null}
    </div>
  );
}
