# Codex Workflow

## Purpose

This document records how Codex accelerated the development of the project.

Only record work that actually occurred.

## Primary Codex Session

Primary Session ID:

TODO before submission.

The majority of core project functionality should be developed within one
primary Codex session when practical.

## Development Method

For major features:

1. Define the feature.
2. Define acceptance criteria.
3. Ask Codex to inspect the repository.
4. Ask Codex to propose or update the plan.
5. Review the proposed implementation.
6. Make important human decisions.
7. Ask Codex to implement one milestone.
8. Ask Codex to run validation.
9. Review the result.
10. Ask Codex to diagnose and fix issues.
11. Record meaningful contributions below.

## Contribution Template

### Contribution ID

Date:

Feature:

Problem:

Codex inspected:

Codex proposed:

Codex implemented:

Commands executed:

Tests executed:

Problems discovered:

How Codex helped resolve them:

Human decisions:

Result:

Files changed:

Known limitations:

## GPT-5.6 Implementation

Document:

- Where GPT-5.6 is used
- Why GPT-5.6 is necessary
- Prompt architecture
- Structured output design
- Validation strategy
- Error handling
- Iterations made after testing

## Demo Evidence

Before submission, identify 3 to 5 strong examples demonstrating how Codex
accelerated development.

Possible examples:

- Architecture planning
- Interview simulation implementation
- GPT-5.6 integration
- Debugging a difficult issue
- Test generation
- Accessibility improvement
- Security review
- Refactoring

Do not use generic statements such as:

"Codex helped us code faster."

Use concrete evidence.

## Contribution 005 — Learner Feedback Report and Focused Retry

Date: 2026-07-15

Feature: Education-first GPT-5.6 feedback report and same-scenario retry flow.

Problem: The initial evaluation view mixed scores, evidence, and actions inside
rubric cards, did not present every requested learning section, and restarted a
new interview instead of preserving the evaluated scenario and retry goal.

Codex inspected: The product, UX, course, architecture, AI evaluation, plan,
workflow, and decision documents; the evaluation schema, prompt, rubric,
server route, simulator state, attempt storage, lesson catalog, feedback UI,
styles, and existing tests.

Codex proposed: Keep the existing validated evaluation schema as the trust
boundary; resolve lesson IDs through a real lesson registry; visually subordinate
scores to explanations; separate rubric, evidence, and actions while repeating
criterion labels; and reset only attempt-specific state for retries.

Codex implemented: The ordered 11-section report, criterion-linked evidence,
real lesson routing, explicit report states, screen-reader status semantics,
focused retry banner, scenario-preserving retry transition, responsive styles,
and focused unit and integration tests.

Commands executed: Prettier write and check, ESLint, TypeScript type checking,
focused Vitest runs, full Vitest run, git diff checks, and the Next.js production
build.

Tests executed: Valid report ordering and content, missing report, invalid
lesson recommendation, retry callback and navigation, same-scenario context and
goal preservation, API failure, evaluation schema rejection, and the complete
existing test suite.

Problems discovered: The first evidence assertion also matched the section
heading and was tightened to criterion-specific labels. The repository-wide
format check also identified nine documentation files that were already outside
Prettier's expected format.

How Codex helped resolve them: Codex refined the assertion, reran the focused
suite, then ran all 76 tests and the production build successfully without
rewriting unrelated documentation changes.

Human decisions: The requested report order, education-first emphasis,
validated-data-only boundary, accessibility requirements, and preservation of
scenario and learning goal were supplied by the project owner.

Result: The learner can request a validated feedback report, understand the
evidence and next action, open the real STAR lesson, and retry the same interview
with the focused goal visible.

Files changed: `src/components/EvaluationFeedback.tsx`,
`src/components/InterviewSimulator.tsx`, `src/lib/evaluation/rubric.ts`,
`src/app/globals.css`, `tests/EvaluationFeedback.test.tsx`,
`tests/InterviewSimulator.test.tsx`, and the required project documentation.

Known limitations: Evaluation persistence and attempt comparison remain for
Phase 8. No hosted deployment configuration is present in this repository.

## Contribution 006 — Attempt History, Comparison, and Progress Dashboard

Date: 2026-07-16

Feature: Persisted evaluated attempts, browsable attempt history, rubric-level
comparison, and a real-activity progress dashboard.

Problem: Completed transcripts were stored, but validated evaluations existed
only in active component state. The Progress Library was a placeholder and
could not open attempts, compare rubric evidence, show learning completion, or
recommend the next real activity.

Codex inspected: Attempt contracts and validation, local attempt storage,
evaluation parsing and simulator lifecycle, course and exercise progress stores,
lesson and exercise catalogs, the existing Progress Library page, responsive
styles, tests, and Phase 8 documentation requirements.

Codex proposed: Keep the existing storage version backward-compatible; attach
only revalidated evaluation data to attempts; implement calculations as pure
functions; compare chronologically at criterion level; and treat every score
change as evidence from one selected pair rather than a broad improvement claim.

