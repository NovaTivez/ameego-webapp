const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

const requestLog = new Map<string, number[]>();

function clientKey(request: Request, route: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const client = forwarded?.split(",")[0]?.trim() || "local";
  return `${route}:${client}`;
}

/**
 * Generous in-memory rate limit for the Groq-backed routes. Single-instance
 * only, which matches the local/demo deployment target.
 */
export function isRateLimited(request: Request, route: string): boolean {
  const key = clientKey(request, route);
  const now = Date.now();
  const recent = (requestLog.get(key) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(key, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(key, recent);
  return false;
}

/**
 * Rejects clearly oversized request bodies before they are buffered and
 * parsed. Content-Length can be absent, so this is a cheap first gate rather
 * than a guarantee; the domain validators enforce the real bounds afterwards.
 */
export function exceedsBodyLimit(request: Request, maxBytes: number): boolean {
  const contentLength = Number(request.headers.get("content-length"));
  return Number.isFinite(contentLength) && contentLength > maxBytes;
}
