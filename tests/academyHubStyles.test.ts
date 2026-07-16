import { readFileSync, statSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/app/academy/academy.module.css", "utf8");
const campus = readFileSync("src/app/academy/AcademyCampusMap.tsx", "utf8");

describe("Academy Hub map style contract", () => {
  it("creates a full-screen hard-framed game map", () => {
    expect(styles).toMatch(/\.screen\s*{[\s\S]*?min-height:\s*100vh/);
    expect(styles).toMatch(/\.frame\s*{[\s\S]*?min-height:\s*calc\(100vh - 24px\)/);
    expect(styles).toMatch(/\.frame\s*{[\s\S]*?grid-template-rows:/);
    expect(styles).toMatch(/\.frame\s*{[\s\S]*?border:\s*4px solid/);
  });

  it("uses the uploaded campus scene and transparent building layers", () => {
    for (const selector of [
      ".map",
      ".mapBackground",
      ".mainBuilding",
      ".interviewCenter",
      ".speechHall",
      ".progressLibrary",
      ".coursesBuilding",
      ".contactShadow",
      ".buildingImage",
      ".locationLabel",
    ]) {
      expect(styles).toContain(selector);
    }

    expect(styles).toMatch(/aspect-ratio:\s*1672\s*\/\s*941/);
    expect(styles).toMatch(/\.mapBackground\s*{[\s\S]*?object-fit:\s*contain/);

    for (const asset of [
      "campus-map-v2.png",
      "main-building-v2.png",
      "interview-center-v2.png",
      "speech-hall-v2.png",
      "progress-library-v2.png",
      "courses-building-v2.png",
    ]) {
      const assetPath = `public/images/academy/${asset}`;
      expect(statSync(assetPath).size).toBeGreaterThan(0);
      expect(campus).toContain(`/images/academy/${asset}`);
    }
  });

  it("uses crisp pixel styling without gradients, glass, or rounded cards", () => {
    expect(styles).not.toMatch(/gradient/i);
    expect(styles).not.toMatch(/backdrop-filter/i);
    expect(styles).not.toMatch(/border-radius/i);
    expect(styles).toMatch(/\.location:focus-visible[\s\S]*?outline:/);
    expect(styles).toMatch(/\.location:hover[\s\S]*?brightness\(/);
    expect(styles).toMatch(/cursor:\s*pointer/);
    expect(styles).toMatch(/drop-shadow\(/);
    expect(styles).toMatch(/scale\(1\.04\)/);
    expect(styles).toMatch(/scale\(0\.98\)/);
    expect(styles).toMatch(/\.speechHall\s*{[\s\S]*?transform-origin:\s*center center/);
    expect(styles).toMatch(
      /\.lockedLocation,[\s\S]*?cursor:\s*not-allowed;[\s\S]*?transform:\s*translate\(-50%, -50%\);[\s\S]*?transition:\s*none/,
    );
    expect(styles).toMatch(
      /\.lockedLocation \.buildingImage,[\s\S]*?brightness\(0\.72\)[\s\S]*?transition:\s*none/,
    );
  });

  it("adapts the dense map for tablet and mobile widths", () => {
    expect(styles).toMatch(/@media \(max-width:\s*760px\)/);
    expect(styles).toMatch(/@media \(max-width:\s*520px\)/);
    expect(styles).toMatch(/@media \(hover:\s*none\),\s*\(pointer:\s*coarse\)/);
  });

  it("keeps all five proportional building regions inside the map without overlap", () => {
    const mapAspect = 1672 / 941;
    const valueFor = (selector: string, property: string) => {
      const block = styles.match(new RegExp(`\\.${selector}\\s*\\{([\\s\\S]*?)\\}`))?.[1];
      const value = block?.match(new RegExp(`${property}:\\s*([\\d.]+)%`))?.[1];
      expect(value, `${selector}.${property}`).toBeDefined();
      return Number(value);
    };
    const regions = [
      "mainBuilding",
      "interviewCenter",
      "speechHall",
      "progressLibrary",
      "coursesBuilding",
    ].map((selector) => {
      const left = valueFor(selector, "left");
      const top = valueFor(selector, "top");
      const width = valueFor(selector, "width");
      const height = (width / 1.5) * mapAspect;
      return {
        selector,
        left: left - width / 2,
        right: left + width / 2,
        top: top - height / 2,
        bottom: top + height / 2,
      };
    });

    expect(
      Object.fromEntries(
        regions.map((region) => [
          region.selector,
          {
            left: valueFor(region.selector, "left"),
            top: valueFor(region.selector, "top"),
            width: valueFor(region.selector, "width"),
          },
        ]),
      ),
    ).toEqual({
      mainBuilding: { left: 50, top: 77.5, width: 24 },
      interviewCenter: { left: 24.5, top: 31.5, width: 21 },
      speechHall: { left: 75.5, top: 31.5, width: 21 },
      progressLibrary: { left: 24, top: 63.5, width: 19 },
      coursesBuilding: { left: 76, top: 63.5, width: 19 },
    });

    for (const region of regions) {
      expect(region.left).toBeGreaterThanOrEqual(0);
      expect(region.right).toBeLessThanOrEqual(100);
      expect(region.top).toBeGreaterThanOrEqual(0);
      expect(region.bottom).toBeLessThanOrEqual(100);
    }

    for (let first = 0; first < regions.length; first += 1) {
      for (let second = first + 1; second < regions.length; second += 1) {
        const a = regions[first];
        const b = regions[second];
        const overlapsHorizontally =
          Math.min(a.right, b.right) > Math.max(a.left, b.left);
        const overlapsVertically = Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);
        expect(
          overlapsHorizontally && overlapsVertically,
          `${a.selector} overlaps ${b.selector}`,
        ).toBe(false);
      }
    }
  });
});
