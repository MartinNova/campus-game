import { describe, expect, it } from "vitest";
import type { Todo, TodoColumn, TodoList } from "@/types/todo";
import {
  addColumn,
  applyPatch,
  defaultColumns,
  dueLabel,
  filterTodos,
  groupByColumn,
  inScope,
  isOverdue,
  moveColumn,
  moveTodo,
  progress,
  removeColumn,
  removeLabelFromTodos,
  renameColumn,
  setColumnDone,
  setDone,
  sortTodos,
  validateColumnName,
  validateLabel,
  validateListName,
  validateNewTodo,
} from "./todos";

// 2026-11-17 is a Tuesday. Its week runs 2026-11-16 to 2026-11-22.
const TODAY = "2026-11-17";

const COLUMNS: TodoColumn[] = [
  { id: "c1", name: "To do", isDone: false },
  { id: "c2", name: "Doing", isDone: false },
  { id: "c3", name: "Done", isDone: true },
];

const LIST: TodoList = {
  id: "l",
  name: "Uni",
  columns: COLUMNS,
  createdAt: "2026-11-01T00:00:00Z",
};

function todo(over: Partial<Todo> = {}): Todo {
  return {
    id: "t",
    listId: "l",
    columnId: "c1",
    title: "x",
    done: false,
    priority: "normal",
    dueDate: TODAY,
    labelIds: [],
    createdAt: "2026-11-01T00:00:00.000Z",
    ...over,
  };
}

describe("validateNewTodo", () => {
  const input = { title: "Read", priority: "high" as const, dueDate: TODAY, labelIds: [] };
  it("accepts a valid task", () => {
    expect(validateNewTodo(input)).toBeNull();
    expect(validateNewTodo({ ...input, dueDate: null })).toBeNull();
  });
  it("rejects empty or too long titles and bad dates", () => {
    expect(validateNewTodo({ ...input, title: "  " })).not.toBeNull();
    expect(validateNewTodo({ ...input, title: "a".repeat(121) })).not.toBeNull();
    expect(validateNewTodo({ ...input, dueDate: "17.11." })).not.toBeNull();
  });
});

describe("validation of names", () => {
  it("rejects empty and duplicate list names (case-insensitive)", () => {
    expect(validateListName("", [])).not.toBeNull();
    expect(validateListName("uni", ["Uni"])).not.toBeNull();
    expect(validateListName("Thesis", ["Uni"])).toBeNull();
  });
  it("checks column names", () => {
    expect(validateColumnName(" ", [])).not.toBeNull();
    expect(validateColumnName("doing", ["Doing"])).not.toBeNull();
    expect(validateColumnName("a".repeat(25), [])).not.toBeNull();
    expect(validateColumnName("In review", ["Doing"])).toBeNull();
  });
  it("checks labels", () => {
    expect(validateLabel("Finance", "yellow", [])).toBeNull();
    expect(validateLabel("", "yellow", [])).not.toBeNull();
    expect(validateLabel("finance", "yellow", ["Finance"])).not.toBeNull();
    // @ts-expect-error not a real colour
    expect(validateLabel("X", "magenta", [])).not.toBeNull();
  });
});

describe("columns", () => {
  it("creates To do, Doing and Done with Done counting as done", () => {
    let n = 0;
    const columns = defaultColumns(() => `id${++n}`);
    expect(columns.map((c) => c.name)).toEqual(["To do", "Doing", "Done"]);
    expect(columns.map((c) => c.isDone)).toEqual([false, false, true]);
  });
  it("adds, renames and marks columns", () => {
    const added = addColumn(LIST, "In review", "c4");
    expect(added.columns.map((c) => c.name)).toEqual(["To do", "Doing", "Done", "In review"]);
    expect(() => addColumn(LIST, "doing", "c5")).toThrow();
    const renamed = renameColumn(LIST, "c2", "Working on it");
    expect(renamed.columns[1].name).toBe("Working on it");
    // keeping the own name is allowed
    expect(renameColumn(LIST, "c2", "Doing").columns[1].name).toBe("Doing");
    expect(setColumnDone(LIST, "c2", true).columns[1].isDone).toBe(true);
  });
  it("reorders columns and ignores moves past the ends", () => {
    expect(moveColumn(LIST, "c1", 1).columns.map((c) => c.id)).toEqual(["c2", "c1", "c3"]);
    expect(moveColumn(LIST, "c1", -1)).toBe(LIST);
    expect(moveColumn(LIST, "c3", 1)).toBe(LIST);
  });
  it("removes a column and moves its tasks to the first remaining column", () => {
    const todos = [
      todo({ id: "a", columnId: "c3", done: true }),
      todo({ id: "b", columnId: "c2" }),
    ];
    const result = removeColumn(LIST, "c3", todos);
    expect(result.list.columns.map((c) => c.id)).toEqual(["c1", "c2"]);
    expect(result.todos[0]).toMatchObject({ columnId: "c1", done: false });
    expect(result.todos[1].columnId).toBe("c2");
  });
  it("keeps at least one column", () => {
    const single: TodoList = { ...LIST, columns: [COLUMNS[0]] };
    expect(() => removeColumn(single, "c1", [])).toThrow();
  });
});

