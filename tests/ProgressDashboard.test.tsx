import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { ProgressDashboard } from "@/components/ProgressDashboard";
import { starArrangementExercise } from "@/content/star-arrangement-exercise";
import { COURSE_PROGRESS_STORAGE_KEY } from "@/lib/course-progress";
import type { InterviewEvaluation } from "@/lib/evaluation/contracts";
import { STAR_LESSON_ID } from "@/lib/evaluation/rubric";
import { EXERCISE_PROGRESS_STORAGE_KEY } from "@/lib/exercise-progress";
import { createCompletedAttempt, saveCompletedAttempt } from "@/lib/interview/attempts";
import {
  DEFAULT_INTERVIEW_SETUP,
  type ConfirmedInterviewContext,
  type QuestionSet,
} from "@/lib/interview/contracts";

const context: ConfirmedInterviewContext = {
  setup: {
    ...DEFAULT_INTERVIEW_SETUP,
    role: "Volunteer coordinator",
    organization: "Community Hub",
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

const evidence = [
  "Weekend coverage was at risk.",
  "I owned the onboarding redesign.",
  "I rebuilt the checklist with volunteer leads.",
  "Coverage recovered within one week.",
];

function evaluation(scores: [number, number, number, number]): InterviewEvaluation {
  const criteria = ["situation", "task", "action", "result"] as const;
  return {
    summary: "Practice feedback grounded in the confirmed transcript only.",
    strengths: ["Ownership is clear in the response."],
    improvements: ["Add a more measurable result."],
    rubricScores: criteria.map((criterion, index) => ({
      criterion,
      score: scores[index],
      explanation: `Detailed explanation for the ${criterion} criterion.`,
      evidence: evidence[index],
      improvementAction: `Strengthen ${criterion} with one concrete detail.`,
    })),
    recommendedLessonId: STAR_LESSON_ID,
    nextPracticeAction: "Retry and strengthen the weakest STAR part.",
    improvedExample:
      "Weekend coverage was at risk. I owned the onboarding redesign. I rebuilt the checklist with volunteer leads. Coverage recovered within one week.",
  };
}

function seedCourseAndExercise() {
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
}

function seedAttempt(input: {
  id: string;
  completedAt: string;
  evaluation?: InterviewEvaluation;
  evaluatedAt?: string;
  role?: string;
}) {
  const attempt = createCompletedAttempt({
    id: input.id,
    completedAt: input.completedAt,
    context: {
      ...context,
      setup: {
        ...context.setup,
        role: input.role ?? context.setup.role,
      },
    },
    questionSet,
    responses: questionSet.questions.map((question, index) => ({
      questionId: question.id,
      transcript:
        index === questionSet.questions.length - 1
          ? `${evidence[index]} ${evidence[3]} Confirmed answer for ${question.id}.`
          : `${evidence[index]} Confirmed answer for ${question.id}.`,
      inputMode: "text" as const,
    })),
    evaluation: input.evaluation,
    evaluatedAt: input.evaluatedAt,
  });
  saveCompletedAttempt(window.localStorage, attempt);
}

describe("ProgressDashboard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders a useful empty state when no attempts or progress exist", async () => {
    render(<ProgressDashboard />);

    expect(
      await screen.findByRole("heading", { name: /no saved activity yet/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /study the star method lesson/i }),
    ).toHaveAttribute("href", "/learn/star-method");
  });

  it("opens a previous attempt and compares two compatible evaluated attempts", async () => {
    const user = userEvent.setup();
    seedCourseAndExercise();
    seedAttempt({
      id: "first",
      completedAt: "2026-07-15T09:00:00.000Z",
      evaluation: evaluation([2, 3, 3, 2]),
      evaluatedAt: "2026-07-15T09:05:00.000Z",
    });
    seedAttempt({
      id: "second",
      completedAt: "2026-07-15T11:00:00.000Z",
      evaluation: evaluation([4, 3, 3, 2]),
      evaluatedAt: "2026-07-15T11:05:00.000Z",
    });

    render(<ProgressDashboard />);

    expect(
      await screen.findByRole("heading", { name: /evidence from this device only/i }),
    ).toBeVisible();
    expect(
      screen.getByText("Simulations completed").closest(".pixel-status"),
    ).toHaveTextContent("2");

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);

    await user.click(within(cards[0]).getByRole("button", { name: /open attempt/i }));
    expect(await screen.findByRole("button", { name: /close attempt/i })).toBeVisible();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /volunteer coordinator at community hub/i,
      }),
    ).toBeVisible();
    expect(screen.getByText(/confirmed answer for q1/i)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /your star communication review/i }),
    ).toBeVisible();

    await user.click(
      within(cards[0]).getByRole("button", { name: /select to compare/i }),
    );
    await user.click(
      within(cards[1]).getByRole("button", { name: /select to compare/i }),
    );

    expect(
      await screen.findByRole("heading", { name: /attempt comparison/i }),
    ).toBeVisible();
    expect(screen.getByText(/not enough to claim overall progress/i)).toBeVisible();
    expect(screen.getByText(/specific improvements/i)).toBeVisible();
    expect(screen.getByText(/situation: 2\/5 → 4\/5/i)).toBeVisible();
    expect(screen.getByText(/remaining practice areas/i)).toBeVisible();
  });

  it("recovers from corrupt stored records via the reset action", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, "{corrupt json");

    render(<ProgressDashboard />);

    expect(
      await screen.findByRole("heading", { name: /progress records unavailable/i }),
    ).toBeVisible();
    expect(screen.getByText(/unsupported format/i)).toBeVisible();

    await user.click(screen.getByRole("button", { name: /reset stored progress/i }));

    expect(
      await screen.findByRole("heading", { name: /no saved activity yet/i }),
    ).toBeVisible();
  });

  it("explains incompatible attempt comparisons", async () => {
    const user = userEvent.setup();
    seedCourseAndExercise();
    seedAttempt({
      id: "alpha",
      completedAt: "2026-07-15T09:00:00.000Z",
      evaluation: evaluation([3, 3, 3, 3]),
      evaluatedAt: "2026-07-15T09:05:00.000Z",
      role: "Volunteer coordinator",
    });
    seedAttempt({
      id: "beta",
      completedAt: "2026-07-15T11:00:00.000Z",
      evaluation: evaluation([4, 4, 4, 4]),
      evaluatedAt: "2026-07-15T11:05:00.000Z",
      role: "Frontend intern",
    });

    render(<ProgressDashboard />);
    await screen.findByRole("heading", { name: /evidence from this device only/i });

    const cards = screen.getAllByRole("article");
    await user.click(
      within(cards[0]).getByRole("button", { name: /select to compare/i }),
    );
    await user.click(
      within(cards[1]).getByRole("button", { name: /select to compare/i }),
    );

    expect(await screen.findByText(/these attempts cannot be compared/i)).toBeVisible();
    expect(screen.getByText(/different interview scenarios/i)).toBeVisible();
  });
});
