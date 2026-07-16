# Implementation Plan

## Goal

Build and validate one complete educational experience before expanding the
product.

Primary experience:

STAR Lesson
→ Interactive Exercise
→ AI Interview Simulation
→ GPT-5.6 Feedback
→ Lesson Recommendation
→ Retry
→ Attempt Comparison.

---

# Phase 0 — Repository Assessment

## Tasks

- Inspect repository.
- Identify framework.
- Identify package manager.
- Identify existing routes.
- Identify existing components.
- Identify existing functionality.
- Identify development commands.
- Run existing application.
- Run existing tests.
- Run linting.
- Run type checking.
- Run production build.
- Document existing errors.
- Compare repository with PRODUCT_SPEC.md.

## Acceptance Criteria

- Existing application runs or blocking issues are documented.
- Existing tests are executed.
- Existing errors are documented.
- Repository structure is understood.
- No unrelated functionality is changed.

---

# Phase 1 — Product Foundation

## Tasks

- Create shared layout.
- Create navigation.
- Create design tokens.
- Create reusable pixel UI components.
- Create application routes.
- Add loading states.
- Add error states.
- Add not-found state.
- Add responsive foundation.

## Acceptance Criteria

- Core routes render.
- Navigation works.
- Pixel-art design system is consistent.
- Keyboard navigation works.
- Lint passes.
- Type checking passes.
- Production build succeeds.

---

# Phase 2 — Pixel Communication Academy

## Tasks

- Create Academy Hub.
- Create Interview Center.
- Create Speech Hall placeholder.
- Create Progress Library.
- Add available, completed, and locked states.
- Add recommended-next activity.
- Add accessible menu navigation.

## Acceptance Criteria

- User can navigate from Academy to Interview Center.
- Educational purpose of each location is clear.
- Locked features do not appear functional.
- Keyboard-accessible navigation exists.

---

# Phase 3 — Interview Foundations Course

## Tasks

- Implement course data model.
- Implement module navigation.
- Implement lesson pages.
- Implement lesson completion.
- Implement Interview Foundations course.
- Implement STAR Method lesson.
- Add strong and weak response examples.

## Acceptance Criteria

- User can open the course.
- User can complete the STAR lesson.
- Completion persists.
- Learning objective is clear.
- Course links to exercise.

---

# Phase 4 — Interactive STAR Exercise

## Tasks

- Create STAR arrangement exercise.
- Add drag-and-drop interaction.
- Add keyboard-accessible alternative.
- Validate response.
- Explain correct order.
- Add retry.
- Save completion.

## Acceptance Criteria

- Exercise works with mouse.
- Exercise works with keyboard.
- Incorrect answers receive explanations.
- User can retry.
- Completion persists.
- Exercise links to simulator.

---

# Phase 5 — Interview Simulator Foundation

## Tasks

- Create simulation setup.
- Create interview room UI.
- Create question progression.
- Add timer controls.
- Add text response mode.
- Add microphone permission handling.
- Add microphone recording.
- Add transcript confirmation.
- Add completion state.

## Acceptance Criteria

- User can complete a simulation.
- Text mode works.
- Microphone mode works when permission is granted.
- Permission failures are handled.
- Transcript can be reviewed.
- Questions and responses persist.

---

# Phase 6 — GPT-5.6 Evaluation

## Tasks

- Create server-side GPT-5.6 integration.
- Create evaluation prompt.
- Add rubric.
- Add structured output.
- Add schema validation.
- Add invalid-response handling.
- Add transcript evidence.
- Add lesson recommendation.
- Add improved answer example.

## Acceptance Criteria

- GPT-5.6 is meaningfully used.
- AI keys remain server-side.
- Structured outputs are validated.
- Every score has explanation.
- Every score has evidence.
- Feedback includes improvement actions.
- Lesson recommendation maps to a real lesson.
- AI failures have retry behavior.

---

# Phase 7 — Feedback Experience

## Tasks

- Create feedback report.
- Show strengths.
- Show primary improvement area.
- Show rubric breakdown.
- Show transcript evidence.
- Show recommended lesson.
- Show focused retry goal.
- Show improved example.
- Add retry action.

