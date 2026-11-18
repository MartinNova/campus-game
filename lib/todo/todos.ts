import { addDays, startOfMonth, startOfWeek } from "@/lib/timetable/dates";
import {
  LABEL_COLORS,
  TODO_PRIORITIES,
  type LabelColor,
  type NewTodo,
  type Todo,
  type TodoColumn,
  type TodoList,
  type TodoPatch,
  type TodoPriority,
  type TodoScope,
} from "@/types/todo";

/** Pure to-do logic (no storage), so it can be tested and reused with Supabase later. */

export const MAX_TITLE_LENGTH = 120;
export const MAX_LIST_NAME_LENGTH = 30;
export const MAX_COLUMN_NAME_LENGTH = 24;
export const MAX_LABEL_NAME_LENGTH = 20;

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The columns every new list starts with. */
export function defaultColumns(newId: () => string): TodoColumn[] {
  return [
    { id: newId(), name: "To do", isDone: false },
    { id: newId(), name: "Doing", isDone: false },
    { id: newId(), name: "Done", isDone: true },
  ];
}

// ---------- validation ----------

/** Returns an error message, or null if the new task is valid. */
export function validateNewTodo(input: NewTodo): string | null {
  const title = input.title.trim();
  if (!title) return "Write down what you need to do.";
  if (title.length > MAX_TITLE_LENGTH) return `Keep it under ${MAX_TITLE_LENGTH} characters.`;
  if (input.dueDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate))
    return "Pick a valid date.";
  if (!TODO_PRIORITIES.some((p) => p.value === input.priority)) return "Pick a priority.";
  return null;
}

/** Returns an error message, or null if the list name is valid. */
export function validateListName(name: string, existing: string[]): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Give the list a name.";
  if (trimmed.length > MAX_LIST_NAME_LENGTH)
    return `Keep it under ${MAX_LIST_NAME_LENGTH} characters.`;
  if (existing.some((n) => sameName(n, trimmed))) return "You already have a list with this name.";
  return null;
}

/** Returns an error message, or null if the column name is valid. */
export function validateColumnName(name: string, existing: string[]): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Give the column a name.";
  if (trimmed.length > MAX_COLUMN_NAME_LENGTH)
    return `Keep it under ${MAX_COLUMN_NAME_LENGTH} characters.`;
  if (existing.some((n) => sameName(n, trimmed))) return "This list already has such a column.";
  return null;
}

/** Returns an error message, or null if the label is valid. */
export function validateLabel(name: string, color: LabelColor, existing: string[]): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Give the label a name.";
  if (trimmed.length > MAX_LABEL_NAME_LENGTH)
    return `Keep it under ${MAX_LABEL_NAME_LENGTH} characters.`;
  if (existing.some((n) => sameName(n, trimmed))) return "You already have a label with this name.";
  if (!LABEL_COLORS.some((c) => c.value === color)) return "Pick a colour.";
  return null;
}

// ---------- columns ----------

export function addColumn(list: TodoList, name: string, id: string): TodoList {
  const error = validateColumnName(
    name,
    list.columns.map((c) => c.name),
  );
  if (error) throw new Error(error);
  return { ...list, columns: [...list.columns, { id, name: name.trim(), isDone: false }] };
}

export function renameColumn(list: TodoList, columnId: string, name: string): TodoList {
  const error = validateColumnName(
    name,
    list.columns.filter((c) => c.id !== columnId).map((c) => c.name),
  );
  if (error) throw new Error(error);
  return {
    ...list,
    columns: list.columns.map((c) => (c.id === columnId ? { ...c, name: name.trim() } : c)),
  };
}

export function setColumnDone(list: TodoList, columnId: string, isDone: boolean): TodoList {
  return {
    ...list,
    columns: list.columns.map((c) => (c.id === columnId ? { ...c, isDone } : c)),
  };
}

export function moveColumn(list: TodoList, columnId: string, direction: -1 | 1): TodoList {
  const from = list.columns.findIndex((c) => c.id === columnId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= list.columns.length) return list;
  const columns = [...list.columns];
  [columns[from], columns[to]] = [columns[to], columns[from]];
  return { ...list, columns };
}

/** Removes a column. Its tasks move to the first remaining column (and take its done state). */
export function removeColumn(
  list: TodoList,
  columnId: string,
  todos: Todo[],
): { list: TodoList; todos: Todo[] } {
  if (list.columns.length <= 1) throw new Error("A list needs at least one column.");
  const remaining = list.columns.filter((c) => c.id !== columnId);
  const target = remaining[0];
  return {
    list: { ...list, columns: remaining },
    todos: todos.map((t) =>
      t.listId === list.id && t.columnId === columnId
        ? { ...t, columnId: target.id, done: target.isDone }
        : t,
    ),
  };
}

