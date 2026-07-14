import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/app/globals.css", "utf8");
const system = styles.slice(styles.indexOf("/* Shared 2D pixel-art game system */"));

describe("pixel design responsive contract", () => {
  it("keeps major game layouts shrinkable and hides decorative overflow", () => {
    expect(system).toMatch(/\.interview-session-main,[\s\S]*?min-width:\s*0/);
    expect(system).toMatch(/\.pixel-environment\s*{[\s\S]*?overflow:\s*hidden/);
    expect(system).toMatch(/\.pixel-status strong\s*{[\s\S]*?overflow-wrap:\s*anywhere/);
    expect(styles).toMatch(/body\s*{[\s\S]*?min-width:\s*320px/);
  });

  it("stacks academy, simulator, feedback, course, and progress layouts", () => {
    expect(system).toMatch(
      /@media \(max-width: 980px\)[\s\S]*?\.interview-session-shell\s*{[^}]*grid-template-columns:\s*1fr/,
    );
    expect(system).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.progress-library-grid,[\s\S]*?grid-template-columns:\s*1fr/,
    );
    expect(system).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.pixel-course-card,[\s\S]*?grid-template-columns:\s*1fr/,
    );
    expect(styles).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.evaluation-rubric\s*{[^}]*grid-template-columns:\s*1fr/,
    );
  });

  it("retains visible focus and mobile-width controls", () => {
    expect(system).toMatch(/\.pixel-button:focus-visible,[\s\S]*?outline:\s*4px/);
    expect(system).toMatch(
      /@media \(max-width: 520px\)[\s\S]*?\.interview-question-dialog\s*{[^}]*width:\s*90%/,
    );
  });
});