Codex implemented: Validated evaluation persistence, retry-goal history,
progress calculations, recommended-next sequencing, compatibility checks,
rubric delta calculations, remaining-action selection, attempt history and
detail views, accessible comparison controls and table, dashboard counts,
responsive styling, and empty, loading, and storage-error states.

Commands executed: Focused Prettier formatting, ESLint, TypeScript strict type
checking, focused Vitest runs, the full Vitest suite, and the Next.js production
build.

Tests executed: No attempts, one attempt, two comparable attempts, incompatible
attempts, completed lesson and exercise counts, simulation and evaluation
counts, next-activity sequencing, attempt detail opening, comparison caution,
and validated evaluation persistence through the simulator.

Problems discovered: The installed Sites skill referenced a persistence guide
that was missing from its package. Codex used the repository's existing
versioned local-storage and validation patterns instead. TypeScript also required
an explicit post-ordering evaluation guard before comparing optional evaluation
records.

How Codex helped resolve them: Codex preserved backward compatibility, added
the explicit type and runtime guard, and verified the complete flow with 85
passing tests and a successful production build.

Human decisions: The project owner required real stored activity, restricted
comparison to the same skill or scenario, required specific remaining practice
areas, and prohibited broad improvement claims from isolated scores.

Result: Learners can open prior confirmed attempts, compare two related
validated attempts, inspect criterion-level changes and remaining actions, see
completed learning activities and simulation counts, and follow a next activity
derived from their actual stored work.

Files changed: `src/app/progress/page.tsx`,
`src/components/ProgressDashboard.tsx`, `src/components/InterviewSimulator.tsx`,
`src/lib/progress.ts`, `src/lib/interview/attempts.ts`,
`src/lib/interview/contracts.ts`, `src/app/globals.css`, progress and simulator
tests, and the requested project documentation.

Known limitations: Progress is device-local and comparison is limited to two
stored attempts with validated rubric data. No hosted deployment configuration
is present in this repository.

## Contribution 007 — Shared 2D Pixel-Game Design System

Date: 2026-07-16

Feature: Reference-matched shared design tokens, reusable game UI primitives,
and a consistent top HUD.

Problem: The application had reusable pixel components, but its global shell
still used a spacious modern navigation bar, mixed warm paper panels with dark
surfaces, oversized headings, and inconsistent density. Individual pages could
not be restyled coherently without a stronger shared foundation.

Codex inspected: `AGENTS.md`, the attached 12-screen UI reference, UX guidance,
implementation plans, the root layout, navigation, global styles, all shared
pixel primitives, responsive style contracts, and component tests.

Codex proposed: Isolate the new visual contract in a dedicated stylesheet loaded
after legacy page styles; alias existing color and spacing variables to the new
tokens; keep page components unchanged; and add missing card, input, tabs, and
HUD-stat primitives before any page-specific redesign.

Codex implemented: Navy game tokens, blue-gray inner highlights, hard black
offset shadows, compact spacing and typography, green actions, yellow HUD and
progress accents, square shared controls, the contextual back/XP/level HUD,
keyboard-operable tabs, labeled inputs, compact cards, HUD stats, and back/star
icons.

Commands executed: Focused Prettier formatting, ESLint, TypeScript strict type
checking, focused Vitest runs, the full Vitest suite, production build, and diff
integrity checks.

Tests executed: Existing shared-component accessibility tests, global navigation
route/current-page behavior, contextual back navigation, XP and level HUD,
keyboard tab navigation, labeled input descriptions, token presence, compact
dimensions, square corners, hard borders, and the absence of gradients and glass
effects in the shared layer.

Problems discovered: The first square-corner style assertion allowed regular
expression backtracking to misclassify `border-radius: 0`. Codex replaced it
with explicit value extraction and reran the focused suite successfully.

How Codex helped resolve them: Codex separated the new system from the large
legacy stylesheet, preserved working route and business components, added
accessible APIs for missing primitives, and verified the final integration with
90 passing tests and a successful production build.

Human decisions: The project owner supplied the reference and required a dense,
dark navy pixel-game UI with green actions, yellow HUD accents, square corners,
minimal empty space, and no page-specific redesign in this milestone.

Result: Every route now inherits the same compact global game shell and shared
primitive language, while later page redesigns can use a stable reusable token
and component foundation.

Files changed: `src/app/pixel-system.css`, `src/app/layout.tsx`,
`src/components/MainNav.tsx`, shared pixel component files, design-system tests,
and synchronized project documentation.

Known limitations: Page-specific compositions and legacy decorative artwork
were intentionally not redesigned. No hosted deployment configuration is
present in this repository.

## Contribution 008 — Landing Page Game Title Screen

Date: 2026-07-16

Feature: Reference-matched full-screen nighttime academy landing page.

