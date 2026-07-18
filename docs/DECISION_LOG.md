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
the underlying links, focus outlines, and top-right Settings entry remain
available.

---

## Decision 018 - Make Buildings the Academy's Primary Navigation

Date: 2026-07-17

Status: Accepted

Context: The Academy map already provides Courses and Progress destinations,
making the bottom shortcut bar visually redundant and reducing the space
available to the supplied campus art.

Decision: Let the fixed-aspect map occupy the complete viewport with the compact
HUD overlaid at the top. Remove the bottom shortcut bar, retain Courses and
Progress on their existing buildings, and keep Settings as a gear-only link to
the existing `/settings` route. Preserve the Music/Online controls and XP/level
status in the same top region without moving their state or event logic.

Consequences: The Academy reads as a continuous RPG map and gains vertical
space. Non-map aspect ratios use contained scaling so no campus edge or building
is clipped; unused space may remain on unusually tall displays rather than
distorting or cropping the supplied artwork.

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

---

## Decision 019 - Use Groq Llama 3.1 8B for Server AI

Date: 2026-07-17

Status: Accepted

Context: STAR evaluation, question generation, and resume extraction previously
called the OpenAI Responses API. The team wanted a cheaper Llama-hosted path.

Decision: Route all structured AI calls through Groq Chat Completions with
default model `llama-3.1-8b-instant`, `response_format: json_object`, and the
existing application-side schema/evidence/safety validators. Use `GROQ_API_KEY`
and optional `GROQ_MODEL`. Keep learner-facing copy provider-neutral.

Alternatives considered: xAI Grok, keeping OpenAI GPT-5.6, or Groq Llama 70B.

Reason: Groq Llama 3.1 8B Instant is the cheapest Llama option that still
supports fast JSON responses for the hackathon loop.

Consequences: PDF resume extraction is weaker than OpenAI file inputs; text
resumes and manual highlights remain supported. Feedback quality may be thinner
than larger models, so validation rejects remain critical.

---

## Decision 020 - Scale the Updated Campus and Buildings as One Cover Scene

Date: 2026-07-17

Status: Accepted

Context: The supplied updated campus retains the existing 1672-by-941 five-plot
composition, but containing that ratio inside every viewport can leave visible
bands. Independently covering the background would cause percentage-positioned
building layers to drift away from their plots.

Decision: Store the supplied image at a new cache-safe asset URL and render the
fixed-aspect map wrapper itself with cover sizing. Keep all five existing
building PNGs, labels, and interactions inside that wrapper so background and
overlays share the same scale and centered crop. Calibrate the plot anchors as
mirrored percentages: `25%` and `75%` for the side columns, `29.5%` and `61.5%`
for their row centers, and `50% / 75.5%` for Main Building.

Alternatives considered: Stretching the image to 100vw by 100vh, covering only
the background image, retaining contained letterboxing, or using separate
breakpoint-specific building coordinates.

Reason: A single cover scene fills common desktop, laptop, and tablet viewports
without distortion, empty margins, overlap, or layer drift. At 16:9, 16:10, and
4:3, the centered crop affects only outer scenery and keeps all five building
regions visible.

Consequences: Very narrow portrait or extreme ultrawide screens may trim more
outer campus scenery because a fixed landscape artwork cannot simultaneously
cover every aspect ratio and show every source pixel. The map remains centered,
undistorted, and synchronized with its building layers.

---

## Decision 021 - Keep One Preparation State Machine Behind a Shared Interview Office

Date: 2026-07-17

Status: Accepted

Context: Scenario, Resume, and Review already had complete validation,
extraction, fallback, and question-generation behavior, but each state looked
like a separate form page and duplicated the primary action inside its content.

Decision: Preserve the existing state values and handlers while presenting all
three states inside one fullscreen office shell. Use one shared three-step
tracker and one live summary whose action delegates to the current state's
existing handler. Keep the actual 3, 5, and 8 question options and derive labels
and estimated time only from current form state.

Alternatives considered: Splitting the preparation states into new routes,
introducing a new wizard state library, or duplicating form values in a sidebar
store.

