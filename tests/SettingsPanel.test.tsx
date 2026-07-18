import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { SettingsPanel } from "@/components/SettingsPanel";
import { completeLesson, COURSE_PROGRESS_STORAGE_KEY } from "@/lib/course-progress";
import {
  EXERCISE_PROGRESS_STORAGE_KEY,
  recordExerciseAttempt,
} from "@/lib/exercise-progress";
import {
  INTERVIEW_ATTEMPTS_STORAGE_KEY,
  saveCompletedAttempt,
} from "@/lib/interview/attempts";
import {
  createLearnerDataExport,
  LEARNER_PROFILE_STORAGE_KEY,
  readLearnerProfile,
} from "@/lib/settings";
import { starMethodLesson } from "@/content/interview-foundations";
import { starArrangementExercise } from "@/content/star-arrangement-exercise";
import { makeProgressAttempt } from "./progressFixtures";

function seedProgress() {
  completeLesson(window.localStorage, starMethodLesson.id);
  recordExerciseAttempt(window.localStorage, starArrangementExercise.id, true);
  saveCompletedAttempt(
    window.localStorage,
    makeProgressAttempt({
      id: "settings-attempt",
      completedAt: "2026-07-16T01:00:00.000Z",
      evaluated: false,
    }),
  );
}

describe("SettingsPanel", () => {
  beforeEach(() => window.localStorage.clear());

  it("shows default profile fields and real zero activity XP", async () => {
    render(<SettingsPanel />);

    expect(await screen.findByRole("heading", { name: "Profile" })).toBeVisible();
    expect(screen.getByLabelText("Name")).toHaveValue("Pixel Learner");
    expect(screen.getByLabelText("Focus")).toHaveValue("Interview Skills");
    expect(screen.getByText("LV. 01")).toBeVisible();
    expect(screen.getByRole("progressbar", { name: /XP progress/i })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("saves the learner name and focus on this device", async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);
    await screen.findByRole("heading", { name: "Profile" });

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Hannah Learner");
    await user.clear(screen.getByLabelText("Focus"));
    await user.type(screen.getByLabelText("Focus"), "Behavioral Interviews");
    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(readLearnerProfile(window.localStorage)).toMatchObject({
      name: "Hannah Learner",
      focus: "Behavioral Interviews",
    });
  });

  it("persists a selected pixel avatar with the existing learner profile", async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);
    await screen.findByRole("heading", { name: "Profile" });

    await user.click(screen.getByRole("button", { name: "Choose Pixel Avatar" }));
    await user.click(screen.getByRole("button", { name: "Use Explorer pixel avatar" }));
    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(readLearnerProfile(window.localStorage).avatar).toEqual({
      kind: "preset",
      preset: "explorer",
    });
  });

  it("accepts a local image as a profile picture draft and saves it", async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);
    await screen.findByRole("heading", { name: "Profile" });

    const upload = screen.getByLabelText("Change Profile Picture");
    await user.upload(
      upload,
      new File([new Uint8Array([137, 80, 78, 71])], "avatar.png", {
        type: "image/png",
      }),
    );
    expect(await screen.findByRole("img", { name: /profile avatar/i })).toBeVisible();
    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(readLearnerProfile(window.localStorage).avatar).toMatchObject({
      kind: "upload",
      dataUrl: expect.stringMatching(/^data:image\/png;base64,/),
    });
  });

  it("exposes complete settings sections without work-in-progress placeholders", async () => {
    render(<SettingsPanel />);
    await screen.findByRole("heading", { name: "Profile" });

    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "#privacy-settings",
    );
    expect(screen.getByRole("link", { name: "Academy Progress" })).toHaveAttribute(
      "href",
      "#progress-settings",
    );
    expect(screen.getByRole("link", { name: "Accessibility" })).toHaveAttribute(
      "href",
      "#accessibility-settings",
    );
    expect(screen.getByRole("heading", { name: "Resume & Learning Data" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Permissions" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Export Data" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Check Device Permissions" }),
    ).toBeEnabled();
  });

  it("marks the selected sidebar category as active", async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);
    await screen.findByRole("heading", { name: "Profile" });

    const audioLink = screen.getByRole("link", { name: "Audio" });
    await user.click(audioLink);

    expect(audioLink).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Profile" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("creates a portable local-data export without storing original resume files", () => {
    seedProgress();
    window.localStorage.setItem(
      LEARNER_PROFILE_STORAGE_KEY,
      JSON.stringify({ version: 1, name: "Saved Learner", focus: "STAR Practice" }),
    );

    expect(
      createLearnerDataExport(window.localStorage, "2026-07-18T00:00:00.000Z"),
    ).toMatchObject({
      format: "ameego-local-data",
      version: 1,
      exportedAt: "2026-07-18T00:00:00.000Z",
      data: {
        profile: { name: "Saved Learner" },
        interviewAttempts: { attempts: expect.any(Array) },
      },
    });
  });

  it("clears learning records while preserving the saved profile", async () => {
    const user = userEvent.setup();
    seedProgress();
    window.localStorage.setItem(
      LEARNER_PROFILE_STORAGE_KEY,
      JSON.stringify({ version: 1, name: "Saved Learner", focus: "STAR Practice" }),
    );
    render(<SettingsPanel />);
    await screen.findByRole("heading", { name: "Profile" });

    await user.click(screen.getByRole("button", { name: "Clear Progress" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      /keeps the learner profile/i,
    );
    await user.click(screen.getByRole("button", { name: /confirm clear progress/i }));

    expect(window.localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(EXERCISE_PROGRESS_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toBeNull();
    expect(readLearnerProfile(window.localStorage).name).toBe("Saved Learner");
  });

  it("resets progress and profile only after confirmation", async () => {
    const user = userEvent.setup();
    seedProgress();
    window.localStorage.setItem(
      LEARNER_PROFILE_STORAGE_KEY,
      JSON.stringify({ version: 1, name: "Saved Learner", focus: "STAR Practice" }),
    );
    render(<SettingsPanel />);
    await screen.findByRole("heading", { name: "Profile" });

    await user.click(screen.getByRole("button", { name: "Reset All Data" }));
    await user.click(screen.getByRole("button", { name: /confirm reset all data/i }));

    expect(window.localStorage.getItem(LEARNER_PROFILE_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toBeNull();
    expect(await screen.findByLabelText("Name")).toHaveValue("Pixel Learner");
    expect(screen.getByText("LV. 01")).toBeVisible();
  });
});
