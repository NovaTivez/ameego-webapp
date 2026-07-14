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
  });

  it("marks the current route for assistive technology", () => {
    render(<MainNav />);

    expect(screen.getByRole("link", { name: "Interview Center" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
