import type { EvaluationRequest, InterviewEvaluation } from "@/lib/evaluation/contracts";
import { EvaluationError } from "@/lib/evaluation/errors";
import { EVALUATION_INSTRUCTIONS, buildEvaluationPrompt } from "@/lib/evaluation/prompt";
import {
  INTERVIEW_EVALUATION_JSON_SCHEMA,
  explainEvaluationParseFailure,
  normalizeEvaluationCandidate,
  parseInterviewEvaluation,
} from "@/lib/evaluation/schema";
import {
  extractResponseRefusal,
  extractResponseText,
  InterviewAIError,
  requestStructuredResponse,
} from "@/lib/interview/openai";

export async function evaluateInterview(
  request: EvaluationRequest,
  options: Parameters<typeof requestStructuredResponse>[1] = {},
): Promise<InterviewEvaluation> {
  let rawResponse: unknown;
  try {
    rawResponse = await requestStructuredResponse(
      {
        instructions: EVALUATION_INSTRUCTIONS,
        input: buildEvaluationPrompt(request),
        reasoning: { effort: "low" },
        text: {
          format: {
            type: "json_schema",
            name: "interview_evaluation",
            strict: true,
            schema: INTERVIEW_EVALUATION_JSON_SCHEMA,
          },
        },
      },
      options,
    );
  } catch (error) {
    if (error instanceof InterviewAIError) {
      throw new EvaluationError(error.kind, error.message);
    }
    throw new EvaluationError("provider", "Evaluation could not be completed.");
  }

  if (extractResponseRefusal(rawResponse)) {
    throw new EvaluationError("refusal", "The model declined this evaluation.");
  }
  const outputText = extractResponseText(rawResponse);
  if (!outputText) {
    throw new EvaluationError("invalid_output", "The model returned no evaluation.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(outputText);
  } catch {
    throw new EvaluationError("invalid_output", "The model returned malformed JSON.");
  }
  const normalized = normalizeEvaluationCandidate(parsed, request);
  const evaluation = parseInterviewEvaluation(normalized, request);
  if (!evaluation) {
    const reason = explainEvaluationParseFailure(normalized, request);
    if (process.env.NODE_ENV !== "production") {
      console.error("[evaluate] validation_failed", reason, {
        criteria: Array.isArray((normalized as { rubricScores?: unknown }).rubricScores)
          ? (
              normalized as {
                rubricScores: Array<{ criterion?: unknown; evidence?: unknown }>
              }
            ).rubricScores.map((item) => ({
              criterion: item.criterion,
              evidence: typeof item.evidence === "string" ? item.evidence.slice(0, 80) : null,
            }))
          : null,
      });
    }
    throw new EvaluationError(
      "invalid_output",
      "The model output failed evidence, lesson, rubric, or safety validation.",
    );
  }
  return evaluation;
}
