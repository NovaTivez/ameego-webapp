import { NextResponse } from "next/server";

import { EvaluationError } from "@/lib/evaluation/errors";
import { evaluateInterview } from "@/lib/evaluation/evaluate";
import { parseEvaluationRequest } from "@/lib/evaluation/schema";

const SAFE_ERRORS: Record<EvaluationError["kind"], { status: number; message: string }> =
  {
    configuration: {
      status: 503,
      message: "Interview evaluation is not configured.",
    },
    timeout: { status: 504, message: "Evaluation timed out. Please retry." },
    network: {
      status: 503,
      message: "Evaluation could not reach the AI service. Please retry.",
    },
    provider: {
      status: 502,
      message: "The AI service could not complete the evaluation. Please retry.",
    },
    refusal: {
      status: 422,
      message: "This transcript could not be evaluated. Revise it and retry.",
    },
    invalid_output: {
      status: 502,
      message: "The evaluation response was invalid and was not used. Please retry.",
    },
  };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON.", code: "invalid_request" },
      { status: 400 },
    );
  }

  const evaluationRequest = parseEvaluationRequest(body);
  if (!evaluationRequest) {
    return NextResponse.json(
      {
        error: "A complete, bounded confirmed transcript is required.",
        code: "invalid_request",
      },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await evaluateInterview(evaluationRequest));
  } catch (error) {
    const kind = error instanceof EvaluationError ? error.kind : "provider";
    const safe = SAFE_ERRORS[kind];
    return NextResponse.json(
      { error: safe.message, code: kind },
      { status: safe.status },
    );
  }
}