## Acceptance Criteria

- Feedback is understandable.
- Feedback is actionable.
- User can identify what to improve next.
- Recommended lesson is accessible.
- User can retry.

---

# Phase 8 — Attempt Comparison and Progress

## Tasks

- Save attempts.
- Create attempt history.
- Create attempt comparison.
- Calculate rubric changes.
- Create basic progress dashboard.
- Add recommended next activity.

## Acceptance Criteria

- User can access previous attempts.
- User can compare two attempts.
- Improvement is not overstated.
- Progress dashboard uses real user activity.
- Empty states are implemented.

---

# Phase 9 — Optional Webcam Indicators

Implement only after the primary flow works.

## Tasks

- Add explicit consent screen.
- Add webcam preview.
- Add camera disabled state.
- Add permitted observable indicators.
- Process locally when practical.
- Add privacy messaging.

## Acceptance Criteria

- Webcam remains optional.
- Application works without webcam.
- No emotion recognition.
- No face recognition.
- No raw video stored by default.
- Feedback uses neutral language.

---

# Phase 10 — Public Speaking Demonstration

Implement only if time remains.

## Tasks

- Create Public Speaking Foundations lesson.
- Create speech topic selection.
- Create speech recording flow.
- Create GPT-5.6 public-speaking rubric.
- Create feedback report.

## Acceptance Criteria

- Feature works end-to-end.
- Feature reuses existing architecture.
- Interview flow remains stable.

---

# Phase 11 — Testing and Polish

## Tasks

- Run linting.
- Run type checking.
- Run unit tests.
- Run integration tests.
- Run end-to-end tests.
- Run production build.
- Inspect browser console.
- Test microphone permission failure.
- Test AI failure.
- Test empty states.
- Test loading states.
- Test keyboard navigation.
- Review responsive behavior.
- Review privacy messaging.
- Remove dead code.
- Remove unused dependencies.
- Document known limitations.

## Acceptance Criteria

- Production build succeeds.
- Critical user flow works end-to-end.
- No known critical errors.
- No exposed secrets.
- Major error states work.
- Relevant tests pass.
- Known limitations are documented.

---

# Phase 12 — Hackathon Submission Preparation

## Tasks

- Complete README.
- Add setup instructions.
- Add .env.example.
- Add sample data or seed instructions when required.
- Add license.
- Verify repository accessibility.
- Update CODEX_WORKFLOW.md.
- Update DECISION_LOG.md.
- Identify strongest Codex contributions.
- Verify GPT-5.6 usage.
- Create demo data.
- Create demo script.
- Record demo video.
- Keep video under three minutes.
- Explain how Codex was used.
- Explain how GPT-5.6 is used.
- Retrieve /feedback Session ID.
- Complete Devpost submission.

## Acceptance Criteria

- Repository can be run using README instructions.
- Demo flow works without manual fixes.
- GPT-5.6 feature is visible during demo.
- Codex contribution is clearly explained.
- Key human decisions are clearly explained.
- Demo video meets submission requirements.
- /feedback Session ID is saved.

---

# Milestone Update — Learner Feedback Report and Focused Retry

Status: Implemented and validated on 2026-07-15.

## Completed

- Rendered the feedback report in the required education-first order: session
  summary, strengths, primary improvement opportunity, rubric explanations,
  criterion-linked evidence, specific actions, real lesson recommendation,
  focused goal, improved example, retry, and continued learning.
- Kept scores compact and secondary to explanations and guidance.
- Resolved the recommendation through the real Interview Foundations lesson
  catalog and refused to render unknown lesson identifiers.
- Added explicit missing-report, loading, missing-data, invalid-result, and AI
  service-failure states without displaying unvalidated output.
- Preserved the confirmed role, organization, generated question set, and
  focused learning goal when retrying the simulation.
- Added keyboard-operable native controls, semantic regions and headings,
  linked labels, live status announcements, busy state semantics, and visible
  focus behavior.
- Added component and integration coverage for valid reports, missing reports,
  invalid lesson recommendations, retry navigation, and API failures.

## Validation Result

