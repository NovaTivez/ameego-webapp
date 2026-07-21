export type CameraStatus =
  "off" | "starting" | "active" | "denied" | "unavailable" | "interrupted";

export type FacePresence = "unknown" | "in_frame" | "out_of_frame" | "not_detected";

export type HeadOrientation = "unknown" | "facing" | "turned_slightly" | "turned_away";

export type CameraPresenceLabels = {
  face: string;
  orientation: string;
  camera: string;
};

export type FaceObservation = {
  detected: boolean;
  centerX: number;
  centerY: number;
  /** Approximate yaw in normalized face space: 0 = left, 0.5 = center, 1 = right. */
  yawRatio: number | null;
  /** Approximate pitch in normalized face space; larger values can indicate looking down. */
  pitchRatio?: number | null;
};

export type CameraConfidenceInsights = {
  observedDurationMs: number;
  facePresencePercent: number;
  facingScreenPercent: number;
  lookAwayCount: number;
  longDownOrSideCount: number;
  downDurationMs: number;
  sideDurationMs: number;
};

export type PresenceDebounceState = {
  presence: FacePresence;
  orientation: HeadOrientation;
  consecutiveInFrame: number;
  lastSeenAt: number | null;
};

export const FACE_PRESENCE_LABELS: Record<FacePresence, string> = {
  unknown: "—",
  in_frame: "In frame",
  out_of_frame: "Out of frame",
  not_detected: "Not detected",
};

export const HEAD_ORIENTATION_LABELS: Record<HeadOrientation, string> = {
  unknown: "—",
  facing: "Facing camera",
  turned_slightly: "Turned slightly",
  turned_away: "Turned away",
};

export const CAMERA_STATUS_LABELS: Record<CameraStatus, string> = {
  off: "Off",
  starting: "Starting",
  active: "On",
  denied: "Permission denied",
  unavailable: "Unavailable",
  interrupted: "Interrupted",
};

export function cameraPresenceLabels(
  status: CameraStatus,
  presence: FacePresence,
  orientation: HeadOrientation,
): CameraPresenceLabels {
  if (status === "off") {
    return { face: "—", orientation: "—", camera: CAMERA_STATUS_LABELS.off };
  }
  if (status === "starting") {
    return {
      face: "—",
      orientation: "—",
      camera: CAMERA_STATUS_LABELS.starting,
    };
  }
  if (status === "denied" || status === "unavailable" || status === "interrupted") {
    return {
      face: "—",
      orientation: "—",
      camera: CAMERA_STATUS_LABELS[status],
    };
  }
  return {
    face: FACE_PRESENCE_LABELS[presence],
    orientation:
      presence === "not_detected" || presence === "unknown"
        ? "—"
        : HEAD_ORIENTATION_LABELS[orientation],
    camera: CAMERA_STATUS_LABELS.active,
  };
}
