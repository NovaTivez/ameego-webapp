export const PROGRESS_CHANGED_EVENT = "ameego:progress-changed";

export function notifyProgressChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_CHANGED_EVENT));
  }
}
