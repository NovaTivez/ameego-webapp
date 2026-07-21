import { InterviewRoomScene } from "@/components/InterviewRoomScene";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelProgress } from "@/components/PixelProgress";
import type { CameraStatus, FacePresence, HeadOrientation } from "@/lib/camera/types";
import { cameraPresenceLabels } from "@/lib/camera/types";
import type { ConfirmedResponse, InterviewQuestion } from "@/lib/interview/contracts";
import { useEffect, useRef, useState, type KeyboardEvent, type Ref } from "react";

import styles from "./interview-session.module.css";

type InterviewSessionViewProps = {
  step: "interview" | "confirm";
  question: InterviewQuestion;
  questionIndex: number;
  questionTotal: number;
  elapsedTime: string;
  speakingTime: string;
  inputMode: "text" | "microphone";
  isListening: boolean;
  interimTranscript: string;
  draft: string;
  draftError: string;
  saveError: string;
  speechError: string;
  isInterviewerSpeaking: boolean;
  confirmedResponses: ConfirmedResponse[];
  fillerWordCount: number;
  cameraVideoRef: Ref<HTMLVideoElement>;
  cameraStatus: CameraStatus;
  cameraPresence: FacePresence;
  cameraOrientation: HeadOrientation;
  cameraErrorMessage: string;
  onCameraEnable: () => void;
  onCameraDisable: () => void;
  onCameraRetry: () => void;
  onDraftChange: (value: string) => void;
  onMicrophoneToggle: () => void;
  onEnd: () => void;
  onNext: () => void;
  onBack: () => void;
  onConfirm: () => void;
};

