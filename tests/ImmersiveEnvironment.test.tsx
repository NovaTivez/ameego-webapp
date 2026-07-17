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

  it("uses the supplied panorama for preparation and the combined coach scene after completion", () => {
    const { rerender } = render(<PracticeLobbyScene stage="resume" />);
    const panorama = screen.getByLabelText(/panoramic interview center room/i);
    expect(panorama).toHaveClass("practice-lobby-panorama");
    expect(panorama).toBeEmptyDOMElement();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText(/resume is optional/i)).not.toBeInTheDocument();

    rerender(<FeedbackRoomScene />);
    expect(screen.getByLabelText(/after interview completion/i)).toBeVisible();
    expect(
      screen.getByRole("img", { name: /ameego interview coach seated/i }),
    ).toHaveAttribute("src", expect.stringContaining("mode-coach-desk.png"));
    expect(
      screen.queryByText(/confidence score|eye contact score/i),
    ).not.toBeInTheDocument();
  });
});
