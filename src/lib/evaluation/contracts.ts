export const EVALUATION_CRITERIA = ["situation", "task", "action", "result"] as const;

export type EvaluationCriterionId = (typeof EVALUATION_CRITERIA)[number];

export type EvaluationExchange = {
  questionId: string;
  question: string;
  transcript: string;
};

export type EvaluationRequest = {
  attemptId: string;
  role: string;
  organization: string;
  exchanges: EvaluationExchange[];
};

export type CriterionEvaluation = {
  criterion: EvaluationCriterionId;
  score: number;
  explanation: string;
  evidence: string;
  improvementAction: string;
};

export type InterviewEvaluation = {
  summary: string;
  strengths: string[];
  improvements: string[];
  rubricScores: CriterionEvaluation[];
  recommendedLessonId: string;
  nextPracticeAction: string;
  improvedExample: string;
};
