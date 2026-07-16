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

const PLACEHOLDER_ACTION = /^(none|n\/a|na|-|null|nil|\.|n\.a\.)$/i;

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function coerceScore(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const score = Math.round(value);
    return score >= 1 && score <= 5 ? score : null;
  }
  if (typeof value === "string" && value.trim()) {
    const score = Math.round(Number(value.trim()));
    return Number.isFinite(score) && score >= 1 && score <= 5 ? score : null;
  }
  return null;
}

function coerceCriterion(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return EVALUATION_CRITERIA.includes(
    normalized as (typeof EVALUATION_CRITERIA)[number],
  )
    ? normalized
    : null;
}

function longestTranscript(exchanges: EvaluationExchange[]): string {
  return (
    exchanges
      .map((exchange) => collapseWhitespace(exchange.transcript))
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0] ?? ""
  );
}

function minEvidenceLengthFor(exchanges: EvaluationExchange[]): number {
  const longest = longestTranscript(exchanges).length;
  return Math.min(MIN_EVIDENCE_LENGTH, Math.max(1, longest));
}

/**
 * Recover an exact transcript excerpt from a model evidence claim.
 * Llama often changes casing/whitespace or lightly paraphrases.
 * Short joke/test answers (e.g. "yea") still ground to the real transcript.
 */
export function groundEvidenceInTranscript(
  exchanges: EvaluationExchange[],
  evidence: string,
): string | null {
  const longest = longestTranscript(exchanges);
  if (!longest) return null;

  const minLen = minEvidenceLengthFor(exchanges);
  const claimed = collapseWhitespace(evidence);

  if (claimed.length >= minLen) {
    for (const exchange of exchanges) {
      if (exchange.transcript.includes(claimed)) return claimed;
    }

    const claimedLower = claimed.toLowerCase();
    for (const exchange of exchanges) {
      const idx = exchange.transcript.toLowerCase().indexOf(claimedLower);
      if (idx >= 0) {
        return exchange.transcript.slice(idx, idx + claimed.length);
      }
    }

    for (const exchange of exchanges) {
      const words = collapseWhitespace(exchange.transcript).split(" ");
      const needle = claimedLower;
      for (let start = 0; start < words.length; start += 1) {
        let built = "";
        for (let end = start; end < words.length; end += 1) {
          built = built ? `${built} ${words[end]}` : words[end];
          const collapsed = collapseWhitespace(built);
          if (collapsed.toLowerCase() === needle && collapsed.length >= minLen) {
            return collapsed;
          }
          if (collapsed.length > claimed.length + 24) break;
        }
      }
    }

    let best: string | null = null;
    const claimedWords = claimedLower.split(" ").filter(Boolean);
    for (const exchange of exchanges) {
      const words = collapseWhitespace(exchange.transcript).split(" ");
      for (let start = 0; start < words.length; start += 1) {
        let matched = 0;
        while (
          start + matched < words.length &&
          matched < claimedWords.length &&
          words[start + matched].toLowerCase() === claimedWords[matched]
        ) {
          matched += 1;
        }
        if (matched < 1) continue;
        const excerpt = words.slice(start, start + matched).join(" ");
        if (excerpt.length >= minLen && (!best || excerpt.length > best.length)) {
          best = excerpt;
        }
      }
    }
    if (best) return best;
  }

  // Always fall back to a real transcript window, even for tiny answers.
  return longest.slice(0, Math.min(120, longest.length));
}

/**
 * Groq Llama often returns grounded rubric scores but omits lesson/retry fields
 * or uses "None" placeholders. Fill only safe, non-invented defaults.
 */
