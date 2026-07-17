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
    expect(styles).toMatch(/\.quickActions\s*{\s*grid-template-columns:\s*repeat\(2/);
  });
});
