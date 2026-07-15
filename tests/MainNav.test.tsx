import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MainNav } from "@/components/MainNav";

const navigation = vi.hoisted(() => ({ pathname: "/practice" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

describe("MainNav", () => {
  beforeEach(() => {
    navigation.pathname = "/practice";
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

  it("renders the consistent back, XP, and level HUD", () => {
    render(<MainNav />);

    expect(screen.getByRole("link", { name: /back to academy/i })).toHaveAttribute(
      "href",
      "/",
    );
    const status = screen.getByLabelText(/academy player status/i);
    expect(status).toHaveTextContent("XP0000");
    expect(status).toHaveTextContent("LV01");
  });

  it("returns from the Courses page to the Academy Hub", () => {
    navigation.pathname = "/learn";
    render(<MainNav />);

    expect(screen.getByRole("link", { name: /back to academy hub/i })).toHaveAttribute(
      "href",
      "/academy",
    );
  });

  it("returns from Settings to the Academy Hub", () => {
    navigation.pathname = "/settings";
    render(<MainNav />);

    expect(screen.getByRole("link", { name: /back to academy hub/i })).toHaveAttribute(
      "href",
      "/academy",
    );
  });
});
