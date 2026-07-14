import {
  EVALUATION_CRITERIA,
  type CriterionEvaluation,
  type EvaluationCriterionId,
} from "@/lib/evaluation/contracts";

export const STAR_LESSON_ID = "interview-foundations.star-method";
export const KNOWN_LESSON_IDS = [STAR_LESSON_ID] as const;

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

export function deriveRecommendedLesson(rubricScores: CriterionEvaluation[]): string {
  const byCriterion = new Map(rubricScores.map((item) => [item.criterion, item.score]));
  EVALUATION_CRITERIA.reduce((weakest, criterion) =>
    (byCriterion.get(criterion) ?? 6) < (byCriterion.get(weakest) ?? 6)
      ? criterion
      : weakest,
  );

  // The current MVP has one real lesson covering all four STAR weaknesses.
  return STAR_LESSON_ID;
}
