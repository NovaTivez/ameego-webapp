"use client";

import { PixelButton } from "@/components/PixelButton";
import { PixelLoadingState } from "@/components/PixelLoadingState";
import { PixelPanel } from "@/components/PixelPanel";
import type { ExerciseProgressErrorKind } from "@/lib/exercise-progress";

type ExerciseProgressStateProps =
  | { state: "loading" }
  | {
      state: "error";
      errorKind: ExerciseProgressErrorKind;
      onRetry: () => void;
    };

export function ExerciseProgressState(props: ExerciseProgressStateProps) {
  if (props.state === "loading") {
    return (
      <PixelLoadingState
        label="Loading exercise progress"
        detail="Restoring your checkpoint"
      />
    );
  }

  return (
    <PixelPanel tone="warning" className="exercise-error" role="alert">
      <h2>
        {props.errorKind === "corrupt"
          ? "Saved exercise progress is invalid."
          : "Exercise progress could not be saved."}
      </h2>
      <p>
        {props.errorKind === "corrupt"
          ? "Your arrangement is still available. Reset only this exercise's invalid saved record to continue saving."
          : "Your arrangement is still visible. Restore browser storage access and retry."}
      </p>
      <PixelButton onClick={props.onRetry}>
        {props.errorKind === "corrupt"
          ? "Reset invalid progress"
          : "Retry saving progress"}
      </PixelButton>
    </PixelPanel>
  );
}
