import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/components/progress-dashboard.module.css", "utf8");

describe("Progress Library full-page layout", () => {
  it("fills the viewport and leaves vertical scrolling to the browser", () => {
    expect(styles).toMatch(/\.page\s*{[^}]*width:\s*100%/);
    expect(styles).toMatch(/\.page\s*{[^}]*min-height:\s*100vh/);
    expect(styles).not.toMatch(/overflow-y:\s*(?:auto|scroll)/);
    expect(styles).not.toMatch(/(?<!min-)height:\s*100vh/);
  });

  it("uses balanced statistics, skill cards, and simulation card grids", () => {
    expect(styles).toMatch(/\.statGrid\s*{[^}]*repeat\(4/);
    expect(styles).toMatch(/\.skillList\s*{[^}]*repeat\(2/);
    expect(styles).toMatch(/\.attemptList\s*{[^}]*repeat\(2/);
    expect(styles).toContain(".attemptMetadata");
    expect(styles).toContain(".recommendationIcon");
  });

  it("stacks cleanly across laptop, tablet, and narrow screens", () => {
    expect(styles).toContain("@media (max-width: 1120px)");
    expect(styles).toContain("@media (max-width: 900px)");
    expect(styles).toContain("@media (max-width: 700px)");
    expect(styles).toContain("@media (max-width: 480px)");
  });
});
