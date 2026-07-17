import type { InterviewEvaluation } from "@/lib/evaluation/contracts";
import { parseInterviewEvaluation } from "@/lib/evaluation/schema";
import {
  type CompletedInterviewAttempt,
  type ConfirmedResponse,
  type InterviewQuestion,
  type QuestionSet,
} from "@/lib/interview/contracts";
import {
  parseConfirmedContext,
  parseQuestionSet,
  validateTranscript,
} from "@/lib/interview/validation";

export const INTERVIEW_ATTEMPTS_STORAGE_KEY = "ameego:interview-attempts:v1";

type AttemptStore = {
  version: 1;
  attempts: CompletedInterviewAttempt[];
};

export class InterviewAttemptStoreFormatError extends Error {
  constructor() {
    super("Stored interview attempts have an unsupported format.");
    this.name = "InterviewAttemptStoreFormatError";
  }
}

export function isInterviewAttemptStoreFormatError(
  error: unknown,
): error is InterviewAttemptStoreFormatError {
  return error instanceof InterviewAttemptStoreFormatError;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function buildEvaluationRequest(attempt: {
  id: string;
  context: CompletedInterviewAttempt["context"];
  questions: InterviewQuestion[];
  responses: ConfirmedResponse[];
}) {
  return {
    attemptId: attempt.id,
    role: attempt.context.setup.role,
    organization: attempt.context.setup.organization,
    exchanges: attempt.questions.map((question) => ({
      questionId: question.id,
      question: question.text,
      transcript:
        attempt.responses.find((response) => response.questionId === question.id)
          ?.transcript ?? "",
    })),
  };
}

function parseStoredEvaluation(
  attempt: {
    id: string;
    context: CompletedInterviewAttempt["context"];
    questions: InterviewQuestion[];
    responses: ConfirmedResponse[];
  },
  evaluationValue: unknown,
  evaluatedAtValue: unknown,
): { evaluation: InterviewEvaluation; evaluatedAt: string } | null {
  if (evaluationValue === undefined && evaluatedAtValue === undefined) {
    return null;
  }
  if (
    typeof evaluatedAtValue !== "string" ||
    Number.isNaN(Date.parse(evaluatedAtValue))
  ) {
    return null;
  }
  const request = buildEvaluationRequest(attempt);
  const evaluation = parseInterviewEvaluation(evaluationValue, request);
  if (!evaluation) return null;
  return { evaluation, evaluatedAt: evaluatedAtValue };
}

function parseAttempt(value: unknown): CompletedInterviewAttempt | null {
  if (!isRecord(value)) return null;
  const context = parseConfirmedContext(value.context);
  if (!context || !Array.isArray(value.questions) || !Array.isArray(value.responses)) {
    return null;
  }
  const source = value.questionSource;
  if (source !== "ai" && source !== "general_fallback") return null;
  const questionSet = parseQuestionSet({ questions: value.questions }, context);
  if (!questionSet) return null;
  const questions = questionSet.questions;
  if (value.responses.length !== questions.length) return null;

  const responses: ConfirmedResponse[] = [];
  for (const response of value.responses) {
    if (!isRecord(response)) return null;
    const questionId = response.questionId;
    const transcript = response.transcript;
    const inputMode = response.inputMode;
    if (
      typeof questionId !== "string" ||
      !questions.some((question) => question.id === questionId) ||
      typeof transcript !== "string" ||
      validateTranscript(transcript) ||
      (inputMode !== "text" && inputMode !== "microphone")
    ) {
      return null;
    }
    responses.push({ questionId, transcript: transcript.trim(), inputMode });
  }

  if (
    typeof value.id !== "string" ||
    !value.id ||
    value.id.length > 120 ||
    typeof value.completedAt !== "string" ||
    Number.isNaN(Date.parse(value.completedAt))
  ) {
    return null;
  }

  const base = {
    id: value.id,
    completedAt: value.completedAt,
    context,
    questionSource: source,
    questions,
    responses,
  } as const;

  const retryGoal =
    typeof value.retryGoal === "string" && value.retryGoal.trim()
      ? value.retryGoal.trim()
      : undefined;
  if (value.retryGoal !== undefined && !retryGoal) return null;

  if (value.evaluation === undefined && value.evaluatedAt === undefined) {
    return { ...base, ...(retryGoal ? { retryGoal } : {}) };
  }

  const storedEvaluation = parseStoredEvaluation(
    base,
    value.evaluation,
    value.evaluatedAt,
  );
  if (!storedEvaluation) return null;

  return {
    ...base,
    evaluation: storedEvaluation.evaluation,
    evaluatedAt: storedEvaluation.evaluatedAt,
    ...(retryGoal ? { retryGoal } : {}),
  };
}

export function readInterviewAttempts(storage: Storage): AttemptStore {
  const raw = storage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY);
  if (!raw) return { version: 1, attempts: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new InterviewAttemptStoreFormatError();
  }
  if (!isRecord(parsed) || parsed.version !== 1 || !Array.isArray(parsed.attempts)) {
    throw new InterviewAttemptStoreFormatError();
  }
  // Invalid individual records are dropped instead of hiding every attempt,
  // so one stale-format entry cannot make the whole history unavailable.
  const attempts = parsed.attempts
    .map(parseAttempt)
    .filter((attempt): attempt is CompletedInterviewAttempt => attempt !== null);
  return { version: 1, attempts };
}

