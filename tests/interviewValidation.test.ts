import { describe, expect, it } from "vitest";

import { DEFAULT_INTERVIEW_SETUP, type InterviewSetup } from "@/lib/interview/contracts";
import {
  parseConfirmedContext,
  validateInterviewSetup,
  validateTranscript,
} from "@/lib/interview/validation";

describe("interview setup validation", () => {
  it("requires a role and organization", () => {
    const result = validateInterviewSetup(DEFAULT_INTERVIEW_SETUP);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.role).toMatch(/enter a role/i);
      expect(result.errors.organization).toMatch(/organization/i);
    }
  });

  it("accepts every required setup choice and trims confirmed text", () => {
    const setup: InterviewSetup = {
      ...DEFAULT_INTERVIEW_SETUP,
      interviewType: "scholarship",
      role: "  Scholarship candidate  ",
      organization: "  Ameego Foundation  ",
      difficulty: "Intermediate",
      questionCount: 5,
    };
    const result = validateInterviewSetup(setup);

    expect(result).toMatchObject({
      success: true,
      data: { role: "Scholarship candidate", questionCount: 5 },
    });
  });

  it("rejects malformed server input without throwing", () => {
    expect(parseConfirmedContext({ setup: { role: "missing fields" } })).toBeNull();
  });

  it("requires a non-empty bounded transcript", () => {
    expect(validateTranscript(" ")).toMatch(/enter or record/i);
    expect(validateTranscript("A grounded answer.")).toBeNull();
  });
});
