import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/app/academy/academy.module.css", "utf8");

describe("Academy Hub map style contract", () => {
  it("creates a full-screen hard-framed game map", () => {
    expect(styles).toMatch(/\.screen\s*{[\s\S]*?min-height:\s*100vh/);
    expect(styles).toMatch(/\.frame\s*{[\s\S]*?min-height:\s*calc\(100vh - 24px\)/);
    expect(styles).toMatch(/\.frame\s*{[\s\S]*?grid-template-rows:/);
    expect(styles).toMatch(/\.frame\s*{[\s\S]*?border:\s*4px solid/);
  });

  it("contains layered terrain and code-native environmental details", () => {
    for (const selector of [
      ".grassPatch",
      ".path",
      ".plaza",
      ".pond",
      ".texturePixel",
      ".tree",
      ".lamp",
      ".fence",
      ".buildingArt",
      ".upperFloor",
      ".locationSign",
    ]) {
      expect(styles).toContain(selector);
    }
  });

  it("uses crisp pixel styling without gradients, glass, or rounded cards", () => {
    expect(styles).not.toMatch(/gradient/i);
    expect(styles).not.toMatch(/backdrop-filter/i);
    expect(styles).not.toMatch(/border-radius/i);
    expect(styles).toMatch(/\.locationSign,[\s\S]*?box-shadow:/);
  });

  it("adapts the dense map for tablet and mobile widths", () => {
    expect(styles).toMatch(/@media \(max-width:\s*760px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*520px\)/);
  });
});
