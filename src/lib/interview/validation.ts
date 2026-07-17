import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_LENGTHS,
  INTERVIEW_TYPES,
  QUESTION_CATEGORIES,
  RESUME_FIELDS,
  type ConfirmedInterviewContext,
  type InterviewQuestion,
  type InterviewSetup,
  type QuestionSet,
  type ResumeProfile,
  type ValidationResult,
} from "@/lib/interview/contracts";

const TEXT_LIMITS = {
  role: 120,
  organization: 160,
  customInterviewType: 100,
  description: 4_000,
  goals: 2_000,
  resumeItem: 600,
  response: 8_000,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateInterviewSetup(
  value: InterviewSetup,
): ValidationResult<InterviewSetup> {
  const errors: Record<string, string> = {};

  if (!INTERVIEW_TYPES.includes(value.interviewType)) {
    errors.interviewType = "Choose an interview type.";
  }
  if (
    value.interviewType === "custom" &&
    (!value.customInterviewType.trim() ||
      value.customInterviewType.trim().length > TEXT_LIMITS.customInterviewType)
  ) {
    errors.customInterviewType = "Describe the custom interview type.";
  }
  if (!value.role.trim() || value.role.trim().length > TEXT_LIMITS.role) {
    errors.role = "Enter a role of 120 characters or fewer.";
  }
  if (
    !value.organization.trim() ||
    value.organization.trim().length > TEXT_LIMITS.organization
  ) {
    errors.organization = "Enter an organization of 160 characters or fewer.";
  }
  if (value.description.length > TEXT_LIMITS.description) {
    errors.description = "Keep responsibilities under 4,000 characters.";
  }
  if (value.goals.length > TEXT_LIMITS.goals) {
    errors.goals = "Keep practice goals under 2,000 characters.";
  }
  if (!INTERVIEW_DIFFICULTIES.includes(value.difficulty)) {
    errors.difficulty = "Choose a difficulty.";
  }
  if (!INTERVIEW_LENGTHS.includes(value.questionCount)) {
    errors.questionCount = "Choose 3, 5, or 8 questions.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      ...value,
      customInterviewType: value.customInterviewType.trim(),
      role: value.role.trim(),
      organization: value.organization.trim(),
      description: value.description.trim(),
      goals: value.goals.trim(),
    },
  };
}

export function parseResumeProfile(value: unknown): ResumeProfile | null {
  if (!isRecord(value)) return null;

  const profile = {} as ResumeProfile;
  for (const field of RESUME_FIELDS) {
    const items = value[field];
    if (
      !Array.isArray(items) ||
      items.length > 20 ||
      !items.every(
        (item) =>
          typeof item === "string" &&
          item.trim().length > 0 &&
          item.trim().length <= TEXT_LIMITS.resumeItem,
      )
    ) {
      return null;
    }
    profile[field] = items.map((item) => item.trim());
  }
  return profile;
}

export function hasResumeInformation(profile: ResumeProfile | null): boolean {
  return Boolean(profile && RESUME_FIELDS.some((field) => profile[field].length > 0));
}

export function parseConfirmedContext(value: unknown): ConfirmedInterviewContext | null {
  if (!isRecord(value) || !isRecord(value.setup)) return null;

  const candidate = value.setup;
  if (
    typeof candidate.interviewType !== "string" ||
    typeof candidate.customInterviewType !== "string" ||
    typeof candidate.role !== "string" ||
    typeof candidate.organization !== "string" ||
    typeof candidate.description !== "string" ||
    typeof candidate.goals !== "string" ||
    typeof candidate.difficulty !== "string" ||
    typeof candidate.questionCount !== "number"
  ) {
    return null;
  }

  const setup = candidate as InterviewSetup;
  const validatedSetup = validateInterviewSetup(setup);
  if (!validatedSetup.success) return null;

  if (value.resumeProfile === null || value.resumeProfile === undefined) {
    return { setup: validatedSetup.data, resumeProfile: null };
  }

  const resumeProfile = parseResumeProfile(value.resumeProfile);
  return resumeProfile ? { setup: validatedSetup.data, resumeProfile } : null;
}

function coerceQuestionCategory(
  value: unknown,
): (typeof QUESTION_CATEGORIES)[number] | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (QUESTION_CATEGORIES.includes(normalized as (typeof QUESTION_CATEGORIES)[number])) {
    return normalized as (typeof QUESTION_CATEGORIES)[number];
  }
  if (normalized === "intro" || normalized === "introduction") return "introductory";
  if (normalized === "behaviour" || normalized === "behavior") return "behavioral";
  if (normalized === "resume" || normalized === "project" || normalized === "resume_projects") {
    return "resume_project";
  }
  if (normalized === "role" || normalized === "technical" || normalized === "role_related") {
    return "role_specific";
  }
  return null;
}

