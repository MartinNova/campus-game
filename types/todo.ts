/**
 * To-do module (Study Hub): data contract.
 * Dates are local Lisbon dates "YYYY-MM-DD". A task belongs to one list.
 * Day, week and month views are derived from the due date, nothing else is stored.
 */

/** Board columns. The checklist treats "done" as ticked and everything else as open. */
export type TodoStatus = "todo" | "doing" | "done";

export const TODO_STATUSES: { value: TodoStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "doing", label: "Doing" },
  { value: "done", label: "Done" },
];

export type TodoPriority = "low" | "normal" | "high";

export const TODO_PRIORITIES: { value: TodoPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

/** Time window for the task filter. "all" shows every task of the list. */
export type TodoScope = "all" | "day" | "week" | "month";

export const TODO_SCOPES: { value: TodoScope; label: string }[] = [
  { value: "day", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "all", label: "All" },
];

export interface TodoList {
  id: string;
  name: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  listId: string;
  title: string;
  status: TodoStatus;
  priority: TodoPriority;
  /** Due date, or null if the task has no date. */
  dueDate: string | null;
  createdAt: string;
}

export type NewTodo = Pick<Todo, "title" | "priority" | "dueDate">;

export interface TodoService {
  listLists(): Promise<TodoList[]>;
  createList(name: string): Promise<TodoList>;
  /** Also deletes all tasks of the list. */
  deleteList(listId: string): Promise<void>;
  listTodos(): Promise<Todo[]>;
  createTodo(listId: string, input: NewTodo): Promise<Todo>;
  setStatus(todoId: string, status: TodoStatus): Promise<void>;
  deleteTodo(todoId: string): Promise<void>;
}
