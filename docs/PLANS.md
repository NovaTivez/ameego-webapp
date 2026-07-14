# Ameego implementation plan

## Phase 0 - Repository audit and baseline

**Audit date:** 2026-07-15  
**Status:** Audit completed; implementation and specification baselines are blocked by missing repository content.

### Scope and constraints

This phase inspected the complete repository currently available on disk. No packages were installed, no feature code was added or removed, and Phase 1 was not started.

`AGENTS.md` and every file under `docs/` were opened during the audit. At audit time, all of them were zero-byte files. Therefore, this document records the actual repository baseline, but the intended Phase 0 checklist and product requirements could not be recovered from those files.

### 1. Project and toolchain identification

| Area                   | Finding                                                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework              | Not identifiable; no application code or framework configuration exists.                                                                                                      |
| Language               | Not identifiable; `src/` contains no files.                                                                                                                                   |
| Package manager        | Not configured. A path named `package.json` exists, but it is an empty directory rather than a JSON manifest. No lockfile exists.                                             |
| Dependencies           | None declared; there is no readable package manifest.                                                                                                                         |
| Build system           | Not configured. No build configuration or scripts exist.                                                                                                                      |
| Project configuration  | Only an empty `.env.example` is present. There is no TypeScript/JavaScript, lint, test, formatter, framework, container, CI, or Git configuration in the available workspace. |
| Local runtime observed | Node.js `v24.14.1`; npm `11.11.0` is reachable through `npm.cmd`. These are machine capabilities, not project requirements.                                                   |
| Version control        | The available workspace is not a Git worktree; `git status` and `git log` report that no `.git` repository exists.                                                            |

### 2. Current repository map

```text
Ameego/
|-- .env.example             # empty file
|-- AGENTS.md                # empty file
|-- LICENSE                  # empty file
|-- README.md                # empty file
|-- package.json/            # empty directory; invalid manifest path
|-- public/                  # empty directory
|-- src/                     # empty directory
|-- tests/                   # empty directory
`-- docs/
    |-- AI_EVALUATION.md     # empty file before this audit
    |-- ARCHITECTURE.md      # empty file before this audit
    |-- CODEX_WORKFLOW.md    # populated by this audit
    |-- COURSE_SYSTEM.md     # empty file before this audit
    |-- DECISION_LOG.md      # empty file before this audit
    |-- PLANS.md             # populated by this audit
    |-- PRODUCT_SPEC.md      # empty file before this audit
    `-- UX_AND_DESIGN.md     # empty file before this audit
```

Current implementation inventory:

| Category                        | Finding |
| ------------------------------- | ------- |
| Routes                          | None.   |
| Pages                           | None.   |
| Components                      | None.   |
| API endpoints                   | None.   |
| Data models or migrations       | None.   |
| Authentication or authorization | None.   |
| Existing features               | None.   |
| Static assets                   | None.   |
| Tests                           | None.   |

### 3. Reusable working code

No working application code is available to reuse. The empty top-level directories (`src/`, `public/`, and `tests/`) express a possible organizational intention but contain no implementation, configuration, or conventions that can safely guide Phase 1.

### 4. Audit findings

#### Repository and implementation quality

- **Placeholder functionality:** The repository is entirely a placeholder scaffold. All files other than this updated plan and workflow log were empty at audit time.
- **Duplicated code:** None observable because no source code exists.
- **Dead code:** None observable because no source code exists.
- **Broken imports:** None observable because no source files exist.
- **Configuration defect:** `package.json` is a directory, so Node package tooling cannot read a project manifest.
- **Missing environment variables:** `.env.example` declares none. Required variables cannot be determined until architecture and feature requirements are supplied.
- **Missing repository metadata:** No `.git` worktree or `.gitignore` is present in the available workspace.
- **Missing project metadata:** `README.md` and `LICENSE` are empty.

#### Security

No implemented vulnerability can be assessed because there is no code, dependency graph, authentication, API, or deployment configuration. This is itself a delivery risk: there is no documented secret handling, authorization model, input validation policy, dependency update policy, security header policy, rate limiting, audit logging, or data-retention approach. These controls must be designed before relevant Phase 1 implementation, not inferred later.

#### Accessibility

No user interface exists to test. There is no evidence of semantic structure, keyboard navigation, focus management, accessible names, contrast targets, reduced-motion support, form error behavior, or automated/manual accessibility coverage. Accessibility acceptance criteria cannot be derived because `UX_AND_DESIGN.md` is empty.

#### Testing gaps

- No unit, integration, component, accessibility, API, or end-to-end tests exist.
- No test runner or browser testing framework is configured.
- No linting, type-checking, coverage, or CI quality gate is configured.
- There is no production build to validate.

#### Architecture risks

- Product scope, course rules, AI evaluation behavior, UX constraints, and architecture boundaries are undocumented in the available files.
- The framework, rendering strategy, data store, API style, hosting target, identity provider, authorization model, and AI provider are undecided or unavailable.
- No schemas or interfaces establish stable boundaries between product areas.
- Starting feature work now would require high-impact assumptions and would likely cause avoidable rework.
- An empty `.env.example` provides no contract for local or deployed configuration.
- The invalid `package.json/` directory prevents even basic script discovery.

### 5. Command availability

No project commands are currently defined or discoverable.

| Purpose            | Available project command | Result       |
| ------------------ | ------------------------- | ------------ |
| Development        | None                      | Not runnable |
| Linting            | None                      | Not runnable |
| Type checking      | None                      | Not runnable |
| Unit testing       | None                      | Not runnable |
| End-to-end testing | None                      | Not runnable |
| Production build   | None                      | Not runnable |

### 6. Commands executed

All commands below were read-only and did not install packages.

| Command                                                     | Outcome                                                                                                               |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `rg --files -g AGENTS.md -g "docs/**"`                      | Passed; found `AGENTS.md` and all eight documentation files.                                                          |
| Documentation size/content inspection with PowerShell       | Passed; every governed/documentation file was zero bytes before the audit.                                            |
| `rg --files -g '!node_modules/**' -g '!.git/**'`            | Passed; found only the empty root files and documentation files because `rg --files` does not list empty directories. |
| Recursive `Get-ChildItem -Force` inventory                  | Passed; confirmed the complete scaffold and empty directories.                                                        |
| `git status --short --branch`                               | Failed as expected; this path is not a Git repository.                                                                |
| `git log --oneline --decorate -10`                          | Failed as expected; this path is not a Git repository.                                                                |
| `node --version`                                            | Passed; returned `v24.14.1`.                                                                                          |
| `npm --version`                                             | Failed before npm ran because PowerShell script execution blocks `npm.ps1`.                                           |
| `npm run`                                                   | Failed before npm ran for the same PowerShell execution-policy reason.                                                |
| `npm.cmd --version`                                         | Passed; returned `11.11.0`.                                                                                           |
| `npm.cmd run`                                               | Failed; npm reported `EISDIR` because `package.json` is a directory. No scripts were executed.                        |
| Configuration/manifest candidate inspection with PowerShell | Passed; the only candidate found was the invalid `package.json/` directory.                                           |

No development, lint, type-check, unit-test, end-to-end-test, or production-build command was run because none exists. A command is not recorded as passing unless its observed exit code was zero and its output supported that conclusion.

### 7. Specification comparison

The requested implementation-to-specification comparison cannot be completed from the files currently on disk:

