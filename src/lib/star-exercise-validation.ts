import type {
  StarArrangementExerciseData,
  StarExerciseSegment,
  StarSegmentId,
} from "@/content/star-arrangement-exercise";

export type SegmentPlacement = {
  segmentId: StarSegmentId;
  currentPosition: number;
  expectedPosition: number;
  correct: boolean;
  explanation: string;
};

export type StarOrderValidation = {
  correct: boolean;
  placements: SegmentPlacement[];
};

function ordinal(position: number): string {
  const names = ["first", "second", "third", "fourth"];
  return names[position] ?? `position ${position + 1}`;
}

function segmentById(
  data: StarArrangementExerciseData,
  segmentId: StarSegmentId,
): StarExerciseSegment {
  const segment = data.segments.find((candidate) => candidate.id === segmentId);

  if (!segment) {
    throw new Error(`Unknown STAR segment: ${segmentId}`);
  }

  return segment;
}

export function getCorrectStarOrder(data: StarArrangementExerciseData): StarSegmentId[] {
  return [...data.segments]
    .sort((left, right) => left.correctPosition - right.correctPosition)
    .map((segment) => segment.id);
}

export function validateStarOrder(
  order: StarSegmentId[],
  data: StarArrangementExerciseData,
): StarOrderValidation {
  const correctOrder = getCorrectStarOrder(data);

  if (
    order.length !== correctOrder.length ||
    new Set(order).size !== correctOrder.length ||
    correctOrder.some((segmentId) => !order.includes(segmentId))
  ) {
    throw new Error("The submitted order must contain every STAR segment exactly once.");
  }

  const placements = order.map((segmentId, currentPosition) => {
    const segment = segmentById(data, segmentId);
    const expectedPosition = correctOrder.indexOf(segmentId);
    const correct = currentPosition === expectedPosition;

    return {
      segmentId,
      currentPosition,
      expectedPosition,
      correct,
      explanation: correct
        ? `${segment.label} is correctly placed ${ordinal(expectedPosition)}.`
        : `${segment.label} is currently ${ordinal(currentPosition)}, but it belongs ${ordinal(expectedPosition)}. ${segment.placementHint}`,
    };
  });

  return {
    correct: placements.every((placement) => placement.correct),
    placements,
  };
}

export function moveStarSegment(
  order: StarSegmentId[],
  fromIndex: number,
  toIndex: number,
): StarSegmentId[] {
  if (
    fromIndex < 0 ||
    fromIndex >= order.length ||
    toIndex < 0 ||
    toIndex >= order.length ||
    fromIndex === toIndex
  ) {
    return [...order];
  }

  const nextOrder = [...order];
  const [movedSegment] = nextOrder.splice(fromIndex, 1);
  nextOrder.splice(toIndex, 0, movedSegment);
  return nextOrder;
}

export function moveStarSegmentToTarget(
  order: StarSegmentId[],
  draggedId: StarSegmentId,
  targetId: StarSegmentId,
): StarSegmentId[] {
  return moveStarSegment(order, order.indexOf(draggedId), order.indexOf(targetId));
}

export function calculateExerciseCompletion(attemptCount: number): boolean {
  return attemptCount > 0;
}