Problem: The root route displayed the academy directory directly and read like
an application hub. The approved reference instead begins with a focused game
title screen built around the AMEEGO identity and one entry action.

Codex inspected: The approved UI reference, `AGENTS.md`, the existing root page,
shared pixel design tokens and button behavior, global backdrop, Academy Map,
product Start Learning requirement, route inventory, tests, and project plans.

Codex proposed: Replace only `src/app/page.tsx`; isolate all page visuals in a
CSS module; create the rich academy background with CSS pixel shapes; hide
global chrome only when the title screen is mounted; and preserve Start Learning
through a real application destination. The later Academy Hub milestone moved
that entry destination to `/academy` while preserving the learning flow.

Codex implemented: The framed full-height night scene, large hard-shadow AMEEGO
logo, academy subtitle, three-line tagline, green Enter Academy action, clock
tower and side buildings, lit window grids, doors, central path, hills, lamps,
trees, shrubs, moon, clouds, stars, and responsive scene simplification.

Commands executed: Focused Prettier formatting, ESLint, TypeScript strict type
checking, focused Vitest runs, the full Vitest suite, production build, and diff
integrity checks.

Tests executed: Landing title content, preserved entry action, removal of hub
directory content from the title screen, full-height frame contract, required
decorative scene elements, prohibited style checks, tablet/mobile rules, shared
navigation regression tests, Academy Map regression tests, and the full suite.

Problems discovered: No previous Start Learning button implementation survived
in repository history; only the product specification defined the action. Codex
initially used a real learning destination; the later authorized hub milestone
moved the action to `/academy`. The CSS-module global selectors were also
structured around the local landing class so their effects remain page-scoped.

How Codex helped resolve them: Codex traced repository history and product
requirements, selected a real learning destination, isolated the scene, and
verified that every existing route still builds and all 96 tests pass.

Human decisions: The project owner required a title-screen structure, nighttime
academy setting, decorative pixel campus, green entry action, reference fidelity,
preserved Start Learning behavior, and no changes to other pages.

Result: The application now opens like a pixel-game title screen and enters the
academy through one clear action, while every destination page remains
unchanged.

Files changed: `src/app/page.tsx`, `src/app/landing.module.css`, focused landing
tests, and synchronized project documentation.

Known limitations: The academy artwork is code-native CSS pixel scenery rather
than a hand-authored bitmap. No hosted deployment configuration is present in
this repository.

## Contribution 009 — Academy Hub Pixel Campus

Date: 2026-07-16

Feature: Reference-matched top-down Academy Hub and route-safe campus navigation.

Problem: The title screen needed a separate campus destination, and the existing
Academy Map component presented a directory/card composition rather than the
dense environmental map shown in panel 2 of the approved reference.

Codex inspected: `AGENTS.md`, the approved UI reference, route inventory,
academy location data, shared HUD and icon primitives, landing flow, current
Academy Map tests, responsive design contracts, and product documentation.

Codex proposed: Add a scoped `/academy` route; create every building and terrain
detail with code-native pixel CSS; connect only available destinations to real
routes; keep unfinished areas visibly non-interactive; and change the landing
entry link to the new hub without touching destination page layouts or business
logic.

Codex implemented: A hard-framed full-height campus with a compact academy HUD,
Interview Center, Speech Hall, Progress Library, Courtyard, lit window grids,
roofs and steps, grass plots, crossing paths, plaza, pond, terrain pixels,
fences, lamps, trees, directional signs, and a three-item bottom navigation.

Commands executed: Focused Prettier formatting, focused Vitest tests, ESLint,
TypeScript strict type checking, the full Vitest suite, production build, and
format verification.

Tests executed: Academy HUD and location rendering, real Interview Center,
Progress Library, Courses, and Progress routes, absence of fake Speech Hall,
Courtyard, and Settings links, landing-to-hub navigation, full-screen frame
contract, environmental selectors, prohibited-style checks, responsive rules,
and the complete regression suite.

Problems discovered: The application had no separate academy route, and Settings,
Speech Hall, and Courtyard had no real destinations. Initial linting also found
invalid `aria-disabled` attributes on semantic regions.

How Codex helped resolve them: Codex added the smallest route needed to restore
the reference flow, linked only existing destinations, represented unfinished
areas as clear non-links, replaced invalid accessibility attributes with valid
non-interactive semantics, and verified all 103 tests across 30 files.

Human decisions: The project owner required a panel-2 campus composition,
specific buildings and environmental details, compact HUD and bottom navigation,
real route preservation, and no redesign of other pages.

Result: Enter Academy now opens a dense game-world campus that routes learners
to existing course, practice, and progress experiences without inventing
unavailable functionality.

Files changed: `src/app/academy/page.tsx`,
`src/app/academy/academy.module.css`, the landing entry route, focused Academy
Hub and landing tests, and synchronized project documentation.

