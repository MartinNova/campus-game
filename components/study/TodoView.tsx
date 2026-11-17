"use client";

import { Columns3, ListChecks, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { todoService } from "@/lib/services/todo.service";
import { todayInLisbon } from "@/lib/timetable/dates";
import { filterTodos, progress } from "@/lib/todo/todos";
import {
  TODO_SCOPES,
  type NewTodo,
  type Todo,
  type TodoList,
  type TodoScope,
  type TodoStatus,
} from "@/types/todo";
import { NewTaskForm } from "./NewTaskForm";
import { TaskBoard } from "./TaskBoard";
import { TaskChecklist } from "./TaskChecklist";

type ViewMode = "checklist" | "board";

const chipClass = (active: boolean) =>
  `focus-visible:outline-brand h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 ${
    active
      ? "border-brand bg-brand text-brand-foreground"
      : "border-border bg-surface hover:border-brand"
  }`;

/** Study to-dos: several lists, each as a checklist or a board, filtered by day, week or month. */
export function TodoView() {
  // Today's date and the stored data are only read in the browser.
  const [today, setToday] = useState<string | null>(null);
  const [lists, setLists] = useState<TodoList[] | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [listId, setListId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("checklist");
  const [scope, setScope] = useState<TodoScope>("all");
  const [newListName, setNewListName] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [l, t] = await Promise.all([todoService.listLists(), todoService.listTodos()]);
    setLists(l);
    setTodos(t);
    return l;
  }, []);

  useEffect(() => {
    void Promise.all([todoService.listLists(), todoService.listTodos()]).then(([l, t]) => {
      setToday(todayInLisbon());
      setLists(l);
      setTodos(t);
      setListId(l[0]?.id ?? null);
    });
  }, []);

  const activeId = lists?.some((l) => l.id === listId) ? listId : (lists?.[0]?.id ?? null);
  const listTodos = useMemo(
    () => (today && activeId ? todos.filter((t) => t.listId === activeId) : []),
    [todos, today, activeId],
  );
  const visible = useMemo(
    () => (today && activeId ? filterTodos(todos, activeId, scope, today) : []),
    [todos, today, activeId, scope],
  );

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const list = await todoService.createList(newListName ?? "");
      await reload();
      setListId(list.id);
      setNewListName(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the list.");
    }
  }

  async function handleAddTask(input: NewTodo) {
    if (!activeId) throw new Error("Create a list first.");
    await todoService.createTodo(activeId, input);
    await reload();
  }

  if (!today || !lists) {
    return (
      <div
        className="bg-border h-64 animate-pulse rounded-2xl"
        aria-busy="true"
        aria-label="Loading to-dos"
      />
    );
  }

  const { done, total } = progress(listTodos);
  const activeList = lists.find((l) => l.id === activeId);

  return (
    <>
      <div
        role="group"
        aria-label="Lists"
        className="-mx-4 mb-4 flex items-center gap-2 overflow-x-auto px-4 pb-1"
      >
        {lists.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={l.id === activeId}
            onClick={() => {
              setListId(l.id);
              setConfirmDelete(false);
            }}
            className={chipClass(l.id === activeId)}
          >
            {l.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setNewListName("")}
          className="border-border text-muted hover:border-brand hover:text-foreground focus-visible:outline-brand flex h-9 shrink-0 items-center gap-1 rounded-full border border-dashed px-4 text-sm focus-visible:outline-2"
        >
          <Plus className="size-4" aria-hidden /> New list
        </button>
      </div>

      {newListName !== null && (
        <Card className="mb-4">
          <form onSubmit={handleCreateList} className="grid gap-3">
            <label className="text-sm font-medium">
              List name
              <input
                autoFocus
                value={newListName}
                onChange={(e) => {
                  setNewListName(e.target.value);
                  setError(null);
                }}
                maxLength={30}
                placeholder="e.g. Thesis, Finance exam"
                className="border-border bg-surface focus-visible:outline-brand mt-1 h-10 w-full rounded-xl border px-3 text-sm focus-visible:outline-2"
              />
            </label>
            <div className="flex gap-2">
              <Button type="submit">Create list</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setNewListName(null);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {error && (
        <p role="alert" className="mb-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {!activeList ? (
        <Card className="py-8 text-center">
          <p className="font-semibold">Start your first list</p>
          <p className="text-muted mt-1 text-sm">
            Create a list for a course, an exam or your thesis.
          </p>
        </Card>
      ) : (
        <>
          <NewTaskForm key={activeList.id} defaultDate={today} onSubmit={handleAddTask} />

          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{activeList.name}</h2>
              <p className="text-muted text-xs">
                {done} of {total} done
              </p>
            </div>
            <div role="group" aria-label="View" className="flex gap-1">
              <Button
                variant={mode === "checklist" ? "primary" : "secondary"}
                aria-pressed={mode === "checklist"}
                onClick={() => setMode("checklist")}
              >
                <ListChecks className="size-4" aria-hidden /> Checklist
              </Button>
              <Button
                variant={mode === "board" ? "primary" : "secondary"}
                aria-pressed={mode === "board"}
                onClick={() => setMode("board")}
              >
                <Columns3 className="size-4" aria-hidden /> Board
              </Button>
            </div>
          </div>

          <div
            role="group"
            aria-label="Time window"
            className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1"
          >
            {TODO_SCOPES.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={scope === s.value}
                onClick={() => setScope(s.value)}
                className={chipClass(scope === s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <Card className="py-8 text-center">
              <p className="font-semibold">Nothing to do here</p>
              <p className="text-muted mt-1 text-sm">
                {scope === "all"
                  ? "Add your first task above."
                  : "No tasks in this time window. Add one or switch to All."}
              </p>
            </Card>
          ) : mode === "checklist" ? (
            <TaskChecklist
              todos={visible}
              today={today}
              onStatus={(id: string, status: TodoStatus) =>
                run(() => todoService.setStatus(id, status))
              }
              onDelete={(id: string) => run(() => todoService.deleteTodo(id))}
            />
          ) : (
            <TaskBoard
              todos={visible}
              today={today}
              onStatus={(id: string, status: TodoStatus) =>
                run(() => todoService.setStatus(id, status))
              }
              onDelete={(id: string) => run(() => todoService.deleteTodo(id))}
            />
          )}

          <div className="mt-6">
            {confirmDelete ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm">
                  Delete “{activeList.name}” and its {total} task{total === 1 ? "" : "s"}?
                </span>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setConfirmDelete(false);
                    void run(() => todoService.deleteList(activeList.id));
                  }}
                >
                  Yes, delete
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Keep
                </Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="size-4" aria-hidden /> Delete this list
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}
