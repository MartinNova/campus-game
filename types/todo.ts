/**
 * To-do module (Study Hub): data contract.
 * Dates are local Lisbon dates "YYYY-MM-DD".
 *
 * - A list (e.g. a course or your thesis) has its own board columns.
 * - A task sits in one column of its list. A column can count as "done".
 * - Labels are shared by all lists (e.g. Finance = yellow, Marketing = pink).
 * - Day, week and month filters and the calendar are derived from the due date.
 */

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

/** A board column. Tasks in a column with `isDone` count as done. */
export interface TodoColumn {
  id: string;
  name: string;
  isDone: boolean;
}

export interface TodoList {
  id: string;
  name: string;
  /** Board columns from left to right. A list always has at least one column. */
  columns: TodoColumn[];
  createdAt: string;
}

export type LabelColor =
  "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink" | "gray";

export const LABEL_COLORS: { value: LabelColor; label: string }[] = [
  { value: "red", label: "Red" },
  { value: "orange", label: "Orange" },
  { value: "yellow", label: "Yellow" },
  { value: "green", label: "Green" },
  { value: "teal", label: "Teal" },
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
  { value: "gray", label: "Gray" },
];

export interface TodoLabel {
  id: string;
  name: string;
  color: LabelColor;
}

export interface Todo {
  id: string;
  listId: string;
  columnId: string;
  title: string;
  done: boolean;
  priority: TodoPriority;
  /** Due date, or null if the task has no date. */
  dueDate: string | null;
  labelIds: string[];
  createdAt: string;
}

export interface NewTodo {
  title: string;
  priority: TodoPriority;
  dueDate: string | null;
  labelIds: string[];
  /** Column to add the task to. Defaults to the first column. */
  columnId?: string;
}

/** Fields that can change on an existing task. */
export type TodoPatch = Partial<
  Pick<Todo, "title" | "priority" | "dueDate" | "labelIds" | "columnId" | "done">
>;

export interface TodoService {
  listLists(): Promise<TodoList[]>;
  createList(name: string): Promise<TodoList>;
  /** Also deletes all tasks of the list. */
  deleteList(listId: string): Promise<void>;

  addColumn(listId: string, name: string): Promise<void>;
  renameColumn(listId: string, columnId: string, name: string): Promise<void>;
  setColumnDone(listId: string, columnId: string, isDone: boolean): Promise<void>;
  /** direction -1 = one place to the left, 1 = one place to the right. */
  moveColumn(listId: string, columnId: string, direction: -1 | 1): Promise<void>;
  /** Tasks of the column move to the first remaining column. The last column can't be deleted. */
  deleteColumn(listId: string, columnId: string): Promise<void>;

  listLabels(): Promise<TodoLabel[]>;
  createLabel(name: string, color: LabelColor): Promise<TodoLabel>;
  updateLabel(labelId: string, change: { name?: string; color?: LabelColor }): Promise<void>;
  /** Also removes the label from all tasks. */
  deleteLabel(labelId: string): Promise<void>;

  listTodos(): Promise<Todo[]>;
  createTodo(listId: string, input: NewTodo): Promise<Todo>;
  updateTodo(todoId: string, patch: TodoPatch): Promise<void>;
  deleteTodo(todoId: string): Promise<void>;
}
