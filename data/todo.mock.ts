import { addDays } from "@/lib/timetable/dates";
import type { Todo, TodoList } from "@/types/todo";

/**
 * Example list and tasks so the Study Hub isn't empty on first start.
 * Dates are relative to `today`, so the demo always has current tasks.
 */
export const DEFAULT_LIST_ID = "list-uni";

export function createMockLists(today: string): TodoList[] {
  return [{ id: DEFAULT_LIST_ID, name: "Uni", createdAt: `${today}T00:00:00.000Z` }];
}

export function createMockTodos(today: string): Todo[] {
  const createdAt = `${today}T00:00:00.000Z`;
  const base = { listId: DEFAULT_LIST_ID, createdAt };
  return [
    {
      ...base,
      id: "mock-todo-1",
      title: "Read chapter for tomorrow's lecture",
      status: "doing",
      priority: "normal",
      dueDate: addDays(today, 1),
    },
    {
      ...base,
      id: "mock-todo-2",
      title: "Finish group project slides",
      status: "todo",
      priority: "high",
      dueDate: addDays(today, 3),
    },
    {
      ...base,
      id: "mock-todo-3",
      title: "Revise for the midterm",
      status: "todo",
      priority: "normal",
      dueDate: addDays(today, 12),
    },
    {
      ...base,
      id: "mock-todo-4",
      title: "Hand in problem set",
      status: "done",
      priority: "normal",
      dueDate: today,
    },
  ];
}