Reason: A presentation-only shell creates the requested continuous in-game
office experience without risking route, API, persistence, validation, or
interview-generation behavior.

Consequences: Desktop and laptop layouts keep the summary visible beside a
scrollable work area; tablet and mobile layouts place it after the work area.
The summary remains derived UI and does not create a second source of truth.

---

## Decision 022 - Embed Experience Controls in the Header Except on Fullscreen Worlds

Date: 2026-07-17

Status: Accepted

Context: XP and Level were rendered inside the header while Music and
Online/Offline were fixed independently over it. This produced uneven spacing
and made the controls feel detached, but Landing and Academy intentionally hide
the shared header and still require Music and connectivity controls.

Decision: Render one grouped HUD inside MainNav on standard routes, using the
existing ExperienceControls component and handlers. On `/` and `/academy`, keep
that same component as the standalone control surface while omitting the hidden
header group. Preserve the existing Academy-specific Settings and status HUD.

Alternatives considered: Keeping fixed controls visually adjacent with
hard-coded offsets, duplicating interactive controls on every route, or showing
the full shared header over the Landing and Academy artwork.

Reason: Path-aware placement creates correct visual and keyboard order on
standard pages without removing controls or disturbing the established
fullscreen game-world layouts.

Consequences: Header pages share consistent 68px alignment and control sizing;
fullscreen worlds retain their existing compact overlay controls. Audio,
connectivity, navigation, Settings, XP, and Level behavior remain unchanged.

---

## Decision 023 - Render the Supplied Interview Panorama as the Entire Hero Scene

Date: 2026-07-17

Status: Accepted

Context: The Interview Center hero was assembled from generated CSS room
layers plus separate character, dialogue, desk, and prop components. The team
supplied a complete panoramic room and requested that it be the only visible
hero content for this step.

Decision: Copy the supplied PNG byte-for-byte into public assets and render the
hero as an empty semantic section with a centered, non-repeating cover
background. Remove all scene children and their page-scoped positioning and
animation rules while preserving the existing hero grid row heights.

Alternatives considered: Keeping transparent character/dialogue overlays,
placing the panorama behind PixelRoomBackground, or using an `<img>` with
contained letterboxing.

Reason: A single CSS background satisfies full-bleed responsive cropping and
guarantees there are no duplicate room layers or leftover header graphics.

Consequences: The header currently contains only the supplied room artwork.
Future NPC or dialogue additions must be explicitly reintroduced in a separate
task. Interview functionality and preparation state remain unchanged.

---

## Decision 024 - Keep Mode Selection in the Existing Interview State Machine

Date: 2026-07-17

Status: Accepted

Context: The generated-question flow already had a `mode` state with working
text, microphone-permission, camera-intent, and active-session transitions. The
new design requires a more deliberate in-room choice without changing those
services or creating another destination.

Decision: Keep the existing `mode` state and start handlers, add presentation-
only selected-mode state, and invoke the original text or microphone handler
from one explicit Continue action. Reuse the supplied interviewer and desk PNGs
over the existing uploaded panorama; create the speech bubble in CSS because no
separate speech-bubble file accompanied this request.

Alternatives considered: Starting the interview immediately when a card is
clicked, adding a new route for mode selection, or changing the microphone and
camera service contracts.

Reason: An explicit confirmation step supports clear selected and focus states
while keeping the complete interview, permission, transcript, scoring, and
retry paths on their established state machine.

Consequences: A learner now selects a card and then continues. The chosen card
is announced through `aria-pressed`; microphone permission is still requested
only by the existing microphone start handler, and camera intent remains
optional and local-only.

---

## Decision 025 - Confirm Optional Camera Readiness Before Interview Entry

Date: 2026-07-17

Status: Accepted

Context: Camera intent was collected on Mode Selection, but the camera first
became visible only after the active interview mounted. The combined artwork
refinement also required replacing two independently positioned visual layers
with one source image.

Decision: Render the supplied combined coach-and-desk PNG as one responsive
layer. When camera intent is enabled, keep the learner in the existing `mode`
state and open a local readiness dialog before invoking the selected response
handler. Reuse the existing camera hook and update only its video-ref attachment
so one stream follows the currently mounted preview element.

