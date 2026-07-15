import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StarArrangementExercise } from "@/components/StarArrangementExercise";
import { starArrangementExercise } from "@/content/star-arrangement-exercise";
import {
  EXERCISE_PROGRESS_STORAGE_KEY,
  recordExerciseAttempt,
} from "@/lib/exercise-progress";

function renderedOrder(): string[] {
  return screen
    .getAllByTestId(/^segment-/)
    .map((segment) => segment.getAttribute("data-testid")?.replace("segment-", "") ?? "");
}

describe("StarArrangementExercise", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders four answer slots with movable S, T, A, and R tiles", async () => {
    render(<StarArrangementExercise exercise={starArrangementExercise} />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /check my order/i })).toBeEnabled();
    });

    expect(
      screen.getByRole("heading", { name: /arrange the star method/i }),
    ).toBeVisible();
    expect(screen.getAllByText(/slot [1-4]/i)).toHaveLength(4);
    for (const label of ["Situation", "Task", "Action", "Result"]) {
      const tile = screen.getByTestId(`segment-${label.toLowerCase()}`);
      expect(within(tile).getByText(label)).toBeVisible();
      expect(within(tile).getByText(label.charAt(0))).toBeVisible();
    }
    expect(screen.getByRole("button", { name: /reset arrangement/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /check my order/i })).toBeVisible();
  });

  it("supports exact mouse drag-and-drop targeting without duplicate or lost cards", async () => {
    render(<StarArrangementExercise exercise={starArrangementExercise} />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /check my order/i })).toBeEnabled();
    });
    const action = screen.getByTestId("segment-action");
    const task = screen.getByTestId("segment-task");
    const dataTransfer = {
      effectAllowed: "none",
      dropEffect: "none",
      setData: vi.fn(),
      getData: vi.fn(() => "action"),
    };

    fireEvent.dragStart(action, { dataTransfer });
    expect(action.className).toContain("isDragging");
    fireEvent.dragOver(task, { dataTransfer });
    expect(task.className).toContain("isDropTarget");
    fireEvent.drop(task, { dataTransfer });

    expect(dataTransfer.setData).toHaveBeenCalledWith("text/plain", "action");
    expect(renderedOrder()).toEqual(["situation", "result", "task", "action"]);
    expect(new Set(renderedOrder())).toEqual(
      new Set(["situation", "task", "action", "result"]),
    );
  });

  it("allows a keyboard-only user to create and validate the correct order", async () => {
    const user = userEvent.setup();
    render(<StarArrangementExercise exercise={starArrangementExercise} />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /check my order/i })).toBeEnabled();
    });

    screen.getByRole("button", { name: /move situation up/i }).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText(/situation moved to position 1/i)).toBeInTheDocument();

    screen.getByRole("button", { name: /move task up/i }).focus();
    await user.keyboard(" ");
    screen.getByRole("button", { name: /move task up/i }).focus();
    await user.keyboard("{Enter}");

    expect(renderedOrder()).toEqual(["situation", "task", "action", "result"]);
    screen.getByRole("button", { name: /check my order/i }).focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByText("Correct order")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /continue to interview center/i }),
    ).toHaveAttribute("href", "/practice");
  });

  it("uses a logical tab order and exposes move labels for all four sections", async () => {
    const user = userEvent.setup();
    render(<StarArrangementExercise exercise={starArrangementExercise} />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /check my order/i })).toBeEnabled();
    });

    for (const label of ["Situation", "Task", "Action", "Result"]) {
      expect(screen.getByRole("button", { name: `Move ${label} up` })).toBeVisible();
      expect(screen.getByRole("button", { name: `Move ${label} down` })).toBeVisible();
    }

    await user.tab();
    expect(screen.getByRole("link", { name: "Interview Foundations" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "STAR Method" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /move action down/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /move situation up/i })).toHaveFocus();
  });

  it("explains an incorrect order, saves completion, and allows retry", async () => {
    const user = userEvent.setup();
    render(<StarArrangementExercise exercise={starArrangementExercise} />);
    const checkButton = await screen.findByRole("button", { name: /check my order/i });
    await waitFor(() => expect(checkButton).toBeEnabled());
    await user.click(checkButton);

    expect(
      await screen.findByText(/few segments need a different position/i),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: /what should move/i })).toBeVisible();
    expect(screen.getByText(/why the correct order works/i)).toBeVisible();
    expect(window.localStorage.getItem(EXERCISE_PROGRESS_STORAGE_KEY)).toContain(
      starArrangementExercise.id,
    );
    const savedProgress = window.localStorage.getItem(EXERCISE_PROGRESS_STORAGE_KEY);
    expect(
      screen.getByRole("link", { name: /continue to interview center/i }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: /retry exercise/i }));

    expect(
      screen.queryByRole("heading", { name: /what should move/i }),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getAllByTestId(/^segment-/)[0]).getByText(/mapped the delays/i),
    ).toBeVisible();
    expect(window.localStorage.getItem(EXERCISE_PROGRESS_STORAGE_KEY)).toBe(
      savedProgress,
    );
  });

  it("restores saved completion after a remount", async () => {
    recordExerciseAttempt(window.localStorage, starArrangementExercise.id, false);

    const view = render(<StarArrangementExercise exercise={starArrangementExercise} />);
    expect(await screen.findByText("Completion saved")).toBeVisible();
    expect(screen.getByText(/perfection is not required/i)).toBeVisible();

    view.unmount();
    render(<StarArrangementExercise exercise={starArrangementExercise} />);
    expect(await screen.findByText("Completion saved")).toBeVisible();
  });

  it("recovers invalid stored progress without deleting unrelated storage", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(EXERCISE_PROGRESS_STORAGE_KEY, "not-json");
    window.localStorage.setItem("unrelated", "keep-me");

    render(<StarArrangementExercise exercise={starArrangementExercise} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/progress is invalid/i);
    const resetButton = screen.getByRole("button", {
      name: /reset invalid progress/i,
    });
    resetButton.focus();
    await user.keyboard("{Enter}");

    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(window.localStorage.getItem(EXERCISE_PROGRESS_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem("unrelated")).toBe("keep-me");
  });
});