- ESLint passed.
- TypeScript strict type checking passed.
- All 76 Vitest tests passed across 23 test files.
- The Next.js production build passed.
- The repository-wide Prettier check reported nine pre-existing documentation
  files that are not formatted; feature source and test files were formatted.

## Known Limitations

- Feedback remains in memory for the active page session; persistence and
  before-and-after comparison remain Phase 8 work.
- Browser microphone and visual console checks were not repeated for this
  report-focused milestone; automated simulator coverage exercises the
  relevant navigation and failure behavior.

---

# Milestone Update — Attempt History, Comparison, and Progress Dashboard

Status: Implemented and validated on 2026-07-16.

## Completed

- Extended completed interview attempt records with optional validated
  evaluation data and focused retry goals while keeping older version-1
  attempts readable.
- Saved evaluation data back to its completed attempt only after the existing
  rubric, lesson, transcript-evidence, and safety validation succeeds.
- Replaced the Progress Library placeholder with a client-side dashboard based
  on real course, exercise, and interview records stored on the device.
- Displayed completed lessons, completed exercises, simulation counts, and the
  number of simulations with validated feedback.
- Added an evidence-based recommended-next activity sequence for lesson,
  exercise, first simulation, saved-attempt review, and targeted lesson review.
- Added attempt history with confirmed scenario metadata, transcript detail,
  saved feedback summaries, rubric scores, and focused retry goals.
- Added comparison of two validated attempts from the same skill or scenario,
  including rubric-level deltas, specific changes in the selected pair,
  remaining practice actions, and a warning against broad improvement claims.
- Added loading, storage-error, new-user, no-attempt, one-attempt, incompatible,
  and comparable-attempt states with native keyboard-operable controls.

## Tests Added

- No stored activity or attempts.
- One saved attempt and attempt detail.
- Two comparable validated attempts.
- Incompatible attempts without two validated evaluations.
- Stored progress calculations.
- Recommended-next activity sequencing.
- Validated evaluation persistence on the completed attempt.

## Validation Result

- ESLint passed.
- TypeScript strict type checking passed.
- All 85 Vitest tests passed across 25 test files.
- The Next.js production build passed.

## Known Limitations

- Activity remains local to the current browser and device; user-account sync
  is not implemented.
- Comparison describes only the selected stored pair and intentionally does not
  infer broad or lasting skill improvement.

---

# Milestone Update — Shared 2D Pixel-Game Design System

Status: Implemented and validated on 2026-07-16.

## Completed

- Inspected the approved UI reference and translated its compact navy game HUD,
  blue-gray highlights, hard black borders, offset shadows, green actions, and
  yellow progress language into shared tokens.
- Added a dedicated `pixel-system.css` layer that owns design tokens, global HUD
  styling, typography, density, and reusable primitives without rewriting
  individual page layouts.
- Added a consistent top HUD with contextual back navigation, core navigation,
  XP display, and level display.
- Added reusable compact card, labeled input, keyboard tab, and HUD statistic
  components.
- Extended the crisp pixel icon set with back and star icons.
- Restyled shared buttons, panels, badges, status bars, progress bars, inputs,
  dialogs, modals, headings, footer, and focus states.
- Kept the shared design-system layer free from gradients, blurred glass
  effects, soft shadows, and rounded corners.
- Preserved all existing routes, page composition, persistence, evaluation,
  simulation, and progress business logic.

## Validation Result

- ESLint passed.
- TypeScript strict type checking passed.
- All 90 Vitest tests passed across 26 test files.
- The Next.js production build passed.
- Focused formatting and diff-integrity checks passed.

## Next Step

- Apply and tune the shared primitives within individual pages in later,
  page-scoped design passes without changing the established token contract.

---

# Milestone Update — Landing Page Game Title Screen

Status: Implemented and validated on 2026-07-16.

## Completed

- Redesigned only the root landing route as a full-screen nighttime pixel
  academy title screen matching the approved reference structure.
- Added a large AMEEGO logo, centered academy subtitle and tagline, and one
  green Enter Academy action.
- Preserved the product's Start Learning behavior by routing the title-screen
  action through the new `/academy` hub and onward to existing learning routes.
