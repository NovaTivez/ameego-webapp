import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const styles = readFileSync("src/components/interview-session.module.css", "utf8");
const room = readFileSync("src/components/InterviewRoomScene.tsx", "utf8");
const sessionView = readFileSync("src/components/InterviewSessionView.tsx", "utf8");

describe("Interview Simulator immersive layout contract", () => {
  it("fills the active viewport with a dense desktop simulator grid", () => {
    expect(styles).toMatch(/\.simulatorScreen\s*\{[\s\S]*height: 100dvh/);
    expect(styles).toMatch(/body\):has\(\.simulatorScreen\)[\s\S]*overflow: hidden/);
    expect(styles).toMatch(/\.sessionShell\s*\{[\s\S]*grid-template-columns:/);
    expect(styles).toMatch(/\.sessionShell\s*\{[\s\S]*border: 3px solid/);
    expect(styles).toMatch(/\.mainColumn\s*\{[\s\S]*grid-template-rows:/);
  });

  it("uses the supplied room and interviewer artwork in the live scene", () => {
    expect(room).toContain("/images/interview/header-panorama.png");
    expect(room).toContain("/images/interview/mode-coach-desk.png");
    expect(room).toContain("styles.roomBackground");
    expect(room).toContain("styles.questionBubble");
    expect(room).toContain("styles.interviewer");
  });

  it("uses explicit red-off and green-active microphone states", () => {
    expect(styles).toMatch(/\.microphoneButton\s*\{[\s\S]*background: var\(--red\)/);
    expect(styles).toMatch(
      /\.microphoneButton\[data-mic-state="active"\][\s\S]*background: var\(--green\)/,
    );
  });

  it("gives Next and End equal widths and uses a pixel confirmation dialog", () => {
    expect(styles).toMatch(
      /\.responseActions\s*{[\s\S]*?width:\s*128px;[\s\S]*?grid-template-rows:\s*repeat\(2, minmax\(44px, 1fr\)\)/,
    );
    expect(styles).toMatch(
      /\.nextButton\s*{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;[\s\S]*?min-height:\s*44px/,
    );
    expect(styles).toMatch(
      /\.endButton\s*{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;[\s\S]*?min-height:\s*44px/,
    );
    expect(styles).toContain(".endDialogBackdrop");
    expect(styles).toContain(".endDialogActions");
    expect(styles).toContain(".confirmEndButton");
  });

  it("keeps square pixel styling, visible focus, and responsive stacking", () => {
    expect(styles).toContain(":focus-visible");
    expect(styles).toContain("@media (max-width: 760px)");
    expect(styles).toContain("grid-template-columns: 1fr");
    expect(styles).not.toMatch(
      /border-radius|linear-gradient|radial-gradient|backdrop-filter/,
    );
  });

  it("uses intentional mobile scrolling, compact room sizing, and collapsible tools", () => {
    expect(styles).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.simulatorScreen\s*\{[\s\S]*?height: auto;[\s\S]*?overflow: auto/,
    );
    expect(styles).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?body\):has\(\.simulatorScreen\)[\s\S]*?overflow: visible/,
    );
    expect(styles).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.responsePanel,[\s\S]*?\.confirmationPanel\s*\{[\s\S]*?position: sticky/,
    );
    expect(styles).toMatch(/\.mobileToolsSummary\s*\{[\s\S]*?display: flex/);
    expect(styles).toContain("@media (max-width: 760px) and (max-height: 520px)");
    expect(styles).not.toContain("min-height: 730px");
    expect(sessionView).toContain("<details");
    expect(sessionView).toContain("Camera and analysis");
  });
});
