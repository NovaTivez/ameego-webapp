# Ameego

**A pixel-art communication academy where learners study interview skills, practice them in a simulator, receive evidence-based feedback, and retry with a focused learning goal.**

Ameego is built for students, internship applicants, fresh graduates, and first-time job seekers who need more than a list of interview questions. The product connects instruction, practice, feedback, and measurable follow-up in one experience:

**Learn -> Practice -> Interview -> Confirm transcript -> Receive rubric feedback -> Open the recommended lesson -> Retry -> Compare attempts**

The academy setting makes repeated practice approachable, but the game layer serves the learning experience. Feedback is grounded in the learner's confirmed words, progress comes from completed activities, and the application does not make hiring or personality judgments.

Ameego supports learning both online and offline so more people can build career-ready communication skills regardless of connectivity. After an initial online visit, cached academy lessons and locally saved progress remain available offline; learners can reconnect when they are ready to use live AI features. This flexible access helps give every learner a fairer opportunity to prepare for their education and career.

## Setup Instructions

### 1. Prerequisites

- [Node.js](https://nodejs.org/) 20.19 or newer
- npm (included with Node.js)
- A modern desktop browser; Chrome or Edge is recommended for microphone testing
- A Groq API key for live resume extraction, personalized questions, and feedback

No database, account, seed script, or external authentication service is required. Learner data is stored in the current browser profile.

### 2. Install the project

```bash
git clone <repository-url>
cd Ameego
npm ci
```

Use `npm install` instead if you are intentionally updating dependencies. On Windows PowerShell, use `npm.cmd` in place of `npm` if the execution policy blocks `npm.ps1`.

### 3. Configure the environment

Copy the supplied template:

```bash
# macOS or Linux
cp .env.example .env.local
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env.local
```

Then set the server-only values in `.env.local`:

```dotenv
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
```

| Variable       | Required                      | Used for                                                                            |
| -------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| `GROQ_API_KEY` | Required for live AI features | Resume fact extraction, personalized interview questions, and transcript evaluation |
| `GROQ_MODEL`   | Optional                      | Overrides the default `llama-3.1-8b-instant` model                                  |

The key is read only by Next.js route handlers. Do not rename it with a `NEXT_PUBLIC_` prefix or commit `.env.local`.

Without an API key, the learning pages, local progress, settings, text interview flow, and labeled general-question fallback still work. Live evaluation does not have a fake or seeded fallback.

### 4. Run the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For a production-mode check:

```bash
npm run build
npm run start
```

## Sample Data

### Test account

No login is required. Use a clean browser profile for the most predictable judge walkthrough. All progress is local to that browser.

### Example interview setup

Use the same values for two interviews if you want to demonstrate attempt comparison:

| Field          | Example                                               |
| -------------- | ----------------------------------------------------- |
| Interview type | Job Interview                                         |
| Role           | Software Engineering Intern                           |
| Organization   | Northstar Labs                                        |
| Practice goal  | Use a complete STAR structure and quantify the result |
| Difficulty     | Intermediate                                          |
| Length         | 3 questions                                           |

### Optional resume input

Save this as `sample-resume.txt`, upload it on the Resume step, or paste its points into the manual highlights field:

```text
Jamie Rivera
College student applying for software engineering internships.

Experience
- Led a four-person capstone team that built a campus event web app.
- Introduced weekly task reviews after the team missed its first milestone.
- Delivered the revised project two days early and received 92% in the final review.
- Volunteered as a peer tutor for introductory programming students.

Skills
TypeScript, React, Git, REST APIs, teamwork, presentation
```

Plain-text `.txt`, `.md`, and `.rtf` files produce the most reliable extraction in the current implementation. A resume is optional; the entire interview can be completed without one.

### Example STAR response

Adapt this answer to the generated question:

> During our capstone project, our four-person team missed its first milestone because work was not clearly assigned. I was responsible for getting delivery back on schedule. I created a shared task board, assigned owners, and started a 15-minute weekly review so blockers surfaced early. We delivered the revised project two days before the deadline and received 92% in the final review. I learned to make ownership and checkpoints explicit at the start of a project.

For a useful before-and-after comparison, make the first answer intentionally brief, then retry the same role and organization with the full response above.

### Resetting the demo

Use **Settings -> Resume & Learning Data -> Reset Data** for a complete reset, or clear the application keys in the browser console:

```js
[
  "ameego:course-progress:v1",
  "ameego:exercise-progress:v1",
  "ameego:interview-attempts:v1",
  "ameego:learner-profile:v1",
  "ameego:audio-preferences:v1",
].forEach((key) => localStorage.removeItem(key));
location.reload();
```

## Testing Guide

### Automated verification

Run the same checks used during development:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

The Vitest suite covers domain calculations, storage recovery, API route behavior, AI-output validation, accessibility-oriented component behavior, responsive style contracts, audio preferences, speech support, camera geometry, settings, course progression, and the interview journey. There is currently no Playwright end-to-end suite, so the production build should be followed by the manual walkthrough below.

Current repository baseline, verified on 2026-07-19:

| Check                  | Result                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`    | Pass                                                                                                                                                    |
| `npm run build`        | Pass; 32 pages generated                                                                                                                                |
| `npm test`             | 252 of 254 tests pass across 53 files. The two failures are the resume-adapter mock contract and a Courses background occurrence-count style assertion. |
| `npm run lint`         | One existing `react-hooks/set-state-in-effect` error and three dependency warnings in `InterviewSimulator.tsx`                                          |
| `npm run format:check` | README and contribution logs pass focused formatting; the repository-wide check reports 64 existing files outside the current Prettier style            |

These failures are not hidden or converted into passing claims. They are the current cleanup baseline for the repository and do not prevent `npm run build` from completing.

### Judge walkthrough

Allow 8-12 minutes for the full learning loop. Text response mode is the most reliable demo path.

| Step                           | What to do                                                                                                                               | What to verify                                                                                                                                                                                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Landing and campus          | Open `/`, enter the academy, then open `/academy`.                                                                                       | The landing page leads to a full campus map. Buildings retain hover/focus behavior, the owl guide floats without blocking clicks, and locked areas are identified honestly.                                                                                                  |
| 2. Main Building               | Open the Main Building from the campus.                                                                                                  | The dashboard shows real browser activity, dynamic XP and level, daily missions, recent activity, achievements, and links to the next learning action.                                                                                                                       |
| 3. Courses Building            | Open Courses and choose the Interview Skills Academy.                                                                                    | The overview shows the current lesson, phase progression, locked/unlocked states, XP rewards, and the 17 routed lessons without changing progression rules.                                                                                                                  |
| 4. STAR lesson                 | Open `/learn/star-method`, read the lesson, and mark it complete.                                                                        | Completion persists after refresh, course progress changes, and the shared header updates without a page reload.                                                                                                                                                             |
| 5. STAR exercise               | Open `/learn/star-method/exercise`, arrange the four STAR parts, and check the order.                                                    | Drag controls and keyboard Move up/Move down controls work; success is saved and contributes to progress.                                                                                                                                                                    |
| 6. Interview setup             | Open `/practice`, enter the sample scenario, and continue through Scenario, Resume, Review, and Mode Selection.                          | Validation stays beside its field, resume upload remains optional, and the responsive Session Summary reflects the confirmed setup.                                                                                                                                          |
| 7. Interview session           | Select text mode, generate questions, answer each question, review the transcript, and confirm the responses.                            | Questions are personalized when the provider succeeds or clearly labeled as general fallback questions; only confirmed responses are saved.                                                                                                                                  |
| 8. Feedback                    | Finish the attempt and select **Generate Intelligent Feedback**.                                                                         | The request uses the saved transcript. A valid report contains rubric scores, explanations, exact transcript evidence, strengths, an improvement focus, a recommended lesson, and a retry goal. Provider failures display a recoverable status instead of invented feedback. |
| 9. Focused retry               | Select the same-scenario retry action and complete another attempt with the same role and organization.                                  | The scenario and focused learning goal are preserved while attempt-specific answers are reset.                                                                                                                                                                               |
| 10. Progress Library           | Open `/progress`, inspect the saved attempts, then compare the two evaluated attempts.                                                   | Counts reflect real activity; attempts can be opened or deleted with confirmation; comparison is allowed only for compatible scenarios and reports criterion-level changes without claiming overall employability.                                                           |
| 11. Settings                   | Open `/settings`, edit the learner name/focus, choose or upload an avatar, change audio/accessibility options, export data, and refresh. | Saved profile and preferences persist. Clear Progress and Reset Data remain separately labeled and require confirmation where destructive. The Back button returns to the campus map.                                                                                        |
| 12. Permissions and resilience | Test microphone/camera denial, mute/unmute, a refresh, and temporarily remove the API key.                                               | Text input remains available, camera is optional and processed on-device, corrupt or unavailable data produces a clear recovery state, and AI failures never create a fabricated score.                                                                                      |

## Why Ameego

Many interview tools stop at question generation or a score. That leaves learners with the same underlying problem: they do not know which part of an answer failed, what evidence supports that conclusion, or what to study next.

Ameego's differentiator is a closed educational loop:

1. Teach a reusable communication concept.
2. Practice it in a small, low-risk exercise.
3. Apply it in a realistic interview.
4. Confirm the transcript before evaluation.
5. Evaluate against a predefined rubric.
6. Link each judgment to transcript evidence.
7. Recommend a real lesson or exercise already in the academy.
8. Retry the same scenario with one focused goal.
9. Compare compatible attempts over time.

This makes the AI output actionable rather than decorative. The product teaches the learner what to do next.

## Major Features

- **Pixel Communication Academy:** a cohesive campus with Courses, Interview Center, Progress Library, Main Building, Settings, and clearly marked future areas.
- **Interview Skills Academy:** 17 lessons organized into four phases with persisted completion, locking, badges, rewards, and next-lesson guidance.
- **Interactive STAR exercise:** drag-and-drop and keyboard ordering with local completion tracking.
- **Pre-interview workflow:** scenario setup, optional resume extraction, profile review, difficulty and length controls, text/microphone mode selection, and a responsive session summary.
- **Interview simulator:** generated or general questions, editable transcripts, explicit confirmation, optional speech input, optional camera framing, and recoverable permission states.
- **Evidence-grounded feedback:** a bounded rubric report that rejects invalid evidence, unsafe claims, unknown lessons, malformed output, and incomplete criteria.
- **Progress Library:** activity summaries, saved transcripts, evaluation records, confirmed deletion, targeted next actions, and compatible-attempt comparison.
- **Dynamic player progress:** XP and level are calculated from completed lessons, exercises, interviews, achievements, and missions, then synchronized across pages through a shared progress event.
- **Local-first settings:** learner profile and avatar, audio, accessibility, privacy, export, permissions checks, clear-progress, and full reset controls.
- **Responsive pixel UI:** one visual system across the campus, lessons, simulator, feedback, progress, and settings, with browser-owned page scrolling.

## Development with Codex & GPT-5.6

### How the tools were used

Codex worked as a repository-aware development partner, not as a one-shot code generator. For each milestone it inspected the existing implementation and project documentation, identified reusable code and constraints, proposed a scoped plan, implemented the change, ran focused and repository-level checks, diagnosed failures, and recorded the result. The detailed evidence trail is maintained in [`docs/CODEX_WORKFLOW.md`](docs/CODEX_WORKFLOW.md), with product-owner decisions in [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md).

GPT-5.6 informed the project's education-first evaluation design and was used through the Codex development workflow for architecture review, implementation, debugging, UI refinement, test design, and documentation. The final code reflects that work in its prompt boundaries, structured response contracts, validation rules, safe failure states, and full learn-practice-feedback-retry loop.

There is an important runtime distinction: **the checked-in application currently sends live model requests to Groq's OpenAI-compatible chat endpoint and defaults to `llama-3.1-8b-instant`.** The repository does not claim that its current production feedback requests are served by GPT-5.6. The AI adapter is isolated under `src/lib/interview/openai.ts`, so a provider migration can be made without rewriting the learning, storage, or presentation layers, but that migration must be implemented and revalidated before it is claimed.

### Concrete productivity gains

| Area                    | What Codex contributed                                                                                                                                                                                                         | Result in the product                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Product architecture    | Converted the original foundation into a strict TypeScript Next.js application and separated UI, interview domain logic, storage, AI requests, prompts, and validation.                                                        | A maintainable App Router project with server-only AI calls and testable pure domain functions.                    |
| Educational feedback    | Implemented a predefined rubric, structured output contract, exact transcript-evidence checks, safe-language rejection, lesson allow-listing, and user-facing provider error states.                                           | Feedback must be specific, evidence-based, and connected to a real next lesson; invalid model output is not shown. |
| End-to-end feature work | Built the lesson/exercise/simulator/report/retry/progress sequence and preserved confirmed attempts for later review.                                                                                                          | Judges can complete the core hackathon loop in one application rather than viewing disconnected prototypes.        |
| Debugging               | Diagnosed storage corruption, responsive overflow, hidden background layers, local server startup issues, transcript layout collisions, and optional-permission edge cases.                                                    | Recoverable states and responsive layouts replace silent failure, overlap, or fake success.                        |
| UI/UX iteration         | Refined the campus, course dashboard, pre-interview steps, simulator, result screen, Progress Library, Main Building, and Settings through constrained frontend-only passes.                                                   | The product has one consistent pixel-art system while routing, data, and backend contracts remain intact.          |
| Testing and hardening   | Added focused Vitest and Testing Library coverage for calculations, routes, storage, components, accessibility behavior, responsive contracts, audio, speech, and camera utilities; repeatedly ran type and production checks. | Regressions are caught at the domain, API, component, and styling-contract levels.                                 |
| Documentation           | Kept the implementation plan, decision log, architecture notes, demo script, and Codex contribution record synchronized with shipped work.                                                                                     | Judges can reproduce the project and distinguish implemented behavior from planned or limited behavior.            |

### Key decisions made during development

- **Education before simulation.** The interview simulator is one part of a course loop, not the whole product.
- **Confirmed words are the source of truth.** Speech transcripts remain editable and must be confirmed before storage or evaluation.
- **Model output is untrusted.** Responses are parsed and revalidated for rubric completeness, exact evidence, safe language, bounded lengths, and known lesson IDs.
- **No invented fallback feedback.** General questions may be used when generation fails, but evaluation failure never produces a fake score.
- **Progress must represent completed work.** XP, level, missions, dashboard statistics, and recommendations derive from persisted learner activity.
- **Comparison is narrow and honest.** Only related scenarios can be compared, and the UI describes rubric changes rather than employability or universal improvement.
- **Accessibility is part of the main flow.** Text response is always available; camera is optional; keyboard controls, focus states, readable lesson copy, and reduced-motion behavior are supported.
- **Frontend refinements preserve product contracts.** Visual iterations were scoped around existing routes, handlers, state, and persistence instead of silently rewriting working logic.

## AI Evaluation and Safety

All live model access occurs in server-side route handlers:

| Capability                    | Route                           | Trust boundary                                                                         |
| ----------------------------- | ------------------------------- | -------------------------------------------------------------------------------------- |
| Resume fact extraction        | `POST /api/interview/resume`    | Validates upload size/type and returns bounded profile fields                          |
| Interview question generation | `POST /api/interview/questions` | Validates setup and returns bounded questions; a labeled general fallback is available |
| Transcript evaluation         | `POST /api/interview/evaluate`  | Requires a complete confirmed transcript and accepts only a validated rubric report    |

The evaluation pipeline checks:

- every required rubric criterion and score range;
- criterion-specific explanations and improvement actions;
- evidence that can be recovered from the submitted transcript;
- known course lesson identifiers for recommendations;
- bounded request and response data;
- prohibited claims about confidence, nervousness, honesty, intelligence, personality, accent, employability, and mental health;
- provider timeout, refusal, network, malformed-output, and rate-limit states.

Feedback is communication practice, not an official grade or hiring recommendation. Optional camera analysis is limited to neutral on-device framing and approximate orientation signals; it is not sent to the feedback model or used for identity recognition.

See [`docs/AI_EVALUATION.md`](docs/AI_EVALUATION.md) for the rubric and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for system boundaries.

## Technical Architecture

```text
Browser: Next.js + React
  |-- Campus, lessons, exercise, interview, feedback, progress, settings
  |-- Versioned localStorage records
  |-- Optional Web Speech and on-device MediaPipe camera utilities
  `-- fetch()
        `-- Next.js route handlers
              |-- request guards and domain validation
              |-- prompt + structured JSON contract
              `-- Groq chat-completions endpoint
                    `-- application-level output revalidation
```

### Stack

- Next.js 16 App Router
- React 19
- TypeScript 6 in strict mode
- CSS Modules plus a shared pixel design system
- Browser `localStorage` with versioned, validated records
- Groq Chat Completions through platform `fetch`
- Web Speech API with text fallback
- MediaPipe Tasks Vision for optional on-device camera indicators
- Vitest, Testing Library, and jsdom
- ESLint and Prettier

### Repository map

```text
src/app/                 Pages, loading/error states, and API route handlers
src/components/          Campus, learning, interview, feedback, progress, and settings UI
src/lib/evaluation/      Rubric contracts, prompt construction, parsing, and validation
src/lib/interview/       Setup, questions, resume, attempts, speech, and AI adapter
src/lib/                 Course, exercise, progress, audio, camera, and settings domains
tests/                   Unit, route, component, accessibility, and style-contract tests
docs/                    Architecture, product, AI, demo, plans, decisions, and Codex evidence
public/                  Pixel-art environments, buildings, characters, and backgrounds
```

## Development Commands

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the development server             |
| `npm run format`       | Format the repository with Prettier      |
| `npm run format:check` | Check formatting without modifying files |
| `npm run lint`         | Run ESLint                               |
| `npm run typecheck`    | Run strict TypeScript checking           |
| `npm test`             | Run the Vitest suite once                |
| `npm run test:watch`   | Run Vitest in watch mode                 |
| `npm run build`        | Create the production build              |
| `npm run start`        | Serve the production build               |

## Privacy and Data Handling

- API credentials remain server-side.
- Learner profile, progress, transcripts, and evaluations are stored in the current browser's `localStorage`.
- Raw resume bytes are used for extraction and are not added to interview-attempt history.
- Learners can export their local data, clear learning progress, or reset all stored data from Settings.
- Microphone input is optional, editable, and replaceable with text.
- Camera use is optional; the preview is not stored and face recognition is not used.
- The product does not infer emotion, honesty, intelligence, personality, or suitability for employment.

## Known Limitations

- Live AI features require network access and a valid Groq key.
- The checked-in runtime uses Groq Llama, not GPT-5.6; a GPT-5.6 provider migration remains required if runtime GPT-5.6 use is a submission criterion.
- Progress is browser- and device-local. There is no account sync or shared database.
- Plain-text resumes are supported most reliably; binary PDF extraction is limited and manual highlights remain available.
- Speech recognition depends on browser support and works best in Chrome or Edge. Text mode is the reliable fallback.
- There is no automated browser E2E suite; manual smoke testing complements unit, component, route, and build checks.
- The current automated baseline has two failing tests, one lint error, three lint warnings, and repository-wide formatting drift; see the Testing Guide for exact results.
- Speech Hall is intentionally marked as a future area rather than presented as complete.

## Project Documentation

- [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) - problem, audience, scope, and learner journey
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - system boundaries and validation strategy
- [`docs/AI_EVALUATION.md`](docs/AI_EVALUATION.md) - rubric, evidence, and recommendation rules
- [`docs/COURSE_SYSTEM.md`](docs/COURSE_SYSTEM.md) - curriculum and learning hierarchy
- [`docs/UX_AND_DESIGN.md`](docs/UX_AND_DESIGN.md) - pixel-art UX system and accessibility direction
- [`docs/CODEX_WORKFLOW.md`](docs/CODEX_WORKFLOW.md) - chronological Codex contribution evidence
- [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) - accepted product and engineering decisions
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) - under-three-minute video walkthrough
- [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md) - final submission checks
