import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AcademyHubPage from "@/app/academy/page";

describe("Academy Hub", () => {
  it("renders the compact academy HUD and all campus locations", () => {
    render(<AcademyHubPage />);

    expect(screen.getByRole("heading", { name: "Ameego Academy" })).toBeVisible();
    expect(screen.getByLabelText("Academy player status")).toHaveTextContent("XP0000");
    expect(screen.getByLabelText("Academy player status")).toHaveTextContent("LV01");
    expect(screen.getByText("Interview Center")).toBeVisible();
    expect(screen.getByText("Speech Hall")).toBeVisible();
    expect(screen.getByText("Progress Library")).toBeVisible();
    expect(screen.getByText("Courtyard")).toBeVisible();
    expect(screen.getAllByText("Coming Soon")).toHaveLength(1);
  });

  it("connects every available map destination to its real route", () => {
    render(<AcademyHubPage />);

    expect(screen.getByRole("link", { name: "Enter Interview Center" })).toHaveAttribute(
      "href",
      "/practice",
    );
    expect(screen.getByRole("link", { name: "Open Progress Library" })).toHaveAttribute(
      "href",
      "/progress",
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

  it("does not create fake destinations for unfinished locations", () => {
    render(<AcademyHubPage />);

    expect(screen.queryByRole("link", { name: /speech hall/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /courtyard/i })).not.toBeInTheDocument();
  });
});
