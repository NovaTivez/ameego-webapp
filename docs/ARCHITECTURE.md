# Architecture Specification

## Goal

Maintain a clear separation between:

- UI
- Educational content
- Simulation state
- Audio recording
- Transcription
- AI evaluation
- Recommendation logic
- Persistence
- Analytics and progress

## Suggested Architecture

src/

app/
api/
academy/
courses/
lessons/
simulation/
feedback/
progress/

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

## AI Boundary

Client:

- Collect learner input.
- Record audio.
- Display transcript.
- Display validated feedback.

Server:

- Validate requests.
- Call transcription services.
- Call GPT-5.6.
- Validate AI outputs.
- Apply authorization.
- Persist results.

Never expose Groq API keys to client-side code.

## AI Prompt Management

Store major prompts separately from UI components.

Prompts should:

- Include the evaluation rubric.
- Require structured output.
- Prohibit unsupported conclusions.
- Require transcript evidence.
- Require actionable recommendations.
- Map weaknesses to real lesson identifiers.

## Validation

Validate:

- User input
- Route parameters
- Database responses when needed
- API requests
- AI structured outputs
- Environment variables

## Persistence

Persist:

- User profile
- Course progress
- Lesson completion
- Exercise completion
- Simulation attempts
- Questions
- Transcripts
- Feedback reports
- Recommended lessons

Do not store raw webcam recordings by default.

Audio storage should be optional and disclosed.

## Client Audio and Offline Boundary

- `AudioExperienceProvider` owns the two shared HTML audio elements, preference
  hydration, volume fades, sound event delegation, interview focus mode, and
  connectivity state.
- `ameego:audio-preferences:v1` stores only two booleans: background music and
  sound effects. The supplied audio files remain immutable public assets and are
  never copied into browser storage records.
- Interview Simulator publishes only an active/inactive focus event. It does not
  expose transcript or evaluation content to the audio layer.
- `public/sw.js` caches public navigation responses and same-origin GET assets.
  It ignores POST requests, including question generation, resume assistance,
  and feedback evaluation.
- Existing course, exercise, attempt, profile, and audio data remain local-first
  and continue to function offline. No remote synchronization claim is made
  until the product has an authenticated persistence service and an explicit
  consent-aware queue design.

## Error Handling

Create predictable error behavior for:

- Network failures
- AI API failures
- Invalid structured output
- Transcription failures
- Database failures
- Permission failures

Errors should provide safe retry behavior when appropriate.

## Testing Strategy

Unit tests:

- Rubric calculations
- Recommendation mapping
- Schema validation
- Progress calculations
- Exercise logic

Integration tests:

- Simulation submission
- GPT evaluation processing
- Feedback persistence
- Course progress updates

End-to-end tests:

- Complete STAR lesson
- Complete exercise
- Complete interview simulation
- View feedback
- Retry
- Compare attempts
