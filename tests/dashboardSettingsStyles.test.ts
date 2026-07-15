import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const feedback = readFileSync("src/components/evaluation-feedback.module.css", "utf8");
const progress = readFileSync("src/components/progress-dashboard.module.css", "utf8");
const settings = readFileSync("src/components/settings-panel.module.css", "utf8");

describe("feedback, progress, and settings pixel style contracts", () => {
  it("uses compact two-column feedback panels and rubric rows", () => {
    expect(feedback).toMatch(/\.report\s*\{[\s\S]*grid-template-columns:/);
    expect(feedback).toContain(".rubricPanel");
    expect(feedback).toContain(".guidanceGrid");
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
