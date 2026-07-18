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
- Camera preview remains optional until enabled; when on, it shows local
  mirrored preview plus neutral face-presence and head-orientation labels.
  Camera signals never feed Intelligent Feedback.
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
updated nighttime campus background and five supplied transparent building
PNGs. It is a navigation scene rather than a dashboard.

- A compact top HUD contains back navigation, Ameego Academy identity, zeroed
  XP, and level 01 without claiming unstored progress.
- Main Building occupies the center approach and links to the Academy home.
- Interview Center occupies the upper-left plot and links to `/practice`;
  Speech Hall occupies the upper-right plot as a permanently aligned disabled
  building with a Coming Soon label and no navigation or dialog.
- Progress Library occupies the lower-left plot and links to `/progress`;
  Courses Building occupies the lower-right plot and links to `/learn`.
- The map fills the viewport behind an overlay HUD. Building links are the only
  Courses and Progress entry points, while the existing `/settings` route is
  exposed as a gear-only control at the top right.
- Building overlays retain their original aspect ratios and use restrained
  contact shadows, brightness matching, window-toned glow, and hard pixel focus
  outlines to integrate with the supplied map without altering the artwork.
- The updated `1672 / 941` campus and every building share one proportional
  cover coordinate system. Desktop, laptop, and tablet viewports are filled
  without stretching or layer drift; only nonessential outer vegetation may be
  trimmed when the viewport aspect ratio differs from the source artwork.
- Automated geometry checks keep every building and its attached label inside
  the visible map area at 16:9, 16:10, and 4:3 viewports. Touch devices keep
  compact location labels visible.
- Final plot-centered proportional placement is Main `48.7% / 73.3% / 24%`,
  Interview `27.5% / 27.4% / 21%`, Speech `71.4% / 27.4% / 21%`,
  Progress `22% / 61.8% / 19%`, and Courses `74.5% / 60% / 19%`,
  expressed as `left / top / width`. Small per-building offsets compensate for
  each PNG's transparent canvas and the illustrated plot boundaries so the
  visible artwork aligns with its path and grassy area.
- The shared site header, footer, and backdrop are hidden only while the hub is
  mounted; other pages keep their existing composition.
- Interactive buildings and the top-right Settings control have visible
  keyboard focus states and descriptive accessible names.

### Courses Game Menu

The `/learn` route now matches the compact panel-3 course-menu composition.

### Premium Courses Building Dashboard Body

- The Courses Building body uses a 12px section rhythm, compact 62px overview
  metrics, and reduced panel padding while the shared navigation remains
  unchanged.
- Course Overview emphasizes the course title, rank, progress percentage,
  improved progress track, completed lessons, current lesson, XP, and estimated
  time without changing their data sources.
- Continue Your Quest is a featured gold-accent card that exposes the current
  lesson's existing duration, difficulty, and XP reward beside a larger action.
- Academy Badges use a tighter responsive shelf with separate earned, current
  milestone, and locked states plus restrained hover feedback.
- Phase headers are 64px compact records with count and percentage progress;
  their reward labels render as small RPG badges.
- Lesson cards are 116px compact widgets with aligned number, title, summary,
  duration, difficulty, XP, and state areas. Blue, gold, green, and muted dashed
  accents distinguish unlocked, current, completed, and locked lessons.
- Low-opacity 6% corner ornaments, hard pixel shadows, and reduced-motion-safe
  hover feedback add depth without gradients or rounded styling.
- The supplied starry-night artwork is shared by the course overview, STAR
  lesson, all academy lessons, and STAR exercise routes. A fixed centered cover
  layer fills the viewport throughout scrolling, while a dark overlay keeps
  every existing pixel panel readable.

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
- Interview Information, Company & Practice Goals, and Session Settings use
  tighter section cards with two-column field groups where space allows.
- Dark navy inputs use black pixel borders, blue-gray inner highlights, yellow
  labels, and clear yellow focus outlines.
- Interview type uses a small custom dropdown arrow.
- Difficulty and question count use keyboard-operable minus/plus step controls
  over the same validated enum values.
- The green Continue action retains the accessible “Continue to resume” name
  and calls the existing setup validation handler.

