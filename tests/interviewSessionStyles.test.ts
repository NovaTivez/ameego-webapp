import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/components/interview-session.module.css", "utf8");
const room = readFileSync("src/components/InterviewRoomScene.tsx", "utf8");

describe("Interview Simulator panel-9 style contract", () => {
  it("uses a dense desktop simulator grid with hard pixel framing", () => {
    expect(styles).toMatch(/\.sessionShell\s*\{[\s\S]*grid-template-columns:/);
    expect(styles).toMatch(/\.sessionShell\s*\{[\s\S]*border: 3px solid/);
    expect(styles).toMatch(/\.sessionShell\s*\{[\s\S]*box-shadow: 6px 6px 0/);
    expect(styles).toMatch(/\.mainColumn\s*\{[\s\S]*grid-template-rows:/);
  });

  it("contains the requested code-native interview-room details", () => {
    for (const detail of [
      "window",
      "certificate",
      "bookshelf",
      "floorPlant",
      "questionBubble",
      "interviewer",
      "deskPaper",
      "deskMug",
      "deskLamp",
      "floorTexture",
    ]) {
      expect(room).toContain(`styles.${detail}`);
    }
  });

  it("keeps square pixel styling, visible focus, and responsive stacking", () => {
    expect(styles).toContain(":focus-visible");
    expect(styles).toContain("@media (max-width: 760px)");
    expect(styles).toContain("grid-template-columns: 1fr");
    expect(styles).not.toMatch(
      /border-radius|linear-gradient|radial-gradient|backdrop-filter/,
    );
  });
});
