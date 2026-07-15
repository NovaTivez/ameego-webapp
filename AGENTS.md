# AGENTS.md

## Project Overview

This project is an AI-powered educational communication training web
application presented as an interactive 2D pixel-art learning game.

The platform helps students and first-time job seekers learn and improve:

- Job interview skills
- Public speaking skills
- Classroom presentation skills
- Academic communication skills
- Professional communication skills

The application combines:

- Structured mini-courses
- Interactive learning exercises
- AI-powered speaking simulations
- GPT-5.6 personalized formative feedback
- Targeted lesson recommendations
- Repeated practice
- Progress tracking

The primary product loop is:

Learn
→ Practice
→ Enter Simulation
→ Respond
→ Receive GPT-5.6 Feedback
→ Review Evidence
→ Receive Recommended Lesson
→ Retry
→ Compare Improvement

The application is an educational platform first.

The 2D pixel-art game environment exists to improve engagement,
motivation, and product experience.

Do not turn the application into only an interview simulator.

---

## Hackathon Context

This project is being developed for a Codex and GPT-5.6 hackathon.

The project will be evaluated based on:

1. Technological Implementation
2. Design
3. Potential Impact
4. Quality of the Idea

Development decisions must prioritize:

- Meaningful and extensive use of Codex
- Meaningful GPT-5.6 integration
- A working non-trivial implementation
- A complete and coherent product experience
- A clearly defined real-world problem
- A clearly defined target audience
- A credible educational solution
- Strong technical quality
- A polished end-to-end demonstration

Do not prioritize feature quantity over product completeness.

The primary judging experience should be:

Student enters the Pixel Communication Academy
→ Completes a STAR-method lesson
→ Completes an interactive exercise
→ Enters the AI interview simulator
→ Answers interview questions
→ GPT-5.6 evaluates the response
→ Receives rubric-based feedback with transcript evidence
→ Receives a targeted lesson recommendation
→ Retries the activity
→ Sees measurable improvement.

---

## Target Users

Primary users:

- Senior high school students
- College students
- Students preparing for internships
- Fresh graduates
- First-time job seekers
- Students preparing for classroom presentations
- Students preparing for oral examinations or thesis defenses

The initial MVP should primarily focus on college students,
internship applicants, fresh graduates, and first-time job seekers.

---

## Problem Statement

Many students and first-time job seekers understand that communication
skills are important but lack access to:

- Affordable communication coaching
- Realistic interview practice
- Personalized feedback
- Safe environments for repeated practice
- Clear guidance about what to improve next

Existing learning resources are often passive.

Existing interview simulators may provide questions or scores without
connecting weaknesses to structured learning materials.

This project addresses the problem by connecting:

Instruction
→ Practice
→ AI Evaluation
→ Targeted Learning Recommendation
→ Retry
→ Improvement Tracking.

---

## Product Differentiator

The main product differentiator is the closed educational feedback loop.

GPT-5.6 must not simply generate questions or generic feedback.

GPT-5.6 should:

1. Evaluate the learner using a predefined educational rubric.
2. Identify evidence from the learner's transcript.
3. Explain strengths.
4. Explain specific weaknesses.
5. Identify the learning concept that needs improvement.
6. Recommend the exact relevant lesson or exercise.
7. Generate a focused practice recommendation.
8. Allow the learner to retry.
9. Help the application compare attempts over time.

The product should teach users what to do next, not merely tell them
how they performed.

---

## MVP Scope

The primary MVP experience is the Interview Foundations learning track.

Required MVP features:

1. Landing page
2. Simple onboarding
3. Pixel Communication Academy hub
4. Interview Foundations course
5. STAR-method lesson
6. Interactive STAR exercise
7. Interview simulation setup
8. AI interview simulator
9. Microphone response mode
10. Text-response fallback
11. Speech transcription
12. GPT-5.6 rubric-based evaluation
13. Evidence-based feedback report
14. Targeted lesson recommendation
15. Retry simulation
16. Attempt history
17. Before-and-after attempt comparison
18. Basic progress dashboard

Optional secondary demonstration:

- One Public Speaking Foundations lesson
- One public-speaking practice activity

Do not build multiple incomplete learning tracks before completing
the primary end-to-end experience.

---

## Technology Stack

Use the existing repository technology stack when one already exists.

For a new repository, prefer:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase for authentication and database
- OpenAI API with GPT-5.6
- Browser MediaRecorder API
- Speech-to-text service or supported transcription API
- Zod for runtime validation
- Vitest for unit tests
- Playwright for end-to-end testing

Do not replace major technologies without documenting the decision.

---

## Engineering Principles

- Use TypeScript strict mode.
- Keep components focused and reusable.
- Separate presentation logic from business logic.
- Separate AI prompts from UI components.
- Separate database logic from UI components.
- Validate all external data.
- Validate GPT-5.6 structured outputs.
- Keep protected API calls server-side.
- Never expose API keys in client-side code.
- Use environment variables for secrets.
- Avoid unnecessary dependencies.
- Avoid premature abstraction.
- Reuse existing working components.
- Do not rewrite unrelated working code.
- Do not silently remove features.
- Do not implement fake functionality and present it as working.

---

## Suggested Source Organization

