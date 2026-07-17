import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MainNav } from "@/components/MainNav";

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
  });

  it("provides every core route", () => {
    render(<MainNav />);

    expect(screen.getByRole("navigation", { name: /main navigation/i })).toBeVisible();
    expect(screen.getByRole("link", { name: "Academy" })).toHaveAttribute(
      "href",
      "/academy",
    );
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

    expect(screen.getByRole("link", { name: /back to academy campus/i })).toHaveAttribute(
      "href",
      "/academy",
    );
    const status = screen.getByLabelText(/academy player status/i);
    expect(status).toHaveTextContent("XP0000");
    expect(status).toHaveTextContent("LV01");
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

  it("returns from the Main Building dashboard to the Academy campus", () => {
    navigation.pathname = "/academy/home";
    render(<MainNav />);

    expect(screen.getByRole("link", { name: /back to academy campus/i })).toHaveAttribute(
      "href",
      "/academy",
    );
    expect(screen.getByRole("link", { name: "Academy" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("returns from the Courses page to the Academy Hub", () => {
    navigation.pathname = "/learn";
    render(<MainNav />);

    expect(screen.getByRole("link", { name: /back to academy campus/i })).toHaveAttribute(
      "href",
      "/academy",
    );
  });

  it("returns from a dedicated lesson to the Interview Skills Academy", () => {
    navigation.pathname = "/learn/academy/speaking-clearly";
    render(<MainNav />);

    expect(
      screen.getByRole("link", { name: /back to interview skills academy/i }),
    ).toHaveAttribute("href", "/learn");
  });

  it("returns from Settings to the Academy Hub", () => {
    navigation.pathname = "/settings";
    render(<MainNav />);

    expect(screen.getByRole("link", { name: /back to academy campus/i })).toHaveAttribute(
      "href",
      "/academy",
    );
  });

  it.each(["/practice", "/progress", "/academy/home", "/learn"])(
    "returns from %s to the Academy campus",
    (pathname) => {
      navigation.pathname = pathname;
      render(<MainNav />);

      expect(
        screen.getByRole("link", { name: /back to academy campus/i }),
      ).toHaveAttribute("href", "/academy");
      expect(screen.getByRole("link", { name: "Ameego Academy campus" })).toHaveAttribute(
        "href",
        "/academy",
      );
    },
  );

  it("keeps the title screen separate from the Academy campus", () => {
    navigation.pathname = "/";
    render(<MainNav />);

    expect(screen.getByRole("link", { name: "Ameego title screen" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Academy" })).toHaveAttribute(
      "href",
      "/academy",
    );
  });
});
