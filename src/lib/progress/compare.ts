import {
  EVALUATION_CRITERIA,
  type EvaluationCriterionId,
  type InterviewEvaluation,
} from "@/lib/evaluation/contracts";
import { STAR_RUBRIC } from "@/lib/evaluation/rubric";
import type { CompletedInterviewAttempt } from "@/lib/interview/contracts";

export type RubricChange = {
  criterion: EvaluationCriterionId;
  label: string;
  earlierScore: number;
  laterScore: number;
  delta: number;
  status: "improved" | "unchanged" | "declined";
};

export type AttemptComparison =
  | {
      comparable: true;
      earlier: CompletedInterviewAttempt;
      later: CompletedInterviewAttempt;
      rubricChanges: RubricChange[];
      specificImprovements: RubricChange[];
      remainingPracticeAreas: RubricChange[];
      narrative: string;
      claimsBroadImprovement: false;
    }
  | {
      comparable: false;
      reason: string;
    };

const WEAK_SCORE_THRESHOLD = 3;

export function getAttemptScenarioKey(attempt: CompletedInterviewAttempt): string {
  const { interviewType, customInterviewType, role, organization } =
    attempt.context.setup;
  const typeKey =
    interviewType === "custom"
      ? `custom:${customInterviewType.trim().toLowerCase()}`
      : interviewType;
  return [typeKey, role.trim().toLowerCase(), organization.trim().toLowerCase()].join(
    "::",
  );
}

export function describeAttemptScenario(attempt: CompletedInterviewAttempt): string {
  const { interviewType, customInterviewType, role, organization } =
    attempt.context.setup;
  const typeLabel =
    interviewType === "custom"
      ? customInterviewType.trim() || "Custom interview"
      : interviewType.replaceAll("_", " ");
  return `${typeLabel} · ${role} at ${organization}`;
}

export function hasSavedEvaluation(
  attempt: CompletedInterviewAttempt,
): attempt is CompletedInterviewAttempt & {
  evaluation: InterviewEvaluation;
  evaluatedAt: string;
} {
  return Boolean(attempt.evaluation && attempt.evaluatedAt);
}

export function orderAttemptsByTime(
  first: CompletedInterviewAttempt,
  second: CompletedInterviewAttempt,
): [CompletedInterviewAttempt, CompletedInterviewAttempt] {
  const firstTime = Date.parse(first.completedAt);
  const secondTime = Date.parse(second.completedAt);
  return firstTime <= secondTime ? [first, second] : [second, first];
}

export function areAttemptsComparable(
  first: CompletedInterviewAttempt,
  second: CompletedInterviewAttempt,
): { comparable: true } | { comparable: false; reason: string } {
  if (first.id === second.id) {
    return { comparable: false, reason: "Select two different attempts to compare." };
  }
  if (!hasSavedEvaluation(first) || !hasSavedEvaluation(second)) {
    return {
      comparable: false,
      reason:
        "Both attempts need a saved STAR evaluation before rubric comparison is available.",
    };
  }
  if (getAttemptScenarioKey(first) !== getAttemptScenarioKey(second)) {
    return {
      comparable: false,
      reason:
        "These attempts use different interview scenarios. Compare attempts that share the same interview type, role, and organization.",
    };
  }
  return { comparable: true };
}

function scoreFor(
  evaluation: InterviewEvaluation,
  criterion: EvaluationCriterionId,
): number {
  return evaluation.rubricScores.find((item) => item.criterion === criterion)?.score ?? 0;
}

function buildNarrative(
  specificImprovements: RubricChange[],
  remainingPracticeAreas: RubricChange[],
  rubricChanges: RubricChange[],
): string {
  const improvedCount = specificImprovements.length;
  const declinedCount = rubricChanges.filter((item) => item.status === "declined").length;

  if (improvedCount === 0 && declinedCount === 0) {
    return "Rubric scores stayed the same between these attempts. Keep practicing the remaining focus areas below.";
  }

  if (improvedCount === 1 && declinedCount === 0) {
    return `One rubric area improved (${specificImprovements[0].label}). That single change is not enough to claim overall progress.`;
  }

  if (improvedCount > 1 && declinedCount === 0 && remainingPracticeAreas.length === 0) {
    return `${improvedCount} rubric areas improved between these attempts. Review the specific gains below rather than treating one score as a broad upgrade.`;
  }

  if (improvedCount > 0 && declinedCount > 0) {
    return "Results are mixed: some rubric areas improved while others declined. Focus on the specific changes, not a single overall score.";
  }

  if (improvedCount > 0) {
    return `${improvedCount} rubric area${improvedCount === 1 ? "" : "s"} improved, and practice areas remain. Treat each criterion separately instead of claiming overall progress.`;
  }

  return "No rubric area improved between these attempts. Use the remaining practice areas below for the next retry.";
}

export function compareAttempts(
  first: CompletedInterviewAttempt,
  second: CompletedInterviewAttempt,
): AttemptComparison {
  const compatibility = areAttemptsComparable(first, second);
  if (!compatibility.comparable) {
    return compatibility;
  }

  const [earlier, later] = orderAttemptsByTime(first, second);
  const earlierEvaluation = earlier.evaluation!;
  const laterEvaluation = later.evaluation!;

  const rubricChanges: RubricChange[] = EVALUATION_CRITERIA.map((criterion) => {
    const earlierScore = scoreFor(earlierEvaluation, criterion);
    const laterScore = scoreFor(laterEvaluation, criterion);
    const delta = laterScore - earlierScore;
    return {
      criterion,
      label: STAR_RUBRIC[criterion].label,
      earlierScore,
      laterScore,
      delta,
      status: delta > 0 ? "improved" : delta < 0 ? "declined" : "unchanged",
    };
  });

  const specificImprovements = rubricChanges.filter((item) => item.status === "improved");
  const remainingPracticeAreas = rubricChanges.filter(
    (item) => item.laterScore <= WEAK_SCORE_THRESHOLD || item.status === "declined",
  );

  return {
    comparable: true,
    earlier,
    later,
    rubricChanges,
    specificImprovements,
    remainingPracticeAreas,
    narrative: buildNarrative(
      specificImprovements,
      remainingPracticeAreas,
      rubricChanges,
    ),
    claimsBroadImprovement: false,
  };
}
