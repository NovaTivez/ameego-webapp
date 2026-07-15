import { PixelIcon } from "@/components/PixelIcon";

type PixelLoadingStateProps = { label: string; detail?: string };

export function PixelLoadingState({ label, detail }: PixelLoadingStateProps) {
  return (
    <div className="pixel-loading-state" role="status" aria-live="polite">
      <PixelIcon name="timer" size="large" />
      <div>
        <strong>{label}</strong>
        {detail ? <span>{detail}</span> : null}
      </div>
      <span className="pixel-loading-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
