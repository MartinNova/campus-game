import { describe, expect, it } from "vitest";
import type { Todo } from "@/types/todo";
import { monthGrid, monthSummary, monthTitle, shiftMonth, todosByDate } from "./calendar";

function todo(id: string, dueDate: string | null, done = false): Todo {
  return {
    id,
    listId: "l",
    columnId: "c",
    title: id,
    done,
    priority: "normal",
    dueDate,
    labelIds: [],
    createdAt: "2026-11-01T00:00:00.000Z",
  };
}

describe("monthGrid", () => {
  it("covers November 2026 in full weeks starting on Monday", () => {
    // 1 Nov 2026 is a Sunday, 30 Nov a Monday.
    const weeks = monthGrid("2026-11-17");
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0][0].iso).toBe("2026-10-26");
    expect(weeks[0][6]).toEqual({ iso: "2026-11-01", inMonth: true });
    expect(weeks[0][0].inMonth).toBe(false);
    expect(weeks.at(-1)?.[0]).toEqual({ iso: "2026-11-30", inMonth: true });
    expect(weeks.at(-1)?.[6].iso).toBe("2026-12-06");
    expect(weeks).toHaveLength(6);
  });
  it("uses five weeks when the month fits", () => {
    // Feb 2027 starts on a Monday and has 28 days.
    expect(monthGrid("2027-02-10")).toHaveLength(4);
  });
});

describe("month helpers", () => {
  it("shifts months", () => {
    expect(shiftMonth("2026-11-17", 1)).toBe("2026-12-01");
    expect(shiftMonth("2026-01-31", -1)).toBe("2025-12-01");
    expect(shiftMonth("2026-11-17", 0)).toBe("2026-11-01");
  });
  it("names the month", () => {
    expect(monthTitle("2026-11-01")).toBe("November 2026");
  });
  it("groups tasks by due date and skips undated ones", () => {
    const groups = todosByDate([todo("a", "2026-11-20"), todo("b", "2026-11-20"), todo("c", null)]);
    expect(Object.keys(groups)).toEqual(["2026-11-20"]);
    expect(groups["2026-11-20"]).toHaveLength(2);
  });
  it("summarises a month", () => {
    const todos = [
      todo("a", "2026-11-20", true),
      todo("b", "2026-11-25"),
      todo("c", "2026-12-01"),
      todo("d", null),
    ];
    expect(monthSummary(todos, "2026-11-15")).toEqual({ due: 2, done: 1 });
  });
});
