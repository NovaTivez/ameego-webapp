import type { ReactNode } from "react";

type PixelBadgeProps = {
  children: ReactNode;
  tone?: "mint" | "amber" | "plum";
};

export function PixelBadge({ children, tone = "plum" }: PixelBadgeProps) {
  return <span className={`pixel-badge pixel-badge-${tone}`}>{children}</span>;
}
