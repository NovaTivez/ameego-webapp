"use client";

import { useCallback, useEffect, useState } from "react";

import { CharacterPortrait } from "@/components/CharacterPortrait";
import { PixelButton } from "@/components/PixelButton";
import { readCourseProgress } from "@/lib/course-progress";
import { readExerciseProgress } from "@/lib/exercise-progress";
import { readInterviewAttempts } from "@/lib/interview/attempts";
import { calculateProgress, type ProgressSnapshot } from "@/lib/progress";
import {
  clearLearningProgress,
  DEFAULT_LEARNER_PROFILE,
  type LearnerProfile,
  readLearnerProfile,
  resetAllLearnerData,
  saveLearnerProfile,
} from "@/lib/settings";

import styles from "./settings-panel.module.css";

type SettingsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; profile: LearnerProfile; progress: ProgressSnapshot };

type PendingReset = "progress" | "all" | null;

const settingsSections = [
  "Profile",
  "Preferences",
  "Privacy",
  "Resume & Data",
  "Permissions",
  "About",
];

export function SettingsPanel() {
  const [state, setState] = useState<SettingsState>({ status: "loading" });
  const [name, setName] = useState(DEFAULT_LEARNER_PROFILE.name);
  const [focus, setFocus] = useState(DEFAULT_LEARNER_PROFILE.focus);
  const [formError, setFormError] = useState("");
  const [pendingReset, setPendingReset] = useState<PendingReset>(null);
  const [announcement, setAnnouncement] = useState("");

  const load = useCallback(() => {
    try {
      const profile = readLearnerProfile(window.localStorage);
      const progress = calculateProgress({
        courseProgress: readCourseProgress(window.localStorage),
        exerciseProgress: readExerciseProgress(window.localStorage),
        attempts: readInterviewAttempts(window.localStorage).attempts,
      });
      setName(profile.name);
      setFocus(profile.focus);
      setState({ status: "ready", profile, progress });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Settings could not be loaded.",
      });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  const saveProfile = () => {
    try {
      const profile = saveLearnerProfile(window.localStorage, { name, focus });
      setFormError("");
      setState((current) =>
        current.status === "ready" ? { ...current, profile } : current,
      );
      setAnnouncement("Learner profile saved on this device.");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Learner profile could not be saved.",
      );
    }
  };

  const confirmReset = () => {
    if (!pendingReset) return;
    try {
      if (pendingReset === "all") {
        resetAllLearnerData(window.localStorage);
        setName(DEFAULT_LEARNER_PROFILE.name);
        setFocus(DEFAULT_LEARNER_PROFILE.focus);
      } else {
        clearLearningProgress(window.localStorage);
      }
      const message =
        pendingReset === "all"
          ? "All local learner data was reset."
          : "Learning progress was cleared. Your profile was preserved.";
      setPendingReset(null);
      load();
      setAnnouncement(message);
    } catch {
      setPendingReset(null);
      setState({ status: "error", message: "Browser storage could not be updated." });
    }
  };

  if (state.status === "loading") {
    return (
      <div className={styles.loading} role="status">
        Loading local settings…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className={styles.error} role="alert">
        <h2>Settings unavailable</h2>
        <p>{state.message}</p>
        <PixelButton onClick={load}>Retry settings</PixelButton>
      </div>
    );
  }

  const levelPercent = Math.round(
    (state.progress.xpIntoLevel / state.progress.xpPerLevel) * 100,
  );

  return (
    <div className={styles.settingsLayout}>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <nav className={styles.settingsNav} aria-label="Settings sections">
        {settingsSections.map((section, index) =>
          index === 0 ? (
            <span key={section} aria-current="page">
              {section}
            </span>
          ) : (
            <span key={section} aria-disabled="true">
              {section}
              <small>Coming soon</small>
            </span>
          ),
        )}
      </nav>

      <section className={styles.profilePanel} aria-labelledby="profile-heading">
        <header className={styles.panelTitle}>
          <h2 id="profile-heading">Profile</h2>
          <span>Saved on this device</span>
        </header>

        <div className={styles.profileGrid}>
          <div className={styles.avatarColumn}>
            <CharacterPortrait variant="student" name={state.profile.name} compact />
            <strong>LV. {String(state.progress.level).padStart(2, "0")}</strong>
          </div>

          <form
            className={styles.profileForm}
            onSubmit={(event) => {
              event.preventDefault();
              saveProfile();
            }}
          >
            <label htmlFor="learner-name">Name</label>
            <input
              id="learner-name"
              value={name}
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(formError)}
            />
            <label htmlFor="learner-focus">Focus</label>
            <input
              id="learner-focus"
              value={focus}
              maxLength={80}
              onChange={(event) => setFocus(event.target.value)}
              aria-invalid={Boolean(formError)}
            />
            {formError ? <p className={styles.formError}>{formError}</p> : null}
            <PixelButton type="submit">Save Profile</PixelButton>
          </form>
        </div>

        <section className={styles.xpPanel} aria-labelledby="xp-heading">
          <div>
            <h3 id="xp-heading">Activity XP</h3>
            <span>{state.progress.xp} total XP</span>
          </div>
          <div
            className={styles.xpTrack}
            role="progressbar"
            aria-label="XP progress to next level"
            aria-valuemin={0}
            aria-valuemax={state.progress.xpPerLevel}
            aria-valuenow={state.progress.xpIntoLevel}
          >
            <span style={{ width: `${levelPercent}%` }} />
          </div>
          <p>
            {state.progress.xpIntoLevel} / {state.progress.xpPerLevel} XP to level{" "}
            {state.progress.level + 1}
          </p>
        </section>

        <section
          className={styles.academyPreferences}
          aria-labelledby="academy-setup-heading"
        >
          <header>
            <h3 id="academy-setup-heading">Academy Setup</h3>
            <span>Current experience</span>
          </header>
          <div>
            <article>
              <span aria-hidden="true">✦</span>
              <div>
                <strong>Theme</strong>
                <p>Midnight Pixel Academy</p>
              </div>
            </article>
            <article>
              <span aria-hidden="true">⌨</span>
              <div>
                <strong>Accessibility</strong>
                <p>Keyboard, touch, readable text, and reduced motion supported.</p>
              </div>
            </article>
            <article>
              <span aria-hidden="true">▣</span>
              <div>
                <strong>Privacy</strong>
                <p>Profile and learning activity are stored on this device.</p>
              </div>
            </article>
          </div>
        </section>

        <div className={styles.dangerActions}>
          <button type="button" onClick={() => setPendingReset("progress")}>
            Clear Progress
          </button>
          <button type="button" onClick={() => setPendingReset("all")}>
            Reset All Data
          </button>
        </div>
      </section>

      {pendingReset ? (
        <section
          className={styles.confirmDialog}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="reset-heading"
        >
          <h2 id="reset-heading">
            {pendingReset === "all"
              ? "Reset all local data?"
              : "Clear learning progress?"}
          </h2>
          <p>
            {pendingReset === "all"
              ? "This removes the learner profile, completed lessons, exercises, and interview attempts from this browser."
              : "This removes completed lessons, exercises, and interview attempts but keeps the learner profile."}
          </p>
          <div>
            <button type="button" onClick={() => setPendingReset(null)}>
              Cancel
            </button>
            <button type="button" onClick={confirmReset}>
              {pendingReset === "all"
                ? "Confirm Reset All Data"
                : "Confirm Clear Progress"}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