- Built decorative code-native academy buildings, clock tower, windows, doors,
  lamps, trees, path, shrubs, hills, moon, clouds, and stars.
- Added a dark navy frame with square black borders, blue-gray inner outline,
  and hard offset shadow.
- Isolated the complete redesign in `landing.module.css` and suppressed the
  shared HUD, footer, and global backdrop only when the landing screen exists.
- Added responsive tablet and mobile scene simplification while preserving the
  logo, tagline, action, and full-height frame.
- Left all other page components, routes, and business logic unchanged.

## Validation Result

- ESLint passed.
- TypeScript strict type checking passed.
- All 96 Vitest tests passed across 28 test files.
- The Next.js production build passed.
- Landing source and tests pass focused formatting and diff-integrity checks.

---

# Milestone Update — Academy Hub Pixel Campus

Status: Implemented and validated on 2026-07-16.

## Completed

- Added a dedicated `/academy` route matching the compact campus composition in
  panel 2 of the approved reference.
- Built a detailed top-down code-native pixel map with layered grass, paths,
  plaza, pond, terrain texture, trees, lamps, fences, signs, glowing windows,
  and hard-shadowed academy buildings.
- Connected Interview Center to `/practice`, Progress Library to `/progress`,
  Courses to `/learn`, and the title-screen entry action to `/academy`.
- Kept Speech Hall marked Coming Soon, Courtyard decorative, and Settings
  unavailable because none has a real application route.
- Added a compact top HUD with academy identity, zeroed XP, and level 01 plus a
  bottom navigation bar for Courses, Progress, and Settings.
- Kept the visual redesign entirely scoped to the Academy Hub CSS module; no
  business logic or existing destination page layout changed.
- Added responsive rules, keyboard focus treatments, descriptive link names,
  and semantic tests for unfinished destinations.

## Validation Result

- ESLint passed without warnings.
- TypeScript strict type checking passed.
- All 103 Vitest tests passed across 30 test files.
- The Next.js production build passed.
- Focused Academy Hub route, navigation, style-contract, and landing-flow tests
  passed.

Known limitation: The in-app browser backend was unavailable, so live screenshot
and console inspection could not be completed. The hub was verified through
component rendering, accessibility assertions, responsive CSS contracts, and
the production compiler.

---

# Milestone Update — Courses and STAR Lesson Pixel Menus

Status: Implemented and validated on 2026-07-16.

## Completed

- Redesigned only the `/learn` Courses page and `/learn/star-method` Lesson page
  to match panels 3 and 4 of the approved reference.
- Replaced the previous featured-course card with a compact four-module game
  menu based on the real course specification.
- Connected STAR Method to its existing route and left unpublished modules as
  honest Coming Soon non-links.
- Calculated lesson counts and course percentage exclusively from the one
  published lesson and its stored completion state.
- Added a dedicated course-progress panel, zero-or-complete progress bar, pixel
  learner portrait, and compact guidance message.
- Added a Lesson 2.1 cover with STAR Method title, short explanation, objectives
  checklist, large original CSS pixel illustration, duration, and green
  Continue Lesson action.
- Preserved the complete lesson reading content, completion persistence, error
  recovery, and STAR exercise navigation in a denser layout.
- Updated the Courses back action to return to the real `/academy` hub.

## Validation Result

- ESLint passed without warnings.
- TypeScript strict type checking passed.
- All 108 Vitest tests passed across 31 test files.
- The Next.js production build passed and statically generated both routes.
- Focused content, persistence, progress, navigation, accessibility, responsive,
  and prohibited-style tests passed.

Known limitation: Browser-backed screenshot and console inspection remains
unavailable in this environment. Visual contracts are covered by component and
CSS-module tests plus the production compiler.

---

# Milestone Update — STAR Exercise Pixel Arrangement Board

Status: Implemented and validated on 2026-07-16.

## Completed

- Redesigned only `/learn/star-method/exercise` to match panel 5 of the approved
  reference.
- Replaced the previous large stacked paper cards and learning-room scene with a
  compact dark navy pixel exercise panel.
- Added four dashed answer slots containing movable Situation, Task, Action, and
  Result tiles with large S, T, A, and R letters.