export function normalizeEvaluationCandidate(
  value: unknown,
  request: EvaluationRequest,
): unknown {
  if (!isRecord(value)) return value;

  const next: Record<string, unknown> = { ...value };

  if (
    !boundedText(next.recommendedLessonId, 1, 120) ||
    !KNOWN_LESSON_IDS.includes(
      String(next.recommendedLessonId) as (typeof KNOWN_LESSON_IDS)[number],
    )
  ) {
    next.recommendedLessonId = deriveRecommendedLesson();
  }

  const cleanList = (value: unknown, fallback: string[]): string[] => {
    if (!Array.isArray(value)) return fallback;
    const cleaned = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length >= 2)
      .slice(0, 4);
    return cleaned.length > 0 ? cleaned : fallback;
  };
  next.strengths = cleanList(next.strengths, [
    "The learner submitted a response that can be improved with clearer STAR structure.",
  ]);
  next.improvements = cleanList(next.improvements, [
    "Expand the answer with a clear Situation, Task, Action, and Result.",
  ]);

  if (!boundedText(next.summary, 10, 1_000)) {
    next.summary =
      "The response needs a fuller STAR structure with clearer situation, task, action, and result detail.";
  }

  if (!boundedText(next.nextPracticeAction, 10, 600)) {
    next.nextPracticeAction =
      "Retry the same question and make one STAR part more specific using evidence from your experience.";
  }

  if (!boundedText(next.improvedExample, 20, 4_000)) {
    const joined = request.exchanges
      .map((exchange) => exchange.transcript.trim())
      .filter(Boolean)
      .join(" ");
    next.improvedExample =
      joined.length >= 20
        ? joined.slice(0, 4_000)
        : `Rewrite this as a full STAR answer with Situation, Task, Action, and Result. Current response: "${joined || "(empty)"}".`;
  }

  if (Array.isArray(next.rubricScores)) {
    next.rubricScores = next.rubricScores.map((item) => {
      if (!isRecord(item)) return item;
      const criterion = coerceCriterion(item.criterion) ?? item.criterion;
      const score = coerceScore(item.score);
      const grounded = groundEvidenceInTranscript(
        request.exchanges,
        typeof item.evidence === "string" ? item.evidence : "",
      );
      const action =
        typeof item.improvementAction === "string"
          ? item.improvementAction.trim()
          : "";
      const improvementAction =
        action.length >= 10 && !PLACEHOLDER_ACTION.test(action)
          ? action
          : `Add one more concrete ${
              typeof criterion === "string" ? criterion : "answer"
            } detail in your next attempt.`;
      return {
        ...item,
        criterion,
        ...(score !== null ? { score } : {}),
        ...(grounded ? { evidence: grounded } : {}),
        improvementAction,
      };
    });
  }

  return next;
}

export function explainEvaluationParseFailure(
  value: unknown,
  request: EvaluationRequest,
): string {
  if (!isRecord(value)) return "root_not_object";
  if (!Array.isArray(value.rubricScores)) return "rubricScores_missing";
  if (value.rubricScores.length !== EVALUATION_CRITERIA.length) {
    return `rubricScores_length_${value.rubricScores.length}`;
  }
  if (!boundedText(value.summary, 10, 1_000)) return "summary_invalid";
  if (!boundedTextList(value.strengths, 1, 4)) return "strengths_invalid";
  if (!boundedTextList(value.improvements, 1, 4)) return "improvements_invalid";
  if (!boundedText(value.nextPracticeAction, 10, 600)) {
    return "nextPracticeAction_invalid";
  }
  if (!boundedText(value.improvedExample, 20, 4_000)) {
    return "improvedExample_invalid";
  }
  if (containsUnsupportedEvaluationContent(value)) return "unsupported_claims";

  const seen = new Set<string>();
  for (const [index, item] of value.rubricScores.entries()) {
    if (!isRecord(item)) return `rubric_${index}_not_object`;
    const criterion = coerceCriterion(item.criterion);
    if (!criterion) return `rubric_${index}_criterion`;
    if (seen.has(criterion)) return `rubric_${index}_duplicate_${criterion}`;
    seen.add(criterion);
    if (coerceScore(item.score) === null) return `rubric_${index}_score`;
    if (!boundedText(item.explanation, 10, 800)) {
      return `rubric_${index}_explanation`;
    }
    const evidence = boundedText(
      item.evidence,
      minEvidenceLengthFor(request.exchanges),
      MAX_TRANSCRIPT_LENGTH,
    );
    if (!evidence) return `rubric_${index}_evidence_length`;
    if (!transcriptContainsEvidence(request.exchanges, evidence)) {
      return `rubric_${index}_evidence_ungrounded`;
    }
    if (!boundedText(item.improvementAction, 10, 600)) {
      return `rubric_${index}_improvementAction`;
    }
  }
  if (EVALUATION_CRITERIA.some((criterion) => !seen.has(criterion))) {
    return "rubric_missing_criterion";
  }
  const lesson = boundedText(value.recommendedLessonId, 1, 120);
  if (!lesson || lesson !== deriveRecommendedLesson()) {
    return "recommendedLessonId_invalid";
  }
  return "unknown";
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
  /\b(?:dishonest|untruthful|lying|deceptive)\b/i,
  /\b(?:unintelligent|intelligence quotient|\biq\b)\b/i,
  /\b(?:seem|seems|sound|sounds|appear|appears|is|was)\s+(?:intelligent|unintelligent|smart|stupid)\b/i,
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
      minEvidenceLengthFor(request.exchanges),
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
