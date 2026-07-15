const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const REQUEST_TIMEOUT_MS = 30_000;

export class InterviewAIError extends Error {
  constructor(
    public readonly kind:
      "configuration" | "provider" | "network" | "invalid_output" | "timeout",
    message: string,
  ) {
    super(message);
    this.name = "InterviewAIError";
  }
}

type RefusalContent = { type?: string; refusal?: string };

export function extractResponseRefusal(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const response = value as { output?: unknown };
  if (!Array.isArray(response.output)) return null;
  for (const output of response.output as Array<{ content?: RefusalContent[] }>) {
    if (!Array.isArray(output.content)) continue;
    const refusal = output.content.find(
      (item) => item.type === "refusal" && typeof item.refusal === "string",
    )?.refusal;
    if (refusal?.trim()) return refusal;
  }
  return null;
}

type ResponseContent = { type?: string; text?: string };
type ResponseOutput = { content?: ResponseContent[] };

export function extractResponseText(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const response = value as { output_text?: unknown; output?: unknown };
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }
  if (!Array.isArray(response.output)) return null;

  const text = (response.output as ResponseOutput[])
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .filter((item) => item.type === "output_text" && typeof item.text === "string")
    .map((item) => item.text)
    .join("");

  return text.trim() ? text : null;
}

export async function requestStructuredResponse(
  body: Record<string, unknown>,
  options: {
    apiKey?: string;
    model?: string;
    fetcher?: typeof fetch;
  } = {},
): Promise<unknown> {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new InterviewAIError("configuration", "OPENAI_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await (options.fetcher ?? fetch)(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        model: options.model ?? process.env.OPENAI_MODEL ?? "gpt-5.6",
        store: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new InterviewAIError(
        "provider",
        `OpenAI returned status ${response.status}.`,
      );
    }

    return (await response.json()) as unknown;
  } catch (error) {
    if (error instanceof InterviewAIError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new InterviewAIError("timeout", "The AI request timed out.");
    }
    throw new InterviewAIError("network", "The AI request failed.");
  } finally {
    clearTimeout(timeout);
  }
}
