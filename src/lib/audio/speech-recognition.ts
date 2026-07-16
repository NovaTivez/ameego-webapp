export type SpeechRecognitionResultLike = {
  isFinal?: boolean;
  0?: { transcript?: string };
};

export type SpeechRecognitionResultEventLike = {
  resultIndex?: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

export type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
};

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export type RecognitionTranscriptUpdate = {
  finalChunk: string;
  interimText: string;
};

/** Errors that should not stop the learner mid-answer; recognition often restarts. */
export const RECOVERABLE_SPEECH_ERRORS = new Set(["no-speech", "aborted"]);

export function getSpeechRecognitionConstructor(
  speechWindow: Window &
    typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    } = window,
): SpeechRecognitionConstructor | null {
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function appendTranscriptSegment(base: string, segment: string): string {
  const next = segment.trim();
  if (!next) return base;
  if (!base.trim()) return next;
  return `${base.trim()} ${next}`;
}

/**
 * Pull new final and interim text from a SpeechRecognition result event.
 * Uses resultIndex so continuous sessions do not re-append older finals.
 */
export function extractRecognitionUpdate(
  event: SpeechRecognitionResultEventLike,
): RecognitionTranscriptUpdate {
  const start = typeof event.resultIndex === "number" ? event.resultIndex : 0;
  const finals: string[] = [];
  let interimText = "";

  for (let index = start; index < event.results.length; index += 1) {
    const result = event.results[index];
    const transcript = result?.[0]?.transcript?.trim() ?? "";
    if (!transcript) continue;
    if (result.isFinal) {
      finals.push(transcript);
    } else {
      interimText = interimText ? `${interimText} ${transcript}` : transcript;
    }
  }

  return {
    finalChunk: finals.join(" ").trim(),
    interimText: interimText.trim(),
  };
}

export function speechErrorMessage(errorCode: string | undefined): string {
  switch (errorCode) {
    case "not-allowed":
      return "Microphone permission was denied. You can type your response instead.";
    case "service-not-allowed":
      return "Speech recognition is blocked in this browser. Type or edit your response.";
    case "network":
      return "Speech recognition needs a network connection. Type or edit your response.";
    case "audio-capture":
      return "No microphone was found. Check your input device or type your response.";
    default:
      return "Speech recognition stopped unexpectedly. Edit or type your response.";
  }
}
