import { readJSON, writeJSON } from "@/lib/storage";

/**
 * "Look around first": signed-out visitors who chose to browse without an account.
 * Stored on the device and shared with React via useSyncExternalStore.
 */
const KEY = "guest-browsing";
const listeners = new Set<() => void>();

export function subscribeToGuest(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isGuest(): boolean {
  return readJSON(KEY, false);
}

export function setGuest(value: boolean): void {
  if (isGuest() === value) return;
  writeJSON(KEY, value);
  listeners.forEach((listener) => listener());
}
