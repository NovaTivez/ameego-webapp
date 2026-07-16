"use client";

import { PixelIcon } from "@/components/PixelIcon";
import { useAudioExperience } from "@/components/AudioExperienceProvider";

export function ExperienceControls() {
  const { autoplayBlocked, isOnline, musicEnabled, toggleMusic } = useAudioExperience();

  return (
    <>
      <div className="experience-controls" aria-label="Audio and connection controls">
        <button
          className="music-toggle"
          type="button"
          aria-pressed={musicEnabled}
          aria-label={musicEnabled ? "Mute background music" : "Play background music"}
          title={
            autoplayBlocked && musicEnabled
              ? "Music will begin after your next interaction"
              : musicEnabled
                ? "Background music on"
                : "Background music muted"
          }
          onClick={toggleMusic}
        >
          <PixelIcon name={musicEnabled ? "music" : "muted"} size="small" />
          <span>{musicEnabled ? "Music" : "Muted"}</span>
        </button>
        <div
          className={`connection-status ${isOnline ? "is-online" : "is-offline"}`}
          role="status"
          aria-live="polite"
          aria-label={isOnline ? "Online" : "Offline"}
        >
          <span aria-hidden="true" />
          <strong>{isOnline ? "Online" : "Offline"}</strong>
        </div>
      </div>
      {!isOnline ? (
        <div className="offline-mode-notice" role="status">
          <strong>Offline Mode</strong>
          <span>Cached lessons and local progress remain available.</span>
        </div>
      ) : null}
    </>
  );
}
