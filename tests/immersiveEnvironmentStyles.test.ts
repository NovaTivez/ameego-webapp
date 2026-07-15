import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/app/globals.css", "utf8");
const immersive = styles.slice(styles.indexOf("/* Immersive environmental art pass */"));

describe("immersive environment style contract", () => {
  it("contains layered world, campus, classroom, lobby, and reflection scenes", () => {
    expect(immersive).toMatch(/\.game-world-backdrop\s*{[\s\S]*?position:\s*fixed/);
    expect(immersive).toMatch(/\.academy-map\s*{[\s\S]*?min-height:\s*760px/);
    expect(immersive).toMatch(/\.learning-blackboard\s*{[\s\S]*?background:/);
    expect(immersive).toMatch(/\.practice-lobby-scene\s*{[\s\S]*?min-height:/);
    expect(immersive).toMatch(/\.feedback-results-board\s*{[\s\S]*?position:\s*absolute/);
  });

  it("uses restrained stepped animation and retains reduced-motion protection", () => {
    expect(immersive).toMatch(/animation:[^;]*steps\(/);
    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(styles).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
  });

  it("simplifies dense scenery at tablet and narrow mobile widths", () => {
    expect(immersive).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.campus-tree-three,[\s\S]*?display:\s*none/,
    );
    expect(immersive).toMatch(
      /@media \(max-width: 520px\)[\s\S]*?\.environment-lamp\s*{[^}]*display:\s*none/,
    );
    expect(immersive).toMatch(
      /@media \(max-width: 520px\)[\s\S]*?\.lesson-reading-column\s*{[^}]*padding:/,
    );
  });
});
