import { isCenterInFrame, orientationFromYawRatio } from "@/lib/camera/geometry";
import type { CameraConfidenceInsights, FaceObservation } from "@/lib/camera/types";

export const LONG_DIRECTIONAL_AWAY_MS = 3_000;
export const MAX_CAMERA_SAMPLE_GAP_MS = 500;
export const MIN_CAMERA_OBSERVATION_MS = 1_000;
export const PITCH_DOWN_MIN = 0.64;

type CueClassification = {
  facePresent: boolean;
  facingScreen: boolean;
  away: boolean;
  down: boolean;
  side: boolean;
};

export type CameraCueTrackerState = {
  lastSampleAt: number | null;
  lastCue: CueClassification | null;
  observedDurationMs: number;
  facePresentDurationMs: number;
  facingScreenDurationMs: number;
  downDurationMs: number;
  sideDurationMs: number;
  lookAwayCount: number;
  currentAwayDurationMs: number;
  currentAwayDirectional: boolean;
  currentAwayCountedAsLong: boolean;
  longDownOrSideCount: number;
};

export function createCameraCueTracker(): CameraCueTrackerState {
  return {
    lastSampleAt: null,
    lastCue: null,
    observedDurationMs: 0,
    facePresentDurationMs: 0,
    facingScreenDurationMs: 0,
    downDurationMs: 0,
    sideDurationMs: 0,
    lookAwayCount: 0,
    currentAwayDurationMs: 0,
    currentAwayDirectional: false,
    currentAwayCountedAsLong: false,
    longDownOrSideCount: 0,
  };
}

function classifyObservation(observation: FaceObservation): CueClassification {
  if (!observation.detected) {
    return {
      facePresent: false,
      facingScreen: false,
      away: true,
      down: false,
      side: false,
    };
  }

  const orientation = orientationFromYawRatio(observation.yawRatio);
  const inFrame = isCenterInFrame(observation.centerX, observation.centerY);
  const down =
    typeof observation.pitchRatio === "number" &&
    observation.pitchRatio >= PITCH_DOWN_MIN;
  const side =
    !inFrame || orientation === "turned_slightly" || orientation === "turned_away";
  const facingScreen = inFrame && orientation === "facing" && !down;

  return {
    facePresent: true,
    facingScreen,
    away: !facingScreen,
    down,
    side,
  };
}

export function recordCameraCue(
  state: CameraCueTrackerState,
  observation: FaceObservation,
  now: number,
): CameraCueTrackerState {
  const cue = classifyObservation(observation);
  const next = { ...state };

  if (state.lastSampleAt !== null && state.lastCue) {
    const duration = Math.min(
      MAX_CAMERA_SAMPLE_GAP_MS,
      Math.max(0, now - state.lastSampleAt),
    );
    next.observedDurationMs += duration;
    if (state.lastCue.facePresent) next.facePresentDurationMs += duration;
    if (state.lastCue.facingScreen) next.facingScreenDurationMs += duration;
    if (state.lastCue.down) next.downDurationMs += duration;
    if (state.lastCue.side) next.sideDurationMs += duration;

    if (state.lastCue.away) {
      next.currentAwayDurationMs += duration;
      next.currentAwayDirectional =
        next.currentAwayDirectional || state.lastCue.down || state.lastCue.side;
      if (
        !next.currentAwayCountedAsLong &&
        next.currentAwayDirectional &&
        next.currentAwayDurationMs >= LONG_DIRECTIONAL_AWAY_MS
      ) {
        next.longDownOrSideCount += 1;
        next.currentAwayCountedAsLong = true;
      }
    }
  }

  if (cue.away && state.lastCue && !state.lastCue.away) {
    next.lookAwayCount += 1;
    next.currentAwayDurationMs = 0;
    next.currentAwayDirectional = cue.down || cue.side;
    next.currentAwayCountedAsLong = false;
  } else if (!cue.away) {
    next.currentAwayDurationMs = 0;
    next.currentAwayDirectional = false;
    next.currentAwayCountedAsLong = false;
  } else {
    next.currentAwayDirectional = next.currentAwayDirectional || cue.down || cue.side;
  }

  next.lastSampleAt = now;
  next.lastCue = cue;
  return next;
}

export function summarizeCameraCues(
  state: CameraCueTrackerState,
): CameraConfidenceInsights | null {
  if (state.observedDurationMs < MIN_CAMERA_OBSERVATION_MS) return null;

  const percent = (duration: number) =>
    Math.round((duration / state.observedDurationMs) * 100);

  return {
    observedDurationMs: state.observedDurationMs,
    facePresencePercent: percent(state.facePresentDurationMs),
    facingScreenPercent: percent(state.facingScreenDurationMs),
    lookAwayCount: state.lookAwayCount,
    longDownOrSideCount: state.longDownOrSideCount,
    downDurationMs: state.downDurationMs,
    sideDurationMs: state.sideDurationMs,
  };
}

export function cameraConfidenceCopy(insights: CameraConfidenceInsights): {
  observations: string[];
  tips: string[];
} {
  const observations = [
    `Your face was detectable for about ${insights.facePresencePercent}% of the analyzed camera time.`,
    `Your approximate head direction was toward the screen for about ${insights.facingScreenPercent}% of the analyzed camera time.`,
    `The on-device tracker noticed ${insights.lookAwayCount} ${insights.lookAwayCount === 1 ? "shift" : "shifts"} away from the screen.`,
    insights.longDownOrSideCount === 0
      ? "No long periods of looking down or to the side were detected."
      : `${insights.longDownOrSideCount} long ${insights.longDownOrSideCount === 1 ? "period" : "periods"} of looking down or to the side ${insights.longDownOrSideCount === 1 ? "was" : "were"} detected.`,
  ];

  const tips: string[] = [];
  if (insights.facePresencePercent < 80) {
    tips.push("Try centering your face in the camera frame before your next response.");
  }
  if (insights.facingScreenPercent < 70 || insights.longDownOrSideCount > 0) {
    tips.push(
      "Place brief notes near the camera and practice returning your gaze toward the screen after checking them.",
    );
  }
  if (insights.lookAwayCount >= 4) {
    tips.push(
      "Pause between ideas and use one nearby visual anchor to reduce frequent head-direction shifts.",
    );
  }
  if (tips.length === 0) {
    tips.push(
      "Your camera positioning appeared steady; keep practicing a relaxed, natural return toward the screen.",
    );
  }

  return { observations, tips };
}
