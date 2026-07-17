import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CourseOverview } from "@/components/CourseOverview";
import {
  COURSE_COMPLETION_BONUS_XP,
  interviewAcademyLessons,
  interviewAcademyPhases,
  interviewFoundationsCourse,
  type Course,
} from "@/content/interview-foundations";
import { COURSE_PROGRESS_STORAGE_KEY } from "@/lib/course-progress";

describe("CourseOverview", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the complete Interview Skills Academy dashboard and lesson cards", async () => {
    render(<CourseOverview course={interviewFoundationsCourse} />);

    expect(
      screen.getByRole("heading", { name: "Interview Skills Academy" }),
    ).toBeVisible();
    expect(await screen.findByText("Preparing for Interviews")).toBeVisible();
    expect(screen.getByText("Answering Clearly")).toBeVisible();
    expect(screen.getByText("STAR Method")).toBeVisible();
    expect(screen.getByText("Interview Delivery")).toBeVisible();
    expect(screen.getByText("0 / 17")).toBeVisible();
    expect(screen.getByText("0 XP")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: /interview foundations progress/i }),
    ).toHaveAttribute("aria-valuenow", "0");

    expect(
      screen.getByRole("link", { name: /open research the company lesson/i }),
    ).toHaveAttribute("href", "/learn/academy/research-company");
    expect(
      screen.getByLabelText(/understand the job role lesson locked/i),
    ).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByLabelText(/speaking clearly lesson locked/i)).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getAllByText("Beginner").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Locked").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Research Rookie").length).toBeGreaterThan(0);
    expect(screen.getByText("Interview Master")).toBeVisible();
  });

  it("reflects saved completion and unlocks the next dedicated lesson", async () => {
    window.localStorage.setItem(
      COURSE_PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        completedLessonIds: ["interview-foundations.research-company"],
      }),
    );
    render(<CourseOverview course={interviewFoundationsCourse} />);

    expect(await screen.findByText("1 / 17")).toBeVisible();
    expect(screen.getByText("50 XP")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /open understand the job role lesson/i }),
    ).toHaveAttribute("href", "/learn/academy/understand-role");
    expect(
      screen.getByRole("link", { name: /review research the company lesson/i }),
    ).toBeVisible();
  });

  it("unlocks the published STAR lesson without changing its route", async () => {
    const completedLessonIds = interviewAcademyPhases
      .slice(0, 2)
      .flatMap((phase) => phase.lessons.map((lesson) => lesson.id));
    window.localStorage.setItem(
      COURSE_PROGRESS_STORAGE_KEY,
      JSON.stringify({ version: 1, completedLessonIds }),
    );

    render(<CourseOverview course={interviewFoundationsCourse} />);

    expect(
      await screen.findByRole("link", { name: /open star introduction lesson/i }),
    ).toHaveAttribute("href", "/learn/star-method");
  });

  it("shows the final badge and graduation interview action at 100 percent", async () => {
    const completedLessonIds = interviewAcademyLessons.map((lesson) => lesson.id);
    const lessonXp = interviewAcademyLessons.reduce(
      (sum, lesson) => sum + lesson.xpReward,
      0,
    );
    window.localStorage.setItem(
      COURSE_PROGRESS_STORAGE_KEY,
      JSON.stringify({ version: 1, completedLessonIds }),
    );

    render(<CourseOverview course={interviewFoundationsCourse} />);

    expect(
      await screen.findByRole("progressbar", {
        name: /interview foundations progress/i,
      }),
    ).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByText(`${lessonXp + COURSE_COMPLETION_BONUS_XP} XP`)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /interview master badge unlocked/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /start graduation interview/i }),
    ).toHaveAttribute("href", "/practice");
  });

  it("shows an empty state when a course has no published lesson", async () => {
    const emptyCourse: Course = {
      ...interviewFoundationsCourse,
      featuredLessonId: "",
      lessons: [],
    };

    render(<CourseOverview course={emptyCourse} />);

    expect(await screen.findByText(/no lessons are available yet/i)).toBeVisible();
  });

  it("shows a recoverable error when browser storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });

    render(<CourseOverview course={interviewFoundationsCourse} />);

    const alert = await screen.findByRole("alert");
    expect(
      within(alert).getByText(/saved lesson status could not be loaded/i),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /retry progress check/i })).toBeVisible();
  });
});
