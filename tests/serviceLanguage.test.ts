import { afterEach, describe, expect, it, vi } from "vitest";

import { POST as generateQuestions } from "@/app/api/interview/questions/route";
import { POST as personalizeResume } from "@/app/api/interview/resume/route";
import { DEFAULT_INTERVIEW_SETUP } from "@/lib/interview/contracts";

const bannedTechnicalCopy = /openai|api.key|gpt|chatgpt|model|stack|rate.limit|json/i;

describe("Ameego service language", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps provider and configuration details out of question-generation failures", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const response = await generateQuestions(
      new Request("http://localhost/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setup: {
            ...DEFAULT_INTERVIEW_SETUP,
            role: "Frontend intern",
            organization: "Northstar Labs",
          },
          resumeProfile: null,
        }),
      }),
    );

    expect(response.status).toBe(503);
    const result = await response.json();
    expect(result).toEqual({
      error:
        "Personalization is temporarily unavailable. You can continue with the standard interview.",
    });
    expect(JSON.stringify(result)).not.toMatch(bannedTechnicalCopy);
  });

  it("keeps provider and configuration details out of resume-personalization failures", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const response = await personalizeResume(
      new Request("http://localhost/api/interview/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "resume.txt",
          mimeType: "text/plain",
          fileData: "data:text/plain;base64,UmVzdW1l",
        }),
      }),
    );

    expect(response.status).toBe(503);
    const result = await response.json();
    expect(result).toEqual({
      error:
        "Resume personalization is temporarily unavailable. Add your details manually or continue without a resume.",
    });
    expect(JSON.stringify(result)).not.toMatch(bannedTechnicalCopy);
  });

  it("uses readable request guidance instead of parser terminology", async () => {
    const response = await generateQuestions(
      new Request("http://localhost/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result.error).toMatch(/interview details could not be read/i);
    expect(JSON.stringify(result)).not.toMatch(bannedTechnicalCopy);
  });
});
