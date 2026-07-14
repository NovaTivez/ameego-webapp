import type { ReactNode } from "react";

type PixelModalProps = {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
};

export function PixelModal({ title, children, actions, onClose }: PixelModalProps) {
  return (
    <div className="pixel-modal-backdrop">
      <section
        className="pixel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pixel-modal-title"
      >
        <div className="pixel-modal-heading">
          <h2 id="pixel-modal-title">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog">
            X
          </button>
        </div>
        <div className="pixel-modal-copy">{children}</div>
        {actions ? <div className="pixel-modal-actions">{actions}</div> : null}
      </section>
    </div>
  );
}