export function InterviewSessionView({
  step,
  question,
  questionIndex,
  questionTotal,
  elapsedTime,
  speakingTime,
  inputMode,
  isListening,
  interimTranscript,
  draft,
  draftError,
  saveError,
  speechError,
  isInterviewerSpeaking,
  confirmedResponses,
  fillerWordCount,
  cameraVideoRef,
  cameraStatus,
  cameraPresence,
  cameraOrientation,
  cameraErrorMessage,
  onCameraEnable,
  onCameraDisable,
  onCameraRetry,
  onDraftChange,
  onMicrophoneToggle,
  onEnd,
  onNext,
  onBack,
  onConfirm,
}: InterviewSessionViewProps) {
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const endTriggerRef = useRef<HTMLButtonElement>(null);
  const endDialogRef = useRef<HTMLElement>(null);
  const cancelEndRef = useRef<HTMLButtonElement>(null);
  const labels = cameraPresenceLabels(cameraStatus, cameraPresence, cameraOrientation);
  const cameraActive = cameraStatus === "active" || cameraStatus === "starting";
  const showVideo = cameraStatus === "active" || cameraStatus === "starting";
  const canRetry =
    cameraStatus === "denied" ||
    cameraStatus === "unavailable" ||
    cameraStatus === "interrupted";

  useEffect(() => {
    if (!endDialogOpen) return;
    queueMicrotask(() => cancelEndRef.current?.focus());
  }, [endDialogOpen]);

  const dismissEndDialog = () => {
    setEndDialogOpen(false);
    queueMicrotask(() => endTriggerRef.current?.focus());
  };

  const confirmEndInterview = () => {
    setEndDialogOpen(false);
    onEnd();
  };

  const handleEndDialogKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dismissEndDialog();
      return;
    }

    if (event.key !== "Tab") return;
    const buttons = endDialogRef.current?.querySelectorAll<HTMLButtonElement>(
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

  return (
    <section className={styles.sessionShell} aria-label="Interview simulation">
      <div className={styles.mainColumn}>
        <header className={styles.hud}>
          <div className={styles.hudCounters}>
            <div className={styles.hudCounter}>
              <span>Question</span>
              <strong>
                {questionIndex + 1}/{questionTotal}
              </strong>
            </div>
            <div className={styles.hudCounter}>
              <span>Timer</span>
              <strong>{elapsedTime}</strong>
            </div>
          </div>
          <div className={styles.progressWrap}>
            <PixelProgress
              label="Learning Progress"
              current={questionIndex + 1}
              total={questionTotal}
            />
          </div>
        </header>

        <InterviewRoomScene category={question.category} question={question.text} />

        {step === "interview" ? (
          <section className={styles.responsePanel} aria-label="Response controls">
            <div className={styles.responseHeading}>
              <h3 id="response-heading" className={styles.responseTitle}>
                Your Response
              </h3>
              <span className={styles.modeTag}>
                <PixelIcon name={inputMode === "microphone" ? "microphone" : "speech"} />
                {inputMode === "microphone" ? "Mic + editable text" : "Text mode"}
              </span>
            </div>
            <p
              className={styles.interviewerTurnStatus}
              data-speaking={isInterviewerSpeaking ? "true" : "false"}
              aria-live="polite"
            >
              {isInterviewerSpeaking
                ? "Interviewer speaking… wait for the question to finish before your turn."
                : "Your turn. Answer when you are ready."}
            </p>
            {inputMode === "microphone" ? (
              <p
                className={styles.listeningStatus}
                data-listening={isListening ? "true" : "false"}
                aria-live="polite"
              >
                {isInterviewerSpeaking
                  ? "Microphone locked until the interviewer finishes."
                  : isListening
                    ? interimTranscript
                      ? `Listening… ${interimTranscript}`
                      : "Listening… speak your answer, then stop the mic to review."
                    : "Mic ready. Start the microphone, or type in the transcript box."}
              </p>
            ) : null}
            {speechError ? (
              <div className={styles.inlineError} role="alert">
                {speechError}
              </div>
            ) : null}
            <div className={styles.responseControls}>
              <div className={styles.microphoneControl}>
                <button
                  type="button"
                  className={styles.microphoneButton}
                  onClick={onMicrophoneToggle}
                  disabled={inputMode !== "microphone" || isInterviewerSpeaking}
                  data-listening={isListening}
                  data-mic-state={isListening ? "active" : "off"}
                  aria-pressed={inputMode === "microphone" ? isListening : undefined}
                  aria-label={
                    inputMode !== "microphone"
                      ? "Microphone unavailable in text mode"
                      : isInterviewerSpeaking
                        ? "Microphone locked while interviewer is speaking"
                        : isListening
                          ? "Stop microphone"
                          : "Start microphone"
                  }
                >
                  <PixelIcon name="microphone" />
                  <span aria-hidden="true">{isListening ? "Mic active" : "Mic off"}</span>
                </button>
                <span
                  className={styles.microphoneStatus}
                  data-mic-state={isListening ? "active" : "off"}
                  aria-live="polite"
                >
                  <span aria-hidden="true" />
                  {isInterviewerSpeaking
                    ? "Waiting for interviewer"
                    : isListening
                      ? "Microphone active"
                      : "Microphone off"}
                </span>
              </div>
              <div className={styles.responseField}>
                <label htmlFor="response-draft">
                  {inputMode === "microphone" ? "Editable transcript" : "Your response"}
                </label>
                <textarea
                  id="response-draft"
                  rows={3}
                  value={draft}
                  onChange={(event) => onDraftChange(event.target.value)}
                  disabled={isInterviewerSpeaking}
                  aria-invalid={Boolean(draftError)}
                  aria-describedby={
                    isInterviewerSpeaking ? "interviewer-turn-lock" : undefined
                  }
                />
                {isInterviewerSpeaking ? (
                  <span id="interviewer-turn-lock" className={styles.fieldHint}>
                    Response input unlocks after the interviewer finishes speaking.
                  </span>
                ) : null}
                {isListening && interimTranscript ? (
                  <span className={styles.interimTranscript} aria-hidden="true">
                    {interimTranscript}
                  </span>
                ) : null}
                {draftError ? (
                  <span className={styles.fieldError}>{draftError}</span>
                ) : null}
              </div>
              <div className={styles.responseActions}>
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={onNext}
                  disabled={isInterviewerSpeaking}
                  aria-label="Next: review response"
                >
                  Next
                </button>
                <button
                  ref={endTriggerRef}
                  type="button"
                  className={styles.endButton}
                  onClick={() => setEndDialogOpen(true)}
                  aria-label="End interview without saving a completed attempt"
                >
                  End Interview
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section
            className={styles.confirmationPanel}
            aria-labelledby="confirmation-heading"
          >
            <div className={styles.confirmationHeading}>
              <div>
                <span className={styles.confirmKicker}>Transcript confirmation</span>
                <h3 id="confirmation-heading">Confirm question {questionIndex + 1}</h3>
              </div>
              <span className={styles.modeTag}>Review before saving</span>
            </div>
            <div className={styles.confirmField}>
              <label htmlFor="confirmed-transcript">
                Review and edit your transcript
              </label>
              <textarea
                id="confirmed-transcript"
                rows={4}
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
                aria-invalid={Boolean(draftError)}
              />
              {draftError ? (
                <span className={styles.fieldError}>{draftError}</span>
              ) : null}
            </div>
            {saveError ? (
              <div className={styles.inlineError} role="alert">
                {saveError}
              </div>
            ) : null}
            <div className={styles.confirmActions}>
              <button type="button" className={styles.backButton} onClick={onBack}>
                Back to response
              </button>
              <button type="button" className={styles.confirmButton} onClick={onConfirm}>
                {questionIndex === questionTotal - 1
                  ? "Confirm and save attempt"
                  : "Confirm and continue"}
              </button>
            </div>
          </section>
        )}
      </div>

      <aside className={styles.sideColumn} aria-label="Optional session tools">
        <section className={styles.sidePanel} aria-labelledby="camera-heading">
          <h3 id="camera-heading" className={styles.sideTitle}>
            <span>Optional Camera</span>
            <span
              className={styles.statusDot}
              data-camera-status={cameraStatus}
              aria-hidden="true"
            />
          </h3>
          <div className={styles.cameraScreen} data-active={showVideo ? "true" : "false"}>
            <video
              ref={cameraVideoRef}
              className={styles.cameraVideo}
              playsInline
              muted
              autoPlay
              aria-label="Optional mirrored camera preview"
              hidden={!showVideo}
            />
            {!showVideo ? (
              <>
                <PixelIcon name="camera" size="large" />
                <span>
                  {cameraStatus === "denied"
                    ? "Permission denied"
                    : cameraStatus === "unavailable"
                      ? "Camera unavailable"
                      : cameraStatus === "interrupted"
                        ? "Camera interrupted"
                        : "Preview off"}
                </span>
              </>
            ) : null}
          </div>
          <div className={styles.cameraActions}>
            {cameraActive ? (
              <button
                type="button"
                className={styles.cameraAction}
                onClick={onCameraDisable}
              >
                Disable camera
              </button>
            ) : canRetry ? (
              <button
                type="button"
                className={styles.cameraAction}
                onClick={onCameraRetry}
              >
                Retry camera
              </button>
            ) : (
              <button
                type="button"
                className={styles.cameraAction}
                onClick={onCameraEnable}
              >
                Enable camera
              </button>
            )}
          </div>
          {cameraErrorMessage ? (
            <p className={styles.cameraError} role="status">
              {cameraErrorMessage}
            </p>
          ) : null}
          <p className={styles.cameraNote}>
            Optional on-device framing reminders only. No recording is stored. Face
            presence and approximate head direction can inform practice-only feedback, but
            never leave this page or affect your interview score. No emotion, appearance,
            eye-contact, or hiring judgments.
          </p>
        </section>

        <section className={styles.analysisPanel} aria-labelledby="analysis-heading">
          <h3 id="analysis-heading" className={styles.sideTitle}>
            Session Analysis
          </h3>
          <dl className={styles.analysisList} aria-live="polite">
            <AnalysisRow
              label="Question progress"
              value={`${questionIndex + 1} of ${questionTotal}`}
            />
            <AnalysisRow
              label="Response recorded"
              value={draft.trim() ? "Draft captured" : "Not yet"}
            />
            <AnalysisRow
              label="Transcript confirmed"
              value={
                step === "confirm"
                  ? "Awaiting confirmation"
                  : `${confirmedResponses.length} saved`
              }
            />
            <AnalysisRow
              label="Speaking duration"
              value={inputMode === "microphone" ? speakingTime : "Text mode"}
            />
            <AnalysisRow
              label="Filler words (draft scan)"
              value={String(fillerWordCount)}
            />
            <AnalysisRow label="Camera" value={labels.camera} />
            <AnalysisRow label="Face" value={labels.face} />
            <AnalysisRow label="Orientation" value={labels.orientation} />
          </dl>
        </section>
      </aside>

      {endDialogOpen ? (
        <div className={styles.endDialogBackdrop}>
          <section
            ref={endDialogRef}
            className={styles.endDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-dialog-heading"
            aria-describedby="end-dialog-description"
            onKeyDown={handleEndDialogKeyDown}
          >
            <header className={styles.endDialogHeader}>
              <span aria-hidden="true">!</span>
              <div>
                <p>Interview in progress</p>
                <h2 id="end-dialog-heading">End this interview?</h2>
              </div>
            </header>
            <div className={styles.endDialogBody}>
              <p id="end-dialog-description">
                Your current draft will not be saved as a completed attempt. Your scenario
                and confirmed responses will stay available.
              </p>
            </div>
            <footer className={styles.endDialogActions}>
              <button
                ref={cancelEndRef}
                type="button"
                className={styles.cancelEndButton}
                onClick={dismissEndDialog}
              >
                Continue Interview
              </button>
              <button
                type="button"
                className={styles.confirmEndButton}
                onClick={confirmEndInterview}
              >
                End Interview
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function AnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.analysisRow}>
      <dt className={styles.analysisLabel}>{label}</dt>
      <dd className={styles.analysisValue}>{value}</dd>
    </div>
  );
}