Known limitation: Browser-backed visual and console inspection was unavailable
in this environment. The hub uses code-native CSS pixel art rather than a bitmap.

## Contribution 010 — Courses and STAR Lesson Pixel Menus

Date: 2026-07-16

Feature: Reference-matched Courses menu and STAR lesson cover with preserved
education and progress behavior.

Problem: The Courses route used a large featured-lesson card and environmental
scene, while the STAR lesson opened with a spacious reading composition. Panels
3 and 4 require a dense module menu and a focused lesson-cover screen.

Codex inspected: `AGENTS.md`, panels 3 and 4, course content types, the course
system specification, localStorage completion utilities and hook, Courses and
Lesson components, shared portrait/button/HUD primitives, route loading states,
tests, global styling interactions, and project plans.

Codex proposed: Keep the existing course content and persistence APIs; render
the four documented modules as a compact menu; calculate progress only from the
published lesson; add a real learner portrait panel; build an original CSS STAR
illustration; and retain the complete lesson after a panel-4-style cover.

Codex implemented: A four-row numbered course menu, truthful completion counts,
Coming Soon module states, stored progress readout and bar, pixel learner
portrait, guide message, Lesson 2.1 badge, short summary, objectives checklist,
large yellow STAR illustration, green in-page continuation action, dense STAR
step panels, paired examples, summary, completion controls, and responsive rules.

Commands executed: Focused Prettier formatting, focused Vitest runs, ESLint,
TypeScript strict type checking, the full Vitest suite, production build, and
changed-file formatting verification.

Tests executed: Module names and availability, real STAR link, `0/1` count,
zero-state progress, learner portrait, loading/empty/error states, lesson badge,
summary, objectives, illustration caption, Continue Lesson anchor, all STAR
content, exercise link, keyboard completion, localStorage persistence, `1/1`
and 100% completed state, course-to-hub back navigation, responsive layout, and
prohibited-style contracts.

Problems discovered: Only one lesson is published even though four course
modules are documented, so the reference's sample progress counts could not be
used honestly. Existing tests also encoded the removed featured-card labels.

How Codex helped resolve them: Codex mapped the single real lesson to the STAR
module, represented unpublished modules as `0/0` Coming Soon non-links,
calculated progress from real storage, and updated tests to assert behavior and
data integrity rather than obsolete presentation copy.

Human decisions: The project owner requested close panel-3/4 structure, compact
module and lesson layouts, a learner portrait, a large original STAR visual,
preserved logic, and no oversized modern cards or unused space.

Result: Courses now reads like a compact game menu, and the STAR lesson opens
like a game lesson screen while retaining the complete educational flow and all
existing persistence behavior.

Files changed: `src/components/CourseOverview.tsx`,
`src/components/StarLesson.tsx`, `src/components/course-pages.module.css`, the
Courses back destination in `src/components/MainNav.tsx`, focused tests, and
synchronized project documentation.

Known limitation: Browser-backed visual and console inspection was unavailable
in this environment; the original STAR illustration is code-native CSS art.

## Contribution 011 — STAR Exercise Pixel Arrangement Board

Date: 2026-07-16

Feature: Reference-matched STAR arrangement exercise with preserved multimodal
interaction and persistence.

Problem: The exercise used a large learning-room scene and vertically stacked
paper-like answer cards. Panel 5 calls for a compact game board with four dashed
slots, small STAR tiles, and opposing Reset and Check actions.

Codex inspected: `AGENTS.md`, panel 5, the exercise route and content, all React
state and event handlers, drag-to-target and index-move validation helpers,
exercise progress storage and recovery, focused component tests, responsive
style tests, shared HUD/buttons/panels, and project documentation.

Codex proposed: Preserve every existing handler and hook; remove only the old
visual composition; represent the current ordered list as four dashed slots;
place one lettered draggable tile in each slot; add scoped drag, drop, focus,
tablet, and mobile styles; and retain all detailed feedback after validation.

Codex implemented: A hard-framed navy exercise panel, compact instructions,
four dashed slots, S/T/A/R tile letters, segment copy, 44px arrow controls,
dragging and drop-target classes, focus-within treatment, Reset and Check
actions, compact saved-progress state, dense feedback panels, and responsive
four/two/one-column behavior.

Commands executed: Focused Prettier formatting, focused Vitest runs, ESLint,
TypeScript strict type checking, the full Vitest suite, production build, and
changed-file formatting verification.

Tests executed: Initial four-slot rendering, all STAR labels and letters, mouse
drag targeting without duplicates, visible drag/drop class changes, keyboard
reordering and validation, tab order, move labels, minimum touch target styles,
incorrect guidance, retry, correct continuation route, saved completion after
remount, corrupt-progress recovery, core validation helpers, responsive layouts,
strong focus states, and prohibited visual styles.

Problems discovered: The existing responsive test was still tied to obsolete
global exercise selectors. The reference's apparent empty slots also conflict
with the established reorder model, where the four answer segments must remain
available and movable at all times.

