import { starArrangementExercise } from "@/content/star-arrangement-exercise";
import {
  interviewFoundationsCourse,
  starMethodLesson,
} from "@/content/interview-foundations";
import type { CourseProgress } from "@/lib/course-progress";
import type { EvaluationCriterionId } from "@/lib/evaluation/contracts";
import { getLessonRecommendation, STAR_RUBRIC } from "@/lib/evaluation/rubric";
import type { ExerciseProgress } from "@/lib/exercise-progress";
import type { CompletedInterviewAttempt } from "@/lib/interview/contracts";

export type RecommendedActivity = {
  kind: "lesson" | "exercise" | "simulation" | "history";
  title: string;
  description: string;
  href: string;
};

export type ProgressSnapshot = {
  completedLessons: Array<{ id: string; title: string; href: string }>;
  completedExercises: Array<{
    id: string;
    title: string;
    href: string;
    attemptCount: number;
    correct: boolean;
  }>;
  simulationsCompleted: number;
  evaluatedSimulations: number;
  currentStreak: number;
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpPerLevel: number;
  skillProgress: Array<{
    criterion: EvaluationCriterionId;
    label: string;
    averageScore: number;
    percent: number;
    evaluatedAttempts: number;
  }>;
  recentActivity: Array<{
    id: string;
    kind: "lesson" | "exercise" | "simulation";
    title: string;
    detail: string;
    occurredAt?: string;
  }>;
  recommendedNext: RecommendedActivity;
};

export const PROGRESS_XP = {
  lesson: 100,
  exercise: 75,
  simulation: 150,
  validatedFeedback: 25,
  perLevel: 500,
} as const;

export type RubricChange = {
  criterion: EvaluationCriterionId;
  label: string;
  earlierScore: number;
  laterScore: number;
  delta: number;
};

export type AttemptComparison =
  | {
      compatible: false;
      reason: string;
    }
  | {
      compatible: true;
      basis: "skill" | "scenario";
      earlier: CompletedInterviewAttempt;
      later: CompletedInterviewAttempt;
      rubricChanges: RubricChange[];
      specificImprovements: string[];
      remainingPracticeAreas: string[];
      caution: string;
    };

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function utcDay(value: Date): number {
  return Math.floor(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()) /
      86_400_000,
  );
}

export function calculateCurrentStreak(
  attempts: CompletedInterviewAttempt[],
  now = new Date(),
): number {
  const today = utcDay(now);
  const activityDays = new Set(
    attempts
      .map((attempt) => utcDay(new Date(attempt.completedAt)))
      .filter((day) => day <= today),
  );
  if (activityDays.size === 0) return 0;

  const latest = Math.max(...activityDays);
  if (latest < today - 1) return 0;

  let streak = 0;
  for (let day = latest; activityDays.has(day); day -= 1) streak += 1;
  return streak;
}

function calculateSkillProgress(attempts: CompletedInterviewAttempt[]) {
  const evaluated = attempts.flatMap((attempt) =>
    attempt.evaluation ? [attempt.evaluation] : [],
  );
  if (evaluated.length === 0) return [];

  return (Object.keys(STAR_RUBRIC) as EvaluationCriterionId[]).map((criterion) => {
    const scores = evaluated.flatMap((evaluation) => {
      const item = evaluation.rubricScores.find(
        (rubricItem) => rubricItem.criterion === criterion,
      );
      return item ? [item.score] : [];
    });
    const averageScore =
      scores.reduce((total, score) => total + score, 0) / scores.length;
    return {
      criterion,
      label: STAR_RUBRIC[criterion].label,
      averageScore: Math.round(averageScore * 10) / 10,
      percent: Math.round((averageScore / 5) * 100),
      evaluatedAttempts: scores.length,
    };
  });
}

export function scenarioKey(attempt: CompletedInterviewAttempt): string {
  const setup = attempt.context.setup;
  return [setup.interviewType, setup.customInterviewType, setup.role, setup.organization]
    .map(normalize)
    .join("|");
}

