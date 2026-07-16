import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AudioExperienceProvider } from "@/components/AudioExperienceProvider";
import { ExperienceControls } from "@/components/ExperienceControls";
import { SettingsPanel } from "@/components/SettingsPanel";
import {
  AUDIO_PREFERENCES_STORAGE_KEY,
  readAudioPreferences,
} from "@/lib/audio/preferences";

const playMock = vi.fn<() => Promise<void>>();
const pauseMock = vi.fn<() => void>();

function ExperienceTestBed({ children }: { children?: React.ReactNode }) {
  return (
    <AudioExperienceProvider>
      <ExperienceControls />
      {children}
    </AudioExperienceProvider>
  );
}

describe("audio and connection experience", () => {
  beforeEach(() => {
    window.localStorage.clear();
    playMock.mockReset().mockResolvedValue(undefined);
    pauseMock.mockReset();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(playMock);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pauseMock);
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  it("persists the global music toggle", async () => {
    const user = userEvent.setup();
    render(<ExperienceTestBed />);

    const toggle = await screen.findByRole("button", {
      name: /mute background music/i,
    });
    await user.click(toggle);

    expect(
      screen.getByRole("button", { name: /play background music/i }),
    ).toHaveAttribute("aria-pressed", "false");
    await waitFor(() =>
      expect(readAudioPreferences(window.localStorage).musicEnabled).toBe(false),
    );
  });

  it("keeps the background music configured to loop continuously", () => {
    const { container } = render(<ExperienceTestBed />);

    const music = container.querySelector<HTMLAudioElement>(
      'audio[src="/audio/town-theme.mp3"]',
    );
    expect(music).not.toBeNull();
    expect(music?.loop).toBe(true);
  });

  it("keeps sound effects available when music is muted", async () => {
    const user = userEvent.setup();
    render(
      <ExperienceTestBed>
        <button type="button">Open lesson</button>
      </ExperienceTestBed>,
    );

    await user.click(
      await screen.findByRole("button", { name: /mute background music/i }),
    );
    playMock.mockClear();
    await user.click(screen.getByRole("button", { name: "Open lesson" }));

    expect(playMock).toHaveBeenCalled();
  });

  it("updates connection state immediately", async () => {
    render(<ExperienceTestBed />);
    expect(await screen.findByRole("status", { name: "Online" })).toBeVisible();

    window.dispatchEvent(new Event("offline"));

    expect(await screen.findByRole("status", { name: "Offline" })).toBeVisible();
    expect(screen.getByText("Offline Mode")).toBeVisible();
  });

  it("provides separate persisted toggles in Settings", async () => {
    const user = userEvent.setup();
    render(
      <AudioExperienceProvider>
        <SettingsPanel />
      </AudioExperienceProvider>,
    );

    const music = await screen.findByRole("switch", { name: /background music/i });
    const effects = screen.getByRole("switch", { name: /sound effects/i });
    expect(music).toHaveAttribute("aria-checked", "true");
    expect(effects).toHaveAttribute("aria-checked", "true");

    await user.click(effects);
    await waitFor(() =>
      expect(readAudioPreferences(window.localStorage).soundEffectsEnabled).toBe(false),
    );
  });

  it("fades and pauses music while an interview response is active", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(window.performance.now() + 1_000);
      return 1;
    });
    render(<ExperienceTestBed />);
    await waitFor(() => expect(playMock).toHaveBeenCalled());

    window.dispatchEvent(
      new CustomEvent("ameego:interview-state", { detail: { active: true } }),
    );

    await waitFor(() => expect(pauseMock).toHaveBeenCalled());
  });

  it("recovers gracefully when autoplay is blocked", async () => {
    playMock.mockRejectedValueOnce(new DOMException("Blocked", "NotAllowedError"));
    render(<ExperienceTestBed />);

    expect(
      await screen.findByTitle(/music will begin after your next interaction/i),
    ).toBeVisible();
    expect(window.localStorage.getItem(AUDIO_PREFERENCES_STORAGE_KEY)).not.toBeNull();
  });
});
