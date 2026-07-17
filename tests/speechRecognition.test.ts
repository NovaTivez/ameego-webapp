import { describe, expect, it } from "vitest";

import {
  appendTranscriptSegment,
  extractRecognitionUpdate,
  getMicrophoneModeAvailability,
  RECOVERABLE_SPEECH_ERRORS,
  speechErrorMessage,
} from "@/lib/audio/speech-recognition";

describe("speech recognition helpers", () => {
  it("requires both recognition and microphone capture before microphone mode is available", () => {
    expect(
      getMicrophoneModeAvailability({
        speechRecognitionAvailable: true,
        microphoneCaptureAvailable: true,
      }),
    ).toBe("available");
    expect(
      getMicrophoneModeAvailability({
        speechRecognitionAvailable: false,
        microphoneCaptureAvailable: true,
      }),
    ).toBe("speech_recognition_unavailable");
    expect(
      getMicrophoneModeAvailability({
        speechRecognitionAvailable: true,
        microphoneCaptureAvailable: false,
      }),
    ).toBe("microphone_capture_unavailable");
  });

  it("appends final segments without duplicating spaces", () => {
    expect(appendTranscriptSegment("", "Hello")).toBe("Hello");
    expect(appendTranscriptSegment("Hello", " world ")).toBe("Hello world");
  });

  it("extracts only new finals via resultIndex and keeps interim text separate", () => {
    const update = extractRecognitionUpdate({
      resultIndex: 1,
      results: [
        { isFinal: true, 0: { transcript: "Old final" } },
        { isFinal: true, 0: { transcript: "New final" } },
        { isFinal: false, 0: { transcript: "partial phrase" } },
      ],
    });

    expect(update.finalChunk).toBe("New final");
    expect(update.interimText).toBe("partial phrase");
  });

  it("treats silence and abort as recoverable", () => {
    expect(RECOVERABLE_SPEECH_ERRORS.has("no-speech")).toBe(true);
    expect(RECOVERABLE_SPEECH_ERRORS.has("aborted")).toBe(true);
    expect(RECOVERABLE_SPEECH_ERRORS.has("not-allowed")).toBe(false);
  });

  it("maps speech errors to learner-facing copy", () => {
    expect(speechErrorMessage("not-allowed")).toMatch(/permission was denied/i);
    expect(speechErrorMessage("network")).toMatch(/network connection/i);
    expect(speechErrorMessage("mystery")).toMatch(/stopped unexpectedly/i);
  });
});
