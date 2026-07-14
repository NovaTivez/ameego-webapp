import { describe, expect, it, vi } from "vitest";

import { extractResumeProfile, validateResumeInput } from "@/lib/interview/resume";

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

  it("extracts only validated structured profile data with response storage off", async () => {
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
        store: boolean;
        input: Array<{ content: Array<Record<string, unknown>> }>;
      };
      expect(body.store).toBe(false);
      expect(body.input[0].content[0]).toMatchObject({
        type: "input_file",
        filename: "resume.pdf",
      });
      return new Response(JSON.stringify({ output_text: JSON.stringify(profile) }), {
        status: 200,
      });
    });

    await expect(
      extractResumeProfile(
        {
          filename: "resume.pdf",
          mimeType: "application/pdf",
          fileData: "data:application/pdf;base64,cmVzdW1l",
        },
        { apiKey: "test-key", fetcher: fetcher as typeof fetch },
      ),
    ).resolves.toEqual(profile);
  });
});
