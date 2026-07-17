import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { ProgressDashboard } from "@/components/ProgressDashboard";
import {
  INTERVIEW_ATTEMPTS_STORAGE_KEY,
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
  });

  it("confirms corrupt interview-history recovery, then allows a new attempt to save", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(INTERVIEW_ATTEMPTS_STORAGE_KEY, "{not-json");
    render(<ProgressDashboard />);

    expect(
      await screen.findByRole("heading", { name: /saved activity could not be read/i }),
    ).toBeVisible();
    expect(
      screen.getByText(/saved interview history has an unsupported format/i),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: /reset interview history/i }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      /permanently removes only saved interview attempts/i,
    );
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toBe("{not-json");

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toBe("{not-json");

    await user.click(screen.getByRole("button", { name: /reset interview history/i }));
    await user.click(
      screen.getByRole("button", { name: /confirm reset interview history/i }),
    );
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toBeNull();
    expect(
      await screen.findByRole("heading", {
        name: /progress library is ready for its first record/i,
      }),
    ).toBeVisible();

    const attempt = makeProgressAttempt({
      id: "recovered-attempt",
      completedAt: "2026-07-18T01:00:00.000Z",
      evaluated: false,
    });
    saveCompletedAttempt(window.localStorage, attempt);
    expect(readInterviewAttempts(window.localStorage).attempts).toEqual([attempt]);
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
    expect(screen.getByText("Interviews Taken").parentElement).toHaveTextContent("1");
    for (const heading of [
      "Progress Overview",
      "Statistics",
      "Skill Progress",
      "Recent Activity",
      "Next Recommendation",
      "Completed Lessons",
      "Completed Exercises",
      "Saved Interview Simulations",
    ]) {
      expect(screen.getByRole("heading", { name: heading })).toBeVisible();
    }
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
