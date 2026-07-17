"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { CourseState } from "@/components/CourseState";
import { PixelIcon } from "@/components/PixelIcon";
import {
  COURSE_COMPLETION_BADGE,
  COURSE_COMPLETION_BONUS_XP,
  getAcademyLessonHref,
  interviewAcademyLessons,
  type AcademyLesson,
  type AcademyPhase,
} from "@/content/interview-foundations";
import { useCameraPresence } from "@/hooks/useCameraPresence";
import {
  appendTranscriptSegment,
  extractRecognitionUpdate,
  getSpeechRecognitionConstructor,
  speechErrorMessage,
  type SpeechRecognitionLike,
} from "@/lib/audio/speech-recognition";
import {
  completeLesson,
  readCourseProgress,
  type CourseProgress,
} from "@/lib/course-progress";

import styles from "./academy-lesson.module.css";

type AcademyLessonProps = {
  lesson: AcademyLesson;
  phase: AcademyPhase;
  lessonNumber: number;
};

type ProgressState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; progress: CourseProgress };

type ExerciseProps = {
  lesson: AcademyLesson;
  completed: boolean;
  onReadyChange: (ready: boolean) => void;
};

function SpeechExercise({ lesson, completed, onReadyChange }: ExerciseProps) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const ready = transcript.trim().split(/\s+/).filter(Boolean).length >= 8;
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const fillerWords = words.filter((word) =>
    ["um", "uh", "like", "basically", "actually"].includes(
      word.toLowerCase().replace(/[^a-z]/g, ""),
    ),
  ).length;
  const wordsPerMinute =
    durationSeconds > 0 ? Math.round(words.length / (durationSeconds / 60)) : 0;

  useEffect(() => {
    onReadyChange(ready || completed);
  }, [completed, onReadyChange, ready]);

  useEffect(
    () => () => {
      recognitionRef.current?.abort?.();
    },
    [],
  );

  const stopRecording = () => {
    recognitionRef.current?.stop();
  };

  const startRecording = () => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setErrorMessage(
        "Speech recognition is unavailable in this browser. Type your response below instead.",
      );
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const update = extractRecognitionUpdate(event);
      if (update.finalChunk) {
        setTranscript((current) => appendTranscriptSegment(current, update.finalChunk));
      }
    };
    recognition.onerror = (event) => {
      setErrorMessage(speechErrorMessage(event.error));
      setListening(false);
    };
    recognition.onend = () => {
      const startedAt = startedAtRef.current;
      if (startedAt) {
        setDurationSeconds(Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
      }
      setListening(false);
    };
    recognitionRef.current = recognition;
    startedAtRef.current = Date.now();
    setErrorMessage("");
    setListening(true);

    try {
      recognition.start();
    } catch {
      setListening(false);
      setErrorMessage("Speech recognition could not start. Type your response instead.");
    }
  };

  return (
    <div className={styles.exerciseWorkspace}>
      {lesson.exercise.sample ? (
        <blockquote className={styles.readingPrompt}>{lesson.exercise.sample}</blockquote>
      ) : (
        <ul className={styles.promptList}>
          {lesson.exercise.prompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
      )}
      <div className={styles.recordingControls}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={listening ? stopRecording : startRecording}
          disabled={completed}
        >
          <PixelIcon name="microphone" size="small" />
          {listening ? "Stop Recording" : "Start Read-Aloud"}
        </button>
        <span role="status">{listening ? "Listening…" : "Microphone optional"}</span>
      </div>
      {errorMessage ? <p className={styles.inlineNotice}>{errorMessage}</p> : null}
      <label className={styles.responseField}>
        <span>Transcript or typed response</span>
        <textarea
          rows={6}
          value={transcript}
          disabled={completed}
          onChange={(event) => setTranscript(event.target.value)}
          placeholder="Your speech transcript appears here, or type a response…"
        />
      </label>
      {words.length > 0 ? (
        <dl className={styles.practiceIndicators}>
          <div>
            <dt>Words</dt>
            <dd>{words.length}</dd>
          </div>
          <div>
            <dt>Recorded Pace</dt>
            <dd>{wordsPerMinute > 0 ? `${wordsPerMinute} WPM` : "Type mode"}</dd>
          </div>
          <div>
            <dt>Draft Filler Scan</dt>
            <dd>{fillerWords}</dd>
          </div>
        </dl>
      ) : null}
      <p className={styles.safetyNote}>
        These are neutral practice indicators, not confidence, emotion, pronunciation, or
        employability judgments.
      </p>
      {lesson.aiPracticeHref ? (
        <div className={styles.aiHandoff}>
          <PixelIcon name="speech" size="small" />
          <p>
            Continue to the Interview Center for the app&apos;s validated GPT feedback on
            your answer content. Audio clarity is not inferred from the transcript.
          </p>
          <Link href={lesson.aiPracticeHref}>Open AI Practice</Link>
        </div>
      ) : null}
    </div>
  );
}

