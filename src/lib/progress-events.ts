export const PROGRESS_UPDATED_EVENT = "ameego:progress-updated";

export function notifyProgressUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
}