How Codex helped resolve them: Codex moved the style contract to the new scoped
module and made each dashed slot the container for its current draggable tile.
This preserves every input mode and avoids duplicating or hiding interactive
segments while still matching the reference's board structure.

Human decisions: The project owner required the panel-5 layout, four dashed
slots, movable lettered tiles, compact actions, strong focus/drag states, shared
pixel HUD styling, and complete preservation of mouse, touch, keyboard,
validation, retry, and persistence behavior.

Result: The STAR exercise now reads as a compact game puzzle without regressing
any interaction path, educational feedback, saved completion, or recovery state.

Files changed: `src/components/StarArrangementExercise.tsx`,
`src/components/star-exercise.module.css`, focused exercise component and style
tests, and synchronized project documentation.

Known limitation: Browser-backed visual and console inspection was unavailable
in this environment.

## Contribution 012 — Interview Preparation Pixel Forms

Date: 2026-07-16

Feature: Reference-matched Interview Setup, Resume Upload, and Profile Review
states with preserved validation and navigation.

Problem: The first three `/practice` states shared a large simulator header,
eight-step progress bar, lobby scene, and spacious general-purpose form panels.
Panels 6, 7, and 8 require dense game-menu forms, a dedicated upload workspace,
and a two-column final review.

Codex inspected: `AGENTS.md`, panels 6–8, the complete InterviewSimulator state
machine, setup contracts and validation, résumé type/size validation and API,
manual fallback, editable résumé profile component, question generation and
fallback, downstream mode/interview flow, existing integration tests, global
styles, shared pixel inputs/buttons/icons, and project documentation.

Codex proposed: Add one scoped preparation CSS module; activate it only for
setup/resume/review; keep all existing validation and transition functions;
replace radio groups with accessible enum step controls; add a real selected-file
panel and temporary local preview; and reorganize confirmed setup and editable
résumé data into reference-matched columns.

Codex implemented: Compact setup rows, custom dropdown indicator, dark inputs,
yellow labels, difficulty/length controls, dashed upload zone, uploaded filename
and size, temporary Preview, state-and-input Remove, extraction Continue,
manual-text box, left-side interview details, right-side icon résumé editors,
no-résumé state, Start Interview presentation, scoped HUD simplification, and
responsive stacking.

Commands executed: Focused Prettier formatting, focused Vitest runs, ESLint,
TypeScript strict type checking, the full Vitest suite, production build, and
changed-file formatting verification.

Tests executed: Setup validation, select value, difficulty and length stepping,
green Continue action, file selection, uploaded panel, local preview target,
file removal and native input clearing, extraction failure, manual résumé entry,
editable Experience field, résumé removal, no-résumé continuation, left/right
review headings and values, green Start Interview action, AI question failure
fallback, full text interview completion, dark-input style, dashed zone, icon
summary structure, responsive stacking, and prohibited styles.

Problems discovered: The three requested pages are states inside one component,
not separate routes. The prior UI also had no file Preview or explicit selected-
file Remove action, and changing only React state would leave the native file
input populated.

How Codex helped resolve them: Codex scoped the design by state rather than route,
used a temporary object URL for local-only Preview, cleared both file state and
the input ref on Remove, preserved the extraction API and all downstream state,
and verified the complete simulator regression suite.

Human decisions: The project owner required panels 6–8, compact pixel forms,
dark inputs and yellow labels, dropdown and step controls, upload/file/manual
résumé surfaces, two-column profile review, green actions, and preservation of
validation, upload, editing, and navigation behavior.

Result: Interview preparation now reads as three focused game-menu screens while
the validated context, résumé editing, AI question generation, and complete
interview flow continue through their original business logic.

Files changed: `src/components/InterviewSetupForm.tsx`,
`src/components/ResumeProfileEditor.tsx`,
`src/components/InterviewSimulator.tsx`,
`src/components/interview-preparation.module.css`, focused integration and style
tests, and synchronized project documentation.

Known limitation: Browser-backed visual and console inspection was unavailable
in this environment.

## Contribution 013 — Interview Simulator Pixel Room

Date: 2026-07-16

Feature: Reference-matched active Interview Simulator with neutral, calculated
session indicators and preserved transcript confirmation.

Problem: The active simulator used a generic office backdrop and spacious card
composition. Panel 9 requires a dense interview-game HUD, detailed room, bottom
response console, optional camera panel, and right-side analysis without the
reference's unsupported confidence, emotion, eye-contact, nerves, or
employability claims.

Codex inspected: `AGENTS.md`, the panel-9 reference, UX simulator requirements,
the complete `/practice` state machine, question and transcript validation,
speech-recognition lifecycle, attempt persistence, evaluation boundaries,
existing character and pixel primitives, integration tests, global styles, and
project documentation.

