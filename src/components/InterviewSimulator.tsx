"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { EvaluationFeedback } from "@/components/EvaluationFeedback";
import { FeedbackRoomScene } from "@/components/FeedbackRoomScene";
import { InterviewSetupForm } from "@/components/InterviewSetupForm";
import { InterviewSessionView } from "@/components/InterviewSessionView";
import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelPanel } from "@/components/PixelPanel";
import { ResumeProfileEditor } from "@/components/ResumeProfileEditor";
import { PracticeLobbyScene } from "@/components/PracticeLobbyScene";
import { useCameraPresence } from "@/hooks/useCameraPresence";
import {
  appendTranscriptSegment,
  extractRecognitionUpdate,
  getSpeechRecognitionConstructor,
  RECOVERABLE_SPEECH_ERRORS,
  speechErrorMessage,
  type SpeechRecognitionLike,
} from "@/lib/audio/speech-recognition";
import {
  cancelInterviewSpeech,
  interviewerSpeechTimeoutMs,
  speakInterviewQuestion,
  type SpeakQuestionHandle,
} from "@/lib/audio/speech-synthesis";
import {
  DEFAULT_INTERVIEW_SETUP,
  EMPTY_RESUME_PROFILE,
  type ConfirmedInterviewContext,
  type ConfirmedResponse,
  type CompletedInterviewAttempt,
  type InterviewSetup,
  type QuestionSet,
  type ResumeProfile,
} from "@/lib/interview/contracts";
import type { EvaluationRequest, InterviewEvaluation } from "@/lib/evaluation/contracts";
import {
  parseEvaluationRequest,
  parseInterviewEvaluation,
} from "@/lib/evaluation/schema";
import {
  createCompletedAttempt,
  saveAttemptEvaluation,
  saveCompletedAttempt,
} from "@/lib/interview/attempts";
import { createGeneralQuestionFallback } from "@/lib/interview/questions";
import {
  FEEDBACK_INVALID_MESSAGE,
  FEEDBACK_UNAVAILABLE_MESSAGE,
  PERSONALIZATION_UNAVAILABLE_MESSAGE,
  RESUME_PERSONALIZATION_UNAVAILABLE_MESSAGE,
} from "@/lib/interview/product-messages";
import { RESUME_ACCEPT, RESUME_MAX_BYTES } from "@/lib/interview/resume";
import {
  getOnboardingInterviewPrefill,
  readOnboardingPreferences,
} from "@/lib/onboarding";
import {
  parseQuestionSet,
  parseResumeProfile,
  validateInterviewSetup,
  validateTranscript,
} from "@/lib/interview/validation";

import preparationStyles from "./interview-preparation.module.css";
import sessionStyles from "./interview-session.module.css";

type Step = "setup" | "resume" | "review" | "mode" | "interview" | "confirm" | "complete";
type PreparationStep = Extract<Step, "setup" | "resume" | "review">;
type EvaluationFailure =
  "invalid_result" | "missing_data" | "service_failure" | "storage_failure" | null;
type InputMode = "text" | "microphone";
type AsyncAction = "questions" | "resume" | "evaluation";

const STEP_LABELS = [
  "Setup",
  "Resume",
  "Review",
  "Questions",
  "Mode",
  "Interview",
  "Confirm",
  "Saved",
];

const STEP_PROGRESS: Record<Step, number> = {
  setup: 0,
  resume: 1,
  review: 2,
  mode: 4,
  interview: 5,
  confirm: 6,
  complete: 7,
};

const PREPARATION_STEPS: Array<{ key: PreparationStep; label: string }> = [
  { key: "setup", label: "Scenario" },
  { key: "resume", label: "Resume" },
  { key: "review", label: "Review" },
];

const MODE_SELECTION_STEPS = ["Setup", "Resume", "Review", "Mode Selection", "Interview"];

function PreparationStepper({ current }: { current: PreparationStep }) {
  const currentIndex = PREPARATION_STEPS.findIndex(({ key }) => key === current);

  return (
    <ol
      className={preparationStyles.setupJourney}
      aria-label="Interview preparation steps"
    >
      {PREPARATION_STEPS.map(({ key, label }, index) => {
        const state =
          index < currentIndex
            ? "completed"
            : index === currentIndex
              ? "current"
              : "upcoming";
        return (
          <li
            key={key}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span aria-hidden="true">{state === "completed" ? "✓" : index + 1}</span>
            <strong>{label}</strong>
            <small>{state === "completed" ? "Complete" : state}</small>
          </li>
        );
      })}
    </ol>
  );
}

function ModeSelectionStepper() {
  return (
    <ol
      className={preparationStyles.modeJourney}
      aria-label="Interview preparation steps"
    >
      {MODE_SELECTION_STEPS.map((label, index) => {
        const state = index < 3 ? "completed" : index === 3 ? "current" : "upcoming";
        return (
          <li
            key={label}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span aria-hidden="true">{state === "completed" ? "✓" : index + 1}</span>
            <strong>{label}</strong>
            <small>{state === "completed" ? "Complete" : state}</small>
          </li>
        );
      })}
    </ol>
  );
}

function fileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Resume could not be read."));
    reader.onerror = () => reject(new Error("Resume could not be read."));
    reader.readAsDataURL(file);
  });
}

