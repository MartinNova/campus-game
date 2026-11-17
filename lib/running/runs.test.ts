import { describe, expect, it } from "vitest";
import type { NewRun, Run, RunClub } from "@/types/running";
import {
  clubRunId,
  clubRunsForDates,
  estimateMinutes,
  filterRuns,
  formatDuration,
  formatPace,
  joinRun,
  leaveRun,
  validateNewRun,
} from "./runs";

const valid: NewRun = {
  date: "2026-11-20",
  time: "18:30",
  location: "Cais do Sodré",
  distanceKm: 5,
  paceSecPerKm: 330,
  level: "intermediate",
  difficulty: "moderate",
  description: "",
};

const run: Run = {
  id: "r1",
  date: "2026-11-20",
  time: "18:30",
  location: "x",
  distanceKm: 5,
  paceSecPerKm: 330,
  level: "beginner",
  difficulty: "easy",
  description: "",
  runnerIds: ["a"],
  createdBy: "a",
  createdAt: "2026-11-17T00:00:00.000Z",
};

describe("formatting", () => {
  it("formats pace and duration", () => {
    expect(formatPace(330)).toBe("5:30");
    expect(formatPace(300)).toBe("5:00");
    expect(estimateMinutes(10, 330)).toBe(55);
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(75)).toBe("1 h 15 min");
  });
});

describe("validateNewRun", () => {
  it("accepts a valid run", () => {
    expect(validateNewRun(valid, "2026-11-17")).toBeNull();
  });
  it("rejects past dates, empty places and bad distances", () => {
    expect(validateNewRun({ ...valid, date: "2026-11-01" }, "2026-11-17")).not.toBeNull();
    expect(validateNewRun({ ...valid, location: "  " }, "2026-11-17")).not.toBeNull();
    expect(validateNewRun({ ...valid, distanceKm: 0 }, "2026-11-17")).not.toBeNull();
    expect(validateNewRun({ ...valid, distanceKm: NaN }, "2026-11-17")).not.toBeNull();
    expect(validateNewRun({ ...valid, paceSecPerKm: 123 }, "2026-11-17")).not.toBeNull();
  });
});

describe("join / leave", () => {
  it("adds and removes runners", () => {
    const joined = joinRun(run, "b");
    expect(joined.runnerIds).toEqual(["a", "b"]);
    expect(leaveRun(joined, "b").runnerIds).toEqual(["a"]);
  });
  it("rejects double join, leaving as creator and leaving without joining", () => {
    expect(() => joinRun(run, "a")).toThrow();
    expect(() => leaveRun(run, "a")).toThrow();
    expect(() => leaveRun(run, "zzz")).toThrow();
  });
});

describe("filterRuns", () => {
  it("filters by date and sorts by time", () => {
    const late = { ...run, id: "r2", time: "20:00" };
    const other = { ...run, id: "r3", date: "2026-11-21" };
    const result = filterRuns([late, other, run], { date: "2026-11-20" });
    expect(result.map((r) => r.id)).toEqual(["r1", "r2"]);
  });
});

describe("clubRunsForDates", () => {
  const club: RunClub = {
    id: "c",
    name: "C",
    description: "",
    schedule: "",
    meetingPoint: "Cais",
    links: [],
    weeklyRuns: [{ weekday: 1, time: "19:30" }],
  };
  it("creates a run for each matching weekday", () => {
    // 2026-11-16 is a Monday, 2026-11-17 a Tuesday
    const runs = clubRunsForDates([club], ["2026-11-16", "2026-11-17"]);
    expect(runs).toHaveLength(1);
    expect(runs[0].id).toBe(clubRunId("c", "2026-11-16"));
    expect(runs[0].time).toBe("19:30");
    expect(runs[0].createdBy).toBeNull();
  });
});
