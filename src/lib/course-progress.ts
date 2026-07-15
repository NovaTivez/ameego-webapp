export const COURSE_PROGRESS_STORAGE_KEY = "ameego:course-progress:v1";

export type CourseProgress = {
  version: 1;
  completedLessonIds: string[];
};

const EMPTY_PROGRESS: CourseProgress = {
  version: 1,
  completedLessonIds: [],
};

function isCourseProgress(value: unknown): value is CourseProgress {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CourseProgress>;

  return (
    candidate.version === 1 &&
    Array.isArray(candidate.completedLessonIds) &&
    candidate.completedLessonIds.every((id) => typeof id === "string")
  );
}

export function readCourseProgress(storage: Storage): CourseProgress {
  const rawProgress = storage.getItem(COURSE_PROGRESS_STORAGE_KEY);

  if (!rawProgress) {
    return { ...EMPTY_PROGRESS, completedLessonIds: [] };
  }

  let parsedProgress: unknown;
  try {
    parsedProgress = JSON.parse(rawProgress);
  } catch {
    throw new Error("Stored course progress has an unsupported format.");
  }

  if (!isCourseProgress(parsedProgress)) {
    throw new Error("Stored course progress has an unsupported format.");
  }

  return {
    version: 1,
    completedLessonIds: [...new Set(parsedProgress.completedLessonIds)],
  };
}

export function completeLesson(storage: Storage, lessonId: string): CourseProgress {
  const currentProgress = readCourseProgress(storage);
  const completedLessonIds = currentProgress.completedLessonIds.includes(lessonId)
    ? currentProgress.completedLessonIds
    : [...currentProgress.completedLessonIds, lessonId];
  const nextProgress: CourseProgress = {
    version: 1,
    completedLessonIds,
  };

  storage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(nextProgress));

  return nextProgress;
}

export function isLessonComplete(progress: CourseProgress, lessonId: string): boolean {
  return progress.completedLessonIds.includes(lessonId);
}
