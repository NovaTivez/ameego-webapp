import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync("src/components/academy-dashboard.module.css", "utf8");

describe("Academy dashboard responsive layout", () => {
  it("uses full-width browser-owned page flow without nested scrolling", () => {
    expect(styles).toMatch(/\.dashboardPage\s*{[^}]*width:\s*100%/);
    expect(styles).toMatch(/\.dashboardPage\s*{[^}]*min-height:\s*100vh/);
    expect(styles).not.toMatch(/overflow-y:\s*(?:auto|scroll)/);
    expect(styles).not.toMatch(/(?<!min-)height:\s*100vh/);
  });

  it("adapts the dashboard and action grids for laptop, tablet, and mobile", () => {
    expect(styles).toContain("@media (max-width: 1100px)");
    expect(styles).toContain("@media (max-width: 820px)");
    expect(styles).toContain("@media (max-width: 620px)");
    expect(styles).toMatch(
      /\.dashboardBody,\s*\n\s*\.journeyGrid\s*{\s*grid-template-columns:\s*1fr/,
    );
    expect(styles).toMatch(
      /\.quickActions\s*{[\s\S]*?grid-template-columns:\s*repeat\(4/,
    );
    expect(styles).toMatch(
      /@media \(max-width: 1100px\)[\s\S]*?\.quickActions\s*{\s*grid-template-columns:\s*repeat\(2/,
    );
  });

  it("keeps the academy hero above the continuous starry page background", () => {
    expect(styles).toMatch(
      /\.dashboardPage\s*{[\s\S]*url\("\/images\/academy\/starry-night-background\.png"\)/,
    );
    expect(styles).toMatch(/\.dashboardPage\s*{[\s\S]*background-size:\s*cover/);
    expect(styles).toMatch(/\.dashboardPage\s*{[\s\S]*background-attachment:\s*fixed/);
    expect(styles).toMatch(
      /\.hero\s*{[\s\S]*url\("\/images\/academy\/night-academy-background\.png"\)/,
    );
    expect(styles).toMatch(/\.hero\s*{[\s\S]*background-size:\s*cover/);
    expect(styles).toMatch(/\.hero\s*{[\s\S]*background-position:\s*center/);
    expect(styles).toMatch(/\.hero\s*{[\s\S]*padding:\s*clamp\(4rem,\s*7vw,\s*7rem\)/);
    expect(styles).toMatch(/\.hero::before\s*{[\s\S]*linear-gradient/);
    expect(styles.match(/starry-night-background\.png/g)).toHaveLength(1);
    expect(styles.match(/night-academy-background\.png/g)).toHaveLength(1);
  });

  it("uses compact, section-accented RPG widgets only in the dashboard body", () => {
    expect(styles).toMatch(
      /\.dashboardBody\s*{[^}]*gap:\s*clamp\(0\.85rem,\s*1\.8vw,\s*1\.6rem\)/,
    );
    expect(styles).toMatch(
      /\.dashboardBody\s*{[^}]*margin:\s*clamp\(0\.6rem,\s*1\.4vw,\s*1\.25rem\) auto 0/,
    );
    expect(styles).toMatch(/\.panel::after\s*{[^}]*opacity:\s*0\.06/);
    expect(styles).toMatch(/\.questCard:hover\s*{[^}]*transform:\s*translateY\(-2px\)/);
    expect(styles).toMatch(/\.missionList em\s*{[^}]*border:\s*2px solid/);
    expect(styles).toMatch(/\.weekCalendar i\s*{[^}]*max-width:\s*42px/);
    expect(styles).toMatch(/\.activityList::before\s*{[^}]*content:\s*""/);
    expect(styles).toMatch(/\.statGrid article\s*{[^}]*min-height:\s*112px/);
    expect(styles).toMatch(/\.badgeGrid li\s*{[^}]*min-height:\s*155px/);
    expect(styles).toMatch(/\.timeline li > div\s*{[^}]*border:\s*2px solid/);
    expect(styles).toMatch(/\.certificateList small\s*{[^}]*background:/);
  });
});