Alternatives considered: Starting the interview before showing the preview,
requesting a second camera stream after confirmation, or creating a separate
camera route and state machine.

Reason: A preflight dialog lets the learner verify framing and permissions
without starting timers or questions. Reattaching the same stream avoids a
second permission prompt and keeps camera lifecycle ownership inside the
existing hook.

Consequences: Camera-enabled learners explicitly confirm `I'm Ready`; camera-
off learners continue directly as before. Permission denial and unavailable
states remain non-blocking, and camera information remains local and excluded
from scoring and feedback.

---

## Decision 026 - Keep the Live Interview Fullscreen and Presentation-Only

Date: 2026-07-17

Status: Accepted

Context: The live session was constrained by the shared page frame and drew a
second code-native office and character despite the supplied room and combined
coach artwork. Its microphone used red while listening, and End appeared before
Next with comparable visual weight.

Decision: Activate a viewport-only shell during interview and confirmation,
reuse the supplied panorama and coach image inside the main scene, and preserve
all existing handlers through the same `InterviewSessionView` prop boundary.
Represent microphone state as red/off and green/active with visible text. Place
Next before End Interview and reduce the danger action's size and emphasis.

Alternatives considered: Rebuilding the interview state machine, moving the
session to another route, keeping the generated room behind the supplied art,
or using color alone for microphone state.

Reason: A presentation-only replacement removes duplicate scenery and unused
canvas without risking microphone, camera, transcript, timer, evaluation, or
persistence behavior. Text labels keep the microphone state accessible, and
the action hierarchy reduces accidental exits.

Consequences: Desktop interview and confirmation states fill the browser
viewport without page scrolling. Narrow layouts use internal simulator
scrolling only when panels must stack. The shared header returns automatically
when the learner ends or completes the active session.

---

## Decision 027 - Separate Interview Completion from the Long-Form Feedback Report

Date: 2026-07-17

Status: Accepted

Context: The completed simulator, generation control, validated rubric output,
evidence, recommendations, and restart action were compressed into one bounded
panel. Long evaluations left little visual hierarchy and did not use the page's
available vertical space.

Decision: Keep the completed interview room at the top of the existing Practice
route, then continue into a full-width, vertically scrolling Feedback Report.
Present the existing validated result through six named learning sections and
place Start Another Interview after every report and learning action.

Alternatives considered: Opening results on a separate route, hiding the
completed room after evaluation, keeping the compact two-column dashboard, or
changing the evaluation response contract to fit a new UI model.

Reason: A continuous page preserves the learner's sense of completing the same
simulation while giving detailed educational feedback enough room to remain
readable. Reusing the current evaluation object avoids risk to the trusted API
and schema boundary.

Consequences: Learners scroll from completion into feedback and can jump there
with an in-page link. The UI displays an overall average derived from the four
existing rubric scores, but stored scores and all backend behavior remain
unchanged. The report can grow naturally with longer evidence and action copy.

---

## Decision 028 - Reuse One Verified Interview Center Asset Pair Across the Flow

Date: 2026-07-17

Status: Accepted

Context: The post-interview hero still used a generated library, student,
results board, trophy shelf, and props. The requested replacement panorama and
combined interviewer-and-desk PNG were supplied again for visual alignment with
the pre-interview simulator.

Decision: Remove every generated post-interview scene layer and reuse the same
verified panorama and combined coach image already used by the pre-interview
flow. Keep completion copy and the report link as a separate accessible HTML
card over the scene.

Alternatives considered: Adding duplicate asset filenames, retaining generated
props behind the supplied images, creating a second post-interview room route,
or baking the summary text into the bitmap.

Reason: Hash verification showed both supplied files are byte-identical to the
installed assets. One shared asset pair creates exact visual continuity, avoids
cache and maintenance duplication, and keeps text responsive and accessible.

Consequences: Pre- and post-interview heroes now share the same environment and
coach composition. Completion messaging remains live HTML, the report continues
below the hero, and no service or interview behavior is affected.

---

