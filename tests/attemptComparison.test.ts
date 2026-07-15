import { beforeEach, describe, expect, it } from "vitest";

import type { InterviewEvaluation } from "@/lib/evaluation/contracts";
import {
  createCompletedAttempt,
  INTERVIEW_ATTEMPTS_STORAGE_KEY,
  readInterviewAttempts,
  saveAttemptEvaluation,
  saveCompletedAttempt,
} from "@/lib/interview/attempts";
import {
  DEFAULT_INTERVIEW_SETUP,
  type CompletedInterviewAttempt,
  type ConfirmedInterviewContext,
  type QuestionSet,
} from "@/lib/interview/contracts";
import {
  areAttemptsComparable,
  compareAttempts,
  getAttemptScenarioKey,
} from "@/lib/progress/compare";
import { buildProgressSnapshot, recommendNextActivity } from "@/lib/progress/dashboard";
import { COURSE_PROGRESS_STORAGE_KEY } from "@/lib/course-progress";
import { EXERCISE_PROGRESS_STORAGE_KEY } from "@/lib/exercise-progress";
import { starArrangementExercise } from "@/content/star-arrangement-exercise";
import { STAR_LESSON_ID } from "@/lib/evaluation/rubric";

const context: ConfirmedInterviewContext = {
  setup: {
    ...DEFAULT_INTERVIEW_SETUP,
    role: "Volunteer coordinator",
    organization: "Community Hub",
  },
  resumeProfile: null,
};

const otherContext: ConfirmedInterviewContext = {
  setup: {
    ...DEFAULT_INTERVIEW_SETUP,
    interviewType: "internship",
    role: "Frontend intern",
    organization: "Northstar Labs",
  },
  resumeProfile: null,
};

const questionSet: QuestionSet = {
  source: "general_fallback",
  questions: [
    {
      id: "q1",
      category: "introductory",
      text: "Please introduce yourself for this opportunity.",
    },
    {
      id: "q2",
      category: "behavioral",
      text: "Describe a challenge you handled with others.",
    },
    {
      id: "q3",
      category: "role_specific",
      text: "How would you prioritize volunteer responsibilities?",
    },
  ],
};

const transcripts = [
  "Our onboarding backlog put weekend coverage at risk.",
  "I owned shortening the schedule without dropping safety training.",
  "I rebuilt the checklist, paired with leads, and tracked blockers daily.",
  "Coverage recovered within one week and drop-off fell.",
];

function evaluationWithScores(
  scores: [number, number, number, number],
): InterviewEvaluation {
  const criteria = ["situation", "task", "action", "result"] as const;
  return {
    summary: "Practice feedback grounded in the confirmed transcript only.",
    strengths: ["The answer names personal ownership clearly."],
    improvements: ["Make the measurable result more specific."],
    rubricScores: criteria.map((criterion, index) => ({
      criterion,
      score: scores[index],
      explanation: `Explanation for ${criterion} with enough detail here.`,
      evidence: transcripts[index],
      improvementAction: `Improve the ${criterion} detail with one concrete fact.`,
    })),
    recommendedLessonId: STAR_LESSON_ID,
    nextPracticeAction: "Retry the answer and strengthen the weakest STAR part.",
    improvedExample:
      "Our onboarding backlog put weekend coverage at risk. I owned shortening the schedule without dropping safety training. I rebuilt the checklist, paired with leads, and tracked blockers daily. Coverage recovered within one week and drop-off fell.",
  };
}

function makeAttempt(input: {
  id: string;
  completedAt: string;
  context?: ConfirmedInterviewContext;
  evaluation?: InterviewEvaluation;
  evaluatedAt?: string;
}): CompletedInterviewAttempt {
  return createCompletedAttempt({
    id: input.id,
    completedAt: input.completedAt,
    context: input.context ?? context,
    questionSet,
    responses: questionSet.questions.map((question, index) => ({
      questionId: question.id,
      transcript:
        index === questionSet.questions.length - 1
          ? `${transcripts[index]} ${transcripts[3]} Response body for ${question.id}.`
          : `${transcripts[index]} Response body for ${question.id}.`,
      inputMode: "text" as const,
    })),
    evaluation: input.evaluation,
    evaluatedAt: input.evaluatedAt,
  });
}

