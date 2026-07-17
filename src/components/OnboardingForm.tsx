"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PixelButton } from "@/components/PixelButton";
import {
  type ExperienceLevel,
  type LearningGoal,
  type PracticeMode,
  saveOnboardingPreferences,
} from "@/lib/onboarding";

import styles from "@/app/onboarding/onboarding.module.css";

const goalOptions: Array<{ value: LearningGoal; label: string; description: string }> = [
  {
    value: "interview_skills",
    label: "Interview skills",
    description: "Prepare clear, evidence-based answers for roles and internships.",
  },
  {
    value: "public_speaking",
    label: "Public speaking",
    description: "Build a clear structure and delivery for spoken presentations.",
  },
  {
    value: "classroom_presentations",
    label: "Classroom presentations",
    description: "Organize and explain ideas for classes, defenses, and oral work.",
  },
  {
    value: "professional_communication",
    label: "Professional communication",
    description: "Practise clear workplace communication and self-advocacy.",
  },
];

const experienceOptions: Array<{
  value: ExperienceLevel;
  label: string;
  description: string;
}> = [
  {
    value: "new_to_practice",
    label: "New to practice",
    description: "Start with a guided, beginner-friendly pace.",
  },
  {
    value: "some_practice",
    label: "Some practice",
    description: "Build on the communication practice you already have.",
  },
  {
    value: "ready_for_challenge",
    label: "Ready for a challenge",
    description: "Start with more demanding practice prompts.",
  },
];

const practiceOptions: Array<{
  value: PracticeMode;
  label: string;
  description: string;
}> = [
  {
    value: "text",
    label: "Text first",
    description: "Type, edit, and review responses at your own pace.",
  },
  {
    value: "microphone",
    label: "Microphone first",
    description: "Speak responses and review the transcript before confirming.",
  },
];

type ChoiceGroupProps<T extends string> = {
  description: string;
  error: string;
  label: string;
  name: string;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; description: string }>;
  value: T | "";
};

function ChoiceGroup<T extends string>({
  description,
  error,
  label,
  name,
  onChange,
  options,
  value,
}: ChoiceGroupProps<T>) {
  const errorId = `${name}-error`;
  return (
    <fieldset
      className={styles.choiceGroup}
      aria-describedby={error ? errorId : undefined}
    >
      <legend>{label}</legend>
      <p>{description}</p>
      <div className={styles.choiceGrid}>
        {options.map((option) => (
          <label key={option.value} data-selected={value === option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span aria-hidden="true" />
            <strong>{option.label}</strong>
            <small>{option.description}</small>
          </label>
        ))}
      </div>
      {error ? (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      ) : null}
    </fieldset>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [learningGoal, setLearningGoal] = useState<LearningGoal | "">("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
  const [practiceMode, setPracticeMode] = useState<PracticeMode | "">("");
  const [error, setError] = useState("");

  const completeOnboarding = () => {
    if (!learningGoal || !experienceLevel || !practiceMode) {
      setError("Choose one option in each section to continue.");
      return;
    }
    try {
      saveOnboardingPreferences(window.localStorage, {
        learningGoal,
        experienceLevel,
        practiceMode,
      });
      router.push("/academy");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Your choices could not be saved on this device.",
      );
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        completeOnboarding();
      }}
      noValidate
    >
      <ChoiceGroup
        name="learning-goal"
        label="Main learning goal"
        description="Choose the communication skill you want to build first."
        value={learningGoal}
        onChange={setLearningGoal}
        options={goalOptions}
        error=""
      />
      <ChoiceGroup
        name="experience-level"
        label="Experience level"
        description="This sets the starting interview challenge level. You can change it later."
        value={experienceLevel}
        onChange={setExperienceLevel}
        options={experienceOptions}
        error=""
      />
      <ChoiceGroup
        name="practice-mode"
        label="Preferred practice mode"
        description="This preselects your response mode in the Interview Center."
        value={practiceMode}
        onChange={setPracticeMode}
        options={practiceOptions}
        error=""
      />
      {error ? (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      ) : null}
      <PixelButton type="submit">Enter Your Academy</PixelButton>
    </form>
  );
}
