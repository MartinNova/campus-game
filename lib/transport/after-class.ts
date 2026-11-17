import { eventsBetween } from "@/lib/timetable/schedule";
import { toMinutes } from "@/lib/timetable/dates";
import type { TimetableData, TimetableEvent } from "@/types/timetable";
import type { Direction, NextTrain, StationId, TrainTimetable } from "@/types/transport";
import { nextTrains } from "./trains";

/** Where the student goes after class. Saved on the device. */
export interface CommutePrefs {
  station: StationId;
  direction: Exclude<Direction, "toCampus">;
  /** Minutes from the lecture room to the platform. */
  walkMinutes: number;
}

export const DEFAULT_COMMUTE: CommutePrefs = {
  station: "oeiras",
  direction: "toLisbon",
  walkMinutes: 20,
};

/** The class that ends last on `date` (lectures and exams with a time), or null. */
export function lastClassOn(data: TimetableData, date: string): TimetableEvent | null {
  const classes = eventsBetween(data, date, date).filter(
    (e) => (e.category === "lecture" || e.category === "exam") && e.start,
  );
  if (classes.length === 0) return null;
  const endOf = (e: TimetableEvent) => toMinutes(e.end ?? e.start!);
  return classes.reduce((last, e) => (endOf(e) >= endOf(last) ? e : last));
}

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export interface AfterClassPlan {
  /** The last class today, or null if there is none. */
  lastClass: TimetableEvent | null;
  /** True if that class has already ended, so the trains are counted from now. */
  classOver: boolean;
  /** When you reach the platform, "HH:MM". */
  atStation: string;
  /** Next trains from the station; `minutesAway` counts from now. */
  trains: NextTrain[];
}

/**
 * Next trains you can catch after your last class today: class end (or now, if it's over)
 * plus the walk to the station. Returns null when the train data doesn't cover `date`.
 */
export function trainsAfterClass(
  trains: TrainTimetable,
  data: TimetableData,
  prefs: CommutePrefs,
  date: string,
  now: string,
  count = 3,
): AfterClassPlan | null {
  const lastClass = lastClassOn(data, date);
  const nowMinutes = toMinutes(now);
  const classEnd = lastClass ? toMinutes(lastClass.end ?? lastClass.start!) : nowMinutes;
  const classOver = classEnd <= nowMinutes;
  const atStation = Math.min(Math.max(classEnd, nowMinutes) + prefs.walkMinutes, 24 * 60 - 1);

  const next = nextTrains(trains, prefs.station, prefs.direction, date, toTime(atStation), count);
  if (!next) return null;
  return {
    lastClass,
    classOver,
    atStation: toTime(atStation),
    trains: next.map((t) => ({ ...t, minutesAway: t.minutesAway + atStation - nowMinutes })),
  };
}
