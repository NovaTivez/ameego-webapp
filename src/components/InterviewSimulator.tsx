"use client";

import { useEffect, useRef, useState } from "react";

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
  parseQuestionSet,
  parseResumeProfile,
  validateInterviewSetup,
  validateTranscript,
} from "@/lib/interview/validation";

import preparationStyles from "./interview-preparation.module.css";
import sessionStyles from "./interview-session.module.css";

type Step = "setup" | "resume" | "review" | "mode" | "interview" | "confirm" | "complete";
type EvaluationFailure =
  "invalid_result" | "missing_data" | "service_failure" | "storage_failure" | null;

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
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const wantListeningRef = useRef(false);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const isActiveSession = step === "interview" || step === "confirm";
  const camera = useCameraPresence({
    enabled: cameraIntent,
    active: isActiveSession,
  });

  useEffect(
    () => () => {
      wantListeningRef.current = false;
      recognitionRef.current?.abort?.();
      recognitionRef.current?.stop();
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

    setResumeStatus("extracting");
    setResumeError("");
    try {
      const response = await fetch("/api/interview/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: resumeFile.name,
          mimeType: resumeFile.type || "application/octet-stream",
          fileData: await fileAsDataUrl(resumeFile),
        }),
      });
      const result = await readServicePayload(response);
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
      setResumeStatus("error");
      setResumeError(RESUME_PERSONALIZATION_UNAVAILABLE_MESSAGE);
    }
  };

  const useManualResume = () => {
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
    setResumeFile(null);
    setResumeError("");
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
    setAnnouncement("Selected resume file removed.");
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
    setQuestionStatus("loading");
    setQuestionError("");
    try {
      const response = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmedContext),
      });
      const result = await readServicePayload(response);
      if (!response.ok) throw new Error("personalization_unavailable");
      const parsed = parseQuestionSet(result, confirmedContext);
      if (!parsed) throw new Error("personalization_unavailable");
      setQuestionSet(parsed);
      setQuestionStatus("idle");
      setStep("mode");
      setAnnouncement("Personalized questions are ready. Choose an input mode.");
    } catch {
      setQuestionStatus("error");
      setQuestionError(PERSONALIZATION_UNAVAILABLE_MESSAGE);
    }
  };

  const useGeneralFallback = () => {
    setQuestionSet(createGeneralQuestionFallback(confirmedContext));
    setQuestionStatus("idle");
    setStep("mode");
    setAnnouncement("Standard interview questions selected. Your practice can continue.");
  };

  const beginTextMode = () => {
    setInputMode("text");
    setModeError("");
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
      setElapsedSeconds(0);
      setSpeakingSeconds(0);
      setStep("interview");
    } catch {
      setModeError(
        "Microphone permission was denied or unavailable. Text response mode still works.",
      );
    }
  };

  const startListening = () => {
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
      setSpeechError(
        "Speech recognition could not start. Edit or type your response.",
      );
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
    if (isListening || wantListeningRef.current) {
      stopListening();
    }
    setSpeechError("");
    setStep("mode");
    setAnnouncement(
      "Interview ended without saving a completed attempt. Your scenario and confirmed responses are preserved.",
    );
  };

  const reviewTranscript = () => {
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
        body: JSON.stringify(validatedRequest),
      });
      const result = await readServicePayload(response);
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
      setEvaluationStatus("error");
      setEvaluationFailure("service_failure");
      setEvaluationError(FEEDBACK_UNAVAILABLE_MESSAGE);
    }
  };

  const retrySameScenario = () => {
    if (!evaluation || !questionSet) return;
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
    setStep("mode");
    setAnnouncement(
      "Retry ready. The same scenario, questions, and focused learning goal were preserved.",
    );
  };

  const restart = () => {
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
  };

  const currentQuestion = questionSet?.questions[questionIndex];
  const isPreparationStep = step === "setup" || step === "resume" || step === "review";
  const fillerWordCount = countFillerWords(draft);
  const interviewTypeLabel =
    setup.interviewType === "custom"
      ? setup.customInterviewType
      : setup.interviewType.replaceAll("_", " ");
  const resumeHighlightCount = resumeProfile
    ? Object.values(resumeProfile).flat().length
    : 0;

  return (
    <div
      className={`page-stack interview-simulator${isPreparationStep ? ` ${preparationStyles.preparationScreen}` : ""}${isActiveSession ? ` ${sessionStyles.simulatorScreen}` : ""}`}
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

      {isPreparationStep || step === "mode" ? <PracticeLobbyScene stage={step} /> : null}

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
              <PixelButton
                onClick={extractResume}
                disabled={resumeStatus === "extracting"}
              >
                {resumeStatus === "extracting" ? (
                  "Extracting resume..."
                ) : (
                  <>
                    <span className="sr-only">Extract resume and continue</span>
                    <span aria-hidden="true">Continue</span>
                  </>
                )}
              </PixelButton>
              <PixelButton
                variant="secondary"
                onClick={() => {
                  clearResumeFile();
                  setResumeProfile(null);
                  setStep("review");
                }}
              >
                Continue without resume
              </PixelButton>
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
            <PixelButton variant="ghost" onClick={useManualResume}>
              Use manual resume text
            </PixelButton>
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
            <PixelButton
              onClick={generateQuestions}
              disabled={questionStatus === "loading"}
            >
              {questionStatus === "loading" ? (
                "Generating questions..."
              ) : (
                <>
                  <span className="sr-only">Confirm and generate questions</span>
                  <span aria-hidden="true">Start Interview</span>
                </>
              )}
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

      {step === "mode" && questionSet ? (
        <PixelPanel tone="dark" className="interview-stage">
          <p className="eyebrow">Microphone / text setup</p>
          <h2>How would you like to answer?</h2>
          {questionSet.source === "general_fallback" ? (
            <div className="fallback-notice" role="status">
              Standard interview questions selected. Your learning flow is ready.
            </div>
          ) : (
            <div className="personalized-notice" role="status">
              Your personalized interview is ready from the details you confirmed.
            </div>
          )}
          <div className="mode-grid">
            <button type="button" onClick={beginTextMode}>
              <PixelIcon name="speech" size="large" />
              <strong>Text response</strong>
              <span>Type and edit every answer.</span>
            </button>
            <button type="button" onClick={beginMicrophoneMode}>
              <PixelIcon name="microphone" size="large" />
              <strong>Microphone response</strong>
              <span>
                Live speech-to-text (best in Chrome/Edge), then review and edit the
                transcript.
              </span>
            </button>
          </div>
          <div className="camera-intent">
            <label htmlFor="camera-intent">
              <input
                id="camera-intent"
                type="checkbox"
                checked={cameraIntent}
                onChange={(event) => setCameraIntent(event.target.checked)}
              />
              <span>
                Optional camera — on-device framing reminders only. Preview stays on this
                device, is not stored, and never affects interview feedback.
              </span>
            </label>
          </div>
          {modeError ? (
            <div className="interview-inline-error" role="alert">
              {modeError}
            </div>
          ) : null}
        </PixelPanel>
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
          confirmedResponses={responses}
          fillerWordCount={fillerWordCount}
          cameraVideoRef={camera.videoRef}
          cameraStatus={camera.status}
          cameraPresence={camera.presence}
          cameraOrientation={camera.orientation}
          cameraErrorMessage={camera.errorMessage}
          onCameraEnable={() => setCameraIntent(true)}
          onCameraDisable={() => setCameraIntent(false)}
          onCameraRetry={() => {
            setCameraIntent(false);
            queueMicrotask(() => setCameraIntent(true));
          }}
          onDraftChange={setDraft}
          onMicrophoneToggle={isListening ? stopListening : startListening}
          onEnd={endInterview}
          onNext={reviewTranscript}
          onBack={() => setStep("interview")}
          onConfirm={confirmTranscript}
        />
      ) : null}

      {step === "complete" && questionSet ? (
        <PixelPanel tone="dark" className="interview-stage interview-complete">
          {!evaluation ? (
            <>
              <FeedbackRoomScene />
              <PixelBadge tone="mint">Attempt saved</PixelBadge>
              <h2>Interview practice complete.</h2>
              <p>{responses.length} confirmed responses were saved on this device.</p>
            </>
          ) : null}
          {!evaluation ? (
            <div
              className={`evaluation-request ${evaluationStatus === "loading" ? "is-loading" : ""}`}
              role={evaluationStatus === "loading" ? "status" : undefined}
              aria-live="polite"
              aria-busy={evaluationStatus === "loading"}
            >
              <p className="eyebrow">Feedback report</p>
              <h3>
                {evaluationStatus === "loading"
                  ? "Building your evidence-based learning report"
                  : "Your intelligent feedback is ready to prepare"}
              </h3>
              <p>
                Ameego Interview Coach reviews only your confirmed transcript against the
                STAR rubric. It does not assess emotion, honesty, intelligence,
                employability, accent, confidence, nervousness, or eye contact.
              </p>
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
            <div className="interview-inline-error" role="alert">
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
              <PixelButton onClick={evaluateCompletedAttempt}>Retry Feedback</PixelButton>
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
          <PixelButton onClick={restart} variant={evaluation ? "secondary" : "ghost"}>
            Start another interview
          </PixelButton>
        </PixelPanel>
      ) : null}
    </div>
  );
}
