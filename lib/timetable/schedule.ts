import type { EventCategory, Lecture, TimetableData, TimetableEvent } from "@/types/timetable";
import { addDays, toMinutes, weekday } from "./dates";
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
        lectureId: lecture.id,
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
    ...(data.events ?? []),
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

export interface PositionedEvent {
  event: TimetableEvent;
  startMin: number;
  endMin: number;
  /** Column inside the day when events overlap (0-based). */
  lane: number;
  /** Number of columns needed by the group of overlapping events. */
  laneCount: number;
}

/**
 * Places timed events of one day side by side when they overlap (like Google Calendar).
 * Events without an end time (e.g. Moodle deadlines) get `defaultDuration` minutes.
 */
export function layoutTimedEvents(
  events: TimetableEvent[],
  defaultDuration = 30,
): PositionedEvent[] {
  const items = events
    .filter((e) => e.start)
    .map((event) => {
      const startMin = toMinutes(event.start!);
      const endMin = event.end ? toMinutes(event.end) : startMin + defaultDuration;
      return { event, startMin, endMin: Math.max(endMin, startMin + 15) };
    })
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  const result: PositionedEvent[] = [];
  let group: PositionedEvent[] = [];
  let laneEnds: number[] = [];
  let groupEnd = -1;

  const closeGroup = () => {
    for (const p of group) p.laneCount = laneEnds.length;
    group = [];
    laneEnds = [];
    groupEnd = -1;
  };

  for (const item of items) {
    if (group.length > 0 && item.startMin >= groupEnd) closeGroup();
    let lane = laneEnds.findIndex((end) => end <= item.startMin);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.endMin);
    } else {
      laneEnds[lane] = item.endMin;
    }
    const positioned = { ...item, lane, laneCount: 1 };
    group.push(positioned);
    result.push(positioned);
    groupEnd = Math.max(groupEnd, item.endMin);
  }
  closeGroup();
  return result;
}
