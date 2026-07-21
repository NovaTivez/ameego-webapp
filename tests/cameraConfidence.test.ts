import { describe, expect, it } from "vitest";

import {
  cameraConfidenceCopy,
  createCameraCueTracker,
  recordCameraCue,
  summarizeCameraCues,
} from "@/lib/camera/confidence";
import type { FaceObservation } from "@/lib/camera/types";

const forward: FaceObservation = {
  detected: true,
  centerX: 0.5,
  centerY: 0.5,
  yawRatio: 0.5,
  pitchRatio: 0.5,
};

const lookingSide: FaceObservation = {
  detected: true,
  centerX: 0.5,
  centerY: 0.5,
  yawRatio: 0.76,
  pitchRatio: 0.5,
};

describe("camera confidence cue aggregation", () => {
  it("summarizes face presence, approximate direction, and sustained side periods", () => {
    let tracker = createCameraCueTracker();
    tracker = recordCameraCue(tracker, forward, 0);
    tracker = recordCameraCue(tracker, forward, 500);
    tracker = recordCameraCue(tracker, lookingSide, 1_000);
    for (let now = 1_500; now <= 4_000; now += 500) {
      tracker = recordCameraCue(tracker, lookingSide, now);
    }

    const summary = summarizeCameraCues(tracker);
    expect(summary).toEqual({
      observedDurationMs: 4_000,
      facePresencePercent: 100,
      facingScreenPercent: 25,
      lookAwayCount: 1,
      longDownOrSideCount: 1,
      downDurationMs: 0,
      sideDurationMs: 3_000,
    });
  });

  it("does not produce feedback from too little camera data", () => {
    let tracker = createCameraCueTracker();
    tracker = recordCameraCue(tracker, forward, 0);
    tracker = recordCameraCue(tracker, forward, 500);
    expect(summarizeCameraCues(tracker)).toBeNull();
  });

  it("uses supportive practice language without emotion or hiring claims", () => {
    const copy = cameraConfidenceCopy({
      observedDurationMs: 5_000,
      facePresencePercent: 65,
      facingScreenPercent: 50,
      lookAwayCount: 5,
      longDownOrSideCount: 1,
      downDurationMs: 2_000,
      sideDurationMs: 2_000,
    });

    expect(copy.observations.join(" ")).toMatch(/approximate head direction/i);
    expect(copy.tips.join(" ")).toMatch(/practice/i);
    expect(copy.observations.join(" ")).not.toMatch(/emotion|appearance|hire/i);
  });
});
