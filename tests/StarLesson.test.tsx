import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { CourseOverview } from "@/components/CourseOverview";
import { StarLesson } from "@/components/StarLesson";
import {
  interviewFoundationsCourse,
  starMethodLesson,
} from "@/content/interview-foundations";
import { COURSE_PROGRESS_STORAGE_KEY } from "@/lib/course-progress";

describe("StarLesson", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("contains the complete concise STAR lesson content", async () => {
    render(<StarLesson lesson={starMethodLesson} />);

    expect(screen.getByRole("heading", { name: "STAR Method", level: 1 })).toBeVisible();
    expect(screen.getByText("Lesson 2.1")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Objectives" })).toBeVisible();
    expect(screen.getByText(starMethodLesson.summary)).toBeVisible();
    expect(screen.getByText("STAR answer framework")).toBeVisible();
    expect(screen.getByRole("link", { name: /continue lesson/i })).toHaveAttribute(
      "href",
      "#lesson-content",
    );
    expect(screen.getByText("8 minutes")).toBeVisible();
    for (const step of ["Situation", "Task", "Action", "Result"]) {
      expect(screen.getByRole("heading", { name: step })).toBeVisible();
    }
    expect(screen.getByText("Weak response")).toBeVisible();
    expect(screen.getByText("Strong response")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /why is the strong response better/i }),
    ).toBeVisible();
    expect(
      await screen.findByRole("link", { name: /continue to star exercise/i }),
    ).toHaveAttribute("href", "/learn/star-method/exercise");
  });

  it("persists completion and exposes it on the course page", async () => {
    const user = userEvent.setup();
    const lessonView = render(<StarLesson lesson={starMethodLesson} />);
    const completionButton = await screen.findByRole("button", {
      name: /mark lesson complete/i,
    });

    completionButton.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByText("Lesson completed")).toBeVisible();
    expect(window.localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY)).toContain(
      starMethodLesson.id,
    );

    lessonView.unmount();
    render(<CourseOverview course={interviewFoundationsCourse} />);

    expect(
      await screen.findByRole("progressbar", {
        name: /interview foundations progress/i,
      }),
    ).toHaveAttribute("aria-valuenow", "6");
    expect(screen.getByText("1 / 17")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /review star introduction lesson/i }),
    ).toHaveAttribute("href", "/learn/star-method");
  });
});
