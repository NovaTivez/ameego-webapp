import { NextResponse } from "next/server";

import { exceedsBodyLimit, isRateLimited } from "@/lib/api/guards";
import { InterviewAIError } from "@/lib/interview/openai";
import { generatePersonalizedQuestions } from "@/lib/interview/questions";
import { parseConfirmedContext } from "@/lib/interview/validation";

const MAX_BODY_BYTES = 64 * 1024;

const SAFE_ERRORS: Record<InterviewAIError["kind"], { status: number; message: string }> =
  {
    configuration: {
      status: 503,
      message: "Question generation is not configured.",
    },
    timeout: { status: 504, message: "Question generation timed out. Please retry." },
    network: {
      status: 503,
      message: "Question generation could not reach the AI service. Please retry.",
    },
    provider: {
      status: 502,
      message: "The AI service could not generate questions. Please retry.",
    },
    invalid_output: {
      status: 502,
      message: "The generated questions were invalid and were not used. Please retry.",
    },
  };

export async function POST(request: Request) {
  if (isRateLimited(request, "questions")) {
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

  const context = parseConfirmedContext(body);
  if (!context) {
    return NextResponse.json(
      { error: "Confirmed interview context is invalid." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await generatePersonalizedQuestions(context));
  } catch (error) {
    const kind = error instanceof InterviewAIError ? error.kind : "provider";
    const safe = SAFE_ERRORS[kind];
    return NextResponse.json({ error: safe.message }, { status: safe.status });
  }
}
