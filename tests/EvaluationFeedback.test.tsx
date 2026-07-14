import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EvaluationFeedback } from "@/components/EvaluationFeedback";
import type { InterviewEvaluation } from "@/lib/evaluation/contracts";

const evaluation: InterviewEvaluation = {
  summary: "Your response has a clear action and needs a more specific result.",
  strengths: ["You describe a specific action."],
  improvements: ["Make the outcome measurable when the transcript supports it."],
  rubricScores: ["situation", "task", "action", "result"].map((criterion, index) => ({
    criterion: criterion as "situation" | "task" | "action" | "result",
    score: index + 2,
    explanation: `The ${criterion} criterion is explained from the transcript.`,
    evidence: `Exact ${criterion} evidence`,
    improvementAction: `Make the ${criterion} more specific on retry.`,
  })),
  recommendedLessonId: "interview-foundations.star-method",
  nextPracticeAction: "Retry the same response with one clearer Result sentence.",
  improvedExample: "A reorganized example using only the learner's confirmed facts.",
};

describe("EvaluationFeedback", () => {
  it("renders grounded rubric feedback and the non-decision safety notice", () => {
    render(<EvaluationFeedback evaluation={evaluation} />);

    expect(
      screen.getByRole("heading", { name: /STAR communication review/i }),
    ).toBeVisible();
    expect(screen.getAllByText(/Transcript evidence/i)).toHaveLength(4);
    expect(screen.getByText(/not an official grade or hiring decision/i)).toBeVisible();
    expect(
      screen.getByRole("link", { name: /recommended STAR lesson/i }),
    ).toHaveAttribute("href", "/learn/star-method");
  });
});
