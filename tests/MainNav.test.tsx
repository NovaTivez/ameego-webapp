import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MainNav } from "@/components/MainNav";
import { interviewAcademyLessons } from "@/content/interview-foundations";
import { completeLesson } from "@/lib/course-progress";

const navigation = vi.hoisted(() => ({ pathname: "/practice" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("@/components/ExperienceControls", () => ({
  ExperienceControls: () => (
    <div aria-label="Audio and connection controls">
      <button type="button">Music</button>
      <span role="status" aria-label="Online">
        Online
      </span>
    </div>
  ),
}));

describe("MainNav", () => {
  beforeEach(() => {
    navigation.pathname = "/practice";
    window.localStorage.clear();
  });

  it("provides every core route", () => {
    render(<MainNav />);

    expect(screen.getByRole("navigation", { name: /main navigation/i })).toBeVisible();
    expect(screen.getByRole("link", { name: "Academy" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute("href", "/learn");
    expect(screen.getByRole("link", { name: "Interview Center" })).toHaveAttribute(
      "href",
      "/practice",
    );
    expect(screen.getByRole("link", { name: "Progress Library" })).toHaveAttribute(
      "href",
      "/progress",
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
  });

  it("marks the current route for assistive technology", () => {
    render(<MainNav />);

    expect(screen.getByRole("link", { name: "Interview Center" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders consistent landing, history, XP, and level controls", () => {
    render(<MainNav />);

    expect(screen.getByRole("link", { name: /return to landing page/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("button", { name: /back to previous page/i })).toBeVisible();
    const status = screen.getByLabelText(/academy player status/i);
    expect(status).toHaveTextContent("XP0000");
    expect(status).toHaveTextContent("LV01");
  });

  it("updates XP and level immediately when stored progress changes", () => {
    render(<MainNav />);

    act(() => {
      for (const lesson of interviewAcademyLessons) {
        completeLesson(window.localStorage, lesson.id);
      }
    });

    const earnedLessonXp = interviewAcademyLessons.reduce(
      (total, lesson) => total + lesson.xpReward,
      0,
    );
    const expectedXp = earnedLessonXp + 500;
    const status = screen.getByLabelText(/academy player status/i);
    expect(status).toHaveTextContent(`XP${String(expectedXp).padStart(4, "0")}`);
    expect(status).toHaveTextContent(
      `LV${String(Math.floor(expectedXp / 500) + 1).padStart(2, "0")}`,
    );
  });

  it("groups player, audio, connection, and Settings controls", () => {
    render(<MainNav />);

    const controls = screen.getByLabelText(/academy header controls/i);
    expect(controls).toContainElement(screen.getByLabelText(/academy player status/i));
    expect(controls).toContainElement(
      screen.getByLabelText(/audio and connection controls/i),
    );
    expect(screen.getByRole("link", { name: /open settings/i })).toHaveAttribute(
      "href",
      "/settings",
    );
  });

  it("keeps standalone experience controls on the fullscreen title route", () => {
    navigation.pathname = "/";
    render(<MainNav />);

    expect(screen.queryByLabelText(/academy header controls/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/audio and connection controls/i)).toBeVisible();
  });

  it("leaves campus experience controls to the campus header", () => {
    navigation.pathname = "/academy";
    render(<MainNav />);

    expect(screen.queryByLabelText(/academy header controls/i)).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/audio and connection controls/i),
    ).not.toBeInTheDocument();
  });

  it("marks the Academy section current from the Main Building dashboard", () => {
    navigation.pathname = "/academy/home";
    render(<MainNav />);

    expect(screen.getByRole("link", { name: "Academy" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("returns from Settings directly to the campus map", () => {
    navigation.pathname = "/settings";
    render(<MainNav />);

    expect(screen.getByRole("link", { name: /back to campus map/i })).toHaveAttribute(
      "href",
      "/academy",
    );
    expect(
      screen.queryByRole("button", { name: /back to previous page/i }),
    ).not.toBeInTheDocument();
  });

  it("returns through browser navigation history", () => {
    const historyBack = vi.spyOn(window.history, "back").mockImplementation(() => {});
    render(<MainNav />);

    fireEvent.click(screen.getByRole("button", { name: /back to previous page/i }));

    expect(historyBack).toHaveBeenCalledOnce();
  });
});
