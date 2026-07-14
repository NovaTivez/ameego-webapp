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

## 2026-07-15 - Learner-facing evaluation scope

**Decision:** Present the result as evidence-based communication practice with an application-owned disclaimer, never as an official grade or hiring decision.

**Reason:** The evaluator analyzes only confirmed text. Emotion, honesty, intelligence, employability, accent, confidence, nervousness, and eye contact are unsupported and are excluded from both prompt and runtime-accepted output.
