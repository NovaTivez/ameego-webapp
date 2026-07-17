import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { AcademyLesson } from "@/components/AcademyLesson";
import {
  interviewAcademyLessons,
  interviewAcademyPhases,
} from "@/content/interview-foundations";
import { COURSE_PROGRESS_STORAGE_KEY } from "@/lib/course-progress";

function saveCompleted(ids: string[]) {
  window.localStorage.setItem(
    COURSE_PROGRESS_STORAGE_KEY,
    JSON.stringify({ version: 1, completedLessonIds: ids }),
  );
}

describe("AcademyLesson", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("completes the first dedicated exercise and unlocks the next lesson", async () => {
    const user = userEvent.setup();
    const phase = interviewAcademyPhases[0];
    const lesson = phase.lessons[0];
    render(<AcademyLesson lesson={lesson} phase={phase} lessonNumber={1} />);

    expect(await screen.findByRole("heading", { name: lesson.title })).toBeVisible();
    expect(screen.getByText(lesson.objective)).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: /course lesson progress/i }),
    ).toHaveAttribute("aria-valuenow", "0");

    const responses = screen.getAllByRole("textbox");
    for (const response of responses) {
      await user.type(response, "A specific evidence-based interview answer.");
    }

    const finish = screen.getByRole("button", { name: /finish lesson · \+50 xp/i });
    expect(finish).toBeEnabled();
    await user.click(finish);

    expect(screen.getByRole("heading", { name: /next quest unlocked/i })).toBeVisible();
    expect(
      screen.getByRole("link", { name: /continue to next lesson/i }),
    ).toHaveAttribute("href", "/learn/academy/understand-role");
    expect(window.localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY)).toContain(lesson.id);
  });

  it("blocks a dedicated lesson until every previous lesson is complete", async () => {
    const phase = interviewAcademyPhases[0];
    const lesson = phase.lessons[1];
    render(<AcademyLesson lesson={lesson} phase={phase} lessonNumber={2} />);

    expect(await screen.findByText("Lesson Locked")).toBeVisible();
    expect(screen.getByRole("heading", { name: lesson.title })).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: /interactive exercise/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /return to learning path/i }),
    ).toHaveAttribute("href", "/learn");
  });

  it("awards the phase badge when the final preparation lesson is completed", async () => {
    const user = userEvent.setup();
    const phase = interviewAcademyPhases[0];
    const lesson = phase.lessons[3];
    saveCompleted(phase.lessons.slice(0, 3).map((item) => item.id));
    render(<AcademyLesson lesson={lesson} phase={phase} lessonNumber={4} />);

    const checks = await screen.findAllByRole("checkbox");
    for (const check of checks) await user.click(check);
    await user.click(screen.getByRole("button", { name: /finish lesson · \+50 xp/i }));

    expect(screen.getByText(/research rookie badge earned/i)).toBeVisible();
    expect(
      screen.getByRole("link", { name: /continue to next lesson/i }),
    ).toHaveAttribute("href", "/learn/academy/speaking-clearly");
  });

  it("keeps the preparation checklist locked until its two-minute challenge starts", async () => {
    const user = userEvent.setup();
    const phase = interviewAcademyPhases[0];
    const lesson = phase.lessons[2];
    saveCompleted(phase.lessons.slice(0, 2).map((item) => item.id));
    render(<AcademyLesson lesson={lesson} phase={phase} lessonNumber={3} />);

    const checks = await screen.findAllByRole("checkbox");
    expect(checks.every((check) => check.hasAttribute("disabled"))).toBe(true);
    await user.click(screen.getByRole("button", { name: /start challenge/i }));
    expect(checks.every((check) => !check.hasAttribute("disabled"))).toBe(true);
    expect(screen.getByText("02:00")).toBeVisible();
  });

  it("provides a typed fallback for speaking exercises and links AI evaluation honestly", async () => {
    const user = userEvent.setup();
    const phase = interviewAcademyPhases[1];
    const lesson = phase.lessons[1];
    const lessonIndex = interviewAcademyLessons.findIndex(
      (item) => item.id === lesson.id,
    );
    saveCompleted(interviewAcademyLessons.slice(0, lessonIndex).map((item) => item.id));
    render(<AcademyLesson lesson={lesson} phase={phase} lessonNumber={2} />);

    const response = await screen.findByRole("textbox", {
      name: /transcript or typed response/i,
    });
    await user.type(
      response,
      "I am a recent graduate who builds accessible projects and learns quickly from feedback.",
    );

    expect(screen.getByText(/neutral practice indicators/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /finish lesson · \+75 xp/i }),
    ).toBeEnabled();
  });

  it("awards the Interview Master badge and completion bonus after the final lesson", async () => {
    const user = userEvent.setup();
    const phase = interviewAcademyPhases[3];
    const lesson = phase.lessons[3];
    saveCompleted(interviewAcademyLessons.slice(0, -1).map((item) => item.id));
    render(<AcademyLesson lesson={lesson} phase={phase} lessonNumber={4} />);

    const responses = await screen.findAllByRole("textbox");
    for (const response of responses) {
      await user.type(
        response,
        "Thank you for your time. What does success look like in this role?",
      );
    }
    await user.click(screen.getByRole("button", { name: /finish lesson · \+100 xp/i }));

    expect(screen.getByRole("heading", { name: "Interview Master" })).toBeVisible();
    expect(screen.getByText(/\+500 bonus xp/i)).toBeVisible();
    expect(
      screen.getByRole("link", { name: /start graduation interview/i }),
    ).toHaveAttribute("href", "/practice");
  });
});
