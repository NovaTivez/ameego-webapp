# Ameego

**One-sentence pitch:** Ameego is a pixel-art Pixel Communication Academy where learners study STAR storytelling, practice in an interview simulator, and get evidence-based AI feedback grounded only in their confirmed transcript.

## Problem statement

Students and early-career candidates often practice interviews without a structured learning loop. Generic tips, one-off mock interviews, or opaque AI scores do not teach how to structure a behavioral answer, how to improve a weak STAR part, or how to retry with evidence. Delivery theater (confidence, eye contact, “nervousness”) also gets confused with communication practice.

## Target audience

- Students and early-career learners preparing for job, internship, volunteer, scholarship, or leadership interviews
- Hackathon judges and educators who need a reproducible local demo of an honest educational AI loop

## Solution overview

Ameego presents a single campus hub—the **Pixel Communication Academy**—and walks the learner through one complete loop:

**Academy → STAR lesson → interactive STAR exercise → interview simulation → AI STAR feedback → recommended lesson → retry → Progress Library comparison**

Progress is stored only in the browser. AI calls stay on the server. Feedback is communication practice with transcript evidence, not a hiring decision.

## Key features

- Pixel Communication Academy map with Interview Center, Progress Library, and an honest locked Speech Hall
- Interview Foundations course and a full STAR Method lesson with local completion tracking
- Interactive STAR arrangement exercise (drag or keyboard Move up/down)
- Interview Center: setup, optional resume extraction, personalized or labeled general questions, text or microphone answers, transcript confirmation, local attempt save
- Groq Llama STAR evaluation with per-criterion scores, explanations, transcript evidence, and a recommended lesson link
- Progress Library: completed lessons/exercises/simulations, open prior attempts, scenario-scoped attempt comparison that refuses broad improvement claims from one isolated score

## How the educational loop works

1. Discover the Academy and enter Learning or the Interview Center.
2. Study the STAR Method lesson and mark it complete.
3. Reorder a shuffled STAR answer in the arrangement exercise and check the order.
4. Run a practice interview with confirmed role context (resume optional).
5. Request AI STAR feedback on the confirmed transcript only.
6. Follow the recommended lesson (currently the STAR Method lesson) and retry the same scenario.
7. In the Progress Library, compare two evaluated attempts from that same scenario and see specific rubric changes plus remaining practice areas.

## Where AI is used

All model calls use the **Groq** chat API from **server-only** routes (JSON object mode, timeouts, second-pass runtime validation of schema, evidence, and safety):

| Capability                       | Route                           | Notes                                                                                              |
| -------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Optional resume fact extraction  | `POST /api/interview/resume`    | Text resumes (`.txt`/`.md`/`.rtf`) extract best; binary PDFs may need manual highlights               |
| Personalized interview questions | `POST /api/interview/questions` | Falls back to clearly labeled general (non-AI) questions if generation fails                       |
| STAR communication evaluation    | `POST /api/interview/evaluate`  | **No offline fallback.** Requires `GROQ_API_KEY`. Evidence must be an exact transcript substring   |

Default model: `llama-3.1-8b-instant` (cheapest Llama on Groq) via `GROQ_MODEL` (optional override).

## How Codex accelerated development

Codex contributions are recorded factually in [`docs/CODEX_WORKFLOW.md`](docs/CODEX_WORKFLOW.md). The strongest real examples:

1. **Empty-repo foundation → runnable Next.js app** — Replaced an invalid empty `package.json/` directory with a typed App Router project, shared pixel layout, lint/typecheck/test/build scripts, and honest Practice/Progress placeholders (Phase 1 workflow entry).
2. **Interview simulator + server-only GPT-5.6 wiring** — Validated contracts, resume extraction, question generation, labeled general fallback, microphone-as-enhancement, and versioned attempt persistence without inventing scores (Phase 5 workflow entry).
3. **Evidence-grounded evaluation pipeline** — STAR rubric, exact transcript-evidence checks, unsafe-claim rejection, safe HTTP error map, and learner-facing non-grade disclaimer (GPT-5.6 evaluation workflow entry).
4. **Progress Library and attempt comparison** — Persisted successful evaluations onto existing attempts and built scenario-scoped comparison that never claims broad improvement from one isolated score (Prompt 10 workflow entry).
5. **Release-readiness audit and hardening** — Parallel security/a11y/test/architecture/README reviews, then storage-corruption recovery, API guards, focus management, and a reproducible README (Prompt 11 workflow entry).

Important human decisions that constrained that work are listed in [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) (see also the demo script).

## Technology stack

- **Runtime:** Node.js 20.19+ (developed on Node 24), npm
- **App:** Next.js 16 (App Router), React 19, TypeScript (strict)
- **AI:** Groq Chat Completions API via platform `fetch` (default `llama-3.1-8b-instant`)
- **Persistence:** Browser `localStorage` (versioned keys; no database)
- **Tests:** Vitest, Testing Library, jsdom
- **Quality:** ESLint (eslint-config-next), Prettier

