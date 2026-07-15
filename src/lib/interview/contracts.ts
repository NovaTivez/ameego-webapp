import type { InterviewEvaluation } from "@/lib/evaluation/contracts";

export const INTERVIEW_TYPES = [
  "job",
  "internship",
  "student_organization",
  "scholarship",
  "university_admission",
  "leadership_position",
  "volunteer_position",
  "custom",
] as const;

export const INTERVIEW_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

export const INTERVIEW_LENGTHS = [3, 5, 8] as const;

export type InterviewType = (typeof INTERVIEW_TYPES)[number];
export type InterviewDifficulty = (typeof INTERVIEW_DIFFICULTIES)[number];
export type InterviewLength = (typeof INTERVIEW_LENGTHS)[number];

export type InterviewSetup = {
  interviewType: InterviewType;
  customInterviewType: string;
  role: string;
  organization: string;
  description: string;
  goals: string;
  difficulty: InterviewDifficulty;
  questionCount: InterviewLength;
};

export const RESUME_FIELDS = [
  "education",
  "experience",
  "projects",
  "skills",
  "leadership",
  "achievements",
] as const;

export type ResumeField = (typeof RESUME_FIELDS)[number];
export type ResumeProfile = Record<ResumeField, string[]>;

export const QUESTION_CATEGORIES = [
  "introductory",
  "behavioral",
  "resume_project",
  "role_specific",
] as const;

export type InterviewQuestionCategory = (typeof QUESTION_CATEGORIES)[number];

export type InterviewQuestion = {
  id: string;
  category: InterviewQuestionCategory;
  text: string;
};

export type QuestionSet = {
  source: "ai" | "general_fallback";
  questions: InterviewQuestion[];
};

export type ConfirmedInterviewContext = {
  setup: InterviewSetup;
  resumeProfile: ResumeProfile | null;
};

export type ConfirmedResponse = {
  questionId: string;
  transcript: string;
  inputMode: "text" | "microphone";
};

export type CompletedInterviewAttempt = {
  id: string;
  completedAt: string;
  context: ConfirmedInterviewContext;
  questionSource: QuestionSet["source"];
  questions: InterviewQuestion[];
  responses: ConfirmedResponse[];
  evaluation?: InterviewEvaluation;
  evaluatedAt?: string;
};

export type ValidationResult<T> =
  { success: true; data: T } | { success: false; errors: Record<string, string> };

export const EMPTY_RESUME_PROFILE: ResumeProfile = {
  education: [],
  experience: [],
  projects: [],
  skills: [],
  leadership: [],
  achievements: [],
};

export const DEFAULT_INTERVIEW_SETUP: InterviewSetup = {
  interviewType: "job",
  customInterviewType: "",
  role: "",
  organization: "",
  description: "",
  goals: "",
  difficulty: "Beginner",
  questionCount: 3,
};
