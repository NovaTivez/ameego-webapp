import { describe, expect, it } from "vitest";

import { starArrangementExercise } from "@/content/star-arrangement-exercise";
import {
  COURSE_COMPLETION_BONUS_XP,
  interviewAcademyLessons,
} from "@/content/interview-foundations";
import type { CourseProgress } from "@/lib/course-progress";
import type { ExerciseProgress } from "@/lib/exercise-progress";
import { calculatePlayerProgress, PROGRESS_XP } from "@/lib/player-progress";

import { makeProgressAttempt } from "./progressFixtures";

const emptyCourse: CourseProgress = { version: 1, completedLessonIds: [] };
const emptyExercises: ExerciseProgress = { version: 1, exercises: {} };

describe("player progress", () => {
  it("starts new learners at zero XP and level one", () => {
    expect(
      calculatePlayerProgress({
        courseProgress: emptyCourse,
        exerciseProgress: emptyExercises,
        attempts: [],
      }),
    ).toEqual({ xp: 0, level: 1, xpIntoLevel: 0, xpPerLevel: 500 });
  });

  it("combines real lesson rewards, course bonus, exercise, and interviews", () => {
    const lessonXp = interviewAcademyLessons.reduce(
      (total, lesson) => total + lesson.xpReward,
      0,
    );
    const attempts = [
      makeProgressAttempt({
        id: "evaluated",
        completedAt: "2026-07-18T01:00:00.000Z",
      }),
      makeProgressAttempt({
        id: "not-evaluated",
        completedAt: "2026-07-18T02:00:00.000Z",
        evaluated: false,
      }),
    ];
    const result = calculatePlayerProgress({
      courseProgress: {
        version: 1,
        completedLessonIds: interviewAcademyLessons.map((lesson) => lesson.id),
      },
      exerciseProgress: {
        version: 1,
        exercises: {
          [starArrangementExercise.id]: {
            attemptCount: 1,
            completed: true,
            correct: true,
          },
        },
      },
      attempts,
    });
    const expectedXp =
      lessonXp +
      COURSE_COMPLETION_BONUS_XP +
      PROGRESS_XP.exercise +
      2 * PROGRESS_XP.simulation +
      PROGRESS_XP.validatedFeedback;

    expect(result).toEqual({
      xp: expectedXp,
      level: Math.floor(expectedXp / PROGRESS_XP.perLevel) + 1,
      xpIntoLevel: expectedXp % PROGRESS_XP.perLevel,
      xpPerLevel: PROGRESS_XP.perLevel,
    });
  });

  it("ignores unknown lesson IDs so XP cannot be invented by stale data", () => {
    expect(
      calculatePlayerProgress({
        courseProgress: { version: 1, completedLessonIds: ["unknown.lesson"] },
        exerciseProgress: emptyExercises,
        attempts: [],
      }).xp,
    ).toBe(0);
  });
});
