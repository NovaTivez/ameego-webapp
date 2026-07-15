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

Never expose OpenAI API keys to client-side code.

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