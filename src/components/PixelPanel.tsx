import type { AriaRole, ReactNode } from "react";

type PixelPanelProps = {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "dark" | "warning";
  role?: AriaRole;
};

export function PixelPanel({
  children,
  className = "",
  tone = "paper",
  role,
}: PixelPanelProps) {
  return (
    <div className={`pixel-panel pixel-panel-${tone} ${className}`} role={role}>
      {children}
    </div>
  );
}