function CameraExercise({ lesson, completed, onReadyChange }: ExerciseProps) {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [checks, setChecks] = useState(() => lesson.exercise.prompts.map(() => false));
  const { attachVideo, status, presence, orientation, errorMessage } = useCameraPresence({
    enabled: cameraEnabled,
    active: true,
  });
  const ready = checks.every(Boolean);

  useEffect(() => {
    onReadyChange(ready || completed);
  }, [completed, onReadyChange, ready]);

  return (
    <div className={styles.exerciseWorkspace}>
      <div className={styles.cameraWorkspace}>
        <div className={styles.cameraFrame}>
          {cameraEnabled ? (
            <video ref={attachVideo} muted playsInline aria-label="Camera preview" />
          ) : (
            <div>
              <PixelIcon name="camera" size="large" />
              <span>Preview off</span>
            </div>
          )}
        </div>
        <div className={styles.cameraReadout}>
          <button
            type="button"
            className={styles.secondaryButton}
            aria-pressed={cameraEnabled}
            disabled={completed}
            onClick={() => setCameraEnabled((enabled) => !enabled)}
          >
            {cameraEnabled ? "Turn Preview Off" : "Enable Camera Preview"}
          </button>
          <p role="status">
            {errorMessage ||
              (cameraEnabled
                ? `Camera ${status}. Face ${presence}. Orientation ${orientation}.`
                : "Optional local preview. Video is not stored or sent with progress.")}
          </p>
        </div>
      </div>
      <div className={styles.checkList}>
        {lesson.exercise.prompts.map((prompt, index) => (
          <label key={prompt}>
            <input
              type="checkbox"
              checked={checks[index]}
              disabled={completed}
              onChange={(event) => {
                const nextChecks = [...checks];
                nextChecks[index] = event.target.checked;
                setChecks(nextChecks);
              }}
            />
            <span>{prompt}</span>
          </label>
        ))}
      </div>
      <p className={styles.safetyNote}>
        Camera indicators describe visibility and approximate orientation only. They do
        not infer confidence, emotion, personality, or employability.
      </p>
    </div>
  );
}

