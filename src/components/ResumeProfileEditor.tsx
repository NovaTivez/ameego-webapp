"use client";

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
  return (
    <div className={styles.resumeSummaryGrid}>
      {RESUME_FIELDS.map((field) => (
        <div className={styles.resumeSummaryField} key={field}>
          <PixelIcon name={ICONS[field]} size="small" />
          <label htmlFor={`resume-${field}`}>{LABELS[field]}</label>
          <textarea
            id={`resume-${field}`}
            rows={2}
            value={profile[field].join("\n")}
            onChange={(event) =>
              onChange({
                ...profile,
                [field]: event.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            placeholder={`One ${LABELS[field].toLowerCase()} item per line`}
          />
        </div>
      ))}
    </div>
  );
}
