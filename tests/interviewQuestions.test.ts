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
import {
  normalizeQuestionSetCandidate,
  parseQuestionSet,
} from "@/lib/interview/validation";

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
  it("uses Groq server-side settings and accepts validated structured output", async () => {
    const fetcher = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toContain("api.groq.com");
      const requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(requestBody).toMatchObject({
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
      });
      expect(init?.headers).toMatchObject({ Authorization: "Bearer test-key" });
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify({ questions }) } }],
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

  it("repairs short Llama output by padding to the requested count", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    questions: [
                      {
                        id: "1",
                        category: "Intro",
                        text: "Tell us why this opportunity interests you.",
                      },
                      {
                        category: "resume_project",
                        question: "Describe a challenge you handled with a team.",
                      },
                    ],
                  }),
                },
              },
            ],
          }),
          { status: 200 },
        ),
    );

    const result = await generatePersonalizedQuestions(context, {
      apiKey: "test-key",
      fetcher: fetcher as typeof fetch,
    });

    expect(result.source).toBe("ai");
    expect(result.questions).toHaveLength(3);
    expect(
      result.questions.some((question) => question.category === "resume_project"),
    ).toBe(false);
  });

  it("rejects empty AI output", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: JSON.stringify({ questions: [] }) } }],
          }),
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

  it("normalizes categories and remaps resume questions without a resume", () => {
    const normalized = normalizeQuestionSetCandidate(
      {
        questions: [
          {
            id: "q1",
            category: "Introduction",
            text: "Tell us why this opportunity interests you.",
          },
          {
            id: "q2",
            category: "resume_project",
            text: "Describe a challenge you handled with a team.",
          },
          {
            id: "q3",
            category: "role",
            text: "How would you approach an accessible interface task?",
          },
        ],
      },
      context,
    );
    expect(parseQuestionSet(normalized, context)).toMatchObject({
      questions: [
        expect.objectContaining({ category: "introductory" }),
        expect.objectContaining({ category: "behavioral" }),
        expect.objectContaining({ category: "role_specific" }),
      ],
    });
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