- Added explicit dragging, drop-target, slot focus, and button focus visuals.
- Kept 44px up/down controls and touch manipulation behavior for non-drag input.
- Presented compact visual Reset and Check actions while retaining descriptive
  accessible names.
- Preserved the existing move helpers, drag events, validation, announcements,
  retry behavior, completion persistence, corrupt-storage recovery, feedback,
  and Interview Center continuation route.
- Added two-column tablet and one-column mobile arrangements without changing
  the exercise data or progress model.

## Validation Result

- ESLint passed without warnings.
- TypeScript strict type checking passed.
- All 111 Vitest tests passed across 31 test files.
- The Next.js production build passed and statically generated the exercise.
- All 23 focused exercise interaction, validation, progress, responsive, focus,
  drag-state, and style-contract tests passed.

Known limitation: Browser-backed screenshot and console inspection remains
unavailable in this environment. The final visual structure is verified through
DOM behavior tests, scoped CSS contracts, and the production compiler.

---

# Milestone Update — Interview Preparation Pixel Forms

Status: Implemented and validated on 2026-07-16.

## Completed

- Redesigned only the setup, résumé upload, and profile review states of
  `/practice` to match panels 6, 7, and 8.
- Removed the large shared introduction, progress stepper, and lobby artwork only
  while those three preparation states are active.
- Added a compact setup menu with dark navy inputs, yellow labels, a custom
  select arrow, and minus/plus controls for validated difficulty and length.
- Added a large dashed upload zone and real selected-file panel with filename,
  size, Preview, and Remove actions.
- Kept the existing résumé extraction API, file validation, manual-text fallback,
  no-résumé path, errors, and raw-file non-persistence rule.
- Added a two-column profile review with interview details on the left and an
  editable icon-labeled résumé summary on the right.
- Presented green Continue and Start Interview actions while retaining the
  established accessible names and original transition handlers.
- Left mode selection, simulation, confirmation, saving, evaluation, retry, and
  feedback page compositions unchanged.

## Validation Result

- ESLint passed without warnings.
- TypeScript strict type checking passed.
- All 118 Vitest tests passed across 32 test files.
- The Next.js production build passed and statically generated `/practice`.
- All 20 focused setup, validation, upload, preview/remove, editing, fallback,
  navigation, and scoped-style tests passed.

Known limitation: Browser-backed screenshot and console inspection remains
unavailable in this environment. The preparation states are verified through
interaction tests, CSS-module contracts, and the production compiler.

---

# Milestone Update — Interview Simulator Pixel Room

Status: Implemented and validated on 2026-07-16.

## Completed

- Redesigned only the active interview and transcript-confirmation states of
  `/practice` to match panel 9 of the approved reference.
- Added a compact question/timer HUD and a green Learning Progress bar based on
  the current real question index and generated question count.
- Built an original code-native pixel interview room with a nighttime window,
  skyline, stars, wall and floor texture, plant, bookshelf, books, certificate,
  desk, paper, mug, lamp, hard shadows, and the existing neutral interviewer.
- Kept the current question in a readable speech bubble and the response editor
  in a dense bottom control panel with microphone and text-mode presentation.
- Added visible End and Next actions. Next retains the existing transcript
  validation/confirmation gate; End returns to mode selection without saving a
  false completed attempt and preserves the scenario and confirmed responses.
- Added an optional disabled camera preview with explicit privacy copy.
- Replaced the old generic indicator cards with only real session state:
  question progress, response draft presence, confirmed-response count,
  speaking duration measured only while speech recognition listens, and an
  explicitly labeled filler-word draft scan.
- Preserved question generation, microphone errors, editable transcripts,
  validation, confirmation, completion persistence, evaluation, feedback, and
  focused retry behavior.
- Added keyboard focus treatment, screen-reader labels, responsive side-panel
  stacking, and focused integration and style-contract tests.

## Validation Result

- ESLint passed without warnings after removing one stale import.
- TypeScript strict type checking passed.
- All 122 Vitest tests passed across 33 test files.
- The Next.js production build passed and statically generated `/practice`.
- All 14 focused simulator integration and style-contract tests passed.

