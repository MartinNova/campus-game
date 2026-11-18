import { defaultColumns } from "@/lib/todo/todos";
import { addDays } from "@/lib/timetable/dates";
import type { Todo, TodoLabel, TodoList } from "@/types/todo";

/**
 * Example list, labels and tasks so the Study Hub isn't empty on first start.
 * Dates are relative to `today`, so the demo always has current tasks.
 */
export const DEFAULT_LIST_ID = "list-uni";

export function createMockLists(today: string): TodoList[] {
  const columns = defaultColumns(
    (() => {
      let n = 0;
      return () => `col-uni-${++n}`;
    })(),
  );
  return [{ id: DEFAULT_LIST_ID, name: "Uni", columns, createdAt: `${today}T00:00:00.000Z` }];
}

export function createMockLabels(): TodoLabel[] {
  return [
    { id: "label-finance", name: "Finance", color: "yellow" },
    { id: "label-marketing", name: "Marketing", color: "pink" },
    { id: "label-group", name: "Group work", color: "blue" },
  ];
}

export function createMockTodos(today: string): Todo[] {
  const base = {
    listId: DEFAULT_LIST_ID,
    createdAt: `${today}T00:00:00.000Z`,
  };
  const [todo, doing, done] = ["col-uni-1", "col-uni-2", "col-uni-3"];
  return [
    {
      ...base,
      id: "mock-todo-1",
      title: "Read chapter for tomorrow's lecture",
      columnId: doing,
      done: false,
      priority: "normal",
      dueDate: addDays(today, 1),
      labelIds: ["label-finance"],
    },
    {
      ...base,
      id: "mock-todo-2",
      title: "Finish group project slides",
      columnId: todo,
      done: false,
      priority: "high",
      dueDate: addDays(today, 3),
      labelIds: ["label-marketing", "label-group"],
    },
    {
      ...base,
      id: "mock-todo-3",
      title: "Revise for the midterm",
      columnId: todo,
      done: false,
      priority: "normal",
      dueDate: addDays(today, 12),
      labelIds: ["label-finance"],
    },
    {
      ...base,
      id: "mock-todo-4",
      title: "Hand in problem set",
      columnId: done,
      done: true,
      priority: "normal",
      dueDate: today,
      labelIds: [],
    },
  ];
}
