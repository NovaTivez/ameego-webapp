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

  it("renders the compact module menu and links the published STAR lesson", async () => {
    render(<CourseOverview course={interviewFoundationsCourse} />);

    expect(
      screen.getByRole("heading", { name: "Interview Skills Course" }),
    ).toBeVisible();
    expect(await screen.findByText("Preparing for Interviews")).toBeVisible();
    expect(screen.getByText("Answering Clearly")).toBeVisible();
    expect(screen.getByText("Interview Delivery")).toBeVisible();
    expect(screen.getAllByText("Coming Soon")).toHaveLength(3);
    expect(screen.getByText("0/1")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /open star method lesson/i }),
    ).toHaveAttribute("href", "/learn/star-method");
    expect(
      screen.getByRole("progressbar", { name: /interview foundations progress/i }),
    ).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("img", { name: /ari, academy learner/i })).toBeVisible();
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