#### Resume Upload

- A compact dashed upload zone accepts the existing supported file types and
  size limit without claiming unsupported drag-and-drop behavior.
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
- The no-résumé state is a short icon-led message rather than a tall empty
  container.
- The green Start Interview action retains the existing confirmed-context
  question-generation behavior and failure fallback.
- At narrow widths, upload and review columns stack without changing focus order
  or hiding editing controls.

#### Pre-interview Mode Selection

- Text, microphone, and optional camera choices retain their existing behavior
  in shorter, aligned cards with clear selected, hover, focus, and disabled
  states.
- The shared global header is not restyled or hidden by the pre-interview body;
  Home, Back, brand, XP, Level, audio, status, and Settings remain owned by the
  global navigation component.
- Preparation, summary, and mode panels use natural document height. The browser
  remains the only page scrollbar, and narrow layouts stack without horizontal
  overflow.

### Feedback, Progress, and Settings Panels

The final reference trio uses the same compact navy menu system without
removing the product's deeper educational and history flows.

#### Feedback Report

- The saved-attempt reward screen uses a shorter two-column hero: completion and
  coach context on the left, with the existing intelligent-feedback action and
  truthful service status on the right.
- A compact Interview Complete → Transcript Saved → AI Feedback tracker makes
  the post-interview workflow visible before the detailed report.
- The confirmed transcript is presented as compact evidence rows, followed by
  quick actions for transcript review, Progress Library, another interview, and
  the Academy map.
- Service failures use an amber status card with a smaller Retry action, while
  loading and ready states retain their existing handlers and validated data.
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

## Full-Viewport Interview Session

- Active interview and transcript-confirmation states occupy the complete
  viewport and temporarily hide the shared page frame; exiting the active
  session restores the normal Interview Center shell.
- The supplied panoramic office fills the interview stage and the supplied
  combined coach-and-desk PNG is centered near the lower stage edge.
- The current question appears in a compact cream pixel speech bubble with a
  category label, strong dark text, balanced padding, and responsive maximum
  height for longer questions.
- The response dock keeps the editable transcript, microphone control, and
  actions together beneath the room. Microphone off is red and labeled;
  microphone active is green and labeled.
- Next is the first and visually dominant action. End Interview follows as a
  smaller secondary danger action.
- Camera preview and neutral on-device face/orientation labels remain in a
  right-side tool rail on desktop. Tablet and phone layouts stack the tool rail
  inside the simulator without changing DOM or keyboard order.

## Full-Page Settings Center

- Settings uses the full available page width and the browser scrollbar as its
  only vertical scrolling surface.
- A 250px sticky desktop sidebar contains all eight categories with existing
  pixel icons, a yellow active marker, and consistent hover and focus states.
- Profile and Academy Progress receive the strongest hierarchy: a large learner
  portrait, aligned form fields, Level card, XP progress bar, and four real
  activity statistics.
- Audio and Permissions use two-column control cards; Accessibility, Privacy,
  and About use responsive informational grids; Resume & Learning Data groups
  export and destructive local-data actions without weakening confirmations.
- At 820px the sidebar returns to document flow and becomes a two-column menu;
  at 560px all content stacks with the original DOM and keyboard order intact.
- Cards retain square pixel borders, navy surfaces, hard shadows, stepped motion,
  readable body typography, and reduced-motion fallbacks.

## Main Building Night Hero

- The updated night academy scene appears only behind the Main Building Welcome
  Back hero, never behind the remaining dashboard panels.
- The image is centered and cover-sized without stretching. The greeting stays
  on the darker left while Today’s Goal occupies the right, matching the supplied
  reference hierarchy.
- A horizontal dark overlay protects the greeting and player details; a lower
  overlay supports the XP panel and quick actions without flattening the full
  scene.
- The XP panel spans the content width and four equal quick actions sit beneath
  it on desktop. Actions reduce to two columns on laptops and one on narrow
  screens; below 820px the hero columns stack and a stronger overlay preserves
  readability.

## Main Building Continuous Star Field

- The uploaded starry-night artwork begins below the shared application header
  and belongs only to the Main Building page container.
