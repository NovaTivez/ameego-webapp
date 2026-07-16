# Decision Log

Record important product and technical decisions.

Only record decisions that actually occurred.

---

## Decision Template

Decision ID:

Date:

Status:

Context:

Decision:

Alternatives considered:

Reason:

Codex contribution:

Human decision:

Consequences:

---

## Decision 001 — Education-First Product

Status:

Accepted

Context:

The initial concept focused primarily on an AI interview simulator.

Decision:

The project will be an educational communication training platform with
structured lessons, exercises, simulations, personalized feedback, retries,
and progress tracking.

Reason:

This creates a more credible educational product and addresses the learner's
need for instruction as well as practice.

Consequences:

The simulator must connect to courses and learning objectives.

---

## Decision 002 — Focused Hackathon MVP

Status:

Accepted

Context:

The complete product vision includes interview training, public speaking,
academic communication, and professional communication.

Decision:

Complete the Interview Foundations learning track before expanding other
learning tracks.

Reason:

A polished end-to-end experience is more valuable for judging than several
incomplete features.

Consequences:

The primary demo will focus on:

STAR lesson
→ Exercise
→ Interview simulation
→ GPT-5.6 feedback
→ Recommendation
→ Retry
→ Progress comparison.

---

## Decision 003 — Rubric-Based GPT-5.6 Evaluation

Status:

Accepted

Context:

Generic AI feedback can be inconsistent and difficult to explain.

Decision:

GPT-5.6 evaluations must use predefined educational rubrics and validated
structured outputs.

Reason:

The learner should understand why feedback was given and what action to take.

Consequences:

Every score requires explanation, transcript evidence, and an improvement action.

---

## Decision 004 — No Emotion Recognition

Status:

Accepted

Context:

The reference interface displayed confidence and nerves scores.

Decision:

The application will not infer emotions, honesty, personality, intelligence,
or employability from webcam footage.

Reason:

These conclusions are unnecessary for the educational goal and may be unreliable.

Consequences:

Optional webcam analysis will use neutral observable indicators only.

---

## Decision 005 — Validated Guidance-First Feedback and Contextual Retry

Date: 2026-07-15

Status: Accepted

Context: The feedback experience needed to teach a learner what to do next,
connect transcript evidence to rubric criteria, link recommendations to real
course content, and support a focused retry without discarding the scenario.

Decision: Render a report only after the evaluation has passed the existing
request and structured-output validation. Resolve recommended lesson IDs through
the application lesson registry. Display scores as compact supporting metadata,
then preserve the role, organization, generated questions, and AI-provided
practice goal when the learner retries.

Alternatives considered: Trusting the API response directly in the component;
linking every recommendation to a generic course route; restarting from an empty
setup form; or emphasizing a single aggregate score.

Reason: The chosen approach preserves the educational trust boundary, makes
evidence easier to audit, maintains continuity between feedback and practice,
and keeps the learning guidance more prominent than scoring.

Codex contribution: Codex traced the schema, lesson content, simulator state,
and tests; proposed the registry and partial retry reset; implemented the flow;
and validated it with unit, integration, accessibility-oriented, and production
build checks.

Human decision: The project owner required validated evaluation data, the exact
report order, criterion-linked evidence, a real lesson link, and scenario-aware
retry behavior.

Consequences: Unknown lesson IDs cannot produce a learner-facing report. Retry
attempts reuse the confirmed scenario and questions while clearing prior answers
and evaluation state. Persisted reports and attempt comparison remain separate
follow-up work.

---

## Decision 006 — Shared Compact Pixel-Game Foundation Before Page Redesign

Date: 2026-07-16

Status: Accepted

Context: The approved reference uses one consistent compact game-client shell
across landing, course, lesson, exercise, simulator, feedback, progress, and
settings screens. Editing pages independently before defining the shared system
would risk visual drift and duplicated CSS.

Decision: Create a dedicated shared stylesheet and reusable primitive APIs
before redesigning any individual page. Load the new layer after legacy styles,
map existing variables onto the shared navy/blue-gray/green/yellow palette, and
limit component markup changes to the global top HUD and new reusable primitives.