| Document           | Available content | Comparison result                                                                                                  |
| ------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| `PRODUCT_SPEC.md`  | Empty             | Product requirements and acceptance criteria unavailable; all product behavior remains unverified.                 |
| `COURSE_SYSTEM.md` | Empty             | Course structure, progression, completion, and persistence rules unavailable.                                      |
| `AI_EVALUATION.md` | Empty             | AI evaluation inputs, outputs, rubrics, safety, failure behavior, and observability unavailable.                   |
| `UX_AND_DESIGN.md` | Empty             | Information architecture, page states, responsive behavior, design tokens, and accessibility criteria unavailable. |
| `ARCHITECTURE.md`  | Empty             | Technical boundaries, stack, deployment, data, auth, integrations, and non-functional requirements unavailable.    |

Because the implementation is also empty, there are no partially matched requirements: the current repository provides no evidence that any intended product capability exists.

### 8. Phase 0 outcome

#### Current project status

The repository is a non-runnable, non-versioned, empty scaffold. Phase 0 inventory and command validation are complete for the content available on disk, but specification comparison is blocked by empty source documents.

#### Blocking issues

1. Confirm whether the zero-byte documentation files are expected or whether populated/unsaved versions need to be restored.
2. Restore or supply the intended repository history and application files if this workspace is incomplete.
3. Replace the `package.json/` directory with the intended manifest only after the stack is approved; do not infer its contents.
4. Establish the product, course, AI evaluation, UX, and architecture baselines before feature implementation.

#### Product gaps

Every requested product layer is absent: user-facing pages, navigation, course experience, AI evaluation, data persistence, APIs, authentication/authorization, error and loading states, accessibility behavior, analytics/observability, tests, and deployment configuration.

#### Recommended next milestone

The next milestone should be **Phase 0 recovery and approval**, not Phase 1 implementation: recover the populated documentation and intended source repository, confirm the approved stack and architecture, then repeat the blocked comparison and turn approved requirements into testable Phase 1 acceptance criteria.

#### Decisions requiring team approval

- Whether this empty scaffold is the intended starting point or an incomplete checkout/export.
- Which recovered documents are authoritative if IDE buffers, another branch, or another repository contain different versions.
- Framework, language, package manager, runtime version, build system, and hosting/deployment target.
- Data store and schema ownership, API style, authentication provider, roles, and authorization rules.
- AI provider/model strategy, evaluation rubric, privacy constraints, failure modes, and cost/latency limits.
- Accessibility target and supported browsers/devices.
- Required test layers, CI gates, observability, security controls, and environment strategy.
- Repository license and contribution/version-control conventions.

Phase 1 must not begin until the missing baselines are restored or the team explicitly approves the constrained hackathon strategy below as the temporary implementation authority.

## Revised hackathon implementation strategy

**Planning date:** 2026-07-15  
**Planning basis:** The Phase 0 empty-repository findings plus the judging flow supplied directly by the product owner. The other product and architecture documents remain empty on disk.  
**MVP objective:** Deliver one polished, reliable, end-to-end STAR learning and retry experience for judging.

### Scope lock

The only primary flow is:

```text
STAR lesson
-> STAR exercise
-> interview simulation
-> learner response
-> GPT-5.6 evaluation
-> evidence-based feedback
-> lesson recommendation
-> retry
-> attempt comparison
```

This plan intentionally limits the MVP to:

- One STAR lesson covering Situation, Task, Action, and Result.
- One deterministic STAR exercise with immediate, non-AI validation.
- One text-based interview question and text response.
- One structured evaluation rubric with Situation, Task, Action, and Result scores.
- Evidence-based feedback grounded in excerpts from the learner's response.
- One deterministic lesson recommendation derived from the weakest rubric category.
- One retry path and a comparison between the first and latest attempts.
- Browser-local persistence for the current learner on the current device.
- One responsive web experience with essential loading, error, empty, and retry states.

The MVP does not include user accounts, a database, multiple courses, a question bank, voice or video, realtime interviewing, an admin area, social features, certificates, payments, production analytics, or generalized AI coaching.

### Recommended technical strategy

The repository has no existing stack, so this is a proposed hackathon baseline that requires approval before installation or implementation:

| Concern             | Recommended choice                                                                | Reason                                                                                                                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application         | Next.js with the App Router and TypeScript                                        | One repository can host the learner UI and a server-only evaluation endpoint.                                                                                                                                     |
| Package manager     | npm with a committed `package-lock.json`                                          | npm is already available locally through `npm.cmd`; no alternative manager is configured.                                                                                                                         |
| Styling             | Plain CSS/CSS Modules                                                             | Avoids adding a design-system dependency for a single polished flow.                                                                                                                                              |
| Primary page        | `/star`                                                                           | Keeps the judging journey cohesive and avoids unnecessary routing.                                                                                                                                                |
| Evaluation endpoint | `POST /api/evaluate`                                                              | Keeps the OpenAI API key and evaluation instructions on the server.                                                                                                                                               |
| AI integration      | Official OpenAI JavaScript SDK, Responses API, model `gpt-5.6`, structured output | The requested model alias routes to GPT-5.6 Sol and supports the Responses API and structured outputs according to the [official model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-sol). |
| Validation          | Shared Zod schemas at the API boundary                                            | Rejects malformed learner input and invalid model output before UI rendering.                                                                                                                                     |
| Persistence         | Versioned `localStorage` attempt record                                           | Supports retry and comparison without adding authentication or a database.                                                                                                                                        |
| Client state        | A small reducer/state machine                                                     | Makes the ordered judging flow and invalid transitions explicit without a state-library dependency.                                                                                                               |
| Automated tests     | Vitest, React Testing Library, and Playwright                                     | Covers contracts and transitions quickly, then protects the complete judging path.                                                                                                                                |

The evaluator must sit behind an application-owned interface. Tests and early UI work use a fixed evaluation fixture; the production implementation uses the server-side OpenAI client. This prevents network availability, model access, latency, or quota from blocking all earlier flow work.

### Minimal domain contract

The implementation should introduce only the data needed for the judging flow:

- `LessonSection`: STAR category, concise explanation, example, and completion state.
- `Exercise`: one fixed prompt, learner selection/input, expected result, and explanation.
- `InterviewPrompt`: one fixed behavioral interview question.
- `Evaluation`: per-category scores, concise rationale, grounded evidence items, strengths, improvements, overall summary, and recommended lesson category.
- `Attempt`: attempt number, prompt identifier, learner response, evaluation, and timestamp.
- `AttemptComparison`: first/latest score deltas and changed feedback, derived locally rather than generated by another AI request.

Evidence items must include an exact excerpt from the submitted response and an explanation of what that excerpt demonstrates or lacks. The API must verify that each returned excerpt occurs in the learner response before accepting the evaluation. The lesson recommendation should be derived in application code from the lowest rubric score with a documented tie-break order, keeping retries consistent and testable.

### Phase 1 - Shared application foundation

**Status:** Implemented and command-validated on 2026-07-15. Automated in-app browser visual inspection remains unavailable in the current Codex session and requires manual follow-up.

**Goal**

Turn the empty scaffold into a runnable, accessible application foundation without implementing lesson behavior, AI simulation, generated feedback, persistence, or database changes.

**Features included**

- Next.js App Router, TypeScript, React, npm scripts, linting, formatting, unit/component testing, and production build configuration.
- Shared root layout with skip link, sticky main navigation, content landmark, metadata, and footer.
- Home, Learn, Practice, and Progress routes.
- Honest route placeholders that do not fabricate course completion, attempts, AI responses, scores, or feedback.
- Global design tokens for the ink, plum, paper, mint, amber, and warning palette; spacing; typography; pixel scale; and content width.
- Reusable `PixelButton`, `PixelPanel`, `PixelBadge`, `PixelRoom`, `MainNav`, and `RoutePlaceholder` components.
- CSS-built pixel-art interview room with readable system body typography and pixel-styled display typography.
- Shared loading, error/retry, and not-found states.
- Responsive desktop, tablet, and narrow-screen safeguards.
- Native keyboard controls, visible focus treatment, active-route semantics, reduced-motion handling, and screen-reader loading/status copy.

