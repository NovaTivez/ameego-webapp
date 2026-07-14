import { describe, expect, it, vi } from "vitest";

import type { EvaluationRequest, InterviewEvaluation } from "@/lib/evaluation/contracts";
import { EvaluationError } from "@/lib/evaluation/errors";
import { evaluateInterview } from "@/lib/evaluation/evaluate";
import {
  containsUnsupportedEvaluationContent,
  parseEvaluationRequest,
  parseInterviewEvaluation,
} from "@/lib/evaluation/schema";

const request: EvaluationRequest = {
  attemptId: "attempt-1",
  role: "Frontend intern",
  organization: "Northstar Labs",
  exchanges: [
    {
      questionId: "q1",
      question: "Describe a time you solved a difficult team problem.",
      transcript:
        "Our release had an accessibility blocker. I owned the form fix. I paired with QA and updated the labels and error messages. We shipped the fix before release.",
    },
  ],
};

function validEvaluation(
  overrides: Partial<InterviewEvaluation> = {},
): InterviewEvaluation {
  return {
    summary: "The response follows a concise STAR sequence with room for more detail.",
    strengths: ["The learner states a clear responsibility and action."],
    improvements: ["Add a more specific, verifiable result."],
    rubricScores: [
      {
        criterion: "situation",
        score: 4,
        explanation: "The release blocker establishes relevant context and stakes.",
        evidence: "Our release had an accessibility blocker.",
        improvementAction: "Add one detail about why the blocker put release at risk.",
      },
      {
        criterion: "task",
        score: 4,
        explanation: "The learner identifies personal ownership of the form fix.",
        evidence: "I owned the form fix.",
        improvementAction: "Clarify the exact quality target for the fix.",
      },
      {
        criterion: "action",
        score: 5,
        explanation:
          "The response names concrete collaboration and implementation steps.",
        evidence: "I paired with QA and updated the labels and error messages.",
        improvementAction: "Explain why those changes were prioritized first.",
      },
      {
        criterion: "result",
        score: 3,
        explanation: "A timely result is stated, but its impact could be more specific.",
        evidence: "We shipped the fix before release.",
        improvementAction:
          "Add a confirmed outcome such as the test result or user impact.",
      },
    ],
    recommendedLessonId: "interview-foundations.star-method",
    nextPracticeAction:
      "Retry the same answer and make the Result one sentence more specific.",
    improvedExample:
      "Our release had an accessibility blocker. I owned the form fix, paired with QA, and updated the labels and error messages. We shipped the fix before release.",
    ...overrides,
  };
}

function modelResponse(value: unknown): Response {
  return new Response(
    JSON.stringify({
      output: [{ content: [{ type: "output_text", text: JSON.stringify(value) }] }],
    }),
    { status: 200 },
  );
}

describe("interview evaluation pipeline", () => {
  it("uses GPT-5.6 structured output and accepts a grounded valid evaluation", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toMatchObject({ model: "gpt-5.6", store: false });
      expect(body.text).toMatchObject({
        format: { type: "json_schema", strict: true },
      });
      expect(init?.headers).toMatchObject({ Authorization: "Bearer test-key" });
      return modelResponse(validEvaluation());
    });

    await expect(
      evaluateInterview(request, {
        apiKey: "test-key",
        fetcher: fetcher as typeof fetch,
      }),
    ).resolves.toEqual(validEvaluation());
  });

  it("rejects malformed GPT output", async () => {
    const fetcher = vi.fn(async () =>
      modelResponse({ summary: "Missing required fields" }),
    );
    await expect(
      evaluateInterview(request, {
        apiKey: "test-key",
        fetcher: fetcher as typeof fetch,
      }),
    ).rejects.toMatchObject({
      kind: "invalid_output",
    } satisfies Partial<EvaluationError>);
  });

  it("rejects missing or fabricated transcript evidence", () => {
    const candidate = validEvaluation();
    candidate.rubricScores[0].evidence = "The release was delayed by two weeks.";
    expect(parseInterviewEvaluation(candidate, request)).toBeNull();
  });

  it("rejects an unknown lesson ID", () => {
    expect(
      parseInterviewEvaluation(
        validEvaluation({ recommendedLessonId: "invented.lesson" }),
        request,
      ),
    ).toBeNull();
  });

  it("maps provider and network failures to retryable evaluation errors", async () => {
    const providerFailure = vi.fn(
      async () => new Response("unavailable", { status: 500 }),
    );
    await expect(
      evaluateInterview(request, {
        apiKey: "test-key",
        fetcher: providerFailure as typeof fetch,
      }),
    ).rejects.toMatchObject({ kind: "provider" } satisfies Partial<EvaluationError>);

    const networkFailure = vi.fn(async () => {
      throw new TypeError("connection reset");
    });
    await expect(
      evaluateInterview(request, {
        apiKey: "test-key",
        fetcher: networkFailure as typeof fetch,
      }),
    ).rejects.toMatchObject({ kind: "network" } satisfies Partial<EvaluationError>);
  });

  it("rejects empty transcripts before a provider call", () => {
    expect(
      parseEvaluationRequest({
        ...request,
        exchanges: [{ ...request.exchanges[0], transcript: "   " }],
      }),
    ).toBeNull();
  });

  it("rejects unsafe or unsupported evaluation claims", () => {
    const unsafe = validEvaluation({
      summary: "The learner seems nervous and should not be hired.",
    });
    expect(containsUnsupportedEvaluationContent(unsafe)).toBe(true);
    expect(parseInterviewEvaluation(unsafe, request)).toBeNull();
  });

  it("handles model refusal and timeout without trusting output", async () => {
    const refusal = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            output: [{ content: [{ type: "refusal", refusal: "Cannot evaluate." }] }],
          }),
          { status: 200 },
        ),
    );
    await expect(
      evaluateInterview(request, {
        apiKey: "test-key",
        fetcher: refusal as typeof fetch,
      }),
    ).rejects.toMatchObject({ kind: "refusal" } satisfies Partial<EvaluationError>);

    const timeout = vi.fn(async () => {
      throw new DOMException("Aborted", "AbortError");
    });
    await expect(
      evaluateInterview(request, {
        apiKey: "test-key",
        fetcher: timeout as typeof fetch,
      }),
    ).rejects.toMatchObject({ kind: "timeout" } satisfies Partial<EvaluationError>);
  });
});
