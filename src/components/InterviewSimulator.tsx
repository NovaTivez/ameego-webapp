"use client";

import { useEffect, useRef, useState } from "react";

import { EvaluationFeedback } from "@/components/EvaluationFeedback";
import { FeedbackRoomScene } from "@/components/FeedbackRoomScene";
import { CharacterPortrait } from "@/components/CharacterPortrait";
import { InterviewSetupForm } from "@/components/InterviewSetupForm";
import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelDialog } from "@/components/PixelDialog";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelPanel } from "@/components/PixelPanel";
import { PixelProgress } from "@/components/PixelProgress";
import { PixelRoomBackground } from "@/components/PixelRoomBackground";
import { PixelStatusBar } from "@/components/PixelStatusBar";
import { ResumeProfileEditor } from "@/components/ResumeProfileEditor";
import { PracticeLobbyScene } from "@/components/PracticeLobbyScene";
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
  buildEvaluationRequest,
  createCompletedAttempt,
  saveAttemptEvaluation,
  saveCompletedAttempt,
} from "@/lib/interview/attempts";
import { createGeneralQuestionFallback } from "@/lib/interview/questions";
import { RESUME_ACCEPT, RESUME_MAX_BYTES } from "@/lib/interview/resume";
import {
  parseQuestionSet,
  parseResumeProfile,
  validateInterviewSetup,
  validateTranscript,
} from "@/lib/interview/validation";

type Step = "setup" | "resume" | "review" | "mode" | "interview" | "confirm" | "complete";

type RecognitionResultEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const STEP_LABELS = [
  "Setup",
  "Resume",
  "Review",
  "Mode",
  "Interview",
  "Confirm",
  "Saved",
];

