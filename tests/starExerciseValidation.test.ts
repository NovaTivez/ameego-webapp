import { describe, expect, it } from "vitest";

import { starArrangementExercise } from "@/content/star-arrangement-exercise";
import {
  calculateExerciseCompletion,
  getCorrectStarOrder,
  moveStarSegment,
  moveStarSegmentToTarget,
  validateStarOrder,
} from "@/lib/star-exercise-validation";

describe("STAR exercise validation", () => {
  it("accepts Situation, Task, Action, Result as the correct order", () => {
    const order = getCorrectStarOrder(starArrangementExercise);
    const result = validateStarOrder(order, starArrangementExercise);

    expect(order).toEqual(["situation", "task", "action", "result"]);
    expect(result.correct).toBe(true);
    expect(result.placements.every((placement) => placement.correct)).toBe(true);
  });

  it("identifies incorrect placements and explains where they belong", () => {
    const result = validateStarOrder(
      starArrangementExercise.initialOrder,
      starArrangementExercise,
    );

    expect(result.correct).toBe(false);
    expect(result.placements.filter((placement) => !placement.correct)).not.toHaveLength(
      0,
    );
    expect(result.placements.map((placement) => placement.explanation).join(" ")).toMatch(
      /belongs/i,
    );
  });

  it("moves a segment without mutating the submitted order", () => {
    const initialOrder = [...starArrangementExercise.initialOrder];
    const movedOrder = moveStarSegment(initialOrder, 1, 0);

    expect(movedOrder).toEqual(["situation", "action", "result", "task"]);
    expect(initialOrder).toEqual(starArrangementExercise.initialOrder);
  });

  it("moves onto an exact target in either direction without losing or duplicating items", () => {
    const movedDown = moveStarSegmentToTarget(
      starArrangementExercise.initialOrder,
      "action",
      "task",
    );
    const movedUp = moveStarSegmentToTarget(
      starArrangementExercise.initialOrder,
      "task",
      "action",
    );

    expect(movedDown).toEqual(["situation", "result", "task", "action"]);
    expect(movedUp).toEqual(["task", "action", "situation", "result"]);
    for (const order of [movedDown, movedUp]) {
      expect(order).toHaveLength(4);
      expect(new Set(order)).toEqual(new Set(["situation", "task", "action", "result"]));
    }
  });

  it("rejects incomplete or duplicate submissions", () => {
    expect(() =>
      validateStarOrder(
        ["situation", "task", "action", "action"],
        starArrangementExercise,
      ),
    ).toThrow(/exactly once/i);
    expect(() =>
      validateStarOrder(["situation", "task", "action"], starArrangementExercise),
    ).toThrow(/exactly once/i);
  });

  it("calculates completion from any submitted attempt, not perfection", () => {
    expect(calculateExerciseCompletion(0)).toBe(false);
    expect(calculateExerciseCompletion(1)).toBe(true);
    expect(calculateExerciseCompletion(3)).toBe(true);
  });
});