describe("attempt comparison", () => {
  it("reports incompatible attempts when evaluations or scenarios differ", () => {
    const unevaluated = makeAttempt({
      id: "a1",
      completedAt: "2026-07-15T10:00:00.000Z",
    });
    const evaluated = makeAttempt({
      id: "a2",
      completedAt: "2026-07-15T11:00:00.000Z",
      evaluation: evaluationWithScores([3, 3, 3, 3]),
      evaluatedAt: "2026-07-15T11:05:00.000Z",
    });
    const otherScenario = makeAttempt({
      id: "a3",
      completedAt: "2026-07-15T12:00:00.000Z",
      context: otherContext,
      evaluation: evaluationWithScores([4, 4, 4, 4]),
      evaluatedAt: "2026-07-15T12:05:00.000Z",
    });

    expect(areAttemptsComparable(unevaluated, evaluated)).toEqual({
      comparable: false,
      reason: expect.stringMatching(/saved STAR evaluation/i),
    });
    expect(areAttemptsComparable(evaluated, otherScenario)).toEqual({
      comparable: false,
      reason: expect.stringMatching(/different interview scenarios/i),
    });
    expect(getAttemptScenarioKey(evaluated)).not.toEqual(
      getAttemptScenarioKey(otherScenario),
    );

    const comparison = compareAttempts(evaluated, otherScenario);
    expect(comparison.comparable).toBe(false);
  });

  it("compares two compatible attempts without claiming broad improvement from one score", () => {
    const earlier = makeAttempt({
      id: "early",
      completedAt: "2026-07-15T09:00:00.000Z",
      evaluation: evaluationWithScores([2, 3, 3, 2]),
      evaluatedAt: "2026-07-15T09:05:00.000Z",
    });
    const later = makeAttempt({
      id: "late",
      completedAt: "2026-07-15T10:00:00.000Z",
      evaluation: evaluationWithScores([4, 3, 3, 2]),
      evaluatedAt: "2026-07-15T10:05:00.000Z",
    });

    const comparison = compareAttempts(later, earlier);
    expect(comparison.comparable).toBe(true);
    if (!comparison.comparable) return;

    expect(comparison.claimsBroadImprovement).toBe(false);
    expect(comparison.earlier.id).toBe("early");
    expect(comparison.later.id).toBe("late");
    expect(comparison.specificImprovements).toEqual([
      expect.objectContaining({
        criterion: "situation",
        earlierScore: 2,
        laterScore: 4,
        status: "improved",
      }),
    ]);
    expect(comparison.narrative).toMatch(/not enough to claim overall progress/i);
    expect(comparison.remainingPracticeAreas.map((item) => item.criterion)).toEqual(
      expect.arrayContaining(["task", "action", "result"]),
    );
  });
});

