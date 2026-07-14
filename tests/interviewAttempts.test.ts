import { beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_INTERVIEW_SETUP,
  type ConfirmedInterviewContext,
  type QuestionSet,
} from "@/lib/interview/contracts";
import {
  createCompletedAttempt,
  INTERVIEW_ATTEMPTS_STORAGE_KEY,
  readInterviewAttempts,
  saveCompletedAttempt,
} from "@/lib/interview/attempts";

const context: ConfirmedInterviewContext = {
  setup: {
    ...DEFAULT_INTERVIEW_SETUP,
    role: "Volunteer coordinator",
    organization: "Community Hub",
  },
  resumeProfile: null,
};

const questionSet: QuestionSet = {
  source: "general_fallback",
  questions: [
    {
      id: "q1",
      category: "introductory",
      text: "Please introduce yourself for this opportunity.",
    },
    {
      id: "q2",
      category: "behavioral",
      text: "Describe a challenge you handled with others.",
    },
    {
      id: "q3",
      category: "role_specific",
      text: "How would you prioritize volunteer responsibilities?",
    },
  ],
};

describe("completed interview attempt persistence", () => {
  beforeEach(() => window.localStorage.clear());

  it("saves and restores confirmed responses without raw resume data", () => {
    const attempt = createCompletedAttempt({
      id: "attempt-1",
      completedAt: "2026-07-15T00:00:00.000Z",
      context,
      questionSet,
      responses: questionSet.questions.map((question) => ({
        questionId: question.id,
        transcript: `Confirmed response for ${question.id}`,
        inputMode: "text" as const,
      })),
    });

    saveCompletedAttempt(window.localStorage, attempt);
    const restored = readInterviewAttempts(window.localStorage);

    expect(restored.attempts).toEqual([attempt]);
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).not.toMatch(
      /file_data|base64/i,
    );
  });

  it("does not save incomplete attempts", () => {
    const attempt = createCompletedAttempt({
      context,
      questionSet,
      responses: [],
    });

    expect(() => saveCompletedAttempt(window.localStorage, attempt)).toThrow(/invalid/i);
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toBeNull();
  });
});
