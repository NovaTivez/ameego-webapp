import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AcademyMap } from "@/components/AcademyMap";

describe("AcademyMap", () => {
  it("shows all required locations and honest states", () => {
    render(<AcademyMap />);

    expect(screen.getAllByText("Interview Center").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Speech Hall").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Progress Library").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Available").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Completed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Recommended").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Locked").length).toBeGreaterThan(0);
  });

  it("links only implemented destinations", () => {
    render(<AcademyMap />);

    expect(screen.getByRole("link", { name: /enter interview center/i })).toHaveAttribute(
      "href",
      "/practice",
    );
    expect(screen.getByRole("link", { name: /enter progress library/i })).toHaveAttribute(
      "href",
      "/progress",
    );
    expect(screen.queryByRole("link", { name: /speech hall/i })).not.toBeInTheDocument();
    expect(screen.getAllByText(/coming soon/i).length).toBeGreaterThan(0);
  });

  it("provides a keyboard-accessible menu that skips the locked location", async () => {
    const user = userEvent.setup();
    render(<AcademyMap />);
    const menu = screen.getByRole("navigation", { name: /academy menu/i });
    const interviewLink = within(menu).getByRole("link", {
      name: /interview center/i,
    });
    const progressLink = within(menu).getByRole("link", {
      name: /progress library/i,
    });

    interviewLink.focus();
    expect(interviewLink).toHaveFocus();
    await user.tab();
    expect(progressLink).toHaveFocus();
  });
});
