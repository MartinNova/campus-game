"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_WIDGET_PREFS, normalizeWidgetPrefs, type WidgetPrefs } from "@/lib/home/widgets";
import { readJSON, writeJSON } from "@/lib/storage";

const KEY = "home-widgets";

const listeners = new Set<() => void>();
let cached: WidgetPrefs | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab changed the widgets: read them again.
  const onStorage = () => {
    cached = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): WidgetPrefs {
  cached ??= normalizeWidgetPrefs(readJSON<unknown>(KEY, null));
  return cached;
}

const getServerSnapshot = () => DEFAULT_WIDGET_PREFS;

/** The user's widget choice, remembered on this device. */
export function useWidgetPrefs(): [WidgetPrefs, (next: WidgetPrefs) => void] {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const save = useCallback((next: WidgetPrefs) => {
    cached = next;
    writeJSON(KEY, next);
    listeners.forEach((listener) => listener());
  }, []);
  return [prefs, save];
}
