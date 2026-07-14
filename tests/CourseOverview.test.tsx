import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CourseOverview } from "@/components/CourseOverview";
import { interviewFoundationsCourse, type Course } from "@/content/interview-foundations";

describe("CourseOverview", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("links the Interview Foundations course to the featured STAR lesson", async () => {
    render(<CourseOverview course={interviewFoundationsCourse} />);

    expect(await screen.findByText("Available")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /open star method lesson/i }),
    ).toHaveAttribute("href", "/learn/star-method");
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

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /saved lesson status could not be loaded/i,
    );
    expect(screen.getByRole("button", { name: /retry progress check/i })).toBeVisible();
  });
});
