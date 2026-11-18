import { toMinutes } from "@/lib/timetable/dates";
import type { PadelMatch } from "@/types/padel";
import type { TimetableEvent } from "@/types/timetable";
import type { Todo } from "@/types/todo";

/** Current time in Lisbon as "HH:MM". */
export function nowInLisbon(now = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
}

/** The lecture running now, or else the next one today. `events` are today's events. */
export function nextLecture(events: TimetableEvent[], time: string): TimetableEvent | null {
  return (
    events.find(
      (e) => e.category === "lecture" && e.start && toMinutes(e.end ?? e.start) > toMinutes(time),
    ) ?? null
  );
}

/** "Now", "in 45 min" or "in 2 h" until `start`. */
export function startsIn(start: string, time: string): string {
  const minutes = toMinutes(start) - toMinutes(time);
  if (minutes <= 0) return "Now";
  if (minutes < 60) return `in ${minutes} min`;
  return `in ${Math.round(minutes / 60)} h`;
}

/** Padel matches later today that still have a free spot. `matches` are today's matches. */
export function openMatches(matches: PadelMatch[], time: string): PadelMatch[] {
  return matches.filter(
    (m) => toMinutes(m.time) >= toMinutes(time) && m.playerIds.length + m.guestCount < m.maxPlayers,
  );
}

/** Open to-dos due today or earlier. */
export function dueTodos(todos: Todo[], today: string): Todo[] {
  return todos.filter((t) => t.status !== "done" && t.dueDate !== null && t.dueDate <= today);
}
