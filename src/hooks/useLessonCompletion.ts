"use client";

import { useCallback, useEffect, useState } from "react";

import {
  completeLesson,
  isLessonComplete,
  readCourseProgress,
} from "@/lib/course-progress";

type CompletionState =
  | { status: "loading"; completed: false }
  | { status: "ready"; completed: boolean }
  | { status: "error"; completed: false };

export function useLessonCompletion(lessonId?: string) {
  const [state, setState] = useState<CompletionState>({
    status: "loading",
    completed: false,
  });

  const load = useCallback(() => {
    if (!lessonId) {
      setState({ status: "ready", completed: false });
      return;
    }

    setState({ status: "loading", completed: false });

    try {
      const progress = readCourseProgress(window.localStorage);
      setState({
        status: "ready",
        completed: isLessonComplete(progress, lessonId),
      });
    } catch {
      setState({ status: "error", completed: false });
    }
  }, [lessonId]);

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

  const markComplete = useCallback(() => {
    if (!lessonId) {
      return;
    }

    try {
      completeLesson(window.localStorage, lessonId);
      setState({ status: "ready", completed: true });
    } catch {
      setState({ status: "error", completed: false });
    }
  }, [lessonId]);

  return {
    ...state,
    reload: load,
    markComplete,
  };
}
