"use client";

import Image from "next/image";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";

import { useAudioExperience } from "@/components/AudioExperienceProvider";
import { CharacterPortrait } from "@/components/CharacterPortrait";
import { PixelButton } from "@/components/PixelButton";
import { PixelIcon } from "@/components/PixelIcon";
import { readCourseProgress } from "@/lib/course-progress";
import { readExerciseProgress } from "@/lib/exercise-progress";
import { readInterviewAttempts } from "@/lib/interview/attempts";
import { calculateProgress, type ProgressSnapshot } from "@/lib/progress";
import {
  clearLearningProgress,
  createLearnerDataExport,
  DEFAULT_LEARNER_PROFILE,
  LEARNER_AVATAR_PRESETS,
  type LearnerAvatar,
  type LearnerAvatarPreset,
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
type DevicePermissions = { microphone: PermissionStatus; camera: PermissionStatus };

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
  { label: "Profile", id: "profile-settings", icon: "star" },
  { label: "Academy Progress", id: "progress-settings", icon: "progress" },
  { label: "Audio", id: "audio-settings", icon: "music" },
  { label: "Accessibility", id: "accessibility-settings", icon: "check" },
  { label: "Privacy", id: "privacy-settings", icon: "lock" },
  { label: "Resume & Learning Data", id: "data-settings", icon: "resume" },
  { label: "Permissions", id: "permission-settings", icon: "microphone" },
  { label: "About", id: "about-settings", icon: "academy" },
] as const;
const avatarPresetLabels: Record<LearnerAvatarPreset, string> = {
  scholar: "Scholar",
  explorer: "Explorer",
  diplomat: "Diplomat",
};

function SectionHeader({
  icon,
  eyebrow,
  title,
  headingId,
  status,
}: {
  icon: Parameters<typeof PixelIcon>[0]["name"];
  eyebrow: string;
  title: string;
  headingId: string;
  status: string;
}) {
  return (
    <header className={styles.sectionHeader}>
      <div className={styles.sectionHeading}>
        <span aria-hidden="true">
          <PixelIcon name={icon} />
        </span>
        <div>
          <p>{eyebrow}</p>
          <h2 id={headingId}>{title}</h2>
        </div>
      </div>
      <span className={styles.sectionStatus}>{status}</span>
    </header>
  );
}

