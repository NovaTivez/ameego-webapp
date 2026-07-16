import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/interview/evaluate/route";

describe("interview evaluation route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 400 for an empty confirmed transcript without contacting the feedback service", async () => {
    const response = await POST(
      new Request("http://localhost/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: "attempt-1",
          role: "Frontend intern",
          organization: "Northstar Labs",
          exchanges: [
            {
              questionId: "q1",
              question: "Describe a time you solved a difficult team problem.",
              transcript: "",
            },
          ],
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "invalid_request",
    });
  });

  it("returns branded safe copy when intelligent feedback is unavailable", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    const response = await POST(
      new Request("http://localhost/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: "attempt-1",
          role: "Frontend intern",
          organization: "Northstar Labs",
          exchanges: [
            {
              questionId: "q1",
              question: "Describe a time you solved a difficult team problem.",
              transcript:
                "I clarified the task, coordinated the work, and documented the result for the team.",
            },
          ],
        }),
      }),
    );

    expect(response.status).toBe(503);
    const result = await response.json();
    expect(result).toEqual({
      error:
        "Intelligent feedback is temporarily unavailable. Your completed attempt is safe. Please try again shortly.",
      code: "service_unavailable",
    });
    expect(JSON.stringify(result)).not.toMatch(
      /openai|api.key|gpt|model|stack|rate.limit/i,
    );
  });
});
