import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/components/interview-preparation.module.css", "utf8");

describe("Interview preparation page style contract", () => {
  it("uses compact dark inputs, yellow labels, arrows, and step controls", () => {
    expect(styles).toMatch(/\.setupForm\s*{[\s\S]*?gap:\s*7px/);
    expect(styles).toMatch(/\.formRow input,[\s\S]*?background:\s*#081221/);
    expect(styles).toMatch(/\.formRow label,[\s\S]*?color:\s*var\(--game-yellow\)/);
    expect(styles).toContain(".selectWrap");
    expect(styles).toContain(".stepControlGrid");
    expect(styles).toMatch(
      /\.stepControl button\s*{[\s\S]*?touch-action:\s*manipulation/,
    );
  });

  it("creates a large dashed upload zone and compact uploaded-file actions", () => {
    expect(styles).toMatch(/\.uploadZone\s*{[\s\S]*?min-height:\s*210px/);
    expect(styles).toMatch(/\.uploadZone\s*{[\s\S]*?border:\s*3px dashed/);
    expect(styles).toContain(".uploadedFile");
    expect(styles).toContain(".fileActions");
    expect(styles).toContain(".manualResume");
  });

  it("uses separate interview-detail and icon summary columns", () => {
    expect(styles).toMatch(/\.reviewColumns\s*{[\s\S]*?grid-template-columns:/);
    expect(styles).toContain(".detailsPanel");
    expect(styles).toContain(".resumeSummaryPanel");
    expect(styles).toContain(".resumeSummaryGrid");
    expect(styles).toContain(".resumeSummaryField");
  });

  it("keeps the scoped redesign hard-edged and responsive", () => {
    expect(styles).not.toMatch(/gradient/i);
    expect(styles).not.toMatch(/backdrop-filter/i);
    expect(styles).not.toMatch(/border-radius/i);
    expect(styles).toMatch(/\.preparationPanel\s*{[\s\S]*?6px 6px 0/);
    expect(styles).toMatch(/@media \(max-width:\s*780px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*600px\)/);
  });
});