**Files changed**

- Project/configuration: `package.json`, `package-lock.json`, `tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, `.prettierrc.json`, `.prettierignore`, `.gitignore`, `README.md`.
- Application: `src/app/layout.tsx`, `page.tsx`, `globals.css`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `learn/page.tsx`, `practice/page.tsx`, `progress/page.tsx`.
- Components: `src/components/MainNav.tsx`, `PixelButton.tsx`, `PixelPanel.tsx`, `PixelBadge.tsx`, `PixelRoom.tsx`, `RoutePlaceholder.tsx`.
- Tests: `tests/setup.ts`, `tests/PixelButton.test.tsx`, `tests/MainNav.test.tsx`.
- Records: `docs/PLANS.md`, `docs/CODEX_WORKFLOW.md`.

**Dependencies added**

- Runtime: `next` 16.2.10, `react` 19.2.7, `react-dom` 19.2.7.
- Development: TypeScript, React/Node type packages, ESLint and Next.js configuration, Prettier, Vitest, jsdom, Vite React plugin, and Testing Library packages.
- Security override: Next.js uses patched `postcss` 8.5.19 through an npm override after the initial audit reported the bundled 8.4.31 advisory.
- No UI kit, icon pack, font package, state library, AI SDK, database client, or validation library was installed.

**Technical risks and remaining validation**

- `AGENTS.md`, `UX_AND_DESIGN.md`, `PRODUCT_SPEC.md`, `ARCHITECTURE.md`, and course/AI documents remain empty, so the current visual and route conventions are implementation assumptions.
- The CSS interview room is an interpretation because no reference image or asset exists in the repository.
- The workspace still is not a valid Git worktree, preventing reliable diff, history, and rollback workflows.
- In-app browser discovery returned no available browser, so desktop/tablet screenshots, overflow inspection, and a full manual tab-order review were not automated.
- The app currently exposes no intentional error-trigger route; `error.tsx` was linted, type-checked, and built but not forced through a browser failure.

**Test requirements and observed results**

- Formatting: completed with Prettier; the final repository-wide format check passed after documentation updates.
- Lint: passed after correcting one JSX text-node issue.
- Type checking: passed.
- Unit/component tests: 2 files and 4 tests passed after adding explicit test cleanup.
- Production build: passed; `/`, `/learn`, `/practice`, `/progress`, and `/_not-found` were statically generated.
- Live HTTP smoke checks: core routes returned `200`; `/missing-room` returned `404`.
- Dependency audit: initial 2 moderate findings resolved by the PostCSS override; npm then reported 0 vulnerabilities.

**Acceptance criteria result**

- Met: runnable application, shared layout/navigation, design tokens, reusable pixel-art components, core placeholders, state pages, responsive CSS foundation, keyboard semantics, project commands, tests, and production build.
- Intentionally excluded: STAR lesson completion, exercise behavior, interview response submission, evaluation fixtures, AI requests, feedback, recommendations, retries, comparisons, persistence, authentication, and database behavior.
- Pending manual validation: visual comparison with the intended reference, desktop/tablet screenshots, zoom/overflow review, and end-to-end keyboard tab order in a browser.

**Estimated relative effort:** Large, completed. The application and validation toolchain were created from an empty scaffold.

### Pixel Communication Academy - Educational hub

**Status:** Implemented and command-validated on 2026-07-15. Automated in-app browser inspection remains unavailable in the current Codex session.

**Goal**

Make the academy campus the main educational navigation area while distinguishing real destinations from future locations and preserving the shared pixel-art design system.

**Features included**

- Root `/` route converted from the introductory lobby into the Pixel Communication Academy hub.
- Visual campus map with Interview Center, Speech Hall, and Progress Library.
- Interview Center marked Available and Recommended with a working route to `/practice`.
- Progress Library marked Available with a working route to `/progress`.
- Speech Hall marked Locked and Coming soon with no link, click handler, or implied functionality.
- Clear recommended-next panel directing learners to the Interview Center.
- Completed state represented by the truthful “Academy map discovered” checkpoint after the hub renders; no lesson, interview, score, or progress completion is fabricated.
- Status key for Available, Completed, Recommended, and Locked states.
- Semantic Academy menu that duplicates the visual map destinations for keyboard and assistive-technology navigation while skipping locked Speech Hall in the tab order.
- Shared academy location catalog so the map and menu cannot disagree about routes or availability.
- Main navigation labels aligned with Academy, Interview Center, and Progress Library.
- Existing Interview Center and Progress Library placeholder pages retained and renamed without adding AI, persistence, or fake learner activity.

**Files changed**

- New: `src/lib/academy.ts`.
- New: `src/components/AcademyMap.tsx`, `AcademyLocationCard.tsx`, `AcademyMenu.tsx`.
- Updated: `src/app/page.tsx`, `src/app/globals.css`, `src/components/MainNav.tsx`.
- Updated: `src/app/practice/page.tsx`, `src/app/progress/page.tsx`.
- New: `tests/AcademyMap.test.tsx`; updated `tests/MainNav.test.tsx`.
- Updated: `docs/PLANS.md`, `docs/CODEX_WORKFLOW.md`.

**Dependencies required**

- No new dependencies. The implementation reuses Next.js, React, the existing pixel components, Testing Library, and Vitest.

**Navigation and completion model**

- `src/lib/academy.ts` is the only source of truth for names, descriptions, state, recommendation, future availability, and route targets.
- Available locations render real links in both the map and menu.
- Locked locations render descriptive text with `aria-disabled="true"` and never render an anchor.
- Recommended is an additional flag on an available location rather than a competing availability state.
- Completed is limited to the academy-discovery checkpoint. This phase does not persist learner completion or infer activity outside the rendered hub.

**Validation results**

- Lint passed.
- Type checking passed.
- Tests passed: 3 files, 7 tests.
- Production build passed; all existing routes remained statically generated.
- Automated keyboard test passed: focus moves from Interview Center to Progress Library in the Academy menu, skipping locked Speech Hall.
- Live HTTP and rendered-markup checks passed on the already-running local server: `/`, `/practice`, and `/progress` returned `200`; all required locations and the Academy menu were present; Progress Library was linked; Speech Hall had no route.
- In-app browser discovery returned no available browser, so visual focus-ring, responsive map, and manual tab-order inspection could not be completed through that surface.

**Acceptance criteria result**

- Met: coherent main hub, three required locations, honest coming-soon state, available Interview Center, linked Progress Library, all four status concepts, clear recommendation, keyboard menu alternative, shared design system, component reuse, automated keyboard coverage, and passing code/build checks.
- Pending manual validation: inspect responsive map layout and visible focus rings in a browser when the in-app browser surface is available.

**Estimated relative effort:** Medium, completed.

### Interview Foundations course and featured STAR Method lesson

**Status:** Implemented and command-validated on 2026-07-15. `docs/COURSE_SYSTEM.md` remained empty, so the product-owner requirements and the existing versioned browser-local data strategy were used as the implementation authority.

**Goal**

Publish one concise Interview Foundations course with a complete featured STAR Method lesson, honest progress states, and browser-local lesson completion without implementing the interview simulator.

**Features included**

- `/learn` converted into the Interview Foundations course page.
- Featured “The STAR Method: Build Answers That Land” lesson at `/learn/star-method`.
- Eight-minute duration and explicit learning objective.
- Concise explanation of STAR plus dedicated Situation, Task, Action, and Result sections.
- Weak response, strong response, and four reasons the strong response is more effective.
- Lesson summary and link to `/learn/star-method/exercise`.
- Honest STAR exercise placeholder; no exercise interaction, AI, response generation, scoring, or simulator behavior.
- Readable lesson column, system body typography, semantic article/section hierarchy, breadcrumbs, visible labels, and native links/buttons.
- Versioned `localStorage` completion record under `ameego:course-progress:v1`.
- Completion repository and hook kept separate from presentation components.
- Course-page Available/Completed state derived from persisted lesson IDs rather than hard-coded UI values.
- Course loading, no-lessons empty, and recoverable storage-error states.
- Learn route loading UI.

**Files changed**

- Content: `src/content/interview-foundations.ts`.
- Persistence/state: `src/lib/course-progress.ts`, `src/hooks/useLessonCompletion.ts`.
- Components: `src/components/CourseOverview.tsx`, `CourseState.tsx`, `StarLesson.tsx`; `PixelPanel.tsx` extended to accept semantic roles.
- Routes: `src/app/learn/page.tsx`, `learn/loading.tsx`, `learn/star-method/page.tsx`, `learn/star-method/exercise/page.tsx`.
- Styles: `src/app/globals.css`.
- Tests: `tests/courseProgress.test.ts`, `CourseOverview.test.tsx`, `StarLesson.test.tsx`, `interviewFoundationsContent.test.ts`.
- Documentation: `docs/PLANS.md`, `docs/CODEX_WORKFLOW.md`.

**Dependencies required**

- No new dependency. The phase reuses React, Next.js, Vitest, Testing Library, and native Web Storage.

**Data and completion model**

- Course and lesson text live in a typed content module, separate from rendering and persistence.
- `course-progress.ts` owns parsing, validation, deduplication, reading, and writing of completion data.
- Stored data has a required schema version and a list of completed lesson IDs.
- Unsupported or inaccessible storage is treated as an error rather than as completion.
- `useLessonCompletion` owns client loading/error/ready state and completion actions.
- Course and lesson components consume the hook; neither hard-codes completed progress.

**Validation results**

- First lint run found a React effect-state warning in the completion hook; initialization was moved to a deferred microtask with cleanup.
- Final lint passed.
- Type checking passed.
- Tests passed: 7 files, 15 tests.
- Completion test passed using real jsdom `localStorage`, keyboard activation, component unmount, and course-page remount; the course then rendered Completed and the review link.
- Course navigation and exercise destination assertions passed in component tests.
- Empty course state and blocked-storage error state tests passed.
- Required lesson-content contract test passed.
- Production build passed and statically generated `/learn`, `/learn/star-method`, and `/learn/star-method/exercise` in addition to existing routes.
- Live HTTP checks returned `200` for all three course routes and confirmed required STAR content in server output. Interactive links render after client hydration because completion state is loaded from `localStorage`; their destinations are covered by component tests.
- In-app browser discovery again returned no available browser, so visual click-through and a real browser storage reload could not be completed through that surface.

**Acceptance criteria result**

- Met: all required lesson sections, concise educational content, readable layout, separate content model, versioned persistence, derived completion state, loading/empty/error states, keyboard-accessible course/lesson controls, exercise link, navigation/completion tests, lint, type checking, tests, and build.
- Intentionally excluded: interview simulator, AI evaluation, fake responses, exercise scoring, attempt history, database, authentication, and cross-device synchronization.
- Pending manual validation: browser click-through, visible focus order, and refresh persistence when the in-app browser becomes available.

**Estimated relative effort:** Medium, completed.

### Interactive STAR arrangement exercise

**Status:** Implemented and command-validated on 2026-07-15. Automated real-browser inspection remains pending because the in-app browser runtime could not start in the current Windows sandbox.

**Goal**

Turn the featured STAR lesson into a short, accessible arrangement exercise that teaches the expected Situation -> Task -> Action -> Result sequence and lets every learner continue after making a genuine attempt.

**Features included**

- Four answer segments presented initially out of order at `/learn/star-method/exercise`.
- Native drag-and-drop reordering plus always-visible Move up and Move down controls as the complete keyboard alternative.
- Deterministic validation with placement-specific explanations for incorrect answers.
- Correct-order rationale shown after every submitted attempt, including an explicit Situation, Task, Action, Result summary.
- Retry that restores the original shuffled order without erasing saved completion.
- Versioned browser-local exercise progress with attempt count, completion, and whether any attempt was correct.
- Completion after the first submitted arrangement, regardless of correctness; perfect performance is not required to continue.
- A truthful continuation link to the existing `/practice` interview-simulator placeholder. No simulator or AI behavior was added.
- Loading and recoverable storage-error states; the exercise remains usable if persistence is unavailable.

**Separation of responsibilities**

- Exercise data: `src/content/star-arrangement-exercise.ts`.
- Validation and movement rules: `src/lib/star-exercise-validation.ts`.
- Versioned persistence: `src/lib/exercise-progress.ts` and `src/hooks/useExerciseProgress.ts`.
- Presentation: `src/components/StarArrangementExercise.tsx` and `ExerciseProgressState.tsx`.

**Files changed**

- Added the content, validation, persistence, hook, presentation, route loading state, and focused test files listed above.
- Replaced `src/app/learn/star-method/exercise/page.tsx` with the functional exercise route.
- Extended `src/app/globals.css` with responsive exercise, feedback, and focus-state styling.
- Added `tests/starExerciseValidation.test.ts`, `exerciseProgress.test.ts`, and `StarArrangementExercise.test.tsx`.
- Updated `docs/PLANS.md` and `docs/CODEX_WORKFLOW.md`.

**Dependencies required**

- No new dependency. The implementation uses React, native HTML drag events, localStorage, Vitest, and Testing Library already present in the repository.

**Technical decisions and risks**

- Completion records engagement, not mastery: any validated attempt completes the exercise, while correctness is stored separately and remains true once achieved.
- Native HTML drag-and-drop is supplemented rather than relied upon for accessibility; every ordering operation is possible with native buttons.
- Progress is browser-local and cannot synchronize between devices or accounts.
- A storage failure is reported and can be retried, but it does not block validation or continuation.
- Native drag-and-drop behavior still needs a real-browser pointer check because the current in-app browser runtime was unavailable.

**Validation results**

- `npm.cmd run format`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd test -- --run`: passed, 10 files and 24 tests.
- `npm.cmd run build`: passed with Next.js 16.2.10; `/learn/star-method/exercise` was statically generated.
- Live HTTP smoke check: the existing development server returned `200` and server output contained the exercise title, Situation content, and `/practice` destination.
- Component tests passed for drag reordering, keyboard-only reordering, correct validation, incorrect placement feedback, retry reset, persistence, and the continuation link.
- Unit tests passed for correct order, incorrect order, movement/retry behavior, and completion calculation.
- In-app browser verification did not run: the browser's Node runtime exited while starting its Windows sandbox (`CreateProcessWithLogonW failed: 2`), and the prescribed troubleshooting call failed for the same reason.

