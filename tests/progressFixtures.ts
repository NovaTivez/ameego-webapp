import type { InterviewEvaluation } from "@/lib/evaluation/contracts";
import { createCompletedAttempt } from "@/lib/interview/attempts";
import {
  DEFAULT_INTERVIEW_SETUP,
  type CompletedInterviewAttempt,
  type QuestionSet,
} from "@/lib/interview/contracts";

const criteria = ["situation", "task", "action", "result"] as const;

export function makeProgressAttempt(options: {
  id: string;
  completedAt: string;
  role?: string;
  organization?: string;
  scores?: [number, number, number, number];
  evaluated?: boolean;
}): CompletedInterviewAttempt {
  const questionSet: QuestionSet = {
    source: "general_fallback",
    questions: [
      {
        id: "q1",
        category: "behavioral",
        text: "Describe a challenge you handled with a team.",
      },
      {
        id: "q2",
        category: "role_specific",
        text: "How would you prepare for this responsibility?",
      },
      {
        id: "q3",
        category: "introductory",
        text: "Please introduce yourself for this opportunity.",
      },
    ],
  };
  const evidence = Object.fromEntries(
    criteria.map((criterion) => [criterion, `${options.id} ${criterion} evidence.`]),
  ) as Record<(typeof criteria)[number], string>;
  const attempt = createCompletedAttempt({
    id: options.id,
    completedAt: options.completedAt,
    context: {
      setup: {
        ...DEFAULT_INTERVIEW_SETUP,
        role: options.role ?? "Frontend intern",
        organization: options.organization ?? "Northstar Labs",
      },
      resumeProfile: null,
    },
    questionSet,
    responses: [
      {
        questionId: "q1",
        transcript: criteria.map((criterion) => evidence[criterion]).join(" "),
        inputMode: "text",
      },
      {
        questionId: "q2",
        transcript: `${options.id} preparation response.`,
        inputMode: "text",
      },
      {
        questionId: "q3",
        transcript: `${options.id} introduction response.`,
        inputMode: "text",
      },
    ],
  });

  if (options.evaluated !== false) {
    const scores = options.scores ?? [3, 3, 3, 3];
    attempt.evaluation = {
      summary: `Validated STAR feedback summary for ${options.id}.`,
      strengths: ["The response includes a specific action supported by evidence."],
      improvements: ["Make the result more concrete in the next response."],
      rubricScores: criteria.map((criterion, index) => ({
        criterion,
        score: scores[index],
        explanation: `The ${criterion} explanation is grounded in this saved attempt.`,
        evidence: evidence[criterion],
        improvementAction: `Add more specific ${criterion} evidence in the next attempt.`,
      })),
      recommendedLessonId: "interview-foundations.star-method",
      nextPracticeAction: "Retry with one concrete result and a clear lesson learned.",
      improvedExample: `A grounded improved example using only ${options.id} transcript details.`,
    } satisfies InterviewEvaluation;
  }

  return attempt;
}
