# UX and Design Specification

## Product Experience

The application should feel like a cohesive 2D pixel-art educational game.

The experience should combine the engagement of a game with the clarity
of a modern learning platform.

## Core User Flow

Landing

→ Onboarding

→ Pixel Academy

→ Select Learning Track

→ Course

→ Lesson

→ Exercise

→ Simulation Setup

→ Personalized Simulation

→ Feedback Report

→ Recommended Learning

→ Retry

→ Attempt Comparison

→ Progress Dashboard.

## Pixel Academy

The academy is the central navigation experience.

MVP areas:

Interview Center

Speech Hall

Progress Library

The user should clearly understand:

- Where they are
- What they can do
- What is completed
- What is recommended next

Provide an accessible menu alternative to map navigation.

## Interview Simulator

The simulator should visually resemble a first-person pixel-art interview room.

Primary layout:

Top left:

- Interview type
- Question progress
- Timer

Top center:

- Learning objective or session status

Center:

- Pixel-art interviewer
- Current interview question

Bottom:

- Learner response controls
- Microphone state
- Transcript preview

Right panel:

- Webcam preview when enabled
- Neutral observable indicators
- Session progress

Do not display final feedback while the learner is still answering.

After the simulation, transition to the Feedback Report.

### Implemented Pixel Simulator Composition

- The active answering and transcript-confirmation states use a dense panel-9
  game layout; setup and completion states retain their own compositions.
- Learning Progress is calculated from current question position and total real
  generated questions.
- The room scene is code-native pixel art with environmental furniture and the
  existing neutral interviewer portrait.
- Session Analysis is limited to question progress, draft presence, confirmed
  transcripts, measured microphone-listening time, and a labeled filler-word
  draft scan.
- Camera preview remains optional and disabled until a real privacy-safe camera
  feature exists; no visual or human-state analysis is implied.
- Next always leads to editable transcript confirmation before persistence.
- End never records an incomplete session as a completed attempt.

## Feedback Report

The report should prioritize learning over scoring.

Display order:

1. Session summary
2. What you did well
3. Main improvement opportunity
4. Rubric breakdown
5. Transcript evidence
6. Recommended lesson
7. Focused retry goal
8. Improved example
9. Retry simulation
10. Continue learning

## Attempt Comparison

Show:

Attempt 1
vs.
Attempt 2

Compare:

- Rubric criteria
- Specific improvements
- Remaining practice areas

Use charts only when they improve understanding.

## Typography

Use pixel fonts for:

- Headings
- Navigation labels
- Buttons
- Short game UI labels

Use highly readable fonts for:

- Lessons
- Instructions
- Transcripts
- Intelligent feedback
- Privacy notices

## Accessibility

- Keyboard navigation
- Visible focus states
- Text response fallback
- Webcam optional
- Transcript review
- Timers optional where practical
- Do not communicate meaning through color alone
- Clear error messages
- Clear permission instructions

## Responsive Design

Desktop is the primary hackathon demonstration target.

The application should remain functional on tablet widths.

Mobile layouts should remain usable but do not need to reproduce the full
desktop game interface.

## Product Coherence

All screens should share:

- Consistent panel styling
- Consistent spacing
- Consistent navigation
- Consistent typography
- Consistent pixel-art direction
- Consistent feedback patterns

Avoid pages that look like unrelated templates.

---

## Shared Pixel-Game Design System

The shared interface foundation follows the compact game-client language in
the approved UI reference. This milestone defines reusable primitives and does
not redesign individual page composition.

### Core Tokens

- Near-black canvas with layered dark navy panels
- Thin blue-gray outlines and one-pixel inner highlights
- Black square borders with hard three-to-five-pixel offset shadows
- Green primary actions and success states
- Yellow labels, XP, level, selection, and progress accents
- Compact four-pixel spacing scale for HUD controls
- Monospace pixel-style UI typography for headings, labels, tabs, and buttons
- Readable system sans-serif typography for paragraphs, forms, transcripts,
  feedback, and accessibility copy

### Shared Components

- Global top HUD with contextual back navigation, academy navigation, XP, and
  level display
- Compact primary, secondary, ghost, and disabled buttons
- Dark game panels and compact cards with header/action slots
- Badges, status bars, yellow progress tracks, and crisp pixel icons
- Keyboard-operable tabs with roving focus
- Labeled inputs with hint and error semantics
- Dialogs and modal surfaces with hard borders and offset shadows

### Visual Constraints

- Square corners; no large rounding
- No gradients or glass effects in the shared design-system layer
- No oversized marketing headings
- No soft floating SaaS cards
- Dense spacing with minimal unused space
- Page-specific layout and business behavior remain separate from the shared
  design system

### Landing Title Screen

The landing page uses the shared system as a full-screen nighttime game title
screen rather than a conventional marketing layout.

