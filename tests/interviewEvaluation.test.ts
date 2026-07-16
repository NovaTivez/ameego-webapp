import { describe, expect, it, vi } from "vitest";

import type { EvaluationRequest, InterviewEvaluation } from "@/lib/evaluation/contracts";
import { EvaluationError } from "@/lib/evaluation/errors";
import { evaluateInterview } from "@/lib/evaluation/evaluate";
import {
  containsUnsupportedEvaluationContent,
  groundEvidenceInTranscript,
  normalizeEvaluationCandidate,
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
      choices: [{ message: { content: JSON.stringify(value) } }],
    }),
    { status: 200 },
  );
}

describe("interview evaluation pipeline", () => {
  it("uses Groq Llama structured JSON and accepts a grounded valid evaluation", async () => {
    const fetcher = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toContain("api.groq.com");
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toMatchObject({
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
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

  it("rejects malformed model output", async () => {
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

  it("grounds paraphrased evidence back to the transcript", () => {
    const grounded = groundEvidenceInTranscript(
      request.exchanges,
      "our release had an accessibility blocker",
    );
    expect(grounded).toBeTruthy();
    expect(request.exchanges[0].transcript.includes(grounded!)).toBe(true);
  });

  it("evaluates very short joke transcripts instead of returning 502", () => {
    const shortRequest: EvaluationRequest = {
      ...request,
      exchanges: [{ ...request.exchanges[0], transcript: "yea lol" }],
    };
    const incomplete = {
      summary: "x",
      strengths: [],
      improvements: ["ok"],
      rubricScores: [
        {
          criterion: "situation",
          score: 1,
          explanation: "No situation context is present.",
          evidence: "yea",
          improvementAction: "None",
        },
        {
          criterion: "task",
          score: 1,
          explanation: "No personal task is stated.",
          evidence: "lol",
          improvementAction: "None",
        },
        {
          criterion: "action",
          score: 1,
          explanation: "No concrete action is described.",
          evidence: "yea",
          improvementAction: "None",
        },
        {
          criterion: "result",
          score: 1,
          explanation: "No result is described.",
          evidence: "",
          improvementAction: "None",
        },
      ],
    };
    const normalized = normalizeEvaluationCandidate(incomplete, shortRequest);
    expect(parseInterviewEvaluation(normalized, shortRequest)).toMatchObject({
      recommendedLessonId: "interview-foundations.star-method",
      rubricScores: expect.arrayContaining([
        expect.objectContaining({
          evidence: expect.stringMatching(/yea|lol/),
        }),
      ]),
    });
  });

  it("fills safe defaults when Llama omits lesson/retry fields", () => {
    const incomplete = {
      summary: "The response follows a concise STAR sequence with room for more detail.",
      strengths: ["The learner states a clear responsibility and action."],
      improvements: ["Add a more specific, verifiable result."],
      rubricScores: validEvaluation().rubricScores.map((score) => ({
        ...score,
        improvementAction: "None",
      })),
    };
    const normalized = normalizeEvaluationCandidate(incomplete, request);
    expect(parseInterviewEvaluation(normalized, request)).toMatchObject({
      recommendedLessonId: "interview-foundations.star-method",
      nextPracticeAction: expect.stringMatching(/.{10,}/),
      improvedExample: expect.stringContaining("accessibility blocker"),
      rubricScores: expect.arrayContaining([
        expect.objectContaining({
          improvementAction: expect.stringMatching(/.{10,}/),
        }),
      ]),
    });
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
            choices: [{ message: { refusal: "Cannot evaluate.", content: null } }],
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
