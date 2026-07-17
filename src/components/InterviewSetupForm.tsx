"use client";

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

  return (
    <form
      className={styles.setupForm}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <section className={styles.formCard} aria-labelledby="scenario-card-title">
        <div className={styles.formSectionTitle}>
          <span>01</span>
          <div>
            <strong id="scenario-card-title">Interview Information</strong>
            <small>Choose the conversation and role you want to rehearse.</small>
          </div>
        </div>
        <div className={styles.formCardBody}>
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
                aria-describedby={
                  errors.interviewType ? "interview-type-error" : undefined
                }
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
            {errors.role ? (
              <span className={styles.fieldError}>{errors.role}</span>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.formCard} aria-labelledby="company-card-title">
        <div className={styles.formSectionTitle}>
          <span>02</span>
          <div>
            <strong id="company-card-title">Company & Practice Goals</strong>
            <small>Add only the context that should shape your questions.</small>
          </div>
        </div>
        <div className={styles.formCardBody}>
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
            {errors.goals ? (
              <span className={styles.fieldError}>{errors.goals}</span>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.formCard} aria-labelledby="settings-card-title">
        <div className={styles.formSectionTitle}>
          <span>03</span>
          <div>
            <strong id="settings-card-title">Session Settings</strong>
            <small>Choose the challenge and session length.</small>
          </div>
        </div>
        <div className={styles.selectorGrid}>
          <fieldset className={styles.selectorCard}>
            <legend>Difficulty</legend>
            <div className={styles.selectorOptions}>
              {INTERVIEW_DIFFICULTIES.map((difficulty) => (
                <label key={difficulty} data-selected={value.difficulty === difficulty}>
                  <input
                    type="radio"
                    name="interview-difficulty"
                    value={difficulty}
                    checked={value.difficulty === difficulty}
                    onChange={() => update("difficulty", difficulty)}
                  />
                  <span aria-hidden="true" />
                  <strong>{difficulty}</strong>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.selectorCard}>
            <legend>Interview length</legend>
            <div className={styles.selectorOptions}>
              {INTERVIEW_LENGTHS.map((questionCount) => (
                <label
                  key={questionCount}
                  data-selected={value.questionCount === questionCount}
                >
                  <input
                    type="radio"
                    name="interview-length"
                    value={questionCount}
                    checked={value.questionCount === questionCount}
                    onChange={() => update("questionCount", questionCount)}
                  />
                  <span aria-hidden="true" />
                  <strong>{questionCount} questions</strong>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <button className="sr-only" type="submit" tabIndex={-1} aria-hidden="true">
        Continue to resume
      </button>
    </form>
  );
}