- Large centered AMEEGO wordmark with hard pixel text shadows
- Compact Pixel Communication Academy subtitle
- Three-line communication-learning tagline
- One green Enter Academy action that continues to the `/academy` hub
- Code-native nighttime campus scenery with academy buildings, lit windows,
  paths, lamps, trees, hills, shrubs, moon, clouds, and stars
- Dark navy outer frame with black borders and hard offset shadow
- Shared site HUD, footer, and global decorative backdrop hidden only while the
  landing title screen is present
- Responsive simplification removes secondary scenery before reducing the
  clarity of the logo, tagline, or action

### Academy Hub Map

The `/academy` route is a dense top-down campus map built from the supplied
nighttime campus background and five supplied transparent building PNGs. It is
a navigation scene rather than a dashboard.

- A compact top HUD contains back navigation, Ameego Academy identity, zeroed
  XP, and level 01 without claiming unstored progress.
- Main Building occupies the center approach and links to the Academy home.
- Interview Center occupies the upper-left plot and links to `/practice`;
  Speech Hall occupies the upper-right plot as a permanently aligned disabled
  building with a Coming Soon label and no navigation or dialog.
- Progress Library occupies the lower-left plot and links to `/progress`;
  Courses Building occupies the lower-right plot and links to `/learn`.
- The bottom navigation retains the real Courses, Progress, and Settings routes.
- Building overlays retain their original aspect ratios and use restrained
  contact shadows, brightness matching, window-toned glow, and hard pixel focus
  outlines to integrate with the supplied map without altering the artwork.
- The complete `1672 / 941` campus composition remains visible at desktop,
  tablet, and mobile sizes; touch devices keep compact location labels visible.
- Final proportional placement is Main `50% / 77.5% / 24%`, Interview
  `24.5% / 31.5% / 21%`, Speech `75.5% / 31.5% / 21%`, Progress
  `24% / 63.5% / 19%`, and Courses `76% / 63.5% / 19%`, expressed as
  `left / top / width`.
- The shared site header, footer, and backdrop are hidden only while the hub is
  mounted; other pages keep their existing composition.
- Interactive buildings and bottom-navigation links have visible keyboard
  focus states and descriptive accessible names.

### Courses Game Menu

The `/learn` route now matches the compact panel-3 course-menu composition.

- A narrow title panel identifies Interview Skills Course and the real
  Interview Foundations course.
- The four modules documented in `COURSE_SYSTEM.md` appear in a dense numbered
  menu. Only STAR Method is linked because it is the only published lesson.
- STAR Method displays `0/1` or `1/1` from stored lesson completion; unpublished
  modules display `0/0` and Coming Soon rather than invented completion.
- The side panel calculates `0%` or `100%` using the published lesson count and
  browser-stored completion status.
- A compact pixel learner portrait and short guide message fill the supporting
  panel without creating empty dashboard space.
- The page keeps the shared back, XP, and level HUD while hiding secondary
  global navigation and the footer only for this route.

### STAR Lesson Cover and Reading Flow

The `/learn/star-method` route now opens with a panel-4-inspired lesson cover
while preserving the complete educational lesson below it.

- Lesson 2.1 badge, STAR Method title, short summary, three-item objectives
  checklist, duration, and green Continue Lesson action form the opening panel.
- A large original code-native yellow STAR illustration labels Situation, Task,
  Action, and Result without using an external asset or copied bitmap.
- Continue Lesson moves keyboard and pointer users to the detailed lesson
  content on the same route.
- The full framework explanation, all four step explanations, weak and strong
  examples, comparison guidance, summary, completion persistence, and exercise
  link remain available in a denser game-panel layout.
- Responsive rules stack the menu, progress portrait, lesson cover, steps, and
  examples at narrow widths without introducing rounded modern cards.

### STAR Arrangement Exercise

The `/learn/star-method/exercise` route now matches the compact interactive
layout in panel 5 while retaining the established exercise engine.

- A dark navy hard-bordered panel contains the exercise title and short input
  instructions under the shared back, XP, and level HUD.
- Four numbered answer slots use dashed blue-gray borders and each contains one
  movable Situation, Task, Action, or Result tile.
- Every tile includes its large pixel letter, concise label, original response
  segment, and 44px up/down controls for keyboard and touch users.
- Mouse drag behavior uses visibly different dragging and drop-target states;
  keyboard focus highlights the entire answer slot and the active control.
- Reset and Check remain compact opposing actions, while their accessible names
  retain the more descriptive “Reset arrangement” and “Check my order” labels.
- The existing incorrect-placement guidance, correct-order explanation, retry,
  Interview Center continuation, invalid-storage recovery, and saved-completion
  state remain available below or inside the exercise panel.
- The four-column layout becomes two columns on tablets and one column on narrow
  phones without reducing touch targets or clipping answer text.

