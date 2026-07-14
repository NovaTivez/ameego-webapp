import { NextResponse } from "next/server";

import { InterviewAIError } from "@/lib/interview/openai";
import { generatePersonalizedQuestions } from "@/lib/interview/questions";
import { parseConfirmedContext } from "@/lib/interview/validation";

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
    const status =
      error instanceof InterviewAIError && error.kind === "configuration" ? 503 : 502;
    return NextResponse.json(
      {
        error:
          error instanceof InterviewAIError
            ? error.message
            : "Question generation failed.",
      },
      { status },
    );
  }
}
