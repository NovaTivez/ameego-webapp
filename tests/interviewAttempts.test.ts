import { beforeEach, describe, expect, it, vi } from "vitest";

import type { InterviewEvaluation } from "@/lib/evaluation/contracts";
import {
  DEFAULT_INTERVIEW_SETUP,
  type CompletedInterviewAttempt,
  type ConfirmedInterviewContext,
  type QuestionSet,
} from "@/lib/interview/contracts";
import {
  createCompletedAttempt,
  deleteInterviewAttempt,
  INTERVIEW_ATTEMPTS_STORAGE_KEY,
  readInterviewAttempts,
  saveAttemptEvaluation,
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

function makeAttempt(id: string, completedAt: string): CompletedInterviewAttempt {
  return createCompletedAttempt({
    id,
    completedAt,
    context,
    questionSet,
    responses: questionSet.questions.map((question) => ({
      questionId: question.id,
      transcript: `Confirmed response for ${question.id}`,
      inputMode: "text" as const,
    })),
  });
}

function makeEvaluation(evidence: string): InterviewEvaluation {
  return {
    summary: "The transcript follows a recognizable STAR structure overall.",
    strengths: ["Clear ownership of the described task."],
    improvements: ["Add one measurable outcome to the result."],
    rubricScores: (["situation", "task", "action", "result"] as const).map(
      (criterion) => ({
        criterion,
        score: 3,
        explanation: `The ${criterion} element is present in the confirmed answer.`,
        evidence,
        improvementAction: `Sharpen the ${criterion} with one concrete detail.`,
      }),
    ),
    recommendedLessonId: "interview-foundations.star-method",
    nextPracticeAction: "Retry the same scenario and quantify the result.",
    improvedExample:
      "In my last project I owned onboarding, cut it to five days, and raised attendance to 90%.",
  };
}

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

  it("deletes only the requested saved attempt", () => {
    saveCompletedAttempt(
      window.localStorage,
      makeAttempt("attempt-1", "2026-07-01T00:00:00.000Z"),
    );
    saveCompletedAttempt(
      window.localStorage,
      makeAttempt("attempt-2", "2026-07-02T00:00:00.000Z"),
    );

    const next = deleteInterviewAttempt(window.localStorage, "attempt-1");

    expect(next.attempts.map((attempt) => attempt.id)).toEqual(["attempt-2"]);
    expect(
      readInterviewAttempts(window.localStorage).attempts.map((attempt) => attempt.id),
    ).toEqual(["attempt-2"]);
    expect(() => deleteInterviewAttempt(window.localStorage, "missing-attempt")).toThrow(
      /could not be found/i,
    );
  });

  it("keeps only the newest 20 attempts", () => {
    for (let index = 1; index <= 21; index += 1) {
      saveCompletedAttempt(
        window.localStorage,
        makeAttempt(
          `attempt-${index}`,
          `2026-07-${String(index).padStart(2, "0")}T00:00:00.000Z`,
        ),
      );
    }

    const restored = readInterviewAttempts(window.localStorage);
    expect(restored.attempts).toHaveLength(20);
    expect(restored.attempts[0].id).toBe("attempt-2");
    expect(restored.attempts.at(-1)?.id).toBe("attempt-21");
  });

  it("restores legacy attempts saved before evaluations existed", () => {
    const attempt = makeAttempt("legacy-attempt", "2026-07-01T00:00:00.000Z");
    const legacyRecord = {
      id: attempt.id,
      completedAt: attempt.completedAt,
      context: attempt.context,
      questionSource: attempt.questionSource,
      questions: attempt.questions,
      responses: attempt.responses,
    };
    window.localStorage.setItem(
      INTERVIEW_ATTEMPTS_STORAGE_KEY,
      JSON.stringify({ version: 1, attempts: [legacyRecord] }),
    );

    const restored = readInterviewAttempts(window.localStorage);
    expect(restored.attempts).toHaveLength(1);
    expect(restored.attempts[0].id).toBe("legacy-attempt");
    expect(restored.attempts[0].evaluation).toBeUndefined();
  });

  it("drops an invalid stored attempt without hiding the valid ones", () => {
    const valid = makeAttempt("valid-attempt", "2026-07-01T00:00:00.000Z");
    const invalid = { ...valid, id: "broken-attempt", evaluation: { bogus: true } };
    window.localStorage.setItem(
      INTERVIEW_ATTEMPTS_STORAGE_KEY,
      JSON.stringify({ version: 1, attempts: [valid, invalid] }),
    );

    const restored = readInterviewAttempts(window.localStorage);
    expect(restored.attempts.map((attempt) => attempt.id)).toEqual(["valid-attempt"]);
  });

  it("rejects unsupported store versions and corrupt JSON", () => {
    window.localStorage.setItem(
      INTERVIEW_ATTEMPTS_STORAGE_KEY,
      JSON.stringify({ version: 2, attempts: [] }),
    );
    expect(() => readInterviewAttempts(window.localStorage)).toThrow(
      /unsupported format/i,
    );

    window.localStorage.setItem(INTERVIEW_ATTEMPTS_STORAGE_KEY, "{not json");
    expect(() => readInterviewAttempts(window.localStorage)).toThrow(
      /unsupported format/i,
    );
  });
});

describe("attempt evaluation persistence", () => {
  beforeEach(() => window.localStorage.clear());

  it("rejects saving an evaluation for an unknown attempt and leaves storage intact", () => {
    saveCompletedAttempt(
      window.localStorage,
      makeAttempt("attempt-1", "2026-07-01T00:00:00.000Z"),
    );
    const before = window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY);

    expect(() =>
      saveAttemptEvaluation(
        window.localStorage,
        "missing-attempt",
        makeEvaluation("Confirmed response for q1"),
      ),
    ).toThrow(/could not be found/i);
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toBe(before);
  });

  it("rejects an evaluation whose evidence is not in the confirmed transcript", () => {
    saveCompletedAttempt(
      window.localStorage,
      makeAttempt("attempt-1", "2026-07-01T00:00:00.000Z"),
    );
    const before = window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY);

    expect(() =>
      saveAttemptEvaluation(
        window.localStorage,
        "attempt-1",
        makeEvaluation("This sentence never appears in any transcript."),
      ),
    ).toThrow(/could not be saved/i);
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toBe(before);
  });

  it("surfaces storage write failures and keeps the previous store", () => {
    saveCompletedAttempt(
      window.localStorage,
      makeAttempt("attempt-1", "2026-07-01T00:00:00.000Z"),
    );
    const before = window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY);

    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    try {
      expect(() =>
        saveAttemptEvaluation(
          window.localStorage,
          "attempt-1",
          makeEvaluation("Confirmed response for q1"),
        ),
      ).toThrow(/quota/i);
    } finally {
      setItemSpy.mockRestore();
    }
    expect(window.localStorage.getItem(INTERVIEW_ATTEMPTS_STORAGE_KEY)).toBe(before);
  });
});