export function SettingsPanel() {
  const { musicEnabled, setMusicEnabled, setSoundEffectsEnabled, soundEffectsEnabled } =
    useAudioExperience();
  const [state, setState] = useState<SettingsState>({ status: "loading" });
  const [name, setName] = useState(DEFAULT_LEARNER_PROFILE.name);
  const [focus, setFocus] = useState(DEFAULT_LEARNER_PROFILE.focus);
  const [avatar, setAvatar] = useState<LearnerAvatar>(DEFAULT_LEARNER_PROFILE.avatar);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [formError, setFormError] = useState("");
  const [pendingReset, setPendingReset] = useState<PendingReset>(null);
  const [announcement, setAnnouncement] = useState("");
  const [devicePermissions, setDevicePermissions] = useState(defaultPermissions);
  const [permissionError, setPermissionError] = useState("");
  const [dataError, setDataError] = useState("");
  const [activeSection, setActiveSection] = useState<string>(settingsSections[0].id);

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
      setAvatar(profile.avatar);
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

  useEffect(() => {
    if (state.status !== "ready" || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => left.boundingClientRect.top - right.boundingClientRect.top,
          );
        if (visible[0]?.target.id) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.2] },
    );
    for (const section of settingsSections) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [state.status]);

  const saveProfile = () => {
    try {
      const profile = saveLearnerProfile(window.localStorage, { name, focus, avatar });
      setFormError("");
      setAvatarError("");
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
        setAvatar(DEFAULT_LEARNER_PROFILE.avatar);
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
      const readPermission = async (permissionName: "microphone" | "camera") => {
        const result = await navigator.permissions.query({
          name: permissionName,
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

  const changeProfilePicture = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!(["image/png", "image/jpeg", "image/webp"] as string[]).includes(file.type)) {
      setAvatarError("Choose a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > 1_000_000) {
      setAvatarError("Choose an image smaller than 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setAvatarError("That image could not be read.");
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setAvatar({ kind: "upload", dataUrl: reader.result });
      setAvatarError("");
      setAvatarPickerOpen(false);
      setAnnouncement("New profile picture selected. Save your profile to keep it.");
    };
    reader.readAsDataURL(file);
  };

  if (state.status === "loading")
    return (
      <div className={styles.loading} role="status">
        Loading local settings…
      </div>
    );
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
        <div className={styles.navHeading}>
          <PixelIcon name="settings" size="small" />
          <span>Settings Menu</span>
        </div>
        {settingsSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={activeSection === section.id ? "location" : undefined}
            onClick={() => setActiveSection(section.id)}
          >
            <span className={styles.navIcon} aria-hidden="true">
              <PixelIcon name={section.icon} size="small" />
            </span>
            <span>{section.label}</span>
          </a>
        ))}
      </nav>

      <div className={styles.settingsContent}>
        <section
          className={`${styles.settingCard} ${styles.profilePanel}`}
          id="profile-settings"
          aria-labelledby="profile-heading"
        >
          <SectionHeader
            icon="star"
            eyebrow="Player identity"
            title="Profile"
            headingId="profile-heading"
            status="Saved on this device"
          />
          <div className={styles.profileGrid}>
            <div className={styles.avatarColumn}>
              <div
                className={`${styles.avatarFrame} ${
                  avatar.kind === "preset" ? styles[`avatarPreset${avatar.preset}`] : ""
                }`}
              >
                {avatar.kind === "upload" ? (
                  <Image
                    src={avatar.dataUrl}
                    alt={`${name || "Learner"} profile avatar`}
                    width={180}
                    height={180}
                    unoptimized
                  />
                ) : (
                  <CharacterPortrait variant="student" name={name || "Learner"} />
                )}
              </div>
              <div className={styles.avatarActions}>
                <label>
                  Change Profile Picture
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={changeProfilePicture}
                  />
                </label>
                <button
                  type="button"
                  aria-expanded={avatarPickerOpen}
                  aria-controls="pixel-avatar-picker"
                  onClick={() => setAvatarPickerOpen((open) => !open)}
                >
                  Choose Pixel Avatar
                </button>
              </div>
              {avatarPickerOpen ? (
                <div
                  id="pixel-avatar-picker"
                  className={styles.avatarPicker}
                  role="group"
                  aria-label="Choose pixel avatar"
                >
                  {LEARNER_AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={styles[`avatarPreset${preset}`]}
                      aria-label={`Use ${avatarPresetLabels[preset]} pixel avatar`}
                      aria-pressed={avatar.kind === "preset" && avatar.preset === preset}
                      onClick={() => {
                        setAvatar({ kind: "preset", preset });
                        setAvatarError("");
                        setAnnouncement(
                          `${avatarPresetLabels[preset]} pixel avatar selected. Save your profile to keep it.`,
                        );
                      }}
                    >
                      <CharacterPortrait
                        variant="student"
                        name={avatarPresetLabels[preset]}
                      />
                      <span>{avatarPresetLabels[preset]}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              {avatarError ? <p className={styles.formError}>{avatarError}</p> : null}
              <dl className={styles.profileIdentity}>
                <div>
                  <dt>Name</dt>
                  <dd>{name || "Pixel Learner"}</dd>
                </div>
                <div>
                  <dt>Level</dt>
                  <dd>LV. {String(state.progress.level).padStart(2, "0")}</dd>
                </div>
                <div>
                  <dt>Learning Focus</dt>
                  <dd>{focus || "Not set"}</dd>
                </div>
                <div>
                  <dt>Experience</dt>
                  <dd>{state.progress.xp} XP</dd>
                </div>
              </dl>
            </div>
            <form
              className={styles.profileForm}
              onSubmit={(event) => {
                event.preventDefault();
                saveProfile();
              }}
            >
              <div className={styles.formIntro}>
                <h3>Learner Details</h3>
                <p>Personalize how your name and current learning focus appear.</p>
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="learner-name">Name</label>
                <input
                  id="learner-name"
                  value={name}
                  maxLength={60}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={Boolean(formError)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="learner-focus">Focus</label>
                <input
                  id="learner-focus"
                  value={focus}
                  maxLength={80}
                  onChange={(event) => setFocus(event.target.value)}
                  aria-invalid={Boolean(formError)}
                />
              </div>
              {formError ? <p className={styles.formError}>{formError}</p> : null}
              <PixelButton type="submit">Save Profile</PixelButton>
            </form>
          </div>
        </section>

        <section
          className={styles.settingCard}
          id="progress-settings"
          aria-labelledby="progress-settings-heading"
        >
          <SectionHeader
            icon="progress"
            eyebrow="Current journey"
            title="Academy Progress"
            headingId="progress-settings-heading"
            status={`${state.progress.xp} total XP`}
          />
          <div className={styles.progressOverview}>
            <article className={styles.levelCard}>
              <span>Current Level</span>
              <strong>{String(state.progress.level).padStart(2, "0")}</strong>
              <p>Keep completing learning activities to advance.</p>
            </article>
            <div className={styles.xpPanel}>
              <div className={styles.xpLabels}>
                <div>
                  <h3>Level Progress</h3>
                  <p>
                    Level {state.progress.level} to {state.progress.level + 1}
                  </p>
                </div>
                <strong>{levelPercent}%</strong>
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
              <p className={styles.xpCaption}>
                {state.progress.xpIntoLevel} / {state.progress.xpPerLevel} XP earned
                toward the next level
              </p>
            </div>
          </div>
          <div className={styles.progressStats}>
            <article>
              <strong>{state.progress.completedLessons.length}</strong>
              <span>Lessons</span>
            </article>
            <article>
              <strong>{state.progress.completedExercises.length}</strong>
              <span>Exercises</span>
            </article>
            <article>
              <strong>{state.progress.simulationsCompleted}</strong>
              <span>Interviews</span>
            </article>
            <article>
              <strong>{state.progress.currentStreak}</strong>
              <span>Day streak</span>
            </article>
          </div>
        </section>

        <section
          className={styles.settingCard}
          id="audio-settings"
          aria-labelledby="audio-settings-heading"
        >
          <SectionHeader
            icon="music"
            eyebrow="Experience controls"
            title="Audio"
            headingId="audio-settings-heading"
            status="Saved automatically"
          />
          <div className={styles.audioToggleGrid}>
            <button
              type="button"
              role="switch"
              aria-checked={musicEnabled}
              onClick={() => setMusicEnabled(!musicEnabled)}
            >
              <span aria-hidden="true">
                <PixelIcon name="music" />
              </span>
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
              <span aria-hidden="true">
                <PixelIcon name="speech" />
              </span>
              <div>
                <strong>Sound Effects</strong>
                <small>Hover, click, dialog, and completion sounds.</small>
              </div>
              <output>{soundEffectsEnabled ? "On" : "Off"}</output>
            </button>
          </div>
        </section>

        <section
          className={styles.settingCard}
          id="accessibility-settings"
          aria-labelledby="accessibility-settings-heading"
        >
          <SectionHeader
            icon="check"
            eyebrow="Inclusive by design"
            title="Accessibility"
            headingId="accessibility-settings-heading"
            status="Built in"
          />
          <div className={styles.infoGrid}>
            <article>
              <span aria-hidden="true">
                <PixelIcon name="lesson" />
              </span>
              <div>
                <strong>Readable learning</strong>
                <p>
                  Body copy uses readable typography while pixel fonts identify headings
                  and controls.
                </p>
              </div>
            </article>
            <article>
              <span aria-hidden="true">
                <PixelIcon name="check" />
              </span>
              <div>
                <strong>Flexible controls</strong>
                <p>
                  Keyboard and touch interaction are supported throughout the Academy.
                </p>
              </div>
            </article>
            <article>
              <span aria-hidden="true">
                <PixelIcon name="speech" />
              </span>
              <div>
                <strong>Practice your way</strong>
                <p>
                  Text response, transcript review, and reduced motion support keep
                  practice flexible.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section
          className={styles.settingCard}
          id="privacy-settings"
          aria-labelledby="privacy-settings-heading"
        >
          <SectionHeader
            icon="lock"
            eyebrow="Your information"
            title="Privacy"
            headingId="privacy-settings-heading"
            status="Local first"
          />
          <div className={styles.infoGrid}>
            <article>
              <span aria-hidden="true">
                <PixelIcon name="home" />
              </span>
              <div>
                <strong>Stored on this device</strong>
                <p>
                  Profile, completion records, audio choices, saved attempts, transcripts,
                  and feedback reports.
                </p>
              </div>
            </article>
            <article>
              <span aria-hidden="true">
                <PixelIcon name="resume" />
              </span>
              <div>
                <strong>Resume handling</strong>
                <p>
                  Original resume files are not stored. Confirmed resume summaries may be
                  included in saved interview attempts.
                </p>
              </div>
            </article>
            <article>
              <span aria-hidden="true">
                <PixelIcon name="speech" />
              </span>
              <div>
                <strong>When data leaves the device</strong>
                <p>
                  Only an AI action you start can send its relevant practice data to the
                  protected server route for that request.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section
          className={styles.settingCard}
          id="data-settings"
          aria-labelledby="data-settings-heading"
        >
          <SectionHeader
            icon="resume"
            eyebrow="Ownership and controls"
            title="Resume & Learning Data"
            headingId="data-settings-heading"
            status="JSON export"
          />
          <div className={styles.dataGrid}>
            <article className={styles.dataActions}>
              <span aria-hidden="true">
                <PixelIcon name="resume" />
              </span>
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
            </article>
            <article className={styles.dangerZone}>
              <div>
                <strong>Local data controls</strong>
                <p>
                  Clear learning records only, or reset the complete local learner
                  profile.
                </p>
              </div>
              <div className={styles.dangerActions}>
                <button type="button" onClick={() => setPendingReset("progress")}>
                  Clear Progress
                </button>
                <button type="button" onClick={() => setPendingReset("all")}>
                  Reset All Data
                </button>
              </div>
            </article>
          </div>
          {dataError ? <p className={styles.formError}>{dataError}</p> : null}
        </section>

        <section
          className={styles.settingCard}
          id="permission-settings"
          aria-labelledby="permission-settings-heading"
        >
          <SectionHeader
            icon="microphone"
            eyebrow="Device access"
            title="Permissions"
            headingId="permission-settings-heading"
            status="No request made"
          />
          <div className={styles.permissionGrid}>
            <article>
              <span aria-hidden="true">
                <PixelIcon name="microphone" />
              </span>
              <div>
                <strong>Microphone</strong>
                <p>Used only when you select microphone response mode.</p>
              </div>
              <output>{permissionLabel[devicePermissions.microphone]}</output>
            </article>
            <article>
              <span aria-hidden="true">
                <PixelIcon name="camera" />
              </span>
              <div>
                <strong>Camera</strong>
                <p>Optional local framing indicator; it is not part of scoring.</p>
              </div>
              <output>{permissionLabel[devicePermissions.camera]}</output>
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
          className={styles.settingCard}
          id="about-settings"
          aria-labelledby="about-settings-heading"
        >
          <SectionHeader
            icon="academy"
            eyebrow="AMEEGO Academy"
            title="About"
            headingId="about-settings-heading"
            status="Version 0.1.0"
          />
          <p className={styles.aboutLead}>
            Ameego is a practice-first learning space for clear professional
            communication.
          </p>
          <div className={styles.infoGrid}>
            <article>
              <span aria-hidden="true">
                <PixelIcon name="progress" />
              </span>
              <div>
                <strong>Learning loop</strong>
                <p>
                  Learn a concept, practise it, review evidence-based feedback, then retry
                  with a focused goal.
                </p>
              </div>
            </article>
            <article>
              <span aria-hidden="true">
                <PixelIcon name="check" />
              </span>
              <div>
                <strong>Accessible by default</strong>
                <p>
                  Text response mode, keyboard interaction, transcript review, and
                  optional device features keep practice flexible.
                </p>
              </div>
            </article>
            <article>
              <span aria-hidden="true">
                <PixelIcon name="star" />
              </span>
              <div>
                <strong>Academy theme</strong>
                <p>
                  Midnight Pixel Academy keeps every learning route visually consistent.
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>

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
