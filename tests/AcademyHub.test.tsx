import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import AcademyHubPage from "@/app/academy/page";

describe("Academy Hub", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders the compact academy HUD and all campus locations", () => {
    render(<AcademyHubPage />);

    expect(screen.getByRole("heading", { name: "Ameego Academy" })).toBeVisible();
    expect(screen.getByRole("link", { name: /return to landing page/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("button", { name: /back to previous page/i })).toBeVisible();
    expect(screen.getByLabelText("Academy player status")).toHaveTextContent("XP0000");
    expect(screen.getByLabelText("Academy player status")).toHaveTextContent("LV01");
    const controls = screen.getByLabelText("Academy campus controls");
    expect(controls).toContainElement(screen.getByLabelText("Academy player status"));
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

  it("connects every available map destination to its real route", () => {
    render(<AcademyHubPage />);

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

  it("uses the uploaded Academy artwork with the correct paths and alt text", () => {
    render(<AcademyHubPage />);

    const assets = [
      ["/images/academy/campus-map-v3.png", ""],
      ["/images/academy/main-building-v2.png", "Main Building"],
      ["/images/academy/interview-center-v2.png", "Interview Center building"],
      ["/images/academy/speech-hall-v2.png", "Speech Hall building"],
      ["/images/academy/progress-library-v2.png", "Progress Library building"],
      ["/images/academy/courses-building-v2.png", "Courses Building"],
      [
        "/images/academy/academy-owl-guide.png",
        "Academy owl guide saying One step today, confident tomorrow",
      ],
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
