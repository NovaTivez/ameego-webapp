export type EvaluationErrorKind =
  "configuration" | "timeout" | "network" | "provider" | "refusal" | "invalid_output";

export class EvaluationError extends Error {
  constructor(
    public readonly kind: EvaluationErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "EvaluationError";
  }
}
