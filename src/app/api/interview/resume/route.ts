import { NextResponse } from "next/server";

import { exceedsBodyLimit, isRateLimited } from "@/lib/api/guards";
import { InterviewAIError } from "@/lib/interview/openai";
import { RESUME_PERSONALIZATION_UNAVAILABLE_MESSAGE } from "@/lib/interview/product-messages";
import { extractResumeProfile, validateResumeInput } from "@/lib/interview/resume";

// 5 MB file becomes ~6.7 MB of base64 plus JSON overhead.
const MAX_BODY_BYTES = 8 * 1024 * 1024;

const ERROR_STATUS: Record<InterviewAIError["kind"], number> = {
  configuration: 503,
  timeout: 504,
  network: 503,
  provider: 502,
  invalid_output: 502,
};

export async function POST(request: Request) {
  if (isRateLimited(request, "resume")) {
    return NextResponse.json(
      { error: RESUME_PERSONALIZATION_UNAVAILABLE_MESSAGE },
      { status: 429 },
    );
  }
  if (exceedsBodyLimit(request, MAX_BODY_BYTES)) {
    return NextResponse.json(
      { error: "This resume is too large. Choose a file no larger than 5 MB." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Resume details could not be read. Choose a file or use manual text." },
      { status: 400 },
    );
  }

  const input = validateResumeInput(body);
  if (!input) {
    return NextResponse.json(
      { error: "Use a supported resume file no larger than 5 MB." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json({ profile: await extractResumeProfile(input) });
  } catch (error) {
    const kind = error instanceof InterviewAIError ? error.kind : "provider";
    if (process.env.NODE_ENV !== "production") {
      console.error("[resume]", kind, error instanceof Error ? error.message : error);
    }
    return NextResponse.json(
      { error: RESUME_PERSONALIZATION_UNAVAILABLE_MESSAGE },
      { status: ERROR_STATUS[kind] },
    );
  }
}
