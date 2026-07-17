import { describe, expect, it } from "vitest";

import {
  COURSE_COMPLETION_BADGE,
  COURSE_COMPLETION_BONUS_XP,
  getAcademyLessonHref,
  interviewAcademyLessons,
  interviewAcademyPhases,
  starMethodLesson,
} from "@/content/interview-foundations";

describe("Interview Foundations content", () => {
  it("keeps every required STAR lesson element in the content model", () => {
    expect(starMethodLesson.title).toBeTruthy();
    expect(starMethodLesson.durationMinutes).toBeGreaterThan(0);
    expect(starMethodLesson.objective).toBeTruthy();
    expect(starMethodLesson.introduction).toBeTruthy();
    expect(starMethodLesson.steps.map((step) => step.name)).toEqual([
      "Situation",
      "Task",
      "Action",
      "Result",
    ]);
    expect(starMethodLesson.weakResponse).toBeTruthy();
    expect(starMethodLesson.strongResponse).toBeTruthy();
    expect(starMethodLesson.whyStrongIsBetter.length).toBeGreaterThan(0);
    expect(starMethodLesson.summaryPoints.length).toBeGreaterThan(0);
    expect(starMethodLesson.exerciseHref).toBe("/learn/star-method/exercise");
  });

  it("defines all four sequential academy phases and 17 dedicated lessons", () => {
    expect(interviewAcademyPhases.map((phase) => phase.title)).toEqual([
      "Preparing for Interviews",
      "Answering Clearly",
      "STAR Method",
      "Interview Delivery",
    ]);
    expect(interviewAcademyLessons).toHaveLength(17);
    expect(new Set(interviewAcademyLessons.map((lesson) => lesson.slug)).size).toBe(17);
    expect(
      interviewAcademyLessons.every(
        (lesson) =>
          lesson.objective &&
          lesson.difficulty &&
          lesson.xpReward > 0 &&
          lesson.exercise.prompts.length > 0,
      ),
    ).toBe(true);

    expect(interviewAcademyPhases[0].lessons.map((lesson) => lesson.title)).toEqual([
      "Research the Company",
      "Understand the Job Role",
      "Interview Checklist",
      "First Impression",
    ]);
    expect(interviewAcademyPhases[1].lessons.map((lesson) => lesson.title)).toEqual([
      "Speaking Clearly",
      "Tell Me About Yourself",
      "Common Interview Questions",
      "Difficult Questions",
    ]);
    expect(interviewAcademyPhases[2].lessons.map((lesson) => lesson.title)).toEqual([
      "STAR Introduction",
      "Situation & Task",
      "Action",
      "Result",
      "Complete STAR Story",
    ]);
    expect(interviewAcademyPhases[3].lessons.map((lesson) => lesson.title)).toEqual([
      "Voice & Speaking",
      "Body Language",
      "Confidence",
      "Professional Closing",
    ]);
    expect(getAcademyLessonHref(interviewAcademyPhases[1].lessons[0])).toBe(
      "/learn/academy/speaking-clearly",
    );
    expect(getAcademyLessonHref(interviewAcademyPhases[2].lessons[0])).toBe(
      "/learn/star-method",
    );
    expect(interviewAcademyPhases.map((phase) => phase.badge)).toEqual([
      "Research Rookie",
      "Clear Communicator",
      "STAR Storyteller",
      "Confident Candidate",
    ]);
    expect(COURSE_COMPLETION_BADGE).toBe("Interview Master");
    expect(COURSE_COMPLETION_BONUS_XP).toBe(500);
  });
});
