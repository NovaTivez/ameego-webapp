import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const system = readFileSync("src/app/pixel-system.css", "utf8");

describe("compact pixel-game style contract", () => {
  it("defines navy, blue-gray, green, yellow, border, shadow, and type tokens", () => {
    expect(system).toMatch(/--game-canvas:\s*#050914/);
    expect(system).toMatch(/--game-panel-900:\s*#0e192c/);
    expect(system).toMatch(/--game-line-highlight:\s*#526b8e/);
    expect(system).toMatch(/--game-green:\s*#4cae49/);
    expect(system).toMatch(/--game-yellow:\s*#f3c54b/);
    expect(system).toMatch(/--game-shadow-md:\s*4px 4px 0/);
    expect(system).toMatch(/--game-font-ui:/);
    expect(system).toMatch(/--game-font-copy:/);
  });

  it("keeps the shared system square, hard-edged, and free of gradients or glass effects", () => {
    expect(system).not.toMatch(/gradient/i);
    expect(system).not.toMatch(/backdrop-filter:\s*blur/i);
    const radii = [...system.matchAll(/border-radius:\s*([^;]+)/gi)].map((match) =>
      match[1].trim(),
    );
    expect(radii).toEqual(["0"]);
    expect(system).toMatch(/\.pixel-panel,[\s\S]*?border:\s*3px solid/);
    expect(system).toMatch(/\.pixel-button\s*{[\s\S]*?min-height:\s*36px/);
  });

  it("styles the global HUD and required reusable primitives", () => {
    expect(system).toMatch(/\.site-header\s*{[\s\S]*?min-height:\s*68px/);
    expect(system).toMatch(/\.site-header\s*{[\s\S]*?padding:\s*0 clamp\(24px/);
    expect(system).toMatch(/\.hud-control-group\s*{[\s\S]*?gap:\s*8px/);
    expect(system).toMatch(/\.music-toggle,[\s\S]*?width:\s*88px/);
    expect(system).toMatch(/\.music-toggle,[\s\S]*?min-height:\s*36px/);
    expect(system).toMatch(/\.hud-settings-link\s*{[\s\S]*?width:\s*36px/);
    expect(system).toMatch(
      /\.top-left-navigation\s*{[\s\S]*?gap:\s*var\(--game-space-2\)/,
    );
    expect(system).toMatch(/\.hud-navigation-button\s*{[\s\S]*?width:\s*36px/);
    expect(system).toMatch(/\.hud-navigation-button\s*{[\s\S]*?height:\s*36px/);
    expect(system).toMatch(/\.hud-navigation-button\s*{[\s\S]*?padding:\s*7px/);
    expect(system).toMatch(
      /\.hud-navigation-button \.pixel-icon\s*{[\s\S]*?width:\s*18px[\s\S]*?height:\s*18px/,
    );
    expect(system).toMatch(/\.site-header nav\s*{[\s\S]*?display:\s*none/);
    expect(system).toMatch(/\.site-footer\s*{[\s\S]*?display:\s*none/);
    expect(system).toMatch(/\.pixel-hud-stat\s*{/);
    expect(system).toMatch(/\.pixel-tabs\s*{/);
    expect(system).toMatch(/\.pixel-input-group/);
    expect(system).toMatch(/\.pixel-card-header\s*{/);
    expect(system).toMatch(/\.pixel-dialog\s*{/);
    expect(system).toMatch(/\.pixel-modal\s*{/);
  });

  it("keeps page framing and transitional interview states on the dense system", () => {
    expect(system).toMatch(/--page-width:\s*1120px/);
    expect(system).toMatch(/\.pixel-input,[\s\S]*?min-height:\s*38px/);
    expect(system).toMatch(
      /\.interview-simulator > \.interview-stage\s*{[\s\S]*?6px 6px 0/,
    );
    expect(system).toMatch(/\.mode-grid button\s*{[\s\S]*?min-height:\s*96px/);
  });
});
