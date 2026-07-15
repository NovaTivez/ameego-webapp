import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CharacterPortrait } from "@/components/CharacterPortrait";
import { PixelCard } from "@/components/PixelCard";
import { PixelDialog } from "@/components/PixelDialog";
import { PixelHudStat } from "@/components/PixelHudStat";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelInput } from "@/components/PixelInput";
import { PixelProgress } from "@/components/PixelProgress";
import { PixelStatusBar } from "@/components/PixelStatusBar";
import { PixelTabs } from "@/components/PixelTabs";

function TabExample() {
  const [activeId, setActiveId] = useState("profile");
  return (
    <>
      <PixelTabs
        id="settings"
        label="Settings sections"
        activeId={activeId}
        onChange={setActiveId}
        tabs={[
          { id: "profile", label: "Profile" },
          { id: "preferences", label: "Preferences" },
        ]}
      />
      <div id={`settings-panel-${activeId}`} role="tabpanel">
        {activeId} panel
      </div>
    </>
  );
}

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

  it("provides compact card, input, HUD stat, and keyboard tab primitives", async () => {
    const user = userEvent.setup();
    render(
      <>
        <PixelCard title="Course progress" label="HUD card">
          Four modules
        </PixelCard>
        <PixelInput id="position" label="Position" hint="Enter a role" />
        <PixelHudStat label="XP" value="1250" icon="star" />
        <TabExample />
      </>,
    );

    expect(screen.getByRole("heading", { name: "Course progress" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Position" })).toHaveAccessibleDescription(
      "Enter a role",
    );
    expect(screen.getByText("1250")).toBeVisible();

    const profileTab = screen.getByRole("tab", { name: "Profile" });
    profileTab.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Preferences" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("preferences panel");
  });
});
