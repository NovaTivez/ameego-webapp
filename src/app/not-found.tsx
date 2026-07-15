import { PixelButton } from "@/components/PixelButton";
import { PixelPanel } from "@/components/PixelPanel";

export default function NotFound() {
  return (
    <div className="page-stack state-page">
      <PixelPanel className="state-panel">
        <span className="error-code" aria-hidden="true">
          404
        </span>
        <p className="eyebrow">Unmapped room</p>
        <h1>This hallway ends here.</h1>
        <p>The page you requested is not part of the current learning space.</p>
        <PixelButton href="/">Return to the lobby</PixelButton>
      </PixelPanel>
    </div>
  );
}
