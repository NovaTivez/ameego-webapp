import { beforeEach, describe, expect, it } from "vitest";

import {
  AUDIO_PREFERENCES_STORAGE_KEY,
  DEFAULT_AUDIO_PREFERENCES,
  readAudioPreferences,
  saveAudioPreferences,
} from "@/lib/audio/preferences";

describe("audio preferences", () => {
  beforeEach(() => window.localStorage.clear());

  it("defaults music and sound effects to on", () => {
    expect(readAudioPreferences(window.localStorage)).toEqual(DEFAULT_AUDIO_PREFERENCES);
  });

  it("persists separate music and sound-effect choices", () => {
    saveAudioPreferences(window.localStorage, {
      musicEnabled: false,
      soundEffectsEnabled: true,
    });

    expect(readAudioPreferences(window.localStorage)).toEqual({
      version: 1,
      musicEnabled: false,
      soundEffectsEnabled: true,
    });
  });

  it("recovers safely from corrupt stored preferences", () => {
    window.localStorage.setItem(AUDIO_PREFERENCES_STORAGE_KEY, "{broken");
    expect(readAudioPreferences(window.localStorage)).toEqual(DEFAULT_AUDIO_PREFERENCES);
  });
});
