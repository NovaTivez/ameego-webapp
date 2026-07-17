import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";

describe("landing title screen", () => {
  it("renders the Ameego game title, compact tagline, and onboarding learning action", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "Ameego" })).toBeVisible();
    expect(screen.getByText("Pixel Communication Academy")).toBeVisible();
    expect(screen.getByText("Level up your communication.")).toBeVisible();
    expect(screen.getByText("Ace every interview.")).toBeVisible();
    expect(screen.getByText("Unlock your future.")).toBeVisible();
    const startLearning = screen.getByRole("link", {
      name: /start learning.*set up your learning path/i,
    });
    expect(startLearning).toHaveAttribute("href", "/onboarding");
    expect(within(startLearning).getAllByText("Start Learning")).toHaveLength(1);
  });

  it("does not render the academy hub directory on the title screen", () => {
    render(<HomePage />);

    expect(screen.queryByText(/main campus directory/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: /academy menu/i }),
    ).not.toBeInTheDocument();
  });
});
