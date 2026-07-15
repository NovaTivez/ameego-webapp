import { COURSE_PROGRESS_STORAGE_KEY } from "@/lib/course-progress";
import { EXERCISE_PROGRESS_STORAGE_KEY } from "@/lib/exercise-progress";
import { INTERVIEW_ATTEMPTS_STORAGE_KEY } from "@/lib/interview/attempts";

export const LEARNER_PROFILE_STORAGE_KEY = "ameego:learner-profile:v1";

export type LearnerProfile = {
  version: 1;
  name: string;
  focus: string;
};

export const DEFAULT_LEARNER_PROFILE: LearnerProfile = {
  version: 1,
  name: "Pixel Learner",
  focus: "Interview Skills",
};

function isLearnerProfile(value: unknown): value is LearnerProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<LearnerProfile>;
  return (
    profile.version === 1 &&
    typeof profile.name === "string" &&
    profile.name.trim().length > 0 &&
    profile.name.trim().length <= 60 &&
    typeof profile.focus === "string" &&
    profile.focus.trim().length > 0 &&
    profile.focus.trim().length <= 80
  );
}

export function readLearnerProfile(storage: Storage): LearnerProfile {
  const raw = storage.getItem(LEARNER_PROFILE_STORAGE_KEY);
  if (!raw) return { ...DEFAULT_LEARNER_PROFILE };
  const parsed: unknown = JSON.parse(raw);
  if (!isLearnerProfile(parsed)) {
    throw new Error("Stored learner profile has an unsupported format.");
  }
  return { version: 1, name: parsed.name.trim(), focus: parsed.focus.trim() };
}

export function saveLearnerProfile(
  storage: Storage,
  profile: Omit<LearnerProfile, "version">,
): LearnerProfile {
  const candidate: LearnerProfile = { version: 1, ...profile };
  if (!isLearnerProfile(candidate)) {
    throw new Error("Enter a name and focus using the available field lengths.");
  }
  const saved = {
    version: 1 as const,
    name: candidate.name.trim(),
    focus: candidate.focus.trim(),
  };
  storage.setItem(LEARNER_PROFILE_STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

export function clearLearningProgress(storage: Storage): void {
  for (const key of [
    COURSE_PROGRESS_STORAGE_KEY,
    EXERCISE_PROGRESS_STORAGE_KEY,
    INTERVIEW_ATTEMPTS_STORAGE_KEY,
  ]) {
    storage.removeItem(key);
  }
}

export function resetAllLearnerData(storage: Storage): void {
  clearLearningProgress(storage);
  storage.removeItem(LEARNER_PROFILE_STORAGE_KEY);
}
