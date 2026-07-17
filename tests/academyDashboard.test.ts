import { beforeEach, describe, expect, it } from "vitest";

import { interviewAcademyPhases } from "@/content/interview-foundations";
import { buildAcademyDashboardSnapshot } from "@/lib/academy-dashboard";
import { completeLesson } from "@/lib/course-progress";
import { saveAttemptEvaluation, saveCompletedAttempt } from "@/lib/interview/attempts";
import { saveLearnerProfile } from "@/lib/settings";

import { makeProgressAttempt } from "./progressFixtures";

describe("Academy dashboard progress model", () => {
  beforeEach(() => window.localStorage.clear());

  it("builds an honest empty-state dashboard from the existing stores", () => {
    const snapshot = buildAcademyDashboardSnapshot(
      window.localStorage,
      new Date("2026-07-17T08:00:00.000Z"),
    );

    expect(snapshot.playerName).toBe("Pixel Learner");
    expect(snapshot.currentRank).toBe("Recruit");
    expect(snapshot.totalXp).toBe(0);
    expect(snapshot.currentLesson?.title).toBe("Research the Company");
    expect(snapshot.currentLessonHref).toBe("/learn/academy/research-company");
    expect(snapshot.averageInterviewScore).toBeNull();
    expect(snapshot.weeklyActivity).toHaveLength(7);
    expect(snapshot.certificates.every((certificate) => !certificate.available)).toBe(
      true,
    );
  });

  it("derives lessons, XP, badges, ranks, scores, and streaks without a second store", () => {
    saveLearnerProfile(window.localStorage, {
      name: "Hannah",
      focus: "Internship Interviews",
    });
    for (const lesson of interviewAcademyPhases[0].lessons) {
      completeLesson(window.localStorage, lesson.id);
    }

    const savedAttempt = makeProgressAttempt({
      id: "academy-hub-attempt",
      completedAt: "2026-07-17T06:00:00.000Z",
      evaluated: false,
      role: "Frontend Intern",
    });
    const evaluationSource = makeProgressAttempt({
      id: "academy-hub-attempt",
      completedAt: "2026-07-17T06:00:00.000Z",
      scores: [4, 3, 4, 5],
    });
    saveCompletedAttempt(window.localStorage, savedAttempt);
    saveAttemptEvaluation(
      window.localStorage,
      savedAttempt.id,
      evaluationSource.evaluation!,
      "2026-07-17T07:00:00.000Z",
    );

    const snapshot = buildAcademyDashboardSnapshot(
      window.localStorage,
      new Date("2026-07-17T08:00:00.000Z"),
    );

    expect(snapshot.playerName).toBe("Hannah");
    expect(snapshot.completedLessonCount).toBe(4);
    expect(snapshot.courseProgressPercent).toBe(24);
    expect(snapshot.currentLesson?.title).toBe("Speaking Clearly");
    expect(snapshot.totalXp).toBe(375);
    expect(snapshot.currentRank).toBe("Candidate");
    expect(snapshot.nextRank).toBe("Professional");
    expect(snapshot.todayInterviewCount).toBe(1);
    expect(snapshot.todayXp).toBe(175);
    expect(snapshot.currentStreak).toBe(1);
    expect(snapshot.longestStreak).toBe(1);
    expect(snapshot.averageInterviewScore).toBe(80);
    expect(snapshot.badges[0]).toMatchObject({
      name: "Research Rookie",
      unlocked: true,
    });
  });
});