## Decision 029 - Confine Fixed-Shell Scrolling to Pre-Interview Workspaces

Date: 2026-07-17

Status: Superseded by Decision 030

Context: Long setup forms need vertical space, but scrolling the complete page
would move the context-setting panorama, progress tracker, and Session Summary.
The active interview and completed report already have deliberately different
viewport and scrolling models.

Decision: Keep the existing preparation grid fixed and make only its main form
panel scroll vertically. On Mode Selection, keep the hero, progress tracker,
heading, and footer fixed while the central card row scrolls. Do not share these
selectors with the active simulator or post-interview results.

Alternatives considered: Enabling body scrolling across every interview state,
making the shared header scroll away, changing the setup component hierarchy,
or applying one global overflow rule to preparation, active, and completed
states.

Reason: Scoped internal scrolling preserves the learner's current context and
action controls without risking the live simulator or long-form report behavior.
CSS containment also avoids unnecessary state or component changes.

Consequences: Desktop and laptop setup forms can grow beyond the available main
row while the surrounding shell remains stable. Existing narrow-screen stacking
continues to use its readable natural document flow. Active and completed states
remain unchanged.

---

## Decision 030 - Use One Browser Scrollbar for Pre-Interview Setup

Date: 2026-07-17

Status: Accepted

Context: Even when scoped correctly, independent workspace and Session Summary
scrollbars divide one preparation page into multiple scroll regions. The desired
interaction is one continuous document controlled by the browser's main
scrollbar.

Decision: Let the Scenario, Resume, Review/Questions, and Mode Selection shells
grow to their natural content height. Set the page body as the only vertical
scroll owner and remove nested scrolling from setup content and the Session
Summary. Keep modal overflow independent because it is outside document flow.

Alternatives considered: Keeping nested setup scrollbars, applying a global
overflow rule to all interview states, or changing component markup and layout
structure.

Reason: Natural document scrolling is simpler and more predictable while
preserving the existing visual composition. Keeping the rule inside the
preparation module protects the active simulator and long post-interview report.

Consequences: Long pre-interview forms now extend the page and use the browser
scrollbar from top to bottom. There are no vertical scrollbars inside the main
setup card, Mode Selection content, or Session Summary. Active and completed
interview states retain their separate scrolling models.

---

## Decision 031 - Require Explicit Confirmation Before Ending an Interview

Date: 2026-07-17

Status: Accepted

Context: End Interview immediately returned to Mode Selection. It was visually
smaller than Next and could be activated accidentally while a learner had an
unfinished draft.

Decision: Give Next and End Interview equal dimensions while retaining primary
green and destructive red styling. Place the established end handler behind an
accessible confirmation dialog whose initial action continues the interview.

Alternatives considered: A browser-native confirm prompt, keeping the immediate
end action, changing the end handler, or making the destructive action visually
larger than Next.

Reason: A themed dialog preserves the game UI and provides an explicit safety
boundary without changing session behavior. Equal dimensions improve alignment;
color and copy preserve action hierarchy.

Consequences: Learners must confirm before leaving the active interview. Cancel
or Escape returns focus to End Interview. Confirming still preserves the scenario
and confirmed responses exactly as the original handler did.

---

## Decision 032 - Extend the Existing Course Progress Record for Academy Quests

Date: 2026-07-17

Status: Accepted

Context: The Courses Building needs sequential phase unlocking, lesson totals,
earned course XP, and a current-lesson recommendation. The application already
stores completed lesson IDs in a validated version-1 local record, while the
published STAR lesson relies on that same record.

Decision: Represent every academy quest with a stable lesson ID and continue to
record completion through the existing `completeLesson` helper. Calculate the
Courses dashboard from those completed IDs and keep the storage schema, key,
and validation unchanged. Continue to route STAR through its existing lesson
and exercise pages.

Alternatives considered: Creating a second academy progress store, changing the
version-1 storage schema, hard-coding visual completion, replacing the STAR
route with an inline copy, or unlocking every phase at once.

Reason: One existing completion record prevents conflicting progress states and
keeps historical STAR completion readable. Stable IDs support deterministic
phase unlocking without touching APIs, authentication, or global application
state.

