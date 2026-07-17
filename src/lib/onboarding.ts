import type { InterviewDifficulty } from "@/lib/interview/contracts";

export const ONBOARDING_STORAGE_KEY = "ameego:onboarding:v1";

export const LEARNING_GOALS = [
  "interview_skills",
  "public_speaking",
  "classroom_presentations",
  "professional_communication",
] as const;

export const EXPERIENCE_LEVELS = [
  "new_to_practice",
  "some_practice",
  "ready_for_challenge",
] as const;

export const PRACTICE_MODES = ["text", "microphone"] as const;

export type LearningGoal = (typeof LEARNING_GOALS)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type PracticeMode = (typeof PRACTICE_MODES)[number];

export type OnboardingPreferences = {
  version: 1;
  learningGoal: LearningGoal;
  experienceLevel: ExperienceLevel;
  practiceMode: PracticeMode;
};

function isOneOf<T extends readonly string[]>(
  value: unknown,
  values: T,
): value is T[number] {
  return typeof value === "string" && values.includes(value);
}

function isOnboardingPreferences(value: unknown): value is OnboardingPreferences {
  if (!value || typeof value !== "object") return false;
  const preferences = value as Partial<OnboardingPreferences>;
  return (
    preferences.version === 1 &&
    isOneOf(preferences.learningGoal, LEARNING_GOALS) &&
    isOneOf(preferences.experienceLevel, EXPERIENCE_LEVELS) &&
    isOneOf(preferences.practiceMode, PRACTICE_MODES)
  );
}

export function readOnboardingPreferences(
  storage: Storage,
): OnboardingPreferences | null {
  const raw = storage.getItem(ONBOARDING_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isOnboardingPreferences(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveOnboardingPreferences(
  storage: Storage,
  preferences: Omit<OnboardingPreferences, "version">,
): OnboardingPreferences {
  const saved: OnboardingPreferences = { version: 1, ...preferences };
  if (!isOnboardingPreferences(saved)) {
    throw new Error("Choose a learning goal, experience level, and practice mode.");
  }
  storage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

export function getOnboardingInterviewPrefill(preferences: OnboardingPreferences): {
  goals: string;
  difficulty: InterviewDifficulty;
} {
  const goals: Record<LearningGoal, string> = {
    interview_skills: "Build clear STAR stories for interviews.",
    public_speaking: "Practise a clear structure and delivery for public speaking.",
    classroom_presentations: "Practise a clear, organized classroom presentation.",
    professional_communication: "Practise clear professional communication.",
  };
  const difficulty: Record<ExperienceLevel, InterviewDifficulty> = {
    new_to_practice: "Beginner",
    some_practice: "Intermediate",
    ready_for_challenge: "Advanced",
  };

  return {
    goals: goals[preferences.learningGoal],
    difficulty: difficulty[preferences.experienceLevel],
  };
}
