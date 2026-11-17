import { readJSON, writeJSON } from "@/lib/storage";
import { parseIcs } from "@/lib/timetable/ics";
import type { TimetableData, TimetableService } from "@/types/timetable";

/**
 * localStorage implementation: the timetable is personal, so it stays on this device only.
 * Swap for a Supabase version (per user) later; the UI stays the same.
 */
const KEY = "timetable";
const EMPTY: TimetableData = { lectures: [], calendars: [], events: [] };

function load(): TimetableData {
  const data = readJSON<TimetableData>(KEY, EMPTY);
  // `?? []` keeps older saved data (from before a field existed) working.
  return {
    lectures: data.lectures ?? [],
    calendars: data.calendars ?? [],
    events: data.events ?? [],
  };
}

function save(data: TimetableData): TimetableData {
  writeJSON(KEY, data);
  return data;
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const timetableService: TimetableService = {
  async load() {
    return load();
  },

  async addLecture(input) {
    const data = load();
    return save({ ...data, lectures: [...data.lectures, { ...input, id: newId() }] });
  },

  async removeLecture(id) {
    const data = load();
    return save({ ...data, lectures: data.lectures.filter((l) => l.id !== id) });
  },

  async importCalendar(name, category, icsText) {
    const id = newId();
    const events = parseIcs(icsText, category, id);
    if (events.length === 0) throw new Error("No events found in this file.");
    const data = load();
    // Re-uploading a file with the same name replaces the old version.
    const others = data.calendars.filter((c) => c.name !== name);
    return save({
      ...data,
      calendars: [...others, { id, name, category, importedAt: new Date().toISOString(), events }],
    });
  },

  async removeCalendar(id) {
    const data = load();
    return save({ ...data, calendars: data.calendars.filter((c) => c.id !== id) });
  },

  async addEvent(input) {
    const data = load();
    return save({ ...data, events: [...data.events, { ...input, id: `event:${newId()}` }] });
  },

  async removeEvent(id) {
    const data = load();
    return save({ ...data, events: data.events.filter((e) => e.id !== id) });
  },
};
