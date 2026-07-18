import { calculateExerciseCompletion } from "@/lib/star-exercise-validation";
import { notifyProgressChanged } from "@/lib/progress-events";

export const EXERCISE_PROGRESS_STORAGE_KEY = "ameego:exercise-progress:v1";

export type ExerciseProgressEntry = {
  attemptCount: number;
  completed: boolean;
  correct: boolean;
};

export type ExerciseProgress = {
  version: 1;
  exercises: Record<string, ExerciseProgressEntry>;
};

export type ExerciseProgressErrorKind = "corrupt" | "unavailable";

export class ExerciseProgressStorageError extends Error {
  constructor(
    public readonly kind: ExerciseProgressErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "ExerciseProgressStorageError";
  }
}

function isProgressEntry(value: unknown): value is ExerciseProgressEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Partial<ExerciseProgressEntry>;
  return (
    typeof entry.attemptCount === "number" &&
    Number.isInteger(entry.attemptCount) &&
    entry.attemptCount >= 0 &&
    typeof entry.completed === "boolean" &&
    typeof entry.correct === "boolean"
  );
}

function isExerciseProgress(value: unknown): value is ExerciseProgress {
  if (!value || typeof value !== "object") {
    return false;
  }

  const progress = value as Partial<ExerciseProgress>;
  return (
    progress.version === 1 &&
    Boolean(progress.exercises) &&
    typeof progress.exercises === "object" &&
    Object.values(progress.exercises ?? {}).every(isProgressEntry)
  );
}

export function readExerciseProgress(storage: Storage): ExerciseProgress {
  let rawProgress: string | null;
  try {
    rawProgress = storage.getItem(EXERCISE_PROGRESS_STORAGE_KEY);
  } catch {
    throw new ExerciseProgressStorageError(
      "unavailable",
      "Exercise progress storage is unavailable.",
    );
  }

  if (!rawProgress) {
    return { version: 1, exercises: {} };
  }

  let parsedProgress: unknown;
  try {
    parsedProgress = JSON.parse(rawProgress);
  } catch {
    throw new ExerciseProgressStorageError(
      "corrupt",
      "Stored exercise progress is not valid JSON.",
    );
  }
  if (!isExerciseProgress(parsedProgress)) {
    throw new ExerciseProgressStorageError(
      "corrupt",
      "Stored exercise progress has an unsupported format.",
    );
  }

  return {
    version: 1,
    exercises: Object.fromEntries(
      Object.entries(parsedProgress.exercises).map(([exerciseId, entry]) => [
        exerciseId,
        {
          ...entry,
          completed: calculateExerciseCompletion(entry.attemptCount),
        },
      ]),
    ),
  };
}

export function clearExerciseProgress(storage: Storage): void {
  try {
    storage.removeItem(EXERCISE_PROGRESS_STORAGE_KEY);
    notifyProgressChanged();
  } catch {
    throw new ExerciseProgressStorageError(
      "unavailable",
      "Exercise progress storage is unavailable.",
    );
  }
}

export function recordExerciseAttempt(
  storage: Storage,
  exerciseId: string,
  correct: boolean,
): ExerciseProgressEntry {
  const progress = readExerciseProgress(storage);
  const currentEntry = progress.exercises[exerciseId];
  const attemptCount = (currentEntry?.attemptCount ?? 0) + 1;
  const nextEntry: ExerciseProgressEntry = {
    attemptCount,
    completed: calculateExerciseCompletion(attemptCount),
    correct: Boolean(currentEntry?.correct || correct),
  };
  const nextProgress: ExerciseProgress = {
    version: 1,
    exercises: {
      ...progress.exercises,
      [exerciseId]: nextEntry,
    },
  };

  try {
    storage.setItem(EXERCISE_PROGRESS_STORAGE_KEY, JSON.stringify(nextProgress));
    notifyProgressChanged();
  } catch {
    throw new ExerciseProgressStorageError(
      "unavailable",
      "Exercise progress could not be saved.",
    );
  }
  return nextEntry;
}

export function getExerciseProgressErrorKind(error: unknown): ExerciseProgressErrorKind {
  return error instanceof ExerciseProgressStorageError ? error.kind : "unavailable";
}

export function getExerciseProgressEntry(
  progress: ExerciseProgress,
  exerciseId: string,
): ExerciseProgressEntry {
  return (
    progress.exercises[exerciseId] ?? {
      attemptCount: 0,
      completed: false,
      correct: false,
    }
  );
}