Known limitation: The in-app browser backend remains unavailable, so live
screenshot and console inspection could not be completed. The standard
`format:check` script also exits because the environment reports the workspace
root pattern as a symbolic link; explicit Prettier checks cover every changed
source, test, and documentation file.

---

# Milestone Update — Feedback, Progress, and Settings Pixel Panels

Status: Implemented and validated on 2026-07-16.

## Completed

- Redesigned the validated Feedback Report to match panel 10 with compact navy
  panels for overall summary, strengths, areas to improve, rubric score summary,
  and the real recommended lesson.
- Preserved the full educational report order, every score explanation,
  criterion-labeled transcript evidence, improvement actions, focused retry,
  improved example, same-scenario retry, and Continue Learning action.
- Removed the completion-room preamble only after validated feedback is loaded,
  allowing the report itself to become the active game screen.
- Redesigned `/progress` to match panel 11 with real lessons completed,
  interviews taken, practice-day streak, activity-derived level, validated
  rubric averages, recent stored activity, and the existing next recommendation.
- Preserved completed lesson/exercise records, attempt history, previous-attempt
  detail, compatible and incompatible comparison behavior, rubric changes,
  specific improvements, remaining practice areas, and the broad-improvement
  caution.
- Added a real `/settings` route matching panel 12 with left-side navigation, a
  pixel learner profile, validated name and focus fields, real activity XP and
  level progress, Clear Progress, and Reset All Data.
- Clear Progress preserves the learner profile; Reset All Data also restores the
  default profile. Both destructive actions require explicit confirmation.
- Connected Settings to the Academy Hub and shared navigation.
- Added loading, corrupt-storage error, keyboard focus, responsive, and
  screen-reader semantics across the new surfaces.

## Validation Result

- ESLint passed without warnings.
- TypeScript strict type checking passed.
- All 131 Vitest tests passed across 35 test files.
- The Next.js production build passed and generated the feedback state within
  `/practice`, `/progress`, and the new `/settings` route.
- Explicit formatting checks passed for every changed source, test, and
  documentation file.

Known limitation: Live browser screenshot inspection was not requested and was
not run. Repository-wide `format:check` remains red because five pre-existing,
unrelated files are not Prettier-formatted: `AGENTS.md`, `docs/AI_EVALUATION.md`,
`docs/ARCHITECTURE.md`, `docs/COURSE_SYSTEM.md`, and `docs/PRODUCT_SPEC.md`.

---

# Milestone Update - Indie Pixel-Game Frontend Polish

Status: Implemented and validated on 2026-07-16.

## Completed

- Audited every public frontend route and shared UI primitive for hierarchy,
  spacing, type scale, alignment, density, responsiveness, accessibility,
  transitions, and environmental storytelling.
- Added one shared stepped-motion vocabulary for controls, route entry, HUD
  status, focus feedback, and reduced-motion behavior without changing route or
  business state.
- Enriched the title screen with animated stars, drifting clouds, moon and
  window light, a stepped title reveal, and a stronger game-start prompt.
- Enriched the Academy map with real-route-safe decorative flowers, benches,
  campus neighbors, academy banners, animated lamps, fountain water, and idle
  environmental motion.
- Turned Interview Setup, Resume, and Review into a visually guided three-stage
  preparation journey and reused the existing Interview Center coach scene
  across those stages.
- Added real review badges and confirmed resume-highlight counts without
  inventing learner data.
- Added stepped progress reveals and subtle reward motion to Courses, Lessons,
  the STAR exercise, Feedback, Progress, and Settings.
- Expanded the interview room with an academy pennant, rug, folder, pen, lamp
  ambience, night-window motion, speech-bubble entry, and neutral interviewer
  blink and breathing animations.
- Added a validated-feedback completion ribbon and profile-oriented Settings
  summaries for the current theme, supported accessibility behavior, local
  privacy boundary, real XP, and existing data controls.
- Preserved setup validation, resume upload and editing, question fallback,
  microphone and text response, transcript confirmation, attempt storage,
  rubric evaluation, lesson recommendations, retry, progress calculations, and
  all routes.
