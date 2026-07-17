import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import AcademyDashboardPage from "@/app/academy/home/page";
import { saveLearnerProfile } from "@/lib/settings";

describe("Main Building Academy Hub", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders the full dashboard hierarchy and real destinations", async () => {
    saveLearnerProfile(window.localStorage, {
      name: "Hannah",
      focus: "Internship Interviews",
    });
    render(<AcademyDashboardPage />);

    expect(
      await screen.findByRole("heading", { name: /welcome back, hannah/i }),
    ).toBeVisible();
    const quickActions = screen.getByRole("navigation", {
      name: /academy quick actions/i,
    });
    expect(
      within(quickActions).getByRole("link", { name: /continue learning/i }),
    ).toHaveAttribute("href", "/learn");
    expect(
      within(quickActions).getByRole("link", { name: /practice interview/i }),
    ).toHaveAttribute("href", "/practice");
    expect(
      within(quickActions).getByRole("link", { name: /view progress/i }),
    ).toHaveAttribute("href", "/progress");
    expect(
      within(quickActions).getByRole("link", { name: /view achievements/i }),
    ).toHaveAttribute("href", "#achievements");

    for (const heading of [
      "Continue Your Journey",
      "Daily Missions",
      "Learning Streak",
      "Recent Activity",
      "Academy Statistics",
      "Achievements",
      "Career Journey",
      "Certificates",
      "Rank Progression",
    ]) {
      expect(screen.getByRole("heading", { name: heading })).toBeVisible();
    }
  });

  it("shows truthful unavailable metrics rather than invented values", async () => {
    render(<AcademyDashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    });
    expect(screen.getByText("Duration is not stored")).toBeVisible();
    expect(screen.getByText("No communication rubric stored")).toBeVisible();
    expect(
      screen.getByText(/lesson records do not include completion dates yet/i),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Download" })).not.toBeInTheDocument();
  });
});
