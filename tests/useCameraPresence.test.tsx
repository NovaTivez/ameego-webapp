import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCameraPresence } from "@/hooks/useCameraPresence";
import type { CreateFaceDetector } from "@/lib/camera/mediapipe";

function CameraRefHarness({ createDetector }: { createDetector: CreateFaceDetector }) {
  const [secondPreview, setSecondPreview] = useState(false);
  const { attachVideo, status } = useCameraPresence({
    enabled: true,
    active: true,
    createDetector,
  });

  return (
    <>
      <span>{status}</span>
      <button type="button" onClick={() => setSecondPreview(true)}>
        Move preview
      </button>
      {secondPreview ? (
        <video ref={attachVideo} aria-label="second preview" />
      ) : (
        <video ref={attachVideo} aria-label="first preview" />
      )}
    </>
  );
}

describe("useCameraPresence preview handoff", () => {
  const previousMediaDevices = navigator.mediaDevices;

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: previousMediaDevices,
    });
  });

  it("reattaches the active stream when the preview video changes", async () => {
    const user = userEvent.setup();
    vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const stop = vi.fn();
    const videoTrack = { onended: null, stop };
    const stream = {
      getTracks: () => [videoTrack],
      getVideoTracks: () => [videoTrack],
    } as unknown as MediaStream;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn(async () => stream) },
    });
    const createDetector: CreateFaceDetector = vi.fn(async () => ({
      detect: () => ({ detected: false, centerX: 0.5, centerY: 0.5, yawRatio: null }),
      close: vi.fn(),
    }));

    render(<CameraRefHarness createDetector={createDetector} />);

    expect(await screen.findByText("active")).toBeVisible();
    const firstPreview = screen.getByLabelText(/first preview/i) as HTMLVideoElement;
    expect(firstPreview.srcObject).toBe(stream);

    await user.click(screen.getByRole("button", { name: /move preview/i }));
    const secondPreview = screen.getByLabelText(/second preview/i) as HTMLVideoElement;
    await waitFor(() => expect(secondPreview.srcObject).toBe(stream));
  });
});
