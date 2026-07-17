import { readFileSync, statSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/app/academy/academy.module.css", "utf8");
const campus = readFileSync("src/app/academy/AcademyCampusMap.tsx", "utf8");

describe("Academy Hub map style contract", () => {
  it("creates a borderless full-viewport campus with an overlay HUD", () => {
    expect(styles).toMatch(/\.screen\s*{[\s\S]*?width:\s*100vw;[\s\S]*?height:\s*100svh/);
    expect(styles).toMatch(
      /\.frame\s*{[\s\S]*?width:\s*100vw;[\s\S]*?height:\s*100svh;[\s\S]*?border:\s*0;[\s\S]*?box-shadow:\s*none/,
    );
    expect(styles).toMatch(/\.hud\s*{[\s\S]*?position:\s*absolute;[\s\S]*?top:\s*0/);
    expect(styles).toMatch(/\.hud\s*{[\s\S]*?height:\s*72px/);
    expect(styles).toMatch(
      /\.headerControls\s*{[\s\S]*?margin-left:\s*auto;[\s\S]*?gap:\s*8px/,
    );
    expect(styles).toMatch(
      /\.headerControls :global\(\.music-toggle\),[\s\S]*?width:\s*84px;[\s\S]*?min-height:\s*42px/,
    );
    expect(styles).toMatch(
      /\.playerStatus :global\(\.pixel-hud-stat\)\s*{[\s\S]*?width:\s*84px;[\s\S]*?min-height:\s*42px/,
    );
    expect(styles).toMatch(
      /\.mapStage\s*{[\s\S]*?width:\s*100vw;[\s\S]*?height:\s*100svh/,
    );
    expect(styles).not.toContain(".bottomNav");
    expect(styles).toMatch(
      /\.settingsLink\s*{[\s\S]*?width:\s*84px;[\s\S]*?height:\s*42px/,
    );
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
    expect(styles).toMatch(
      /\.map\s*{[\s\S]*?width:\s*min\(100vw, calc\(100svh \* 1\.776833\)\);[\s\S]*?max-width:\s*100%/,
    );
    expect(styles).toMatch(/\.mapBackground\s*{[\s\S]*?object-fit:\s*cover/);

    for (const asset of [
      "campus-map-v3.png",
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

    const mapAsset = readFileSync("public/images/academy/campus-map-v3.png");
    expect(mapAsset.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(mapAsset.readUInt32BE(16)).toBe(1672);
    expect(mapAsset.readUInt32BE(20)).toBe(941);
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
    expect(styles).toMatch(
      /@media \(max-width:\s*520px\)\s*{[\s\S]*?\.playerStatus :global\(\.pixel-hud-stat\),[\s\S]*?min-height:\s*44px;[\s\S]*?\.backLink\s*{[\s\S]*?width:\s*44px;[\s\S]*?height:\s*44px/,
    );
    expect(styles).toMatch(
      /@media \(max-width:\s*380px\)\s*{[\s\S]*?\.location\s*{[\s\S]*?min-width:\s*66px/,
    );
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
      mainBuilding: { left: 50, top: 75.5, width: 24 },
      interviewCenter: { left: 25, top: 29.5, width: 21 },
      speechHall: { left: 75, top: 29.5, width: 21 },
      progressLibrary: { left: 25, top: 61.5, width: 19 },
      coursesBuilding: { left: 75, top: 61.5, width: 19 },
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
