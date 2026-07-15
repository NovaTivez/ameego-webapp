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