export function getRecommendedNextActivity(input: {
  courseProgress: CourseProgress;
  exerciseProgress: ExerciseProgress;
  attempts: CompletedInterviewAttempt[];
}): RecommendedActivity {
  if (!input.courseProgress.completedLessonIds.includes(starMethodLesson.id)) {
    return {
      kind: "lesson",
      title: "Complete the STAR Method lesson",
      description: starMethodLesson.objective,
      href: "/learn/star-method",
    };
  }

  const exercise = input.exerciseProgress.exercises[starArrangementExercise.id];
  if (!exercise?.completed) {
    return {
      kind: "exercise",
      title: "Complete the STAR arrangement exercise",
      description: "Practice putting Situation, Task, Action, and Result in order.",
      href: starMethodLesson.exerciseHref,
    };
  }

  if (input.attempts.length === 0) {
    return {
      kind: "simulation",
      title: "Complete your first interview simulation",
      description: "Apply the STAR structure in a confirmed practice response.",
      href: "/practice",
    };
  }

  const latest = [...input.attempts].sort(
    (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt),
  )[0];
  if (latest.evaluation) {
    const lesson = getLessonRecommendation(latest.evaluation.recommendedLessonId);
    if (lesson) {
      return {
        kind: "lesson",
        title: `Review: ${lesson.title}`,
        description: latest.evaluation.nextPracticeAction,
        href: lesson.href,
      };
    }
  }

  return {
    kind: "history",
    title: "Review your latest saved attempt",
    description:
      "Open the confirmed questions and transcripts before choosing your next practice step.",
    href: "/progress#attempt-history",
  };
}

export function calculateProgress(input: {
  courseProgress: CourseProgress;
  exerciseProgress: ExerciseProgress;
  attempts: CompletedInterviewAttempt[];
  now?: Date;
}): ProgressSnapshot {
  const lessonById = new Map(
    interviewFoundationsCourse.lessons.map((lesson) => [lesson.id, lesson]),
  );
  const completedLessons = input.courseProgress.completedLessonIds.flatMap((id) => {
    const lesson = lessonById.get(id);
    return lesson ? [{ id, title: lesson.title, href: `/learn/${lesson.slug}` }] : [];
  });
  const exercise = input.exerciseProgress.exercises[starArrangementExercise.id];
  const completedExercises = exercise?.completed
    ? [
        {
          id: starArrangementExercise.id,
          title: starArrangementExercise.title,
          href: starMethodLesson.exerciseHref,
          attemptCount: exercise.attemptCount,
          correct: exercise.correct,
        },
      ]
    : [];
  const evaluatedSimulations = input.attempts.filter(
    (attempt) => attempt.evaluation,
  ).length;
  const xp =
    completedLessons.length * PROGRESS_XP.lesson +
    completedExercises.length * PROGRESS_XP.exercise +
    input.attempts.length * PROGRESS_XP.simulation +
    evaluatedSimulations * PROGRESS_XP.validatedFeedback;
  const sortedAttempts = [...input.attempts].sort(
    (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt),
  );
  const recentActivity: ProgressSnapshot["recentActivity"] = sortedAttempts.map(
    (attempt) => ({
      id: `simulation-${attempt.id}`,
      kind: "simulation",
      title: "Interview completed",
      detail: `${attempt.context.setup.role} at ${attempt.context.setup.organization}${attempt.evaluation ? " · Validated feedback saved" : " · Transcript saved"}`,
      occurredAt: attempt.completedAt,
    }),
  );
  recentActivity.push(
    ...completedLessons.map((lesson) => ({
      id: `lesson-${lesson.id}`,
      kind: "lesson" as const,
      title: "Lesson completed",
      detail: `${lesson.title} · Completion date unavailable in the current record`,
    })),
    ...completedExercises.map((completedExercise) => ({
      id: `exercise-${completedExercise.id}`,
      kind: "exercise" as const,
      title: "Exercise completed",
      detail: `${completedExercise.title} · ${completedExercise.attemptCount} stored ${completedExercise.attemptCount === 1 ? "attempt" : "attempts"}`,
    })),
  );

  return {
    completedLessons,
    completedExercises,
    simulationsCompleted: input.attempts.length,
    evaluatedSimulations,
    currentStreak: calculateCurrentStreak(input.attempts, input.now),
    xp,
    level: Math.floor(xp / PROGRESS_XP.perLevel) + 1,
    xpIntoLevel: xp % PROGRESS_XP.perLevel,
    xpPerLevel: PROGRESS_XP.perLevel,
    skillProgress: calculateSkillProgress(input.attempts),
    recentActivity: recentActivity.slice(0, 6),
    recommendedNext: getRecommendedNextActivity(input),
  };
}

