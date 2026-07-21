"use client";

import { useCallback, useEffect, useRef, useState, type RefCallback } from "react";

import {
  createPresenceDebounceState,
  reducePresenceObservation,
} from "@/lib/camera/geometry";
import {
  createCameraCueTracker,
  recordCameraCue,
  summarizeCameraCues,
} from "@/lib/camera/confidence";
import {
  createMediaPipeFaceDetector,
  type CreateFaceDetector,
  type FaceDetector,
} from "@/lib/camera/mediapipe";
import type {
  CameraConfidenceInsights,
  CameraStatus,
  FacePresence,
  HeadOrientation,
} from "@/lib/camera/types";

const DETECT_INTERVAL_MS = 125;

type RuntimeStatus = Exclude<CameraStatus, "off"> | "idle";

type UseCameraPresenceOptions = {
  /** Learner wants camera on (mode intent or mid-session toggle). */
  enabled: boolean;
  /** True while interview/confirm steps are mounted. */
  active: boolean;
  /** Collect only during the interview, never during the readiness preview. */
  collectInsights?: boolean;
  createDetector?: CreateFaceDetector;
};

export type UseCameraPresenceResult = {
  attachVideo: RefCallback<HTMLVideoElement>;
  status: CameraStatus;
  presence: FacePresence;
  orientation: HeadOrientation;
  errorMessage: string;
  getConfidenceInsights: () => CameraConfidenceInsights | null;
  resetConfidenceInsights: () => void;
};

function permissionDenied(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "NotAllowedError" || error.name === "PermissionDeniedError")
  );
}

export function useCameraPresence({
  enabled,
  active,
  collectInsights = false,
  createDetector = createMediaPipeFaceDetector,
}: UseCameraPresenceOptions): UseCameraPresenceResult {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<FaceDetector | null>(null);
  const loopRef = useRef<number | null>(null);
  const debounceRef = useRef(createPresenceDebounceState());
  const generationRef = useRef(0);
  const createDetectorRef = useRef(createDetector);
  const cueTrackerRef = useRef(createCameraCueTracker());
  const collectingRef = useRef(false);

  const setVideoRef = useCallback((video: HTMLVideoElement | null) => {
    videoElementRef.current = video;
    const stream = streamRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    void video.play().catch(() => {
      // Autoplay can fail quietly; detect resumes once the learner starts playback.
    });
  }, []);

  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>("idle");
  const [presence, setPresence] = useState<FacePresence>("unknown");
  const [orientation, setOrientation] = useState<HeadOrientation>("unknown");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    createDetectorRef.current = createDetector;
  }, [createDetector]);

  useEffect(() => {
    if (collectInsights && !collectingRef.current) {
      cueTrackerRef.current = createCameraCueTracker();
    }
    collectingRef.current = collectInsights;
  }, [collectInsights]);

  const getConfidenceInsights = useCallback(
    () => summarizeCameraCues(cueTrackerRef.current),
    [],
  );
  const resetConfidenceInsights = useCallback(() => {
    cueTrackerRef.current = createCameraCueTracker();
  }, []);

  const shouldRun = enabled && active;
  const status: CameraStatus = shouldRun
    ? runtimeStatus === "idle"
      ? "starting"
      : runtimeStatus
    : "off";

  const stopLoop = useCallback(() => {
    if (loopRef.current !== null) {
      window.clearInterval(loopRef.current);
      loopRef.current = null;
    }
  }, []);

  const tearDownMedia = useCallback(() => {
    stopLoop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    detectorRef.current?.close();
    detectorRef.current = null;
    debounceRef.current = createPresenceDebounceState();
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }
  }, [stopLoop]);

  useEffect(() => {
    if (!shouldRun) {
      generationRef.current += 1;
      tearDownMedia();
      queueMicrotask(() => {
        setRuntimeStatus("idle");
        setPresence("unknown");
        setOrientation("unknown");
        setErrorMessage("");
      });
      return;
    }

    const generation = ++generationRef.current;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled || generation !== generationRef.current) return;
      setRuntimeStatus("starting");
      setErrorMessage("");
      setPresence("unknown");
      setOrientation("unknown");
    });

    const startDetectionLoop = () => {
      stopLoop();
      loopRef.current = window.setInterval(() => {
        if (document.visibilityState === "hidden") return;
        const video = videoElementRef.current;
        const detector = detectorRef.current;
        if (!video || !detector || video.readyState < 2) return;

        try {
          const observation = detector.detect(video, performance.now());
          if (collectingRef.current) {
            cueTrackerRef.current = recordCameraCue(
              cueTrackerRef.current,
              observation,
              performance.now(),
            );
          }
          const next = reducePresenceObservation(
            debounceRef.current,
            observation,
            performance.now(),
          );
          debounceRef.current = next;
          setPresence(next.presence);
          setOrientation(next.orientation);
        } catch {
          // Keep last stable labels on transient detect errors.
        }
      }, DETECT_INTERVAL_MS);
    };

    const start = async () => {
      tearDownMedia();

      if (!navigator.mediaDevices?.getUserMedia) {
        if (generation !== generationRef.current) return;
        setRuntimeStatus("unavailable");
        setErrorMessage("Camera is not available in this browser.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled || generation !== generationRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const [track] = stream.getVideoTracks();
        if (track) {
          track.onended = () => {
            if (generation !== generationRef.current) return;
            stopLoop();
            setRuntimeStatus("interrupted");
            setErrorMessage("Camera was interrupted. Retry when ready.");
            setPresence("unknown");
            setOrientation("unknown");
          };
        }

        const video = videoElementRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {
            // Autoplay can fail quietly; detect resumes once the element plays.
          });
        }

        const detector = await createDetectorRef.current();
        if (cancelled || generation !== generationRef.current) {
          detector.close();
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        detectorRef.current = detector;
        setRuntimeStatus("active");
        startDetectionLoop();
      } catch (error) {
        if (cancelled || generation !== generationRef.current) return;
        tearDownMedia();
        if (permissionDenied(error)) {
          setRuntimeStatus("denied");
          setErrorMessage(
            "Camera permission was denied. You can continue the interview without camera.",
          );
        } else {
          setRuntimeStatus("unavailable");
          setErrorMessage(
            "Camera could not start. You can continue the interview without camera.",
          );
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      generationRef.current += 1;
      tearDownMedia();
    };
  }, [shouldRun, stopLoop, tearDownMedia]);

  return {
    attachVideo: setVideoRef,
    status,
    presence: shouldRun ? presence : "unknown",
    orientation: shouldRun ? orientation : "unknown",
    errorMessage: shouldRun ? errorMessage : "",
    getConfidenceInsights,
    resetConfidenceInsights,
  };
}
