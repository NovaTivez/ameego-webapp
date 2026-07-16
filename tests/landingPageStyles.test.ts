import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/app/landing.module.css", "utf8");

describe("landing title-screen style contract", () => {
  it("uses the supplied academy artwork as a centered full-screen background", () => {
    expect(styles).toMatch(/\.screen\s*{[\s\S]*?min-height:\s*100vh/);
    expect(styles).toMatch(
      /\.screen\s*{[\s\S]*?background-image:\s*url\("\/images\/academy-background\.jpg"\)/,
    );
    expect(styles).toMatch(/\.screen\s*{[\s\S]*?background-position:\s*center/);
    expect(styles).toMatch(/\.screen\s*{[\s\S]*?background-size:\s*cover/);
    expect(styles).toMatch(/\.frame\s*{[\s\S]*?min-height:\s*calc\(100vh - 24px\)/);
    expect(styles).toMatch(/\.frame\s*{[\s\S]*?border:\s*4px solid/);
  });

  it("uses crisp title, subtitle, and button treatments", () => {
    expect(styles).toMatch(/\.logo\s*{[^}]*text-shadow:/);
    expect(styles).toMatch(/\.tagline\s*{[^}]*font-weight:\s*700/);
    expect(styles).toMatch(/\.tagline\s*{[^}]*text-shadow:/);
    expect(styles).toMatch(/\.enterButton:hover\s*{[^}]*translateY\(-3px\)/);
    expect(styles).not.toMatch(/\.enterButton:hover\s*{[^}]*scale\(/);
  });

  it("keeps the title group transparent without glass or rounded cards", () => {
    expect(styles).toMatch(/\.titleCard\s*{[^}]*background:\s*transparent/);
    expect(styles).not.toMatch(/\.titleCard\s*{[^}]*gradient/i);
    expect(styles).not.toMatch(/backdrop-filter/i);
    expect(styles).not.toMatch(/border-radius/i);
    expect(styles).not.toMatch(/blur\(/i);
  });

  it("keeps the title screen usable at tablet and mobile widths", () => {
    expect(styles).toMatch(/@media \(max-width:\s*760px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*520px\)[\s\S]*?min-height:\s*100vh/);
    expect(styles).toMatch(
      /body\):has\(\.screen\) :global\(\.experience-controls\)[\s\S]*?top:\s*22px/,
    );
  });
});
