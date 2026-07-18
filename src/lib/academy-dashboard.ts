import {
  getAcademyLessonHref,
  interviewAcademyLessons,
  interviewAcademyPhases,
  type AcademyLesson,
} from "@/content/interview-foundations";
import { readCourseProgress } from "@/lib/course-progress";
import { readExerciseProgress } from "@/lib/exercise-progress";
import { readInterviewAttempts } from "@/lib/interview/attempts";
import type { CompletedInterviewAttempt } from "@/lib/interview/contracts";
import { calculatePlayerProgress, PROGRESS_XP } from "@/lib/player-progress";
import { calculateCurrentStreak } from "@/lib/progress";
import { readLearnerProfile } from "@/lib/settings";

export const ACADEMY_RANKS = [
  { name: "Recruit", minimumXp: 0 },
  { name: "Candidate", minimumXp: 200 },
  { name: "Professional", minimumXp: 500 },
  { name: "Specialist", minimumXp: 1_000 },
  { name: "Expert", minimumXp: 1_400 },
  { name: "Interview Master", minimumXp: 1_900 },
] as const;

export type AcademyBadge = {
  name: string;
  requirement: string;
  unlocked: boolean;
};

export type AcademyCertificate = {
  name: string;
  requirement: string;
  earned: boolean;
  available: boolean;
};

export type AcademyTimelineMilestone = {
  title: string;
  detail: string;
  reached: boolean;
  occurredAt?: string;
};

export type AcademyDashboardSnapshot = {
  playerName: string;
  playerFocus: string;
  totalXp: number;
  level: number;
  rankPosition: number;
  currentRank: string;
  nextRank: string | null;
  nextRankMinimumXp: number | null;
  rankProgressPercent: number;
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: Array<{ date: string; active: boolean; isToday: boolean }>;
  courseProgressPercent: number;
  completedLessonCount: number;
  totalLessonCount: number;
  courseComplete: boolean;
  currentLesson: AcademyLesson | null;
  currentLessonHref: string;
  remainingMinutes: number;
  latestAttempt: CompletedInterviewAttempt | null;
  interviewCount: number;
  evaluatedInterviewCount: number;
  averageInterviewScore: number | null;
  latestStarScore: number | null;
  todayInterviewCount: number;
  todayXp: number;
  recentActivity: Array<{
    id: string;
    kind: "lesson" | "interview" | "badge" | "xp";
    title: string;
    detail: string;
    occurredAt?: string;
  }>;
  badges: AcademyBadge[];
  certificates: AcademyCertificate[];
  timeline: AcademyTimelineMilestone[];
};

