import { createMockLabels, createMockLists, createMockTodos } from "@/data/todo.mock";
import { readJSON, writeJSON } from "@/lib/storage";
import { todayInLisbon } from "@/lib/timetable/dates";
import {
  addColumn,
  applyPatch,
  defaultColumns,
  moveColumn,
  removeColumn,
  removeLabelFromTodos,
  renameColumn,
  setColumnDone,
  validateLabel,
  validateListName,
  validateNewTodo,
} from "@/lib/todo/todos";
import type { Todo, TodoLabel, TodoList, TodoService } from "@/types/todo";

// "-v2": the first version stored tasks with a fixed status instead of columns and labels.
const LISTS_KEY = "todo-lists-v2";
const LABELS_KEY = "todo-labels-v2";
const TODOS_KEY = "todo-todos-v2";

interface Data {
  lists: TodoList[];
  labels: TodoLabel[];
  todos: Todo[];
}

/** Loads everything, using the example data until the user changes something. */
function load(): Data {
  const today = todayInLisbon();
  return {
    lists: readJSON<TodoList[] | null>(LISTS_KEY, null) ?? createMockLists(today),
    labels: readJSON<TodoLabel[] | null>(LABELS_KEY, null) ?? createMockLabels(),
    todos: readJSON<Todo[] | null>(TODOS_KEY, null) ?? createMockTodos(today),
  };
}

/** Every change saves all collections, so the example data is kept from then on. */
function save({ lists, labels, todos }: Data): void {
  writeJSON(LISTS_KEY, lists);
  writeJSON(LABELS_KEY, labels);
  writeJSON(TODOS_KEY, todos);
}

function findList(data: Data, listId: string): TodoList {
  const list = data.lists.find((l) => l.id === listId);
  if (!list) throw new Error("This list no longer exists.");
  return list;
}

function replaceList(data: Data, list: TodoList): Data {
  return { ...data, lists: data.lists.map((l) => (l.id === list.id ? list : l)) };
}

/** Mock implementation (localStorage). Swap for a Supabase version later. */
export const todoService: TodoService = {
  async listLists() {
    return load().lists;
  },
  async createList(name) {
    const data = load();
    const error = validateListName(
      name,
      data.lists.map((l) => l.name),
    );
    if (error) throw new Error(error);
    const list: TodoList = {
      id: crypto.randomUUID(),
      name: name.trim(),
      columns: defaultColumns(() => crypto.randomUUID()),
      createdAt: new Date().toISOString(),
    };
    save({ ...data, lists: [...data.lists, list] });
    return list;
  },
  async deleteList(listId) {
    const data = load();
    save({
      ...data,
      lists: data.lists.filter((l) => l.id !== listId),
      todos: data.todos.filter((t) => t.listId !== listId),
    });
  },

  async addColumn(listId, name) {
    const data = load();
    save(replaceList(data, addColumn(findList(data, listId), name, crypto.randomUUID())));
  },
  async renameColumn(listId, columnId, name) {
    const data = load();
    save(replaceList(data, renameColumn(findList(data, listId), columnId, name)));
  },
  async setColumnDone(listId, columnId, isDone) {
    const data = load();
    save(replaceList(data, setColumnDone(findList(data, listId), columnId, isDone)));
  },
  async moveColumn(listId, columnId, direction) {
    const data = load();
    save(replaceList(data, moveColumn(findList(data, listId), columnId, direction)));
  },
  async deleteColumn(listId, columnId) {
    const data = load();
    const result = removeColumn(findList(data, listId), columnId, data.todos);
    save({ ...replaceList(data, result.list), todos: result.todos });
  },

  async listLabels() {
    return load().labels;
  },
  async createLabel(name, color) {
    const data = load();
    const error = validateLabel(
      name,
      color,
      data.labels.map((l) => l.name),
    );
    if (error) throw new Error(error);
    const label: TodoLabel = { id: crypto.randomUUID(), name: name.trim(), color };
    save({ ...data, labels: [...data.labels, label] });
    return label;
  },
  async updateLabel(labelId, change) {
    const data = load();
    const current = data.labels.find((l) => l.id === labelId);
    if (!current) throw new Error("This label no longer exists.");
    const next = { ...current, ...change, name: (change.name ?? current.name).trim() };
    const error = validateLabel(
      next.name,
      next.color,
      data.labels.filter((l) => l.id !== labelId).map((l) => l.name),
    );
    if (error) throw new Error(error);
    save({ ...data, labels: data.labels.map((l) => (l.id === labelId ? next : l)) });
  },
  async deleteLabel(labelId) {
    const data = load();
    save({
      ...data,
      labels: data.labels.filter((l) => l.id !== labelId),
      todos: removeLabelFromTodos(data.todos, labelId),
    });
  },

  async listTodos() {
    return load().todos;
  },
  async createTodo(listId, input) {
    const error = validateNewTodo(input);
    if (error) throw new Error(error);
    const data = load();
    const list = findList(data, listId);
    const column = list.columns.find((c) => c.id === input.columnId) ?? list.columns[0];
    const todo: Todo = {
      title: input.title.trim(),
      priority: input.priority,
      dueDate: input.dueDate,
      labelIds: input.labelIds.filter((id) => data.labels.some((l) => l.id === id)),
      id: crypto.randomUUID(),
      listId,
      columnId: column.id,
      done: column.isDone,
      createdAt: new Date().toISOString(),
    };
    save({ ...data, todos: [...data.todos, todo] });
    return todo;
  },
  async updateTodo(todoId, patch) {
    const data = load();
    const todo = data.todos.find((t) => t.id === todoId);
    if (!todo) throw new Error("This task no longer exists.");
    if (patch.title !== undefined || patch.dueDate !== undefined || patch.priority !== undefined) {
      const error = validateNewTodo({
        title: patch.title ?? todo.title,
        priority: patch.priority ?? todo.priority,
        dueDate: patch.dueDate === undefined ? todo.dueDate : patch.dueDate,
        labelIds: [],
      });
      if (error) throw new Error(error);
    }
    const columns = findList(data, todo.listId).columns;
    save({
      ...data,
      todos: data.todos.map((t) => (t.id === todoId ? applyPatch(t, patch, columns) : t)),
    });
  },
  async deleteTodo(todoId) {
    const data = load();
    save({ ...data, todos: data.todos.filter((t) => t.id !== todoId) });
  },
};
