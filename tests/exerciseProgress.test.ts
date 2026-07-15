import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { starArrangementExercise } from "@/content/star-arrangement-exercise";
import {
  clearExerciseProgress,
  EXERCISE_PROGRESS_STORAGE_KEY,
  ExerciseProgressStorageError,
  getExerciseProgressEntry,
  readExerciseProgress,
  recordExerciseAttempt,
} from "@/lib/exercise-progress";

describe("exercise progress persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("saves completion after an incorrect attempt and tracks correctness separately", () => {
    const entry = recordExerciseAttempt(
      window.localStorage,
      starArrangementExercise.id,
      false,
    );

    expect(entry).toEqual({ attemptCount: 1, completed: true, correct: false });
    expect(window.localStorage.getItem(EXERCISE_PROGRESS_STORAGE_KEY)).toContain(
      starArrangementExercise.id,
    );
  });

  it("retains a correct result across later retries", () => {
    recordExerciseAttempt(window.localStorage, starArrangementExercise.id, true);
    recordExerciseAttempt(window.localStorage, starArrangementExercise.id, false);
    const progress = readExerciseProgress(window.localStorage);

    expect(getExerciseProgressEntry(progress, starArrangementExercise.id)).toEqual({
      attemptCount: 2,
      completed: true,
      correct: true,
    });
  });

  it("restores completion and normalizes it from the saved attempt count", () => {
    window.localStorage.setItem(
      EXERCISE_PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        exercises: {
          [starArrangementExercise.id]: {
            attemptCount: 2,
            completed: false,
            correct: true,
          },
        },
      }),
    );

    const restored = getExerciseProgressEntry(
      readExerciseProgress(window.localStorage),
      starArrangementExercise.id,
    );

    expect(restored).toEqual({ attemptCount: 2, completed: true, correct: true });
  });

  it("classifies corrupt progress and can clear only the exercise progress key", () => {
    window.localStorage.setItem(EXERCISE_PROGRESS_STORAGE_KEY, "not-json");
    window.localStorage.setItem("unrelated", "keep-me");

    expect(() => readExerciseProgress(window.localStorage)).toThrowError(
      expect.objectContaining<Partial<ExerciseProgressStorageError>>({
        kind: "corrupt",
      }),
    );

    clearExerciseProgress(window.localStorage);

    expect(window.localStorage.getItem(EXERCISE_PROGRESS_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem("unrelated")).toBe("keep-me");
  });

  it("classifies unavailable storage without reporting completion", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });

    expect(() => readExerciseProgress(window.localStorage)).toThrowError(
      expect.objectContaining<Partial<ExerciseProgressStorageError>>({
        kind: "unavailable",
      }),
    );
  });
});
