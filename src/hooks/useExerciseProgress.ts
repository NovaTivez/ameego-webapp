"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  clearExerciseProgress,
  getExerciseProgressErrorKind,
  getExerciseProgressEntry,
  readExerciseProgress,
  recordExerciseAttempt,
  type ExerciseProgressErrorKind,
  type ExerciseProgressEntry,
} from "@/lib/exercise-progress";

type ExerciseProgressState =
  | ({ status: "loading" } & ExerciseProgressEntry)
  | ({ status: "ready" } & ExerciseProgressEntry)
  | ({ status: "error"; errorKind: ExerciseProgressErrorKind } & ExerciseProgressEntry);

const INITIAL_ENTRY: ExerciseProgressEntry = {
  attemptCount: 0,
  completed: false,
  correct: false,
};

export function useExerciseProgress(exerciseId: string) {
  const [state, setState] = useState<ExerciseProgressState>({
    status: "loading",
    ...INITIAL_ENTRY,
  });
  const lastAttemptCorrect = useRef<boolean | null>(null);

  const load = useCallback(() => {
    setState((current) => ({ ...current, status: "loading" }));
    try {
      const progress = readExerciseProgress(window.localStorage);
      setState({
        status: "ready",
        ...getExerciseProgressEntry(progress, exerciseId),
      });
    } catch (error) {
      setState({
        status: "error",
        errorKind: getExerciseProgressErrorKind(error),
        ...INITIAL_ENTRY,
      });
    }
  }, [exerciseId]);

  useEffect(() => {
    let isActive = true;
    queueMicrotask(() => {
      if (isActive) {
        load();
      }
    });
    return () => {
      isActive = false;
    };
  }, [load]);

  const saveAttempt = useCallback(
    (correct: boolean) => {
      lastAttemptCorrect.current = correct;
      try {
        const entry = recordExerciseAttempt(window.localStorage, exerciseId, correct);
        setState({ status: "ready", ...entry });
      } catch (error) {
        setState((current) => ({
          ...current,
          status: "error",
          errorKind: getExerciseProgressErrorKind(error),
        }));
      }
    },
    [exerciseId],
  );

  const retrySave = useCallback(() => {
    if (state.status === "error" && state.errorKind === "corrupt") {
      try {
        clearExerciseProgress(window.localStorage);
      } catch (error) {
        setState((current) => ({
          ...current,
          status: "error",
          errorKind: getExerciseProgressErrorKind(error),
        }));
        return;
      }
    }

    if (lastAttemptCorrect.current === null) {
      load();
      return;
    }
    saveAttempt(lastAttemptCorrect.current);
  }, [load, saveAttempt, state]);

  return {
    ...state,
    saveAttempt,
    retrySave,
  };
}
