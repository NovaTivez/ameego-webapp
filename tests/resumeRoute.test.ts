import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/interview/resume/route";

const validInput = {
  filename: "resume.txt",
  mimeType: "text/plain",
  fileData: `data:text/plain;base64,${Buffer.from("Experience: shipped a project.").toString("base64")}`,
};

function makeRequest(body: string, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/interview/resume", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body,
  });
}

describe("resume extraction route", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(makeRequest("{not json"));
    expect(response.status).toBe(400);
  });

  it("returns 400 for an unsupported resume payload", async () => {
    const response = await POST(makeRequest(JSON.stringify({})));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/supported resume file/i),
    });
  });

  it("returns 413 for oversized request bodies without parsing them", async () => {
    const response = await POST(
      makeRequest(JSON.stringify(validInput), {
        "Content-Length": String(20 * 1024 * 1024),
      }),
    );
    expect(response.status).toBe(413);
  });

  it("returns a safe 503 when the AI provider is not configured", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const response = await POST(makeRequest(JSON.stringify(validInput)));
    expect(response.status).toBe(503);
    const body = (await response.json()) as { error: string };
    expect(body.error).not.toMatch(/OPENAI_API_KEY/);
  });
});
