"use client";

import { PixelButton } from "@/components/PixelButton";
import { PixelLoadingState } from "@/components/PixelLoadingState";
import { PixelPanel } from "@/components/PixelPanel";

type CourseStateProps =
  { state: "loading" } | { state: "empty" } | { state: "error"; onRetry: () => void };

export function CourseState(props: CourseStateProps) {
  if (props.state === "loading") {
    return (
      <PixelLoadingState
        label="Loading lesson progress"
        detail="Reading local checkpoint data"
      />
    );
  }

  if (props.state === "empty") {
    return (
      <PixelPanel className="course-state-panel">
        <p className="eyebrow">Course library</p>
        <h2>No lessons are available yet.</h2>
        <p>The course shell is ready, but no lesson content has been published.</p>
      </PixelPanel>
    );
  }

  return (
    <PixelPanel tone="warning" className="course-state-panel" role="alert">
      <p className="eyebrow">Progress unavailable</p>
      <h2>Your saved lesson status could not be loaded.</h2>
      <p>The lesson content is safe. Check browser storage access, then try again.</p>
      <PixelButton onClick={props.onRetry}>Retry progress check</PixelButton>
    </PixelPanel>
  );
}
