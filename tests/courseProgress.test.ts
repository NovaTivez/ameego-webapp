import { beforeEach, describe, expect, it } from "vitest";

import {
  completeLesson,
  COURSE_PROGRESS_STORAGE_KEY,
  isLessonComplete,
  readCourseProgress,
} from "@/lib/course-progress";

describe("course progress storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty and persists completed lesson ids", () => {
    expect(readCourseProgress(window.localStorage).completedLessonIds).toEqual([]);

    const progress = completeLesson(window.localStorage, "lesson.star");

    expect(isLessonComplete(progress, "lesson.star")).toBe(true);
    expect(window.localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY)).toContain(
      "lesson.star",
    );
  });

  it("rejects unsupported saved progress instead of inventing completion", () => {
    window.localStorage.setItem(
      COURSE_PROGRESS_STORAGE_KEY,
      JSON.stringify({ version: 99, completedLessonIds: ["lesson.star"] }),
    );

    expect(() => readCourseProgress(window.localStorage)).toThrow(/unsupported format/i);
  });
});
