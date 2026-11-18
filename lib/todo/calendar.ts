import { addDays, addMonths, formatDay, startOfMonth, startOfWeek } from "@/lib/timetable/dates";
import type { Todo } from "@/types/todo";

/** Month calendar helpers for the deadline view. All dates are "YYYY-MM-DD". */

export interface CalendarDay {
  iso: string;
  /** False for the leading and trailing days of the neighbouring months. */
  inMonth: boolean;
}

/** Weeks (Monday first) that cover the month of `monthIso`. */
export function monthGrid(monthIso: string): CalendarDay[][] {
  const first = startOfMonth(monthIso);
  const last = addDays(addMonths(first, 1), -1);
  const start = startOfWeek(first);
  const end = addDays(startOfWeek(last), 6);
  const weeks: CalendarDay[][] = [];
  for (let day = start; day <= end;) {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i++, day = addDays(day, 1)) {
      week.push({ iso: day, inMonth: day.slice(0, 7) === first.slice(0, 7) });
    }
    weeks.push(week);
  }
  return weeks;
}

/** First day of the month `delta` months after (or before) `monthIso`. */
export function shiftMonth(monthIso: string, delta: number): string {
  return startOfMonth(addMonths(startOfMonth(monthIso), delta));
}

/** "November 2026" */
export function monthTitle(monthIso: string): string {
  return formatDay(monthIso, { month: "long", year: "numeric" });
}

/** Tasks that have a due date, grouped by that date. */
export function todosByDate(todos: Todo[]): Record<string, Todo[]> {
  const result: Record<string, Todo[]> = {};
  for (const todo of todos) {
    if (todo.dueDate === null) continue;
    (result[todo.dueDate] ??= []).push(todo);
  }
  return result;
}

/** Number of tasks due in a month and how many of them are done. */
export function monthSummary(todos: Todo[], monthIso: string): { due: number; done: number } {
  const prefix = startOfMonth(monthIso).slice(0, 7);
  const inMonth = todos.filter((t) => t.dueDate !== null && t.dueDate.slice(0, 7) === prefix);
  return { due: inMonth.length, done: inMonth.filter((t) => t.done).length };
}
