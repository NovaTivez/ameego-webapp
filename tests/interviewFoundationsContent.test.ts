import { describe, expect, it } from "vitest";

import { starMethodLesson } from "@/content/interview-foundations";

describe("Interview Foundations content", () => {
  it("keeps every required lesson element in the content model", () => {
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
});
