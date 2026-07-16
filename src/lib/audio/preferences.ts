export const AUDIO_PREFERENCES_STORAGE_KEY = "ameego:audio-preferences:v1";

export type AudioPreferences = {
  version: 1;
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
};

export const DEFAULT_AUDIO_PREFERENCES: AudioPreferences = {
  version: 1,
  musicEnabled: true,
  soundEffectsEnabled: true,
};

function isAudioPreferences(value: unknown): value is AudioPreferences {
  if (!value || typeof value !== "object") return false;
  const preferences = value as Partial<AudioPreferences>;
  return (
    preferences.version === 1 &&
    typeof preferences.musicEnabled === "boolean" &&
    typeof preferences.soundEffectsEnabled === "boolean"
  );
}

export function readAudioPreferences(storage: Storage): AudioPreferences {
  const raw = storage.getItem(AUDIO_PREFERENCES_STORAGE_KEY);
  if (!raw) return { ...DEFAULT_AUDIO_PREFERENCES };

  try {
    const parsed: unknown = JSON.parse(raw);
    return isAudioPreferences(parsed) ? { ...parsed } : { ...DEFAULT_AUDIO_PREFERENCES };
  } catch {
    return { ...DEFAULT_AUDIO_PREFERENCES };
  }
}

export function saveAudioPreferences(
  storage: Storage,
  preferences: Omit<AudioPreferences, "version">,
): AudioPreferences {
  const saved: AudioPreferences = { version: 1, ...preferences };
  storage.setItem(AUDIO_PREFERENCES_STORAGE_KEY, JSON.stringify(saved));
  return saved;
}