**Acceptance criteria result**

- Met: drag-and-drop, complete keyboard alternative, deterministic validation, incorrect-placement explanations, correct-order teaching, retry, saved completion, non-perfect continuation, simulator link, loading/error states, separation of concerns, responsive styling, unit/component coverage, lint, type checking, tests, and build.
- Intentionally excluded: interview simulation, learner response capture, AI requests or fake AI responses, evaluation, lesson recommendation, attempt comparison, database, and authentication.
- Pending manual validation: pointer drag behavior, visible focus order, responsive presentation, and refresh persistence in a real browser.

**Estimated relative effort:** Medium, completed.

#### STAR exercise verification and hardening pass

**Status:** Completed on 2026-07-15 with automated verification. Real-browser visual, pointer, and touch testing remains manual because the in-app browser Windows sandbox still exits with `CreateProcessWithLogonW failed: 2` before a browser opens.

**Focused findings and changes**

- Native HTML drag-and-drop supports mouse and trackpad interaction. Drop handling now tracks the active segment, identifies the exact target card, sets the move drop effect, clears drag state on drop/end, rejects unknown transferred IDs, and visually outlines the current drop target.
- Native HTML drag-and-drop is not treated as a reliable touch interaction. The existing Move up/Move down buttons remain fully visible on touch layouts, have 44px minimum targets and `touch-action: manipulation`, and the instructions now explicitly direct keyboard and touch learners to them.
- Reordering remains immutable. Tests verify upward and downward target moves retain exactly four unique STAR IDs; validation rejects missing or duplicate segments.
- The keyboard path uses native buttons in DOM order, descriptive labels for every STAR segment, a global visible `:focus-visible` outline, and polite movement/result announcements. The interaction test now completes the correct arrangement using only focus plus Enter/Space rather than simulated pointer clicks.
- Reset/retry restores the defined shuffled order and clears only current feedback. It does not remove or downgrade saved completion or previously recorded correctness.
- Restored progress now derives `completed` from `attemptCount` instead of trusting a potentially inconsistent stored boolean. A corrupt exercise-progress record produces an actionable error and can be cleared without deleting unrelated localStorage keys. Blocked storage remains an error and never reports false completion.
- Responsive rules now explicitly allow the exercise container and text column to shrink, wrap long content, wrap saved status, place move controls below cards at tablet width, stack cards/actions at narrow mobile width, and retain usable card/control sizes.

