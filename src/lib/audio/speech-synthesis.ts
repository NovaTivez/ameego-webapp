export type SpeechSynthesisUtteranceLike = {
  text: string;
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoiceLike | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
};

export type SpeechSynthesisVoiceLike = {
  name: string;
  lang: string;
  default?: boolean;
  localService?: boolean;
};

export type SpeechSynthesisLike = {
  speaking: boolean;
  pending: boolean;
  getVoices: () => SpeechSynthesisVoiceLike[];
  speak: (utterance: SpeechSynthesisUtteranceLike) => void;
  cancel: () => void;
};

export type SpeakQuestionOptions = {
  synthesis?: SpeechSynthesisLike | null;
  createUtterance?: (text: string) => SpeechSynthesisUtteranceLike;
  lang?: string;
  rate?: number;
};

export type SpeakQuestionHandle = {
  cancel: () => void;
  finished: Promise<"ended" | "cancelled" | "error" | "unsupported">;
  /** Retain until finished so Chrome does not GC the utterance before onend. */
  utterance: SpeechSynthesisUtteranceLike | null;
};

/** Rough upper bound so a stuck browser utterance cannot block the interview forever. */
export function interviewerSpeechTimeoutMs(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // ~2.5 words/sec plus buffer, clamped for very short/long questions.
  return Math.min(60_000, Math.max(8_000, Math.round((words / 2.5) * 1000) + 4_000));
}

export function getSpeechSynthesis(
  speechWindow: Window & typeof globalThis = window,
): SpeechSynthesisLike | null {
  const synthesis = (speechWindow as unknown as { speechSynthesis?: SpeechSynthesisLike })
    .speechSynthesis;
  return synthesis ?? null;
}

export function isSpeechSynthesisAvailable(
  synthesis: SpeechSynthesisLike | null = getSpeechSynthesis(),
): boolean {
  return Boolean(synthesis);
}

export function pickInterviewVoice(
  voices: SpeechSynthesisVoiceLike[],
): SpeechSynthesisVoiceLike | null {
  if (!voices.length) return null;
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const pool = english.length > 0 ? english : voices;
  return (
    pool.find((voice) =>
      /google|microsoft|samantha|daniel|david|zira|aria/i.test(voice.name),
    ) ??
    pool.find((voice) => voice.default) ??
    pool[0] ??
    null
  );
}

function defaultCreateUtterance(text: string): SpeechSynthesisUtteranceLike {
  return new SpeechSynthesisUtterance(text) as unknown as SpeechSynthesisUtteranceLike;
}

/**
 * Speak interviewer question text. Soft-fails when TTS is unavailable.
 * Always settles finished so the learner turn can unlock.
 */
export function speakInterviewQuestion(
  text: string,
  options: SpeakQuestionOptions = {},
): SpeakQuestionHandle {
  const trimmed = text.trim();
  const synthesis =
    options.synthesis === undefined ? getSpeechSynthesis() : options.synthesis;
  const createUtterance = options.createUtterance ?? defaultCreateUtterance;

  if (!synthesis || !trimmed) {
    return {
      cancel: () => undefined,
      finished: Promise.resolve(trimmed ? "unsupported" : "ended"),
      utterance: null,
    };
  }

  let settled = false;
  let utteranceKeepAlive: SpeechSynthesisUtteranceLike | null = null;
  let resolveFinished: (
    reason: "ended" | "cancelled" | "error" | "unsupported",
  ) => void = () => undefined;
  const finished = new Promise<"ended" | "cancelled" | "error" | "unsupported">(
    (resolve) => {
      resolveFinished = resolve;
    },
  );

  const settle = (reason: "ended" | "cancelled" | "error" | "unsupported") => {
    if (settled) return;
    settled = true;
    utteranceKeepAlive = null;
    resolveFinished(reason);
  };

  try {
    synthesis.cancel();
    const utterance = createUtterance(trimmed);
    utteranceKeepAlive = utterance;
    utterance.lang = options.lang ?? "en-US";
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.voice = pickInterviewVoice(synthesis.getVoices());
    utterance.onend = () => settle("ended");
    utterance.onerror = () => settle("error");
    synthesis.speak(utterance);
  } catch {
    settle("error");
  }

  return {
    cancel: () => {
      try {
        synthesis.cancel();
      } catch {
        // Ignore cancel failures; still unlock the learner turn.
      }
      settle("cancelled");
    },
    finished,
    utterance: utteranceKeepAlive,
  };
}

export function cancelInterviewSpeech(
  synthesis: SpeechSynthesisLike | null = getSpeechSynthesis(),
): void {
  try {
    synthesis?.cancel();
  } catch {
    // Soft-fail: response gating must not depend on cancel succeeding.
  }
}
