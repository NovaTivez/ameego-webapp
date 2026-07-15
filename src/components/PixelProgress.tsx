type PixelProgressProps = {
  label: string;
  current: number;
  total: number;
};

export function PixelProgress({ label, current, total }: PixelProgressProps) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(0, current), safeTotal);
  const percent = Math.round((safeCurrent / safeTotal) * 100);

  return (
    <div className="pixel-progress">
      <div className="pixel-progress-label">
        <span>{label}</span>
        <strong>
          {safeCurrent}/{safeTotal}
        </strong>
      </div>
      <div
        className="pixel-progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