Codex proposed: Scope a new CSS module to only interview/confirm; extract a
focused session view and room scene; keep the existing response-review-confirm-
save transitions; derive every analysis value from component state; measure
speaking time only during active recognition; label filler counting as a draft
scan; and make End non-saving.

Codex implemented: A question/timer HUD, Learning Progress, detailed original
pixel room, current-question speech bubble, original neutral interviewer,
microphone/text console, optional camera placeholder, Session Analysis list,
calculated speaking duration and filler-word count, visible End/Next actions,
responsive layouts, focus states, and accessible names and announcements.

Commands executed: Focused Prettier formatting, focused Vitest runs, ESLint,
TypeScript strict type checking, full Vitest suite, production build, and
explicit changed-file formatting verification. The repository-wide Prettier
script was also run and exposed the workspace-root symbolic-link limitation.

Tests executed: Complete no-resume text flow, current-question progression,
transcript validation and editing, confirmation and attempt saving, retry and
API failure regressions, Learning Progress semantics, room and interviewer
labels, response-state and filler-scan calculation, non-saving End navigation,
privacy copy, prohibited-indicator absence, hard pixel framing, requested room
details, responsive stacking, strong focus, and prohibited-style checks.

Problems discovered: The visible response-panel heading initially duplicated
the textarea's accessible label for a broad test query, and the original
simulator import list retained one unused progress primitive after extraction.
The full Prettier command also treats the environment's `.` pattern as a
symbolic link.

How Codex helped resolve them: Codex gave the response section a distinct
accessible name, preserved the textarea label, removed the stale import, reran
focused and repository-wide validation, and used explicit file lists for the
formatting check without changing the project script.

Human decisions: The project owner required panel 9's composition and room
detail, Learning Progress naming, optional camera, End/Next actions, no inferred
human-state or employability scoring, and preservation of all simulator logic.

Result: The active simulation now looks and operates like the reference game
screen while every displayed analysis value is observable or calculated and
the educational confirmation/persistence flow remains intact.

Files changed: `src/components/InterviewSimulator.tsx`,
`src/components/InterviewSessionView.tsx`,
`src/components/InterviewRoomScene.tsx`,
`src/components/interview-session.module.css`, focused simulator tests, and
synchronized project documentation.

Known limitation: Browser-backed visual and console inspection was unavailable
in this environment.

## Contribution 014 — Feedback, Progress, and Settings Pixel Panels

Date: 2026-07-16

Feature: Reference-matched panels 10–12 using validated feedback and real local
learning activity.

Problem: Feedback was educationally complete but visually long and paper-like;
Progress had history and comparison but not the compact reference overview;
Settings did not exist. The reference also contains XP, level, streak, and skill
bars that could not be copied as fictional values.

Codex inspected: `AGENTS.md`, the reference panels, feedback validation and
lesson lookup, the complete report order, progress storage formats, attempt
history/comparison logic, course and exercise completion records, navigation,
existing tests, shared pixel primitives, and design documentation.

Codex proposed: Preserve the Feedback DOM order and actions while applying a
compact panel grid; derive Progress metrics from stored records; treat rubric
bars as averages of validated evaluations only; transparently mark missing
lesson/exercise timestamps; add a device-local versioned learner profile; and
put confirmations in front of both destructive settings actions.

Codex implemented: Panel-10 feedback styling and headings; a panel-11 overview
with four real metrics, rubric bars, activity log, and recommendation; XP,
level, streak, recent-activity, and skill calculations; panel-12 Settings with
profile persistence, portrait, XP bar, navigation, confirmed clear/reset
behavior; a Settings route and route wiring; responsive/focus styles; and
focused integration, calculation, navigation, and style-contract tests.

Commands executed: Focused Prettier formatting and checks, focused Vitest runs,
ESLint, strict TypeScript checking, the full Vitest suite, production build, and
the repository-wide formatting check.

Tests executed: Valid/invalid feedback and retry behavior, report order and
panel headings, empty and populated progress, rubric averages, activity XP,
level and streak calculations, attempt opening and comparison, Settings default
and saved profiles, Clear Progress profile preservation, Reset All Data,
confirmation dialogs, Academy and main-nav routing, responsive layout, focus,
square corners, and prohibited style checks.

Problems discovered: The existing Settings destination was intentionally
disabled because no page existed. A first progress UI assertion incorrectly
expected a skill bar for an unevaluated attempt, and the repository-wide format
check includes five unrelated documents that were already unformatted.

How Codex helped resolve them: Codex added the real route before enabling the
destination, kept unevaluated attempts in the honest “no skill bars yet” state,
moved the rubric assertion to validated attempts, and verified every changed
file explicitly without rewriting unrelated user documentation.

Human decisions: The project owner requested close panel-10/11/12 composition,
specific feedback sections, progress metrics and activity, learner profile and
XP, destructive settings actions, and preservation of all existing data and
behavior.

