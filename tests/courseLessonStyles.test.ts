import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/components/course-pages.module.css", "utf8");
const globalStyles = readFileSync("src/app/globals.css", "utf8");

describe("Courses and Lesson page style contract", () => {
  it("builds a full-width academy dashboard and RPG lesson-card path", () => {
    expect(styles).toMatch(/\.academyScreen\s*{[\s\S]*?max-width:\s*1440px/);
    expect(styles).toContain(".academyHero");
    expect(styles).toContain(".dashboardStats");
    expect(styles).toContain(".currentQuest");
    expect(styles).toContain(".badgeShelf");
    expect(styles).toContain(".curriculum");
    expect(styles).toMatch(/\.lessonCardGrid\s*{[\s\S]*?grid-template-columns:/);
    expect(styles).toContain(".lessonCardLocked");
    expect(styles).toContain(".lessonCardComplete");
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

  it("adapts the academy and lesson layouts for desktop, tablet, and mobile", () => {
    expect(styles).toMatch(/@media \(max-width:\s*1040px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*780px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*540px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*820px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*680px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*480px\)/);
  });

  it("keeps academy content on the browser scrollbar without nested scrolling", () => {
    expect(styles).not.toMatch(/\.academyScreen\s*{[\s\S]*?overflow-y:\s*(auto|scroll)/);
    expect(styles).not.toMatch(/\.curriculum\s*{[\s\S]*?overflow-y:\s*(auto|scroll)/);
    expect(styles).not.toMatch(/\.lessonCardGrid\s*{[\s\S]*?overflow-y:\s*(auto|scroll)/);
  });

  it("uses compact state-aware RPG widgets throughout the Courses body", () => {
    expect(styles).toMatch(/\.academyScreen\s*{[^}]*gap:\s*12px/);
    expect(styles).toMatch(/\.dashboardStats > div\s*{[^}]*min-height:\s*62px/);
    expect(styles).toContain(".currentQuestMeta");
    expect(styles).toMatch(
      /\.currentQuest :global\(\.pixel-button\)\s*{[^}]*min-height:\s*50px/,
    );
    expect(styles).toMatch(/\.badgeShelf li\s*{[^}]*min-height:\s*66px/);
    expect(styles).toContain(".badgeCurrent");
    expect(styles).toMatch(/\.phaseHeader\s*{[^}]*min-height:\s*64px/);
    expect(styles).toMatch(/\.lessonCard\s*{[^}]*min-height:\s*116px/);
    expect(styles).toContain(".lessonCardCurrent");
    expect(styles).toMatch(/\.lessonCard::after\s*{[^}]*opacity:\s*0\.06/);
    expect(styles).toMatch(/\.phaseReward span\s*{[^}]*border:/);
  });

  it("uses one continuous star field across every Courses Building route", () => {
    expect(globalStyles).toMatch(
      /body:has\(\.course-page\) \.site-shell,[\s\S]*body:has\(\.exercise-page\) \.site-shell\s*{/,
    );
    expect(globalStyles).toMatch(
      /body:has\(\.course-page\) \.site-shell,[\s\S]*url\("\/images\/academy\/starry-night-background\.png"\)/,
    );
    expect(globalStyles).toMatch(
      /body:has\(\.course-page\) \.site-shell,[\s\S]*background-attachment:\s*fixed/,
    );
    expect(globalStyles).toMatch(
      /body:has\(\.course-page\) \.site-shell,[\s\S]*background-size:\s*cover/,
    );
    expect(globalStyles.match(/starry-night-background\.png/g)).toHaveLength(1);
  });
});