export function clearInterviewAttempts(storage: Storage): void {
  storage.removeItem(INTERVIEW_ATTEMPTS_STORAGE_KEY);
}

export function saveCompletedAttempt(
  storage: Storage,
  attempt: CompletedInterviewAttempt,
): AttemptStore {
  const validated = parseAttempt(attempt);
  if (!validated) throw new Error("The completed attempt is invalid.");
  const current = readInterviewAttempts(storage);
  const next = {
    version: 1 as const,
    attempts: [...current.attempts, validated].slice(-20),
  };
  storage.setItem(INTERVIEW_ATTEMPTS_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function saveAttemptEvaluation(
  storage: Storage,
  attemptId: string,
  evaluation: InterviewEvaluation,
  evaluatedAt = new Date().toISOString(),
): CompletedInterviewAttempt {
  const current = readInterviewAttempts(storage);
  const index = current.attempts.findIndex((attempt) => attempt.id === attemptId);
  if (index < 0) {
    throw new Error("The interview attempt could not be found for evaluation saving.");
  }

  const existing = current.attempts[index];
  const nextAttempt = parseAttempt({
    ...existing,
    evaluation,
    evaluatedAt,
  });
  if (!nextAttempt?.evaluation) {
    throw new Error("The evaluation could not be saved with this attempt.");
  }

  const attempts = [...current.attempts];
  attempts[index] = nextAttempt;
  storage.setItem(
    INTERVIEW_ATTEMPTS_STORAGE_KEY,
    JSON.stringify({ version: 1, attempts }),
  );
  return nextAttempt;
}

export function getInterviewAttemptById(
  storage: Storage,
  attemptId: string,
): CompletedInterviewAttempt | null {
  return (
    readInterviewAttempts(storage).attempts.find((attempt) => attempt.id === attemptId) ??
    null
  );
}

export function createCompletedAttempt(input: {
  context: CompletedInterviewAttempt["context"];
  questionSet: QuestionSet;
  responses: ConfirmedResponse[];
  id?: string;
  completedAt?: string;
  evaluation?: InterviewEvaluation;
  evaluatedAt?: string;
  retryGoal?: string;
}): CompletedInterviewAttempt {
  const attempt: CompletedInterviewAttempt = {
    id:
      input.id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `attempt-${Date.now()}`),
    completedAt: input.completedAt ?? new Date().toISOString(),
    context: input.context,
    questionSource: input.questionSet.source,
    questions: input.questionSet.questions,
    responses: input.responses,
    ...(input.retryGoal?.trim() ? { retryGoal: input.retryGoal.trim() } : {}),
  };

  if (input.evaluation && input.evaluatedAt) {
    attempt.evaluation = input.evaluation;
    attempt.evaluatedAt = input.evaluatedAt;
  }

  return attempt;
}
