import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const feedback = readFileSync("src/components/evaluation-feedback.module.css", "utf8");
const globalStyles = readFileSync("src/app/globals.css", "utf8");
const progress = readFileSync("src/components/progress-dashboard.module.css", "utf8");
const settings = readFileSync("src/components/settings-panel.module.css", "utf8");

describe("feedback, progress, and settings pixel style contracts", () => {
  it("uses spacious report sections with responsive score and rubric grids", () => {
    expect(feedback).toMatch(/\.report\s*\{[\s\S]*gap:/);
    expect(feedback).toContain(".overallGrid");
    expect(feedback).toContain(".rubricGrid");
    expect(feedback).toContain(".guidanceGrid");
    expect(feedback).toContain(".evidenceGrid");
    expect(feedback).toContain(".actionList");
  });

  it("lets completed results fill the page and stack naturally on narrow screens", () => {
    expect(globalStyles).toMatch(
      /\.interview-simulator\.interview-results-mode\s*{[^}]*width:\s*100%;[^}]*max-width:\s*none/,
    );
    expect(globalStyles).toMatch(
      /\.interview-feedback-report\s*{[^}]*width:\s*100%;[^}]*scroll-margin-top:/,
    );
    expect(globalStyles).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.interview-feedback-report \.evaluation-request\s*{[^}]*grid-template-columns:\s*1fr/,
    );
    expect(globalStyles).toContain(".interview-final-action");
  });

  it("uses four real-activity stats, skill bars, and recent activity", () => {
    expect(progress).toMatch(/\.statGrid\s*\{[\s\S]*repeat\(4/);
    expect(progress).toContain(".skillTrack");
    expect(progress).toContain(".activityList");
    expect(progress).toContain(".recommendation");
  });

  it("uses left settings navigation, profile fields, XP, and danger actions", () => {
    expect(settings).toMatch(
      /\.settingsLayout\s*\{[\s\S]*grid-template-columns:\s*210px/,
    );
    expect(settings).toContain(".profileForm");
    expect(settings).toContain(".xpTrack");
    expect(settings).toContain(".dangerActions");
  });

  it("keeps all three surfaces square and free of gradients and glass", () => {
    for (const stylesheet of [feedback, progress, settings]) {
      expect(stylesheet).not.toMatch(/border-radius|gradient|backdrop-filter/i);
      expect(stylesheet).toContain(":focus-visible");
    }
  });
});