Consequences: New quests and the existing STAR lesson contribute to one course
dashboard. Phases unlock only when preceding lesson IDs are complete, while a
previously completed STAR lesson remains directly reviewable. Course XP shown
on this page is a transparent sum of completed quest rewards and does not alter
the global HUD or introduce a separate XP persistence system.

---

## Decision 033 - Keep Lesson AI Feedback Behind the Validated Interview Center

Date: 2026-07-17

Status: Accepted

Context: Several requested lessons mention AI evaluation of speech clarity,
confidence, common questions, STAR structure, and final delivery. The existing
validated GPT pipeline evaluates confirmed interview transcripts using a rubric,
while browser speech recognition produces only a draft transcript and the
camera system provides only neutral local framing indicators.

Decision: Provide real local lesson checkpoints and neutral practice indicators
on dedicated pages, then route exercises requiring GPT evaluation to the existing
Interview Center. Do not label deterministic word counts, timing, filler scans,
or camera observations as AI judgments. Do not infer confidence, emotion,
pronunciation quality, personality, or employability.

Alternatives considered: Displaying simulated AI scores, adding new unvalidated
API behavior inside the lesson UI, treating transcript timing as confidence,
sending raw lesson camera or audio data to progress storage, or omitting AI
practice guidance entirely.

Reason: The existing simulator is the product's validated evidence-based AI
boundary. Reusing it preserves backend functionality and avoids unsupported or
unsafe claims while still giving each lesson a clear path to intelligent
feedback.

Consequences: Dedicated lessons remain functional with text fallbacks and local
practice tools. Learners seeking AI feedback continue through the established
question, response, transcript confirmation, evaluation, and report flow. The
course can expand without duplicating prompt, rubric, API, or persistence logic.

---

## Decision 034 - Make the Main Building a Read-Only Academy Aggregation Layer

Date: 2026-07-17

Status: Accepted

Context: The campus Main Building linked back to the campus itself, while the
requested home base needs profile, learning, interview, achievement, mission,
streak, certificate, and rank summaries. Existing records have course IDs,
attempt timestamps, evaluation scores, and profile data, but do not store lesson
completion dates, practice duration, a communication rubric, or certificate
files.

Decision: Keep `/academy` as the fullscreen campus and route Main Building to a
new normally scrolling `/academy/home` dashboard. Derive every supported value
from the existing validated storage records without writing a new store. Mark
unsupported metrics as not tracked or not scored, and render certificate actions
only when an actual certificate is available.

Alternatives considered: Replacing the campus at `/academy`, adding a second
dashboard progress schema, fabricating dates or practice duration, treating STAR
scores as a separate communication rubric, or rendering nonfunctional download
buttons.

Reason: A separate destination preserves the game-world navigation metaphor and
all established routes while providing a useful central summary. Read-only
aggregation prevents conflicting XP or progress sources, and explicit missing-
data states keep the learning record trustworthy.

Consequences: Main Building now opens a full Academy home base; the Back control
returns to the campus. Hub XP and ranks are transparent derivations of academy
lesson rewards and the existing exercise/interview XP constants. Daily lesson
missions cannot claim completion until lesson records gain timestamps, practice
duration remains unavailable, and certificate files require a future issuance
feature before View or Download actions can appear.

---

## Decision 035 - Keep Progress Library Redesign Inside the Existing Data Boundary

Date: 2026-07-17

Status: Accepted

Context: The Progress Library already reads validated lesson, exercise, attempt,
evaluation, XP, streak, activity, recommendation, and comparison data, but its
compact panels compress the hierarchy and saved simulation metadata. The task
requires a modern full-page experience without changing that behavior.

Decision: Retain the ProgressDashboard state, storage readers, calculateProgress
snapshot, selected-attempt handler, and compareAttempts workflow. Restructure
only the rendered sections and CSS module, adding semantic metadata fields and
responsive pixel-art cards around the established values.

Alternatives considered: Replacing the progress calculator, adding a new
dashboard snapshot, migrating saved attempt records, removing comparison to
simplify the page, or introducing internal scroll containers to constrain long
history.