Alternatives considered: Restyling each page immediately; rewriting the existing
global stylesheet; introducing an external component library; or retaining the
spacious modern navigation and warm paper-card system.

Reason: A token-first layer provides a stable visual contract, reduces page-level
duplication, preserves working behavior, and matches the reference more closely
without combining visual work with business-logic changes.

Codex contribution: Codex inspected the reference and shared architecture,
identified the smallest reusable component gaps, implemented the isolated token
layer and HUD, added accessible component APIs, and verified the system through
style-contract and interaction tests.

Human decision: The project owner explicitly required reusable components and
tokens first, prohibited page redesign and business-logic changes, and defined
the compact pixel-game visual constraints.

Consequences: Individual pages inherit the new shared palette, typography,
density, focus, and primitive styles immediately. Page-specific layout tuning is
deferred to later milestones and must reuse this contract rather than inventing
new visual systems.

---

## Decision 007 — Root Route as a Focused Game Title Screen

Date: 2026-07-16

Status: Accepted

Context: The approved reference separates the landing title screen from the
academy hub. The current route set has no separate academy-hub path, and the
request prohibited changes to other pages or routes.

Decision: Replace only the root route with a standalone full-screen title scene.
The action initially used `/learn`; Decision 008 later moved it to `/academy`
when the dedicated hub was authorized. Keep all artwork and chrome suppression
scoped to the landing CSS module.

Alternatives considered: Keeping the Academy Map below the title screen; adding
a new `/academy` route; moving the existing Academy Map to another page; using a
generated background bitmap; or retaining the shared HUD and footer on the title
screen.

Reason: A single focused scene matches the reference and game-title experience
most closely. Using a real product destination preserved working behavior
without expanding the original route scope, and code-native scenery remains
responsive and consistent with the existing pixel implementation.

Codex contribution: Codex traced the route and Start Learning history, proposed
the page-scoped implementation, built the accessible title screen and decorative
scene, added regression/style tests, and ran the full validation suite.

Human decision: The project owner specified the title-screen structure,
nighttime academy content, action styling, reference fidelity, and strict
single-page scope.

Consequences: The Academy Map component remains implemented and tested but is no
longer rendered on the root title screen. Enter Academy now opens the dedicated
Academy Hub described in Decision 008. Other routes retain the shared HUD and
their existing page composition.

---

## Decision 008 — Dedicated Academy Hub with Route-Safe Locations

Date: 2026-07-16

Status: Accepted

Context: The approved reference has a distinct Academy Hub between the title
screen and individual learning pages. The requested campus includes locations
that have real routes alongside Speech Hall, Courtyard, and Settings, which do
not yet have product routes.

Decision: Add `/academy` as a page-scoped top-down campus map. Route Interview
Center to `/practice`, Progress Library to `/progress`, Courses to `/learn`, and
the landing action to `/academy`. Render Speech Hall, Courtyard, and Settings as
clear non-links until real functionality exists. Keep XP at 0000 and level at 01
so the HUD does not claim unstored progress.

Alternatives considered: Replacing `/learn` with the hub, restoring the legacy
directory to `/`, linking unfinished locations to placeholders, generating one
fixed bitmap map, or changing the global navigation and destination pages.

Reason: A dedicated route most closely matches the reference flow while
preserving existing course, practice, and progress pages. Non-links avoid fake
functionality, and code-native layered scenery remains responsive, accessible,
and consistent with the established pixel system.

Codex contribution: Codex inventoried routes, designed and implemented the
campus, wired real destinations, added responsive and accessibility behavior,
fixed lint feedback, created focused rendering and style-contract tests, ran
the full validation suite, and synchronized documentation.

Human decision: The project owner requested the panel-2 Academy Hub, named its
required locations and environmental details, required bottom navigation and
the academy HUD, and prohibited changes to other page designs.

Consequences: The product now follows Title Screen → Academy Hub → Learning,
Practice, or Progress. Unfinished campus areas stay honest and non-interactive;
existing destination routes and business logic are unchanged.

---

## Decision 009 — Published-Lesson Progress Only in the Courses Menu

Date: 2026-07-16

