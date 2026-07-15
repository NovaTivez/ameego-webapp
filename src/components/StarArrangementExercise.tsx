"use client";

import Link from "next/link";
import { useMemo, useState, type DragEvent } from "react";

import { ExerciseProgressState } from "@/components/ExerciseProgressState";
import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelPanel } from "@/components/PixelPanel";
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

import styles from "./star-exercise.module.css";

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
    setOrder((currentOrder) => {
      const movedId = currentOrder[fromIndex];
      const movedSegment = segmentMap.get(movedId);
      const nextOrder = moveStarSegment(currentOrder, fromIndex, toIndex);
      setAnnouncement(
        movedSegment && nextOrder !== currentOrder
          ? `${movedSegment.label} moved to position ${nextOrder.indexOf(movedId) + 1}.`
          : "The answer order did not change.",
      );
      return nextOrder;
    });
    setValidation(null);
  };

  const handleDrop = (event: DragEvent<HTMLLIElement>, targetId: StarSegmentId) => {
    event.preventDefault();
    const transferredId = event.dataTransfer.getData("text/plain") as StarSegmentId;
    const draggedId = draggedSegmentId ?? transferredId;

    if (segmentMap.has(draggedId) && segmentMap.has(targetId)) {
      setOrder((currentOrder) => {
        const nextOrder = moveStarSegmentToTarget(currentOrder, draggedId, targetId);
        const movedSegment = segmentMap.get(draggedId);
        setAnnouncement(
          movedSegment
            ? `${movedSegment.label} moved to position ${nextOrder.indexOf(draggedId) + 1}.`
            : "Answer segment moved.",
        );
        return nextOrder;
      });
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
    <div className={styles.exerciseScreen}>
      <nav className={styles.breadcrumbs} aria-label="Course breadcrumb">
        <Link href="/learn">Interview Foundations</Link>
        <span aria-hidden="true">/</span>
        <Link href="/learn/star-method">STAR Method</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Arrangement exercise</span>
      </nav>

      <section className={styles.exercisePanel} aria-labelledby="exercise-title">
        <header className={styles.exerciseHeader}>
          <div>
            <p>Interactive Exercise</p>
            <h1 id="exercise-title">Arrange the STAR Method</h1>
          </div>
          <PixelBadge tone={validation?.correct ? "mint" : "amber"}>
            {validation ? "Checked" : "1 Exercise"}
          </PixelBadge>
        </header>

        <div className={styles.instructions}>
          <strong>Put the four answer segments in the correct order.</strong>
          <span id="exercise-reorder-help">
            Drag with a mouse. On touch or keyboard, use each tile&apos;s arrow controls.
          </span>
        </div>

        {progress.status === "loading" ? (
          <div className={styles.progressState}>
            <ExerciseProgressState state="loading" />
          </div>
        ) : null}
        {progress.status === "error" ? (
          <div className={styles.progressState}>
            <ExerciseProgressState
              state="error"
              errorKind={progress.errorKind}
              onRetry={progress.retrySave}
            />
          </div>
        ) : null}
        {progress.status === "ready" && progress.completed ? (
          <div className={styles.savedStatus} role="status">
            <PixelBadge tone="mint">Completion saved</PixelBadge>
            <span>
              {progress.correct
                ? "Correct order saved"
                : "Attempt saved — perfection is not required to continue."}
            </span>
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>

        <section className={styles.arrangement} aria-labelledby="arrangement-heading">
          <div className={styles.arrangementHeading}>
            <h2 id="arrangement-heading">Answer Slots</h2>
            <span>Move S → T → A → R</span>
          </div>

          <ol className={styles.answerSlots} aria-describedby="exercise-reorder-help">
            {order.map((segmentId, index) => {
              const segment = segmentMap.get(segmentId);
              if (!segment) {
                return null;
              }

              const isDragging = draggedSegmentId === segment.id;
              const isDropTarget = dropTargetId === segment.id;

              return (
                <li
                  key={segment.id}
                  className={`${styles.answerSlot}${isDragging ? ` ${styles.isDragging}` : ""}${isDropTarget ? ` ${styles.isDropTarget}` : ""}`}
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
                  <span className={styles.slotLabel}>Slot {index + 1}</span>
                  <div className={styles.answerTile}>
                    <span className={styles.tileLetter} aria-hidden="true">
                      {segment.label.charAt(0)}
                    </span>
                    <div className={styles.tileCopy}>
                      <strong>{segment.label}</strong>
                      <p>{segment.text}</p>
                    </div>
                    <div
                      className={styles.moveControls}
                      aria-label={`Move ${segment.label}`}
                    >
                      <button
                        type="button"
                        onClick={() => moveSegment(index, index - 1)}
                        disabled={index === 0}
                        aria-label={`Move ${segment.label} up`}
                      >
                        <span aria-hidden="true">↑</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSegment(index, index + 1)}
                        disabled={index === order.length - 1}
                        aria-label={`Move ${segment.label} down`}
                      >
                        <span aria-hidden="true">↓</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className={styles.actionRow}>
            <PixelButton onClick={handleRetry} variant="secondary">
              <span className="sr-only">Reset arrangement</span>
              <span aria-hidden="true">Reset</span>
            </PixelButton>
            <PixelButton
              onClick={handleValidate}
              disabled={progress.status === "loading"}
            >
              <span className="sr-only">Check my order</span>
              <span aria-hidden="true">Check</span>
            </PixelButton>
          </div>
        </section>
      </section>

      {validation ? (
        <section className={styles.feedback} aria-live="polite" aria-atomic="true">
          <PixelPanel
            tone={validation.correct ? "dark" : "warning"}
            className={styles.feedbackSummary}
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
            <div className={styles.placementFeedback}>
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

          <div className={styles.correctOrder}>
            <p>Why the correct order works</p>
            <h2>Context, responsibility, decisions, evidence.</h2>
            <span>{exercise.correctOrderExplanation}</span>
            <ol>
              {correctOrder.map((segmentId) => {
                const segment = segmentMap.get(segmentId);
                return segment ? <li key={segmentId}>{segment.label}</li> : null;
              })}
            </ol>
          </div>

          <div className={styles.completionActions}>
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
