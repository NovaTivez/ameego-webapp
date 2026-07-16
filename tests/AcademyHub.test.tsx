import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AcademyHubPage from "@/app/academy/page";

describe("Academy Hub", () => {
  it("renders the compact academy HUD and all campus locations", () => {
    render(<AcademyHubPage />);

    expect(screen.getByRole("heading", { name: "Ameego Academy" })).toBeVisible();
    expect(screen.getByLabelText("Academy player status")).toHaveTextContent("XP0000");
    expect(screen.getByLabelText("Academy player status")).toHaveTextContent("LV01");
    expect(screen.getByText("Main Building")).toBeVisible();
    expect(screen.getByText("Interview Center")).toBeVisible();
    expect(screen.getByText("Speech Hall")).toBeVisible();
    expect(screen.getByText("Progress Library")).toBeVisible();
    expect(screen.getAllByText("Courses")).toHaveLength(2);
    expect(screen.getAllByText("Coming Soon")).toHaveLength(1);
  });

  it("connects every available map destination to its real route", () => {
    render(<AcademyHubPage />);

    expect(
      screen.getByRole("link", { name: "Open Main Building, Academy home" }),
    ).toHaveAttribute("href", "/academy");
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

    const shortcuts = screen.getByRole("navigation", { name: "Academy shortcuts" });
    expect(within(shortcuts).getByRole("link", { name: "Courses" })).toHaveAttribute(
      "href",
      "/learn",
    );
    expect(within(shortcuts).getByRole("link", { name: "Progress" })).toHaveAttribute(
      "href",
      "/progress",
    );
    expect(within(shortcuts).getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
  });

  it("uses the uploaded Academy artwork with the correct paths and alt text", () => {
    render(<AcademyHubPage />);

    const assets = [
      ["/images/academy/campus-map-v2.png", ""],
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

  it("keeps Speech Hall locked without navigation or a dialog", () => {
    render(<AcademyHubPage />);

    expect(
      screen.getByRole("button", { name: "Speech Hall, locked, coming soon" }),
    ).toBeDisabled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
