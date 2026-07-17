import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelIcon } from "@/components/PixelIcon";
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

  const overallScore =
    evaluation.rubricScores.reduce((total, item) => total + item.score, 0) /
    evaluation.rubricScores.length;

  return (
    <section
      className={`${styles.report} evaluation-feedback`}
      aria-labelledby="evaluation-heading"
    >
      <header className={styles.reportHeader}>
        <div>
          <span className={styles.completionRibbon}>
            <PixelIcon name="check" size="small" />
            Learning checkpoint complete
          </span>
          <h2 id="evaluation-heading">Feedback Report</h2>
          <p>
            A clear, evidence-based review of your STAR communication and the next actions
            that will make your answer stronger.
          </p>
        </div>
        <PixelBadge tone="mint">Interview Coach</PixelBadge>
      </header>

      <div className={styles.disclaimer} role="note">
        <PixelIcon name="speech" size="small" />
        <span>
          This is practice feedback—not an official grade or hiring decision. It evaluates
          only the confirmed transcript and does not assess emotion, honesty,
          intelligence, employability, or accent.
        </span>
      </div>

      <section className={styles.sectionCard} aria-labelledby="overall-score-heading">
        <div className={styles.sectionHeading}>
          <PixelIcon name="star" size="medium" />
          <div>
            <p>Performance snapshot</p>
            <h3 id="overall-score-heading">Overall Score</h3>
          </div>
        </div>
        <div className={styles.overallGrid}>
          <div className={styles.scoreBlock}>
            <strong aria-label={`${overallScore.toFixed(1)} out of 5`}>
              {overallScore.toFixed(1)}
            </strong>
            <span>out of 5 across STAR</span>
          </div>
          <div className={styles.summaryBlock}>
            <p className={styles.sessionContext}>
              {session.role} practice for {session.organization}
            </p>
            <h4>STAR performance snapshot</h4>
            <p>
              This score is the average of your validated Situation, Task, Action, and
              Result rubric scores. Use the breakdown below to see where your answer is
              strongest and what to practice next.
            </p>
            <p className={styles.sessionMeta}>
              Review based on {session.responseCount} confirmed{" "}
              {session.responseCount === 1 ? "response" : "responses"}.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.sectionCard} aria-labelledby="star-evaluation-heading">
        <div className={styles.sectionHeading}>
          <PixelIcon name="progress" size="medium" />
          <div>
            <p>Rubric breakdown</p>
            <h3 id="star-evaluation-heading">STAR Evaluation</h3>
          </div>
        </div>
        <div className={styles.rubricGrid}>
          {evaluation.rubricScores.map((item) => (
            <article className={styles.criterion} key={item.criterion}>
              <div className={styles.criterionHeader}>
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

      <div className={styles.guidanceGrid}>
        <section
          className={`${styles.sectionCard} ${styles.strengthCard}`}
          aria-labelledby="strengths-heading"
        >
          <div className={styles.sectionHeading}>
            <PixelIcon name="check" size="medium" />
            <div>
              <p>What worked well</p>
              <h3 id="strengths-heading">Strengths</h3>
            </div>
          </div>
          <ul className={styles.guidanceList}>
            {evaluation.strengths.map((strength) => (
              <li key={strength}>{strength}</li>
            ))}
          </ul>
        </section>

        <section
          className={`${styles.sectionCard} ${styles.improvementCard}`}
          aria-labelledby="improvements-heading"
        >
          <div className={styles.sectionHeading}>
            <PixelIcon name="lesson" size="medium" />
            <div>
              <p>Where to focus next</p>
              <h3 id="improvements-heading">Areas for Improvement</h3>
            </div>
          </div>
          <ul className={styles.guidanceList}>
            {evaluation.improvements.map((improvement) => (
              <li key={improvement}>{improvement}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className={styles.sectionCard} aria-labelledby="ai-feedback-heading">
        <div className={styles.sectionHeading}>
          <PixelIcon name="speech" size="medium" />
          <div>
            <p>Transcript-grounded review</p>
            <h3 id="ai-feedback-heading">AI Feedback</h3>
          </div>
        </div>
        <div className={styles.feedbackSummary}>{evaluation.summary}</div>

        <h4 className={styles.subsectionHeading}>Evidence from your transcript</h4>
        <div className={styles.evidenceGrid}>
          {evaluation.rubricScores.map((item) => (
            <figure key={item.criterion} className={styles.evidenceCard}>
              <figcaption>{STAR_RUBRIC[item.criterion].label} evidence</figcaption>
              <blockquote>“{item.evidence}”</blockquote>
            </figure>
          ))}
        </div>

        <h4 className={styles.subsectionHeading}>Improved answer example</h4>
        <div className={styles.improvedExample}>
          <p>
            This example may reorganize only information already present in your confirmed
            transcript.
          </p>
          <blockquote>{evaluation.improvedExample}</blockquote>
        </div>
      </section>

      <section className={styles.sectionCard} aria-labelledby="actionable-tips-heading">
        <div className={styles.sectionHeading}>
          <PixelIcon name="lesson" size="medium" />
          <div>
            <p>Your focused improvement plan</p>
            <h3 id="actionable-tips-heading">Actionable Tips</h3>
          </div>
        </div>
        <ol className={styles.actionList}>
          {evaluation.rubricScores.map((item) => (
            <li key={item.criterion}>
              <strong>{STAR_RUBRIC[item.criterion].label}</strong>
              <span>{item.improvementAction}</span>
            </li>
          ))}
        </ol>

        <div className={styles.nextStepsGrid}>
          <article className={styles.nextStep}>
            <PixelBadge tone="mint">Focused retry goal</PixelBadge>
            <h4>One goal for your next attempt</h4>
            <p>{evaluation.nextPracticeAction}</p>
            <PixelButton onClick={onRetry}>Retry this simulation</PixelButton>
          </article>
          <article className={styles.nextStep}>
            <PixelBadge tone="amber">Recommended lesson</PixelBadge>
            <h4>{recommendedLesson.title}</h4>
            <p>{recommendedLesson.objective}</p>
            <PixelButton href={recommendedLesson.href} variant="secondary">
              Open recommended lesson
            </PixelButton>
          </article>
        </div>

        <div className={styles.learningActions}>
          <PixelButton href="/learn" variant="ghost">
            Continue learning
          </PixelButton>
        </div>
      </section>
    </section>
  );
}
