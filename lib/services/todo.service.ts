import { createMockLists, createMockTodos } from "@/data/todo.mock";
import { readJSON, writeJSON } from "@/lib/storage";
import { todayInLisbon } from "@/lib/timetable/dates";
import { validateListName, validateNewTodo } from "@/lib/todo/todos";
import type { Todo, TodoList, TodoService } from "@/types/todo";

const LISTS_KEY = "todo-lists";
const TODOS_KEY = "todo-todos";

interface Data {
  lists: TodoList[];
  todos: Todo[];
}

/** Loads both collections, using the example data until the user changes something. */
function load(): Data {
  const today = todayInLisbon();
  return {
    lists: readJSON<TodoList[] | null>(LISTS_KEY, null) ?? createMockLists(today),
    todos: readJSON<Todo[] | null>(TODOS_KEY, null) ?? createMockTodos(today),
  };
}

/** Every change saves both collections, so the example data is kept from then on. */
function save({ lists, todos }: Data): void {
  writeJSON(LISTS_KEY, lists);
  writeJSON(TODOS_KEY, todos);
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
      createdAt: new Date().toISOString(),
    };
    save({ ...data, lists: [...data.lists, list] });
    return list;
  },
  async deleteList(listId) {
    const data = load();
    save({
      lists: data.lists.filter((l) => l.id !== listId),
      todos: data.todos.filter((t) => t.listId !== listId),
    });
  },
  async listTodos() {
    return load().todos;
  },
  async createTodo(listId, input) {
    const error = validateNewTodo(input);
    if (error) throw new Error(error);
    const data = load();
    if (!data.lists.some((l) => l.id === listId)) throw new Error("This list no longer exists.");
    const todo: Todo = {
      ...input,
      title: input.title.trim(),
      id: crypto.randomUUID(),
      listId,
      status: "todo",
      createdAt: new Date().toISOString(),
    };
    save({ ...data, todos: [...data.todos, todo] });
    return todo;
  },
  async setStatus(todoId, status) {
    const data = load();
    save({ ...data, todos: data.todos.map((t) => (t.id === todoId ? { ...t, status } : t)) });
  },
  async deleteTodo(todoId) {
    const data = load();
    save({ ...data, todos: data.todos.filter((t) => t.id !== todoId) });
  },
};
