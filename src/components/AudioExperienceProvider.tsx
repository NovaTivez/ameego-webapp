"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  DEFAULT_AUDIO_PREFERENCES,
  readAudioPreferences,
  saveAudioPreferences,
} from "@/lib/audio/preferences";

const MUSIC_VOLUME = 0.3;
const FADE_DURATION_MS = 650;

type AudioExperienceValue = {
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  isOnline: boolean;
  autoplayBlocked: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  setSoundEffectsEnabled: (enabled: boolean) => void;
  toggleMusic: () => void;
};

const AudioExperienceContext = createContext<AudioExperienceValue>({
  musicEnabled: DEFAULT_AUDIO_PREFERENCES.musicEnabled,
  soundEffectsEnabled: DEFAULT_AUDIO_PREFERENCES.soundEffectsEnabled,
  isOnline: true,
  autoplayBlocked: false,
  setMusicEnabled: () => undefined,
  setSoundEffectsEnabled: () => undefined,
  toggleMusic: () => undefined,
});

function isInteractiveElement(target: EventTarget | null): target is Element {
  return (
    target instanceof Element &&
    Boolean(target.closest("button, a, [role='button'], [role='switch']"))
  );
}

function containsSoundworthyStatus(node: Element): boolean {
  const status = node.matches("[role='status'], [role='alert']")
    ? node
    : node.querySelector("[role='status'], [role='alert']");
  if (!status) return false;
  return /complete|completed|saved|success|ready|correct|confirmed/i.test(
    status.textContent ?? "",
  );
}

