import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelFeedbackCard } from "@/components/PixelFeedbackCard";
import type { InterviewEvaluation } from "@/lib/evaluation/contracts";
import { STAR_RUBRIC } from "@/lib/evaluation/rubric";

type EvaluationFeedbackProps = {
  evaluation: InterviewEvaluation;
};

export function EvaluationFeedback({ evaluation }: EvaluationFeedbackProps) {
  return (
    <section className="evaluation-feedback" aria-labelledby="evaluation-heading">
      <div className="evaluation-heading-row">
        <div>
          <p className="eyebrow">Evidence-based practice feedback</p>
          <h2 id="evaluation-heading">Your STAR communication review</h2>
        </div>
        <PixelBadge tone="mint">GPT-5.6 review</PixelBadge>
      </div>

      <div className="evaluation-disclaimer" role="note">
        This is practice feedback—not an official grade or hiring decision. It evaluates
        only the confirmed transcript and does not assess emotion, honesty, intelligence,
        employability, or accent.
      </div>

      <p className="evaluation-summary">{evaluation.summary}</p>

      <div className="evaluation-list-grid">
        <section>
          <h3>Strengths</h3>
          <ul>
            {evaluation.strengths.map((strength) => (
              <li key={strength}>{strength}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>Improvements</h3>
          <ul>
            {evaluation.improvements.map((improvement) => (
              <li key={improvement}>{improvement}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="evaluation-rubric">
        {evaluation.rubricScores.map((item) => (
          <PixelFeedbackCard
            key={item.criterion}
            title={STAR_RUBRIC[item.criterion].label}
            score={`${item.score}/5`}
            tone={item.score >= 4 ? "success" : item.score >= 3 ? "info" : "warning"}
          >
            <p>{item.explanation}</p>
            <div>
              <strong>Transcript evidence</strong>
              <blockquote>“{item.evidence}”</blockquote>
            </div>
            <p>
              <strong>Improvement action:</strong> {item.improvementAction}
            </p>
          </PixelFeedbackCard>
        ))}
      </div>

      <div className="evaluation-next-step">
        <PixelBadge tone="amber">Focused retry</PixelBadge>
        <h3>Next practice action</h3>
        <p>{evaluation.nextPracticeAction}</p>
        <PixelButton href="/learn/star-method" variant="secondary">
          Review recommended STAR lesson
        </PixelButton>
      </div>

      <section className="evaluation-example">
        <h3>Improved example</h3>
        <p>
          This example may reorganize only information already present in your confirmed
          transcript.
        </p>
        <blockquote>{evaluation.improvedExample}</blockquote>
      </section>
    </section>
  );
}
