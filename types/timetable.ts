/**
 * Timetable: data contract.
 * All dates are local Lisbon dates "YYYY-MM-DD", all times local "HH:MM".
 */

export type EventCategory = "lecture" | "exam" | "deadline" | "holiday";

export const EVENT_CATEGORIES: Record<EventCategory, string> = {
  lecture: "Lectures",
  exam: "Exams",
  deadline: "Deadlines",
  holiday: "Holidays",
};

/** A term of the Nova SBE academic calendar (semester or trimester). */
export interface Term {
  id: string;
  /** e.g. "T2 · Fall 2026" */
  name: string;
  start: string;
  end: string;
}

/** A weekly lecture the user entered manually. Repeats every week of its term. */
export interface Lecture {
  id: string;
  title: string;
  /** 1 = Monday ... 7 = Sunday */
  weekday: number;
  start: string;
  end: string;
  location?: string;
  termId: string;
}

export type NewLecture = Omit<Lecture, "id">;

/** One entry in the timetable (lecture occurrence, exam, deadline or holiday). */
export interface TimetableEvent {
  id: string;
  title: string;
  date: string;
  /** Missing for all-day events. */
  start?: string;
  end?: string;
  location?: string;
  category: EventCategory;
}

/** A calendar file (.ics) the user uploaded, e.g. the exam export or Moodle deadlines. */
export interface ImportedCalendar {
  id: string;
  name: string;
  category: Extract<EventCategory, "exam" | "deadline">;
  importedAt: string;
  events: TimetableEvent[];
}

/** A one-time event the user added by hand (e.g. a group meeting or an extra exam). */
export type NewEvent = Omit<TimetableEvent, "id">;

export interface TimetableData {
  lectures: Lecture[];
  calendars: ImportedCalendar[];
  /** One-time events added by hand. */
  events: TimetableEvent[];
}

/**
 * Contract for timetable storage. Today: localStorage (data never leaves the device).
 * Later: Supabase, per logged-in user.
 */
export interface TimetableService {
  load(): Promise<TimetableData>;
  addLecture(input: NewLecture): Promise<TimetableData>;
  removeLecture(id: string): Promise<TimetableData>;
  importCalendar(
    name: string,
    category: ImportedCalendar["category"],
    icsText: string,
  ): Promise<TimetableData>;
  removeCalendar(id: string): Promise<TimetableData>;
  addEvent(input: NewEvent): Promise<TimetableData>;
  removeEvent(id: string): Promise<TimetableData>;
}
