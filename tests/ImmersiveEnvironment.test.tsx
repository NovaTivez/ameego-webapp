import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeedbackRoomScene } from "@/components/FeedbackRoomScene";
import { GameWorldBackdrop } from "@/components/GameWorldBackdrop";
import { LearningScene } from "@/components/LearningScene";
import { PracticeLobbyScene } from "@/components/PracticeLobbyScene";

describe("immersive pixel environments", () => {
  it("keeps the persistent world backdrop decorative", () => {
    const { container } = render(<GameWorldBackdrop />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("gives learning scenes useful accessible labels while hiding their props", () => {
    render(<LearningScene variant="lesson" />);
    expect(screen.getByLabelText(/STAR lesson study room/i)).toBeVisible();
    expect(screen.getByRole("img", { name: /Ari, academy learner/i })).toBeVisible();
    expect(screen.getByText(/Build one clear story/i)).toBeVisible();
  });

  it("labels preparation and reflection scenes without inventing analysis", () => {
    const { rerender } = render(<PracticeLobbyScene stage="resume" />);
    expect(screen.getByLabelText(/preparation lobby/i)).toBeVisible();
    expect(screen.getByText(/resume is optional/i)).toBeVisible();

    rerender(<FeedbackRoomScene />);
    expect(screen.getByLabelText(/reflection room/i)).toBeVisible();
    expect(
      screen.queryByText(/confidence score|eye contact score/i),
    ).not.toBeInTheDocument();
  });
});
