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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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
    typeof value.completedAt !== "string" ||
    Number.isNaN(Date.parse(value.completedAt))
  ) {
    return null;
  }

  return {
    id: value.id,
    completedAt: value.completedAt,
    context,
    questionSource: source,
    questions,
    responses,
  };
}

export function readInterviewAttempts(storage: Storage): AttemptStore {
  const raw = storage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY);
  if (!raw) return { version: 1, attempts: [] };

  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || parsed.version !== 1 || !Array.isArray(parsed.attempts)) {
    throw new Error("Stored interview attempts have an unsupported format.");
  }
  const attempts = parsed.attempts.map(parseAttempt);
  if (attempts.some((attempt) => attempt === null)) {
    throw new Error("Stored interview attempts contain invalid data.");
  }
  return { version: 1, attempts: attempts as CompletedInterviewAttempt[] };
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

export function createCompletedAttempt(input: {
  context: CompletedInterviewAttempt["context"];
  questionSet: QuestionSet;
  responses: ConfirmedResponse[];
  id?: string;
  completedAt?: string;
}): CompletedInterviewAttempt {
  return {
    id:
      input.id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `attempt-${Date.now()}`),
    completedAt: input.completedAt ?? new Date().toISOString(),
    context: input.context,
    questionSource: input.questionSet.source,
    questions: input.questionSet.questions as InterviewQuestion[],
    responses: input.responses,
  };
}