function WrittenExercise({ lesson, completed, onReadyChange }: ExerciseProps) {
  const [responses, setResponses] = useState(() => lesson.exercise.prompts.map(() => ""));
  const [checks, setChecks] = useState(() => lesson.exercise.prompts.map(() => false));
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const isChecklist = lesson.exercise.kind === "checklist";
  const isChoice = lesson.exercise.kind === "choice";
  const isTimedChecklist = lesson.id === "interview-foundations.interview-checklist";
  const ready = isChecklist
    ? checks.every(Boolean) && (!isTimedChecklist || (timerSeconds ?? 0) > 0)
    : isChoice
      ? selectedChoice === 0
      : responses.every((response) => response.trim().length >= 12);

  useEffect(() => {
    onReadyChange(ready || completed);
  }, [completed, onReadyChange, ready]);

  useEffect(() => {
    if (!isTimedChecklist || timerSeconds === null || timerSeconds <= 0) return;
    if (checks.every(Boolean)) return;

    const interval = window.setInterval(() => {
      setTimerSeconds((current) => (current === null ? null : Math.max(0, current - 1)));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [checks, isTimedChecklist, timerSeconds]);

  if (isChoice) {
    return (
      <div className={styles.exerciseWorkspace}>
        <fieldset className={styles.choiceList}>
          <legend>Choose the strongest response</legend>
          {lesson.exercise.prompts.map((prompt, index) => (
            <label key={prompt}>
              <input
                type="radio"
                name="lesson-choice"
                checked={selectedChoice === index}
                disabled={completed}
                onChange={() => setSelectedChoice(index)}
              />
              <span>{prompt}</span>
            </label>
          ))}
        </fieldset>
        {selectedChoice !== null ? (
          <p
            className={selectedChoice === 0 ? styles.correctNotice : styles.inlineNotice}
          >
            {selectedChoice === 0
              ? "Strong choice: it is specific, responsible, and focused on learning."
              : "Try again. Choose the response that shows ownership and useful evidence."}
          </p>
        ) : null}
      </div>
    );
  }

  if (isChecklist) {
    return (
      <div className={styles.exerciseWorkspace}>
        {isTimedChecklist ? (
          <div className={styles.timerChallenge}>
            <div>
              <span>Preparation Timer</span>
              <strong aria-live="polite">
                {timerSeconds === null
                  ? "02:00"
                  : `0${Math.floor(timerSeconds / 60)}:${String(timerSeconds % 60).padStart(2, "0")}`}
              </strong>
            </div>
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={completed}
              onClick={() => {
                setChecks(lesson.exercise.prompts.map(() => false));
                setTimerSeconds(120);
              }}
            >
              {timerSeconds === null ? "Start Challenge" : "Restart Timer"}
            </button>
          </div>
        ) : null}
        <div className={styles.checkList}>
          {lesson.exercise.prompts.map((prompt, index) => (
            <label key={prompt}>
              <input
                type="checkbox"
                checked={checks[index]}
                disabled={completed || (isTimedChecklist && timerSeconds === null)}
                onChange={(event) => {
                  const nextChecks = [...checks];
                  nextChecks[index] = event.target.checked;
                  setChecks(nextChecks);
                }}
              />
              <span>{prompt}</span>
            </label>
          ))}
        </div>
        {isTimedChecklist && timerSeconds === 0 && !checks.every(Boolean) ? (
          <p className={styles.inlineNotice} role="alert">
            Time expired. Restart the checklist challenge and try again.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.exerciseWorkspace}>
      {lesson.exercise.sample ? (
        <div className={styles.weakSample}>
          <span>Rewrite this</span>
          <p>{lesson.exercise.sample}</p>
        </div>
      ) : null}
      {lesson.exercise.prompts.map((prompt, index) => (
        <label className={styles.responseField} key={prompt}>
          <span>{prompt}</span>
          <textarea
            rows={lesson.exercise.prompts.length === 1 ? 8 : 4}
            value={responses[index]}
            disabled={completed}
            onChange={(event) => {
              const nextResponses = [...responses];
              nextResponses[index] = event.target.value;
              setResponses(nextResponses);
            }}
            placeholder="Write a specific, professional response…"
          />
        </label>
      ))}
      {lesson.aiPracticeHref ? (
        <div className={styles.aiHandoff}>
          <PixelIcon name="speech" size="small" />
          <p>
            The Interview Center provides the app&apos;s validated GPT feedback. Finish
            this planning checkpoint first, then continue there for AI evaluation.
          </p>
          <Link href={lesson.aiPracticeHref}>Open AI Practice</Link>
        </div>
      ) : null}
    </div>
  );
}

function LessonExercise(props: ExerciseProps) {
  if (props.lesson.exercise.kind === "speech") return <SpeechExercise {...props} />;
  if (props.lesson.exercise.kind === "camera") return <CameraExercise {...props} />;
  return <WrittenExercise {...props} />;
}

export function AcademyLesson({ lesson, phase, lessonNumber }: AcademyLessonProps) {
  const [progressState, setProgressState] = useState<ProgressState>({
    status: "loading",
  });
  const [exerciseReady, setExerciseReady] = useState(false);
  const [reward, setReward] = useState<{
    badge?: string;
    courseComplete: boolean;
  } | null>(null);

  const lessonIndex = interviewAcademyLessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = interviewAcademyLessons[lessonIndex + 1];
  const loadProgress = useCallback(() => {
    try {
      setProgressState({
        status: "ready",
        progress: readCourseProgress(window.localStorage),
      });
    } catch {
      setProgressState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadProgress);
  }, [loadProgress]);

  if (progressState.status === "loading") return <CourseState state="loading" />;
  if (progressState.status === "error") {
    return <CourseState state="error" onRetry={loadProgress} />;
  }

  const completedIds = new Set(progressState.progress.completedLessonIds);
  const academyCompletedCount = interviewAcademyLessons.filter((item) =>
    completedIds.has(item.id),
  ).length;
  const completed = completedIds.has(lesson.id);
  const unlocked =
    completed ||
    interviewAcademyLessons
      .slice(0, lessonIndex)
      .every((previousLesson) => completedIds.has(previousLesson.id));
  const courseProgress = Math.round(
    (academyCompletedCount / interviewAcademyLessons.length) * 100,
  );

  if (!unlocked) {
    return (
      <section className={styles.lockedLesson} aria-labelledby="locked-title">
        <PixelIcon name="lock" size="large" />
        <p>Lesson Locked</p>
        <h1 id="locked-title">{lesson.title}</h1>
        <span>Complete the previous academy lesson to unlock this quest.</span>
        <Link className="pixel-button pixel-button-primary" href="/learn">
          Return to Learning Path
        </Link>
      </section>
    );
  }

  const finishLesson = () => {
    try {
      const progress = completeLesson(window.localStorage, lesson.id);
      const nextCompleted = new Set(progress.completedLessonIds);
      const phaseComplete = phase.lessons.every((item) => nextCompleted.has(item.id));
      const courseComplete = interviewAcademyLessons.every((item) =>
        nextCompleted.has(item.id),
      );
      setProgressState({ status: "ready", progress });
      setReward({ badge: phaseComplete ? phase.badge : undefined, courseComplete });
    } catch {
      setProgressState({ status: "error" });
    }
  };

  return (
    <article className={styles.lessonPage} aria-labelledby="lesson-title">
      <header className={styles.lessonHero}>
        <div className={styles.lessonBreadcrumbs}>
          <Link href="/learn">Interview Skills Academy</Link>
          <span aria-hidden="true">/</span>
          <span>Phase {phase.number}</span>
        </div>
        <div className={styles.lessonHeroMain}>
          <span className={styles.lessonNumber}>
            {phase.number}.{lessonNumber}
          </span>
          <div>
            <p>{phase.title}</p>
            <h1 id="lesson-title">{lesson.title}</h1>
            <span>{lesson.objective}</span>
          </div>
          <dl>
            <div>
              <dt>Time</dt>
              <dd>{lesson.durationMinutes} min</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>{lesson.difficulty}</dd>
            </div>
            <div>
              <dt>Reward</dt>
              <dd>+{lesson.xpReward} XP</dd>
            </div>
          </dl>
        </div>
        <div className={styles.lessonProgressRow}>
          <span>
            Lesson {lessonIndex + 1} of {interviewAcademyLessons.length}
          </span>
          <div
            role="progressbar"
            aria-label="Course lesson progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={courseProgress}
          >
            <span style={{ width: `${courseProgress}%` }} />
          </div>
          <strong>{courseProgress}%</strong>
        </div>
      </header>

      <section className={styles.learningPanel} aria-labelledby="learning-title">
        <div className={styles.panelHeading}>
          <PixelIcon name="lesson" size="small" />
          <div>
            <p>Learning Content</p>
            <h2 id="learning-title">What You&apos;ll Learn</h2>
          </div>
        </div>
        <p className={styles.lessonSummary}>{lesson.summary}</p>
        <div className={styles.topicGrid}>
          {lesson.topics.map((topic, index) => (
            <div key={topic}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{topic}</strong>
              <p>
                Practice this skill with specific evidence, professional wording, and a
                clear connection to the interview question.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.exercisePanel} aria-labelledby="exercise-title">
        <div className={styles.panelHeading}>
          <PixelIcon name="star" size="small" />
          <div>
            <p>Interactive Exercise</p>
            <h2 id="exercise-title">{lesson.exercise.title}</h2>
          </div>
        </div>
        <p className={styles.exerciseInstruction}>{lesson.exercise.instruction}</p>
        <LessonExercise
          lesson={lesson}
          completed={completed}
          onReadyChange={setExerciseReady}
        />
      </section>

      {reward ? (
        <section className={styles.rewardReveal} aria-live="polite">
          <PixelIcon name="star" size="large" />
          <div>
            <p>Lesson Complete · +{lesson.xpReward} XP</p>
            <h2>
              {reward.courseComplete ? COURSE_COMPLETION_BADGE : "Next Quest Unlocked"}
            </h2>
            <span>
              {reward.courseComplete
                ? `All lessons cleared. You earned the ${COURSE_COMPLETION_BADGE} badge and +${COURSE_COMPLETION_BONUS_XP} bonus XP.`
                : reward.badge
                  ? `${phase.badge} badge earned. The next phase is now available.`
                  : nextLesson
                    ? `${nextLesson.title} is now available.`
                    : "Return to the academy to review your progress."}
            </span>
          </div>
          <Link
            className="pixel-button pixel-button-primary"
            href={
              reward.courseComplete
                ? "/practice"
                : nextLesson
                  ? getAcademyLessonHref(nextLesson)
                  : "/learn"
            }
          >
            {reward.courseComplete
              ? "Start Graduation Interview"
              : nextLesson
                ? "Continue to Next Lesson"
                : "Return to Academy"}
          </Link>
        </section>
      ) : (
        <footer className={styles.finishBar}>
          <div>
            <strong>{completed ? "✓ Completed" : "Finish Lesson"}</strong>
            <span>
              {completed
                ? `${lesson.xpReward} XP already earned. You can review this exercise anytime.`
                : exerciseReady
                  ? "Exercise checkpoint complete. Claim your reward."
                  : "Complete the interactive exercise to unlock this action."}
            </span>
          </div>
          <button
            type="button"
            className={styles.finishButton}
            disabled={!exerciseReady || completed}
            onClick={finishLesson}
          >
            {completed ? "Lesson Completed" : `Finish Lesson · +${lesson.xpReward} XP`}
          </button>
        </footer>
      )}
    </article>
  );
}
