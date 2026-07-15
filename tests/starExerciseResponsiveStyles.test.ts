import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/components/star-exercise.module.css", "utf8");

describe("STAR exercise responsive style contract", () => {
  it("creates four dashed answer slots and compact movable tiles", () => {
    expect(styles).toMatch(/\.answerSlots\s*{[\s\S]*?grid-template-columns:\s*repeat\(4/);
    expect(styles).toMatch(/\.answerSlot\s*{[\s\S]*?border:\s*3px dashed/);
    expect(styles).toMatch(/\.answerSlot\s*{[\s\S]*?min-width:\s*0/);
    expect(styles).toMatch(/\.tileCopy\s*{[\s\S]*?min-width:\s*0/);
    expect(styles).toMatch(/overflow-wrap:\s*anywhere/);
  });

  it("provides strong focus, dragging, and drop-target states", () => {
    expect(styles).toMatch(/\.answerSlot:focus-within\s*{[\s\S]*?outline:\s*3px solid/);
    expect(styles).toMatch(
      /\.answerSlot\.isDragging\s*{[\s\S]*?border-color:[\s\S]*?opacity:/,
    );
    expect(styles).toMatch(/\.answerSlot\.isDropTarget\s*{[\s\S]*?outline:\s*4px solid/);
    expect(styles).toMatch(
      /\.moveControls button:focus-visible\s*{[\s\S]*?outline:\s*4px solid/,
    );
  });

  it("retains reachable touch targets and manipulation behavior", () => {
    expect(styles).toMatch(/\.moveControls button\s*{[\s\S]*?min-height:\s*44px/);
    expect(styles).toMatch(/touch-action:\s*manipulation/);
  });

  it("stacks slots and actions across tablet and mobile widths", () => {
    expect(styles).toMatch(/@media \(max-width:\s*820px\)/);
    expect(styles).toMatch(
      /@media \(max-width:\s*820px\)[\s\S]*?grid-template-columns:\s*repeat\(2/,
    );
    expect(styles).toMatch(/@media \(max-width:\s*620px\)/);
    expect(styles).toMatch(
      /@media \(max-width:\s*460px\)[\s\S]*?\.answerSlots\s*{[\s\S]*?grid-template-columns:\s*1fr/,
    );
    expect(styles).toMatch(/\.actionRow :global\(\.pixel-button\),[\s\S]*?width:\s*100%/);
  });

  it("keeps the scoped redesign free from gradients and soft cards", () => {
    expect(styles).not.toMatch(/gradient/i);
    expect(styles).not.toMatch(/backdrop-filter/i);
    expect(styles).not.toMatch(/border-radius/i);
    expect(styles).toMatch(/\.exercisePanel\s*{[\s\S]*?6px 6px 0/);
  });
});
