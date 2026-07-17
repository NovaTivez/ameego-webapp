import type {
  FaceObservation,
  FacePresence,
  HeadOrientation,
  PresenceDebounceState,
} from "@/lib/camera/types";

/** Safe framing zone as a fraction of the preview (20% inset on each side). */
export const FRAME_INSET = 0.2;

/** Consecutive in-frame detections required before showing "In frame". */
export const IN_FRAME_STREAK = 3;

/** Milliseconds without a face before showing "Out of frame" / "Not detected". */
export const OUT_OF_FRAME_MS = 600;

/** Yaw ratio distance from center for "facing" vs "turned slightly" vs "turned away". */
export const YAW_FACING_MAX = 0.08;
export const YAW_SLIGHT_MAX = 0.18;

export function createPresenceDebounceState(): PresenceDebounceState {
  return {
    presence: "unknown",
    orientation: "unknown",
    consecutiveInFrame: 0,
    lastSeenAt: null,
  };
}

export function isCenterInFrame(
  centerX: number,
  centerY: number,
  inset = FRAME_INSET,
): boolean {
  return (
    centerX >= inset && centerX <= 1 - inset && centerY >= inset && centerY <= 1 - inset
  );
}

export function orientationFromYawRatio(yawRatio: number | null): HeadOrientation {
  if (yawRatio === null || Number.isNaN(yawRatio)) return "unknown";
  const offset = Math.abs(yawRatio - 0.5);
  if (offset <= YAW_FACING_MAX) return "facing";
  if (offset <= YAW_SLIGHT_MAX) return "turned_slightly";
  return "turned_away";
}

export function observationFromLandmarks(
  landmarks: Array<{ x: number; y: number }>,
): FaceObservation {
  if (landmarks.length === 0) {
    return { detected: false, centerX: 0.5, centerY: 0.5, yawRatio: null };
  }

  let minX = 1;
  let maxX = 0;
  let minY = 1;
  let maxY = 0;
  for (const point of landmarks) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const width = maxX - minX;

  // Nose tip (landmark 1) relative to the horizontal face span approximates yaw.
  const nose = landmarks[1];
  const yawRatio =
    nose && width > 0.02 ? Math.min(1, Math.max(0, (nose.x - minX) / width)) : null;

  return { detected: true, centerX, centerY, yawRatio };
}

export function reducePresenceObservation(
  state: PresenceDebounceState,
  observation: FaceObservation,
  now: number,
): PresenceDebounceState {
  if (!observation.detected) {
    const lastSeenAt = state.lastSeenAt;
    if (lastSeenAt === null) {
      return {
        presence: "not_detected",
        orientation: "unknown",
        consecutiveInFrame: 0,
        lastSeenAt: null,
      };
    }
    if (now - lastSeenAt >= OUT_OF_FRAME_MS) {
      return {
        presence: "not_detected",
        orientation: "unknown",
        consecutiveInFrame: 0,
        lastSeenAt,
      };
    }
    return {
      ...state,
      consecutiveInFrame: 0,
    };
  }

  const inFrame = isCenterInFrame(observation.centerX, observation.centerY);
  const orientation = orientationFromYawRatio(observation.yawRatio);
  const consecutiveInFrame = inFrame ? state.consecutiveInFrame + 1 : 0;

  let presence: FacePresence;
  if (inFrame && consecutiveInFrame >= IN_FRAME_STREAK) {
    presence = "in_frame";
  } else if (inFrame) {
    // Hold previous in-frame while streak builds; otherwise treat as still settling.
    presence = state.presence === "in_frame" ? "in_frame" : "out_of_frame";
  } else {
    presence = "out_of_frame";
  }

  return {
    presence,
    orientation,
    consecutiveInFrame,
    lastSeenAt: now,
  };
}
