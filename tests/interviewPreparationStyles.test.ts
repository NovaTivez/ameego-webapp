import { readFileSync, statSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/components/interview-preparation.module.css", "utf8");

describe("Interview preparation page style contract", () => {
  it("uses a fullscreen game layout with a persistent session summary", () => {
    expect(styles).toMatch(/\.preparationScreen\s*{[\s\S]*?grid-template-areas:/);
    expect(styles).toMatch(
      /\.preparationScreen\s*{[\s\S]*?min-height:\s*calc\(100svh - 68px\)/,
    );
    expect(styles).toMatch(/\.preparationScreen\s*{[\s\S]*?overflow:\s*visible/);
    expect(styles).toMatch(/\.preparationSummary\s*{[\s\S]*?position:\s*sticky/);
    expect(styles).toMatch(/\.preparationSummary\s*{[\s\S]*?grid-area:\s*summary/);
    expect(styles).toMatch(/\.summaryAction\s*{[\s\S]*?bottom:\s*0/);
    expect(styles).toMatch(
      /\.summaryList\s*{[\s\S]*?flex:\s*1;[\s\S]*?grid-auto-rows:\s*minmax\(48px, 1fr\);[\s\S]*?align-content:\s*stretch/,
    );
    expect(styles).toMatch(
      /\.summaryList > div\s*{[\s\S]*?align-items:\s*center;[\s\S]*?border-bottom:/,
    );
    expect(styles).toMatch(
      /\.summaryAction\s*{[\s\S]*?flex:\s*none;[\s\S]*?margin-top:\s*0/,
    );
    expect(styles).toMatch(
      /\.summaryHeader h2\s*{[\s\S]*?font-size:\s*0\.94rem;[\s\S]*?font-weight:\s*900;[\s\S]*?line-height:\s*1\.35/,
    );
    expect(styles).toMatch(
      /\.summaryList dt\s*{[\s\S]*?font-size:\s*0\.59rem;[\s\S]*?font-weight:\s*900;[\s\S]*?line-height:\s*1\.5/,
    );
    expect(styles).toMatch(
      /\.summaryList dd\s*{[\s\S]*?font-size:\s*0\.79rem;[\s\S]*?font-weight:\s*700;[\s\S]*?line-height:\s*1\.55/,
    );
  });

  it("uses one continuous browser scrollbar without nested setup scroll regions", () => {
    expect(styles).toMatch(
      /:global\(body\):has\(\.preparationScreen\)\s*{[\s\S]*?overflow-y:\s*auto;[\s\S]*?scroll-behavior:\s*smooth/,
    );
    expect(styles).toMatch(
      /:global\(body\):has\(\.modeSelectionScreen\)\s*{[\s\S]*?overflow-y:\s*auto;[\s\S]*?scroll-behavior:\s*smooth/,
    );
    expect(styles).toMatch(
      /\.preparationPanel\s*{[\s\S]*?height:\s*auto;[\s\S]*?overflow:\s*visible/,
    );
    expect(styles).toMatch(
      /\.preparationSummary\s*{[\s\S]*?height:\s*100%;[\s\S]*?align-self:\s*stretch;[\s\S]*?overflow:\s*visible/,
    );
    expect(styles).toMatch(
      /\.modeWorkspace\s*{[\s\S]*?height:\s*auto;[\s\S]*?overflow:\s*visible/,
    );
    expect(styles).toMatch(/\.modeContent\s*{[\s\S]*?overflow:\s*visible/);
    expect(styles).not.toMatch(/scrollbar-gutter|overscroll-behavior-y/);
    expect(styles).not.toMatch(/simulatorScreen|interview-results-mode/);
  });

  it("uses only the supplied responsive panorama as the banner background", () => {
    expect(styles).toMatch(
      /\.practice-lobby-scene\)\s*{[\s\S]*?url\("\/images\/interview\/header-panorama\.png"\)/,
    );
    expect(styles).toMatch(/center center \/ cover\s+no-repeat/);
    expect(styles).not.toMatch(
      /practice-lobby-(?:dialog|character|notice-board|filing-cabinet|counter)/,
    );
    expect(statSync("public/images/interview/header-panorama.png").size).toBeGreaterThan(
      1_000_000,
    );
  });

  it("uses consistent dark fields, yellow labels, and native selector cards", () => {
    expect(styles).toMatch(/\.setupForm\s*{[\s\S]*?gap:\s*14px/);
    expect(styles).toMatch(/\.formRow input,[\s\S]*?min-height:\s*42px/);
    expect(styles).toMatch(/\.formRow input,[\s\S]*?background:\s*#081221/);
    expect(styles).toMatch(/\.formRow label,[\s\S]*?color:\s*var\(--game-yellow\)/);
    expect(styles).toContain(".selectWrap");
    expect(styles).toContain(".selectorGrid");
    expect(styles).toMatch(/\.selectorOptions\s*{[\s\S]*?grid-template-columns:/);
    expect(styles).toMatch(/\.selectorOptions input\s*{[\s\S]*?position:\s*absolute/);
    expect(styles).toMatch(/\.selectorOptions label:focus-within/);
  });

  it("creates a large dashed upload zone and compact uploaded-file actions", () => {
    expect(styles).toMatch(/\.uploadZone\s*{[\s\S]*?min-height:\s*220px/);
    expect(styles).toMatch(/\.uploadZone\s*{[\s\S]*?border:\s*3px dashed/);
    expect(styles).toContain(".uploadedFile");
    expect(styles).toContain(".fileActions");
    expect(styles).toContain(".manualResume");
  });

  it("uses separate interview-detail and resume-summary columns", () => {
    expect(styles).toMatch(/\.reviewColumns\s*{[\s\S]*?grid-template-columns:/);
    expect(styles).toContain(".detailsPanel");
    expect(styles).toContain(".resumeSummaryPanel");
    expect(styles).toContain(".resumeSummaryGrid");
    expect(styles).toContain(".resumeSummaryField");
  });

  it("builds a fullscreen response-mode room from the supplied combined artwork", () => {
    expect(styles).toMatch(
      /\.modeSelectionScreen\s*{[\s\S]*?min-height:\s*calc\(100svh - 68px\)/,
    );
    expect(styles).toMatch(
      /\.modeHero\s*{[\s\S]*?url\("\/images\/interview\/header-panorama\.png"\)/,
    );
    expect(styles).toContain(".modeCoachDesk");
    expect(styles).not.toContain(".modeInterviewer");
    expect(styles).not.toContain(".modeDesk");
    expect(statSync("public/images/interview/mode-coach-desk.png").size).toBeGreaterThan(
      250_000,
    );
  });

  it("keeps response cards, camera intent, and the continue action responsive", () => {
    expect(styles).toMatch(/\.modeJourney\s*{[\s\S]*?repeat\(5,/);
    expect(styles).toMatch(/\.responseModeGrid\s*{[\s\S]*?repeat\(2,/);
    expect(styles).toMatch(/\.responseModeCard\[data-selected="true"\]/);
    expect(styles).toMatch(/\.responseModeCard:focus-visible/);
    expect(styles).toContain(".cameraCard");
    expect(styles).toContain(".cameraToggle");
    expect(styles).toContain(".cameraModal");
    expect(styles).toContain(".cameraPreviewFrame");
    expect(styles).toContain(".cameraReadyButton");
    expect(styles).toMatch(/\.modeActions\s*{[\s\S]*?grid-template-columns:/);
  });

  it("keeps the scoped redesign pixel-edged and responsive", () => {
    expect(styles).not.toMatch(/gradient/i);
    expect(styles).not.toMatch(/backdrop-filter/i);
    expect(styles).toMatch(/\.preparationPanel\s*{[\s\S]*?border-radius:\s*2px/);
    expect(styles).toMatch(/\.preparationPanel\s*{[\s\S]*?4px 4px 0/);
    expect(styles).toMatch(/@media \(max-width:\s*1120px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*900px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*620px\)/);
    expect(styles).toMatch(/@media \(prefers-reduced-motion:\s*reduce\)/);
  });
});
