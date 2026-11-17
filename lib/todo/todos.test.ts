import { describe, expect, it } from "vitest";
import type { Todo } from "@/types/todo";
import {
  dueLabel,
  filterTodos,
  groupByStatus,
  inScope,
  isOverdue,
  progress,
  sortTodos,
  toggleDone,
  validateListName,
  validateNewTodo,
} from "./todos";

// 2026-11-17 is a Tuesday. Its week runs 2026-11-16 to 2026-11-22.
const TODAY = "2026-11-17";

function todo(over: Partial<Todo> = {}): Todo {
  return {
    id: "t",
    listId: "l",
    title: "x",
    status: "todo",
    priority: "normal",
    dueDate: TODAY,
    createdAt: "2026-11-01T00:00:00.000Z",
    ...over,
  };
}

describe("validateNewTodo", () => {
  it("accepts a valid task", () => {
    expect(validateNewTodo({ title: "Read", priority: "high", dueDate: TODAY })).toBeNull();
    expect(validateNewTodo({ title: "Read", priority: "low", dueDate: null })).toBeNull();
  });
  it("rejects empty or too long titles and bad dates", () => {
    expect(validateNewTodo({ title: "  ", priority: "low", dueDate: null })).not.toBeNull();
    expect(
      validateNewTodo({ title: "a".repeat(121), priority: "low", dueDate: null }),
    ).not.toBeNull();
    expect(validateNewTodo({ title: "a", priority: "low", dueDate: "17.11." })).not.toBeNull();
  });
});

describe("validateListName", () => {
  it("rejects empty and duplicate names (case-insensitive)", () => {
    expect(validateListName("", [])).not.toBeNull();
    expect(validateListName("uni", ["Uni"])).not.toBeNull();
    expect(validateListName("Thesis", ["Uni"])).toBeNull();
  });
});

describe("scopes", () => {
  it("day shows today and overdue open tasks only", () => {
    expect(inScope(todo({ dueDate: TODAY }), "day", TODAY)).toBe(true);
    expect(inScope(todo({ dueDate: "2026-11-18" }), "day", TODAY)).toBe(false);
    expect(inScope(todo({ dueDate: "2026-11-10" }), "day", TODAY)).toBe(true);
    expect(inScope(todo({ dueDate: "2026-11-10", status: "done" }), "day", TODAY)).toBe(false);
  });
  it("week runs Monday to Sunday", () => {
    expect(inScope(todo({ dueDate: "2026-11-22" }), "week", TODAY)).toBe(true);
    expect(inScope(todo({ dueDate: "2026-11-23" }), "week", TODAY)).toBe(false);
    expect(inScope(todo({ dueDate: "2026-11-16" }), "week", TODAY)).toBe(true);
  });
  it("month covers the calendar month", () => {
    expect(inScope(todo({ dueDate: "2026-11-30" }), "month", TODAY)).toBe(true);
    expect(inScope(todo({ dueDate: "2026-12-01" }), "month", TODAY)).toBe(false);
  });
  it("tasks without a date only show under all", () => {
    expect(inScope(todo({ dueDate: null }), "all", TODAY)).toBe(true);
    expect(inScope(todo({ dueDate: null }), "week", TODAY)).toBe(false);
  });
  it("detects overdue", () => {
    expect(isOverdue(todo({ dueDate: "2026-11-16" }), TODAY)).toBe(true);
    expect(isOverdue(todo({ dueDate: TODAY }), TODAY)).toBe(false);
    expect(isOverdue(todo({ dueDate: null }), TODAY)).toBe(false);
  });
});

describe("sorting and grouping", () => {
  it("puts open tasks first, earlier dates first, no date last", () => {
    const list = sortTodos([
      todo({ id: "done", status: "done", dueDate: "2026-11-01" }),
      todo({ id: "none", dueDate: null }),
      todo({ id: "late", dueDate: "2026-11-20" }),
      todo({ id: "soon", dueDate: "2026-11-18" }),
    ]);
    expect(list.map((t) => t.id)).toEqual(["soon", "late", "none", "done"]);
  });
  it("sorts by priority on the same day", () => {
    const list = sortTodos([
      todo({ id: "low", priority: "low" }),
      todo({ id: "high", priority: "high" }),
    ]);
    expect(list.map((t) => t.id)).toEqual(["high", "low"]);
  });
  it("groups by board column", () => {
    const groups = groupByStatus([
      todo({ id: "a", status: "doing" }),
      todo({ id: "b", status: "done" }),
      todo({ id: "c" }),
    ]);
    expect(groups.todo.map((t) => t.id)).toEqual(["c"]);
    expect(groups.doing.map((t) => t.id)).toEqual(["a"]);
    expect(groups.done.map((t) => t.id)).toEqual(["b"]);
  });
  it("filters by list and scope", () => {
    const list = filterTodos(
      [todo({ id: "a" }), todo({ id: "b", listId: "other" }), todo({ id: "c", dueDate: null })],
      "l",
      "day",
      TODAY,
    );
    expect(list.map((t) => t.id)).toEqual(["a"]);
  });
});

describe("helpers", () => {
  it("toggles done", () => {
    expect(toggleDone("todo")).toBe("done");
    expect(toggleDone("doing")).toBe("done");
    expect(toggleDone("done")).toBe("todo");
  });
  it("counts progress", () => {
    expect(progress([todo({ status: "done" }), todo()])).toEqual({ done: 1, total: 2 });
  });
  it("labels due dates", () => {
    expect(dueLabel("2026-11-17", TODAY)).toBe("Today");
    expect(dueLabel("2026-11-18", TODAY)).toBe("Tomorrow");
    expect(dueLabel("2026-11-16", TODAY)).toBe("Yesterday");
    expect(dueLabel("2026-11-25", TODAY)).toBe("25.11.");
  });
});
