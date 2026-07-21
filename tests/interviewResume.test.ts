import { describe, expect, it, vi } from "vitest";

import {
  extractResumeProfile,
  groundResumeProfile,
  validateResumeInput,
} from "@/lib/interview/resume";

describe("resume extraction boundary", () => {
  it("accepts a supported small file and rejects unsupported formats", () => {
    const supported = {
      filename: "resume.pdf",
      mimeType: "application/pdf",
      fileData: "data:application/pdf;base64,cmVzdW1l",
    };

    expect(validateResumeInput(supported)).toEqual(supported);
    expect(validateResumeInput({ ...supported, filename: "resume.exe" })).toBeNull();
  });

  it("sends extracted PDF text instead of binary data and validates the profile", async () => {
    const profile = {
      education: ["BS Computer Science"],
      experience: [],
      projects: ["Accessibility audit project"],
      skills: ["TypeScript"],
      leadership: [],
      achievements: [],
    };
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        messages: Array<{ role: string; content: string }>;
      };
      expect(body.messages.at(-1)?.content).toContain("BS Computer Science");
      expect(JSON.stringify(body)).not.toContain("data:application/pdf");
      return new Response(
        JSON.stringify({ choices: [{ message: { content: JSON.stringify(profile) } }] }),
        { status: 200 },
      );
    });

    await expect(
      extractResumeProfile(
        {
          filename: "resume.pdf",
          mimeType: "application/pdf",
          fileData: "data:application/pdf;base64,cmVzdW1l",
        },
        {
          apiKey: "test-key",
          fetcher: fetcher as typeof fetch,
          pdfTextExtractor: async () =>
            "BS Computer Science\nAccessibility audit project\nTypeScript",
        },
      ),
    ).resolves.toEqual(profile);
  });

  it("removes extracted details that are not grounded in the PDF text", () => {
    expect(
      groundResumeProfile(
        {
          education: ["BS Computer Science"],
          experience: ["Invented employer"],
          projects: [],
          skills: ["TypeScript"],
          leadership: [],
          achievements: ["AWS Certified"],
        },
        "BS Computer Science\nSkills: TypeScript",
      ),
    ).toEqual({
      education: ["BS Computer Science"],
      experience: [],
      projects: [],
      skills: ["TypeScript"],
      leadership: [],
      achievements: [],
    });
  });
});
