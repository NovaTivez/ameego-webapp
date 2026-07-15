import { NextResponse } from "next/server";

import { exceedsBodyLimit, isRateLimited } from "@/lib/api/guards";
import { InterviewAIError } from "@/lib/interview/openai";
import { PERSONALIZATION_UNAVAILABLE_MESSAGE } from "@/lib/interview/product-messages";
import { generatePersonalizedQuestions } from "@/lib/interview/questions";
import { parseConfirmedContext } from "@/lib/interview/validation";

const MAX_BODY_BYTES = 64 * 1024;

const ERROR_STATUS: Record<InterviewAIError["kind"], number> = {
  configuration: 503,
  timeout: 504,
  network: 503,
  provider: 502,
  invalid_output: 502,
};

export async function POST(request: Request) {
  if (isRateLimited(request, "questions")) {
    return NextResponse.json(
      { error: PERSONALIZATION_UNAVAILABLE_MESSAGE },
      { status: 429 },
    );
  }
  if (exceedsBodyLimit(request, MAX_BODY_BYTES)) {
    return NextResponse.json(
      { error: "Interview details are too large. Shorten them and try again." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Interview details could not be read. Review your setup and try again." },
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
    return NextResponse.json(
      { error: PERSONALIZATION_UNAVAILABLE_MESSAGE },
      { status: ERROR_STATUS[kind] },
    );
  }
}
