"use client";

import { PixelHudStat } from "@/components/PixelHudStat";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";

export function AcademyPlayerStatus({ className }: { className?: string }) {
  const { xp, level } = usePlayerProgress();

  return (
    <div className={className} aria-label="Academy player status" aria-live="polite">
      <PixelHudStat label="XP" value={String(xp).padStart(4, "0")} icon="star" />
      <PixelHudStat label="LV" value={String(level).padStart(2, "0")} />
    </div>
  );
}