src/
  app/

  components/
    ui/
    pixel/
    courses/
    simulation/
    feedback/
    progress/

  features/
    academy/
    courses/
    exercises/
    interview/
    feedback/
    progress/

  lib/
    ai/
    audio/
    transcription/
    database/
    validation/

  prompts/

  types/

  tests/

---

## AI Usage

GPT-5.6 may be used for:

- Interview question generation
- Context-aware follow-up questions
- Response-content evaluation
- STAR-method analysis
- Rubric-based formative feedback
- Transcript evidence selection
- Improved response examples
- Lesson recommendations
- Focused retry activities

AI features must provide educational value.

Do not add GPT-5.6 calls merely to claim AI usage.

---

## AI Evaluation Rules

Every AI evaluation must use a predefined rubric.

Every score must include:

- Rubric criterion
- Score
- Explanation
- Supporting evidence from the transcript
- Improvement recommendation

AI feedback must be:

- Specific
- Actionable
- Educational
- Respectful
- Evidence-based

Avoid generic feedback.

Bad:

"Good job. Keep practicing."

Better:

"Your response clearly described the situation and action you took,
but it did not explain the outcome. Add a measurable result or lesson
learned to complete the STAR structure."

---

## Camera and Visual Analysis

Webcam functionality is optional.

The core educational experience must work without webcam access.

Permitted visual indicators include:

- Face remained inside the camera frame
- Camera visibility interruptions
- Approximate head orientation changes
- Posture alignment changes when technically reliable

Do not claim to detect:

- Confidence
- Nervousness
- Honesty
- Intelligence
- Personality
- Employability
- Mental-health conditions

Do not use face recognition.

Do not identify users.

Do not create biometric identity profiles.

Use neutral descriptive language.

---

## Accessibility

- Main flows must support keyboard navigation.
- Provide text-response mode.
- Provide transcript review.
- Do not require webcam access.
- Do not rely only on color for communication.
- Use readable fonts for lessons and feedback.
- Pixel fonts should primarily be used for headings, labels, and decorative UI.
- Timers should be optional where practical.
- Provide clear permission-denied states.
- Provide clear loading and error states.

---

## Design Direction

The product should feel like a polished 2D pixel-art educational game.

The reference experience is a first-person pixel-art interview room
with an AI interviewer, question panel, microphone response interface,
simulation progress, and feedback indicators.

The application should maintain a consistent visual system.

Design characteristics:

- Dark navy and slate UI panels
- Warm educational environments
- Pixel-art characters
- Pixel-art buildings
- Pixel-art icons
- Green, yellow, and red status indicators
- Strong visual hierarchy
- Responsive desktop-first layout
- Accessible lesson typography
- Consistent panel borders and spacing

The product must feel coherent.

Do not create disconnected pages with unrelated visual styles.

---

## Required Product States

Major features must handle:

- Loading
- Empty data
- Success
- Failure
- AI request failure
- Network failure
- Microphone permission denied
- Microphone unavailable
- Webcam permission denied
- Webcam unavailable
- Missing transcript
- Invalid AI response
- Retry behavior

---

## Testing Requirements

For every major completed feature:

1. Run formatting checks.
2. Run linting.
3. Run TypeScript type checking.
4. Run relevant unit tests.
5. Run relevant integration tests.
6. Run end-to-end tests when applicable.
7. Run the production build.
8. Inspect browser console errors when practical.
9. Verify loading and error states.

Never claim tests passed unless the commands were executed.

Never hide failing tests.

Report tests that could not be executed.

---

## Codex Working Process

Before implementing a major feature:

1. Read AGENTS.md.
2. Read the relevant files in docs/.
3. Inspect the existing repository.
4. Identify existing reusable code.
5. Review docs/PLANS.md.
6. Propose or update the implementation plan.
7. State assumptions and important decisions.
8. Identify expected files to change.

During implementation:

1. Implement one milestone at a time.
2. Preserve unrelated working functionality.
3. Test each meaningful milestone.
4. Fix errors caused by the changes.
5. Keep documentation synchronized.

After implementation:

1. Run required validation commands.
2. Report files changed.
3. Report features completed.
4. Report commands executed.
5. Report test results.
6. Report known limitations.
7. Update docs/PLANS.md.
8. Update docs/CODEX_WORKFLOW.md for major Codex contributions.
9. Update docs/DECISION_LOG.md when important decisions are made.

---

## Hackathon Evidence

The repository must preserve accurate evidence of how Codex accelerated
development.

For major milestones, document:

- What task was being solved
- What Codex inspected
- What Codex proposed
- What Codex implemented
- What bugs Codex diagnosed
- What tests Codex created or executed
- What decisions Codex suggested
- What decisions the team made
- What changed after testing or review

Never fabricate Codex contributions.

The majority of core functionality should be developed in one primary
Codex session when practical.

Before submission, retrieve the /feedback Session ID from the primary
Codex session and record it outside the repository if desired for the
submission form.

---

## Definition of Done

A feature is complete only when:

- It works through the user interface.
- It supports the intended user flow.
- Relevant data persists correctly when required.
- Error states are handled.
- Accessibility considerations are addressed.
- Relevant tests pass.
- Documentation is updated.
- No known critical errors remain.

Code existing in the repository does not automatically mean the feature
is complete.