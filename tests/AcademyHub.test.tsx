import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AcademyHubPage from "@/app/academy/page";
import { starMethodLesson } from "@/content/interview-foundations";
import { completeLesson } from "@/lib/course-progress";
import { saveOnboardingPreferences } from "@/lib/onboarding";

const router = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

describe("Academy Hub", () => {
  beforeEach(() => {
    window.localStorage.clear();
    router.replace.mockReset();
    saveOnboardingPreferences(window.localStorage, {
      learningGoal: "interview_skills",
      experienceLevel: "new_to_practice",
      practiceMode: "text",
    });
  });

  it("renders the compact academy HUD and all campus locations", async () => {
    render(<AcademyHubPage />);

    expect(await screen.findByRole("heading", { name: "Ameego Academy" })).toBeVisible();
    const playerStatus = await screen.findByLabelText(
      "Academy player status: 0 experience points, level 1",
    );
    expect(playerStatus).toHaveTextContent("XP0");
    expect(playerStatus).toHaveTextContent("LV1");
    const controls = screen.getByLabelText("Academy campus controls");
    expect(controls).toContainElement(playerStatus);
    expect(controls).toContainElement(
      screen.getByLabelText("Audio and connection controls"),
    );
    expect(controls).toContainElement(screen.getByRole("link", { name: "Settings" }));
    expect(controls).toHaveTextContent(/Music|Muted/);
    expect(controls).toHaveTextContent("Online");
    expect(screen.getByText("Main Building")).toBeVisible();
    expect(screen.getByText("Interview Center")).toBeVisible();
    expect(screen.getByText("Speech Hall")).toBeVisible();
    expect(screen.getByText("Progress Library")).toBeVisible();
    expect(screen.getByText("Courses")).toBeVisible();
    expect(screen.getAllByText("Coming Soon")).toHaveLength(1);
  });

  it("uses the Progress Library calculation in the campus HUD", async () => {
    completeLesson(window.localStorage, starMethodLesson.id);
    render(<AcademyHubPage />);

    const playerStatus = await screen.findByLabelText(
      "Academy player status: 100 experience points, level 1",
    );
    expect(playerStatus).toHaveTextContent("XP100");
    expect(playerStatus).toHaveTextContent("LV1");
  });

  it("connects every available map destination to its real route", async () => {
    render(<AcademyHubPage />);

    await screen.findByRole("heading", { name: "Ameego Academy" });

    expect(
      screen.getByRole("link", { name: "Open Main Building, Academy home" }),
    ).toHaveAttribute("href", "/academy/home");
    expect(screen.getByRole("link", { name: "Enter Interview Center" })).toHaveAttribute(
      "href",
      "/practice",
    );
    const speechHall = screen.getByRole("button", {
      name: "Speech Hall, locked, coming soon",
    });
    expect(speechHall).toBeDisabled();
    expect(speechHall).toHaveAttribute("aria-disabled", "true");
    expect(speechHall).toHaveAttribute("title", "This feature is not yet available.");
    expect(screen.queryByRole("link", { name: /speech hall/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Progress Library" })).toHaveAttribute(
      "href",
      "/progress",
    );
    expect(screen.getByRole("link", { name: "Open Courses Building" })).toHaveAttribute(
      "href",
      "/learn",
    );

    const settings = screen.getByRole("link", { name: "Settings" });
    expect(settings).toHaveAttribute("href", "/settings");
    expect(settings).not.toHaveTextContent("Settings");
    expect(
      screen.queryByRole("navigation", { name: "Academy shortcuts" }),
    ).not.toBeInTheDocument();
  });

  it("uses the uploaded Academy artwork with the correct paths and alt text", async () => {
    render(<AcademyHubPage />);

    await screen.findByRole("heading", { name: "Ameego Academy" });

    const assets = [
      ["/images/academy/campus-map-v3.png", ""],
      ["/images/academy/main-building-v2.png", "Main Building"],
      ["/images/academy/interview-center-v2.png", "Interview Center building"],
      ["/images/academy/speech-hall-v2.png", "Speech Hall building"],
      ["/images/academy/progress-library-v2.png", "Progress Library building"],
      ["/images/academy/courses-building-v2.png", "Courses Building"],
    ];

    for (const [source, alt] of assets) {
      const image = document.querySelector(`img[src="${source}"]`);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("alt", alt);
    }
  });

  it("keeps Speech Hall locked without navigation or a dialog", async () => {
    render(<AcademyHubPage />);

    await screen.findByRole("heading", { name: "Ameego Academy" });

    expect(
      screen.getByRole("button", { name: "Speech Hall, locked, coming soon" }),
    ).toBeDisabled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
