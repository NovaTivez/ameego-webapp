import type { ReactNode } from "react";

type PixelDialogProps = {
  children: ReactNode;
  speaker?: string;
  className?: string;
};

export function PixelDialog({ children, speaker, className = "" }: PixelDialogProps) {
  return (
    <div className={`pixel-dialog ${className}`}>
      {speaker ? <span className="pixel-dialog-speaker">{speaker}</span> : null}
      <div className="pixel-dialog-copy">{children}</div>
      <span className="pixel-dialog-tail" aria-hidden="true" />
    </div>
  );
}
