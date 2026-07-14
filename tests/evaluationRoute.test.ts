import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/interview/evaluate/route";

describe("interview evaluation route", () => {
  it("returns 400 for an empty confirmed transcript without contacting OpenAI", async () => {
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
});