**Automated coverage added or strengthened**

- Exact mouse drag target and four-item integrity at the component level.
- Pure upward/downward target movement plus duplicate/missing-order rejection.
- Fully keyboard-only reorder and submission, logical initial tab sequence, labels for all eight move controls, and live movement announcement.
- Correct submission, incorrect guidance, retry reset, and persistence preservation.
- Completion restoration after remount, normalization from attempt count, invalid JSON classification/recovery, unrelated-key preservation, and unavailable-storage classification.
- Code-level responsive contracts for desktop shrinkability, tablet control placement, narrow-mobile stacking, 44px touch targets, text wrapping, and visible focus styling. jsdom cannot prove rendered geometry, clipping, or actual viewport appearance.

**Final validation**

- Formatting and the final Prettier check passed.
- Lint passed.
- Type checking passed after replacing ES2018-only dot-all flags in the new tests with ES2017-compatible expressions.
- Focused STAR suite passed: 4 files, 20 tests.
- Full suite passed: 11 files, 35 tests.
- Production build passed and statically generated `/learn/star-method/exercise`; no simulator implementation or fake `/practice` behavior was added.

**Remaining manual checks**

- Drag each card both upward and downward with a mouse/trackpad and confirm the outlined target matches the final position.
- On a touch device, scroll the page and reorder every segment with the Move buttons; native card dragging is not promised for touch.
- Tab through breadcrumbs, all enabled move controls, validation, retry, and continuation; confirm focus is always visible and announcements are understandable with a screen reader.
- Refresh after incorrect and correct attempts, then retry, and confirm completion remains saved.
- Inspect at desktop, tablet, 320px mobile, and 200% zoom for horizontal scrolling, clipping, overlapping, unreachable buttons, or undersized cards.

### Phase 2 - GPT-5.6 evaluation boundary

**Status:** Implemented on 2026-07-15. Live-provider and real-browser acceptance remain.

**Goal**

Replace the fixed evaluator with one secure, schema-validated GPT-5.6 evaluation request while preserving the Phase 1 UI and domain contract.

**Features included**

- Server-only `POST /api/evaluate` endpoint.
- Server-side OpenAI client configured through environment variables.
- Versioned STAR rubric and evaluator instructions.
- Structured evaluation output matching the shared contract.
- Evidence excerpt verification and deterministic lesson recommendation.
- Loading, success, invalid-response, rate-limit, timeout/network, and safe retry states that preserve learner text.
- Minimal server logging with request correlation and latency, excluding response content and secrets.

**Files likely to change**

- `package.json`, `package-lock.json`, `.env.example`, `README.md`.
- `src/app/api/evaluate/route.ts`.
- `src/lib/evaluation/client.ts`, `schema.ts`, `prompt.ts`, `rubric.ts`, `evaluate.ts`, `errors.ts`.
- `src/lib/star/contracts.ts` and recommendation helper if contracts need final alignment.
- `src/components/star/InterviewSimulation.tsx` and `EvaluationFeedback.tsx` for async states.
- API and integration tests under `tests/`.

**Dependencies required**

- No new runtime package was required; the existing server-side Responses API `fetch` boundary and application-owned runtime validators were reused.
- Environment: `OPENAI_API_KEY`; optionally `OPENAI_MODEL` with the approved default `gpt-5.6`.
- External prerequisite: confirmed project access, quota, and rate limits for GPT-5.6 before demo day.

**Technical risks**

- Model access, API key configuration, quota, cost, latency, or transient availability can block live judging.
- Model output may be schema-valid but pedagogically weak or may cite text not present in the answer.
- Learner text is untrusted and may attempt prompt injection.
- A too-long or empty response can waste tokens or produce poor feedback.
- Alias behavior can change over time; the hackathon must decide whether repeatability requires an available snapshot instead.

**Test requirements**

- Unit tests for input length bounds, schema parsing, evidence excerpt verification, recommendation derivation, and error mapping.
- API tests with the OpenAI client mocked for success, malformed output, refusal, timeout, rate limit, and provider error.
- Prompt fixture tests using representative weak, partial, and strong STAR answers; expected checks should focus on schema and evidence grounding, not exact prose.
- One manually authorized live smoke test with a non-sensitive answer before demo day; it must not be part of routine CI.
- Verify the API key never appears in client bundles, logs, or responses.

**Acceptance criteria**

- The browser sends only the interview prompt identifier and bounded learner response to the application endpoint.
- The server successfully evaluates a valid response with `gpt-5.6` and returns the approved structured contract.
- Every displayed evidence excerpt is verified against the learner response.
- The recommendation matches the lowest validated STAR score using the deterministic tie-break rule.
- A provider failure leaves the learner response intact and offers a clear retry without creating a false successful attempt.
- Malformed model output is rejected and never rendered as trusted feedback.
- Automated evaluator/API tests, linting, type checking, and production build pass.

**Estimated relative effort:** Large.

**Actual implementation notes**

