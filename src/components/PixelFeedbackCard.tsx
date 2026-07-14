import type { ReactNode } from "react";

type PixelFeedbackCardProps = {
  title: string;
  score?: string;
  children: ReactNode;
  tone?: "success" | "warning" | "info";
};

export function PixelFeedbackCard({
  title,
  score,
  children,
  tone = "info",
}: PixelFeedbackCardProps) {
  return (
    <article className={`pixel-feedback-card pixel-feedback-${tone}`}>
      <div className="pixel-feedback-heading">
        <h3>{title}</h3>
        {score ? <span>{score}</span> : null}
      </div>
      {children}
    </article>
  );
}
