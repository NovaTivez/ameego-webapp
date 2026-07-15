import { InterviewRoomScene } from "@/components/InterviewRoomScene";
import { PixelIcon } from "@/components/PixelIcon";
import { PixelProgress } from "@/components/PixelProgress";
import type { ConfirmedResponse, InterviewQuestion } from "@/lib/interview/contracts";

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
  draft: string;
  draftError: string;
  saveError: string;
  modeError: string;
  confirmedResponses: ConfirmedResponse[];
  fillerWordCount: number;
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
  draft,
  draftError,
  saveError,
  modeError,
  confirmedResponses,
  fillerWordCount,
  onDraftChange,
  onMicrophoneToggle,
  onEnd,
  onNext,
  onBack,
  onConfirm,
}: InterviewSessionViewProps) {
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
            {modeError ? (
              <div className={styles.inlineError} role="alert">
                {modeError}
              </div>
            ) : null}
            <div className={styles.responseControls}>
              <button
                type="button"
                className={styles.microphoneButton}
                onClick={onMicrophoneToggle}
                disabled={inputMode !== "microphone"}
                data-listening={isListening}
                aria-label={
                  inputMode !== "microphone"
                    ? "Microphone unavailable in text mode"
                    : isListening
                      ? "Stop microphone"
                      : "Start microphone"
                }
              >
                <PixelIcon name="microphone" />
              </button>
              <div className={styles.responseField}>
                <label htmlFor="response-draft">
                  {inputMode === "microphone" ? "Editable transcript" : "Your response"}
                </label>
                <textarea
                  id="response-draft"
                  rows={3}
                  value={draft}
                  onChange={(event) => onDraftChange(event.target.value)}
                  aria-invalid={Boolean(draftError)}
                />
                {draftError ? (
                  <span className={styles.fieldError}>{draftError}</span>
                ) : null}
              </div>
              <div className={styles.responseActions}>
                <button
                  type="button"
                  className={styles.endButton}
                  onClick={onEnd}
                  aria-label="End interview without saving a completed attempt"
                >
                  End
                </button>
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={onNext}
                  aria-label="Next: review response"
                >
                  Next
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
            <span className={styles.statusDot} aria-hidden="true" />
          </h3>
          <div className={styles.cameraScreen}>
            <PixelIcon name="camera" size="large" />
            <span>Preview not enabled</span>
          </div>
          <p className={styles.cameraNote}>
            Camera analysis is not implemented. No face, posture, eye-contact, or emotion
            data is captured.
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
          </dl>
        </section>
      </aside>
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