Status: Accepted

Context: Panel 3 contains sample completion values across several modules, but
the current application publishes only the STAR Method lesson. The course
system document defines four modules without publishing their other lessons.

Decision: Present all four documented modules for course orientation, but make
only STAR Method interactive. Display `0/0` and Coming Soon for unpublished
modules. Calculate the course completion count and percentage solely from the
one published lesson and its validated localStorage completion state. Preserve
the complete STAR lesson below a new compact cover rather than removing existing
educational content to imitate a single reference frame.

Alternatives considered: Copying the reference's sample counts, inventing
placeholder lessons and routes, showing only one module, removing the detailed
lesson content, or changing the course data/persistence model during a visual
redesign.

Reason: This approach matches the reference structure without presenting fake
progress or unfinished features as real. It also keeps the educational value,
completion logic, and exercise route intact while limiting changes to page
presentation and a corrected course back destination.

Codex contribution: Codex compared the reference against the actual course data
and specification, identified the data-integrity conflict, implemented the
truthful module mapping and stored-progress calculation, preserved all lesson
sections and actions, and added behavior and style-contract tests.

Human decision: The project owner required preserved course and progress logic,
close panel-3/4 visual structure, compact density, and an original STAR pixel
illustration.

Consequences: The Courses page reports only real stored learning activity.
Future published lessons can replace the `0/0` states when they are added to the
course model; no migration or fabricated completion is introduced now.

---

## Decision 010 — Dashed Slots as Containers for Existing Movable Tiles

Date: 2026-07-16

Status: Accepted

Context: Panel 5 visually separates four empty dashed slots from four STAR
tiles. The implemented exercise is an ordered-list interaction in which all four
answer segments remain present and can be moved by drag, touch, or keyboard.
Creating a second visual tile tray would duplicate controls or require a new
placement state model during a presentation-only redesign.

Decision: Render the four current ordered positions as dashed answer slots, with
one existing movable tile inside each slot. Preserve the current order array,
drag handlers, up/down controls, validation, announcements, retry handler, and
progress hook unchanged. Add visual classes for the dragged tile, exact drop
target, and focus-within slot rather than changing interaction semantics.

Alternatives considered: Adding empty slots plus a duplicated tile tray,
rewriting the exercise as a placement model, supporting drag only, hiding the
segment text to mimic the reference, or modifying persisted progress data.

Reason: Slot containers match the reference composition while retaining one
canonical interactive element for each segment. This protects mouse, touch,
keyboard, validation, retry, persistence, and screen-reader behavior and keeps
the scope limited to the requested page redesign.

Codex contribution: Codex traced the complete interaction and persistence path,
preserved its handlers, rebuilt only the exercise markup and styling, replaced
obsolete global style tests, added drag/focus/slot assertions, and ran the full
validation suite.

Human decision: The project owner explicitly required four dashed slots,
movable STAR tiles, compact actions, strong focus and drag states, shared pixel
styling, and preservation of every existing input and progress behavior.

Consequences: Every ordered position is visibly a slot and every segment remains
continuously available. No data migration, duplicated control, or input-mode
regression is introduced.

---

## Decision 011 — Scope Preparation Styling by State and Preview Files Locally

Date: 2026-07-16

Status: Accepted

Context: Interview Setup, Resume Upload, and Profile Review are conditional
states in the single `/practice` InterviewSimulator rather than separate routes.
The requested redesign must not alter later mode, simulation, confirmation, or
feedback layouts. Resume Preview was requested, while raw files must remain
unpersisted and protected from browser progress storage.

Decision: Apply the compact preparation class only when `step` is setup, resume,
or review. Keep all existing validation, extraction, editing, generation, and
navigation handlers. Preview a selected file using a temporary browser object
URL opened in a new tab, revoke it after a bounded delay, and never place the raw
file or preview URL in persisted state. Clear both file state and the native
input value when Remove is selected.

Alternatives considered: Splitting the three states into new routes, applying
the compact styling to the entire simulator, embedding uploaded files as data
URLs, persisting previews, omitting Preview, or clearing only React state.

