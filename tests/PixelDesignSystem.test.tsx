import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CharacterPortrait } from "@/components/CharacterPortrait";
import { PixelDialog } from "@/components/PixelDialog";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelModal } from "@/components/PixelModal";
import { PixelProgress } from "@/components/PixelProgress";
import { PixelStatusBar } from "@/components/PixelStatusBar";

describe("shared pixel design system", () => {
  it("exposes accessible HUD, progress, portrait, dialog, and icon semantics", () => {
    render(
      <>
        <PixelProgress label="Session progress" current={2} total={5} />
        <PixelStatusBar label="Transcript" value="Review required" tone="warning" />
        <PixelDialog speaker="Guide">Choose a room.</PixelDialog>
        <CharacterPortrait variant="student" name="Ari" />
        <PixelIcon name="resume" label="Resume" />
      </>,
    );

    expect(
      screen.getByRole("progressbar", { name: /session progress/i }),
    ).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByText("Review required")).toBeVisible();
    expect(screen.getByText("Choose a room.")).toBeVisible();
    expect(
      screen.getByRole("img", { name: /Ari, neutral pixel-art student/i }),
    ).toBeVisible();
    expect(screen.getByRole("img", { name: "Resume" })).toBeVisible();
  });

  it("provides a labeled modal with a keyboard-operable close control", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <PixelModal title="Checkpoint" onClose={onClose}>
        Saved locally.
      </PixelModal>,
    );

    expect(screen.getByRole("dialog", { name: "Checkpoint" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: /close dialog/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
