"use client";

import Link from "next/link";

import { CourseState } from "@/components/CourseState";
import { LearningScene } from "@/components/LearningScene";
import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelDialog } from "@/components/PixelDialog";
import { PixelPanel } from "@/components/PixelPanel";
import type { StarLessonContent } from "@/content/interview-foundations";
import { useLessonCompletion } from "@/hooks/useLessonCompletion";

type StarLessonProps = {
  lesson: StarLessonContent;
};

export function StarLesson({ lesson }: StarLessonProps) {
  const completion = useLessonCompletion(lesson.id);

  return (
    <article className="lesson-article">
      <nav className="lesson-breadcrumbs" aria-label="Course breadcrumb">
        <Link href="/">Academy</Link>
        <span aria-hidden="true">/</span>
        <Link href="/learn">Interview Foundations</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">STAR Method</span>
      </nav>

      <header className="lesson-header">
        <div className="lesson-status-row">
          <PixelBadge tone="amber">Featured lesson</PixelBadge>
          <span className="lesson-duration">{lesson.durationMinutes} minutes</span>
        </div>
        <h1>{lesson.title}</h1>
        <PixelDialog className="lesson-objective lesson-objective-dark" speaker="Mission">
          <strong>Learning objective</strong>
          <span>{lesson.objective}</span>
        </PixelDialog>
      </header>

      <LearningScene variant="lesson" />

      <div className="lesson-reading-column">
        <section aria-labelledby="star-method-heading">
          <p className="eyebrow">The framework</p>
          <h2 id="star-method-heading">What is the STAR method?</h2>
          <p className="lesson-lede">{lesson.introduction}</p>
        </section>

        <section className="star-step-list" aria-label="The four STAR method steps">
          {lesson.steps.map((step) => (
            <PixelPanel key={step.letter} className="star-step-card">
              <span className="star-step-letter" aria-hidden="true">
                {step.letter}
              </span>
              <div>
                <h2>{step.name}</h2>
                <p>{step.explanation}</p>
                <p className="star-step-prompt">
                  <strong>Ask yourself:</strong> {step.prompt}
                </p>
              </div>
            </PixelPanel>
          ))}
        </section>

        <section aria-labelledby="examples-heading">
          <p className="eyebrow">See the difference</p>
          <h2 id="examples-heading">From vague to convincing.</h2>
          <div className="response-example response-example-weak">
            <span className="response-label">Weak response</span>
            <blockquote>{lesson.weakResponse}</blockquote>
          </div>
          <div className="response-example response-example-strong">
            <span className="response-label">Strong response</span>
            <blockquote>{lesson.strongResponse}</blockquote>
          </div>
        </section>

        <section aria-labelledby="why-better-heading">
          <h2 id="why-better-heading">Why is the strong response better?</h2>
          <ul className="lesson-checklist">
            {lesson.whyStrongIsBetter.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>

        <PixelPanel tone="dark" className="lesson-summary">
          <p className="eyebrow">Lesson summary</p>
          <h2>Make the structure serve the story.</h2>
          <ul>
            {lesson.summaryPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </PixelPanel>

        <section className="lesson-completion" aria-labelledby="completion-heading">
          <div>
            <p className="eyebrow">Ready for the next step?</p>
            <h2 id="completion-heading">Save your lesson progress.</h2>
            <p>Completion is stored only in this browser for the current device.</p>
          </div>

          {completion.status === "loading" ? <CourseState state="loading" /> : null}
          {completion.status === "error" ? (
            <CourseState state="error" onRetry={completion.reload} />
          ) : null}
          {completion.status === "ready" ? (
            <div className="lesson-completion-actions" aria-live="polite">
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