async function readServicePayload(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function serviceFailureCode(value: unknown): string | null {
  if (!value || typeof value !== "object" || !("code" in value)) return null;
  const code = (value as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function formatSessionTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function countFillerWords(transcript: string): number {
  return transcript.match(/\b(?:um+|uh+|erm+|ah+)\b|\byou know\b/gi)?.length ?? 0;
}

export function InterviewSimulator() {
  const [step, setStep] = useState<Step>("setup");
  const [setup, setSetup] = useState<InterviewSetup>(DEFAULT_INTERVIEW_SETUP);
  const [setupErrors, setSetupErrors] = useState<Record<string, string>>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const [manualResumeText, setManualResumeText] = useState("");
  const [resumeStatus, setResumeStatus] = useState<"idle" | "extracting" | "error">(
    "idle",
  );
  const [resumeError, setResumeError] = useState("");
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [questionStatus, setQuestionStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [questionError, setQuestionError] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "microphone">("text");
  const [modeError, setModeError] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState("");
  const [responses, setResponses] = useState<ConfirmedResponse[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechError, setSpeechError] = useState("");
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [completedAttempt, setCompletedAttempt] =
    useState<CompletedInterviewAttempt | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [evaluationStatus, setEvaluationStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [evaluationError, setEvaluationError] = useState("");
  const [evaluationFailure, setEvaluationFailure] = useState<EvaluationFailure>(null);
  const [focusedRetryGoal, setFocusedRetryGoal] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [speakingSeconds, setSpeakingSeconds] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [cameraIntent, setCameraIntent] = useState(false);
  const [cameraPreviewOpen, setCameraPreviewOpen] = useState(false);
  const [selectedInputMode, setSelectedInputMode] = useState<InputMode | null>(null);
  const [hasPausedSession, setHasPausedSession] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const wantListeningRef = useRef(false);
  const interviewerSpeechRef = useRef<SpeakQuestionHandle | null>(null);
  const interviewerSpeechTokenRef = useRef(0);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const cameraDialogRef = useRef<HTMLElement | null>(null);
  const cameraCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const cameraPreviewTriggerRef = useRef<HTMLButtonElement | null>(null);
  const onboardingPracticeModeRef = useRef<InputMode | null>(null);
  const requestTokenRef = useRef<Record<AsyncAction, number>>({
    questions: 0,
    resume: 0,
    evaluation: 0,
  });
  const requestInFlightRef = useRef<Record<AsyncAction, boolean>>({
    questions: false,
    resume: false,
    evaluation: false,
  });
  const requestControllerRef = useRef<Record<AsyncAction, AbortController | null>>({
    questions: null,
    resume: null,
    evaluation: null,
  });
  const isActiveSession = step === "interview" || step === "confirm";
  const {
    attachVideo: attachCameraVideo,
    status: cameraStatus,
    presence: cameraPresence,
    orientation: cameraOrientation,
    errorMessage: cameraErrorMessage,
  } = useCameraPresence({
    enabled: cameraIntent,
    active: isActiveSession || cameraPreviewOpen,
  });

  const beginRequest = (action: AsyncAction) => {
    if (requestInFlightRef.current[action]) return null;

    requestControllerRef.current[action]?.abort();
    const controller = new AbortController();
    const token = requestTokenRef.current[action] + 1;
    requestTokenRef.current[action] = token;
    requestInFlightRef.current[action] = true;
    requestControllerRef.current[action] = controller;
    return { controller, token };
  };

  const isCurrentRequest = (
    action: AsyncAction,
    token: number,
    controller: AbortController,
  ) =>
    requestTokenRef.current[action] === token &&
    requestControllerRef.current[action] === controller &&
    !controller.signal.aborted;

  const finishRequest = (
    action: AsyncAction,
    token: number,
    controller: AbortController,
  ) => {
    if (!isCurrentRequest(action, token, controller)) return;
    requestInFlightRef.current[action] = false;
    requestControllerRef.current[action] = null;
  };

  const cancelRequest = (action: AsyncAction) => {
    requestTokenRef.current[action] += 1;
    requestInFlightRef.current[action] = false;
    requestControllerRef.current[action]?.abort();
    requestControllerRef.current[action] = null;
  };

  const cancelAllRequests = () => {
    (Object.keys(requestControllerRef.current) as AsyncAction[]).forEach(cancelRequest);
  };

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const preferences = readOnboardingPreferences(window.localStorage);
        if (!preferences) return;
        const prefill = getOnboardingInterviewPrefill(preferences);
        setSetup((current) =>
          current.role || current.organization || current.description || current.goals
            ? current
            : { ...current, ...prefill },
        );
        onboardingPracticeModeRef.current = preferences.practiceMode;
        setSelectedInputMode(preferences.practiceMode);
      } catch {
        // Onboarding remains optional when browser storage is unavailable.
      }
    });
  }, []);

  useEffect(() => {
    if (!cameraPreviewOpen) return;

    queueMicrotask(() => cameraCloseButtonRef.current?.focus());
  }, [cameraPreviewOpen]);

  useEffect(
    () => () => {
      wantListeningRef.current = false;
      recognitionRef.current?.abort?.();
      recognitionRef.current?.stop();
      interviewerSpeechTokenRef.current += 1;
      interviewerSpeechRef.current?.cancel();
      interviewerSpeechRef.current = null;
      cancelInterviewSpeech();
      (Object.keys(requestControllerRef.current) as AsyncAction[]).forEach((action) => {
        requestTokenRef.current[action] += 1;
        requestInFlightRef.current[action] = false;
        requestControllerRef.current[action]?.abort();
        requestControllerRef.current[action] = null;
      });
    },
    [],
  );

  const isInterviewFocusMode = isActiveSession;

  useEffect(() => {
    document.documentElement.dataset.interviewFocus = String(isInterviewFocusMode);
    window.dispatchEvent(
      new CustomEvent("ameego:interview-state", {
        detail: { active: isInterviewFocusMode },
      }),
    );
  }, [isInterviewFocusMode]);

  useEffect(
    () => () => {
      delete document.documentElement.dataset.interviewFocus;
      window.dispatchEvent(
        new CustomEvent("ameego:interview-state", { detail: { active: false } }),
      );
    },
    [],
  );

  useEffect(() => {
    if (step !== "interview" && step !== "confirm") return;
    const timer = window.setInterval(
      () => setElapsedSeconds((current) => current + 1),
      1_000,
    );
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (!isListening) return;
    const timer = window.setInterval(
      () => setSpeakingSeconds((current) => current + 1),
      1_000,
    );
    return () => window.clearInterval(timer);
  }, [isListening]);

  useEffect(() => {
    const questionText = questionSet?.questions[questionIndex]?.text?.trim() ?? "";

    const stopInterviewerSpeech = () => {
      interviewerSpeechTokenRef.current += 1;
      interviewerSpeechRef.current?.cancel();
      interviewerSpeechRef.current = null;
      cancelInterviewSpeech();
      setIsInterviewerSpeaking(false);
    };

    if (step !== "interview" || !questionText) {
      stopInterviewerSpeech();
      return;
    }

    // Learner turn stays locked until the interviewer finishes speaking.
    if (wantListeningRef.current || recognitionRef.current) {
      wantListeningRef.current = false;
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      setInterimTranscript("");
    }

    const token = interviewerSpeechTokenRef.current + 1;
    interviewerSpeechTokenRef.current = token;
    interviewerSpeechRef.current?.cancel();
    setIsInterviewerSpeaking(true);
    setAnnouncement(
      "Interviewer is speaking. Your turn starts when the question finishes.",
    );

    const handle = speakInterviewQuestion(questionText);
    interviewerSpeechRef.current = handle;

    const timeoutMs = interviewerSpeechTimeoutMs(questionText);
    const timeoutId = window.setTimeout(() => {
      if (interviewerSpeechTokenRef.current !== token) return;
      handle.cancel();
    }, timeoutMs);

    void handle.finished.then((reason) => {
      window.clearTimeout(timeoutId);
      if (interviewerSpeechTokenRef.current !== token) return;
      interviewerSpeechRef.current = null;
      setIsInterviewerSpeaking(false);
      if (reason === "ended" || reason === "cancelled") {
        setAnnouncement("Your turn. Answer the question when you are ready.");
      } else if (reason === "unsupported" || reason === "error") {
        setAnnouncement(
          "Interviewer speech was unavailable. You can answer now using text or microphone.",
        );
      }
    });

    return () => {
      window.clearTimeout(timeoutId);
      if (interviewerSpeechTokenRef.current === token) {
        handle.cancel();
        interviewerSpeechRef.current = null;
      }
    };
  }, [
    step,
    questionIndex,
    questionSet?.questions[questionIndex]?.id,
    questionSet?.questions[questionIndex]?.text,
  ]);

  const confirmedContext: ConfirmedInterviewContext = { setup, resumeProfile };

  const submitSetup = () => {
    const result = validateInterviewSetup(setup);
    if (!result.success) {
      setSetupErrors(result.errors);
      setAnnouncement("Interview setup has errors. Review the marked fields.");
      return;
    }
    setSetup(result.data);
    setSetupErrors({});
    setStep("resume");
    setAnnouncement("Interview setup saved. Resume upload is optional.");
  };

  const extractResume = async () => {
    if (!resumeFile) {
      setResumeError("Choose a resume file, use manual text, or skip this step.");
      return;
    }
    if (resumeFile.size > RESUME_MAX_BYTES) {
      setResumeError("Resume must be no larger than 5 MB.");
      return;
    }

    const request = beginRequest("resume");
    if (!request) return;
    setResumeStatus("extracting");
    setResumeError("");
    try {
      const fileData = await fileAsDataUrl(resumeFile);
      if (!isCurrentRequest("resume", request.token, request.controller)) return;
      const response = await fetch("/api/interview/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: request.controller.signal,
        body: JSON.stringify({
          filename: resumeFile.name,
          mimeType: resumeFile.type || "application/octet-stream",
          fileData,
        }),
      });
      const result = await readServicePayload(response);
      if (!isCurrentRequest("resume", request.token, request.controller)) return;
      if (!response.ok) throw new Error("resume_personalization_unavailable");
      const profile =
        result && typeof result === "object" && "profile" in result
          ? parseResumeProfile((result as { profile: unknown }).profile)
          : null;
      if (!profile) throw new Error("resume_personalization_unavailable");

      setResumeProfile(profile);
      setResumeFile(null);
      setResumeStatus("idle");
      setStep("review");
      setAnnouncement("Resume information extracted. Review every detail before use.");
    } catch {
      if (!isCurrentRequest("resume", request.token, request.controller)) return;
      setResumeStatus("error");
      setResumeError(RESUME_PERSONALIZATION_UNAVAILABLE_MESSAGE);
    } finally {
      finishRequest("resume", request.token, request.controller);
    }
  };

  const applyManualResume = () => {
    if (!manualResumeText.trim()) {
      setResumeError("Enter resume highlights before using the manual fallback.");
      return;
    }
    setResumeProfile({
      ...EMPTY_RESUME_PROFILE,
      experience: [manualResumeText.trim()],
    });
    setResumeFile(null);
    setResumeStatus("idle");
    setResumeError("");
    setStep("review");
    setAnnouncement("Manual resume information added. Review it before use.");
  };

  const clearResumeFile = () => {
    cancelRequest("resume");
    setResumeFile(null);
    setResumeStatus("idle");
    setResumeError("");
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
    setAnnouncement("Selected resume file removed.");
  };

  const continueWithoutResume = () => {
    clearResumeFile();
    setResumeProfile(null);
    setStep("review");
  };

  const previewResumeFile = () => {
    if (!resumeFile) return;
    if (typeof URL.createObjectURL !== "function") {
      setResumeError("File preview is unavailable in this browser.");
      return;
    }
    const previewUrl = URL.createObjectURL(resumeFile);
    window.open(previewUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
    setAnnouncement(`Preview opened for ${resumeFile.name}.`);
  };

  const generateQuestions = async () => {
    const request = beginRequest("questions");
    if (!request) return;
    setQuestionStatus("loading");
    setQuestionError("");
    try {
      const response = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: request.controller.signal,
        body: JSON.stringify(confirmedContext),
      });
      const result = await readServicePayload(response);
      if (!isCurrentRequest("questions", request.token, request.controller)) return;
      if (!response.ok) throw new Error("personalization_unavailable");
      const parsed = parseQuestionSet(result, confirmedContext);
      if (!parsed) throw new Error("personalization_unavailable");
      setQuestionSet(parsed);
      setQuestionStatus("idle");
      setHasPausedSession(false);
      setCameraPreviewOpen(false);
      setSelectedInputMode(onboardingPracticeModeRef.current);
      setStep("mode");
      setAnnouncement("Personalized questions are ready. Choose an input mode.");
    } catch {
      if (!isCurrentRequest("questions", request.token, request.controller)) return;
      setQuestionStatus("error");
      setQuestionError(PERSONALIZATION_UNAVAILABLE_MESSAGE);
    } finally {
      finishRequest("questions", request.token, request.controller);
    }
  };

  const useGeneralFallback = () => {
    cancelRequest("questions");
    setQuestionSet(createGeneralQuestionFallback(confirmedContext));
    setQuestionStatus("idle");
    setHasPausedSession(false);
    setCameraPreviewOpen(false);
    setSelectedInputMode(onboardingPracticeModeRef.current);
    setStep("mode");
    setAnnouncement("Standard interview questions selected. Your practice can continue.");
  };

  const beginTextMode = () => {
    setInputMode("text");
    setModeError("");
    setHasPausedSession(false);
    setElapsedSeconds(0);
    setSpeakingSeconds(0);
    setStep("interview");
  };

  const beginMicrophoneMode = async () => {
    setModeError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setModeError("Microphone access is unavailable. Choose text response mode.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setInputMode("microphone");
      setHasPausedSession(false);
      setElapsedSeconds(0);
      setSpeakingSeconds(0);
      setStep("interview");
    } catch {
      setModeError(
        "Microphone permission was denied or unavailable. Text response mode still works.",
      );
    }
  };

  const startSelectedMode = () => {
    if (!selectedInputMode) {
      setModeError("Choose text or microphone response mode to continue.");
      return;
    }

    if (selectedInputMode === "text") {
      beginTextMode();
      return;
    }

    void beginMicrophoneMode();
  };

  const continueWithSelectedMode = (trigger?: HTMLButtonElement) => {
    if (!selectedInputMode) {
      setModeError("Choose text or microphone response mode to continue.");
      return;
    }

    if (cameraIntent) {
      cameraPreviewTriggerRef.current = trigger ?? null;
      setCameraPreviewOpen(true);
      setAnnouncement("Camera preview opened. Confirm when you are ready.");
      return;
    }

    startSelectedMode();
  };

  const confirmCameraPreview = () => {
    setCameraPreviewOpen(false);
    cameraPreviewTriggerRef.current = null;
    setAnnouncement("Camera preview confirmed. Starting your interview.");
    startSelectedMode();
  };

  const closeCameraPreview = () => {
    setCameraPreviewOpen(false);
    setCameraIntent(false);
    setAnnouncement("Camera preview closed. Camera is now off.");
    queueMicrotask(() => cameraPreviewTriggerRef.current?.focus());
  };

  const handleCameraDialogKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeCameraPreview();
      return;
    }

    if (event.key !== "Tab") return;
    const buttons = cameraDialogRef.current?.querySelectorAll<HTMLButtonElement>(
      "button:not(:disabled)",
    );
    if (!buttons?.length) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const retryCameraPreview = () => {
    setCameraIntent(false);
    queueMicrotask(() => setCameraIntent(true));
  };

  const startListening = () => {
    if (isInterviewerSpeaking) {
      setSpeechError(
        "Wait for the interviewer to finish speaking before using the microphone.",
      );
      return;
    }
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setSpeechError(
        "Speech recognition is not supported in this browser. Type or edit your response.",
      );
      return;
    }

    wantListeningRef.current = true;
    setSpeechError("");
    setInterimTranscript("");

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const { finalChunk, interimText } = extractRecognitionUpdate(event);
      if (finalChunk) {
        setDraft((current) => appendTranscriptSegment(current, finalChunk));
      }
      setInterimTranscript(interimText);
    };
    recognition.onerror = (event) => {
      const code = event.error;
      if (code && RECOVERABLE_SPEECH_ERRORS.has(code)) {
        // Browser often ends the session after silence; auto-restart via onend.
        return;
      }
      wantListeningRef.current = false;
      setIsListening(false);
      setInterimTranscript("");
      setSpeechError(speechErrorMessage(code));
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (!wantListeningRef.current) {
        setIsListening(false);
        setInterimTranscript("");
        return;
      }
      // Browsers frequently stop continuous recognition after a pause.
      try {
        const next = new Recognition();
        next.continuous = true;
        next.interimResults = true;
        next.lang = "en-US";
        next.onresult = recognition.onresult;
        next.onerror = recognition.onerror;
        next.onend = recognition.onend;
        recognitionRef.current = next;
        next.start();
        setIsListening(true);
      } catch {
        wantListeningRef.current = false;
        setIsListening(false);
        setInterimTranscript("");
        setSpeechError(
          "Speech recognition could not restart. Edit or type your response.",
        );
      }
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
      setAnnouncement("Microphone listening. Speak your answer, then stop to review.");
    } catch {
      wantListeningRef.current = false;
      setIsListening(false);
      setSpeechError("Speech recognition could not start. Edit or type your response.");
    }
  };

  const stopListening = () => {
    wantListeningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setInterimTranscript("");
    setAnnouncement("Microphone stopped. Review and edit the transcript.");
  };

  const endInterview = () => {
    interviewerSpeechTokenRef.current += 1;
    interviewerSpeechRef.current?.cancel();
    interviewerSpeechRef.current = null;
    cancelInterviewSpeech();
    setIsInterviewerSpeaking(false);
    if (isListening || wantListeningRef.current) {
      stopListening();
    }
    setSpeechError("");
    setDraft("");
    setDraftError("");
    setInterimTranscript("");
    setCameraPreviewOpen(false);
    setHasPausedSession(true);
    setStep("mode");
    setAnnouncement(
      "Interview paused without saving a completed attempt. Choose Resume to keep confirmed responses or Discard to start Question 1 again.",
    );
  };

  const discardPausedSession = () => {
    interviewerSpeechTokenRef.current += 1;
    interviewerSpeechRef.current?.cancel();
    interviewerSpeechRef.current = null;
    cancelInterviewSpeech();
    wantListeningRef.current = false;
    recognitionRef.current?.abort?.();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setIsInterviewerSpeaking(false);
    setQuestionIndex(0);
    setDraft("");
    setDraftError("");
    setResponses([]);
    setInterimTranscript("");
    setSpeechError("");
    setElapsedSeconds(0);
    setSpeakingSeconds(0);
    setCameraIntent(false);
    setCameraPreviewOpen(false);
    setSelectedInputMode(null);
    setModeError("");
    setHasPausedSession(false);
    setAnnouncement(
      "Partial interview discarded. Choose a response mode to begin again at Question 1.",
    );
  };

  const reviewTranscript = () => {
    if (isInterviewerSpeaking) {
      setDraftError("Wait for the interviewer to finish speaking before continuing.");
      return;
    }
    if (isListening || wantListeningRef.current) stopListening();
    setSpeechError("");
    const error = validateTranscript(draft);
    if (error) {
      setDraftError(error);
      return;
    }
    setDraftError("");
    setStep("confirm");
    setAnnouncement("Review and edit the transcript before confirming it.");
  };

  const confirmTranscript = () => {
    if (!questionSet) return;
    const error = validateTranscript(draft);
    if (error) {
      setDraftError(error);
      return;
    }

    const response: ConfirmedResponse = {
      questionId: questionSet.questions[questionIndex].id,
      transcript: draft.trim(),
      inputMode,
    };
    const nextResponses = [...responses, response];
    const isLastQuestion = questionIndex === questionSet.questions.length - 1;

    if (isLastQuestion) {
      try {
        const attempt = createCompletedAttempt({
          context: confirmedContext,
          questionSet,
          responses: nextResponses,
          retryGoal: focusedRetryGoal,
        });
        saveCompletedAttempt(window.localStorage, attempt);
        setCompletedAttempt(attempt);
        setResponses(nextResponses);
        setSaveError("");
        setStep("complete");
        setAnnouncement("Interview attempt completed and saved on this device.");
      } catch {
        setSaveError(
          "The completed attempt could not be saved. Restore browser storage and retry.",
        );
      }
      return;
    }

    setResponses(nextResponses);
    setQuestionIndex((current) => current + 1);
    setDraft("");
    setDraftError("");
    setInterimTranscript("");
    setSpeechError("");
    setStep("interview");
    setAnnouncement(`Response confirmed. Question ${questionIndex + 2} is ready.`);
  };

  const evaluateCompletedAttempt = async () => {
    if (!completedAttempt) return;
    const requestState = beginRequest("evaluation");
    if (!requestState) return;
    const request: EvaluationRequest = {
      attemptId: completedAttempt.id,
      role: completedAttempt.context.setup.role,
      organization: completedAttempt.context.setup.organization,
      exchanges: completedAttempt.questions.map((question) => ({
        questionId: question.id,
        question: question.text,
        transcript:
          completedAttempt.responses.find(
            (response) => response.questionId === question.id,
          )?.transcript ?? "",
      })),
    };
    const validatedRequest = parseEvaluationRequest(request);
    if (!validatedRequest) {
      setEvaluationStatus("error");
      setEvaluationFailure("missing_data");
      setEvaluationError("The saved transcript is incomplete and cannot be evaluated.");
      finishRequest("evaluation", requestState.token, requestState.controller);
      return;
    }

    setEvaluationStatus("loading");
    setEvaluationFailure(null);
    setEvaluationError("");
    setElapsedSeconds(0);
    try {
      const response = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: requestState.controller.signal,
        body: JSON.stringify(validatedRequest),
      });
      const result = await readServicePayload(response);
      if (!isCurrentRequest("evaluation", requestState.token, requestState.controller)) {
        return;
      }
      if (!response.ok) {
        const code = serviceFailureCode(result);
        setEvaluationStatus("error");
        setEvaluationFailure(
          code === "invalid_result" ? "invalid_result" : "service_failure",
        );
        setEvaluationError(
          code === "invalid_result"
            ? FEEDBACK_INVALID_MESSAGE
            : FEEDBACK_UNAVAILABLE_MESSAGE,
        );
        return;
      }
      const parsed = parseInterviewEvaluation(result, validatedRequest);
      if (!parsed) {
        setEvaluationStatus("error");
        setEvaluationFailure("invalid_result");
        setEvaluationError(FEEDBACK_INVALID_MESSAGE);
        return;
      }
      let updatedAttempt: CompletedInterviewAttempt;
      try {
        updatedAttempt = saveAttemptEvaluation(
          window.localStorage,
          completedAttempt.id,
          parsed,
        );
      } catch {
        setEvaluationStatus("error");
        setEvaluationFailure("storage_failure");
        setEvaluationError(
          "Your feedback is ready but could not be saved on this device. Check browser storage and try again.",
        );
        return;
      }
      setCompletedAttempt(updatedAttempt);
      setEvaluation(parsed);
      setEvaluationStatus("idle");
      setAnnouncement("Evidence-based interview feedback is ready.");
    } catch {
      if (!isCurrentRequest("evaluation", requestState.token, requestState.controller)) {
        return;
      }
      setEvaluationStatus("error");
      setEvaluationFailure("service_failure");
      setEvaluationError(FEEDBACK_UNAVAILABLE_MESSAGE);
    } finally {
      finishRequest("evaluation", requestState.token, requestState.controller);
    }
  };

  const retrySameScenario = () => {
    if (!evaluation || !questionSet) return;
    cancelRequest("evaluation");
    setFocusedRetryGoal(evaluation.nextPracticeAction);
    setQuestionIndex(0);
    setDraft("");
    setDraftError("");
    setResponses([]);
    setSaveError("");
    setCompletedAttempt(null);
    setEvaluation(null);
    setEvaluationStatus("idle");
    setEvaluationFailure(null);
    setEvaluationError("");
    setElapsedSeconds(0);
    setSpeakingSeconds(0);
    setCameraPreviewOpen(false);
    setSelectedInputMode(null);
    setHasPausedSession(false);
    setStep("mode");
    setAnnouncement(
      "Retry ready. The same scenario, questions, and focused learning goal were preserved.",
    );
  };

  const restart = () => {
    cancelAllRequests();
    setStep("setup");
    setSetup(DEFAULT_INTERVIEW_SETUP);
    setResumeFile(null);
    setResumeProfile(null);
    setManualResumeText("");
    setQuestionSet(null);
    setQuestionIndex(0);
    setDraft("");
    setResponses([]);
    setSaveError("");
    setCompletedAttempt(null);
    setEvaluation(null);
    setEvaluationStatus("idle");
    setEvaluationFailure(null);
    setEvaluationError("");
    setFocusedRetryGoal("");
    setSpeakingSeconds(0);
    setCameraIntent(false);
    setCameraPreviewOpen(false);
    setSelectedInputMode(null);
    setHasPausedSession(false);
  };

  const currentQuestion = questionSet?.questions[questionIndex];
  const isPreparationStep = step === "setup" || step === "resume" || step === "review";
  const isModeSelection = step === "mode";
  const fillerWordCount = countFillerWords(draft);
  const interviewTypeLabel =
    setup.interviewType === "custom"
      ? setup.customInterviewType
      : setup.interviewType.replaceAll("_", " ");
  const resumeHighlightCount = resumeProfile
    ? Object.values(resumeProfile).flat().length
    : 0;
  const sessionLengthLabel =
    setup.questionCount === 3
      ? "Short session"
      : setup.questionCount === 5
        ? "Standard session"
        : "Extended session";
  const resumeStatusLabel = resumeProfile
    ? `${resumeHighlightCount} confirmed highlight${resumeHighlightCount === 1 ? "" : "s"}`
    : resumeFile
      ? "File selected"
      : "Not added (optional)";
  const preparationActionLabel =
    step === "setup"
      ? "Continue to Resume"
      : step === "resume"
        ? resumeStatus === "extracting"
          ? "Extracting Resume..."
          : manualResumeText.trim()
            ? "Use Manual Resume Text"
            : resumeFile
              ? "Extract Resume and Continue"
              : "Continue without Resume"
        : questionStatus === "loading"
          ? "Generating Questions..."
          : "Start Interview";
  const preparationActionDisabled =
    (step === "resume" && resumeStatus === "extracting") ||
    (step === "review" && questionStatus === "loading");

  const continuePreparation = () => {
    if (step === "setup") {
      submitSetup();
      return;
    }
    if (step === "resume") {
      if (manualResumeText.trim()) {
        applyManualResume();
      } else if (resumeFile) {
        void extractResume();
      } else {
        continueWithoutResume();
      }
      return;
    }
    if (step === "review") {
      void generateQuestions();
    }
  };

  return (
    <div
      className={`page-stack interview-simulator${isPreparationStep ? ` ${preparationStyles.preparationScreen}` : ""}${isModeSelection ? ` ${preparationStyles.modeSelectionScreen}` : ""}${isActiveSession ? ` ${sessionStyles.simulatorScreen}` : ""}${step === "complete" ? " interview-results-mode" : ""}`}
    >
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <header className="interview-simulator-header">
        <PixelBadge tone="mint">Interview Center</PixelBadge>
        <p className="eyebrow">Adaptive Practice</p>
        <h1>Build a grounded practice interview.</h1>
        <p className="hero-lede">
          Confirm your context, answer personalized questions, and request an
          evidence-based STAR communication review.
        </p>
      </header>

      <ol className="interview-stepper" aria-label="Interview progress">
        {STEP_LABELS.map((label, index) => (
          <li key={label} className={index <= STEP_PROGRESS[step] ? "is-reached" : ""}>
            <span aria-hidden="true">{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {isPreparationStep ? <PracticeLobbyScene stage={step} /> : null}

      {isPreparationStep ? (
        <PreparationStepper current={step as PreparationStep} />
      ) : null}

      {focusedRetryGoal && step !== "complete" ? (
        <section className="focused-retry-banner" aria-labelledby="focused-retry-heading">
          <PixelBadge tone="amber">Focused retry</PixelBadge>
          <div>
            <h2 id="focused-retry-heading">Your goal for this attempt</h2>
            <p>{focusedRetryGoal}</p>
            <p className="focused-retry-context">
              Scenario preserved: {setup.role} at {setup.organization}
            </p>
          </div>
        </section>
      ) : null}

      {step === "setup" ? (
        <PixelPanel
          tone="dark"
          className={`${preparationStyles.preparationPanel} ${preparationStyles.setupPanel}`}
        >
          <header className={preparationStyles.preparationTitle}>
            <p>Practice Configuration</p>
            <h1>Interview Setup</h1>
          </header>
          <InterviewSetupForm
            value={setup}
            errors={setupErrors}
            onChange={setSetup}
            onSubmit={submitSetup}
          />
        </PixelPanel>
      ) : null}

      {step === "resume" ? (
        <PixelPanel
          tone="dark"
          className={`${preparationStyles.preparationPanel} ${preparationStyles.resumePanel}`}
        >
          <header className={preparationStyles.preparationTitle}>
            <p>Optional Context</p>
            <h1>Resume Upload</h1>
          </header>
          <div className={preparationStyles.resumeWorkspace}>
            <div className={preparationStyles.uploadColumn}>
              <label className={preparationStyles.uploadZone} htmlFor="resume-file">
                <PixelIcon name="resume" size="large" />
                <strong>Choose a resume file</strong>
                <span>PDF, DOC, DOCX, RTF, TXT, or Markdown — maximum 5 MB</span>
                <small>Click or press Enter to browse</small>
                <input
                  ref={resumeInputRef}
                  id="resume-file"
                  aria-label="Resume file"
                  type="file"
                  accept={RESUME_ACCEPT}
                  onChange={(event) => {
                    setResumeFile(event.target.files?.[0] ?? null);
                    setResumeError("");
                  }}
                />
              </label>

              {resumeFile ? (
                <section
                  className={preparationStyles.uploadedFile}
                  aria-label="Uploaded resume file"
                >
                  <PixelIcon name="resume" size="small" />
                  <div>
                    <strong>{resumeFile.name}</strong>
                    <span>{Math.max(1, Math.round(resumeFile.size / 1024))} KB</span>
                  </div>
                  <div className={preparationStyles.fileActions}>
                    <PixelButton variant="ghost" onClick={previewResumeFile}>
                      <span className="sr-only">Preview selected resume file</span>
                      <span aria-hidden="true">Preview</span>
                    </PixelButton>
                    <PixelButton variant="secondary" onClick={clearResumeFile}>
                      <span className="sr-only">Remove selected resume file</span>
                      <span aria-hidden="true">Remove</span>
                    </PixelButton>
                  </div>
                </section>
              ) : (
                <p className={preparationStyles.filePrivacy}>
                  Raw files are used for extraction only and are not saved in browser
                  progress.
                </p>
              )}
            </div>

            <div className={preparationStyles.extractColumn}>
              <div className={preparationStyles.sectionTitle}>Uploaded Resume</div>
              <p>
                Select a file, preview it if needed, then continue to extract only
                confirmed interview-relevant details.
              </p>
              <div className={preparationStyles.sidebarPrompt} role="status">
                Continue from the session summary when your resume choice is ready.
              </div>
            </div>
          </div>
          {resumeStatus === "error" ? (
            <div className={preparationStyles.inlineError} role="alert">
              <strong>Resume details were not added.</strong>
              <span>{resumeError}</span>
            </div>
          ) : null}
          <div className={preparationStyles.manualResume}>
            <label htmlFor="manual-resume">Manual resume highlights</label>
            <textarea
              id="manual-resume"
              rows={5}
              value={manualResumeText}
              onChange={(event) => setManualResumeText(event.target.value)}
              placeholder="Paste relevant education, experience, projects, skills, leadership, or achievements."
            />
          </div>
        </PixelPanel>
      ) : null}

      {step === "review" ? (
        <PixelPanel
          tone="dark"
          className={`${preparationStyles.preparationPanel} ${preparationStyles.reviewPanel}`}
        >
          <header className={preparationStyles.preparationTitle}>
            <p>Final Check</p>
            <h1>Review Your Profile</h1>
          </header>

          <div className={preparationStyles.reviewColumns}>
            <section className={preparationStyles.detailsPanel}>
              <h2>Interview Details</h2>
              <div
                className={preparationStyles.reviewBadges}
                aria-label="Session summary"
              >
                <PixelBadge tone="mint">{setup.difficulty}</PixelBadge>
                <PixelBadge tone="amber">{setup.questionCount} questions</PixelBadge>
              </div>
              <dl>
                <div>
                  <dt>Type</dt>
                  <dd>{interviewTypeLabel}</dd>
                </div>
                <div>
                  <dt>Position</dt>
                  <dd>{setup.role}</dd>
                </div>
                <div>
                  <dt>Company</dt>
                  <dd>{setup.organization}</dd>
                </div>
                <div>
                  <dt>Difficulty</dt>
                  <dd>{setup.difficulty}</dd>
                </div>
                <div>
                  <dt>Length</dt>
                  <dd>{setup.questionCount} questions</dd>
                </div>
                <div>
                  <dt>Goals</dt>
                  <dd>{setup.goals || "General interview practice"}</dd>
                </div>
              </dl>
            </section>

            <section className={preparationStyles.resumeSummaryPanel}>
              <h2>Resume Summary</h2>
              {resumeProfile ? (
                <>
                  <p className={preparationStyles.resumeHighlightCount}>
                    {resumeHighlightCount} confirmed resume{" "}
                    {resumeHighlightCount === 1 ? "highlight" : "highlights"}
                  </p>
                  <p>Edit or remove any extracted detail that is inaccurate.</p>
                  <ResumeProfileEditor
                    profile={resumeProfile}
                    onChange={setResumeProfile}
                  />
                  <PixelButton variant="secondary" onClick={() => setResumeProfile(null)}>
                    Remove resume information
                  </PixelButton>
                </>
              ) : (
                <div className={preparationStyles.noResume} role="status">
                  <PixelIcon name="resume" size="medium" />
                  <span>
                    No resume information will be used. Questions will use setup context
                    only.
                  </span>
                </div>
              )}
            </section>
          </div>

          <div className={preparationStyles.reviewActions}>
            <PixelButton variant="secondary" onClick={() => setStep("setup")}>
              Edit setup
            </PixelButton>
          </div>

          {questionStatus === "error" ? (
            <div className={preparationStyles.inlineError} role="alert">
              <strong>Personalized questions could not be generated.</strong>
              <span>{questionError}</span>
              <div className={preparationStyles.errorActions}>
                <PixelButton onClick={generateQuestions}>Retry Generation</PixelButton>
                <PixelButton variant="ghost" onClick={useGeneralFallback}>
                  Continue with Standard Interview
                </PixelButton>
              </div>
            </div>
          ) : null}
        </PixelPanel>
      ) : null}

      {isPreparationStep ? (
        <aside
          className={preparationStyles.preparationSummary}
          aria-labelledby="session-summary-title"
        >
          <header className={preparationStyles.summaryHeader}>
            <p>Live Configuration</p>
            <h2 id="session-summary-title">Session Summary</h2>
          </header>
          <dl className={preparationStyles.summaryList}>
            <div>
              <dt>Interview Type</dt>
              <dd>{interviewTypeLabel || "Not set"}</dd>
            </div>
            <div>
              <dt>Position</dt>
              <dd>{setup.role || "Not set"}</dd>
            </div>
            <div>
              <dt>Company</dt>
              <dd>{setup.organization || "Not set"}</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>{setup.difficulty}</dd>
            </div>
            <div>
              <dt>Interview Length</dt>
              <dd>{sessionLengthLabel}</dd>
            </div>
            <div>
              <dt>Number of Questions</dt>
              <dd>{setup.questionCount}</dd>
            </div>
            <div>
              <dt>Uploaded Resume</dt>
              <dd>{resumeStatusLabel}</dd>
            </div>
            <div>
              <dt>Estimated Time</dt>
              <dd>About {setup.questionCount * 3} minutes</dd>
            </div>
          </dl>
          <div className={preparationStyles.summaryAction}>
            <PixelButton
              onClick={continuePreparation}
              disabled={preparationActionDisabled}
            >
              {step === "review" && questionStatus !== "loading" ? (
                <>
                  <span className="sr-only">Confirm and generate questions</span>
                  <span aria-hidden="true">Start Interview</span>
                </>
              ) : (
                preparationActionLabel
              )}
            </PixelButton>
            <small>
              {step === "setup"
                ? "Required fields are checked before continuing."
                : step === "resume"
                  ? "Resume details are optional and remain editable."
                  : "Confirm the summary before entering response mode."}
            </small>
          </div>
        </aside>
      ) : null}

      {step === "mode" && questionSet ? (
        <>
          <section
            className={preparationStyles.modeHero}
            aria-labelledby="mode-hero-title"
          >
            <div className={preparationStyles.modeDialogue}>
              <PixelBadge tone="amber">Interview Coach</PixelBadge>
              <h2 id="mode-hero-title">Welcome to your interview.</h2>
              <p>
                Your practice questions are ready. Choose how you would like to respond,
                and we will begin when you are comfortable.
              </p>
            </div>
            <Image
              className={preparationStyles.modeCoachDesk}
              src="/images/interview/mode-coach-desk.png"
              width={551}
              height={453}
              alt="Ameego interview coach seated behind a wooden desk"
              priority
            />
          </section>

          <ModeSelectionStepper />

          <PixelPanel tone="dark" className={preparationStyles.modeWorkspace}>
            <header className={preparationStyles.modeHeading}>
              <div>
                <p>Response Setup</p>
                <h1>How would you like to answer?</h1>
                <span>Choose one response method. You can review every answer.</span>
              </div>
              <div
                className={
                  questionSet.source === "general_fallback"
                    ? preparationStyles.standardReady
                    : preparationStyles.personalizedReady
                }
                role="status"
              >
                {questionSet.source === "general_fallback"
                  ? "Standard interview questions selected"
                  : "Your personalized interview is ready"}
              </div>
            </header>

            {hasPausedSession ? (
              <section
                className={preparationStyles.pausedSession}
                aria-labelledby="paused-session-heading"
              >
                <div>
                  <PixelBadge tone="amber">Interview paused</PixelBadge>
                  <div>
                    <h2 id="paused-session-heading">Continue or start clean?</h2>
                    <p>
                      {responses.length} confirmed{" "}
                      {responses.length === 1 ? "response" : "responses"} will be ready to
                      resume at Question {questionIndex + 1} of{" "}
                      {questionSet.questions.length}. Your unfinished draft was discarded.
                    </p>
                  </div>
                </div>
                <PixelButton variant="secondary" onClick={discardPausedSession}>
                  Discard and Start Over
                </PixelButton>
              </section>
            ) : null}

            <div className={preparationStyles.modeContent}>
              <div className={preparationStyles.responseModeGrid}>
                <button
                  type="button"
                  className={preparationStyles.responseModeCard}
                  data-selected={selectedInputMode === "text"}
                  aria-pressed={selectedInputMode === "text"}
                  onClick={() => {
                    setSelectedInputMode("text");
                    setModeError("");
                  }}
                >
                  <span className={preparationStyles.modeCardIcon}>
                    <PixelIcon name="speech" size="large" />
                  </span>
                  <span className={preparationStyles.modeCardCopy}>
                    <strong>Text Response</strong>
                    <span>Type, edit, and confirm each response at your own pace.</span>
                    <small>Best for quiet practice or keyboard-first access.</small>
                  </span>
                  <span className={preparationStyles.modeCardCheck} aria-hidden="true">
                    <PixelIcon name="check" size="small" />
                  </span>
                </button>

                <button
                  type="button"
                  className={preparationStyles.responseModeCard}
                  data-selected={selectedInputMode === "microphone"}
                  aria-pressed={selectedInputMode === "microphone"}
                  onClick={() => {
                    setSelectedInputMode("microphone");
                    setModeError("");
                  }}
                >
                  <span className={preparationStyles.modeCardIcon}>
                    <PixelIcon name="microphone" size="large" />
                  </span>
                  <span className={preparationStyles.modeCardCopy}>
                    <strong>Microphone Response</strong>
                    <span>
                      Speak naturally, then review and edit the live transcript.
                    </span>
                    <small>Recommended for realistic interview rehearsal.</small>
                  </span>
                  <span className={preparationStyles.modeCardCheck} aria-hidden="true">
                    <PixelIcon name="check" size="small" />
                  </span>
                </button>
              </div>

              <aside className={preparationStyles.cameraCard}>
                <span className={preparationStyles.cameraIcon} aria-hidden="true">
                  <PixelIcon name="camera" size="large" />
                </span>
                <div>
                  <strong>Optional Camera Preview</strong>
                  <p>
                    On-device framing reminders only. Preview is not stored and never
                    affects feedback.
                  </p>
                </div>
                <label className={preparationStyles.cameraToggle} htmlFor="camera-intent">
                  <input
                    id="camera-intent"
                    type="checkbox"
                    aria-label="Optional camera preview"
                    checked={cameraIntent}
                    onChange={(event) => setCameraIntent(event.target.checked)}
                  />
                  <span aria-hidden="true" />
                  <strong>{cameraIntent ? "On" : "Off"}</strong>
                </label>
              </aside>
            </div>

            <footer className={preparationStyles.modeActions}>
              <div>
                {modeError ? (
                  <div className="interview-inline-error" role="alert">
                    {modeError}
                  </div>
                ) : (
                  <p>
                    {hasPausedSession
                      ? "Resume keeps confirmed responses and returns to your current question."
                      : "Nothing starts until you select a mode and continue."}
                  </p>
                )}
              </div>
              <PixelButton
                onClick={(event) => continueWithSelectedMode(event.currentTarget)}
                disabled={!selectedInputMode}
              >
                {hasPausedSession ? "Resume Interview" : "Continue to Interview"}
              </PixelButton>
            </footer>
          </PixelPanel>

          {cameraPreviewOpen ? (
            <div className={preparationStyles.cameraModalBackdrop}>
              <section
                ref={cameraDialogRef}
                className={preparationStyles.cameraModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="camera-preview-title"
                aria-describedby="camera-preview-description"
                tabIndex={-1}
                onKeyDown={handleCameraDialogKeyDown}
              >
                <header className={preparationStyles.cameraModalHeader}>
                  <div>
                    <p>Camera Check</p>
                    <h2 id="camera-preview-title">Ready for your interview?</h2>
                  </div>
                  <button
                    ref={cameraCloseButtonRef}
                    type="button"
                    onClick={closeCameraPreview}
                    aria-label="Close camera preview and turn camera off"
                  >
                    ×
                  </button>
                </header>

                <div
                  className={preparationStyles.cameraPreviewFrame}
                  data-camera-status={cameraStatus}
                >
                  <video
                    ref={attachCameraVideo}
                    className={preparationStyles.cameraPreviewVideo}
                    playsInline
                    muted
                    autoPlay
                    aria-label="Live mirrored camera readiness preview"
                    hidden={cameraStatus !== "active" && cameraStatus !== "starting"}
                  />
                  {cameraStatus !== "active" && cameraStatus !== "starting" ? (
                    <div className={preparationStyles.cameraPreviewPlaceholder}>
                      <PixelIcon name="camera" size="large" />
                      <strong>
                        {cameraStatus === "denied"
                          ? "Camera permission denied"
                          : cameraStatus === "interrupted"
                            ? "Camera interrupted"
                            : "Camera unavailable"}
                      </strong>
                    </div>
                  ) : null}
                  {cameraStatus === "starting" ? (
                    <span className={preparationStyles.cameraStarting} role="status">
                      Starting camera preview…
                    </span>
                  ) : null}
                </div>

                <div className={preparationStyles.cameraModalStatus} role="status">
                  <span data-camera-status={cameraStatus} aria-hidden="true" />
                  <div>
                    <strong>
                      {cameraStatus === "active"
                        ? "Camera preview ready"
                        : cameraStatus === "starting"
                          ? "Checking your camera"
                          : "Camera preview is optional"}
                    </strong>
                    <p id="camera-preview-description">
                      {cameraErrorMessage ||
                        "Check your framing, then continue when you feel comfortable. Nothing is recorded or stored."}
                    </p>
                  </div>
                </div>

                <footer className={preparationStyles.cameraModalActions}>
                  {cameraStatus === "denied" ||
                  cameraStatus === "unavailable" ||
                  cameraStatus === "interrupted" ? (
                    <button
                      type="button"
                      className={preparationStyles.cameraRetryButton}
                      onClick={retryCameraPreview}
                    >
                      Retry Camera
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={preparationStyles.cameraBackButton}
                      onClick={closeCameraPreview}
                    >
                      Camera Off
                    </button>
                  )}
                  <button
                    type="button"
                    className={preparationStyles.cameraReadyButton}
                    onClick={confirmCameraPreview}
                    disabled={cameraStatus === "starting"}
                  >
                    I&apos;m Ready
                  </button>
                </footer>
              </section>
            </div>
          ) : null}
        </>
      ) : null}

      {isActiveSession && currentQuestion && questionSet ? (
        <InterviewSessionView
          step={step}
          question={currentQuestion}
          questionIndex={questionIndex}
          questionTotal={questionSet.questions.length}
          elapsedTime={formatSessionTime(elapsedSeconds)}
          speakingTime={formatSessionTime(speakingSeconds)}
          inputMode={inputMode}
          isListening={isListening}
          interimTranscript={interimTranscript}
          draft={draft}
          draftError={draftError}
          saveError={saveError}
          speechError={speechError}
          isInterviewerSpeaking={isInterviewerSpeaking}
          confirmedResponses={responses}
          fillerWordCount={fillerWordCount}
          cameraVideoRef={attachCameraVideo}
          cameraStatus={cameraStatus}
          cameraPresence={cameraPresence}
          cameraOrientation={cameraOrientation}
          cameraErrorMessage={cameraErrorMessage}
          onCameraEnable={() => setCameraIntent(true)}
          onCameraDisable={() => setCameraIntent(false)}
          onCameraRetry={() => {
            setCameraIntent(false);
            queueMicrotask(() => setCameraIntent(true));
          }}
          onDraftChange={(value) => {
            if (isInterviewerSpeaking) return;
            setDraft(value);
          }}
          onMicrophoneToggle={isListening ? stopListening : startListening}
          onEnd={endInterview}
          onNext={reviewTranscript}
          onBack={() => setStep("interview")}
          onConfirm={confirmTranscript}
        />
      ) : null}

      {step === "complete" && questionSet ? (
        <div className="interview-complete-layout">
          <section className="interview-complete-hero" aria-labelledby="complete-heading">
            <FeedbackRoomScene />
            <div className="interview-complete-summary">
              <PixelBadge tone="mint">Attempt saved</PixelBadge>
              <h2 id="complete-heading">Interview practice complete.</h2>
              <p>
                {responses.length} confirmed responses were saved on this device. Scroll
                down when you are ready to review your performance.
              </p>
              <a className="feedback-scroll-link" href="#feedback-report">
                View Feedback Report
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </section>

          <section
            id="feedback-report"
            className="interview-feedback-report"
            aria-label="Feedback Report"
          >
            {!evaluation ? (
              <div
                className={`evaluation-request ${evaluationStatus === "loading" ? "is-loading" : ""}`}
                role={evaluationStatus === "loading" ? "status" : undefined}
                aria-live="polite"
                aria-busy={evaluationStatus === "loading"}
              >
                <div className="evaluation-request-copy">
                  <p className="eyebrow">Feedback Report</p>
                  <h2>
                    {evaluationStatus === "loading"
                      ? "Building your evidence-based learning report"
                      : "Turn your completed interview into a learning plan"}
                  </h2>
                  <p>
                    Ameego Interview Coach reviews only your confirmed transcript against
                    the STAR rubric. It does not assess emotion, honesty, intelligence,
                    employability, accent, confidence, nervousness, or eye contact.
                  </p>
                </div>
                <PixelButton
                  onClick={evaluateCompletedAttempt}
                  disabled={evaluationStatus === "loading" || !completedAttempt}
                >
                  {evaluationStatus === "loading"
                    ? "Preparing feedback..."
                    : "Generate Intelligent Feedback"}
                </PixelButton>
              </div>
            ) : null}

            {evaluationStatus === "error" ? (
              <div className="interview-inline-error evaluation-error" role="alert">
                <strong>
                  {evaluationFailure === "invalid_result"
                    ? "Feedback could not be prepared."
                    : evaluationFailure === "missing_data"
                      ? "This attempt needs a complete transcript."
                      : evaluationFailure === "storage_failure"
                        ? "Validated feedback could not be saved."
                        : "Service Temporarily Unavailable"}
                </strong>
                <span>{evaluationError}</span>
                <PixelButton onClick={evaluateCompletedAttempt}>
                  Retry Feedback
                </PixelButton>
              </div>
            ) : null}

            {evaluation && completedAttempt ? (
              <EvaluationFeedback
                evaluation={evaluation}
                session={{
                  role: completedAttempt.context.setup.role,
                  organization: completedAttempt.context.setup.organization,
                  responseCount: completedAttempt.responses.length,
                }}
                onRetry={retrySameScenario}
              />
            ) : null}

            <footer className="interview-final-action">
              <p className="eyebrow">Ready for a new scenario?</p>
              <h2>Keep building your interview skills.</h2>
              <p>
                Your saved attempt remains in the Progress Library when you begin again.
              </p>
              <PixelButton onClick={restart} variant={evaluation ? "secondary" : "ghost"}>
                Start Another Interview
              </PixelButton>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}
