"use client";

import { useCallback, useEffect, useState } from "react";

import { CharacterPortrait } from "@/components/CharacterPortrait";
import { useAudioExperience } from "@/components/AudioExperienceProvider";
import { PixelButton } from "@/components/PixelButton";
import { readCourseProgress } from "@/lib/course-progress";
import { readExerciseProgress } from "@/lib/exercise-progress";
import { readInterviewAttempts } from "@/lib/interview/attempts";
import { calculateProgress, type ProgressSnapshot } from "@/lib/progress";
import {
  clearLearningProgress,
  createLearnerDataExport,
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

type PermissionStatus = "not-checked" | "granted" | "denied" | "prompt" | "unavailable";

type DevicePermissions = {
  microphone: PermissionStatus;
  camera: PermissionStatus;
};

const defaultPermissions: DevicePermissions = {
  microphone: "not-checked",
  camera: "not-checked",
};

const permissionLabel: Record<PermissionStatus, string> = {
  "not-checked": "Not checked",
  granted: "Granted",
  denied: "Denied",
  prompt: "Ask when used",
  unavailable: "Unavailable",
};

const settingsSections = [
  ["Profile", "#profile-settings"],
  ["Audio", "#audio-settings"],
  ["Privacy", "#privacy-settings"],
  ["Resume & Data", "#data-settings"],
  ["Permissions", "#permission-settings"],
  ["About", "#about-settings"],
] as const;

export function SettingsPanel() {
  const { musicEnabled, setMusicEnabled, setSoundEffectsEnabled, soundEffectsEnabled } =
    useAudioExperience();
  const [state, setState] = useState<SettingsState>({ status: "loading" });
  const [name, setName] = useState(DEFAULT_LEARNER_PROFILE.name);
  const [focus, setFocus] = useState(DEFAULT_LEARNER_PROFILE.focus);
  const [formError, setFormError] = useState("");
  const [pendingReset, setPendingReset] = useState<PendingReset>(null);
  const [announcement, setAnnouncement] = useState("");
  const [devicePermissions, setDevicePermissions] =
    useState<DevicePermissions>(defaultPermissions);
  const [permissionError, setPermissionError] = useState("");
  const [dataError, setDataError] = useState("");

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

  const checkDevicePermissions = async () => {
    setPermissionError("");
    if (!navigator.permissions?.query) {
      setDevicePermissions({ microphone: "unavailable", camera: "unavailable" });
      setPermissionError(
        "This browser cannot report permission status. You can still choose a response mode when practice begins.",
      );
      return;
    }

    try {
      const readPermission = async (name: "microphone" | "camera") => {
        const result = await navigator.permissions.query({
          name,
        } as PermissionDescriptor);
        return result.state as PermissionStatus;
      };
      const [microphone, camera] = await Promise.all([
        readPermission("microphone"),
        readPermission("camera"),
      ]);
      setDevicePermissions({ microphone, camera });
      setAnnouncement("Microphone and camera permission status checked.");
    } catch {
      setDevicePermissions({ microphone: "unavailable", camera: "unavailable" });
      setPermissionError(
        "Permission status could not be read. Your browser will ask when a feature needs access.",
      );
    }
  };

  const exportLearningData = () => {
    try {
      const content = JSON.stringify(
        createLearnerDataExport(window.localStorage),
        null,
        2,
      );
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ameego-learning-data.json";
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDataError("");
      setAnnouncement("A local learning-data export was prepared.");
    } catch {
      setDataError("Your browser could not prepare a local data export.");
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
        {settingsSections.map(([section, href]) => (
          <a key={section} href={href}>
            {section}
            <small>Open</small>
          </a>
        ))}
      </nav>

      <section
        className={styles.profilePanel}
        id="profile-settings"
        aria-labelledby="profile-heading"
      >
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

        <section
          className={styles.audioSettings}
          id="audio-settings"
          aria-labelledby="audio-settings-heading"
        >
          <header>
            <div>
              <h3 id="audio-settings-heading">Audio</h3>
              <p>Choose how the academy sounds on this device.</p>
            </div>
            <span>Saved automatically</span>
          </header>
          <div className={styles.audioToggleGrid}>
            <button
              type="button"
              role="switch"
              aria-checked={musicEnabled}
              onClick={() => setMusicEnabled(!musicEnabled)}
            >
              <span aria-hidden="true">♪</span>
              <div>
                <strong>Background Music</strong>
                <small>Pauses automatically during interview questions.</small>
              </div>
              <output>{musicEnabled ? "On" : "Off"}</output>
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={soundEffectsEnabled}
              onClick={() => setSoundEffectsEnabled(!soundEffectsEnabled)}
            >
              <span aria-hidden="true">◆</span>
              <div>
                <strong>Sound Effects</strong>
                <small>Hover, click, dialog, and completion sounds.</small>
              </div>
              <output>{soundEffectsEnabled ? "On" : "Off"}</output>
            </button>
          </div>
        </section>

        <section
          className={styles.settingSection}
          id="privacy-settings"
          aria-labelledby="privacy-settings-heading"
        >
          <header>
            <div>
              <h3 id="privacy-settings-heading">Privacy</h3>
              <p>Control and understand what stays in this browser.</p>
            </div>
            <span>Local first</span>
          </header>
          <div className={styles.infoGrid}>
            <article>
              <strong>Stored on this device</strong>
              <p>
                Profile, completion records, audio choices, saved attempts, transcripts,
                and feedback reports.
              </p>
            </article>
            <article>
              <strong>Resume handling</strong>
              <p>
                Original resume files are not stored. Confirmed resume summaries may be
                included in saved interview attempts.
              </p>
            </article>
            <article>
              <strong>When data leaves the device</strong>
              <p>
                Only an AI action you start can send its relevant practice data to the
                protected server route for that request.
              </p>
            </article>
          </div>
        </section>

        <section
          className={styles.settingSection}
          id="data-settings"
          aria-labelledby="data-settings-heading"
        >
          <header>
            <div>
              <h3 id="data-settings-heading">Resume &amp; Data</h3>
              <p>Keep a personal copy of the learning records saved in this browser.</p>
            </div>
            <span>JSON export</span>
          </header>
          <div className={styles.dataActions}>
            <div>
              <strong>Export local learning data</strong>
              <p>
                Downloads your profile, course and exercise progress, audio choices, and
                saved interview attempts. It may include transcripts and feedback.
              </p>
            </div>
            <PixelButton type="button" variant="secondary" onClick={exportLearningData}>
              Export Data
            </PixelButton>
          </div>
          {dataError ? <p className={styles.formError}>{dataError}</p> : null}
        </section>

        <section
          className={styles.settingSection}
          id="permission-settings"
          aria-labelledby="permission-settings-heading"
        >
          <header>
            <div>
              <h3 id="permission-settings-heading">Permissions</h3>
              <p>Check access before using microphone or optional camera practice.</p>
            </div>
            <span>No request made</span>
          </header>
          <div className={styles.permissionGrid}>
            <article>
              <strong>Microphone</strong>
              <output>{permissionLabel[devicePermissions.microphone]}</output>
              <p>Used only when you select microphone response mode.</p>
            </article>
            <article>
              <strong>Camera</strong>
              <output>{permissionLabel[devicePermissions.camera]}</output>
              <p>Optional local framing indicator; it is not part of scoring.</p>
            </article>
          </div>
          <div className={styles.permissionActions}>
            <PixelButton
              type="button"
              variant="secondary"
              onClick={() => void checkDevicePermissions()}
            >
              Check Device Permissions
            </PixelButton>
            <p>To change a denied choice, use your browser&apos;s site permissions.</p>
          </div>
          {permissionError ? <p className={styles.formError}>{permissionError}</p> : null}
        </section>

        <section
          className={styles.settingSection}
          id="about-settings"
          aria-labelledby="about-settings-heading"
        >
          <header>
            <div>
              <h3 id="about-settings-heading">About</h3>
              <p>
                Ameego is a practice-first learning space for clear professional
                communication.
              </p>
            </div>
            <span>Version 0.1.0</span>
          </header>
          <div className={styles.infoGrid}>
            <article>
              <strong>Learning loop</strong>
              <p>
                Learn a concept, practise it, review evidence-based feedback, then retry
                with a focused goal.
              </p>
            </article>
            <article>
              <strong>Accessible by default</strong>
              <p>
                Text response mode, keyboard interaction, transcript review, and optional
                device features keep practice flexible.
              </p>
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