- Confirmed the learner-facing frontend contains no model, provider, API-key,
  raw diagnostic, or rate-limit terminology.

## Validation Result

- ESLint passed without warnings.
- TypeScript strict type checking passed.
- All 136 Vitest tests passed across 36 test files.
- The Next.js production build passed and generated all eight public pages and
  three protected interview service routes.
- All eight public routes returned HTTP 200 from the production server.
- Every file changed in this milestone is Prettier-formatted. The repository-wide
  check still reports only four pre-existing unrelated files: `AGENTS.md`,
  `docs/AI_EVALUATION.md`, `docs/ARCHITECTURE.md`, and
  `docs/COURSE_SYSTEM.md`.

Known limitation: The supported in-app browser reported no available browser
backend, so this pass used component, stylesheet, responsive-contract, route,
and build validation instead of fresh screenshot comparison. Intentional
placeholders remain limited to the Coming Soon Speech Hall and unimplemented
Settings sections, the optional camera preview, and zeroed global HUD status
where no shared persisted player-status source exists.

---

# Milestone Update - Academy Audio and Offline App Shell

Status: Implemented on 2026-07-16.

## Completed

- Added the supplied Town Theme as one preloaded looping background track with
  stepped-safe volume fade-in and fade-out behavior.
- Added the supplied button sound as the shared hover, keyboard-focus, click,
  dialog, completion, and success-notification effect.
- Added separate versioned device-local preferences for background music and
  sound effects. Music defaults to on, while browser-blocked autoplay resumes
  after the learner's first pointer or keyboard interaction.
- Added a persistent top-right pixel music toggle and live Online/Offline status
  across every route, including screens that hide the shared HUD.
- Added separate Background Music and Sound Effects switches to Settings with
  accessible switch semantics and automatic persistence.
- Added interview focus mode: music fades out during answer and transcript
  confirmation states and resumes after the active interview ends. Essential
  sound effects remain independent.
- Added a web app manifest, generated 192px and 512px pixel academy icons, and a
  service worker that pre-caches the public learning routes, manifest, icons,
  music, and sound effect.
- Added network-first navigation caching and cache-first same-origin asset
  caching. Local profile, course, exercise, attempt, and audio preference data
  continue using browser storage while offline.
- Kept protected personalized-question, resume, and feedback POST responses out
  of the cache. Standard interview fallback and saved local attempts remain the
  recovery path when service-backed personalization is unavailable.

## Validation Result

- ESLint passed without warnings.
- TypeScript strict type checking passed.
- All 168 Vitest tests passed across 42 test files.
- The production build passed, generated all eight public pages plus both PWA
  icon sizes, and retained the three protected interview service routes.
- All public pages, the manifest, service worker, both icons, and both audio
  files returned HTTP 200 from the production server. Audio and icons use
  immutable one-year caching; the service worker correctly uses no-cache.

Known limitation: Browsers may block unprompted media playback. Ameego attempts
playback immediately and retries after the first user interaction without
changing the stored preference. There is no remote learner-data store in the
current MVP, so local progress has no pending server synchronization queue;
service-backed operations require a deliberate retry after reconnection.

---

# Milestone Update - Cross-Page Pixel Visual Consistency Pass

Status: Implemented and validated on 2026-07-16.

## Completed

- Audited Landing, Academy Hub, Courses, STAR Lesson, STAR Exercise, Interview
  Setup, Resume Upload, Profile Review, Interview Simulator, Feedback,
  Progress, and Settings against the approved 12-panel reference.
- Replaced the remaining website-style persistent navigation and footer chrome
  with one compact two-column back/identity plus XP/level HUD on internal pages.
- Standardized the shared content width at 1120px, internal HUD height at 44px,
  large-screen hard shadow at 6px, shared panel shadow at 4px, button height at
  36px, and input height at 38px.
- Tightened Progress and Settings page framing and aligned their outer padding
  with Courses, Lesson, Exercise, and Interview preparation.
- Brought the interview response-mode and completion states onto the same navy
  pixel-panel, compact control, focus, and hard-shadow system as the surrounding
  practice flow.
- Preserved route targets, state transitions, validation, storage, scoring,
  lesson recommendations, retry behavior, and all other business logic.
