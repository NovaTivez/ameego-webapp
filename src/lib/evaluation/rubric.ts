import { type EvaluationCriterionId } from "@/lib/evaluation/contracts";

export const STAR_LESSON_ID = "interview-foundations.star-method";
export const KNOWN_LESSON_IDS = [STAR_LESSON_ID] as const;

export type LessonRecommendation = {
  id: (typeof KNOWN_LESSON_IDS)[number];
  title: string;
  href: string;
  objective: string;
};

export const LESSON_RECOMMENDATIONS: Record<
  (typeof KNOWN_LESSON_IDS)[number],
  LessonRecommendation
> = {
  [STAR_LESSON_ID]: {
    id: STAR_LESSON_ID,
    title: "The STAR Method: Build Answers That Land",
    href: "/learn/star-method",
    objective:
      "Structure a behavioral answer with clear Situation, Task, Action, and Result evidence.",
  },
};

export function getLessonRecommendation(lessonId: string): LessonRecommendation | null {
  return Object.prototype.hasOwnProperty.call(LESSON_RECOMMENDATIONS, lessonId)
    ? LESSON_RECOMMENDATIONS[lessonId as keyof typeof LESSON_RECOMMENDATIONS]
    : null;
}

export const STAR_RUBRIC: Record<
  EvaluationCriterionId,
  { label: string; description: string }
> = {
  situation: {
    label: "Situation",
    description: "Gives concise context and explains why the circumstances mattered.",
  },
  task: {
    label: "Task",
    description: "Makes the learner's own responsibility, goal, or constraint clear.",
  },
  action: {
    label: "Action",
    description: "Explains specific decisions and steps the learner personally took.",
  },
  result: {
    label: "Result",
    description: "States a concrete outcome or learning supported by the transcript.",
  },
};

// The current MVP has one real lesson covering all four STAR weaknesses, so
// the recommendation is constant until more lessons exist.
export function deriveRecommendedLesson(): string {
  return STAR_LESSON_ID;
}
