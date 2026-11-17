import { addDays, startOfMonth, startOfWeek } from "@/lib/timetable/dates";
import {
  TODO_PRIORITIES,
  type NewTodo,
  type Todo,
  type TodoPriority,
  type TodoScope,
  type TodoStatus,
} from "@/types/todo";

/** Pure to-do logic (no storage), so it can be tested and reused with Supabase later. */

export const MAX_TITLE_LENGTH = 120;
export const MAX_LIST_NAME_LENGTH = 30;

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
  if (existing.some((n) => n.trim().toLowerCase() === trimmed.toLowerCase()))
    return "You already have a list with this name.";
  return null;
}

export function isOverdue(todo: Todo, today: string): boolean {
  return todo.status !== "done" && todo.dueDate !== null && todo.dueDate < today;
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
    if ((a.status === "done") !== (b.status === "done")) return a.status === "done" ? 1 : -1;
    if (a.dueDate !== b.dueDate) {
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    return byPriority !== 0 ? byPriority : a.createdAt.localeCompare(b.createdAt);
  });
}

export function filterTodos(
  todos: Todo[],
  listId: string,
  scope: TodoScope,
  today: string,
): Todo[] {
  return sortTodos(todos.filter((t) => t.listId === listId && inScope(t, scope, today)));
}

/** Tasks per board column, each column sorted like the checklist. */
export function groupByStatus(todos: Todo[]): Record<TodoStatus, Todo[]> {
  const sorted = sortTodos(todos);
  return {
    todo: sorted.filter((t) => t.status === "todo"),
    doing: sorted.filter((t) => t.status === "doing"),
    done: sorted.filter((t) => t.status === "done"),
  };
}

/** Ticking a task in the checklist: done <-> to do. */
export function toggleDone(status: TodoStatus): TodoStatus {
  return status === "done" ? "todo" : "done";
}

export function progress(todos: Todo[]): { done: number; total: number } {
  return { done: todos.filter((t) => t.status === "done").length, total: todos.length };
}

/** "2026-11-20" -> "Today", "Tomorrow", "Yesterday" or the plain date. */
export function dueLabel(dueDate: string, today: string): string {
  if (dueDate === today) return "Today";
  if (dueDate === addDays(today, 1)) return "Tomorrow";
  if (dueDate === addDays(today, -1)) return "Yesterday";
  const [, m, d] = dueDate.split("-");
  return `${d}.${m}.`;
}