function utcDateKey(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function calculateLongestStreak(attempts: CompletedInterviewAttempt[]): number {
  const activityDays = [
    ...new Set(attempts.map((attempt) => utcDateKey(new Date(attempt.completedAt)))),
  ]
    .map((value) => Date.parse(`${value}T00:00:00.000Z`))
    .sort((left, right) => left - right);
  let longest = 0;
  let current = 0;
  let previous: number | null = null;

  for (const day of activityDays) {
    current = previous !== null && day - previous === 86_400_000 ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = day;
  }
  return longest;
}

function averageEvaluationScore(attempts: CompletedInterviewAttempt[]): number | null {
  const scores = attempts.flatMap(
    (attempt) => attempt.evaluation?.rubricScores.map((item) => item.score) ?? [],
  );
  if (scores.length === 0) return null;
  return Math.round(
    (scores.reduce((sum, score) => sum + score, 0) / scores.length / 5) * 100,
  );
}

function findCurrentRank(totalXp: number) {
  const currentIndex = ACADEMY_RANKS.findLastIndex((rank) => totalXp >= rank.minimumXp);
  const safeIndex = Math.max(0, currentIndex);
  const current = ACADEMY_RANKS[safeIndex];
  const next = ACADEMY_RANKS[safeIndex + 1] ?? null;
  const range = next ? next.minimumXp - current.minimumXp : 1;
  const progress = next
    ? Math.min(100, Math.round(((totalXp - current.minimumXp) / range) * 100))
    : 100;
  return { current, next, progress, position: safeIndex + 1 };
}

export function buildAcademyDashboardSnapshot(
  storage: Storage,
  now = new Date(),
): AcademyDashboardSnapshot {
  const profile = readLearnerProfile(storage);
  const courseProgress = readCourseProgress(storage);
  const exerciseProgress = readExerciseProgress(storage);
  const attempts = [...readInterviewAttempts(storage).attempts].sort(
    (left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt),
  );
  const completedIds = new Set(courseProgress.completedLessonIds);
  const completedLessons = interviewAcademyLessons.filter((lesson) =>
    completedIds.has(lesson.id),
  );
  const courseComplete = completedLessons.length === interviewAcademyLessons.length;
  const currentLesson =
    interviewAcademyLessons.find((lesson) => !completedIds.has(lesson.id)) ?? null;
  const currentLessonHref = currentLesson
    ? getAcademyLessonHref(currentLesson)
    : "/practice";
  const evaluatedAttempts = attempts.filter((attempt) => attempt.evaluation);
  const playerProgress = calculatePlayerProgress({
    courseProgress,
    exerciseProgress,
    attempts,
  });
  const totalXp = playerProgress.xp;
  const rank = findCurrentRank(totalXp);
  const todayKey = utcDateKey(now);
  const todayAttempts = attempts.filter(
    (attempt) => utcDateKey(new Date(attempt.completedAt)) === todayKey,
  );
  const todayEvaluations = evaluatedAttempts.filter(
    (attempt) =>
      attempt.evaluatedAt && utcDateKey(new Date(attempt.evaluatedAt)) === todayKey,
  );
  const todayXp =
    todayAttempts.length * PROGRESS_XP.simulation +
    todayEvaluations.length * PROGRESS_XP.validatedFeedback;
  const activityDays = new Set(
    attempts.map((attempt) => utcDateKey(new Date(attempt.completedAt))),
  );
  const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (6 - index)),
    );
    const dateKey = utcDateKey(date);
    return {
      date: date.toISOString(),
      active: activityDays.has(dateKey),
      isToday: dateKey === todayKey,
    };
  });

  const badges: AcademyBadge[] = interviewAcademyPhases.map((phase) => ({
    name: phase.badge,
    requirement: `Complete Phase ${phase.number}`,
    unlocked: phase.lessons.every((lesson) => completedIds.has(lesson.id)),
  }));
  badges.push({
    name: "Interview Master",
    requirement: "Complete all academy lessons",
    unlocked: courseComplete,
  });
  const firstUnlockedBadge = badges.find((badge) => badge.unlocked) ?? null;
  const latestAttempt = attempts[0] ?? null;
  const firstAttempt = attempts.at(-1) ?? null;
  const starComplete =
    interviewAcademyPhases
      .find((phase) => phase.id === "star")
      ?.lessons.every((lesson) => completedIds.has(lesson.id)) ?? false;
  const firstLesson = completedLessons[0] ?? null;
  const recentActivity: AcademyDashboardSnapshot["recentActivity"] = attempts
    .slice(0, 3)
    .map((attempt) => ({
      id: `interview-${attempt.id}`,
      kind: "interview" as const,
      title: "Interview session completed",
      detail: `${attempt.context.setup.role || "Practice role"} · ${attempt.evaluation ? "Feedback saved" : "Transcript saved"}`,
      occurredAt: attempt.completedAt,
    }));
  recentActivity.push(
    ...completedLessons
      .slice(-2)
      .reverse()
      .map((lesson) => ({
        id: `lesson-${lesson.id}`,
        kind: "lesson" as const,
        title: `${lesson.title} completed`,
        detail: `+${lesson.xpReward} XP · Completion date is not stored`,
      })),
  );
  if (firstUnlockedBadge) {
    recentActivity.push({
      id: `badge-${firstUnlockedBadge.name}`,
      kind: "badge",
      title: `${firstUnlockedBadge.name} earned`,
      detail: "Academy phase badge unlocked",
    });
  }

  return {
    playerName: profile.name,
    playerFocus: profile.focus,
    totalXp,
    level: playerProgress.level,
    rankPosition: rank.position,
    currentRank: rank.current.name,
    nextRank: rank.next?.name ?? null,
    nextRankMinimumXp: rank.next?.minimumXp ?? null,
    rankProgressPercent: rank.progress,
    currentStreak: calculateCurrentStreak(attempts, now),
    longestStreak: calculateLongestStreak(attempts),
    weeklyActivity,
    courseProgressPercent: Math.round(
      (completedLessons.length / interviewAcademyLessons.length) * 100,
    ),
    completedLessonCount: completedLessons.length,
    totalLessonCount: interviewAcademyLessons.length,
    courseComplete,
    currentLesson,
    currentLessonHref,
    remainingMinutes: interviewAcademyLessons
      .filter((lesson) => !completedIds.has(lesson.id))
      .reduce((sum, lesson) => sum + lesson.durationMinutes, 0),
    latestAttempt,
    interviewCount: attempts.length,
    evaluatedInterviewCount: evaluatedAttempts.length,
    averageInterviewScore: averageEvaluationScore(evaluatedAttempts),
    latestStarScore: latestAttempt?.evaluation
      ? averageEvaluationScore([latestAttempt])
      : null,
    todayInterviewCount: todayAttempts.length,
    todayXp,
    recentActivity: recentActivity.slice(0, 6),
    badges,
    certificates: [
      {
        name: "Course Completion",
        requirement: "Complete all 17 lessons",
        earned: courseComplete,
        available: false,
      },
      {
        name: "Interview Skills Academy",
        requirement: "Complete the academy learning path",
        earned: courseComplete,
        available: false,
      },
      {
        name: "Final Mock Interview",
        requirement: "Complete an evaluated graduation interview",
        earned: courseComplete && evaluatedAttempts.length > 0,
        available: false,
      },
    ],
    timeline: [
      { title: "Joined the academy", detail: "Learner profile is active", reached: true },
      {
        title: "Completed first lesson",
        detail: firstLesson?.title ?? "Complete any academy lesson",
        reached: Boolean(firstLesson),
      },
      {
        title: "Finished first interview",
        detail: firstAttempt
          ? firstAttempt.context.setup.role || "Practice interview"
          : "Complete a mock interview",
        reached: Boolean(firstAttempt),
        occurredAt: firstAttempt?.completedAt,
      },
      {
        title: "Completed first STAR response",
        detail: starComplete ? "STAR phase cleared" : "Clear all STAR Method lessons",
        reached: starComplete,
      },
      {
        title: "Earned first badge",
        detail: firstUnlockedBadge?.name ?? "Complete an academy phase",
        reached: Boolean(firstUnlockedBadge),
      },
      {
        title: "Latest milestone",
        detail: latestAttempt
          ? `${latestAttempt.context.setup.role || "Practice interview"} session saved`
          : (currentLesson?.title ?? "Academy learning path complete"),
        reached: Boolean(latestAttempt || completedLessons.length),
        occurredAt: latestAttempt?.completedAt,
      },
    ],
  };
}
