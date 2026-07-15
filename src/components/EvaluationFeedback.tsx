import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import type { InterviewEvaluation } from "@/lib/evaluation/contracts";
import { getLessonRecommendation, STAR_RUBRIC } from "@/lib/evaluation/rubric";

import styles from "./evaluation-feedback.module.css";

type EvaluationFeedbackProps = {
  evaluation: InterviewEvaluation;
  session: {
    role: string;
    organization: string;
    responseCount: number;
  };
  onRetry: () => void;
};

export function EvaluationFeedback({
  evaluation,
  session,
  onRetry,
}: EvaluationFeedbackProps) {
  const recommendedLesson = getLessonRecommendation(evaluation.recommendedLessonId);

  // The report never renders an unrecognized recommendation, even if a caller bypasses
  // the normal server and client schema-validation boundary.
  if (!recommendedLesson) return null;

  return (
    <section
      className={`${styles.report} evaluation-feedback`}
      aria-labelledby="evaluation-heading"
    >
      <div className="evaluation-heading-row">
        <div>
          <span className={styles.completionRibbon}>Learning checkpoint complete</span>
          <p className="eyebrow">Evidence-based practice feedback</p>
          <h2 id="evaluation-heading">Your STAR communication review</h2>
        </div>
        <PixelBadge tone="mint">Interview Coach</PixelBadge>
      </div>

      <div className="evaluation-disclaimer" role="note">
        This is practice feedback—not an official grade or hiring decision. It evaluates
        only the confirmed transcript and does not assess emotion, honesty, intelligence,
        employability, or accent.
      </div>

      <section
        className={`${styles.summaryPanel} evaluation-report-section evaluation-session-summary`}
      >
        <p className="evaluation-section-number" aria-hidden="true">
          01
        </p>
        <div>
          <p className="eyebrow">Educational session summary</p>
          <h3>Overall summary</h3>
          <p className="evaluation-session-context">
            {session.role} practice for {session.organization}
          </p>
          <p className="evaluation-summary">{evaluation.summary}</p>
          <p className="evaluation-session-meta">
            Review based on {session.responseCount} confirmed{" "}
            {session.responseCount === 1 ? "response" : "responses"}.
          </p>
        </div>
      </section>

      <div className={`${styles.guidanceGrid} evaluation-guidance-grid`}>
        <section className="evaluation-report-section">
          <p className="evaluation-section-number" aria-hidden="true">
            02
          </p>
          <div>
            <p className="eyebrow">What you did well</p>
            <h3>Strengths</h3>
            <ul>
              {evaluation.strengths.map((strength) => (
                <li key={strength}>{strength}</li>
              ))}
            </ul>
          </div>
        </section>
        <section className="evaluation-report-section evaluation-opportunity">
          <p className="evaluation-section-number" aria-hidden="true">
            03
          </p>
          <div>
            <p className="eyebrow">Main improvement opportunity</p>
            <h3>Areas to improve</h3>
            <ul>
              {evaluation.improvements.map((improvement) => (
                <li key={improvement}>{improvement}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section
        className={`${styles.rubricPanel} evaluation-report-block`}
        aria-labelledby="rubric-heading"
      >
        <div className="evaluation-section-heading">
          <span className="evaluation-section-number" aria-hidden="true">
            04
          </span>
          <div>
            <p className="eyebrow">Rubric breakdown</p>
            <h3 id="rubric-heading">Rubric score summary</h3>
          </div>
        </div>
        <div className="evaluation-rubric">
          {evaluation.rubricScores.map((item) => (
            <article className="evaluation-criterion" key={item.criterion}>
              <div className="evaluation-criterion-heading">
                <div>
                  <h4>{STAR_RUBRIC[item.criterion].label}</h4>
                  <p>{STAR_RUBRIC[item.criterion].description}</p>
                </div>
                <span aria-label={`${item.score} out of 5`}>{item.score}/5</span>
              </div>
              <p>{item.explanation}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="evaluation-report-block" aria-labelledby="evidence-heading">
        <div className="evaluation-section-heading">
          <span className="evaluation-section-number" aria-hidden="true">
            05
          </span>
          <div>
            <p className="eyebrow">Transcript evidence</p>
            <h3 id="evidence-heading">What the review used</h3>
          </div>
        </div>
        <div className="evaluation-evidence-list">
          {evaluation.rubricScores.map((item) => (
            <figure key={item.criterion} className="evaluation-evidence-card">
              <figcaption>{STAR_RUBRIC[item.criterion].label} evidence</figcaption>
              <blockquote>“{item.evidence}”</blockquote>
            </figure>
          ))}
        </div>
      </section>

      <section className="evaluation-report-block" aria-labelledby="actions-heading">
        <div className="evaluation-section-heading">
          <span className="evaluation-section-number" aria-hidden="true">
            06
          </span>
          <div>
            <p className="eyebrow">Specific improvement actions</p>
            <h3 id="actions-heading">Changes to make on your next attempt</h3>
          </div>
        </div>
        <ol className="evaluation-action-list">
          {evaluation.rubricScores.map((item) => (
            <li key={item.criterion}>
              <strong>{STAR_RUBRIC[item.criterion].label}</strong>
              <span>{item.improvementAction}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="evaluation-next-step evaluation-recommended-lesson">
        <p className="evaluation-section-number" aria-hidden="true">
          07
        </p>
        <div>
          <PixelBadge tone="amber">Recommended lesson</PixelBadge>
          <h3>{recommendedLesson.title}</h3>
          <p>{recommendedLesson.objective}</p>
          <PixelButton href={recommendedLesson.href} variant="secondary">
            Open recommended lesson
          </PixelButton>
        </div>
      </section>

      <section className="evaluation-next-step">
        <p className="evaluation-section-number" aria-hidden="true">
          08
        </p>
        <div>
          <PixelBadge tone="mint">Focused retry goal</PixelBadge>
          <h3>One goal for your next attempt</h3>
          <p>{evaluation.nextPracticeAction}</p>
        </div>
      </section>

      <section className="evaluation-example">
        <p className="evaluation-section-number" aria-hidden="true">
          09
        </p>
        <div>
          <p className="eyebrow">Improved answer example</p>
          <h3>A clearer version using your confirmed facts</h3>
          <p>
            This example may reorganize only information already present in your confirmed
            transcript.
          </p>
          <blockquote>{evaluation.improvedExample}</blockquote>
        </div>
      </section>

      <section className="evaluation-report-action" aria-labelledby="retry-heading">
        <p className="evaluation-section-number" aria-hidden="true">
          10
        </p>
        <div>
          <p className="eyebrow">Retry simulation</p>
          <h3 id="retry-heading">Practice the same scenario with one focused goal</h3>
          <p>
            Your role, organization, questions, and focused retry goal will stay with you.
          </p>
          <PixelButton onClick={onRetry}>Retry this simulation</PixelButton>
        </div>
      </section>

      <section className="evaluation-report-action" aria-labelledby="continue-heading">
        <p className="evaluation-section-number" aria-hidden="true">
          11
        </p>
        <div>
          <p className="eyebrow">Continue learning</p>
          <h3 id="continue-heading">Return to Interview Foundations</h3>
          <p>Review your lesson path and choose the next structured activity.</p>
          <PixelButton href="/learn" variant="ghost">
            Continue learning
          </PixelButton>
        </div>
      </section>
    </section>
  );
}
