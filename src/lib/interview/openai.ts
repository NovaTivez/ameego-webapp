const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 30_000;
export const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

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

type JsonSchemaFormat = {
  type?: string;
  name?: string;
  strict?: boolean;
  schema?: unknown;
};

type StructuredRequestBody = {
  instructions?: unknown;
  input?: unknown;
  /** Ignored legacy OpenAI Responses field kept for call-site compatibility. */
  reasoning?: unknown;
  text?: {
    format?: JsonSchemaFormat;
  };
};

/**
 * OpenAI Responses-shaped payloads are accepted by callers, then translated to
 * Groq chat completions. Kept for a stable internal call signature.
 */
export type StructuredResponseRequest = StructuredRequestBody;

export function extractResponseRefusal(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const response = value as {
    choices?: Array<{ message?: { refusal?: unknown; content?: unknown } }>;
  };
  const refusal = response.choices?.[0]?.message?.refusal;
  return typeof refusal === "string" && refusal.trim() ? refusal.trim() : null;
}

export function extractResponseText(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const response = value as {
    output_text?: unknown;
    output?: unknown;
    choices?: Array<{ message?: { content?: unknown } }>;
  };

  // Groq / OpenAI chat completions
  const chatContent = response.choices?.[0]?.message?.content;
  if (typeof chatContent === "string" && chatContent.trim()) {
    return chatContent.trim();
  }

  // Legacy OpenAI Responses API shapes (tests / older mocks)
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }
  if (!Array.isArray(response.output)) return null;

  const text = (
    response.output as Array<{ content?: Array<{ type?: string; text?: string }> }>
  )
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .filter((item) => item.type === "output_text" && typeof item.text === "string")
    .map((item) => item.text)
    .join("");

  return text.trim() ? text : null;
}

function schemaFromBody(body: StructuredRequestBody): {
  name: string;
  schema: unknown;
} | null {
  const format = body.text?.format;
  if (!format || format.type !== "json_schema" || !format.schema) return null;
  return {
    name:
      typeof format.name === "string" && format.name.trim() ? format.name : "response",
    schema: format.schema,
  };
}

function inputToUserText(input: unknown): string {
  if (typeof input === "string") return input;
  if (input === null || input === undefined) return "";

  if (Array.isArray(input)) {
    const chunks: string[] = [];
    for (const item of input) {
      if (!item || typeof item !== "object") continue;
      const content = (item as { content?: unknown }).content;
      if (typeof content === "string") {
        chunks.push(content);
        continue;
      }
      if (!Array.isArray(content)) continue;
      for (const part of content) {
        if (!part || typeof part !== "object") continue;
        const typed = part as {
          type?: string;
          text?: string;
          filename?: string;
          file_data?: string;
        };
        if (typed.type === "input_text" && typeof typed.text === "string") {
          chunks.push(typed.text);
          continue;
        }
        if (typed.type === "input_file" && typeof typed.file_data === "string") {
          const filename = typeof typed.filename === "string" ? typed.filename : "resume";
          const decoded = decodeDataUrlText(typed.file_data, filename);
          chunks.push(
            decoded
              ? `Resume filename: ${filename}\nResume text:\n${decoded}`
              : `Resume filename: ${filename}\nThe resume is a binary upload and cannot be read as plain text. Return empty arrays for every field.`,
          );
        }
      }
    }
    return chunks.join("\n\n");
  }

  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}

function decodeDataUrlText(fileData: string, filename: string): string | null {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  const textExtensions = new Set(["txt", "md", "markdown", "rtf"]);
  if (!textExtensions.has(extension)) return null;

  const base64 = fileData.includes(",") ? (fileData.split(",").pop() ?? "") : fileData;
  if (!base64) return null;
  try {
    const text = Buffer.from(base64, "base64").toString("utf8").trim();
    return text.length > 0 ? text.slice(0, 100_000) : null;
  } catch {
    return null;
  }
}

function buildChatMessages(body: StructuredRequestBody): Array<{
  role: "system" | "user";
  content: string;
}> {
  const schema = schemaFromBody(body);
  const instructions =
    typeof body.instructions === "string" && body.instructions.trim()
      ? body.instructions.trim()
      : "Return a valid JSON object that matches the required schema.";

  const systemParts = [
    instructions,
    "Respond with JSON only. Do not wrap the JSON in markdown fences.",
  ];
  if (schema) {
    systemParts.push(
      `JSON schema name: ${schema.name}`,
      `JSON schema:\n${JSON.stringify(schema.schema)}`,
    );
  }

  return [
    { role: "system", content: systemParts.join("\n\n") },
    {
      role: "user",
      content: inputToUserText(body.input) || "Produce the JSON response.",
    },
  ];
}

export async function requestStructuredResponse(
  body: StructuredResponseRequest,
  options: {
    apiKey?: string;
    model?: string;
    fetcher?: typeof fetch;
  } = {},
): Promise<unknown> {
  const apiKey = (options.apiKey ?? process.env.GROQ_API_KEY)?.trim();
  if (!apiKey) {
    throw new InterviewAIError("configuration", "GROQ_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const model = (options.model ?? process.env.GROQ_MODEL)?.trim() || DEFAULT_GROQ_MODEL;

  try {
    const response = await (options.fetcher ?? fetch)(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: buildChatMessages(body),
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new InterviewAIError("provider", `Groq returned status ${response.status}.`);
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
