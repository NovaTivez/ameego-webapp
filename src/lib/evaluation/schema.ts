import {
  EVALUATION_CRITERIA,
  type CriterionEvaluation,
  type EvaluationExchange,
  type EvaluationRequest,
  type InterviewEvaluation,
} from "@/lib/evaluation/contracts";
import { deriveRecommendedLesson, KNOWN_LESSON_IDS } from "@/lib/evaluation/rubric";

const MAX_EXCHANGES = 8;
const MAX_TRANSCRIPT_LENGTH = 8_000;
// A one-character "excerpt" is a substring of almost any transcript, which
// would make the evidence-grounding check meaningless.
const MIN_EVIDENCE_LENGTH = 15;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function boundedText(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length >= min && text.length <= max ? text : null;
}

function boundedTextList(
  value: unknown,
  minItems: number,
  maxItems: number,
  maxLength = 500,
): string[] | null {
  if (!Array.isArray(value) || value.length < minItems || value.length > maxItems) {
    return null;
  }
  const result = value.map((item) => boundedText(item, 2, maxLength));
  return result.every((item): item is string => item !== null) ? result : null;
}

export function parseEvaluationRequest(value: unknown): EvaluationRequest | null {
  if (!isRecord(value) || !Array.isArray(value.exchanges)) return null;
  const attemptId = boundedText(value.attemptId, 1, 120);
  const role = boundedText(value.role, 1, 120);
  const organization = boundedText(value.organization, 1, 160);
  if (
    !attemptId ||
    !role ||
    !organization ||
    value.exchanges.length < 1 ||
    value.exchanges.length > MAX_EXCHANGES
  ) {
    return null;
  }

  const seen = new Set<string>();
  const exchanges: EvaluationExchange[] = [];
  for (const item of value.exchanges) {
    if (!isRecord(item)) return null;
    const questionId = boundedText(item.questionId, 1, 40);
    const question = boundedText(item.question, 10, 500);
    const transcript = boundedText(item.transcript, 1, MAX_TRANSCRIPT_LENGTH);
    if (!questionId || !question || !transcript || seen.has(questionId)) return null;
    seen.add(questionId);
    exchanges.push({ questionId, question, transcript });
  }
  return { attemptId, role, organization, exchanges };
}

export function transcriptContainsEvidence(
  exchanges: EvaluationExchange[],
  evidence: string,
): boolean {
  return exchanges.some((exchange) => exchange.transcript.includes(evidence));
}

const UNSUPPORTED_PATTERNS = [
  /\b(?:seem|seems|sound|sounds|appear|appears|is|was)\s+(?:emotionally\s+)?(?:nervous|anxious|calm|upset|angry|afraid)\b/i,
  /\b(?:honest|dishonest|truthful|untruthful|lying|deceptive)\b/i,
  /\b(?:intelligent|unintelligent|smart|stupid|intelligence)\b/i,
  /\b(?:employable|unemployable|hireable|unhireable|should be hired|should not be hired|would hire|hiring decision)\b/i,
  /\b(?:accent|native speaker|non-native speaker|pronunciation)\b/i,
  /\b(?:official grade|official score|pass\/fail decision)\b/i,
] as const;

export function containsUnsupportedEvaluationContent(value: unknown): boolean {
  const serialized = JSON.stringify(value);
  return UNSUPPORTED_PATTERNS.some((pattern) => pattern.test(serialized));
}

export function parseInterviewEvaluation(
  value: unknown,
  request: EvaluationRequest,
): InterviewEvaluation | null {
  if (!isRecord(value) || !Array.isArray(value.rubricScores)) return null;
  const summary = boundedText(value.summary, 10, 1_000);
  const strengths = boundedTextList(value.strengths, 1, 4);
  const improvements = boundedTextList(value.improvements, 1, 4);
  const nextPracticeAction = boundedText(value.nextPracticeAction, 10, 600);
  const improvedExample = boundedText(value.improvedExample, 20, 4_000);
  if (
    !summary ||
    !strengths ||
    !improvements ||
    !nextPracticeAction ||
    !improvedExample ||
    value.rubricScores.length !== EVALUATION_CRITERIA.length ||
    containsUnsupportedEvaluationContent(value)
  ) {
    return null;
  }

  const scores: CriterionEvaluation[] = [];
  const seen = new Set<string>();
  for (const item of value.rubricScores) {
    if (!isRecord(item)) return null;
    const criterion = item.criterion;
    const explanation = boundedText(item.explanation, 10, 800);
    const evidence = boundedText(
      item.evidence,
      MIN_EVIDENCE_LENGTH,
      MAX_TRANSCRIPT_LENGTH,
    );
    const improvementAction = boundedText(item.improvementAction, 10, 600);
    if (
      typeof criterion !== "string" ||
      !EVALUATION_CRITERIA.includes(criterion as (typeof EVALUATION_CRITERIA)[number]) ||
      seen.has(criterion) ||
      typeof item.score !== "number" ||
      !Number.isInteger(item.score) ||
      item.score < 1 ||
      item.score > 5 ||
      !explanation ||
      !evidence ||
      !transcriptContainsEvidence(request.exchanges, evidence) ||
      !improvementAction
    ) {
      return null;
    }
    seen.add(criterion);
    scores.push({
      criterion: criterion as CriterionEvaluation["criterion"],
      score: item.score,
      explanation,
      evidence,
      improvementAction,
    });
  }
  if (EVALUATION_CRITERIA.some((criterion) => !seen.has(criterion))) return null;

  const recommendedLessonId = boundedText(value.recommendedLessonId, 1, 120);
  if (
    !recommendedLessonId ||
    !KNOWN_LESSON_IDS.includes(
      recommendedLessonId as (typeof KNOWN_LESSON_IDS)[number],
    ) ||
    recommendedLessonId !== deriveRecommendedLesson()
  ) {
    return null;
  }

  return {
    summary,
    strengths,
    improvements,
    rubricScores: EVALUATION_CRITERIA.map((criterion) =>
      scores.find((item) => item.criterion === criterion)!,
    ),
    recommendedLessonId,
    nextPracticeAction,
    improvedExample,
  };
}

export const INTERVIEW_EVALUATION_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    strengths: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
    improvements: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string" },
    },
    rubricScores: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          criterion: { type: "string", enum: [...EVALUATION_CRITERIA] },
          score: { type: "integer", minimum: 1, maximum: 5 },
          explanation: { type: "string" },
          evidence: { type: "string" },
          improvementAction: { type: "string" },
        },
        required: ["criterion", "score", "explanation", "evidence", "improvementAction"],
        additionalProperties: false,
      },
    },
    recommendedLessonId: { type: "string", enum: [...KNOWN_LESSON_IDS] },
    nextPracticeAction: { type: "string" },
    improvedExample: { type: "string" },
  },
  required: [
    "summary",
    "strengths",
    "improvements",
    "rubricScores",
    "recommendedLessonId",
    "nextPracticeAction",
    "improvedExample",
  ],
  additionalProperties: false,
} as const;
