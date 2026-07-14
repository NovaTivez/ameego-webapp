import type { Metadata } from "next";

import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelPanel } from "@/components/PixelPanel";
import { PixelRoomBackground } from "@/components/PixelRoomBackground";
import { PixelStatusBar } from "@/components/PixelStatusBar";

export const metadata: Metadata = { title: "Progress Library" };

export default function ProgressPage() {
  return (
    <div className="page-stack progress-library-page">
      <header className="progress-library-header">
        <PixelBadge tone="mint">Library available</PixelBadge>
        <p className="eyebrow">Progress Library</p>
        <h1>A quiet home for evidence, not invented scores.</h1>
        <p className="hero-lede">
          Interview attempts can be saved on this device. A browsable history and
          first-versus-latest comparison are still being prepared and are not simulated
          here.
        </p>
      </header>
      <PixelRoomBackground variant="library" label="Pixel-art progress library">
        <div className="library-desk">
          <PixelIcon name="progress" size="large" />
          <span>Local records desk</span>
        </div>
      </PixelRoomBackground>
      <div className="progress-library-grid">
        <PixelPanel tone="dark" className="progress-library-console">
          <p className="eyebrow">Records terminal</p>
          <h2>History view coming next.</h2>
          <PixelStatusBar
            label="Attempt capture"
            value="Available in Interview Center"
            tone="success"
          />
          <PixelStatusBar
            label="Evaluation history"
            value="Not implemented"
            tone="warning"
            icon="timer"
          />
          <PixelStatusBar
            label="Attempt comparison"
            value="Not implemented"
            tone="warning"
            icon="timer"
          />
        </PixelPanel>
        <PixelPanel className="progress-library-card">
          <PixelIcon name="resume" size="large" />
          <h2>Your data stays honest.</h2>
          <p>
            Failed evaluations never become feedback records. Durable evaluation history
            and comparison will require a separate implementation phase.
          </p>
          <div className="button-row">
            <PixelButton href="/practice">Open Interview Center</PixelButton>
            <PixelButton href="/learn" variant="secondary">
              Return to lessons
            </PixelButton>
          </div>
        </PixelPanel>
      </div>
    </div>
  );
}