Reason: State-scoped presentation meets the “only these pages” requirement
inside the current architecture. Temporary object URLs provide useful local
preview without uploading or persisting extra data, and clearing the input ref
ensures selecting the same file again works predictably.

Codex contribution: Codex traced the state machine and file lifecycle, proposed
the scoped approach, implemented the three compositions and local preview,
preserved all original handlers, added interaction/style tests, and ran the full
validation suite.

Human decision: The project owner required the panel-6/7/8 layouts, specific
form, upload, and profile surfaces, green actions, and complete preservation of
validation, upload, editing, and navigation behavior.

Consequences: Only preparation states receive the new compact chrome. Raw résumé
files remain transient, downstream simulator states remain visually unchanged,
and no route, API contract, or persisted data format changes.

---

## Decision 012 — Derive Simulator Analysis from Observable Session State

Date: 2026-07-16

Status: Accepted

Context: Panel 9 visually includes confidence, face-tracking, eye-contact,
posture, clarity, and nerves indicators. The product safety rules prohibit
inferring confidence, nervousness, emotion, employability, or eye contact, and
the current application does not implement camera analysis. The redesign must
match the composition without presenting unsupported measurements.

Decision: Use the right analysis panel only for values computed from real local
session state: question index and count, response draft presence, confirmed
response count, seconds accumulated only while speech recognition is actively
listening, and a rule-based scan for `um`, `uh`, `erm`, `ah`, and `you know`.
Label the latter “Filler words (draft scan)” to communicate its limited method.
Keep the camera as an optional, disabled preview with explicit no-analysis
copy. Do not present interim rubric or final AI scores during answering.

Also make the visible Next action invoke the existing transcript validation and
confirmation step. Make End return to mode selection without constructing or
saving a completed attempt; preserve the scenario, generated questions, draft,
and already confirmed responses.

Alternatives considered: Recreating the reference's inferred human-state
scores, showing placeholder percentages, deriving speaking duration from total
session time, hiding the right panel, skipping transcript confirmation, or
saving an incomplete attempt when End is selected.

Reason: Observable local state satisfies the reference layout and provides
useful learner context without overstating what the system can know. Separating
active speaking time from total session time prevents a misleading duration,
and keeping confirmation protects the validated transcript and persistence
contract.

Codex contribution: Codex traced every session state and transition, identified
which reference values were unsupported, implemented calculated alternatives,
extracted the scoped panel-9 view and detailed room, preserved the full save and
retry paths, added focused tests, and ran repository-wide validation.

Human decision: The project owner explicitly prohibited fake confidence,
emotion, nerves, eye-contact, and employability scores and requested neutral
real indicators while preserving simulator logic.

Consequences: The simulator is compositionally close to panel 9 without human-
state inference. Filler counts remain a transparent local heuristic rather than
an AI evaluation, camera data remains absent, and incomplete sessions cannot be
mistaken for saved attempts.

---

## Decision 013 — Derive Dashboard XP, Level, Streak, and Skills from Stored Records

Date: 2026-07-16

Status: Accepted

Context: Panels 11 and 12 require XP, level, streak, and skill progress. Existing
storage contains completed lesson IDs, exercise completion/attempt count, and
timestamped interview attempts with optional validated evaluations. It does not
contain a generic player score, lesson timestamps, or inferred communication
ability.

Decision: Award deterministic local activity XP only for stored completions:
100 per known lesson, 75 per completed exercise, 150 per saved simulation, and
25 when that simulation has validated feedback. Each level requires 500 XP.
Calculate Current Streak only from consecutive UTC days containing saved
interview attempts and return zero when the latest attempt is older than
yesterday. Calculate each skill bar as the average rubric score across validated
evaluations and label it as a validated rubric average. Show no bar when none
exists.

Build Recent Activity from timestamped attempts first. Include completed lesson
and exercise records without inventing dates, explicitly stating when a
completion date is unavailable in the current storage format.

Store only the learner's name and focus in a new versioned device-local profile.
Clear Progress removes the three existing progress stores and preserves that
profile. Reset All Data removes those stores plus the profile, with confirmation
required for either action.

