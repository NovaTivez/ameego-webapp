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
      /@media \(max-width: 820px\)[\s\S]*?\.interview-complete-hero-grid\s*{[^}]*grid-template-columns:\s*1fr/,
    );
    expect(globalStyles).toMatch(
      /\.feedback-transcript-panel > ol\s*{[^}]*grid-template-columns:\s*1fr/,
    );
    expect(globalStyles).toMatch(
      /@media \(max-width: 820px\)[\s\S]*?\.feedback-transcript-panel > ol\s*{[^}]*grid-template-columns:\s*1fr/,
    );
    expect(globalStyles).toMatch(
      /\.feedback-complete-coach\s*{[^}]*width:\s*clamp\(345px, 29vw, 410px\)/,
    );
    expect(globalStyles).toMatch(
      /\.interview-complete-hero-grid\s*{[^}]*align-items:\s*stretch/,
    );
    expect(globalStyles).toMatch(
      /body:has\(\.interview-results-mode\) \.site-header\s*{[^}]*min-height:\s*72px/,
    );
    expect(globalStyles).toMatch(
      /\.feedback-progress-tracker li\s*{[^}]*min-height:\s*78px/,
    );
    expect(globalStyles).toContain('.feedback-progress-tracker li[aria-current="step"]');
    expect(globalStyles).toContain(".transcript-saved-time");
    expect(globalStyles).toContain(".transcript-answer-copy");
    expect(globalStyles).toMatch(
      /\.feedback-transcript-panel > ol\s*{[^}]*grid-auto-rows:\s*1fr/,
    );
    expect(globalStyles).toContain("overflow-wrap: anywhere");
    expect(globalStyles).not.toMatch(
      /\.(?:interview-feedback-report|feedback-transcript-panel|feedback-quick-actions)\s*{[^}]*overflow-y:\s*(?:auto|scroll)/,
    );
    expect(globalStyles).toContain(".interview-final-action");
    expect(globalStyles).toContain(".feedback-progress-tracker");
    expect(globalStyles).toContain(".feedback-transcript-panel");
    expect(globalStyles).toContain(".feedback-quick-actions");
    expect(globalStyles).not.toMatch(
      /body:has\(\.interview-results-mode\) \.site-header nav/,
    );
  });

  it("uses four real-activity stats, skill bars, and recent activity", () => {
    expect(progress).toMatch(/\.heroStats\s*\{[\s\S]*repeat\(4/);
    expect(progress).toContain(".skillTrack");
    expect(progress).toContain(".activityList");
    expect(progress).toContain(".recommendation");
  });

  it("uses left settings navigation, profile fields, XP, and danger actions", () => {
    expect(settings).toMatch(
      /\.settingsLayout\s*\{[\s\S]*grid-template-columns:\s*218px/,
    );
    expect(settings).toMatch(/\.settingsNav\s*\{[\s\S]*position:\s*sticky/);
    expect(settings).not.toMatch(/overflow-y:\s*(auto|scroll)/);
    expect(settings).toContain(".profileForm");
    expect(settings).toContain(".xpTrack");
    expect(settings).toContain(".dangerActions");
    expect(settings).toContain("starry-night-background.png");
    expect(settings).toContain(".avatarPicker");
    expect(settings).toContain('.audioToggleGrid button[aria-checked="true"]');
  });

  it("keeps all three surfaces square and free of glass effects", () => {
    for (const stylesheet of [feedback, progress, settings]) {
      expect(stylesheet).not.toMatch(/border-radius|backdrop-filter/i);
      expect(stylesheet).toContain(":focus-visible");
    }
    for (const stylesheet of [feedback, settings]) {
      expect(stylesheet).not.toMatch(/gradient/i);
    }
  });
});
