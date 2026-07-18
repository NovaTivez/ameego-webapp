import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { ProgressDashboard } from "@/components/ProgressDashboard";
import {
  readInterviewAttempts,
  saveAttemptEvaluation,
  saveCompletedAttempt,
} from "@/lib/interview/attempts";
import type { CompletedInterviewAttempt } from "@/lib/interview/contracts";
import { makeProgressAttempt } from "./progressFixtures";

function storeAttempt(attempt: CompletedInterviewAttempt) {
  const evaluation = attempt.evaluation;
  const unevaluated = { ...attempt, evaluation: undefined };
  saveCompletedAttempt(window.localStorage, unevaluated);
  if (evaluation) saveAttemptEvaluation(window.localStorage, attempt.id, evaluation);
}

describe("ProgressDashboard", () => {
  beforeEach(() => window.localStorage.clear());

  it("shows a useful empty state when there are no attempts or learning records", async () => {
    render(<ProgressDashboard />);

    expect(
      await screen.findByRole("heading", {
        name: /progress library is ready for its first record/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /start with the STAR lesson/i }),
    ).toHaveAttribute("href", "/learn/star-method");
    expect(screen.getByRole("heading", { name: "Your Progress" })).toBeVisible();
    expect(screen.getByText("Current Goal")).toBeVisible();
    const guidance = screen.getByRole("region", { name: "Current learning guidance" });
    expect(within(guidance).getByRole("link", { name: /continue/i })).toHaveAttribute(
      "href",
      "/learn/star-method",
    );
    expect(within(guidance).getByRole("link", { name: /open lesson/i })).toHaveAttribute(
      "href",
      "/learn/star-method",
    );
    expect(
      within(guidance).getByRole("link", { name: /view progress/i }),
    ).toHaveAttribute("href", "#progress-overview-heading");
    expect(
      screen
        .getByRole("banner")
        .querySelector('[aria-label="Current learning guidance"]'),
    ).toBeNull();
  });

  it("opens one saved attempt and explains why comparison is unavailable", async () => {
    const user = userEvent.setup();
    const attempt = makeProgressAttempt({
      id: "attempt-1",
      completedAt: "2026-07-15T01:00:00.000Z",
      evaluated: false,
    });
    storeAttempt(attempt);
    render(<ProgressDashboard />);

    expect(await screen.findByText("1 stored attempt")).toBeVisible();
    const interviewsCard = screen.getByText("Interviews").closest("article");
    expect(interviewsCard).toHaveTextContent("1");
    expect(interviewsCard).toHaveTextContent("Last practice: Jul 15");
    for (const heading of [
      "Progress Overview",
      "Skill Progress",
      "Recent Activity",
      "Next Recommendation",
      "Completed Lessons",
      "Completed Exercises",
      "Saved Interview Simulations",
    ]) {
      expect(screen.getByRole("heading", { name: heading })).toBeVisible();
    }
    expect(screen.getByText("Evidence").closest("article")).toHaveTextContent("0");
    expect(screen.getByText("Objectives").closest("article")).toHaveTextContent("0");
    expect(screen.getByText(/unlock rubric-based skill bars/i)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /Complete the STAR Method lesson/i }),
    ).toBeVisible();
    const attemptCard = screen
      .getByRole("heading", { name: "Frontend intern" })
      .closest("article");
    expect(attemptCard).not.toBeNull();
    expect(within(attemptCard!).getByText("Attempt 1")).toBeVisible();
    expect(within(attemptCard!).getByText("Position")).toBeVisible();
    expect(within(attemptCard!).getByText("Company")).toBeVisible();
    expect(within(attemptCard!).getByText("Date and Time")).toBeVisible();
    expect(within(attemptCard!).getByText("Transcript Status")).toBeVisible();
    expect(within(attemptCard!).getByText("Confirmed Responses")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /open attempt/i }));
    expect(
      screen.getByRole("heading", { name: /Frontend intern at Northstar Labs/i }),
    ).toBeVisible();
    expect(screen.getByText(/attempt-1 situation evidence/i)).toBeVisible();
    expect(screen.getByText(/no saved validated feedback/i)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /two attempts are needed/i }),
    ).toBeVisible();
  });

  it("requires confirmation before deleting a saved interview", async () => {
    const user = userEvent.setup();
    const attempt = makeProgressAttempt({
      id: "attempt-delete",
      completedAt: "2026-07-15T01:00:00.000Z",
      evaluated: false,
    });
    storeAttempt(attempt);
    render(<ProgressDashboard />);

    const attemptCard = (
      await screen.findByRole("heading", { name: "Frontend intern" })
    ).closest("article");
    expect(attemptCard).not.toBeNull();
    await user.click(within(attemptCard!).getByRole("button", { name: /^delete$/i }));

    const dialog = screen.getByRole("alertdialog", { name: /delete saved interview/i });
    expect(dialog).toHaveTextContent("Frontend intern");
    expect(dialog).toHaveTextContent("Northstar Labs");
    await user.click(within(dialog).getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(readInterviewAttempts(window.localStorage).attempts).toHaveLength(1);

    await user.click(within(attemptCard!).getByRole("button", { name: /^delete$/i }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: /delete saved attempt/i,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: /progress library is ready for its first record/i,
      }),
    ).toBeVisible();
    expect(readInterviewAttempts(window.localStorage).attempts).toHaveLength(0);
  });

  it("renders rubric changes, specific improvements, and remaining areas for two comparable attempts", async () => {
    const user = userEvent.setup();
    const earlier = makeProgressAttempt({
      id: "attempt-1",
      completedAt: "2026-07-15T01:00:00.000Z",
      scores: [2, 3, 3, 2],
    });
    const later = makeProgressAttempt({
      id: "attempt-2",
      completedAt: "2026-07-16T01:00:00.000Z",
      scores: [3, 3, 4, 3],
    });
    storeAttempt(earlier);
    storeAttempt(later);
    render(<ProgressDashboard />);
    await screen.findByText("2 stored attempts");

    expect(
      screen.getByRole("progressbar", { name: /Situation validated rubric average/i }),
    ).toHaveAttribute("aria-valuenow", "50");

    await user.selectOptions(screen.getByLabelText("First attempt"), earlier.id);
    await user.selectOptions(screen.getByLabelText("Second attempt"), later.id);

    const table = await screen.findByRole("table", { name: /rubric-level changes/i });
    expect(
      within(table).getByRole("row", { name: /Action 3\/5 4\/5 \+1/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /specific improvements in this pair/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /remaining practice areas/i }),
    ).toBeVisible();
    expect(screen.getByText(/not proof of broad or lasting improvement/i)).toBeVisible();
  });

  it("shows an incompatible state instead of comparing an unevaluated attempt", async () => {
    const user = userEvent.setup();
    const evaluated = makeProgressAttempt({
      id: "attempt-1",
      completedAt: "2026-07-15T01:00:00.000Z",
    });
    const unevaluated = makeProgressAttempt({
      id: "attempt-2",
      completedAt: "2026-07-16T01:00:00.000Z",
      evaluated: false,
    });
    storeAttempt(evaluated);
    storeAttempt(unevaluated);
    render(<ProgressDashboard />);
    await screen.findByText("2 stored attempts");

    await user.selectOptions(screen.getByLabelText("First attempt"), evaluated.id);
    await user.selectOptions(screen.getByLabelText("Second attempt"), unevaluated.id);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /both attempts need validated rubric feedback/i,
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