- Added `POST /api/interview/evaluate` and `src/lib/evaluation/` contracts, rubric, prompt, JSON Schema, runtime validation, error mapping, and evaluator orchestration.
- The request contains a completed attempt identifier, role, organization, question text, and confirmed transcripts. Empty, duplicate, incomplete, or oversized exchanges are rejected before the provider call.
- The model output requires summary, strengths, improvements, exactly one Situation/Task/Action/Result result, integer 1-5 scores, explanation, exact transcript evidence, improvement action, a real lesson ID, focused next practice action, and one improved example.
- Every evidence excerpt must occur as an exact contiguous substring in a confirmed transcript. Unknown lesson IDs, missing criteria, duplicated criteria, out-of-range scores, malformed output, and unsupported evaluation claims are rejected.
- The only approved current lesson is `interview-foundations.star-method`, so every STAR weakness maps to that real lesson. The stable weakest-score order is Situation, Task, Action, Result for future differentiated mappings.
- Provider response storage remains disabled. The API distinguishes configuration, timeout, network, provider, refusal, and invalid-output failures and returns safe retry copy without returning provider bodies or credentials.
- The completion UI preserves the saved attempt, starts evaluation only after explicit learner action, validates the response again in the browser, shows exact evidence per criterion, and offers evaluation retry after failure.
- Feedback includes an application-owned notice that the result is practice feedback, not an official grade or hiring decision, and does not assess emotion, honesty, intelligence, employability, accent, confidence, nervousness, or eye contact.
- Evaluation results are intentionally not persisted or compared in this phase; durable evaluated attempts and retry comparison remain Phase 3 work.
- Added evaluator, route, and rendering tests covering valid GPT output, malformed output, missing/fabricated evidence, unknown lesson ID, provider/network failure, empty transcript, unsupported claims, refusal, timeout, structured GPT-5.6 request settings, and the learner-facing safety notice.
- Final validation passed: formatting and formatting check, lint, type checking, 61 tests across 19 files, and the Next.js 16.2.10 production build with the dynamic `/api/interview/evaluate` route.
- A live malformed-request smoke check returned HTTP 400 before any provider call. Filename-only scans found zero key-shaped values in workspace files, zero populated `OPENAI_API_KEY` assignments, zero `NEXT_PUBLIC_OPENAI` references, and zero API-key identifiers or key-shaped values in generated client assets.
- Git metadata is not available at the workspace root, so the scan covers current workspace source/configuration and generated client assets but cannot independently distinguish or audit committed files.

### Phase 3 - Durable retry and attempt comparison

**Goal**

Complete the judging value proposition by persisting attempts locally and making improvement between the first and latest response immediately understandable.

**Features included**

- Versioned browser-local storage for successful attempts only.
- Retry from feedback with the same interview prompt and recommendation context.
- First-versus-latest response and rubric score comparison.
- Clear score deltas, evidence changes, and feedback changes without an additional AI call.
- Reset-current-demo action with confirmation; no account history or cross-device synchronization.
- Corrupt or incompatible local data recovery.

**Files likely to change**

- `src/lib/attempts/schema.ts`, `storage.ts`, `compare.ts`.
- `src/lib/star/flow-reducer.ts` and `contracts.ts`.
- `src/app/star/page.tsx`.
- `src/components/star/EvaluationFeedback.tsx`, `LessonRecommendation.tsx`, `AttemptComparison.tsx`, and a small reset control.
- Unit, component, and integration tests under `tests/`.

**Dependencies required**

- No new runtime dependency expected; reuse Zod for stored-data validation.
- No database, authentication provider, or client-state library.

**Technical risks**

- Storage schema changes or corrupt data could break the demo on a previously used browser.
- Comparing non-equivalent attempts or recomputing AI prose would make improvement misleading.
- Storing interview text locally has privacy implications on shared devices.
- Retry transitions can accidentally overwrite the first attempt or duplicate failed submissions.

**Test requirements**

- Unit tests for attempt serialization, version checks, corrupt-data recovery, score deltas, and first/latest selection.
- Component tests for retry, second submission, comparison, refresh restoration, and confirmed reset.
- Verify failed evaluations are not persisted as attempts.
- Verify comparison uses stored evaluation data and makes no additional OpenAI request.
- Manual shared-device privacy review of copy and reset behavior.

**Acceptance criteria**

- A successful first attempt remains available after refresh in the same browser.
- Retry preserves the original attempt and creates a distinct second successful attempt.
- Comparison shows first and latest responses, per-category scores, numeric deltas, and changed evidence/feedback.
- The comparison never claims improvement when a score is unchanged or lower.
- Failed submissions do not change attempt history.
- Invalid stored data is discarded safely with a recoverable empty state.
- The learner can clear local demo data only after confirmation.
- Relevant automated tests, linting, type checking, and production build pass.

**Estimated relative effort:** Medium.

### Phase 4 - Judging polish and release validation

**Goal**

Make the single completed flow dependable, accessible, visually coherent, and easy to demonstrate under hackathon conditions without adding product scope.

**Features included**

- Final responsive visual hierarchy and consistent interaction states.
- Progress indicator for the existing stages only.
- Focus management and screen-reader status for stage changes and evaluation completion.
- Empty, loading, error, retry, comparison, and reset-state polish.
- Demo-safe seeded fixture mode behind an explicit development/demo configuration, while retaining the real evaluator path.
- Runbook covering environment setup, live-demo preflight, fixture fallback, and reset steps.
- End-to-end automation for the complete judging flow.

**Files likely to change**

- `src/app/globals.css`, `src/app/star/page.tsx`, and existing STAR components.
- `src/lib/evaluation/` for explicit real/fixture adapter selection without changing the response contract.
- `tests/e2e/star-journey.spec.ts`, `playwright.config.ts`.
- `README.md`, `.env.example`, and relevant documentation files once authoritative content is available.

**Dependencies required**

- Development: `@playwright/test` and `@axe-core/playwright`.
- No new production dependency expected.

**Technical risks**

- Live API latency or failure can disrupt judging even when the product is correct.
- A fixture fallback that activates silently could misrepresent the live AI integration.
- Last-minute visual changes can introduce responsive or accessibility regressions.
- The lack of Git metadata makes controlled release and rollback impossible until repository history is restored.

**Test requirements**

- Playwright happy-path test: lesson through first evaluation, recommendation, retry, and comparison.
- Playwright failure-path test proving response preservation and successful resubmission after a mocked provider error.
- Automated accessibility scan plus manual keyboard, focus order, zoom, screen-reader status, contrast, and reduced-motion checks.
- Mobile and desktop viewport checks.
- Production build and start smoke test.
- Manual live GPT-5.6 preflight and a separately verified, clearly labeled fixture fallback rehearsal.

**Acceptance criteria**

- A judge can complete the entire target flow without explanation or dead ends.
- The live path visibly uses a successful server-side GPT-5.6 evaluation during preflight.
- The fallback mode is explicit and cannot be mistaken for a live request.
- The experience remains usable at 200% zoom, by keyboard, and at the agreed mobile viewport.
- No critical automated accessibility violations remain in the target flow.
- The happy-path and provider-failure E2E tests pass.
- Lint, type check, unit/component tests, E2E tests, and production build all pass using documented commands.
- The README contains a reproducible setup and judging runbook with no secret values.

**Estimated relative effort:** Medium.

## Existing feature disposition

Phase 0 found no implemented features, so there is no application behavior to classify as reusable or removable. Repository artifacts are classified to prevent accidental loss:

| Disposition               | Current items                                                                                                                                                                                                                | Strategy                                                                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Keep                      | `docs/PLANS.md` Phase 0 evidence and `docs/CODEX_WORKFLOW.md` audit record                                                                                                                                                   | Preserve as the factual baseline and append later validation rather than rewriting history.                                                                                    |
| Reuse                     | Top-level `src/`, `public/`, and `tests/` directory intent; Phase 0 command findings                                                                                                                                         | Reuse the directory names where they fit the approved scaffold. There is no code to reuse.                                                                                     |
| Refactor                  | None                                                                                                                                                                                                                         | No source implementation exists. Future refactoring must be justified by working code, not anticipated now.                                                                    |
| Defer                     | Authentication, database/cloud sync, multiple lessons or interview questions, voice/video/realtime, admin tooling, analytics, certificates, social features, generalized personalization, and production-scale observability | Keep outside the hackathon MVP. Do not add preparatory abstractions for these items.                                                                                           |
| Remove only with approval | The invalid empty `package.json/` directory; any files restored from IDE buffers, another branch, or another repository                                                                                                      | Replacing the directory is necessary for a Node project but is still a deletion and requires explicit approval. Never discard recovered or unknown content during scaffolding. |

