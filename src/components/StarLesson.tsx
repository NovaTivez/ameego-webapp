"use client";

import { CourseState } from "@/components/CourseState";
import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import type { StarLessonContent } from "@/content/interview-foundations";
import { useLessonCompletion } from "@/hooks/useLessonCompletion";

import styles from "./course-pages.module.css";

type StarLessonProps = {
  lesson: StarLessonContent;
};

const lessonObjectives = [
  "Understand each Situation, Task, Action, and Result component.",
  "Recognize how specific actions and evidence strengthen an answer.",
  "Apply the framework to a realistic behavioral interview response.",
];

function StarIllustration() {
  return (
    <figure className={styles.starIllustration} aria-labelledby="star-art-caption">
      <div className={styles.starOutline} aria-hidden="true">
        <div className={styles.starShape}>
          <span className={styles.letterS}>S</span>
          <span className={styles.letterT}>T</span>
          <span className={styles.letterA}>A</span>
          <span className={styles.letterR}>R</span>
          <i className={styles.starCore}>★</i>
        </div>
      </div>
      <span className={`${styles.spark} ${styles.sparkOne}`} aria-hidden="true" />
      <span className={`${styles.spark} ${styles.sparkTwo}`} aria-hidden="true" />
      <figcaption id="star-art-caption">STAR answer framework</figcaption>
    </figure>
  );
}

export function StarLesson({ lesson }: StarLessonProps) {
  const completion = useLessonCompletion(lesson.id);

  return (
    <article className={styles.lessonScreen}>
      <header className={styles.lessonCover}>
        <div className={styles.lessonIntro}>
          <PixelBadge tone="amber">Lesson 2.1</PixelBadge>
          <p className={styles.lessonCourse}>Interview Foundations</p>
          <h1>STAR Method</h1>
          <p className={styles.lessonSummary}>{lesson.summary}</p>

          <section className={styles.objectives} aria-labelledby="objectives-title">
            <h2 id="objectives-title">Objectives</h2>
            <ul>
              {lessonObjectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </section>

          <div className={styles.continueAction}>
            <PixelButton href="#lesson-content">Continue Lesson</PixelButton>
            <span>{lesson.durationMinutes} minutes</span>
          </div>
        </div>

        <StarIllustration />
      </header>

      <div id="lesson-content" className={styles.lessonContent}>
        <section className={styles.frameworkIntro} aria-labelledby="star-method-heading">
          <p className={styles.sectionKicker}>The Framework</p>
          <h2 id="star-method-heading">What is the STAR method?</h2>
          <p>{lesson.introduction}</p>
        </section>

        <section className={styles.starStepList} aria-label="The four STAR method steps">
          {lesson.steps.map((step) => (
            <article key={step.letter} className={styles.starStepCard}>
              <span className={styles.starStepLetter} aria-hidden="true">
                {step.letter}
              </span>
              <div>
                <h2>{step.name}</h2>
                <p>{step.explanation}</p>
                <p className={styles.starStepPrompt}>
                  <strong>Ask yourself:</strong> {step.prompt}
                </p>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.examples} aria-labelledby="examples-heading">
          <div className={styles.sectionHeading}>
            <span id="examples-heading">See the Difference</span>
            <small>From vague to convincing</small>
          </div>
          <div className={`${styles.responseExample} ${styles.weakResponse}`}>
            <h2>Weak response</h2>
            <blockquote>{lesson.weakResponse}</blockquote>
          </div>
          <div className={`${styles.responseExample} ${styles.strongResponse}`}>
            <h2>Strong response</h2>
            <blockquote>{lesson.strongResponse}</blockquote>
          </div>
        </section>

        <section className={styles.whyBetter} aria-labelledby="why-better-heading">
          <h2 id="why-better-heading">Why is the strong response better?</h2>
          <ul>
            {lesson.whyStrongIsBetter.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>

        <section className={styles.lessonSummaryPanel} aria-labelledby="summary-heading">
          <p className={styles.sectionKicker}>Lesson Summary</p>
          <h2 id="summary-heading">Make the structure serve the story.</h2>
          <ul>
            {lesson.summaryPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className={styles.lessonCompletion} aria-labelledby="completion-heading">
          <div>
            <p className={styles.sectionKicker}>Ready for the next step?</p>
            <h2 id="completion-heading">Save progress and practice.</h2>
            <p>Completion is stored only in this browser for the current device.</p>
          </div>

          {completion.status === "loading" ? <CourseState state="loading" /> : null}
          {completion.status === "error" ? (
            <CourseState state="error" onRetry={completion.reload} />
          ) : null}
          {completion.status === "ready" ? (
            <div className={styles.lessonCompletionActions} aria-live="polite">
              {completion.completed ? (
                <PixelBadge tone="mint">Lesson completed</PixelBadge>
              ) : (
                <PixelButton onClick={completion.markComplete}>
                  Mark lesson complete
                </PixelButton>
              )}
              <PixelButton href={lesson.exerciseHref} variant="secondary">
                Continue to STAR exercise
              </PixelButton>
            </div>
          ) : null}
        </section>
      </div>
    </article>
  );
}
