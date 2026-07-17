import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/components/academy-lesson.module.css", "utf8");

describe("Academy lesson style contract", () => {
  it("uses a full-width, naturally scrolling lesson page", () => {
    expect(styles).toMatch(/\.lessonPage\s*{[\s\S]*?width:\s*min\(100%,\s*1320px\)/);
    expect(styles).toMatch(/\.lessonPage\s*{[\s\S]*?min-height:/);
    expect(styles).not.toMatch(/\.lessonPage\s*{[\s\S]*?overflow-y:\s*(auto|scroll)/);
    expect(styles).not.toMatch(/\.exercisePanel\s*{[\s\S]*?overflow-y:\s*(auto|scroll)/);
  });

  it("provides pixel lesson, exercise, reward, and camera surfaces", () => {
    expect(styles).toContain(".lessonHero");
    expect(styles).toContain(".learningPanel");
    expect(styles).toContain(".exercisePanel");
    expect(styles).toContain(".finishBar");
    expect(styles).toContain(".rewardReveal");
    expect(styles).toContain(".cameraWorkspace");
    expect(styles).toContain(".practiceIndicators");
  });

  it("keeps hard pixel styling without gradients, glass, or rounded cards", () => {
    expect(styles).not.toMatch(/gradient/i);
    expect(styles).not.toMatch(/backdrop-filter/i);
    expect(styles).not.toMatch(/border-radius/i);
    expect(styles).toMatch(/\.lessonHero,[\s\S]*?6px 6px 0/);
  });

  it("adapts the dedicated exercise page for laptop, tablet, and phone widths", () => {
    expect(styles).toMatch(/@media \(max-width:\s*980px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*700px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*500px\)/);
  });
});
