import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/components/course-pages.module.css", "utf8");

describe("Courses and Lesson page style contract", () => {
  it("builds a compact course menu with a separate progress and portrait panel", () => {
    expect(styles).toMatch(/\.courseLayout\s*{[\s\S]*?grid-template-columns:/);
    expect(styles).toMatch(/\.moduleList\s*{[\s\S]*?gap:\s*6px/);
    expect(styles).toMatch(/\.moduleLink,[\s\S]*?min-height:\s*62px/);
    expect(styles).toContain(".courseStatus");
    expect(styles).toContain(".progressTrack");
    expect(styles).toContain(".portrait");
  });

  it("builds an original code-native STAR illustration and dense lesson cover", () => {
    expect(styles).toMatch(/\.lessonCover\s*{[\s\S]*?grid-template-columns:/);
    expect(styles).toContain(".starIllustration");
    expect(styles).toContain(".starOutline");
    expect(styles).toContain(".starShape");
    expect(styles).toContain(".letterS");
    expect(styles).toContain(".letterT");
    expect(styles).toContain(".letterA");
    expect(styles).toContain(".letterR");
  });

  it("uses hard pixel styling without gradients, glass, or rounded cards", () => {
    expect(styles).not.toMatch(/gradient/i);
    expect(styles).not.toMatch(/backdrop-filter/i);
    expect(styles).not.toMatch(/border-radius/i);
    expect(styles).toMatch(/\.lessonCover\s*{[\s\S]*?6px 6px 0/);
  });

  it("adapts both dense layouts for tablet and mobile widths", () => {
    expect(styles).toMatch(/@media \(max-width:\s*820px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*680px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*480px\)/);
  });
});