describe("done state and moving", () => {
  it("moving into a done column ticks the task, moving out unticks it", () => {
    expect(moveTodo(todo(), COLUMNS[2])).toMatchObject({ columnId: "c3", done: true });
    expect(moveTodo(todo({ columnId: "c3", done: true }), COLUMNS[0])).toMatchObject({
      columnId: "c1",
      done: false,
    });
  });
  it("ticking moves to the done column, unticking back to the first open column", () => {
    expect(setDone(todo({ columnId: "c2" }), true, COLUMNS)).toMatchObject({
      columnId: "c3",
      done: true,
    });
    expect(setDone(todo({ columnId: "c3", done: true }), false, COLUMNS)).toMatchObject({
      columnId: "c1",
      done: false,
    });
  });
  it("ticking works without a done column", () => {
    const open = COLUMNS.slice(0, 2);
    expect(setDone(todo({ columnId: "c2" }), true, open)).toMatchObject({
      columnId: "c2",
      done: true,
    });
  });
  it("applies a patch: fields, column and done", () => {
    const patched = applyPatch(
      todo(),
      { title: "  New  ", priority: "high", labelIds: ["a"], columnId: "c3" },
      COLUMNS,
    );
    expect(patched).toMatchObject({
      title: "New",
      priority: "high",
      labelIds: ["a"],
      columnId: "c3",
      done: true,
    });
    expect(applyPatch(todo(), { done: true }, COLUMNS)).toMatchObject({
      columnId: "c3",
      done: true,
    });
  });
  it("removes a deleted label from tasks", () => {
    const result = removeLabelFromTodos(
      [todo({ id: "a", labelIds: ["x", "y"] }), todo({ id: "b", labelIds: ["y"] })],
      "x",
    );
    expect(result.map((t) => t.labelIds)).toEqual([["y"], ["y"]]);
  });
});

describe("scopes", () => {
  it("day shows today and overdue open tasks only", () => {
    expect(inScope(todo({ dueDate: TODAY }), "day", TODAY)).toBe(true);
    expect(inScope(todo({ dueDate: "2026-11-18" }), "day", TODAY)).toBe(false);
    expect(inScope(todo({ dueDate: "2026-11-10" }), "day", TODAY)).toBe(true);
    expect(inScope(todo({ dueDate: "2026-11-10", done: true }), "day", TODAY)).toBe(false);
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

describe("sorting, grouping and filtering", () => {
  it("puts open tasks first, earlier dates first, no date last", () => {
    const list = sortTodos([
      todo({ id: "done", done: true, dueDate: "2026-11-01" }),
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
  it("groups by column and puts unknown columns into the first", () => {
    const groups = groupByColumn(
      [
        todo({ id: "a", columnId: "c2" }),
        todo({ id: "b", columnId: "c3", done: true }),
        todo({ id: "c" }),
        todo({ id: "d", columnId: "gone" }),
      ],
      COLUMNS,
    );
    expect(groups.c1.map((t) => t.id).sort()).toEqual(["c", "d"]);
    expect(groups.c2.map((t) => t.id)).toEqual(["a"]);
    expect(groups.c3.map((t) => t.id)).toEqual(["b"]);
  });
  it("filters by list, scope and label", () => {
    const todos = [
      todo({ id: "a", labelIds: ["fin"] }),
      todo({ id: "b", listId: "other" }),
      todo({ id: "c", dueDate: null }),
      todo({ id: "d" }),
    ];
    expect(filterTodos(todos, "l", "day", TODAY).map((t) => t.id)).toEqual(["a", "d"]);
    expect(filterTodos(todos, "l", "all", TODAY, "fin").map((t) => t.id)).toEqual(["a"]);
  });
});

describe("helpers", () => {
  it("counts progress", () => {
    expect(progress([todo({ done: true }), todo()])).toEqual({ done: 1, total: 2 });
  });
  it("labels due dates", () => {
    expect(dueLabel("2026-11-17", TODAY)).toBe("Today");
    expect(dueLabel("2026-11-18", TODAY)).toBe("Tomorrow");
    expect(dueLabel("2026-11-16", TODAY)).toBe("Yesterday");
    expect(dueLabel("2026-11-25", TODAY)).toBe("25.11.");
  });
});