- A centered fixed cover treatment keeps one continuous scene behind the hero
  and every dashboard section through the bottom of the page, with no vertical
  image repetition or section seams.
- A subtle page-wide dark gradient prevents bright stars from competing with
  content. The Welcome Back area adds a soft radial overlay that fades into the
  scene rather than ending at the hero boundary.
- Existing dark pixel panels, cream goal card, XP bar, and action controls retain
  their original contrast and interaction styling over the scenery.
- The updated academy artwork remains the Welcome Back hero’s dedicated
  background. The star field begins visually below that hero and supports the
  scrolling dashboard body rather than replacing the Main Building entrance.

## Compact Main Building RPG Dashboard Body

- The hero-to-dashboard gap uses a compact `0.6–1.25rem` responsive margin so
  the body begins promptly without touching the hero frame.
- Only the content below the hero uses the denser dashboard treatment. Body
  gaps, section padding, card padding, and bottom spacing are reduced by roughly
  15–20% while the navigation, hero, and background layers stay unchanged.
- Every section has its own restrained color accent and a 6% pixel-grid corner
  ornament, while cards use thinner layered borders, hard shadows, and
  reduced-motion-safe hover elevation.
- Continue Your Journey uses two compact quest widgets with grouped metadata;
  Daily Missions uses aligned quest rows with XP badges and progress tracks;
  and Learning Streak gives the seven-day calendar stronger visual weight.
- Recent Activity and Career Journey use connected pixel timelines. Academy
  Statistics uses compact 112px metric tiles with larger values, while
  achievement badges use a tighter responsive grid and clearer locked states.
- Certificates use grouped icon, description, status badge, and action areas;
  the existing rank progression uses the same denser spacing system.
- All displayed values, destinations, controls, state, and data contracts remain
  unchanged.

## Progress Library Night Landscape Hero

- The supplied moonlit castle landscape appears only in the Progress Library
  hero directly below the shared navigation and uses centered cover sizing.
- A left-weighted horizontal overlay and lower overlay keep text and cards clear
  without flattening the castle, moon, banner, bridge, or mountain silhouettes.
- The desktop hero follows the reference's approximately 450px proportion. Its
  centered content group contains the label, title, description, and only four
  compact real counts: Lessons, Interviews, Evidence, and Objectives.
- The reference-matched hero statistics use four 250×100px horizontal cards
  with 44px icons on the left, 16px gaps, and gold, blue, purple, and green top
  accents. Each includes one status line, a faint 7% icon silhouette, and the
  reference's compact progress-plus-context footer.
- Secondary lines remain factual: course completion comes from the lesson
  catalog, latest practice comes from saved activity, evidence validation is a
  saved-attempt ratio, and objective progress is the stored rubric average.
- Current Goal, Next Lesson, and Current Streak retain their existing snapshot
  values in a separate three-card row within the main content below the hero.
- The three guidance widgets use distinct goal, lesson, and fire pixel icons;
  gold, blue, and green accents; low-opacity decorative icon silhouettes; and
  purpose-specific layouts. Their metadata is limited to real level progress,
  recommendation type, recommendation status, and saved streak activity.
- Each widget exposes a keyboard-focusable CTA to the existing recommendation
  route or Progress Overview anchor. Hover lift and icon movement are disabled
  when reduced motion is requested.
- Below 900px hero statistics use two columns; below 700px the guidance row
  stacks; and below 480px hero statistics use one column.

## Compact Progress Library Body

- The supplied starry-night scene fills the complete scrolling Progress Library
  body with fixed, centered cover sizing and a restrained dark overlay. The
  moonlit castle artwork remains the hero's independent opaque background.
- Everything beneath the hero uses a denser dashboard rhythm with 16px panel
  padding and roughly 20–30% less vertical separation.
- Major body sections use a small title icon, colored pixel accent, layered
  border, hard shadow, and a 5.5% corner pattern. The header and hero remain
  unchanged.
- Skill rows stack as compact progress records, Recent Activity uses 58px rows,
  and completion cards use small progress tracks and illustrated empty states.
