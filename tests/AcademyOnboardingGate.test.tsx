import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AcademyOnboardingGate } from "@/components/AcademyOnboardingGate";
import { saveOnboardingPreferences } from "@/lib/onboarding";

const router = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

describe("AcademyOnboardingGate", () => {
  beforeEach(() => {
    window.localStorage.clear();
    router.replace.mockReset();
  });

  it("routes a first-time learner to onboarding before exposing the Academy", async () => {
    render(
      <AcademyOnboardingGate>
        <h1>Academy content</h1>
      </AcademyOnboardingGate>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Preparing your learning path");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/onboarding"));
    expect(
      screen.queryByRole("heading", { name: "Academy content" }),
    ).not.toBeInTheDocument();
  });

  it("allows a learner with saved onboarding preferences into the Academy", async () => {
    saveOnboardingPreferences(window.localStorage, {
      learningGoal: "interview_skills",
      experienceLevel: "new_to_practice",
      practiceMode: "text",
    });
    render(
      <AcademyOnboardingGate>
        <h1>Academy content</h1>
      </AcademyOnboardingGate>,
    );

    expect(await screen.findByRole("heading", { name: "Academy content" })).toBeVisible();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
