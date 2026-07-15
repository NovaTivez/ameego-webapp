import type { ReactNode } from "react";

type PixelCardProps = {
  title: string;
  label?: string;
  action?: ReactNode;
  children: ReactNode;
  tone?: "default" | "accent" | "success" | "danger";
  className?: string;
};

export function PixelCard({
  title,
  label,
  action,
  children,
  tone = "default",
  className = "",
}: PixelCardProps) {
  return (
    <article className={`pixel-card pixel-card-${tone} ${className}`}>
      <header className="pixel-card-header">
        <div>
          {label ? <span className="pixel-card-label">{label}</span> : null}
          <h3>{title}</h3>
        </div>
        {action ? <div className="pixel-card-action">{action}</div> : null}
      </header>
      <div className="pixel-card-body">{children}</div>
    </article>
  );
}
