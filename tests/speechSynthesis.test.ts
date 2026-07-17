import { describe, expect, it, vi } from "vitest";

import {
  interviewerSpeechTimeoutMs,
  isSpeechSynthesisAvailable,
  pickInterviewVoice,
  speakInterviewQuestion,
  type SpeechSynthesisLike,
  type SpeechSynthesisUtteranceLike,
} from "@/lib/audio/speech-synthesis";

function createMockSynthesis(
  voices: Array<{ name: string; lang: string; default?: boolean }> = [],
): SpeechSynthesisLike & {
  lastUtterance: SpeechSynthesisUtteranceLike | null;
} {
  const state = {
    lastUtterance: null as SpeechSynthesisUtteranceLike | null,
  };
  return {
    speaking: false,
    pending: false,
    getVoices: () => voices,
    speak(utterance) {
      state.lastUtterance = utterance;
    },
    cancel: vi.fn(),
    get lastUtterance() {
      return state.lastUtterance;
    },
  };
}

describe("interview speech synthesis helpers", () => {
  it("prefers an English interviewer-like voice", () => {
    const voice = pickInterviewVoice([
      { name: "Junk", lang: "fr-FR" },
      { name: "Microsoft Aria", lang: "en-US" },
      { name: "English Local", lang: "en-GB" },
    ]);
    expect(voice?.name).toBe("Microsoft Aria");
  });

  it("scales timeout with question length", () => {
    expect(interviewerSpeechTimeoutMs("Hi")).toBe(8_000);
    expect(
      interviewerSpeechTimeoutMs(Array.from({ length: 40 }, () => "question").join(" ")),
    ).toBeGreaterThan(8_000);
  });

  it("reports availability from the synthesis object", () => {
    expect(isSpeechSynthesisAvailable(null)).toBe(false);
    expect(isSpeechSynthesisAvailable(createMockSynthesis())).toBe(true);
  });

  it("soft-fails when synthesis is unavailable and unlocks immediately", async () => {
    const handle = speakInterviewQuestion("Tell me about a challenge.", {
      synthesis: null,
    });
    await expect(handle.finished).resolves.toBe("unsupported");
  });

  it("speaks and resolves when the utterance ends", async () => {
    const synthesis = createMockSynthesis([
      { name: "Microsoft Aria", lang: "en-US", default: true },
    ]);
    const handle = speakInterviewQuestion("Describe a time you led a project.", {
      synthesis,
      createUtterance: (text) => ({
        text,
        lang: "en-US",
        rate: 1,
        pitch: 1,
        volume: 1,
        voice: null,
        onend: null,
        onerror: null,
      }),
    });

    expect(synthesis.lastUtterance?.text).toBe("Describe a time you led a project.");
    synthesis.lastUtterance?.onend?.(new Event("end"));
    await expect(handle.finished).resolves.toBe("ended");
  });

  it("cancel settles the turn so the learner is not blocked", async () => {
    const synthesis = createMockSynthesis();
    const handle = speakInterviewQuestion("What is your greatest strength?", {
      synthesis,
      createUtterance: (text) => ({
        text,
        lang: "en-US",
        rate: 1,
        pitch: 1,
        volume: 1,
        voice: null,
        onend: null,
        onerror: null,
      }),
    });
    handle.cancel();
    await expect(handle.finished).resolves.toBe("cancelled");
    expect(synthesis.cancel).toHaveBeenCalled();
  });
});