describe("progress calculations and recommended-next logic", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows an empty snapshot with the lesson recommendation when nothing is stored", () => {
    const snapshot = buildProgressSnapshot(window.localStorage);

    expect(snapshot.isEmpty).toBe(true);
    expect(snapshot.completedLessons).toEqual([]);
    expect(snapshot.completedExercises).toEqual([]);
    expect(snapshot.simulationsCompleted).toBe(0);
    expect(snapshot.evaluatedAttempts).toBe(0);
    expect(snapshot.recommendedNext.id).toBe("star-lesson");
  });

  it("counts one saved attempt and recommends evaluation when no feedback is stored", () => {
    saveCompletedAttempt(
      window.localStorage,
      makeAttempt({ id: "only", completedAt: "2026-07-15T10:00:00.000Z" }),
    );
    window.localStorage.setItem(
      COURSE_PROGRESS_STORAGE_KEY,
      JSON.stringify({ version: 1, completedLessonIds: [STAR_LESSON_ID] }),
    );
    window.localStorage.setItem(
      EXERCISE_PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        exercises: {
          [starArrangementExercise.id]: {
            attemptCount: 1,
            completed: true,
            correct: true,
          },
        },
      }),
    );

    const snapshot = buildProgressSnapshot(window.localStorage);
    expect(snapshot.isEmpty).toBe(false);
    expect(snapshot.simulationsCompleted).toBe(1);
    expect(snapshot.evaluatedAttempts).toBe(0);
    expect(snapshot.completedLessons).toHaveLength(1);
    expect(snapshot.completedExercises).toHaveLength(1);
    expect(snapshot.recommendedNext.id).toBe("request-evaluation");
  });

  it("persists evaluation onto a completed attempt and surfaces evaluated counts", () => {
    const attempt = makeAttempt({
      id: "eval-me",
      completedAt: "2026-07-15T10:00:00.000Z",
    });
    saveCompletedAttempt(window.localStorage, attempt);

    const grounded = evaluationWithScores([4, 4, 4, 2]);
    const saved = saveAttemptEvaluation(
      window.localStorage,
      attempt.id,
      grounded,
      "2026-07-15T10:10:00.000Z",
    );

    expect(saved.evaluation).toEqual(grounded);
    expect(readInterviewAttempts(window.localStorage).attempts[0].evaluation).toEqual(
      grounded,
    );
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toContain(
      "eval-me",
    );

    window.localStorage.setItem(
      COURSE_PROGRESS_STORAGE_KEY,
      JSON.stringify({ version: 1, completedLessonIds: [STAR_LESSON_ID] }),
    );
    window.localStorage.setItem(
      EXERCISE_PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        exercises: {
          [starArrangementExercise.id]: {
            attemptCount: 2,
            completed: true,
            correct: false,
          },
        },
      }),
    );

    const snapshot = buildProgressSnapshot(window.localStorage);
    expect(snapshot.simulationsCompleted).toBe(1);
    expect(snapshot.evaluatedAttempts).toBe(1);
    expect(snapshot.recommendedNext.id).toBe("retry-weak-area");
  });

  it("follows the deterministic recommended-next chain", () => {
    expect(
      recommendNextActivity({
        lessonComplete: false,
        exerciseComplete: false,
        simulationsCompleted: 0,
        evaluatedAttempts: 0,
        latestEvaluatedAttempt: null,
      }).id,
    ).toBe("star-lesson");

    expect(
      recommendNextActivity({
        lessonComplete: true,
        exerciseComplete: false,
        simulationsCompleted: 0,
        evaluatedAttempts: 0,
        latestEvaluatedAttempt: null,
      }).id,
    ).toBe("star-exercise");

    expect(
      recommendNextActivity({
        lessonComplete: true,
        exerciseComplete: true,
        simulationsCompleted: 0,
        evaluatedAttempts: 0,
        latestEvaluatedAttempt: null,
      }).id,
    ).toBe("first-simulation");

    expect(
      recommendNextActivity({
        lessonComplete: true,
        exerciseComplete: true,
        simulationsCompleted: 2,
        evaluatedAttempts: 0,
        latestEvaluatedAttempt: null,
      }).id,
    ).toBe("request-evaluation");

    expect(
      recommendNextActivity({
        lessonComplete: true,
        exerciseComplete: true,
        simulationsCompleted: 2,
        evaluatedAttempts: 2,
        latestEvaluatedAttempt: makeAttempt({
          id: "strong",
          completedAt: "2026-07-15T12:00:00.000Z",
          evaluation: evaluationWithScores([5, 5, 4, 4]),
          evaluatedAt: "2026-07-15T12:05:00.000Z",
        }),
      }).id,
    ).toBe("another-simulation");
  });
});
