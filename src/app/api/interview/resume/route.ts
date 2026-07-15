import { NextResponse } from "next/server";

import { exceedsBodyLimit, isRateLimited } from "@/lib/api/guards";
import { InterviewAIError } from "@/lib/interview/openai";
import { extractResumeProfile, validateResumeInput } from "@/lib/interview/resume";

// 5 MB file becomes ~6.7 MB of base64 plus JSON overhead.
const MAX_BODY_BYTES = 8 * 1024 * 1024;

const SAFE_ERRORS: Record<InterviewAIError["kind"], { status: number; message: string }> =
  {
    configuration: {
      status: 503,
      message: "Resume extraction is not configured.",
    },
    timeout: { status: 504, message: "Resume extraction timed out. Please retry." },
    network: {
      status: 503,
      message: "Resume extraction could not reach the AI service. Please retry.",
    },
    provider: {
      status: 502,
      message: "The AI service could not extract this resume. Please retry.",
    },
    invalid_output: {
      status: 502,
      message: "The extracted resume data was invalid and was not used. Please retry.",
    },
  };

export async function POST(request: Request) {
  if (isRateLimited(request, "resume")) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and retry." },
      { status: 429 },
    );
  }
  if (exceedsBodyLimit(request, MAX_BODY_BYTES)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
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
    const safe = SAFE_ERRORS[kind];
    return NextResponse.json({ error: safe.message }, { status: safe.status });
  }
}
