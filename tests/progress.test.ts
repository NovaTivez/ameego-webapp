import { describe, expect, it } from "vitest";

import { starArrangementExercise } from "@/content/star-arrangement-exercise";
import { starMethodLesson } from "@/content/interview-foundations";
import type { CourseProgress } from "@/lib/course-progress";
import type { ExerciseProgress } from "@/lib/exercise-progress";
import {
  calculateProgress,
  compareAttempts,
  getRecommendedNextActivity,
} from "@/lib/progress";
import { makeProgressAttempt } from "./progressFixtures";

const emptyCourse: CourseProgress = { version: 1, completedLessonIds: [] };
const emptyExercises: ExerciseProgress = { version: 1, exercises: {} };
const completedCourse: CourseProgress = {
  version: 1,
  completedLessonIds: [starMethodLesson.id],
};
const completedExercises: ExerciseProgress = {
  version: 1,
  exercises: {
    [starArrangementExercise.id]: { attemptCount: 2, completed: true, correct: true },
  },
};

describe("progress calculations", () => {
  it("returns real zero counts for a learner with no activity", () => {
    const result = calculateProgress({
      courseProgress: emptyCourse,
      exerciseProgress: emptyExercises,
      attempts: [],
    });

    expect(result).toMatchObject({
      completedLessons: [],
      completedExercises: [],
      simulationsCompleted: 0,
      evaluatedSimulations: 0,
      currentStreak: 0,
      xp: 0,
      level: 1,
      skillProgress: [],
      recentActivity: [],
    });
    expect(result.recommendedNext.kind).toBe("lesson");
  });

  it("counts only known completed lessons, exercises, and stored simulations", () => {
    const attempts = [
      makeProgressAttempt({ id: "attempt-1", completedAt: "2026-07-15T01:00:00.000Z" }),
      makeProgressAttempt({
        id: "attempt-2",
        completedAt: "2026-07-16T01:00:00.000Z",
        evaluated: false,
      }),
    ];
    const result = calculateProgress({
      courseProgress: {
        version: 1,
        completedLessonIds: [starMethodLesson.id, "unknown.lesson"],
      },
      exerciseProgress: completedExercises,
      attempts,
      now: new Date("2026-07-16T12:00:00.000Z"),
    });

    expect(result.completedLessons.map((lesson) => lesson.id)).toEqual([
      starMethodLesson.id,
    ]);
    expect(result.completedExercises).toHaveLength(1);
    expect(result.completedExercises[0]).toMatchObject({
      attemptCount: 2,
      correct: true,
    });
    expect(result.simulationsCompleted).toBe(2);
    expect(result.evaluatedSimulations).toBe(1);
    expect(result.currentStreak).toBe(2);
    expect(result.xp).toBe(500);
    expect(result.level).toBe(2);
    expect(result.xpIntoLevel).toBe(0);
    expect(result.skillProgress).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ criterion: "situation", percent: 60 }),
      ]),
    );
    expect(result.recentActivity[0]).toMatchObject({
      kind: "simulation",
      detail: expect.stringMatching(/Frontend intern at Northstar Labs/i),
    });
  });

  it("recommends the next real activity from the learner's stored sequence", () => {
    expect(
      getRecommendedNextActivity({
        courseProgress: emptyCourse,
        exerciseProgress: emptyExercises,
        attempts: [],
      }).kind,
    ).toBe("lesson");
    expect(
      getRecommendedNextActivity({
        courseProgress: completedCourse,
        exerciseProgress: emptyExercises,
        attempts: [],
      }).kind,
    ).toBe("exercise");
    expect(
      getRecommendedNextActivity({
        courseProgress: completedCourse,
        exerciseProgress: completedExercises,
        attempts: [],
      }).kind,
    ).toBe("simulation");

    const evaluatedAttempt = makeProgressAttempt({
      id: "attempt-1",
      completedAt: "2026-07-16T01:00:00.000Z",
    });
    const recommendation = getRecommendedNextActivity({
      courseProgress: completedCourse,
      exerciseProgress: completedExercises,
      attempts: [evaluatedAttempt],
    });
    expect(recommendation).toMatchObject({ kind: "lesson", href: "/learn/star-method" });
    expect(recommendation.description).toBe(
      evaluatedAttempt.evaluation?.nextPracticeAction,
    );
  });
});

describe("attempt comparison calculations", () => {
  it("compares rubric-level changes for two attempts from the same skill", () => {
    const earlier = makeProgressAttempt({
      id: "attempt-1",
      completedAt: "2026-07-15T01:00:00.000Z",
      scores: [2, 3, 3, 2],
    });
    const later = makeProgressAttempt({
      id: "attempt-2",
      completedAt: "2026-07-16T01:00:00.000Z",
      scores: [3, 3, 4, 3],
      role: "Design intern",
      organization: "Studio Lab",
    });
    const result = compareAttempts(earlier, later);

    expect(result.compatible).toBe(true);
    if (!result.compatible) return;
    expect(result.basis).toBe("skill");
    expect(result.rubricChanges.find((item) => item.criterion === "action")?.delta).toBe(
      1,
    );
    expect(result.specificImprovements).toEqual(
      expect.arrayContaining([expect.stringMatching(/Action increased from 3 to 4/i)]),
    );
    expect(result.remainingPracticeAreas).toEqual(
      expect.arrayContaining([expect.stringMatching(/Result:/i)]),
    );
    expect(result.caution).toMatch(/not proof of broad or lasting improvement/i);
  });

  it("rejects comparison when one attempt has no validated feedback", () => {
    const evaluated = makeProgressAttempt({
      id: "attempt-1",
      completedAt: "2026-07-15T01:00:00.000Z",
    });
    const unevaluated = makeProgressAttempt({
      id: "attempt-2",
      completedAt: "2026-07-16T01:00:00.000Z",
      evaluated: false,
    });

    expect(compareAttempts(evaluated, unevaluated)).toEqual(
      expect.objectContaining({
        compatible: false,
        reason: expect.stringMatching(/validated rubric feedback/i),
      }),
    );
  });
});
