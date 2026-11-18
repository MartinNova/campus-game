import { describe, expect, it } from "vitest";
import type { TimetableData } from "@/types/timetable";
import type { TrainTimetable } from "@/types/transport";
import { DEFAULT_COMMUTE, lastClassOn, trainsAfterClass } from "./after-class";

// 2026-11-18 is a Wednesday in term T2 · Fall 2026.
const DATE = "2026-11-18";

const timetable: TrainTimetable = {
  source: "test",
  fetched: "2026-11-17",
  stations: {
    carcavelos: { name: "Carcavelos", lat: 0, lon: 0 },
    oeiras: { name: "Oeiras", lat: 0, lon: 0 },
  },
  patterns: [
    {
      carcavelos: { toCampus: [], toLisbon: [], toCascais: [] },
      oeiras: {
        toCampus: [],
        toLisbon: [
          ["17:43", "18:03"],
          ["17:53", "18:13"],
          ["18:03", "18:23"],
          ["18:13", "18:33"],
        ],
        toCascais: [["17:55", "Cascais"]],
      },
    },
  ],
  days: { [DATE]: 0 },
};

const data = (
  lectures: [string, string][],
  events: TimetableData["events"] = [],
): TimetableData => ({
  lectures: lectures.map(([start, end], i) => ({
    id: `l${i}`,
    title: `Lecture ${i}`,
    weekday: 3,
    start,
    end,
    termId: "2026-t2",
  })),
  calendars: [],
  events,
});

describe("lastClassOn", () => {
  it("finds the class that ends last", () => {
    const last = lastClassOn(
      data([
        ["09:30", "11:00"],
        ["16:00", "17:30"],
        ["14:00", "15:30"],
      ]),
      DATE,
    );
    expect(last?.end).toBe("17:30");
  });

  it("counts exams and ignores other days and all-day entries", () => {
    const withExam = data(
      [["09:30", "11:00"]],
      [
        { id: "e", title: "Exam", date: DATE, start: "18:00", end: "20:00", category: "exam" },
        { id: "d", title: "Deadline", date: DATE, category: "deadline" },
      ],
    );
    expect(lastClassOn(withExam, DATE)?.title).toBe("Exam");
    expect(lastClassOn(data([["09:30", "11:00"]]), "2026-11-19")).toBeNull();
  });
});

describe("trainsAfterClass", () => {
  it("adds the walk to the end of the last class", () => {
    const plan = trainsAfterClass(
      timetable,
      data([["16:00", "17:30"]]),
      DEFAULT_COMMUTE,
      DATE,
      "15:00",
      2,
    );
    expect(plan?.classOver).toBe(false);
    expect(plan?.atStation).toBe("17:50");
    expect(plan?.trains).toEqual([
      { time: "17:53", info: "18:13", minutesAway: 173 },
      { time: "18:03", info: "18:23", minutesAway: 183 },
    ]);
  });

  it("counts from now when the class is already over", () => {
    const plan = trainsAfterClass(
      timetable,
      data([["16:00", "17:30"]]),
      { ...DEFAULT_COMMUTE, walkMinutes: 10 },
      DATE,
      "17:45",
      1,
    );
    expect(plan?.classOver).toBe(true);
    expect(plan?.trains[0]).toEqual({ time: "18:03", info: "18:23", minutesAway: 18 });
  });

  it("works without classes and in the other direction", () => {
    const plan = trainsAfterClass(
      timetable,
      data([]),
      { ...DEFAULT_COMMUTE, direction: "toCascais" },
      DATE,
      "17:30",
      1,
    );
    expect(plan?.lastClass).toBeNull();
    expect(plan?.trains[0]).toMatchObject({ time: "17:55", info: "Cascais" });
  });

  it("returns null without train data for the day", () => {
    expect(
      trainsAfterClass(timetable, data([]), DEFAULT_COMMUTE, "2030-01-01", "10:00"),
    ).toBeNull();
  });
});