## Architecture summary

```text
Browser (React client)
  ├── Academy / Learn / Exercise / Practice / Progress UI
  ├── localStorage: course, exercise, interview attempts (+ evaluations)
  └── fetch → Next.js Route Handlers
        ├── /api/interview/resume
        ├── /api/interview/questions
        └── /api/interview/evaluate
              └── Groq Chat Completions (server-only GROQ_API_KEY)
                    → JSON object output
                    → Application re-validation (evidence, rubric, safety)
```

Domain logic lives under `src/lib/` (interview, evaluation, progress) and is injectable with a `Storage` parameter for tests. Client components never read the API key.

## Local setup

```powershell
npm.cmd install
Copy-Item .env.example .env.local   # macOS/Linux: cp .env.example .env.local
# Edit .env.local and set GROQ_API_KEY
npm.cmd run dev
# Open http://localhost:3000
```

On Windows PowerShell, prefer `npm.cmd` if execution policy blocks `npm.ps1`.

## Required environment variables

| Variable       | Required                                                               | Purpose                                         |
| -------------- | ---------------------------------------------------------------------- | ----------------------------------------------- |
| `GROQ_API_KEY` | Yes for resume extraction, personalized questions, and STAR evaluation | Server-only. Never use a `NEXT_PUBLIC_` prefix. |
| `GROQ_MODEL`   | No (defaults to `llama-3.1-8b-instant`)                                | Optional model override                         |

See [`.env.example`](.env.example). Get a key at [console.groq.com](https://console.groq.com). Without a key, interviews can still complete via labeled general questions, but **STAR feedback and attempt comparison cannot be demonstrated**.

## Sample or seed data

There is **no seeded demo fixture** and no sample progress inventing scores. Start from an empty browser profile (or reset storage) and walk the real loop.

Reset keys (DevTools console) or use **Reset stored progress** on the Progress Library error panel:

```js
[
  "ameego:course-progress:v1",
  "ameego:exercise-progress:v1",
  "ameego:interview-attempts:v1",
].forEach((k) => localStorage.removeItem(k));
```

For a comparison demo, complete two evaluated interviews with the **same** interview type, role, and organization.

## Development commands

```powershell
npm.cmd run dev          # development server
npm.cmd run lint         # eslint
npm.cmd run typecheck    # tsc --noEmit
npm.cmd run format       # prettier --write
npm.cmd run format:check # prettier --check
```

## Testing commands

```powershell
npm.cmd test             # vitest run (unit + component + route tests)
npm.cmd run test:watch   # vitest watch mode
```

There is no Playwright E2E suite in this repository; coverage is library, component, and API-route tests plus manual production smoke.

## Production build

```powershell
npm.cmd run build
npm.cmd run start
# Open http://localhost:3000
```

## Demo and submission helpers

- Video outline: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) (under three minutes)
- Submission checklist: [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md)
- Codex session log: [`docs/CODEX_WORKFLOW.md`](docs/CODEX_WORKFLOW.md)
- Human decisions: [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md)

### Judging walkthrough (short)

1. Academy (`/`) → Learn → STAR lesson → mark complete → exercise → check order → Practice
2. Interview: set role/org (remember them), 3 questions, skip resume or extract, generate questions, text mode, answer + confirm all
3. Generate STAR feedback (needs API key) → Start another interview with the **same** role/org → evaluate again
4. Progress (`/progress`) → Select to compare on both evaluated attempts

## Known limitations

- STAR evaluation and resume extraction need live Groq access; there is no offline evaluation fixture.
- Progress is device- and browser-local; no accounts or sync.
- Speech input is progressive enhancement (Web Speech API with interim text and
  auto-restart while listening); best in Chrome/Edge. Text always works.
- No automated Playwright E2E suite.
- Workspace may need `git init` / remote setup before submission if Git history is not already present.
- `restart()` clears the interview setup form, so comparison retries require re-entering the same role and organization.
- Speech Hall remains intentionally locked / coming soon.

## Privacy and safety notes

- `GROQ_API_KEY` stays on the server; model calls never run in the browser.
- Raw resume bytes are used only for extraction and are not written into attempt history.
- Feedback is evidence-based communication practice, not an official grade or hiring decision.
- The evaluator does not assess emotion, honesty, intelligence, employability, accent, confidence, nervousness, or eye contact.
- Optional camera framing runs on-device (face in frame + approximate head orientation). Preview is not stored, never sent to the feedback model, and never required to finish an interview.
- Comparison never claims broad improvement from one isolated rubric score.
- AI question-generation failures offer a clearly labeled non-personalized general-question path.

## License

The `LICENSE` file is currently empty. **A license has not been selected in this repository yet.** Choose and fill a license before public submission (team decision). Until then, treat the code as private/unpublished for redistribution purposes.
