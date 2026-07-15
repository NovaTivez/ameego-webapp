"use client";

import { PixelButton } from "@/components/PixelButton";
import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_LENGTHS,
  INTERVIEW_TYPES,
  type InterviewSetup,
} from "@/lib/interview/contracts";

import styles from "./interview-preparation.module.css";

const TYPE_LABELS: Record<InterviewSetup["interviewType"], string> = {
  job: "Job interview",
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

  const difficultyIndex = INTERVIEW_DIFFICULTIES.indexOf(value.difficulty);
  const lengthIndex = INTERVIEW_LENGTHS.indexOf(value.questionCount);

  return (
    <form
      className={styles.setupForm}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <ol className={styles.setupJourney} aria-label="Interview preparation steps">
        <li aria-current="step">
          <span aria-hidden="true">1</span>
          <strong>Scenario</strong>
          <small>Current</small>
        </li>
        <li>
          <span aria-hidden="true">2</span>
          <strong>Resume</strong>
          <small>Next</small>
        </li>
        <li>
          <span aria-hidden="true">3</span>
          <strong>Review</strong>
          <small>Final check</small>
        </li>
      </ol>

      <div className={styles.formSectionTitle}>
        <span>01</span>
        <div>
          <strong>Build your scenario</strong>
          <small>Choose the conversation you want to rehearse.</small>
        </div>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="interview-type">Interview type</label>
        <div className={styles.selectWrap}>
          <select
            id="interview-type"
            value={value.interviewType}
            onChange={(event) =>
              update(
                "interviewType",
                event.target.value as InterviewSetup["interviewType"],
              )
            }
            aria-describedby={errors.interviewType ? "interview-type-error" : undefined}
          >
            {INTERVIEW_TYPES.map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <span aria-hidden="true">▼</span>
        </div>
        {errors.interviewType ? (
          <span className={styles.fieldError} id="interview-type-error">
            {errors.interviewType}
          </span>
        ) : null}
      </div>

      {value.interviewType === "custom" ? (
        <div className={styles.formRow}>
          <label htmlFor="custom-interview-type">Custom interview type</label>
          <input
            id="custom-interview-type"
            value={value.customInterviewType}
            onChange={(event) => update("customInterviewType", event.target.value)}
            aria-invalid={Boolean(errors.customInterviewType)}
          />
          {errors.customInterviewType ? (
            <span className={styles.fieldError}>{errors.customInterviewType}</span>
          ) : null}
        </div>
      ) : null}

      <div className={styles.formRow}>
        <label htmlFor="interview-role">Position or role</label>
        <input
          id="interview-role"
          value={value.role}
          onChange={(event) => update("role", event.target.value)}
          aria-invalid={Boolean(errors.role)}
          placeholder="Software engineer intern"
        />
        {errors.role ? <span className={styles.fieldError}>{errors.role}</span> : null}
      </div>

      <div className={styles.formSectionTitle}>
        <span>02</span>
        <div>
          <strong>Set your practice focus</strong>
          <small>Add only the context that should shape your questions.</small>
        </div>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="interview-organization">Organization or company</label>
        <input
          id="interview-organization"
          value={value.organization}
          onChange={(event) => update("organization", event.target.value)}
          aria-invalid={Boolean(errors.organization)}
          placeholder="Organization name"
        />
        {errors.organization ? (
          <span className={styles.fieldError}>{errors.organization}</span>
        ) : null}
      </div>

      <div className={styles.formRow}>
        <label htmlFor="interview-description">
          Job description <span>(optional)</span>
        </label>
        <textarea
          id="interview-description"
          value={value.description}
          onChange={(event) => update("description", event.target.value)}
          rows={2}
          aria-invalid={Boolean(errors.description)}
          placeholder="Key responsibilities and requirements"
        />
        {errors.description ? (
          <span className={styles.fieldError}>{errors.description}</span>
        ) : null}
      </div>

      <div className={styles.formRow}>
        <label htmlFor="interview-goals">
          Practice goals <span>(optional)</span>
        </label>
        <textarea
          id="interview-goals"
          value={value.goals}
          onChange={(event) => update("goals", event.target.value)}
          rows={2}
          aria-invalid={Boolean(errors.goals)}
          placeholder="Improve confidence and clarity"
        />
        {errors.goals ? <span className={styles.fieldError}>{errors.goals}</span> : null}
      </div>

      <div className={styles.formSectionTitle}>
        <span>03</span>
        <div>
          <strong>Choose the session pace</strong>
          <small>Adjust challenge and length before continuing.</small>
        </div>
      </div>

      <div className={styles.stepControlGrid}>
        <fieldset className={styles.stepControl}>
          <legend>Difficulty</legend>
          <button
            type="button"
            onClick={() =>
              update("difficulty", INTERVIEW_DIFFICULTIES[difficultyIndex - 1])
            }
            disabled={difficultyIndex === 0}
            aria-label="Previous difficulty"
          >
            −
          </button>
          <output aria-live="polite">{value.difficulty}</output>
          <button
            type="button"
            onClick={() =>
              update("difficulty", INTERVIEW_DIFFICULTIES[difficultyIndex + 1])
            }
            disabled={difficultyIndex === INTERVIEW_DIFFICULTIES.length - 1}
            aria-label="Next difficulty"
          >
            +
          </button>
        </fieldset>

        <fieldset className={styles.stepControl}>
          <legend>Interview length</legend>
          <button
            type="button"
            onClick={() => update("questionCount", INTERVIEW_LENGTHS[lengthIndex - 1])}
            disabled={lengthIndex === 0}
            aria-label="Fewer interview questions"
          >
            −
          </button>
          <output aria-live="polite">{value.questionCount} questions</output>
          <button
            type="button"
            onClick={() => update("questionCount", INTERVIEW_LENGTHS[lengthIndex + 1])}
            disabled={lengthIndex === INTERVIEW_LENGTHS.length - 1}
            aria-label="More interview questions"
          >
            +
          </button>
        </fieldset>
      </div>

      <div className={styles.formAction}>
        <PixelButton type="submit">
          <span className="sr-only">Continue to resume</span>
          <span aria-hidden="true">Continue</span>
        </PixelButton>
      </div>
    </form>
  );
}
