import { describe, expect, it } from "vitest";
import type { PadelMatch } from "@/types/padel";
import type { TimetableEvent } from "@/types/timetable";
import type { Todo } from "@/types/todo";
import { dueTodos, nextLecture, nowInLisbon, openMatches, startsIn } from "./today";

const lecture = (id: string, start: string, end: string): TimetableEvent => ({
  id,
  title: id,
  date: "2026-11-17",
  start,
  end,
  category: "lecture",
});

describe("nextLecture", () => {
  const events = [lecture("a", "09:00", "10:30"), lecture("b", "14:00", "15:30")];

  it("returns the lecture that is running now", () => {
    expect(nextLecture(events, "10:00")?.id).toBe("a");
  });

  it("returns the next lecture once the previous one ended", () => {
    expect(nextLecture(events, "10:30")?.id).toBe("b");
  });

  it("returns null after the last lecture and ignores other categories", () => {
    expect(nextLecture(events, "16:00")).toBeNull();
    expect(nextLecture([{ ...lecture("x", "18:00", "19:00"), category: "exam" }], "08:00")).toBe(
      null,
    );
  });
});

describe("startsIn", () => {
  it("formats minutes, hours and now", () => {
    expect(startsIn("14:00", "13:15")).toBe("in 45 min");
    expect(startsIn("14:00", "11:50")).toBe("in 2 h");
    expect(startsIn("14:00", "14:10")).toBe("Now");
  });
});

describe("openMatches", () => {
  const match = (time: string, players: number, guests = 0): PadelMatch => ({
    id: time,
    date: "2026-11-17",
    time,
    durationMinutes: 90,
    location: "Club",
    level: 2.5,
    maxPlayers: 4,
    playerIds: Array.from({ length: players }, (_, i) => `u${i}`),
    guestCount: guests,
    description: "",
    createdBy: "u0",
    createdAt: "2026-11-16T10:00:00Z",
  });

  it("keeps later matches with a free spot", () => {
    const result = openMatches(
      [match("09:00", 2), match("18:30", 3), match("20:00", 2, 2)],
      "12:00",
    );
    expect(result.map((m) => m.time)).toEqual(["18:30"]);
  });
});

describe("dueTodos", () => {
  const todo = (id: string, dueDate: string | null, status: Todo["status"] = "todo"): Todo => ({
    id,
    listId: "l",
    title: id,
    status,
    priority: "normal",
    dueDate,
    createdAt: "2026-11-01T00:00:00Z",
  });

  it("returns open to-dos due today or overdue", () => {
    const todos = [
      todo("today", "2026-11-17"),
      todo("late", "2026-11-10"),
      todo("done", "2026-11-17", "done"),
      todo("later", "2026-11-20"),
      todo("none", null),
    ];
    expect(dueTodos(todos, "2026-11-17").map((t) => t.id)).toEqual(["today", "late"]);
  });
});

describe("nowInLisbon", () => {
  it("uses Lisbon time in 24h format", () => {
    expect(nowInLisbon(new Date("2026-07-01T12:05:00Z"))).toBe("13:05");
  });
});
