import { starArrangementExercise } from "@/content/star-arrangement-exercise";
import {
  interviewFoundationsCourse,
  starMethodLesson,
} from "@/content/interview-foundations";
import { readCourseProgress } from "@/lib/course-progress";
import { STAR_LESSON_ID } from "@/lib/evaluation/rubric";
import { getExerciseProgressEntry, readExerciseProgress } from "@/lib/exercise-progress";
import { readInterviewAttempts } from "@/lib/interview/attempts";
import type { CompletedInterviewAttempt } from "@/lib/interview/contracts";
import { hasSavedEvaluation } from "@/lib/progress/compare";

export type ProgressActivity = {
  id: string;
  title: string;
  href: string;
  status: "completed" | "available";
  detail?: string;
};

export type RecommendedNextActivity = {
  id: string;
  title: string;
  reason: string;
  href: string;
};

export type ProgressSnapshot = {
  completedLessons: ProgressActivity[];
  completedExercises: ProgressActivity[];
  simulationsCompleted: number;
  evaluatedAttempts: number;
  attempts: CompletedInterviewAttempt[];
  recommendedNext: RecommendedNextActivity;
  isEmpty: boolean;
};

export function buildProgressSnapshot(storage: Storage): ProgressSnapshot {
  const courseProgress = readCourseProgress(storage);
  const exerciseProgress = readExerciseProgress(storage);
  const attemptStore = readInterviewAttempts(storage);
  const attempts = [...attemptStore.attempts].sort(
    (left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt),
  );

  const completedLessons = interviewFoundationsCourse.lessons
    .filter((lesson) => courseProgress.completedLessonIds.includes(lesson.id))
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      href: `/learn/${lesson.slug}`,
      status: "completed" as const,
    }));

  const exerciseEntry = getExerciseProgressEntry(
    exerciseProgress,
    starArrangementExercise.id,
  );
  const completedExercises = exerciseEntry.completed
    ? [
        {
          id: starArrangementExercise.id,
          title: starArrangementExercise.title,
          href: starMethodLesson.exerciseHref,
          status: "completed" as const,
          detail: exerciseEntry.correct
            ? "Completed with a correct arrangement"
            : "Completed after a submitted attempt",
        },
      ]
    : [];

  const simulationsCompleted = attempts.length;
  const evaluatedAttempts = attempts.filter(hasSavedEvaluation).length;
  const isEmpty =
    completedLessons.length === 0 &&
    completedExercises.length === 0 &&
    simulationsCompleted === 0;

  return {
    completedLessons,
    completedExercises,
    simulationsCompleted,
    evaluatedAttempts,
    attempts,
    recommendedNext: recommendNextActivity({
      lessonComplete: courseProgress.completedLessonIds.includes(STAR_LESSON_ID),
      exerciseComplete: exerciseEntry.completed,
      simulationsCompleted,
      evaluatedAttempts,
      latestEvaluatedAttempt: attempts.find(hasSavedEvaluation) ?? null,
    }),
    isEmpty,
  };
}

export function recommendNextActivity(input: {
  lessonComplete: boolean;
  exerciseComplete: boolean;
  simulationsCompleted: number;
  evaluatedAttempts: number;
  latestEvaluatedAttempt: CompletedInterviewAttempt | null;
}): RecommendedNextActivity {
  if (!input.lessonComplete) {
    return {
      id: "star-lesson",
      title: "Study the STAR Method lesson",
      reason:
        "No lesson completion is saved yet. Start with the featured Interview Foundations lesson.",
      href: "/learn/star-method",
    };
  }

  if (!input.exerciseComplete) {
    return {
      id: "star-exercise",
      title: "Complete the STAR arrangement exercise",
      reason:
        "The STAR lesson is complete. Practice the Situation → Task → Action → Result order next.",
      href: "/learn/star-method/exercise",
    };
  }

  if (input.simulationsCompleted === 0) {
    return {
      id: "first-simulation",
      title: "Run your first interview simulation",
      reason:
        "Lesson and exercise progress are saved. Generate questions and confirm responses in the Interview Center.",
      href: "/practice",
    };
  }

  if (input.evaluatedAttempts === 0) {
    return {
      id: "request-evaluation",
      title: "Request STAR feedback on a saved interview",
      reason: `${input.simulationsCompleted} simulation${input.simulationsCompleted === 1 ? " is" : "s are"} saved without evaluation. Open Interview Center, complete another attempt if needed, then generate feedback.`,
      href: "/practice",
    };
  }

  const latest = input.latestEvaluatedAttempt?.evaluation;
  const weakest = latest?.rubricScores
    .slice()
    .sort((left, right) => left.score - right.score)[0];

  if (weakest && weakest.score <= 3) {
    return {
      id: "retry-weak-area",
      title: `Retry with focus on ${weakest.criterion}`,
      reason:
        latest?.nextPracticeAction ??
        `Your latest evaluated attempt still needs work on ${weakest.criterion}. Retry that scenario and compare the new evaluation.`,
      href: "/practice",
    };
  }

  return {
    id: "another-simulation",
    title: "Practice another interview scenario",
    reason:
      "Lessons, exercises, and evaluated simulations are recorded. Keep practicing and compare compatible attempts in the Progress Library.",
    href: "/practice",
  };
}
