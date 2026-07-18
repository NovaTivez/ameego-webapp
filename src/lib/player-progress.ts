import { starArrangementExercise } from "@/content/star-arrangement-exercise";
import {
  COURSE_COMPLETION_BONUS_XP,
  interviewAcademyLessons,
} from "@/content/interview-foundations";
import type { CourseProgress } from "@/lib/course-progress";
import type { ExerciseProgress } from "@/lib/exercise-progress";
import type { CompletedInterviewAttempt } from "@/lib/interview/contracts";

export const PROGRESS_XP = {
  exercise: 75,
  simulation: 150,
  validatedFeedback: 25,
  perLevel: 500,
} as const;

export type PlayerProgress = {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpPerLevel: number;
};

export function calculatePlayerProgress(input: {
  courseProgress: CourseProgress;
  exerciseProgress: ExerciseProgress;
  attempts: CompletedInterviewAttempt[];
}): PlayerProgress {
  const completedIds = new Set(input.courseProgress.completedLessonIds);
  const completedLessons = interviewAcademyLessons.filter((lesson) =>
    completedIds.has(lesson.id),
  );
  const courseComplete = completedLessons.length === interviewAcademyLessons.length;
  const lessonXp = completedLessons.reduce((sum, lesson) => sum + lesson.xpReward, 0);
  const exerciseComplete = Boolean(
    input.exerciseProgress.exercises[starArrangementExercise.id]?.completed,
  );
  const evaluatedAttempts = input.attempts.filter((attempt) => attempt.evaluation).length;
  const xp =
    lessonXp +
    (courseComplete ? COURSE_COMPLETION_BONUS_XP : 0) +
    (exerciseComplete ? PROGRESS_XP.exercise : 0) +
    input.attempts.length * PROGRESS_XP.simulation +
    evaluatedAttempts * PROGRESS_XP.validatedFeedback;

  return {
    xp,
    level: Math.floor(xp / PROGRESS_XP.perLevel) + 1,
    xpIntoLevel: xp % PROGRESS_XP.perLevel,
    xpPerLevel: PROGRESS_XP.perLevel,
  };
}
