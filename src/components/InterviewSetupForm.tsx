"use client";

import { PixelButton } from "@/components/PixelButton";
import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_LENGTHS,
  INTERVIEW_TYPES,
  type InterviewSetup,
} from "@/lib/interview/contracts";

const TYPE_LABELS: Record<InterviewSetup["interviewType"], string> = {
  job: "Job",
  internship: "Internship",
  student_organization: "Student organization",
  scholarship: "Scholarship",
  university_admission: "University admission",
  leadership_position: "Leadership position",
  volunteer_position: "Volunteer position",
  custom: "Custom",
};

type Props = {
  value: InterviewSetup;
  errors: Record<string, string>;
  onChange: (value: InterviewSetup) => void;
  onSubmit: () => void;
};

export function InterviewSetupForm({ value, errors, onChange, onSubmit }: Props) {
  const update = <Key extends keyof InterviewSetup>(
    key: Key,
    nextValue: InterviewSetup[Key],
  ) => onChange({ ...value, [key]: nextValue });

  return (
    <form
      className="interview-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <div className="interview-field">
        <label htmlFor="interview-type">Interview type</label>
        <select
          id="interview-type"
          value={value.interviewType}
          onChange={(event) =>
            update("interviewType", event.target.value as InterviewSetup["interviewType"])
          }
          aria-describedby={errors.interviewType ? "interview-type-error" : undefined}
        >
          {INTERVIEW_TYPES.map((type) => (
            <option key={type} value={type}>
              {TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        {errors.interviewType ? (
          <span className="field-error" id="interview-type-error">
            {errors.interviewType}
          </span>
        ) : null}
      </div>

      {value.interviewType === "custom" ? (
        <div className="interview-field">
          <label htmlFor="custom-interview-type">Custom interview type</label>
          <input
            id="custom-interview-type"
            value={value.customInterviewType}
            onChange={(event) => update("customInterviewType", event.target.value)}
            aria-invalid={Boolean(errors.customInterviewType)}
            aria-describedby={
              errors.customInterviewType ? "custom-interview-type-error" : undefined
            }
          />
          {errors.customInterviewType ? (
            <span className="field-error" id="custom-interview-type-error">
              {errors.customInterviewType}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="interview-field-grid">
        <div className="interview-field">
          <label htmlFor="interview-role">Position or role</label>
          <input
            id="interview-role"
            value={value.role}
            onChange={(event) => update("role", event.target.value)}
            aria-invalid={Boolean(errors.role)}
            aria-describedby={errors.role ? "interview-role-error" : undefined}
          />
          {errors.role ? (
            <span className="field-error" id="interview-role-error">
              {errors.role}
            </span>
          ) : null}
        </div>
        <div className="interview-field">
          <label htmlFor="interview-organization">Organization or company</label>
          <input
            id="interview-organization"
            value={value.organization}
            onChange={(event) => update("organization", event.target.value)}
            aria-invalid={Boolean(errors.organization)}
            aria-describedby={
              errors.organization ? "interview-organization-error" : undefined
            }
          />
          {errors.organization ? (
            <span className="field-error" id="interview-organization-error">
              {errors.organization}
            </span>
          ) : null}
        </div>
      </div>

      <div className="interview-field">
        <label htmlFor="interview-description">
          Job description or responsibilities <span>(optional)</span>
        </label>
        <textarea
          id="interview-description"
          value={value.description}
          onChange={(event) => update("description", event.target.value)}
          rows={5}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? "interview-description-error" : undefined
          }
        />
        {errors.description ? (
          <span className="field-error" id="interview-description-error">
            {errors.description}
          </span>
        ) : null}
      </div>

      <div className="interview-field">
        <label htmlFor="interview-goals">
          Practice goals <span>(optional)</span>
        </label>
        <textarea
          id="interview-goals"
          value={value.goals}
          onChange={(event) => update("goals", event.target.value)}
          rows={3}
          aria-invalid={Boolean(errors.goals)}
          aria-describedby={errors.goals ? "interview-goals-error" : undefined}
        />
        {errors.goals ? (
          <span className="field-error" id="interview-goals-error">
            {errors.goals}
          </span>
        ) : null}
      </div>

      <fieldset className="interview-choice-group">
        <legend>Difficulty</legend>
        <div className="choice-row">
          {INTERVIEW_DIFFICULTIES.map((difficulty) => (
            <label key={difficulty}>
              <input
                type="radio"
                name="difficulty"
                value={difficulty}
                checked={value.difficulty === difficulty}
                onChange={() => update("difficulty", difficulty)}
              />
              <span>{difficulty}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="interview-choice-group">
        <legend>Interview length</legend>
        <div className="choice-row">
          {INTERVIEW_LENGTHS.map((length) => (
            <label key={length}>
              <input
                type="radio"
                name="question-count"
                value={length}
                checked={value.questionCount === length}
                onChange={() => update("questionCount", length)}
              />
              <span>{length} questions</span>
            </label>
          ))}
        </div>
      </fieldset>

      <PixelButton type="submit">Continue to resume</PixelButton>
    </form>
  );
}
