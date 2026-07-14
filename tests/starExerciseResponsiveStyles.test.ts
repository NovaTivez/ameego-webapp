import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/app/globals.css", "utf8");
const exerciseStyles = styles.slice(
  styles.indexOf("/* Interactive STAR arrangement exercise */"),
);

describe("STAR exercise responsive style contract", () => {
  it("keeps cards, copy, and status content shrinkable without clipping", () => {
    expect(exerciseStyles).toMatch(/\.star-exercise\s*{[\s\S]*?min-width:\s*0/);
    expect(exerciseStyles).toMatch(/\.exercise-segment-copy\s*{[\s\S]*?min-width:\s*0/);
    expect(exerciseStyles).toMatch(/overflow-wrap:\s*anywhere/);
    expect(exerciseStyles).toMatch(/\.exercise-progress-state,[\s\S]*?max-width:\s*100%/);
  });

  it("stacks card controls for tablet and actions for narrow mobile widths", () => {
    expect(exerciseStyles).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.exercise-move-controls\s*{[^}]*grid-column:\s*1 \/ -1/,
    );
    expect(exerciseStyles).toMatch(
      /@media \(max-width: 660px\)[\s\S]*?\.exercise-segment\s*{[^}]*grid-template-columns:\s*1fr/,
    );
    expect(exerciseStyles).toMatch(
      /\.exercise-action-row \.pixel-button,[\s\S]*?width:\s*100%/,
    );
  });

  it("retains reachable touch targets and visible focus styling", () => {
    expect(exerciseStyles).toMatch(
      /\.exercise-move-controls button\s*{[\s\S]*?min-height:\s*44px/,
    );
    expect(exerciseStyles).toMatch(/touch-action:\s*manipulation/);
    expect(styles).toMatch(/:focus-visible\s*{[\s\S]*?outline:\s*3px/);
  });
});