Result: Feedback, Progress, and Settings now share a dense coherent pixel-game
composition, with every displayed result grounded in validated feedback or real
stored activity and all prior educational/history flows preserved.

Files changed: Feedback, Progress, Settings, navigation and progress-calculation
source files; focused tests; and synchronized project documentation.

Known limitation: Live browser screenshot inspection was not requested. The
repository-wide format check remains red only for five pre-existing unrelated
files; explicit checks pass for all files changed in this milestone.

## Contribution 015 - Cross-Page Pixel Visual Consistency Pass

Date: 2026-07-16

Feature: Reference-based visual normalization across all implemented pages and
practice states without product or route changes.

Problem: The individual reference panels were implemented, but shared chrome
still exposed a website-style navigation bar and footer. Outer widths, large
hard-shadow offsets, page padding, control heights, and the interview mode and
completion states also varied enough to weaken the single-game-screen illusion.

Codex inspected: `AGENTS.md`, the full 12-panel reference, all route entry
points, shared pixel tokens and primitives, every page-scoped CSS module,
responsive breakpoints, current style-contract tests, development-server route
output, and the latest development log.

Codex proposed: Treat the reference as one compact frame specification; correct
the global HUD first; normalize dimensions and shadows through shared tokens;
then tighten the few route-specific outliers while preserving state and data
logic.

Codex implemented: A 44px two-column internal HUD, hidden website navigation
and footer chrome, a 1120px shared content width, normalized 4px and 6px hard
shadows, consistent 36px buttons and 38px inputs, aligned Progress and Settings
framing, and compact pixel treatment for response-mode and completion panels.
No route, API, persistence, scoring, recommendation, retry, or simulator state
logic changed.

Commands executed: Static style audit with ripgrep, eight-route HTTP render
checks against the local Next.js server, development-log review, targeted
Prettier formatting, focused style-contract tests, ESLint, strict TypeScript
checking, the full Vitest suite, production build, and repository formatting
verification.

Tests executed: Shared token/HUD/control contracts; Landing, Academy, Courses,
Lesson, Exercise, preparation, simulator, Feedback, Progress, and Settings style
contracts; complete interaction and data regression suites; and production
route generation.

Problems discovered: The in-app browser runtime had no available backend even
after its documented connection retry. The local server also exposed an active
Next.js smooth-scroll warning, and several visual contract tests still encoded
the earlier 48px HUD, 5px shared shadow, and 7px page shadow values.

How Codex helped resolve them: Codex continued with the supported source,
component, route-render, and log audit; removed the obsolete smooth-scroll
declaration; updated visual contracts to the normalized metrics; and reran the
full validation suite. It did not substitute unsupported standalone browser
automation after the browser backend was confirmed unavailable.

Human decisions: The project owner requested a close full-product consistency
pass, no new features, removal of remaining generic SaaS styling, preservation
of behavior, screenshot comparison when available, full validation, and an
explicit placeholder report.

Result: Every implemented surface now shares the same compact navy frame,
square controls, yellow/green accents, typography scale, dense spacing, and
hard-shadow rhythm. All routes and regressions pass; screenshot-level comparison
remains the only unavailable validation layer.

Files changed: Shared pixel and legacy global styles; Academy, Courses/Lesson,
Exercise, interview preparation/session, Progress, and Settings style modules;
focused visual contract tests; and synchronized project documentation.

Known placeholders: The shared and Academy HUD XP/level values remain zeroed;
Speech Hall and five non-Profile Settings sections remain Coming Soon; the
optional camera preview remains intentionally disabled; and Progress/Feedback
empty states remain until real stored activity and validated evaluation data
exist.

Known validation limitation: Repository-wide `format:check` remains red only
for the same five pre-existing unrelated files: `AGENTS.md`,
`docs/AI_EVALUATION.md`, `docs/ARCHITECTURE.md`, `docs/COURSE_SYSTEM.md`, and
`docs/PRODUCT_SPEC.md`. Explicit formatting passes for all files changed in this
milestone.

## Contribution 016 - Ameego-Native Intelligent Experience

Date: 2026-07-16

Feature: Provider-neutral learner copy and a sanitized personalization/feedback
failure boundary.

Problem: The learner interface named a specific model in question-generation,
feedback, success, retry, and failure states. The question and resume routes
also returned internal service error messages, and the client copied route
errors directly into alerts. Configuration names, provider status, rate-limit
messages, or malformed response details could therefore interrupt the academy
experience and expose implementation details.

Codex inspected: Every model/provider string in `src`, all three interview API
routes, the client fetch and parsing paths, personalization fallback behavior,
feedback validation and storage failures, user-facing tests, and the Product,
UX, Plans, Decision Log, and Codex workflow documentation.

Codex proposed: Keep implementation-specific diagnostics inside protected
server modules; map failures to a small public Ameego vocabulary; never render a
server-supplied error string; preserve existing safe fallback and retry paths;
and test with deliberately hostile configuration and rate-limit messages.

