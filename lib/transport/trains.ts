import { addDays, toMinutes } from "@/lib/timetable/dates";
import type { Departure, Direction, NextTrain, StationId, TrainTimetable } from "@/types/transport";

/** Current date and time in Lisbon, e.g. { date: "2026-11-17", time: "22:41" }. */
export function lisbonNow(now = new Date()): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

function departuresOn(
  timetable: TrainTimetable,
  date: string,
  station: StationId,
  direction: Direction,
): Departure[] | null {
  const index = timetable.days[date];
  return index === undefined ? null : timetable.patterns[index][station][direction];
}

/** "24:10" -> "00:10" */
const normalise = (time: string) =>
  `${String(Number(time.slice(0, 2)) % 24).padStart(2, "0")}${time.slice(2)}`;

/**
 * The next `count` trains from `station` after `time` on `date`.
 * Includes late trains of the previous service day ("24:10") and continues into tomorrow.
 * Returns null when the timetable has no data for `date` (it needs updating).
 */
export function nextTrains(
  timetable: TrainTimetable,
  station: StationId,
  direction: Direction,
  date: string,
  time: string,
  count = 5,
): NextTrain[] | null {
  const today = departuresOn(timetable, date, station, direction);
  if (!today) return null;
  const now = toMinutes(time);
  const yesterday = departuresOn(timetable, addDays(date, -1), station, direction) ?? [];
  const tomorrow = departuresOn(timetable, addDays(date, 1), station, direction) ?? [];

  // Minutes from today's midnight for every candidate departure.
  const candidates = [
    ...yesterday.map(([t, info]) => ({ t, info, at: toMinutes(t) - 24 * 60 })),
    ...today.map(([t, info]) => ({ t, info, at: toMinutes(t) })),
    ...tomorrow.map(([t, info]) => ({ t, info, at: toMinutes(t) + 24 * 60 })),
  ];
  return candidates
    .filter((c) => c.at >= now)
    .sort((a, b) => a.at - b.at)
    .slice(0, count)
    .map((c) => ({
      time: normalise(c.t),
      info: direction === "toCascais" ? c.info : normalise(c.info),
      minutesAway: c.at - now,
    }));
}

/** "now", "in 7 min", "in 1 h 05" */
export function formatMinutesAway(minutes: number): string {
  if (minutes <= 0) return "now";
  if (minutes < 60) return `in ${minutes} min`;
  return `in ${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

/** Travel time in minutes between two "HH:MM" times (handles midnight). */
export function travelMinutes(dep: string, arr: string): number {
  return (toMinutes(arr) - toMinutes(dep) + 24 * 60) % (24 * 60);
}
