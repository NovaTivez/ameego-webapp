# Decision Log

## 2026-07-15 - Phase 5 implementation authority

**Decision:** Use the user's explicit Phase 5 flow and constraints as the implementation contract.

**Reason:** `PRODUCT_SPEC.md`, `COURSE_SYSTEM.md`, `AI_EVALUATION.md`, `UX_AND_DESIGN.md`, and `ARCHITECTURE.md` contain no requirements, and the prior plan did not define Phase 5. This avoids inventing evaluation scope while preserving the requested simulator foundation.

## 2026-07-15 - OpenAI integration boundary

**Decision:** Call the OpenAI Responses API from server-only modules with platform `fetch`, `OPENAI_MODEL=gpt-5.6` by default, `store: false`, strict JSON Schema output, timeouts, and independent runtime validation.

**Reason:** The project needs no additional SDK dependency for two bounded server operations. The API key never crosses the server boundary, and provider output is treated as untrusted even when schema-constrained.

## 2026-07-15 - Resume handling and retention

**Decision:** Accept PDF, DOC, DOCX, RTF, TXT, MD, and Markdown files up to 5 MB; send raw bytes only for extraction; let learners confirm/edit extracted facts; never persist the raw file by default.

**Reason:** These formats cover practical resumes without introducing a local document-parser dependency. The conservative application limit bounds memory and request size. Manual entry and a complete no-resume flow prevent extraction from becoming a blocker.

## 2026-07-15 - Attempt persistence

**Decision:** Store only validated completed attempts in versioned browser-local storage, capped at 20 records.

**Reason:** This reuses the existing data strategy and avoids database scope. It is sufficient for the hackathon but remains device-specific and carries shared-browser privacy risk.

## 2026-07-15 - Microphone support

**Decision:** Treat browser speech recognition as progressive enhancement and keep text entry available at all times. Require transcript review and explicit confirmation before progression.

**Reason:** Browser support and permission behavior vary, and speech-to-text is not evidence for confidence, nervousness, eye contact, or response quality.

## 2026-07-15 - AI failure behavior

**Decision:** Preserve confirmed context after a generation failure and offer Retry plus an explicitly labeled deterministic general-question fallback.

**Reason:** The learner can still practice when the provider is unavailable without presenting fallback content as personalized AI output. Scoring and feedback remain deferred to the separate evaluation phase.

## 2026-07-15 - Evaluation rubric authority

**Decision:** Implement the four-part Situation, Task, Action, and Result rubric documented in Phase 2 of `PLANS.md`, with integer scores from 1 to 5.

**Reason:** `AI_EVALUATION.md` is empty, while the existing approved plan explicitly defines STAR criteria, evidence verification, deterministic lesson recommendation, and failure behavior. No additional personality, delivery, or hiring criteria were invented.

## 2026-07-15 - Evidence and recommendation trust boundary

**Decision:** Treat strict model output as untrusted until application code verifies exactly four unique criteria, exact transcript-substring evidence for each criterion, safe content, score bounds, and an allowlisted deterministic lesson recommendation.

**Reason:** JSON Schema constrains shape but cannot prove a quotation came from the transcript or that a recommendation references a real product lesson. These checks must remain deterministic and testable outside the model.

## 2026-07-15 - Evaluation retention boundary

**Decision:** Keep the completed interview attempt on evaluation failure, but do not persist successful evaluation output in Phase 2.

**Reason:** This phase establishes the secure evaluation pipeline and retryable UI. Versioned evaluated-attempt storage and first/latest comparison are explicitly Phase 3 scope and require a separate storage migration decision.

## 2026-07-15 - Phase 3 evaluated-attempt retention

**Decision:** Persist successful STAR evaluations onto the existing versioned interview-attempt store as optional `evaluation` and `evaluatedAt` fields, then derive Progress Library history, open-attempt review, and scenario-scoped comparison from those records.

**Reason:** Prompt 10 requires attempt reopen, rubric comparison, and progress indicators grounded in real stored activity. Reusing `ameego:interview-attempts:v1` avoids a parallel store while keeping unevaluated transcripts readable and failed evaluations unpersisted.

## 2026-07-15 - Learner-facing evaluation scope

**Decision:** Present the result as evidence-based communication practice with an application-owned disclaimer, never as an official grade or hiring decision.

**Reason:** The evaluator analyzes only confirmed text. Emotion, honesty, intelligence, employability, accent, confidence, nervousness, and eye contact are unsupported and are excluded from both prompt and runtime-accepted output.

## 2026-07-15 - Audit: corrupt attempt records degrade instead of blocking

**Decision:** `readInterviewAttempts` now drops individual invalid stored attempts instead of throwing for the whole store, raw `JSON.parse` failures rethrow as the typed "unsupported format" message, and the Progress Library error state gained a "Reset stored progress" recovery action.

**Reason:** The release audit found that one stale-format record permanently hid every attempt and blocked saving new ones, with a Retry button that could never succeed. Graceful per-record degradation plus an explicit reset keeps the demo recoverable without DevTools.

## 2026-07-15 - Audit: uniform safe API error surface and request guards

**Decision:** The questions and resume routes now use the same fixed kind-to-message error map as the evaluate route, and all three OpenAI-backed routes reject oversized bodies (413) and apply a generous in-memory per-IP rate limit (429). Baseline security headers (nosniff, referrer policy, frame denial) were added in `next.config.ts`; a strict CSP was deliberately deferred.

**Reason:** The two older routes echoed internal error strings (upstream status codes, env-var names) and buffered unbounded bodies before validation. The evaluate route's safe-map pattern was already proven; making it uniform removes the inconsistency that invites future leaks. A single-instance in-memory limiter matches the local demo deployment target.

## 2026-07-15 - Audit: minimum evidence excerpt length

**Decision:** Evaluation evidence excerpts must now be at least 15 characters instead of 1.

**Reason:** A one-character "excerpt" is a substring of nearly any transcript, which made the evidence-grounding guarantee semantically hollow. Fifteen characters is well below typical model quotations, so the only behavior change is rejecting degenerate output.

## 2026-07-15 - Submission docs: no fabricated claims

**Decision:** Submission README, demo script, and checklist must cite only workflow-backed Codex work and decision-log human choices; leave license, category, repo URL, video, and `/feedback` session ID as explicit human checklist items.

**Reason:** Hackathon judging expects honesty. Inventing a license, session ID, or Codex achievement would misrepresent the project.
