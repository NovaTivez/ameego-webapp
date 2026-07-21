"use client";

import { useState } from "react";

import { PixelIcon, type PixelIconName } from "@/components/PixelIcon";
import {
  RESUME_FIELDS,
  type ResumeField,
  type ResumeProfile,
} from "@/lib/interview/contracts";

import styles from "./interview-preparation.module.css";

const LABELS: Record<ResumeField, string> = {
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  leadership: "Leadership",
  achievements: "Achievements",
};

const ICONS: Record<ResumeField, PixelIconName> = {
  education: "lesson",
  experience: "building",
  projects: "progress",
  skills: "star",
  leadership: "speech",
  achievements: "check",
};

type Props = {
  profile: ResumeProfile;
  onChange: (profile: ResumeProfile) => void;
};

export function ResumeProfileEditor({ profile, onChange }: Props) {
  const [drafts, setDrafts] = useState<Record<ResumeField, string>>(
    () =>
      Object.fromEntries(
        RESUME_FIELDS.map((field) => [field, profile[field].join("\n")]),
      ) as Record<ResumeField, string>,
  );

  const updateField = (field: ResumeField, value: string) => {
    setDrafts((current) => ({ ...current, [field]: value }));
    onChange({
      ...profile,
      [field]: value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 20),
    });
  };

  return (
    <div className={styles.resumeSummaryGrid}>
      {RESUME_FIELDS.map((field) => (
        <div className={styles.resumeSummaryField} key={field}>
          <PixelIcon name={ICONS[field]} size="small" />
          <label htmlFor={`resume-${field}`}>{LABELS[field]}</label>
          <textarea
            id={`resume-${field}`}
            rows={2}
            value={drafts[field]}
            onChange={(event) => updateField(field, event.target.value)}
            placeholder={`One ${LABELS[field].toLowerCase()} item per line`}
            spellCheck
            wrap="soft"
          />
        </div>
      ))}
    </div>
  );
}
