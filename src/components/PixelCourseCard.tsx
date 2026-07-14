import type { ReactNode } from "react";

import { PixelIcon } from "@/components/PixelIcon";
import { PixelPanel } from "@/components/PixelPanel";

type PixelCourseCardProps = {
  children: ReactNode;
  className?: string;
};

export function PixelCourseCard({ children, className = "" }: PixelCourseCardProps) {
  return (
    <PixelPanel className={`pixel-course-card ${className}`}>
      <div className="pixel-course-emblem" aria-hidden="true">
        <PixelIcon name="lesson" size="large" />
        <span>STAR</span>
      </div>
      {children}
    </PixelPanel>
  );
}
