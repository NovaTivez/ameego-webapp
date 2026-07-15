import type { ReactNode } from "react";

type PixelFormFieldProps = {
  htmlFor: string;
  label: ReactNode;
  children: ReactNode;
  error?: string;
  hint?: string;
  className?: string;
};

export function PixelFormField({
  htmlFor,
  label,
  children,
  error,
  hint,
  className = "",
}: PixelFormFieldProps) {
  return (
    <div className={`interview-field pixel-form-field ${className}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}