// ---------- tasks ----------

/** Moving a task into a column also sets its done state from the column. */
export function moveTodo(todo: Todo, column: TodoColumn): Todo {
  return { ...todo, columnId: column.id, done: column.isDone };
}

/**
 * Ticks or unticks a task. Ticking moves it to the first "done" column (if the list has one),
 * unticking moves it out of a done column into the first other column.
 */
export function setDone(todo: Todo, done: boolean, columns: TodoColumn[]): Todo {
  if (todo.done === done) return todo;
  const current = columns.find((c) => c.id === todo.columnId);
  const target = done
    ? columns.find((c) => c.isDone)
    : current?.isDone
      ? columns.find((c) => !c.isDone)
      : undefined;
  return { ...todo, done, columnId: target?.id ?? todo.columnId };
}

/** Applies a patch to a task: plain fields, then a column change, then the done state. */
export function applyPatch(todo: Todo, patch: TodoPatch, columns: TodoColumn[]): Todo {
  const { columnId, done, ...fields } = patch;
  let next: Todo = { ...todo, ...fields };
  if (fields.title !== undefined) next.title = fields.title.trim();
  const column = columnId ? columns.find((c) => c.id === columnId) : undefined;
  if (column && column.id !== next.columnId) next = moveTodo(next, column);
  if (done !== undefined) next = setDone(next, done, columns);
  return next;
}

export function removeLabelFromTodos(todos: Todo[], labelId: string): Todo[] {
  return todos.map((t) =>
    t.labelIds.includes(labelId)
      ? { ...t, labelIds: t.labelIds.filter((id) => id !== labelId) }
      : t,
  );
}

export function isOverdue(todo: Todo, today: string): boolean {
  return !todo.done && todo.dueDate !== null && todo.dueDate < today;
}

/**
 * Whether a task belongs to a time window.
 * - day: due today, plus open tasks that are overdue
 * - week: due in the current week (Monday to Sunday), plus overdue open tasks
 * - month: due in the current calendar month, plus overdue open tasks
 * - all: everything, also tasks without a date
 */
export function inScope(todo: Todo, scope: TodoScope, today: string): boolean {
  if (scope === "all") return true;
  if (todo.dueDate === null) return false;
  if (isOverdue(todo, today)) return true;
  if (scope === "day") return todo.dueDate === today;
  if (scope === "week") {
    const start = startOfWeek(today);
    return todo.dueDate >= start && todo.dueDate <= addDays(start, 6);
  }
  return todo.dueDate.slice(0, 7) === startOfMonth(today).slice(0, 7);
}

const PRIORITY_ORDER: Record<TodoPriority, number> = { high: 0, normal: 1, low: 2 };

/** Open tasks first, then by due date (no date last), then by priority. */
export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.dueDate !== b.dueDate) {
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    return byPriority !== 0 ? byPriority : a.createdAt.localeCompare(b.createdAt);
  });
}

/** Tasks of one list in a time window, optionally only those with a given label. */
export function filterTodos(
  todos: Todo[],
  listId: string,
  scope: TodoScope,
  today: string,
  labelId: string | null = null,
): Todo[] {
  return sortTodos(
    todos.filter(
      (t) =>
        t.listId === listId &&
        inScope(t, scope, today) &&
        (labelId === null || t.labelIds.includes(labelId)),
    ),
  );
}

/** Tasks per board column. Tasks with an unknown column land in the first column. */
export function groupByColumn(todos: Todo[], columns: TodoColumn[]): Record<string, Todo[]> {
  const groups: Record<string, Todo[]> = Object.fromEntries(columns.map((c) => [c.id, []]));
  for (const todo of sortTodos(todos)) {
    const key = todo.columnId in groups ? todo.columnId : columns[0]?.id;
    if (key !== undefined) groups[key].push(todo);
  }
  return groups;
}

export function progress(todos: Todo[]): { done: number; total: number } {
  return { done: todos.filter((t) => t.done).length, total: todos.length };
}

/** "2026-11-20" -> "Today", "Tomorrow", "Yesterday" or the plain date. */
export function dueLabel(dueDate: string, today: string): string {
  if (dueDate === today) return "Today";
  if (dueDate === addDays(today, 1)) return "Tomorrow";
  if (dueDate === addDays(today, -1)) return "Yesterday";
  const [, m, d] = dueDate.split("-");
  return `${d}.${m}.`;
}