export function compareAttempts(
  first: CompletedInterviewAttempt,
  second: CompletedInterviewAttempt,
): AttemptComparison {
  if (first.id === second.id) {
    return { compatible: false, reason: "Choose two different attempts to compare." };
  }
  if (!first.evaluation || !second.evaluation) {
    return {
      compatible: false,
      reason: "Both attempts need validated rubric feedback before they can be compared.",
    };
  }

  const sameSkill =
    first.evaluation.recommendedLessonId === second.evaluation.recommendedLessonId;
  const sameScenario = scenarioKey(first) === scenarioKey(second);
  if (!sameSkill && !sameScenario) {
    return {
      compatible: false,
      reason:
        "These attempts use different skills and scenarios. Choose attempts from the same skill or scenario.",
    };
  }

  const [earlier, later] =
    Date.parse(first.completedAt) <= Date.parse(second.completedAt)
      ? [first, second]
      : [second, first];
  const earlierEvaluation = earlier.evaluation;
  const laterEvaluation = later.evaluation;
  if (!earlierEvaluation || !laterEvaluation) {
    return {
      compatible: false,
      reason: "Both attempts need validated rubric feedback before comparison.",
    };
  }
  const earlierScores = new Map(
    earlierEvaluation.rubricScores.map((item) => [item.criterion, item]),
  );
  const rubricChanges = laterEvaluation.rubricScores.map((item) => {
    const earlierItem = earlierScores.get(item.criterion)!;
    return {
      criterion: item.criterion,
      label: STAR_RUBRIC[item.criterion].label,
      earlierScore: earlierItem.score,
      laterScore: item.score,
      delta: item.score - earlierItem.score,
    };
  });

  const specificImprovements = rubricChanges
    .filter((change) => change.delta > 0)
    .map((change) => {
      const explanation = laterEvaluation.rubricScores.find(
        (item) => item.criterion === change.criterion,
      )!.explanation;
      return `${change.label} increased from ${change.earlierScore} to ${change.laterScore} in this pair. ${explanation}`;
    });
  if (specificImprovements.length === 0) {
    specificImprovements.push(
      "No rubric criterion increased in this pair. This comparison does not indicate broader regression or ability.",
    );
  }

  const belowTarget = laterEvaluation.rubricScores.filter((item) => item.score < 4);
  const remainingItems = belowTarget.length
    ? belowTarget
    : [...laterEvaluation.rubricScores].sort((a, b) => a.score - b.score).slice(0, 1);
  const remainingPracticeAreas = remainingItems.map(
    (item) => `${STAR_RUBRIC[item.criterion].label}: ${item.improvementAction}`,
  );

  return {
    compatible: true,
    basis: sameSkill ? "skill" : "scenario",
    earlier,
    later,
    rubricChanges,
    specificImprovements,
    remainingPracticeAreas,
    caution:
      "This compares two stored practice attempts only. A score change is evidence from this pair, not proof of broad or lasting improvement.",
  };
}