- Saved simulations use 310px cards, four 54px metadata chips in a 2×2 grid, a
  compact top-right transcript badge, and a right-aligned action.
- Attempt comparison places both existing selectors in balanced columns with a
  centered pixel icon, then stacks cleanly on narrow screens.

## Saved Interview Delete Confirmation

- Each saved simulation pairs its compact Open Attempt button with a red pixel
  Delete action aligned at the card's lower-right edge.
- Delete opens a centered alert dialog with a darkened backdrop, red accent,
  record icon, exact role and organization, and a permanent-removal warning.
- Cancel receives initial focus; Escape and Cancel close without mutation.
  Delete Saved Attempt is the only destructive confirmation action, and storage
  failures remain visible inside the dialog.

## Responsive Post-interview Result Layout

- The completion hero reserves three independent desktop zones for the saved
  attempt summary, interviewer artwork, and intelligent-feedback action. The
  content cards never sit underneath the decorative character.
- At laptop widths the hero becomes two columns and removes the decorative
  interviewer; below 820px both functional cards stack with natural height.
- Hero buttons share the available card width, wrap long labels safely, and keep
  consistent alignment for View Feedback Report, Generate Intelligent Feedback,
  and Open Feedback Report.
- The progress tracker uses three equal columns on wide screens and readable
  full-width rows on small screens. Labels and badges are contained at every
  breakpoint.
- Confirmed responses form a balanced two-column evidence grid on desktop and a
  single-column list on smaller screens. Questions, responses, status copy, and
  generated AI content use defensive wrapping for unusually long strings.
- Quick actions use four, two, then one column as space decreases. No result or
  feedback panel creates an internal vertical scrollbar; the browser owns the
  complete page scroll.

## Premium Post-interview Composition

- The combined coach-and-desk asset scales to 270–325px and sits in the center
  window zone. A lower panorama crop removes excess wall while retaining one
  cohesive interview-room scene.
- Completion and Intelligent Review cards use equal outer columns, identical
  stretch behavior, matched internal padding, vertically centered content, and
  48px full-width primary actions.
- On the completed route, the shared header gains a restrained 76px height.
  Home, Back, Logo, XP, Level, Audio, Online, and Settings remain the same
  controls but align on one center baseline with consistent 42px dimensions.
- Feedback progress uses three equal 66px cards with 38px badges. The active AI
  Feedback state uses a brighter gold border, four-pixel lower accent, and soft
  glow without changing the step state machine.
- Confirmed responses use equal-height desktop rows, larger internal padding,
  a strong question/answer hierarchy, a compact green Confirmed badge, and an
  aligned metadata grid for input mode plus the saved attempt date and time.

## Compact Completed-interview Hero and Evidence Records

- The room hero uses a compact 280–315px height. Equal side cards are limited to
  390px wide and 250px tall, vertically centered around a dedicated 320–390px
  artwork column with equal horizontal gaps.
- The coach-and-desk PNG scales to 345–410px and remains centered on the room
  window. Its small horizontal overhang stays inside the reserved gaps rather
  than underneath either functional card.
- The result-only header uses a 72px frame with 40px navigation and status
  controls. Existing controls remain vertically centered with the same labels,
  destinations, and behaviors.
- Progress steps span the same maximum 1320px content grid as the report below.
  Each is 78px tall with a 44px badge and equal one-third width.
- Saved Evidence has no redundant response-count badge. Each desktop row places
  number, question, answer, Confirmed status, and saved date/time in one aligned
  horizontal record; laptops move time beneath the text, and tablets/phones
  stack the record without horizontal scrolling.

## Academy Plaza Guide

- The supplied transparent owl-and-message PNG sits on the campus map's circular
  plaza at 52% horizontally and 43.1% vertically after the latest upward visual
  adjustment.
- Its 16.4% map-relative width applies the latest 10% size increase while
  keeping the complete composition clear of surrounding building plots.
- The guide sits below every building control and ignores pointer events, so
  map links, hover states, focus outlines, and locked locations behave exactly
  as before.
- A subtle contact shadow grounds the mascot while the image floats vertically
  over 4.8 seconds using eight pixel-style steps. Reduced-motion preferences
  disable the animation entirely.