Alternatives considered: Copying the reference's fixed XP/level values, deriving
skills from one unvalidated transcript, using total score change as broad
improvement, fabricating dates for lessons/exercises, silently clearing all
local storage, or changing existing persistence schemas to add timestamps
during a presentation-only redesign.

Reason: Deterministic calculations make every progress indicator reproducible
from existing records without data migration or unsupported claims. Transparent
missing-date labels and validated-only rubric bars preserve educational and data
integrity.

Codex contribution: Codex traced every storage contract, designed the derived
metric model, implemented and tested calculations and settings persistence,
preserved comparison cautions, and documented the exact semantics.

Human decision: The project owner requested progress and Settings fields while
requiring all existing data and behavior to remain intact.

Consequences: XP and level are local engagement indicators rather than grades;
streak currently reflects interview practice days only; lesson and exercise
dates remain unknown until a future versioned storage migration records them;
profile reset behavior is explicit and test-covered.

---

## Decision 014 - Keep Intelligent Service Details Behind the Ameego Boundary

Date: 2026-07-16

Status: Accepted

Context: Personalized questions, resume assistance, and formative feedback use
protected server integrations. Returning internal error messages allowed model,
provider, API-key, status, rate-limit, parser, and response-validation details to
reach learner alerts. That breaks the native academy experience and exposes
implementation information that does not help the learner recover.

Decision: Preserve detailed integration errors only inside protected server
modules. Public routes return operation-specific Ameego messages and a minimal
neutral code only when the client needs to distinguish invalid feedback from a
temporary outage. Clients never render server-supplied error text; they map
network failures, non-success responses, and malformed payloads to trusted local
copy. Question personalization always offers Continue with Standard Interview.
Resume assistance always retains manual entry and skip paths. Feedback failures
preserve the completed attempt and offer Retry Feedback.

Alternatives considered: Displaying the provider response for easier debugging,
showing configuration instructions in the browser, returning provider-specific
status codes to the UI, or blocking the interview when personalization is
unavailable.

Reason: Learners need a clear recovery action, not infrastructure details.
Trusted product copy also prevents accidental exposure of credentials,
provider names, raw responses, or diagnostic content while preserving the full
learning loop during temporary service failures.

Consequences: Browser errors are intentionally less diagnostic. Developers use
server-side failure kinds and local logs for diagnosis. The learner experience
remains branded, safe, and continuous through standard questions, manual resume
entry, saved attempts, and retryable intelligent feedback.

---

## Decision 015 - Treat Whole-Frontend Polish as a Presentation-Only Layer

Date: 2026-07-16

Status: Accepted

Context: The requested whole-frontend refinement included wizard language,
achievements, XP rewards, themes, accessibility, privacy, coach characters, and
environmental animation while explicitly prohibiting new core features and
requiring all existing routes and behavior to remain intact. Some requested
labels could imply new persistence, scoring, personalization, or settings
capabilities that the current product does not implement.

Decision: Implement the refinement as a presentation layer over existing real
state. Setup, Resume, and Review are shown as the stages of the existing
preparation state machine rather than a new route system. Feedback may celebrate
a completed validated review but does not award invented XP or achievements.
Progress animation visualizes stored calculations only. Settings describes the
current theme, accessibility support, privacy boundary, and data controls but
does not present inactive controls as functional. Environmental art is
decorative and never replaces or changes a route target.

Motion uses stepped pixel timing, remains subtle enough to keep interactions
fast, and is disabled for reduced-motion users. Interviewer blink and breathing
are decorative character animation only; neutral session indicators remain
limited to question progress, response/transcript state, speaking duration, and
the transparent local filler-word count.

Alternatives considered: Adding a new wizard router, awarding decorative XP,
creating fake achievement records, exposing nonfunctional theme/privacy toggles,
adding inferred human-state scores, or delaying all visual polish until new data
schemas exist.

Reason: A presentation-only approach improves immersion and guidance without
misrepresenting learner progress, expanding scope, or risking the validated
educational loop.

Consequences: The application feels more game-like while retaining the same
business logic, persistence schemas, scoring rules, accessibility contract, and
routes. Coming Soon sections remain clearly marked rather than appearing to be
working settings or locations.

---

