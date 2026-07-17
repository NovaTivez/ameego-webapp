import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OnboardingForm } from "@/components/OnboardingForm";
import { readOnboardingPreferences } from "@/lib/onboarding";

const router = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

describe("OnboardingForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    router.push.mockReset();
  });

  it("requires every short onboarding choice before continuing", async () => {
    const user = userEvent.setup();
    render(<OnboardingForm />);

    await user.click(screen.getByRole("button", { name: "Enter Your Academy" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose one option in each section to continue.",
    );
    expect(router.push).not.toHaveBeenCalled();
  });

  it("saves onboarding preferences and continues to the Academy", async () => {
    const user = userEvent.setup();
    render(<OnboardingForm />);

    await user.click(screen.getByRole("radio", { name: /interview skills/i }));
    await user.click(screen.getByRole("radio", { name: /some practice/i }));
    await user.click(screen.getByRole("radio", { name: /microphone first/i }));
    await user.click(screen.getByRole("button", { name: "Enter Your Academy" }));

    expect(readOnboardingPreferences(window.localStorage)).toMatchObject({
      learningGoal: "interview_skills",
      experienceLevel: "some_practice",
      practiceMode: "microphone",
    });
    expect(router.push).toHaveBeenCalledWith("/academy");
  });
});
