import type { FaceObservation } from "@/lib/camera/types";
import { observationFromLandmarks } from "@/lib/camera/geometry";

const WASM_ROOT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

export type FaceDetector = {
  detect: (video: HTMLVideoElement, timestampMs: number) => FaceObservation;
  close: () => void;
};

type LandmarkPoint = { x: number; y: number };

type FaceLandmarkerLike = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestamp: number,
  ) => { faceLandmarks: LandmarkPoint[][] };
  close: () => void;
};

export type CreateFaceDetector = () => Promise<FaceDetector>;

export const createMediaPipeFaceDetector: CreateFaceDetector = async () => {
  const vision = await import("@mediapipe/tasks-vision");
  const fileset = await vision.FilesetResolver.forVisionTasks(WASM_ROOT);

  const create = (delegate: "GPU" | "CPU") =>
    vision.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate,
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });

  let landmarker: FaceLandmarkerLike;
  try {
    landmarker = await create("GPU");
  } catch {
    landmarker = await create("CPU");
  }

  return {
    detect(video, timestampMs) {
      const result = landmarker.detectForVideo(video, timestampMs);
      const landmarks = result.faceLandmarks[0];
      if (!landmarks || landmarks.length === 0) {
        return { detected: false, centerX: 0.5, centerY: 0.5, yawRatio: null };
      }
      return observationFromLandmarks(landmarks);
    },
    close() {
      landmarker.close();
    },
  };
};
