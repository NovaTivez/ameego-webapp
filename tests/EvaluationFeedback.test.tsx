import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

const session = {
  role: "Frontend intern",
  organization: "Northstar Labs",
  responseCount: 3,
};

describe("EvaluationFeedback", () => {
  it("renders the valid educational report in the required guidance-first order", () => {
    const { container } = render(
      <EvaluationFeedback evaluation={evaluation} session={session} onRetry={vi.fn()} />,
    );

    const labels = [
      "Educational session summary",
      "What you did well",
      "Main improvement opportunity",
      "Rubric breakdown",
      "Transcript evidence",
      "Specific improvement actions",
      "Recommended lesson",
      "Focused retry goal",
      "Improved answer example",
      "Retry simulation",
      "Continue learning",
    ];
    const positions = labels.map((label) => container.textContent?.indexOf(label) ?? -1);
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(
      screen.getAllByText(/^(Situation|Task|Action|Result) evidence$/i),
    ).toHaveLength(4);
    expect(screen.getByText(/not an official grade or hiring decision/i)).toBeVisible();
    expect(screen.getByRole("heading", { name: "Overall summary" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Strengths" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Areas to improve" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Rubric score summary" })).toBeVisible();
    expect(screen.getByText("Interview Coach")).toBeVisible();
    expect(container.textContent).not.toMatch(/openai|gpt|chatgpt|model|api/i);
    expect(
      screen.getByRole("link", { name: /open recommended lesson/i }),
    ).toHaveAttribute("href", "/learn/star-method");
  });

  it("invokes the focused same-scenario retry action", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <EvaluationFeedback evaluation={evaluation} session={session} onRetry={onRetry} />,
    );

    await user.click(screen.getByRole("button", { name: /retry this simulation/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not render a report with an invalid lesson recommendation", () => {
    const invalid = { ...evaluation, recommendedLessonId: "invented.lesson" };
    const { container } = render(
      <EvaluationFeedback evaluation={invalid} session={session} onRetry={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