function questionTextFrom(candidate: Record<string, unknown>): string | null {
  for (const key of ["text", "question", "prompt"] as const) {
    const value = candidate[key];
    if (typeof value !== "string") continue;
    const text = value.trim();
    if (text.length >= 10 && text.length <= 500) return text;
  }
  return null;
}

/**
 * Repair common Llama JSON drift before strict question-set validation.
 */
export function normalizeQuestionSetCandidate(
  value: unknown,
  context: ConfirmedInterviewContext,
): unknown {
  if (!isRecord(value) && !Array.isArray(value)) return value;

  const rawQuestions = Array.isArray(value)
    ? value
    : Array.isArray((value as Record<string, unknown>).questions)
      ? ((value as Record<string, unknown>).questions as unknown[])
      : null;
  if (!rawQuestions) return value;

  const allowResume = hasResumeInformation(context.resumeProfile);
  const seenIds = new Set<string>();
  const seenText = new Set<string>();
  const questions: InterviewQuestion[] = [];

  for (const [index, item] of rawQuestions.entries()) {
    if (!isRecord(item)) continue;
    let category = coerceQuestionCategory(item.category);
    if (!category) continue;
    if (category === "resume_project" && !allowResume) {
      category = "behavioral";
    }
    const text = questionTextFrom(item);
    if (!text) continue;
    const textKey = text.toLowerCase();
    if (seenText.has(textKey)) continue;

    let id =
      typeof item.id === "string" && /^[a-z0-9_-]{1,40}$/i.test(item.id.trim())
        ? item.id.trim()
        : `q${index + 1}`;
    if (seenIds.has(id)) id = `q${questions.length + 1}`;
    while (seenIds.has(id)) id = `${id}_${questions.length + 1}`;

    seenIds.add(id);
    seenText.add(textKey);
    questions.push({ id, category, text });
  }

  return { questions };
}

export function explainQuestionParseFailure(
  value: unknown,
  context: ConfirmedInterviewContext,
): string {
  if (!isRecord(value) || !Array.isArray(value.questions)) return "questions_missing";
  if (value.questions.length !== context.setup.questionCount) {
    return `questions_count_${value.questions.length}_expected_${context.setup.questionCount}`;
  }

  const allowResume = hasResumeInformation(context.resumeProfile);
  const seenIds = new Set<string>();
  const seenText = new Set<string>();
  for (const [index, candidate] of value.questions.entries()) {
    if (!isRecord(candidate)) return `question_${index}_not_object`;
    const id = typeof candidate.id === "string" ? candidate.id : "";
    const category = coerceQuestionCategory(candidate.category);
    const text = questionTextFrom(candidate);
    if (!id || !/^[a-z0-9_-]{1,40}$/i.test(id)) return `question_${index}_id`;
    if (seenIds.has(id)) return `question_${index}_duplicate_id`;
    if (!category) return `question_${index}_category`;
    if (!text) return `question_${index}_text`;
    if (seenText.has(text.toLowerCase())) return `question_${index}_duplicate_text`;
    if (category === "resume_project" && !allowResume) {
      return `question_${index}_resume_without_profile`;
    }
    seenIds.add(id);
    seenText.add(text.toLowerCase());
  }
  return "unknown";
}

export function parseQuestionSet(
  value: unknown,
  context: ConfirmedInterviewContext,
): QuestionSet | null {
  if (!isRecord(value) || !Array.isArray(value.questions)) return null;
  if (value.questions.length !== context.setup.questionCount) return null;

  const seenIds = new Set<string>();
  const seenText = new Set<string>();
  const questions: InterviewQuestion[] = [];

  for (const candidate of value.questions) {
    if (!isRecord(candidate)) return null;
    const { id, category, text } = candidate;
    if (
      typeof id !== "string" ||
      !/^[a-z0-9_-]{1,40}$/i.test(id) ||
      seenIds.has(id) ||
      typeof category !== "string" ||
      !QUESTION_CATEGORIES.includes(category as (typeof QUESTION_CATEGORIES)[number]) ||
      typeof text !== "string" ||
      text.trim().length < 10 ||
      text.trim().length > 500 ||
      seenText.has(text.trim().toLowerCase())
    ) {
      return null;
    }
    if (category === "resume_project" && !hasResumeInformation(context.resumeProfile)) {
      return null;
    }

    seenIds.add(id);
    seenText.add(text.trim().toLowerCase());
    questions.push({
      id,
      category: category as InterviewQuestion["category"],
      text: text.trim(),
    });
  }

  return { source: "ai", questions };
}

export function validateTranscript(transcript: string): string | null {
  const trimmed = transcript.trim();
  if (!trimmed) return "Enter or record a response before continuing.";
  if (trimmed.length > TEXT_LIMITS.response) {
    return "Keep the response under 8,000 characters.";
  }
  return null;
}
