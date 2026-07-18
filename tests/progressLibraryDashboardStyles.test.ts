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
    expect(styles).toMatch(/\.heroStats\s*{[^}]*repeat\(4/);
    expect(styles).toMatch(/\.progressGuidance\s*{[^}]*repeat\(3/);
    expect(styles).toMatch(/\.skillList\s*{[^}]*grid-template-columns:\s*1fr/);
    expect(styles).toMatch(/\.attemptList\s*{[^}]*repeat\(2/);
    expect(styles).toContain(".attemptMetadata");
    expect(styles).toContain(".recommendationIcon");
  });

  it("gives each guidance widget a distinct accent, decoration, and interaction", () => {
    expect(styles).toContain(".goalCard");
    expect(styles).toContain(".lessonCard");
    expect(styles).toContain(".streakCard");
    expect(styles).toMatch(/\.cardDecoration\s*{[^}]*opacity:\s*0\.07/);
    expect(styles).toContain(".guidanceAction");
    expect(styles).toMatch(/\.guidanceCard:hover\s*{[^}]*border-color/);
  });

  it("keeps hero statistics compact, distinct, and visually lightweight", () => {
    expect(styles).toMatch(/\.heroStats article\s*{[^}]*height:\s*100px/);
    expect(styles).toMatch(/\.heroStats\s*{[^}]*repeat\(4[^}]*250px/);
    expect(styles).toMatch(/\.statIcon svg\s*{[^}]*width:\s*44px/);
    expect(styles).toContain(".lessonStat");
    expect(styles).toContain(".interviewStat");
    expect(styles).toContain(".evidenceStat");
    expect(styles).toContain(".objectiveStat");
    expect(styles).toMatch(/\.statDecoration\s*{[^}]*opacity:\s*0\.07/);
    expect(styles).toContain(".statProgress");
    expect(styles).toMatch(/\.heroStats article:hover\s*{[^}]*border-color/);
  });

  it("uses the supplied landscape only inside the full-width hero", () => {
    expect(styles).toMatch(
      /\.pageTitle\s*{[\s\S]*url\("\/images\/academy\/progress-library-header\.png"\)/,
    );
    expect(styles).toMatch(/\.pageTitle\s*{[\s\S]*background-size:\s*cover/);
    expect(styles).toMatch(/\.pageTitle::before\s*{[\s\S]*linear-gradient/);
    expect(styles.match(/progress-library-header\.png/g)).toHaveLength(1);
  });

  it("keeps the hero artwork separate from the continuous starry body", () => {
    expect(styles).toMatch(
      /\.page\s*{[\s\S]*url\("\/images\/academy\/starry-night-background\.png"\)/,
    );
    expect(styles).toMatch(/\.page\s*{[\s\S]*background-attachment:\s*fixed/);
    expect(styles).toMatch(/\.page\s*{[\s\S]*background-size:\s*cover/);
    expect(styles).toMatch(
      /\.pageTitle\s*{[\s\S]*url\("\/images\/academy\/progress-library-header\.png"\)/,
    );
    expect(styles.match(/starry-night-background\.png/g)).toHaveLength(1);
  });

  it("centers the complete hero content group", () => {
    expect(styles).toMatch(/\.heroContent\s*{[^}]*justify-items:\s*center/);
    expect(styles).toMatch(/\.heroIntro\s*{[^}]*text-align:\s*center/);
    expect(styles).toMatch(/\.heroStats\s*{[^}]*justify-content:\s*center/);
  });

  it("stacks cleanly across laptop, tablet, and narrow screens", () => {
    expect(styles).toContain("@media (max-width: 1120px)");
    expect(styles).toContain("@media (max-width: 900px)");
    expect(styles).toContain("@media (max-width: 700px)");
    expect(styles).toContain("@media (max-width: 480px)");
  });

  it("uses compact RPG body panels without changing the hero contract", () => {
    expect(styles).toMatch(/\.dashboard\s*{[^}]*gap:\s*clamp\(0\.9rem/);
    expect(styles).toMatch(/\.attemptCard\s*{[^}]*min-height:\s*310px/);
    expect(styles).toMatch(/\.attemptMetadata div\s*{[^}]*min-height:\s*54px/);
    expect(styles).toMatch(/\.activityList li\s*{[^}]*min-height:\s*58px/);
    expect(styles).toContain(".compactEmpty");
    expect(styles).toContain(".completionProgress");
    expect(styles).toContain(".comparisonSelectors");
  });

  it("fits destructive attempt actions into the pixel dashboard", () => {
    expect(styles).toContain(".attemptActions");
    expect(styles).toContain(".deleteAttemptButton");
    expect(styles).toContain(".deleteDialogBackdrop");
    expect(styles).toContain(".deleteDialog");
    expect(styles).toMatch(/\.deleteDialog\s*{[^}]*width:\s*min\(100%, 540px\)/);
  });
});
