import { NextResponse } from "next/server";

import { exceedsBodyLimit, isRateLimited } from "@/lib/api/guards";
import { EvaluationError } from "@/lib/evaluation/errors";
import { evaluateInterview } from "@/lib/evaluation/evaluate";
import { parseEvaluationRequest } from "@/lib/evaluation/schema";
import {
  FEEDBACK_INVALID_MESSAGE,
  FEEDBACK_REFUSED_MESSAGE,
  FEEDBACK_UNAVAILABLE_MESSAGE,
} from "@/lib/interview/product-messages";

const SAFE_ERRORS: Record<
  EvaluationError["kind"],
  { status: number; message: string; code: string }
> = {
  configuration: {
    status: 503,
    message: FEEDBACK_UNAVAILABLE_MESSAGE,
    code: "service_unavailable",
  },
  timeout: {
    status: 504,
    message: FEEDBACK_UNAVAILABLE_MESSAGE,
    code: "service_unavailable",
  },
  network: {
    status: 503,
    message: FEEDBACK_UNAVAILABLE_MESSAGE,
    code: "service_unavailable",
  },
  provider: {
    status: 502,
    message: FEEDBACK_UNAVAILABLE_MESSAGE,
    code: "service_unavailable",
  },
  refusal: {
    status: 422,
    message: FEEDBACK_REFUSED_MESSAGE,
    code: "feedback_unavailable",
  },
  invalid_output: {
    status: 502,
    message: FEEDBACK_INVALID_MESSAGE,
    code: "invalid_result",
  },
};

const MAX_BODY_BYTES = 256 * 1024;

export async function POST(request: Request) {
  if (isRateLimited(request, "evaluate")) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait a moment and retry.",
        code: "rate_limited",
      },
      { status: 429 },
    );
  }
  if (exceedsBodyLimit(request, MAX_BODY_BYTES)) {
    return NextResponse.json(
      { error: "Request body is too large.", code: "invalid_request" },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "The feedback request could not be read. Your saved attempt was not changed.",
        code: "invalid_request",
      },
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
      { error: safe.message, code: safe.code },
      { status: safe.status },
    );
  }
}
