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

  it("uses the Groq chat contract without uploading raw resume bytes", async () => {
    const profile = {
      education: ["BS Computer Science"],
      experience: [],
      projects: ["Accessibility audit project"],
      skills: ["TypeScript"],
      leadership: [],
      achievements: [],
    };
    const resume = {
      filename: "resume.pdf",
      mimeType: "application/pdf",
      fileData: "data:application/pdf;base64,cmVzdW1l",
    };
    const fetcher = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        model: string;
        messages: Array<{ role: string; content: string }>;
        response_format: { type: string };
      };
      expect(String(url)).toContain("api.groq.com/openai/v1/chat/completions");
      expect(init?.headers).toMatchObject({ Authorization: "Bearer test-key" });
      expect(body).toMatchObject({
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
      });
      expect(body.messages).toHaveLength(2);
      expect(body.messages[1]).toMatchObject({
        role: "user",
        content: expect.stringContaining("Resume filename: resume.pdf"),
      });
      expect(body.messages[1].content).toContain(
        "The resume is a binary upload and cannot be read as plain text.",
      );
      expect(JSON.stringify(body)).not.toContain(resume.fileData);
      expect(JSON.stringify(body)).not.toContain("input_file");
      return new Response(
        JSON.stringify({ choices: [{ message: { content: JSON.stringify(profile) } }] }),
        {
          status: 200,
        },
      );
    });

    await expect(
      extractResumeProfile(resume, {
        apiKey: "test-key",
        fetcher: fetcher as typeof fetch,
      }),
    ).resolves.toEqual(profile);
  });
});
