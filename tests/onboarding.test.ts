import { beforeEach, describe, expect, it } from "vitest";

import {
  getOnboardingInterviewPrefill,
  ONBOARDING_STORAGE_KEY,
  readOnboardingPreferences,
  saveOnboardingPreferences,
} from "@/lib/onboarding";

describe("onboarding preferences", () => {
  beforeEach(() => window.localStorage.clear());

  it("persists only a complete, supported onboarding selection", () => {
    expect(readOnboardingPreferences(window.localStorage)).toBeNull();
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "not-json");
    expect(readOnboardingPreferences(window.localStorage)).toBeNull();

    const preferences = saveOnboardingPreferences(window.localStorage, {
      learningGoal: "public_speaking",
      experienceLevel: "some_practice",
      practiceMode: "microphone",
    });

    expect(readOnboardingPreferences(window.localStorage)).toEqual(preferences);
  });

  it("maps onboarding choices to a safe interview setup prefill", () => {
    expect(
      getOnboardingInterviewPrefill({
        version: 1,
        learningGoal: "classroom_presentations",
        experienceLevel: "ready_for_challenge",
        practiceMode: "text",
      }),
    ).toEqual({
      goals: "Practise a clear, organized classroom presentation.",
      difficulty: "Advanced",
    });
  });
});