## Cross-phase quality gates

- The ordered judging flow remains the sole product priority; supporting work must directly enable or validate it.
- OpenAI credentials remain server-only and are represented by names, never values, in `.env.example`.
- Learner input is length-bounded, treated as untrusted data, and not written to application logs.
- A phase is complete only when its stated tests and acceptance criteria pass; later-phase polish cannot substitute for a broken earlier contract.
- The evaluation fixture and real evaluator return the same validated contract.
- Failed evaluations never masquerade as successful attempts and never overwrite learner work.
- New scope requires an explicit plan change and team approval.

## Exact first implementation milestone

**Milestone 1: Shared pixel-art application foundation - implemented.**

The repository now has the approved Next.js/TypeScript/npm foundation, shared layout, main navigation, reusable pixel-art primitives, CSS interview-room scene, core route placeholders, state pages, responsive styling, accessible control semantics, focused tests, and passing validation commands.

Before Phase 2 begins, complete the pending manual desktop/tablet visual and keyboard review, restore valid Git history if it exists elsewhere, and approve the actual STAR lesson copy, exercise behavior, interview prompt, and evaluation contract. Phase 2 must be re-reviewed against those approved inputs because the earlier mock-first assumption was deliberately superseded by the instruction not to add fake AI responses in Phase 1.

## Phase 5 - Interview Simulator Foundation

**Status:** Implemented on 2026-07-15. Live provider and real-browser checks remain.

### Goal

Provide an honest, usable interview-practice foundation from confirmed context through a saved completed attempt. This phase generates questions but deliberately does not score responses or produce final feedback.

### Implemented flow

Interview Setup -> Optional Resume Upload -> Review Context -> Generate Personalized Questions -> Microphone/Text Setup -> Interview Simulation -> Transcript Confirmation -> Save Completed Attempt.

- Setup supports job, internship, student organization, scholarship, university admission, leadership, volunteer, and custom interviews; role, organization, optional responsibilities and goals; three difficulty levels; and 3, 5, or 8 questions.
- Resume upload accepts PDF, DOC, DOCX, RTF, TXT, MD, and Markdown files up to 5 MB. Extraction returns editable education, experience, project, skill, leadership, and achievement facts. Failure exposes a manual-text path, and skipping the resume remains a complete flow.
- The raw resume is encoded in memory for the server request, sent with OpenAI response storage disabled, and never written to the browser attempt record.
- Confirmed context is sent only to server routes. GPT-5.6 receives a grounded prompt and a strict JSON Schema for an exact-length question set. Server output is validated a second time, including uniqueness, count, categories, and prevention of resume questions when no resume was confirmed.
- Provider failures preserve context and expose Retry plus a clearly labeled General questions fallback. The fallback is deterministic and is never presented as personalized AI output.
- Simulation presents one question at a time. Text is always available. Supported browsers may use speech recognition after explicit microphone permission; denial or unsupported speech leaves text mode available.
- Every response is editable before confirmation. Only confirmed responses progress. A completed attempt is saved only when every generated question has one non-empty confirmed response.
- Versioned browser-local storage retains at most 20 validated completed attempts and safely ignores corrupt records. It does not store the raw resume.

### Files changed

- Contracts, validation, provider boundary, question generation, resume extraction, and persistence: `src/lib/interview/`.
- Server routes: `src/app/api/interview/questions/route.ts` and `src/app/api/interview/resume/route.ts`.
- Interface: `src/components/InterviewSetupForm.tsx`, `ResumeProfileEditor.tsx`, `InterviewSimulator.tsx`, `src/app/practice/page.tsx`, and `loading.tsx`.
- Presentation/configuration: `src/app/globals.css`, `src/app/layout.tsx`, `.env.example`, and `README.md`.
- Tests: `tests/interviewValidation.test.ts`, `interviewQuestions.test.ts`, `interviewResume.test.ts`, `interviewAttempts.test.ts`, and `InterviewSimulator.test.tsx`.

### Dependencies

No dependency was added. The server uses the existing platform `fetch` API against the OpenAI Responses API. `OPENAI_API_KEY` is server-only, and `OPENAI_MODEL` defaults to `gpt-5.6`.

### Technical and privacy risks

- A valid OpenAI credential and provider access are required for real extraction and personalized generation; neither was available for an end-to-end provider preflight in this workspace.
- Browser speech recognition support varies. It is a convenience input method, not a requirement, and users must review the resulting transcript.
- Browser-local attempt history is device-specific and visible to other users of the same browser profile.
- DOC/DOCX/RTF support depends on provider file-input behavior; all supported formats need a real-file browser/provider check.
- Base64 upload increases request memory, bounded here with the 5 MB client and server limit.
- The in-app Windows browser sandbox still exits with `CreateProcessWithLogonW failed: 2`, so visual, pointer, real microphone, file-picker, and responsive browser checks are not complete.

### Tests and validation performed

- Setup validation covers required/custom role data, allowed difficulty, and interview length.
- Question-service tests cover no-resume personalization, request model and storage settings, valid structured output, invalid provider output, and safe general fallback.
- Resume tests cover supported/unsupported files, size limits, and extraction request boundaries.
- Simulator interaction tests cover a complete no-resume text flow, question progression, editable transcript confirmation, saved completion, extraction failure/manual recovery, AI failure/fallback, and microphone-unavailable recovery.
- Persistence tests cover completed-attempt saving/restoration, incomplete-attempt rejection, and invalid stored data.
- `npm.cmd run format`, `format:check`, `lint`, `typecheck`, `test`, and `build` passed. The full suite passed 51 tests across 16 files; Next.js 16.2.10 generated the static application routes and both dynamic interview API routes.
- Live HTTP smoke checks returned 200 for `/practice` and 400 for malformed requests to both interview endpoints.
- No live GPT-5.6 request was made because no project API credential was available. No real-browser validation is claimed.

### Acceptance status

- Complete: all setup variants, optional/no-resume paths, editable extracted facts, server-only structured generation, explicit general fallback, text-mode simulation, one-question progression, transcript confirmation, validated completed-attempt saving, loading/error states, and automated tests.
- Pending manual acceptance: live GPT-5.6 generation with and without representative resume files; microphone allow/deny behavior; keyboard/focus and screen-reader review; file-picker behavior; refresh restoration; and desktop, tablet, narrow-mobile, and 200% zoom review.
- Explicitly deferred after the evaluation phase: durable evaluation persistence, answer retry and attempt comparison, confidence/nervousness/eye-contact scoring, raw-resume retention, authentication, and cloud synchronization.

**Estimated relative effort delivered:** Large.

## 2D Pixel-Art Product Design System Pass

**Status:** Implemented on 2026-07-15. Manual visual-browser acceptance remains.

### Goal

Unify the existing academy, course, exercise, interview simulator, evaluation feedback, loading/error states, and progress route as one readable 2D pixel-art educational game without changing business logic or inventing unavailable analysis features.

### Shared visual foundation

- Replaced the purple-led palette with shared midnight navy, slate, cream, warm wood, mint, amber, red, and cyan design tokens while retaining the existing token names used by working components.
- Standardized 4-7px hard borders, stepped shadows, pixel-grid decorations, an 8px-derived spacing scale, monospace HUD typography, and system-sans long-form typography.
- Retained reduced-motion behavior and strengthened visible focus styling for links, buttons, modal controls, academy menu items, choice controls, and simulator actions.
- Added responsive breakpoints at 980px, 760px, and 520px for academy, course, interview, feedback, progress, loading, and dialog layouts.