- Verified all eight public routes return HTTP 200 from the local development
  server and removed the only current Next.js development-console warning.

## Validation Result

- ESLint passed without warnings.
- TypeScript strict type checking passed.
- All 132 Vitest tests passed across 35 test files.
- The Next.js production build passed and generated all eight public routes.
- Focused pixel-style contracts passed for all 12 reference surfaces.
- Formatting passed for every file changed in this milestone. The repository-wide
  check still reports the five pre-existing files listed in the previous
  milestone.

Known limitation: The supported in-app browser connection reported no available
browser backend after the required retry, so fresh screenshot comparison at
desktop and mobile widths could not be performed in this environment. Remaining
intentional placeholders are the zeroed shared/academy XP and level HUD values,
the Coming Soon Speech Hall and Settings sections, the disabled optional camera
preview, and empty-state content that is replaced only by real stored activity.

---

# Milestone Update - Ameego-Native Intelligent Experience

Status: Implemented and validated on 2026-07-16.

## Completed

- Removed model, provider, API-key, and generic AI terminology from the complete
  learner-facing interview and feedback flow.
- Reframed successful capabilities as Personalized Interview, Adaptive Practice,
  Intelligent Feedback, and Ameego Interview Coach features.
- Replaced model-specific retries with Retry Generation, Retry Feedback, and
  Continue with Standard Interview actions.
- Added a friendly personalization-unavailable path that keeps the standard
  interview question set available without leaving Profile Review.
- Stopped resume, question, and feedback clients from rendering server error
  strings, malformed response details, configuration messages, provider status,
  rate-limit text, or parser errors.
- Added server-side public error mappings with Ameego copy and neutral public
  codes while retaining detailed failure kinds only inside protected server
  modules.
- Preserved question validation, standard questions, resume manual entry,
  transcript confirmation, attempt saving, feedback validation, recommended
  lessons, and focused retry behavior.

## Validation Result

- ESLint and TypeScript strict type checking pass.
- All 136 Vitest tests pass across 36 test files.
- The production build passes and generates all public pages and protected
  interview service routes.
- Focused branding, fallback, service-boundary, feedback, and simulator tests
  pass.
- Provider/configuration leak tests verify that technical response text is never
  rendered or returned by the public routes.
- Full lint, type checking, test, build, and formatting results are recorded in
  Contribution 016 of `docs/CODEX_WORKFLOW.md`.

---

# Milestone Update - Uploaded-Asset Academy Campus

Status: Implemented and validated on 2026-07-16.

## Completed

- Replaced only the Academy Hub scene with the supplied campus background and
  five supplied transparent building PNGs.
- Positioned Main Building at center, Interview Center upper-left, Speech Hall
  upper-right, Progress Library lower-left, and Courses Building lower-right.
- Preserved the real `/academy`, `/practice`, `/progress`, `/learn`, and
  `/settings` destinations; unfinished Speech Hall uses an in-scene Coming Soon
  notice instead of a fabricated route.
- Added responsive fixed-aspect composition, non-overlapping hit regions,
  keyboard focus, descriptive labels, hover/press feedback, contact shadows,
  brightness matching, and restrained window glow.
- Added Academy-specific route, asset, style, and responsive-contract tests.
- Corrected the final layout with smaller non-overlapping percentages, an
  explicit contained background image layer, always-styled map labels, a native
  locked Speech Hall control, and fresh byte-identical asset URLs that bypass stale
  cache-first copies from earlier iterations.

## Validation Result

- Academy-focused tests passed: 9 tests across 2 files.
- ESLint and TypeScript strict type checking passed.
- All 171 Vitest tests passed across 42 test files.
- The Next.js production build passed and generated `/academy`, `/practice`,
  `/progress`, `/learn`, and `/settings` as public static routes.
- The fixed source aspect ratio, five non-overlapping percentage regions,
  mobile/coarse-pointer labels, focus states, and tablet/mobile breakpoints are
  covered by Academy style contracts.
- The supported in-app browser reported no available backend after its required
  retry, so screenshot inspection at desktop, tablet, and mobile widths could
  not be performed in this environment.
