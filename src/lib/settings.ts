import { COURSE_PROGRESS_STORAGE_KEY } from "@/lib/course-progress";
import { AUDIO_PREFERENCES_STORAGE_KEY } from "@/lib/audio/preferences";
import { EXERCISE_PROGRESS_STORAGE_KEY } from "@/lib/exercise-progress";
import { INTERVIEW_ATTEMPTS_STORAGE_KEY } from "@/lib/interview/attempts";
import { notifyProgressChanged } from "@/lib/progress-events";

export const LEARNER_PROFILE_STORAGE_KEY = "ameego:learner-profile:v1";

export const LEARNER_AVATAR_PRESETS = ["scholar", "explorer", "diplomat"] as const;

export type LearnerAvatarPreset = (typeof LEARNER_AVATAR_PRESETS)[number];
export type LearnerAvatar =
  { kind: "preset"; preset: LearnerAvatarPreset } | { kind: "upload"; dataUrl: string };

export type LearnerProfile = {
  version: 1;
  name: string;
  focus: string;
  avatar: LearnerAvatar;
};

export const DEFAULT_LEARNER_PROFILE: LearnerProfile = {
  version: 1,
  name: "Pixel Learner",
  focus: "Interview Skills",
  avatar: { kind: "preset", preset: "scholar" },
};

export type LearnerDataExport = {
  format: "ameego-local-data";
  version: 1;
  exportedAt: string;
  data: {
    profile: unknown | null;
    courseProgress: unknown | null;
    exerciseProgress: unknown | null;
    interviewAttempts: unknown | null;
    audioPreferences: unknown | null;
  };
};

function isLearnerAvatar(value: unknown): value is LearnerAvatar {
  if (!value || typeof value !== "object") return false;
  const avatar = value as Partial<LearnerAvatar>;
  if (avatar.kind === "preset") {
    return LEARNER_AVATAR_PRESETS.includes(avatar.preset as LearnerAvatarPreset);
  }
  return (
    avatar.kind === "upload" &&
    typeof avatar.dataUrl === "string" &&
    /^data:image\/(png|jpeg|webp);base64,/.test(avatar.dataUrl) &&
    avatar.dataUrl.length <= 2_000_000
  );
}

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
    profile.focus.trim().length <= 80 &&
    (profile.avatar === undefined || isLearnerAvatar(profile.avatar))
  );
}

export function readLearnerProfile(storage: Storage): LearnerProfile {
  const raw = storage.getItem(LEARNER_PROFILE_STORAGE_KEY);
  if (!raw) return { ...DEFAULT_LEARNER_PROFILE };
  const parsed: unknown = JSON.parse(raw);
  if (!isLearnerProfile(parsed)) {
    throw new Error("Stored learner profile has an unsupported format.");
  }
  return {
    version: 1,
    name: parsed.name.trim(),
    focus: parsed.focus.trim(),
    avatar: parsed.avatar ?? { ...DEFAULT_LEARNER_PROFILE.avatar },
  };
}

export function saveLearnerProfile(
  storage: Storage,
  profile: Omit<LearnerProfile, "version" | "avatar"> & { avatar?: LearnerAvatar },
): LearnerProfile {
  const candidate: LearnerProfile = {
    version: 1,
    ...profile,
    avatar: profile.avatar ?? { ...DEFAULT_LEARNER_PROFILE.avatar },
  };
  if (!isLearnerProfile(candidate)) {
    throw new Error("Enter a name and focus using the available field lengths.");
  }
  const saved = {
    version: 1 as const,
    name: candidate.name.trim(),
    focus: candidate.focus.trim(),
    avatar: candidate.avatar,
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
  notifyProgressChanged();
}

export function resetAllLearnerData(storage: Storage): void {
  clearLearningProgress(storage);
  storage.removeItem(LEARNER_PROFILE_STORAGE_KEY);
}

function readStoredJson(storage: Storage, key: string): unknown | null {
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function createLearnerDataExport(
  storage: Storage,
  exportedAt = new Date().toISOString(),
): LearnerDataExport {
  return {
    format: "ameego-local-data",
    version: 1,
    exportedAt,
    data: {
      profile: readStoredJson(storage, LEARNER_PROFILE_STORAGE_KEY),
      courseProgress: readStoredJson(storage, COURSE_PROGRESS_STORAGE_KEY),
      exerciseProgress: readStoredJson(storage, EXERCISE_PROGRESS_STORAGE_KEY),
      interviewAttempts: readStoredJson(storage, INTERVIEW_ATTEMPTS_STORAGE_KEY),
      audioPreferences: readStoredJson(storage, AUDIO_PREFERENCES_STORAGE_KEY),
    },
  };
}
