import { readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("offline app shell", () => {
  it("ships a standalone web app manifest", () => {
    const manifest = JSON.parse(
      readFileSync(path.join(projectRoot, "public/manifest.webmanifest"), "utf8"),
    ) as Record<string, unknown>;

    expect(manifest).toMatchObject({
      name: "Ameego Pixel Communication Academy",
      start_url: "/",
      scope: "/",
      display: "standalone",
    });
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/icons/192", sizes: "192x192" }),
        expect.objectContaining({ src: "/icons/512", sizes: "512x512" }),
      ]),
    );
  });

  it("pre-caches every public learning route and both audio assets", () => {
    const worker = readFileSync(path.join(projectRoot, "public/sw.js"), "utf8");
    for (const asset of [
      '"/academy"',
      '"/learn"',
      '"/learn/star-method"',
      '"/learn/star-method/exercise"',
      '"/practice"',
      '"/progress"',
      '"/settings"',
      '"/audio/town-theme.mp3"',
      '"/audio/button-press.mp3"',
      '"/icons/192"',
      '"/icons/512"',
    ]) {
      expect(worker).toContain(asset);
    }
    expect(worker).toContain('request.mode === "navigate"');
    expect(worker).toContain("networkFirst(request)");
    expect(worker).toContain("cacheFirst(request)");
  });

  it("includes non-empty local music and sound-effect files", () => {
    expect(statSync(path.join(projectRoot, "public/audio/town-theme.mp3")).size).toBe(
      1_316_581,
    );
    expect(statSync(path.join(projectRoot, "public/audio/button-press.mp3")).size).toBe(
      18_390,
    );
  });
});
