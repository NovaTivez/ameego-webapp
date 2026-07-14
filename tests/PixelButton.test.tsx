import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PixelButton } from "@/components/PixelButton";

describe("PixelButton", () => {
  it("renders navigation as a keyboard-focusable link", () => {
    render(<PixelButton href="/learn">Open lessons</PixelButton>);

    expect(screen.getByRole("link", { name: /open lessons/i })).toHaveAttribute(
      "href",
      "/learn",
    );
  });

  it("runs button actions from the keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<PixelButton onClick={onClick}>Try again</PixelButton>);

    screen.getByRole("button", { name: /try again/i }).focus();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledOnce();
  });
});