export function AudioExperienceProvider({ children }: { children: ReactNode }) {
  const [musicEnabled, setMusicEnabled] = useState(
    DEFAULT_AUDIO_PREFERENCES.musicEnabled,
  );
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(
    DEFAULT_AUDIO_PREFERENCES.soundEffectsEnabled,
  );
  const [isOnline, setIsOnline] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [interviewFocusMode, setInterviewFocusMode] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const effectRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const lastEffectAtRef = useRef(0);
  const soundEffectsEnabledRef = useRef(soundEffectsEnabled);

  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = 0;
    queueMicrotask(() => {
      const preferences = readAudioPreferences(window.localStorage);
      setMusicEnabled(preferences.musicEnabled);
      setSoundEffectsEnabled(preferences.soundEffectsEnabled);
      setIsOnline(navigator.onLine);
      setPreferencesLoaded(true);
    });
  }, []);

  useEffect(() => {
    soundEffectsEnabledRef.current = soundEffectsEnabled;
  }, [soundEffectsEnabled]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    try {
      saveAudioPreferences(window.localStorage, {
        musicEnabled,
        soundEffectsEnabled,
      });
    } catch {
      // Audio remains usable for this session when storage is unavailable.
    }
  }, [musicEnabled, preferencesLoaded, soundEffectsEnabled]);

  const fadeMusic = useCallback(async (targetVolume: number, pauseAtEnd: boolean) => {
    const music = musicRef.current;
    if (!music) return false;

    if (fadeFrameRef.current !== null) {
      window.cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }

    if (targetVolume > 0) {
      try {
        await music.play();
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
        return false;
      }
    }

    const initialVolume = music.volume;
    const startedAt = window.performance.now();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / FADE_DURATION_MS);
      music.volume = Math.max(
        0,
        Math.min(1, initialVolume + (targetVolume - initialVolume) * progress),
      );
      if (progress < 1) {
        fadeFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }
      fadeFrameRef.current = null;
      if (pauseAtEnd && targetVolume === 0) music.pause();
    };

    fadeFrameRef.current = window.requestAnimationFrame(animate);
    return true;
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    if (musicEnabled && !interviewFocusMode) {
      queueMicrotask(() => void fadeMusic(MUSIC_VOLUME, false));
    } else {
      queueMicrotask(() => void fadeMusic(0, true));
    }
  }, [fadeMusic, interviewFocusMode, musicEnabled, preferencesLoaded]);

  useEffect(() => {
    if (!autoplayBlocked || !musicEnabled || interviewFocusMode) return;

    const unlockMusic = () => {
      document.removeEventListener("pointerdown", unlockMusic);
      document.removeEventListener("keydown", unlockMusic);
      void fadeMusic(MUSIC_VOLUME, false);
    };
    document.addEventListener("pointerdown", unlockMusic, { once: true });
    document.addEventListener("keydown", unlockMusic, { once: true });
    return () => {
      document.removeEventListener("pointerdown", unlockMusic);
      document.removeEventListener("keydown", unlockMusic);
    };
  }, [autoplayBlocked, fadeMusic, interviewFocusMode, musicEnabled]);

  const playEffect = useCallback((volume: number, force = false) => {
    if (!soundEffectsEnabledRef.current) return;
    const now = window.performance.now();
    if (!force && now - lastEffectAtRef.current < 70) return;
    lastEffectAtRef.current = now;

    const effect = effectRef.current;
    if (!effect) return;
    effect.volume = volume;
    effect.currentTime = 0;
    void effect.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    const onPointerOver = (event: PointerEvent) => {
      if (!isInteractiveElement(event.target)) return;
      const control = event.target.closest("button, a, [role='button'], [role='switch']");
      if (event.relatedTarget instanceof Node && control?.contains(event.relatedTarget)) {
        return;
      }
      playEffect(0.08);
    };
    const onClick = (event: MouseEvent) => {
      if (isInteractiveElement(event.target)) playEffect(0.22, true);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (isInteractiveElement(event.target)) playEffect(0.08);
    };
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("click", onClick);
    document.addEventListener("focusin", onFocusIn);

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.removedNodes) {
          if (!(node instanceof Element)) continue;
          if (
            node.matches("[role='dialog'], [role='alertdialog']") ||
            node.querySelector("[role='dialog'], [role='alertdialog']")
          ) {
            playEffect(0.18);
            return;
          }
        }
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (
            node.matches("[role='dialog'], [role='alertdialog']") ||
            node.querySelector("[role='dialog'], [role='alertdialog']")
          ) {
            playEffect(0.2);
            return;
          }
          if (containsSoundworthyStatus(node)) {
            playEffect(0.24);
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("click", onClick);
      document.removeEventListener("focusin", onFocusIn);
      observer.disconnect();
    };
  }, [playEffect]);

  useEffect(() => {
    const onInterviewState = (event: Event) => {
      const detail = (event as CustomEvent<{ active?: boolean }>).detail;
      setInterviewFocusMode(Boolean(detail?.active));
    };
    window.addEventListener("ameego:interview-state", onInterviewState);
    queueMicrotask(() =>
      setInterviewFocusMode(document.documentElement.dataset.interviewFocus === "true"),
    );
    return () => window.removeEventListener("ameego:interview-state", onInterviewState);
  }, []);

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      window.dispatchEvent(new CustomEvent("ameego:connection-restored"));
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      return;
    }
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(
    () => () => {
      if (fadeFrameRef.current !== null) {
        window.cancelAnimationFrame(fadeFrameRef.current);
      }
      musicRef.current?.pause();
    },
    [],
  );

  const value = useMemo<AudioExperienceValue>(
    () => ({
      musicEnabled,
      soundEffectsEnabled,
      isOnline,
      autoplayBlocked,
      setMusicEnabled,
      setSoundEffectsEnabled,
      toggleMusic: () => setMusicEnabled((enabled) => !enabled),
    }),
    [autoplayBlocked, isOnline, musicEnabled, soundEffectsEnabled],
  );

  return (
    <AudioExperienceContext.Provider value={value}>
      <audio
        ref={musicRef}
        src="/audio/town-theme.mp3"
        preload="auto"
        loop
        onEnded={(event) => {
          if (!musicEnabled || interviewFocusMode) return;
          event.currentTarget.currentTime = 0;
          void event.currentTarget
            .play()
            .then(() => setAutoplayBlocked(false))
            .catch(() => setAutoplayBlocked(true));
        }}
        aria-hidden="true"
      />
      <audio
        ref={effectRef}
        src="/audio/button-press.mp3"
        preload="auto"
        aria-hidden="true"
      />
      {children}
    </AudioExperienceContext.Provider>
  );
}

export function useAudioExperience() {
  return useContext(AudioExperienceContext);
}