Reason: Presentation-only composition delivers the requested readability and
scannability while protecting stored learner evidence and every existing
interaction. Normal document flow also lets long attempts and comparison reports
use the browser scrollbar without competing scroll regions.

Consequences: `/progress` now occupies the full page and can grow naturally with
stored activity. Simulation cards are easier to scan, while opening attempts and
comparing compatible evaluations continue through their original handlers and
data contracts. Horizontal overflow protection remains available only for the
comparison table on very narrow screens; no nested vertical scrollbar is added.

---

## Decision 036 - Let the Campus Header Own Its Experience Controls

Date: 2026-07-17

Status: Accepted

Context: The campus header positioned XP and Level absolutely, Settings as a
fixed button, and the root ExperienceControls as a separate fixed group. Their
independent offsets overlapped inside a 48px strip and became increasingly
fragile as labels or viewport widths changed.

Decision: Render the existing ExperienceControls component inside the campus
header next to XP, Level, and Settings. Keep one flex container responsible for
alignment, widths, heights, and gaps. Suppress only the root-level duplicate on
`/academy`, while retaining it on the fullscreen title route.

Alternatives considered: Increasing only the header height, recalculating three
sets of fixed right offsets, hiding controls at laptop widths, or creating new
campus-specific music and connectivity implementations.

Reason: One layout owner guarantees containment and responsive alignment without
duplicating state or behavior. Reusing ExperienceControls preserves the trusted
audio and connectivity boundary, and equal sizing gives the requested premium
pixel HUD rhythm.

Consequences: The desktop campus HUD is 72px tall and all five right-side
controls share 84px width, 42px height, and 8px spacing. Breakpoints reduce those
dimensions together, the offline notice begins below the new header, and the
title screen continues to use its established standalone controls.

---

## Decision 037 - Complete Settings Through Local, Honest Controls

Date: 2026-07-18

Status: Accepted

Context: Settings exposed working Profile and Audio controls but represented
Privacy, Resume & Data, Permissions, and About as disabled “Coming soon” menu
items. That left a visible product surface incomplete despite the existing
local-storage data model and optional device features.

Decision: Make every Settings navigation entry an anchor-linked section. Keep
the existing destructive local-data controls, add a download-only export of the
known local records, add non-prompting microphone and camera permission-status
checks, and document the exact privacy and resume-data boundaries in the UI.

Alternatives considered: Leaving informational entries disabled, adding an
unvalidated import flow, requesting microphone or camera access directly from
Settings, or claiming that resume information is never retained.

Reason: These controls make the page complete without inventing settings the
browser cannot safely grant or revoke programmatically. A download-only export
is useful and reversible, while import needs a future migration contract.

Consequences: Settings now has no work-in-progress labels. Permission checks do
not trigger a device prompt; learners request access only when they select an
appropriate practice feature. Exported records can contain saved transcripts,
feedback, and confirmed resume summaries, so the UI explains that before the
download action.

---

## Decision 038 - Separate Landing Navigation from Browser-History Navigation

Date: 2026-07-18

Status: Accepted

Context: The shared header used one left-arrow link whose fixed destination was
calculated from the current route. It visually suggested Back but did not follow
the learner's actual navigation history, and there was no dedicated recognizable
Home control for returning to the Landing Page.

Decision: Render two adjacent icon controls from one reusable component. Use a
normal Next.js link with a pixel home glyph for the stable `/` destination, and
use a native button that calls browser history Back for the left-arrow action.
Apply the same semantic and visual contract to the shared HUD and fullscreen
campus HUD.

Alternatives considered: Keeping route-specific parent mappings, using two
fixed links, retaining a text Home label, or duplicating separate navigation
handlers and markup in each header.

Reason: Home and Back represent different user expectations. A fixed link is
predictable and shareable for the Landing Page, while browser history correctly
returns users to the page they actually visited previously, including paths
outside the hard-coded course hierarchy.

Consequences: The top-left controls are recognizable, keyboard accessible, and
consistent across header variants. Back remains dependent on the browser's
available session history, as expected for a standard history control; all
application routes and backend boundaries remain unchanged.
