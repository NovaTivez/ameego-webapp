"use client";

import { useSyncExternalStore } from "react";

import { COURSE_PROGRESS_STORAGE_KEY, readCourseProgress } from "@/lib/course-progress";
import {
  EXERCISE_PROGRESS_STORAGE_KEY,
  readExerciseProgress,
} from "@/lib/exercise-progress";
import {
  INTERVIEW_ATTEMPTS_STORAGE_KEY,
  readInterviewAttempts,
} from "@/lib/interview/attempts";
import { calculatePlayerProgress, type PlayerProgress } from "@/lib/player-progress";
import { PROGRESS_CHANGED_EVENT } from "@/lib/progress-events";

const PROGRESS_STORAGE_KEYS = new Set([
  COURSE_PROGRESS_STORAGE_KEY,
  EXERCISE_PROGRESS_STORAGE_KEY,
  INTERVIEW_ATTEMPTS_STORAGE_KEY,
]);
const EMPTY_SNAPSHOT = "0:1:0:500";

function readSnapshot(): string {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;
  try {
    const progress = calculatePlayerProgress({
      courseProgress: readCourseProgress(window.localStorage),
      exerciseProgress: readExerciseProgress(window.localStorage),
      attempts: readInterviewAttempts(window.localStorage).attempts,
    });
    return [progress.xp, progress.level, progress.xpIntoLevel, progress.xpPerLevel].join(
      ":",
    );
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

function subscribe(onStoreChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || PROGRESS_STORAGE_KEYS.has(event.key)) onStoreChange();
  };
  window.addEventListener(PROGRESS_CHANGED_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(PROGRESS_CHANGED_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function usePlayerProgress(): PlayerProgress {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => EMPTY_SNAPSHOT);
  const [xp, level, xpIntoLevel, xpPerLevel] = snapshot.split(":").map(Number);
  return { xp, level, xpIntoLevel, xpPerLevel };
}
