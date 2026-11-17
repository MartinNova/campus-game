import type { EventCategory, Lecture, TimetableData, TimetableEvent } from "@/types/timetable";
import { addDays, weekday } from "./dates";
import { holidaysBetween } from "./holidays";
import { getTerm } from "./terms";

/**
 * Expands a weekly lecture into one event per week of its term.
 * Weeks that fall on a Portuguese holiday are skipped (Nova SBE cancels those classes).
 */
export function expandLecture(lecture: Lecture, holidayDates: Set<string>): TimetableEvent[] {
  const term = getTerm(lecture.termId);
  if (!term) return [];

  // First matching weekday on or after the term start.
  let date = addDays(term.start, (lecture.weekday - weekday(term.start) + 7) % 7);
  const events: TimetableEvent[] = [];
  while (date <= term.end) {
    if (!holidayDates.has(date)) {
      events.push({
        id: `${lecture.id}:${date}`,
        title: lecture.title,
        date,
        start: lecture.start,
        end: lecture.end,
        location: lecture.location,
        category: "lecture",
      });
    }
    date = addDays(date, 7);
  }
  return events;
}

/** All events between `from` and `to` (inclusive), sorted by date and time. */
export function eventsBetween(data: TimetableData, from: string, to: string): TimetableEvent[] {
  // Look at holidays of the whole academic year so lectures skip them correctly.
  const holidays = holidaysBetween(addDays(from, -400), addDays(to, 400));
  const holidayDates = new Set(holidays.map((h) => h.date));

  const all = [
    ...data.lectures.flatMap((l) => expandLecture(l, holidayDates)),
    ...data.calendars.flatMap((c) => c.events),
    ...holidays,
  ];

  return all
    .filter((e) => e.date >= from && e.date <= to)
    .sort((a, b) =>
      a.date === b.date
        ? (a.start ?? "").localeCompare(b.start ?? "")
        : a.date.localeCompare(b.date),
    );
}

export function filterByCategory(
  events: TimetableEvent[],
  visible: EventCategory[],
): TimetableEvent[] {
  return events.filter((e) => visible.includes(e.category));
}