### Interview Preparation Game Menus

The first three states of `/practice` now match panels 6, 7, and 8 while later
mode, interview, confirmation, and feedback states retain their existing
compositions.

#### Interview Setup

- A compact Interview Setup panel replaces the large introduction and lobby
  scene during the setup state.
- Dark navy inputs use black pixel borders, blue-gray inner highlights, yellow
  labels, and clear yellow focus outlines.
- Interview type uses a small custom dropdown arrow.
- Difficulty and question count use keyboard-operable minus/plus step controls
  over the same validated enum values.
- The green Continue action retains the accessible “Continue to resume” name
  and calls the existing setup validation handler.

#### Resume Upload

- A large dashed upload zone accepts the existing supported file types and size
  limit without claiming unsupported drag-and-drop behavior.
- Selecting a file reveals a compact uploaded-file panel with its real filename,
  calculated size, Preview, and Remove actions.
- Preview uses a temporary local object URL and does not save the raw résumé;
  Remove clears both React state and the native file input.
- The primary green Continue action keeps the existing extraction API path, and
  continue-without-résumé, extraction errors, and manual résumé text remain
  available.

#### Profile Review

- Interview Details appear in the left panel: type, position, company,
  difficulty, length, and goals.
- Résumé Summary appears in the right panel with distinct pixel icons for
  education, experience, projects, skills, leadership, and achievements.
- Every résumé category remains editable as newline-separated validated items,
  and résumé removal remains available.
- The green Start Interview action retains the existing confirmed-context
  question-generation behavior and failure fallback.
- At narrow widths, upload and review columns stack without changing focus order
  or hiding editing controls.

### Feedback, Progress, and Settings Panels

The final reference trio uses the same compact navy menu system without
removing the product's deeper educational and history flows.

#### Feedback Report

- The first viewport prioritizes Overall Summary, Strengths, Areas to Improve,
  Rubric Score Summary, and the validated Recommended Lesson in compact panels.
- Scores remain visually secondary to their explanations and learning guidance.
- Evidence, improvement actions, retry goal, improved example, same-scenario
  retry, and Continue Learning remain in the required order below the summary.

#### Progress Dashboard

- Four top counters show real lessons completed, interviews taken, current
  interview-practice streak, and activity-derived level.
- Skill bars appear only from validated rubric evaluations and identify their
  average score and evaluated-attempt count.
- Recent Activity never invents a date; current lesson and exercise storage is
  explicitly labeled when completion time is unavailable.
- Completed activities, attempt detail, attempt comparison, caution language,
  and the real next recommendation remain accessible below the compact overview.

#### Settings

- The left menu shows Profile as the active implemented section and labels
  future sections Coming Soon.
- Name and focus are validated and saved locally; XP and level are derived from
  the same real progress calculation used by the dashboard.
- Clear Progress keeps the profile. Reset All Data also restores the default
  profile. Both require confirmation and announce completion to screen readers.

### Cross-Page Consistency Baseline

The implemented reference screens now use a single dense frame specification:

- Internal HUD: 44px, square back control, compact academy identity, and
  right-aligned XP/level status. The earlier website navigation row and footer
  are not displayed inside game screens.
- Shared maximum content width: 1120px, with 9px horizontal mobile gutters.
- Major screen shadow: 6px hard black offset. Reusable panel/card shadow: 4px.
- Shared buttons: minimum 36px high. Shared text inputs and selects: minimum
  38px high. Exercise move controls retain 44px touch targets.
- Pixel fonts remain limited to headings, labels, controls, and HUD text;
  paragraph, form, feedback, and evidence copy stays in the readable body font.
- Responsive rules reduce columns before reducing control size, preserve DOM
  and focus order, and remove decorative scene details only when needed to keep
  learning content and actions visible.

## Audio and Connectivity HUD

- A compact fixed control cluster remains visible across all screens, including
  the title screen and Academy map where the shared header is hidden.
- The music button exposes a clear Music/Muted state, accessible action label,
  pressed state, title hint when autoplay is waiting for interaction, and the
  same black border, navy panel, blue-gray inset, and hard shadow as other HUD
  controls.
- Online and Offline states use both text and a green or gray pixel indicator;
  connectivity is never communicated by color alone.
- Offline Mode adds a concise status notice explaining that cached lessons and
  local progress remain usable.
- Background music stays quiet and ambient, fades rather than cutting abruptly,
  and stops during active interview responses and transcript confirmation.
- Hover sounds have a lower volume than click and completion sounds. Keyboard
  focus receives the same subtle navigation cue as pointer hover.
- Music and sound effects have separate accessible switches in Settings and are
  saved automatically on the current device.
- Reduced-motion settings continue to disable visual animation; audio remains
  under explicit Music and Sound Effects controls rather than being inferred
  from motion preference.
