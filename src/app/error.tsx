"use client";

import { PixelButton } from "@/components/PixelButton";
import { PixelPanel } from "@/components/PixelPanel";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-stack state-page">
      <PixelPanel tone="warning" className="state-panel">
        <p className="eyebrow">Room signal lost</p>
        <h1>That door did not open.</h1>
        <p>
          The page hit an unexpected problem. Your next action is still in your control.
        </p>
        <div className="button-row">
          <PixelButton onClick={reset}>Try this room again</PixelButton>
          <PixelButton href="/" variant="secondary">
            Return home
          </PixelButton>
        </div>
      </PixelPanel>
    </div>
  );
}
