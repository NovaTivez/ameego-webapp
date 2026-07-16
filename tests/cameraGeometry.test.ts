import { describe, expect, it } from "vitest";

import {
  createPresenceDebounceState,
  IN_FRAME_STREAK,
  isCenterInFrame,
  observationFromLandmarks,
  orientationFromYawRatio,
  OUT_OF_FRAME_MS,
  reducePresenceObservation,
} from "@/lib/camera/geometry";
import { cameraPresenceLabels } from "@/lib/camera/types";

describe("camera geometry", () => {
  it("treats the inset center zone as in frame", () => {
    expect(isCenterInFrame(0.5, 0.5)).toBe(true);
    expect(isCenterInFrame(0.1, 0.5)).toBe(false);
    expect(isCenterInFrame(0.5, 0.9)).toBe(false);
  });

  it("maps yaw ratio into facing, slight, and away buckets", () => {
    expect(orientationFromYawRatio(0.5)).toBe("facing");
    expect(orientationFromYawRatio(0.6)).toBe("turned_slightly");
    expect(orientationFromYawRatio(0.8)).toBe("turned_away");
    expect(orientationFromYawRatio(null)).toBe("unknown");
  });

  it("derives center and yaw from landmarks", () => {
    const landmarks = Array.from({ length: 5 }, (_, index) => ({
      x: 0.2 + index * 0.1,
      y: 0.4,
    }));
    landmarks[1] = { x: 0.5, y: 0.4 };
    const observation = observationFromLandmarks(landmarks);
    expect(observation.detected).toBe(true);
    expect(observation.centerX).toBeCloseTo(0.4);
    expect(observation.yawRatio).toBeCloseTo(0.75);
  });

  it("requires a short streak before reporting in frame", () => {
    let state = createPresenceDebounceState();
    const observation = {
      detected: true,
      centerX: 0.5,
      centerY: 0.5,
      yawRatio: 0.5,
    };

    for (let i = 0; i < IN_FRAME_STREAK - 1; i += 1) {
      state = reducePresenceObservation(state, observation, 1_000 + i);
      expect(state.presence).not.toBe("in_frame");
    }

    state = reducePresenceObservation(state, observation, 1_000 + IN_FRAME_STREAK);
    expect(state.presence).toBe("in_frame");
    expect(state.orientation).toBe("facing");
  });

  it("waits before marking a face as not detected", () => {
    let state = reducePresenceObservation(
      createPresenceDebounceState(),
      { detected: true, centerX: 0.5, centerY: 0.5, yawRatio: 0.5 },
      1_000,
    );
    state = reducePresenceObservation(
      state,
      { detected: true, centerX: 0.5, centerY: 0.5, yawRatio: 0.5 },
      1_001,
    );
    state = reducePresenceObservation(
      state,
      { detected: true, centerX: 0.5, centerY: 0.5, yawRatio: 0.5 },
      1_002,
    );
    expect(state.presence).toBe("in_frame");

    state = reducePresenceObservation(
      state,
      { detected: false, centerX: 0.5, centerY: 0.5, yawRatio: null },
      1_002 + OUT_OF_FRAME_MS - 1,
    );
    expect(state.presence).toBe("in_frame");

    state = reducePresenceObservation(
      state,
      { detected: false, centerX: 0.5, centerY: 0.5, yawRatio: null },
      1_002 + OUT_OF_FRAME_MS,
    );
    expect(state.presence).toBe("not_detected");
    expect(state.orientation).toBe("unknown");
  });

  it("uses neutral labels and blanks orientation when no face is present", () => {
    expect(cameraPresenceLabels("active", "in_frame", "facing")).toEqual({
      face: "In frame",
      orientation: "Facing camera",
      camera: "On",
    });
    expect(cameraPresenceLabels("active", "not_detected", "facing")).toEqual({
      face: "Not detected",
      orientation: "—",
      camera: "On",
    });
    expect(cameraPresenceLabels("denied", "unknown", "unknown").camera).toBe(
      "Permission denied",
    );
  });
});
