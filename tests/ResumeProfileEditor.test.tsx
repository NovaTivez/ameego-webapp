import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { ResumeProfileEditor } from "@/components/ResumeProfileEditor";
import { EMPTY_RESUME_PROFILE, type ResumeProfile } from "@/lib/interview/contracts";

function EditorHarness() {
  const [profile, setProfile] = useState<ResumeProfile>({
    ...EMPTY_RESUME_PROFILE,
    education: ["BS Computer Science"],
    skills: ["TypeScript"],
  });
  return (
    <>
      <ResumeProfileEditor profile={profile} onChange={setProfile} />
      <output aria-label="resume profile value">{JSON.stringify(profile)}</output>
    </>
  );
}

describe("ResumeProfileEditor", () => {
  it("allows natural spaces, punctuation, and multiple one-item-per-line entries", async () => {
    const user = userEvent.setup();
    render(<EditorHarness />);

    const education = screen.getByLabelText("Education");
    await user.clear(education);
    await user.type(
      education,
      "Bachelor of Science in Computer Science, 2025.{enter}Dean's List — 2024.",
    );

    expect(education).toHaveValue(
      "Bachelor of Science in Computer Science, 2025.\nDean's List — 2024.",
    );
    expect(screen.getByLabelText("resume profile value")).toHaveTextContent(
      '"education":["Bachelor of Science in Computer Science, 2025.","Dean\'s List — 2024."]',
    );
  });

  it("preserves a trailing space while typing and removes a deleted item", async () => {
    const user = userEvent.setup();
    render(<EditorHarness />);

    const skills = screen.getByLabelText("Skills");
    await user.click(skills);
    await user.type(skills, " and CSS");
    expect(skills).toHaveValue("TypeScript and CSS");

    await user.clear(skills);
    await user.type(skills, "React ");
    expect(skills).toHaveValue("React ");
    expect(screen.getByLabelText("resume profile value")).toHaveTextContent(
      '"skills":["React"]',
    );

    await user.clear(skills);
    expect(screen.getByLabelText("resume profile value")).toHaveTextContent(
      '"skills":[]',
    );
  });
});
