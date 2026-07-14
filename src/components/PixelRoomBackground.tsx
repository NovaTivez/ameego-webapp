import type { ReactNode } from "react";

type PixelRoomBackgroundProps = {
  children?: ReactNode;
  variant?: "office" | "classroom" | "library" | "speech-hall";
  label: string;
  className?: string;
};

export function PixelRoomBackground({
  children,
  variant = "office",
  label,
  className = "",
}: PixelRoomBackgroundProps) {
  return (
    <section
      className={`pixel-environment pixel-environment-${variant} ${className}`}
      aria-label={label}
    >
      <div className="environment-window" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="environment-shelf" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="environment-plant" aria-hidden="true">
        <span />
      </div>
      <div className="environment-clock" aria-hidden="true">
        <span />
      </div>
      <div className="environment-lamp" aria-hidden="true">
        <span />
      </div>
      <div className="environment-wall-trim" aria-hidden="true" />
      <div className="environment-rug" aria-hidden="true" />
      <div className="environment-motes" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="environment-floor" aria-hidden="true" />
      <div className="environment-content">{children}</div>
    </section>
  );
}
