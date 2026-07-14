import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_INTERVIEW_SETUP,
  type ConfirmedInterviewContext,
} from "@/lib/interview/contracts";
import { InterviewAIError } from "@/lib/interview/openai";
import {
  createGeneralQuestionFallback,
  generatePersonalizedQuestions,
} from "@/lib/interview/questions";

const context: ConfirmedInterviewContext = {
  setup: {
    ...DEFAULT_INTERVIEW_SETUP,
    role: "Frontend intern",
    organization: "Northstar Labs",
    description: "Build accessible interfaces",
    questionCount: 3,
  },
  resumeProfile: null,
};

const questions = [
  {
    id: "q1",
    category: "introductory",
    text: "Tell us why this opportunity interests you.",
  },
  {
    id: "q2",
    category: "behavioral",
    text: "Describe a challenge you handled with a team.",
  },
  {
    id: "q3",
    category: "role_specific",
    text: "How would you approach an accessible interface task?",
  },
];

describe("personalized question generation", () => {
  it("uses GPT-5.6 server-side settings and accepts validated structured output", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(requestBody).toMatchObject({ model: "gpt-5.6", store: false });
      expect(init?.headers).toMatchObject({ Authorization: "Bearer test-key" });
      return new Response(
        JSON.stringify({
          output: [
            { content: [{ type: "output_text", text: JSON.stringify({ questions }) }] },
          ],
        }),
        { status: 200 },
      );
    });

    const result = await generatePersonalizedQuestions(context, {
      apiKey: "test-key",
      fetcher: fetcher as typeof fetch,
    });

    expect(result).toEqual({ source: "ai", questions });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("rejects invalid AI output", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ output_text: JSON.stringify({ questions: [questions[0]] }) }),
          { status: 200 },
        ),
    );

    await expect(
      generatePersonalizedQuestions(context, {
        apiKey: "test-key",
        fetcher: fetcher as typeof fetch,
      }),
    ).rejects.toMatchObject({
      kind: "invalid_output",
    } satisfies Partial<InterviewAIError>);
  });

  it("creates a clearly sourced no-resume fallback with the requested length", () => {
    const result = createGeneralQuestionFallback(context);

    expect(result.source).toBe("general_fallback");
    expect(result.questions).toHaveLength(3);
    expect(
      result.questions.some((question) => question.category === "resume_project"),
    ).toBe(false);
  });
});