Codex implemented: Shared Ameego product messages, friendly public route errors,
neutral public feedback codes, safe response parsing, generic client failure
mapping, Personalized Interview success copy, Interview Coach feedback branding,
Retry Generation/Feedback actions, and Continue with Standard Interview. Resume
manual entry, standard questions, saved attempts, validated feedback, and retry
state remain intact.

Tests added or updated: Personalized success copy; resume failure with a raw
provider/rate-limit payload; question personalization failure with an API-key
payload; standard-interview continuation; feedback failure with provider,
status, and rate-limit payloads; branded valid feedback; public question,
resume, and feedback route responses; and malformed request language.

Human decisions: The project owner required every intelligent capability to
feel native to Ameego and prohibited all user-facing model, provider, API-key,
technical error, raw JSON, stack trace, and rate-limit language.

Result: Learners encounter Ameego's Personalized Interview, Intelligent
Feedback, Interview Coach, Adaptive Practice, and standard-question fallback;
they never see the underlying provider or its technical failure text.

Commands executed: Repository-wide terminology audit, focused Prettier
formatting, focused Vitest tests, ESLint, TypeScript strict type checking, the
full Vitest suite, production build, changed-file formatting verification, and
the repository-wide formatting check.

Validation result: ESLint passed; strict type checking passed; all 136 tests
passed across 36 test files; and the production build generated every public
page and protected interview service route. Changed-file formatting passed.
Repository-wide formatting had five previously documented warnings before this
milestone. Because `docs/PRODUCT_SPEC.md` was updated here, it was fully
formatted; four unrelated warnings remain in `AGENTS.md`,
`docs/AI_EVALUATION.md`, `docs/ARCHITECTURE.md`, and `docs/COURSE_SYSTEM.md`.

Files changed: The three interview route boundaries, shared product messages,
Interview Simulator, Feedback Report, focused service and UI tests, Product and
UX specifications, Plans, Decision Log, and this workflow record.

## Contribution 017 - Indie Pixel-Game Frontend Polish

Date: 2026-07-16

Feature: Whole-frontend visual, motion, accessibility, and environmental polish
without new core product behavior.

Problem: The full product already used the shared navy pixel system, but motion,
environment density, preparation guidance, feedback reward language, and
cross-route immersion were uneven. Several screens were visually static and the
preparation workflow did not fully communicate that Setup, Resume, and Review
form one guided academy journey.

Codex inspected: `AGENTS.md`; the Product, UX, course, plan, decision, and Codex
workflow documentation; every public route; shared pixel primitives; all page
CSS modules; the complete interview state machine; stored progress semantics;
responsive style contracts; reduced-motion behavior; and learner-facing service
language.

Codex proposed: Keep every route and state transition intact; treat wizard,
reward, achievement, theme, accessibility, and privacy requests as presentation
of existing state; use decorative code-native pixel art only; add stepped motion
with a global reduced-motion escape hatch; and never invent XP, evaluation,
camera, confidence, or progress data.

Codex implemented: Shared stepped transitions and route entry, animated title
screen atmosphere, a denser campus with flowers/benches/NPC silhouettes/banners,
a visual three-stage interview-preparation track, the existing coach lobby on
all preparation screens, real profile-review badges, richer interview-room
props, interviewer blink and breathing, animated speech and neutral status
elements, progress/reward reveals, a validated-feedback completion ribbon, and
profile-oriented Settings summaries grounded in current device behavior.

Accessibility work: Preserved keyboard/touch control paths and accessible form
labels; strengthened focus-visible treatment; marked environmental art as
decorative through its hidden parent regions; kept paragraph/form fonts
readable; prevented color-only setup progress labels; and globally disables
nonessential animation for reduced-motion users.

Validation executed: Changed-file Prettier formatting, learner-language audit,
ESLint, strict TypeScript checking, the full Vitest suite, production build,
eight-route HTTP rendering, and repository-wide formatting verification.
Browser screenshot comparison could not run because the supported in-app
browser had no available backend.

Validation result: ESLint and strict TypeScript passed; all 136 tests passed
across 36 files; the Next.js production build generated all eight public pages
and three protected interview routes; and every public page returned HTTP 200
from the production server. All changed files are formatted. The repository-wide
format check continues to report only four pre-existing unrelated files:
`AGENTS.md`, `docs/AI_EVALUATION.md`, `docs/ARCHITECTURE.md`, and
`docs/COURSE_SYSTEM.md`.

Result: The full academy now reads as one compact indie game from title screen
through learning, preparation, simulation, feedback, progress, and profile
management. Existing functionality, routes, persistence, validated evaluation,
and real-data progress semantics remain unchanged.

Known placeholders: Speech Hall and non-Profile Settings sections remain Coming
Soon; the camera preview remains intentionally optional and disabled; and the
shared HUD retains zeroed status until a single real persisted player-status
source is introduced in a future scoped feature.