const STEP_PROGRESS: Record<Step, number> = {
  setup: 0,
  resume: 1,
  review: 2,
  mode: 3,
  interview: 4,
  confirm: 5,
  complete: 6,
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

function errorMessage(value: unknown, fallback: string): string {
  if (value && typeof value === "object" && "error" in value) {
    const error = (value as { error?: unknown }).error;
    if (typeof error === "string") return error;
  }
  return fallback;
}

function formatSessionTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
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
  const [saveError, setSaveError] = useState("");
  const [completedAttempt, setCompletedAttempt] =
    useState<CompletedInterviewAttempt | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [evaluationStatus, setEvaluationStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [evaluationError, setEvaluationError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const hasMountedRef = useRef(false);

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
    },
    [],
  );

  // Keyboard users lose their place when a step panel unmounts the control
  // they activated, so focus moves to the new step's heading.
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== "interview" && step !== "confirm") return;
    const timer = window.setInterval(
      () => setElapsedSeconds((current) => current + 1),
      1_000,
    );
    return () => window.clearInterval(timer);
  }, [step]);

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
      const result: unknown = await response.json();
      if (!response.ok)
        throw new Error(errorMessage(result, "Resume extraction failed."));
      const profile =
        result && typeof result === "object" && "profile" in result
          ? parseResumeProfile((result as { profile: unknown }).profile)
          : null;
      if (!profile) throw new Error("Resume extraction returned invalid information.");

      setResumeProfile(profile);
      setResumeFile(null);
      setResumeStatus("idle");
      setStep("review");
      setAnnouncement("Resume information extracted. Review every detail before use.");
    } catch (error) {
      setResumeStatus("error");
      setResumeError(
        error instanceof Error ? error.message : "Resume extraction failed.",
      );
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

  const generateQuestions = async () => {
    setQuestionStatus("loading");
    setQuestionError("");
    try {
      const response = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmedContext),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(errorMessage(result, "Question generation failed."));
      }
      const parsed = parseQuestionSet(result, confirmedContext);
      if (!parsed) throw new Error("Generated questions were invalid.");
      setQuestionSet(parsed);
      setQuestionStatus("idle");
      setStep("mode");
      setAnnouncement("Personalized questions are ready. Choose an input mode.");
    } catch (error) {
      setQuestionStatus("error");
      setQuestionError(
        error instanceof Error ? error.message : "Question generation failed.",
      );
    }
  };

  const useGeneralFallback = () => {
    setQuestionSet(createGeneralQuestionFallback(confirmedContext));
    setQuestionStatus("idle");
    setStep("mode");
    setAnnouncement("General fallback questions selected. They are not AI-personalized.");
  };

  const beginTextMode = () => {
    setInputMode("text");
    setModeError("");
    setElapsedSeconds(0);
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
      setStep("interview");
    } catch {
      setModeError(
        "Microphone permission was denied or unavailable. Text response mode still works.",
      );
    }
  };

  const startListening = () => {
    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setModeError(
        "Speech recognition is not supported in this browser. You can type or edit the transcript.",
      );
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) {
        setDraft((current) => `${current} ${transcript}`.trim());
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      setModeError(
        "Speech recognition stopped unexpectedly. Edit or type your response.",
      );
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setAnnouncement("Microphone stopped. Review and edit the transcript.");
  };

  const reviewTranscript = () => {
    if (isListening) stopListening();
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
    setStep("interview");
    setAnnouncement(`Response confirmed. Question ${questionIndex + 2} is ready.`);
  };

  const evaluateCompletedAttempt = async () => {
    if (!completedAttempt) return;
    const request: EvaluationRequest = buildEvaluationRequest(completedAttempt);
    const validatedRequest = parseEvaluationRequest(request);
    if (!validatedRequest) {
      setEvaluationStatus("error");
      setEvaluationError("The saved transcript is incomplete and cannot be evaluated.");
      return;
    }

    setEvaluationStatus("loading");
    setEvaluationError("");
    setElapsedSeconds(0);
    try {
      const response = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedRequest),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(errorMessage(result, "Interview evaluation failed."));
      }
      const parsed = parseInterviewEvaluation(result, validatedRequest);
      if (!parsed)
        throw new Error("The evaluation response was invalid and was not used.");
      setEvaluation(parsed);
      try {
        const saved = saveAttemptEvaluation(
          window.localStorage,
          completedAttempt.id,
          parsed,
        );
        setCompletedAttempt(saved);
        setAnnouncement(
          "Evidence-based interview feedback is ready and saved with this attempt.",
        );
      } catch {
        setAnnouncement(
          "Evidence-based interview feedback is ready, but it could not be saved with the attempt.",
        );
      }
      setEvaluationStatus("idle");
    } catch (error) {
      setEvaluationStatus("error");
      setEvaluationError(
        error instanceof Error ? error.message : "Interview evaluation failed.",
      );
    }
  };

  const restart = () => {
    setStep("setup");
    setSetup(DEFAULT_INTERVIEW_SETUP);
    setSetupErrors({});
    setResumeFile(null);
    setResumeProfile(null);
    setManualResumeText("");
    setResumeStatus("idle");
    setResumeError("");
    setQuestionSet(null);
    setQuestionStatus("idle");
    setQuestionError("");
    setInputMode("text");
    setModeError("");
    setQuestionIndex(0);
    setDraft("");
    setDraftError("");
    setResponses([]);
    setSaveError("");
    setCompletedAttempt(null);
    setEvaluation(null);
    setEvaluationStatus("idle");
    setEvaluationError("");
    setElapsedSeconds(0);
  };

  const currentQuestion = questionSet?.questions[questionIndex];

  return (
    <div className="page-stack interview-simulator">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <header className="interview-simulator-header">
        <PixelBadge tone="mint">Interview Center</PixelBadge>
        <p className="eyebrow">Practice interview</p>
        <h1>Build a grounded practice interview.</h1>
        <p className="hero-lede">
          Confirm your context, answer personalized questions, and request an
          evidence-based STAR communication review.
        </p>
      </header>

      <ol className="interview-stepper" aria-label="Interview progress">
        {STEP_LABELS.map((label, index) => (
          <li
            key={label}
            className={index <= STEP_PROGRESS[step] ? "is-reached" : ""}
            aria-current={index === STEP_PROGRESS[step] ? "step" : undefined}
          >
            <span aria-hidden="true">{index + 1}</span>
            {label}
            {index < STEP_PROGRESS[step] ? (
              <span className="sr-only"> (completed)</span>
            ) : null}
          </li>
        ))}
      </ol>

      {step === "setup" || step === "resume" || step === "review" || step === "mode" ? (
        <PracticeLobbyScene stage={step} />
      ) : null}

      {step === "setup" ? (
        <PixelPanel tone="dark" className="interview-stage">
          <p className="eyebrow">Interview setup</p>
          <h2 tabIndex={-1} ref={stepHeadingRef}>
            What are you preparing for?
          </h2>
          <InterviewSetupForm
            value={setup}
            errors={setupErrors}
            onChange={setSetup}
            onSubmit={submitSetup}
          />
        </PixelPanel>
      ) : null}

      {step === "resume" ? (
        <PixelPanel tone="dark" className="interview-stage">
          <p className="eyebrow">Optional resume</p>
          <h2 tabIndex={-1} ref={stepHeadingRef}>
            Add confirmed experience—or continue without it.
          </h2>
          <p>
            Accepted: PDF, DOC, DOCX, RTF, TXT, or Markdown up to 5 MB. Raw files are used
            for extraction only and are not saved in browser progress.
          </p>
          <div className="interview-field">
            <label htmlFor="resume-file">Resume file</label>
            <input
              id="resume-file"
              type="file"
              accept={RESUME_ACCEPT}
              onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="button-row">
            <PixelButton onClick={extractResume} disabled={resumeStatus === "extracting"}>
              {resumeStatus === "extracting" ? "Extracting..." : "Extract resume"}
            </PixelButton>
            <PixelButton
              variant="secondary"
              onClick={() => {
                setResumeFile(null);
                setResumeProfile(null);
                setStep("review");
              }}
            >
              Continue without resume
            </PixelButton>
          </div>
          {resumeStatus === "error" ? (
            <div className="interview-inline-error" role="alert">
              <strong>Resume extraction was not completed.</strong>
              <span>{resumeError}</span>
            </div>
          ) : null}
          <div className="interview-field manual-resume-fallback">
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
        <PixelPanel tone="dark" className="interview-stage">
          <p className="eyebrow">Review context</p>
          <h2 tabIndex={-1} ref={stepHeadingRef}>
            Confirm what the interviewer may use.
          </h2>
          <dl className="context-review">
            <div>
              <dt>Role</dt>
              <dd>{setup.role}</dd>
            </div>
            <div>
              <dt>Organization</dt>
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
          </dl>
          {resumeProfile ? (
            <>
              <p>Edit or remove any extracted detail that is inaccurate.</p>
              <ResumeProfileEditor profile={resumeProfile} onChange={setResumeProfile} />
              <PixelButton variant="secondary" onClick={() => setResumeProfile(null)}>
                Remove resume information
              </PixelButton>
            </>
          ) : (
            <div className="interview-no-resume" role="status">
              No resume information will be used. Questions will use setup context only.
            </div>
          )}
          <div className="button-row">
            <PixelButton
              onClick={generateQuestions}
              disabled={questionStatus === "loading"}
            >
              {questionStatus === "loading"
                ? "Generating questions..."
                : "Confirm and generate questions"}
            </PixelButton>
            <PixelButton variant="secondary" onClick={() => setStep("setup")}>
              Edit setup
            </PixelButton>
          </div>
          {questionStatus === "error" ? (
            <div className="interview-inline-error" role="alert">
              <strong>Personalized questions could not be generated.</strong>
              <span>{questionError}</span>
              <div className="button-row">
                <PixelButton onClick={generateQuestions}>Retry GPT-5.6</PixelButton>
                <PixelButton variant="ghost" onClick={useGeneralFallback}>
                  Use general questions (not AI-personalized)
                </PixelButton>
              </div>
            </div>
          ) : null}
        </PixelPanel>
      ) : null}

      {step === "mode" && questionSet ? (
        <PixelPanel tone="dark" className="interview-stage">
          <p className="eyebrow">Microphone / text setup</p>
          <h2 tabIndex={-1} ref={stepHeadingRef}>
            How would you like to answer?
          </h2>
          {questionSet.source === "general_fallback" ? (
            <div className="fallback-notice" role="status">
              General fallback questions selected. These are not AI-personalized.
            </div>
          ) : (
            <div className="personalized-notice" role="status">
              GPT-5.6 personalized questions are ready from your confirmed context.
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
              <span>Record speech, then review and edit the transcript.</span>
            </button>
          </div>
          {modeError ? (
            <div className="interview-inline-error" role="alert">
              {modeError}
            </div>
          ) : null}
        </PixelPanel>
      ) : null}

      {step === "interview" && currentQuestion && questionSet ? (
        <section className="interview-session-shell" aria-label="Interview simulation">
          <div className="interview-session-main">
            <div className="interview-hud">
              <div className="interview-hud-counter">
                <span>Question</span>
                <strong>
                  {questionIndex + 1}/{questionSet.questions.length}
                </strong>
                <span>Session time</span>
                <strong>{formatSessionTime(elapsedSeconds)}</strong>
              </div>
              <PixelProgress
                label="Interview progress"
                current={questionIndex + 1}
                total={questionSet.questions.length}
              />
            </div>

            <PixelRoomBackground
              variant="office"
              label="Warm pixel-art interview office"
              className="interview-room-stage"
            >
              <PixelDialog
                speaker="Jordan · Interviewer"
                className="interview-question-dialog"
              >
                <PixelBadge tone="amber">
                  {currentQuestion.category.replace("_", " ")}
                </PixelBadge>
                <h2 tabIndex={-1} ref={stepHeadingRef}>
                  {currentQuestion.text}
                </h2>
              </PixelDialog>
              <CharacterPortrait variant="interviewer" name="Jordan, interviewer" />
              <div className="interview-desk" aria-hidden="true">
                <PixelIcon name="resume" size="large" />
              </div>
            </PixelRoomBackground>

            <PixelPanel tone="dark" className="interview-response-console">
              <div className="response-console-heading">
                <span>Your response</span>
                <PixelStatusBar
                  label="Input"
                  value={inputMode === "microphone" ? "Mic + editable text" : "Text"}
                  tone={isListening ? "success" : "info"}
                  icon={inputMode === "microphone" ? "microphone" : "speech"}
                />
              </div>
              {inputMode === "microphone" ? (
                <div className="button-row">
                  {isListening ? (
                    <PixelButton onClick={stopListening} variant="secondary">
                      Stop microphone
                    </PixelButton>
                  ) : (
                    <PixelButton onClick={startListening}>Start microphone</PixelButton>
                  )}
                </div>
              ) : null}
              {modeError ? (
                <div className="interview-inline-error" role="alert">
                  {modeError}
                </div>
              ) : null}
              <div className="interview-field">
                <label htmlFor="response-draft">
                  {inputMode === "microphone" ? "Editable transcript" : "Your response"}
                </label>
                <textarea
                  id="response-draft"
                  rows={7}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  aria-invalid={Boolean(draftError)}
                  aria-describedby={draftError ? "response-draft-error" : undefined}
                />
                {draftError ? (
                  <span className="field-error" id="response-draft-error">
                    {draftError}
                  </span>
                ) : null}
              </div>
              <PixelButton onClick={reviewTranscript}>Review response</PixelButton>
            </PixelPanel>
          </div>

          <aside className="interview-session-side" aria-label="Optional session tools">
            <PixelPanel tone="dark" className="camera-placeholder">
              <div className="camera-placeholder-heading">
                <span className="status-light status-light-warning" aria-hidden="true" />
                <strong>Optional camera</strong>
              </div>
              <div className="camera-placeholder-screen">
                <PixelIcon name="camera" size="large" />
                <span>Preview not enabled</span>
              </div>
              <p>
                Camera analysis is not implemented. No face, posture, eye-contact, or
                emotion data is captured.
              </p>
            </PixelPanel>
            <PixelPanel tone="dark" className="neutral-session-indicators">
              <p className="eyebrow">Session indicators</p>
              <PixelStatusBar
                label="Question"
                value={`${questionIndex + 1} of ${questionSet.questions.length}`}
                tone="info"
                icon="speech"
              />
              <PixelStatusBar
                label="Transcript"
                value="Review required"
                tone="warning"
                icon="resume"
              />
              <PixelStatusBar
                label="Scoring"
                value="After completion"
                tone="info"
                icon="progress"
              />
            </PixelPanel>
          </aside>
        </section>
      ) : null}

      {step === "confirm" && currentQuestion && questionSet ? (
        <PixelPanel tone="dark" className="interview-stage">
          <p className="eyebrow">Transcript confirmation</p>
          <h2 tabIndex={-1} ref={stepHeadingRef}>
            Confirm question {questionIndex + 1}.
          </h2>
          <blockquote>{currentQuestion.text}</blockquote>
          <div className="interview-field">
            <label htmlFor="confirmed-transcript">Review and edit your transcript</label>
            <textarea
              id="confirmed-transcript"
              rows={9}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-invalid={Boolean(draftError)}
              aria-describedby={draftError ? "confirmed-transcript-error" : undefined}
            />
            {draftError ? (
              <span className="field-error" id="confirmed-transcript-error">
                {draftError}
              </span>
            ) : null}
          </div>
          {saveError ? (
            <div className="interview-inline-error" role="alert">
              {saveError}
            </div>
          ) : null}
          <div className="button-row">
            <PixelButton onClick={confirmTranscript}>
              {questionIndex === questionSet.questions.length - 1
                ? "Confirm and save attempt"
                : "Confirm and continue"}
            </PixelButton>
            <PixelButton variant="secondary" onClick={() => setStep("interview")}>
              Back to response
            </PixelButton>
          </div>
        </PixelPanel>
      ) : null}

      {step === "complete" && questionSet ? (
        <PixelPanel tone="dark" className="interview-stage interview-complete">
          <FeedbackRoomScene />
          <PixelBadge tone="mint">Attempt saved</PixelBadge>
          <h2 tabIndex={-1} ref={stepHeadingRef}>
            Interview practice complete.
          </h2>
          <p>{responses.length} confirmed responses were saved on this device.</p>
          {!evaluation ? (
            <div className="evaluation-request">
              <p>
                GPT-5.6 can now evaluate only the confirmed transcript against the STAR
                rubric. It will not assess emotion, honesty, intelligence, employability,
                accent, confidence, nervousness, or eye contact.
              </p>
              <PixelButton
                onClick={evaluateCompletedAttempt}
                disabled={evaluationStatus === "loading" || !completedAttempt}
              >
                {evaluationStatus === "loading"
                  ? "Evaluating transcript..."
                  : "Generate STAR feedback"}
              </PixelButton>
            </div>
          ) : null}
          {evaluationStatus === "error" ? (
            <div className="interview-inline-error" role="alert">
              <strong>Evaluation was not saved or displayed.</strong>
              <span>{evaluationError}</span>
              <PixelButton onClick={evaluateCompletedAttempt}>
                Retry evaluation
              </PixelButton>
            </div>
          ) : null}
          {evaluation ? <EvaluationFeedback evaluation={evaluation} /> : null}
          <PixelButton onClick={restart} variant={evaluation ? "secondary" : "ghost"}>
            Start another interview
          </PixelButton>
        </PixelPanel>
      ) : null}
    </div>
  );
}
