import { NextResponse } from "next/server";

import { InterviewAIError } from "@/lib/interview/openai";
import { extractResumeProfile, validateResumeInput } from "@/lib/interview/resume";

export async function POST(request: Request) {
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
    const status =
      error instanceof InterviewAIError && error.kind === "configuration" ? 503 : 502;
    return NextResponse.json(
      {
        error:
          error instanceof InterviewAIError ? error.message : "Resume extraction failed.",
      },
      { status },
    );
  }
}
