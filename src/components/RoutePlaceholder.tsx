import { PixelBadge } from "@/components/PixelBadge";
import { PixelButton } from "@/components/PixelButton";
import { PixelPanel } from "@/components/PixelPanel";

type RoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  steps: string[];
  nextHref: string;
  nextLabel: string;
};

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  status,
  steps,
  nextHref,
  nextLabel,
}: RoutePlaceholderProps) {
  return (
    <div className="page-stack route-page">
      <section className="route-intro" aria-labelledby="route-title">
        <div>
          <PixelBadge tone="mint">{status}</PixelBadge>
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="route-title">{title}</h1>
          <p className="hero-lede">{description}</p>
          <div className="button-row">
            <PixelButton href={nextHref}>{nextLabel}</PixelButton>
            <PixelButton href="/" variant="secondary">
              Back to lobby
            </PixelButton>
          </div>
        </div>
        <PixelPanel tone="dark" className="route-console">
          <span className="console-label">Room checklist</span>
          <ol>
            {steps.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </PixelPanel>
      </section>
    </div>
  );
}
