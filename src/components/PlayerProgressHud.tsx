"use client";

import { useCallback, useEffect, useState } from "react";

import { PixelHudStat } from "@/components/PixelHudStat";
import { readCourseProgress } from "@/lib/course-progress";
import { readExerciseProgress } from "@/lib/exercise-progress";
import { readInterviewAttempts } from "@/lib/interview/attempts";
import { calculateProgress } from "@/lib/progress";
import { PROGRESS_UPDATED_EVENT } from "@/lib/progress-events";

type PlayerProgressState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "ready"; xp: number; level: number };

type PlayerProgressHudProps = {
  className?: string;
};

export function PlayerProgressHud({ className }: PlayerProgressHudProps) {
  const [state, setState] = useState<PlayerProgressState>({ status: "loading" });

  const load = useCallback(() => {
    try {
      const snapshot = calculateProgress({
        courseProgress: readCourseProgress(window.localStorage),
        exerciseProgress: readExerciseProgress(window.localStorage),
        attempts: readInterviewAttempts(window.localStorage).attempts,
      });
      setState({ status: "ready", xp: snapshot.xp, level: snapshot.level });
    } catch {
      setState({ status: "unavailable" });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(load);
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage) load();
    };
    window.addEventListener(PROGRESS_UPDATED_EVENT, load);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, load);
      window.removeEventListener("storage", onStorage);
    };
  }, [load]);

  const isReady = state.status === "ready";
  const statusLabel = isReady
    ? `Academy player status: ${state.xp} experience points, level ${state.level}`
    : state.status === "loading"
      ? "Academy player progress loading"
      : "Academy player progress unavailable";

  return (
    <div className={className} aria-label={statusLabel} aria-live="polite">
      <PixelHudStat label="XP" value={isReady ? String(state.xp) : "—"} icon="star" />
      <PixelHudStat label="LV" value={isReady ? String(state.level) : "—"} />
    </div>
  );
}