### Reusable components added or consolidated

- Existing: `PixelPanel`, `PixelButton`, and `PixelBadge` remain the base primitives.
- Added: `PixelDialog`, `PixelStatusBar`, `PixelProgress`, `PixelCourseCard`, `PixelBuildingCard`, `CharacterPortrait`, `PixelRoomBackground`, `PixelFormField`, `PixelFeedbackCard`, `PixelModal`, `PixelLoadingState`, and `PixelIcon`.
- `AcademyLocationCard`, `CourseOverview`, lesson objective, exercise checkpoint/progress, resume review fields, feedback criteria, and route/loading states now use the shared primitives.

### Original code-native asset inventory

**Complete**

- Academy map treatment with distinct Interview Center, Speech Hall, and Progress Library exteriors, paths, windows, doors, roof colors, status treatments, and grounds props.
- Warm office interview environment with window, skyline pixels, shelf/books, plant, wood floor, desk, resume prop, and a neutral interviewer portrait.
- Neutral student/academy-guide portrait and speech dialog.
- Library room environment and local-records desk.
- STAR course emblem and lesson icon treatment.
- Crisp inline SVG icons for academy, building, speech, lesson, resume, microphone, camera, timer, progress, lock, and completion.
- Reusable room variants for office, classroom, library, and speech-hall color/environment treatments.

**Intentional placeholders or partial assets**

- The webcam panel is an explicit non-functional placeholder. It states that preview is not enabled and that no face, posture, eye-contact, or emotion data is captured.
- Speech Hall has an original exterior and icon but no functional route or finished interior screen because that product location remains locked/coming soon.
- Classroom and speech-hall room variants are reusable style variants; no unfinished feature routes were added merely to display them.
- No bitmap asset was copied or generated from the supplied reference. Original inline SVG and CSS pixel art were selected for responsive scaling, low weight, and theme consistency.

### Screens updated

- Academy: guide character/dialog, unified campus HUD styling, refined building cards, honest recommended-next copy, and keyboard menu.
- Course: reusable STAR course card/emblem and consistent loading/error states.
- Lesson: pixel dialog mission panel while preserving readable long-form typography.
- Exercise: shared progress HUD and saved checkpoint status without changing ordering, retry, validation, or persistence.
- Practice setup/review/mode: shared form/control, panel, icon, notice, and loading language.
- Interview simulation: question count and elapsed session timer at top left; session progress at top center; centered original interviewer and question dialog; response/microphone console at bottom; and a right-side optional camera placeholder with neutral operational indicators only.
- Feedback: separate evidence-focused visual section using reusable criterion cards and the existing safety disclaimer.
- Progress: original library environment with honest available/not-implemented statuses; no fabricated history or comparison.
- Shared loading, error, not-found, navigation, and footer styling remains consistent with the game shell.

### Validation

- `npm.cmd run format` and `npm.cmd run format:check` passed.
- `npm.cmd run lint` and `npm.cmd run typecheck` passed.
- Focused design, academy, course, exercise, simulator, and feedback tests passed: 23 tests across 7 files.
- Full test suite passed: 66 tests across 21 files.
- `npm.cmd run build` passed with Next.js 16.2.10; all 8 application pages and 3 dynamic interview API routes generated successfully.
- Live HTTP smoke checks returned 200 for `/`, `/learn`, `/learn/star-method`, `/learn/star-method/exercise`, `/practice`, and `/progress`; an unknown route correctly returned 404.
- Static responsive-contract tests cover shrinkable content, decorative overflow containment, stacked academy/course/simulator/feedback/progress layouts, visible focus, and narrow question-dialog sizing.
- The prescribed in-app browser connection failed before launch with `CreateProcessWithLogonW failed: 2`. No visual, pointer, real viewport, or screenshot validation is claimed.

### Remaining manual acceptance

- Inspect all routes at desktop, tablet, 320px mobile, 200% zoom, and high-contrast settings.
- Complete the simulator by keyboard and verify question HUD, room composition, response console, transcript confirmation, feedback reading order, and focus visibility.
- Check long generated questions, resume facts, transcripts, rubric evidence, and errors for clipping or overflow.
- Confirm the elapsed timer stops outside interview/transcript-confirmation stages and does not distract screen-reader users.
- Review original character and environment assets with the product/design team before treating the visual direction as final brand approval.

## Immersive Environmental Art Pass

**Status:** Implemented on 2026-07-15. Real-browser visual approval remains blocked by the Windows browser sandbox.

### Outcome

Expanded the shared pixel design system from styled interface components into a layered game world while preserving every existing workflow, route, API contract, accessibility label, readable content surface, and persistence rule.

### Environmental changes

- Added a persistent decorative night-world layer behind every route with moonlight, stepped clouds, stars, distant skyline, and layered hills.
- Rebuilt the Academy map as one continuous landscape with sky, sun, clouds, mountains, grass, paths, three buildings, trees, lamps, bench, fountain, campus sign, decorative learner NPCs, and a butterfly instead of presenting the locations as an isolated dashboard grid.
- Added classroom/workshop dioramas to the course, lesson, and exercise screens with blackboard, learner sprite, desk, paper, pencil, mug, shelf, plant, clock, lamp, wall trim, rug, and ambient light motes.
- Added an Interview Center preparation lobby for setup, resume, review, and input-mode steps with contextual host dialog, learner sprite, counter, microphone, notice board, and filing cabinet.
- Retained and deepened the functional interview room with layered lighting and room props.
- Added a reflection-room diorama before completed-attempt feedback with learner sprite, evidence board, trophy shelf, books, lighting, and furniture.
- Enriched the Progress Library automatically through the expanded room primitive and persistent world layer.
- Turned long lesson and exercise areas into reading-room and wood-workbench surfaces rather than floating cards, while keeping body typography calm and readable.

### Motion and accessibility

- Added only decorative stepped motion: slow clouds, star flicker, lamp glow, floating motes, fountain water, and butterfly movement.
- Existing `prefers-reduced-motion` rules reduce all animations to a single near-instant frame.
- Decorative world layers are hidden from assistive technology; meaningful scenes retain accessible section labels and character descriptions.
- Tablet and mobile rules remove dense secondary props before content or controls become crowded.

### Validation

- Formatting check, linting, and type checking passed.
- Focused immersive-environment and affected-screen suite passed: 30 tests across 9 files.
- Full suite passed: 72 tests across 23 files.
- Production build passed with Next.js 16.2.10 and generated all current pages and interview API routes.
- Live HTTP smoke checks returned 200 with a main landmark for `/`, `/learn`, `/learn/star-method`, `/learn/star-method/exercise`, `/practice`, and `/progress`.
- New tests verify decorative backdrop semantics, labeled learning/preparation/reflection scenes, absence of invented analysis copy, layered scene CSS, stepped animation, reduced-motion protection, and tablet/mobile scenery simplification.
- In-app browser startup again failed before launch with `CreateProcessWithLogonW failed: 2`; no screenshot, real-viewport overflow, animation, pointer, or visual-quality test is claimed.

### Remaining manual review

- Inspect environmental composition at desktop, tablet, 320px mobile, 200% zoom, and reduced-motion settings.
- Verify long lesson, question, transcript, error, and feedback content does not collide with scene props.
- Review color contrast where translucent environment layers meet text surfaces.
- Confirm that ambient motion feels subtle and that hiding secondary props on small screens retains enough atmosphere.
