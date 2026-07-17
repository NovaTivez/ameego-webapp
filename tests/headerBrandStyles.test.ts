import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/app/globals.css", "utf8");

describe("header brand mark styles", () => {
  it("keeps the Academy mark upright", () => {
    const brandMark = styles.match(/\.brand-mark\s*{([^}]*)}/)?.[1];

    expect(brandMark).toBeDefined();
    expect(brandMark).not.toMatch(/transform\s*:/);
  });
});
