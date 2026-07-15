import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/app/landing.module.css", "utf8");

describe("landing title-screen style contract", () => {
  it("creates a full-screen framed nighttime academy scene", () => {
    expect(styles).toMatch(/\.screen\s*{[\s\S]*?min-height:\s*100vh/);
    expect(styles).toMatch(/\.frame\s*{[\s\S]*?min-height:\s*calc\(100vh - 24px\)/);
    expect(styles).toMatch(/\.frame\s*{[\s\S]*?border:\s*4px solid/);
    expect(styles).toMatch(/\.sky\s*{[\s\S]*?background:\s*#09162d/);
  });

  it("contains code-native buildings, windows, paths, trees, lamps, shrubs, and stars", () => {
    for (const selector of [
      ".building",
      ".windowGrid",
      ".path",
      ".tree",
      ".lamp",
      ".shrubs",
      ".stars",
    ]) {
      expect(styles).toContain(selector);
    }
  });

  it("uses hard pixel styling without gradients, glass, or rounded cards", () => {
    expect(styles).not.toMatch(/gradient/i);
    expect(styles).not.toMatch(/backdrop-filter/i);
    expect(styles).not.toMatch(/border-radius/i);
    expect(styles).toMatch(/\.logo\s*{[\s\S]*?text-shadow:/);
    expect(styles).toMatch(/\.enterAction :global\(\.pixel-button\)[\s\S]*?5px 5px 0/);
  });

  it("keeps the title screen usable at tablet and mobile widths", () => {
    expect(styles).toMatch(/@media \(max-width:\s*760px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*520px\)[\s\S]*?min-height:\s*100vh/);
  });
});
