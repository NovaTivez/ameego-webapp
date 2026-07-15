import type { ComponentPropsWithoutRef } from "react";

type PixelInputProps = Omit<ComponentPropsWithoutRef<"input">, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function PixelInput({
  id,
  label,
  hint,
  error,
  className = "",
  ...inputProps
}: PixelInputProps) {
  const descriptionId = hint || error ? `${id}-description` : undefined;

  return (
    <div className={`pixel-input-group ${className}`}>
      <label htmlFor={id}>{label}</label>
      <input
        {...inputProps}
        id={id}
        className="pixel-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionId}
      />
      {error ? (
        <span id={descriptionId} className="pixel-input-error">
          {error}
        </span>
      ) : hint ? (
        <span id={descriptionId} className="pixel-input-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
