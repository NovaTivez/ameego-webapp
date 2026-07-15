"use client";

import {
  RESUME_FIELDS,
  type ResumeField,
  type ResumeProfile,
} from "@/lib/interview/contracts";
import { PixelFormField } from "@/components/PixelFormField";

const LABELS: Record<ResumeField, string> = {
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  leadership: "Leadership",
  achievements: "Achievements",
};

type Props = {
  profile: ResumeProfile;
  onChange: (profile: ResumeProfile) => void;
};

export function ResumeProfileEditor({ profile, onChange }: Props) {
  return (
    <div className="resume-profile-grid">
      {RESUME_FIELDS.map((field) => (
        <PixelFormField htmlFor={`resume-${field}`} label={LABELS[field]} key={field}>
          <textarea
            id={`resume-${field}`}
            rows={4}
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
        </PixelFormField>
      ))}
    </div>
  );
}