## Decision 016 - Keep Audio Global, Preferences Local, and Private POST Data Out of Offline Caches

Date: 2026-07-16

Status: Accepted

Context: Ambient music must persist across routes, sound effects must remain
available when music is muted, and music must stop during active interview
answers. Offline support must retain public academy content and local progress
without storing or silently replaying privacy-sensitive resume, transcript, or
feedback requests.

Decision: Mount one audio controller at the root layout with one reusable music
element and one reusable sound-effect element. Store separate music and effect
booleans in a versioned local preference. Attempt music playback on entry, but
treat browser autoplay denial as a recoverable state and retry after the first
learner interaction. Fade music to silence only while Interview Simulator answer
or transcript-confirmation states are active.

Use a versioned service worker to pre-cache public routes, the manifest, pixel
icons, and supplied audio. Use network-first caching for navigations and
cache-first behavior for same-origin static GET assets. Never intercept or cache
non-GET requests. Existing profile, progress, exercise, attempt, and preference
records remain device-local and therefore require no server synchronization.
Personalized questions, resume assistance, and feedback require reconnection and
an explicit learner retry.

Alternatives considered: Per-page audio elements, tying sound effects to the
music toggle, continuing music during interviews, saving audio preferences in
the learner profile, caching API responses, automatically replaying failed POST
requests, or adding a remote synchronization backend outside the requested
scope.

Reason: A root controller prevents duplicate downloads and route restarts while
keeping focus behavior consistent. Public-only caching improves offline access
without persisting sensitive payloads or inventing a synchronization service.

Consequences: Installed and previously visited academy screens remain useful
offline, and local learning records continue to work. First-visit offline access
is impossible until the service worker has installed online. Browser autoplay
policy may delay music until the first interaction, and service-backed features
remain intentionally retry-based after reconnection.

---

## Decision 017 - Compose the Academy Hub from the Supplied Campus Assets

Date: 2026-07-16

Status: Accepted

Context: The Academy Hub must use one supplied 1672-by-941 campus background and
five supplied transparent building PNGs while keeping the full scene visible,
preserving current routes, and supporting pointer, touch, and keyboard use.

Decision: Render the background at its fixed source aspect ratio and position
each undistorted 3:2 building layer with percentage coordinates. Use transparent
links as the interaction boundary, restrained CSS filters and contact shadows
for scene integration, and a persistent styled label beside every building.
Route complete destinations directly; keep Speech Hall as a disabled,
non-animated Coming Soon control until a real public-speaking route exists. Use fresh
public asset URLs when correcting supplied images because the offline worker's
cache-first strategy may retain an older file at a reused URL.

Reason: One proportional coordinate system preserves the artist's composition
across viewport sizes and prevents the five building regions from overlapping.
It also keeps destination behavior explicit without altering other pages or
inventing unfinished functionality.

Consequences: The entire campus remains visible rather than being cropped to
fill unusual screens. Buildings and labels become smaller on narrow phones, but
the underlying links, focus outlines, and bottom navigation remain available.

---

## Decision 018 - Optional On-Device Face Presence Only

Date: 2026-07-17

Status: Accepted

Context: Phase 9 optional webcam indicators were still a disabled placeholder.
The product forbids emotion, confidence, eye-contact, and hireability claims,
and GPT STAR evaluation must remain transcript-only.

Decision: Implement optional MediaPipe Face Landmarker tracking for face
presence, frame membership, and rough head-orientation buckets. Opt-in on the
mode screen stores session intent; camera starts when the interview room
mounts. Mid-session Enable/Disable/Retry remains available. Soft-fail never
blocks transcript confirmation. No camera data is persisted or sent to
evaluation APIs. Labels stay neutral descriptive language.

Alternatives considered: BlazeFace-only presence, server-side vision, storing
session aggregates on attempts, or recreating reference confidence/nerves
scores.

Reason: Local MediaPipe matches the allowed AGENTS.md indicators without
expanding into prohibited human-state inference or changing the educational
feedback loop.

Consequences: Learners can practice framing during interviews. First opt-in
requires a CDN model fetch. Offline academy routes still work; camera ML does
not.
