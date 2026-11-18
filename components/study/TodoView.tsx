"use client";

import { CalendarDays, Columns3, ListChecks, Plus, Tag, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { todoService } from "@/lib/services/todo.service";
import { todayInLisbon } from "@/lib/timetable/dates";
import { filterTodos, progress } from "@/lib/todo/todos";
import {
  TODO_SCOPES,
  type NewTodo,
  type Todo,
  type TodoLabel,
  type TodoList,
  type TodoScope,
} from "@/types/todo";
import { LabelChip } from "./LabelChip";
import { LabelManager } from "./LabelManager";
import { NewTaskForm } from "./NewTaskForm";
import { TaskBoard } from "./TaskBoard";
import { TaskCalendar } from "./TaskCalendar";
import { TaskChecklist } from "./TaskChecklist";
import { TaskSheet } from "./TaskSheet";

type ViewMode = "checklist" | "board" | "calendar";

const VIEWS: { value: ViewMode; label: string; icon: typeof ListChecks }[] = [
  { value: "checklist", label: "Checklist", icon: ListChecks },
  { value: "board", label: "Board", icon: Columns3 },
  { value: "calendar", label: "Calendar", icon: CalendarDays },
];

const chipClass = (active: boolean) =>
  `focus-visible:outline-brand h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 ${
    active
      ? "border-brand bg-brand text-brand-foreground"
      : "border-border bg-surface hover:border-brand"
  }`;

/**
 * Study to-dos: several lists, each as a checklist or a Trello-style board with its own
 * columns, colour labels, day/week/month filters, and a calendar of all deadlines.
 */
export function TodoView() {
  // Today's date and the stored data are only read in the browser.
  const [today, setToday] = useState<string | null>(null);
  const [lists, setLists] = useState<TodoList[] | null>(null);
  const [labels, setLabels] = useState<TodoLabel[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [listId, setListId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("checklist");
  const [scope, setScope] = useState<TodoScope>("all");
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [newListName, setNewListName] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [openTodoId, setOpenTodoId] = useState<string | null>(null);
  const [managingLabels, setManagingLabels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = () =>
    Promise.all([todoService.listLists(), todoService.listLabels(), todoService.listTodos()]);

  useEffect(() => {
    void loadAll().then(([l, lb, t]) => {
      setToday(todayInLisbon());
      setLists(l);
      setLabels(lb);
      setTodos(t);
      setListId(l[0]?.id ?? null);
    });
  }, []);

  /** Runs a change on the stored data, then refreshes the screen. Errors are thrown on. */
  async function act(action: () => Promise<unknown>) {
    await action();
    const [l, lb, t] = await loadAll();
    setLists(l);
    setLabels(lb);
    setTodos(t);
  }

  /** Like `act`, but shows errors in the page (for buttons without their own error text). */
  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await act(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const activeId = lists?.some((l) => l.id === listId) ? listId : (lists?.[0]?.id ?? null);
  const activeList = lists?.find((l) => l.id === activeId);
  // The label filter only makes sense while that label exists.
  const filterId = labels.some((l) => l.id === labelFilter) ? labelFilter : null;

  const listTodos = useMemo(
    () => (activeId ? todos.filter((t) => t.listId === activeId) : []),
    [todos, activeId],
  );
  const visible = useMemo(
    () => (today && activeId ? filterTodos(todos, activeId, scope, today, filterId) : []),
    [todos, today, activeId, scope, filterId],
  );
  const calendarTodos = useMemo(
    () => (filterId ? todos.filter((t) => t.labelIds.includes(filterId)) : todos),
    [todos, filterId],
  );
  const openTodo = todos.find((t) => t.id === openTodoId);
  const openList = openTodo ? lists?.find((l) => l.id === openTodo.listId) : undefined;

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const list = await todoService.createList(newListName ?? "");
      await act(async () => {});
      setListId(list.id);
      setNewListName(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the list.");
    }
  }

  async function handleAddTask(input: NewTodo) {
    if (!activeId) throw new Error("Create a list first.");
    await act(() => todoService.createTodo(activeId, input));
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

  return (
    <>
      <div role="group" aria-label="View" className="mb-4 grid grid-cols-3 gap-2">
        {VIEWS.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={mode === value ? "primary" : "secondary"}
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
            className="px-2"
          >
            <Icon className="size-4" aria-hidden /> {label}
          </Button>
        ))}
      </div>

      <div className="-mx-4 mb-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
        <button
          type="button"
          onClick={() => setManagingLabels(true)}
          className="border-border text-muted hover:border-brand hover:text-foreground focus-visible:outline-brand flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm focus-visible:outline-2"
        >
          <Tag className="size-4" aria-hidden /> Labels
        </button>
        {labels.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={filterId === l.id}
            aria-label={`Show only ${l.name}`}
            onClick={() => setLabelFilter(filterId === l.id ? null : l.id)}
            className={`focus-visible:outline-brand shrink-0 rounded-lg focus-visible:outline-2 ${
              filterId === l.id
                ? "ring-foreground ring-2 ring-offset-1"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            <LabelChip label={l} />
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {mode === "calendar" ? (
        <TaskCalendar
          todos={calendarTodos}
          lists={lists}
          labels={labels}
          today={today}
          onOpen={setOpenTodoId}
        />
      ) : (
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

          {!activeList ? (
            <Card className="py-8 text-center">
              <p className="font-semibold">Start your first list</p>
              <p className="text-muted mt-1 text-sm">
                Create a list for a course, an exam or your thesis.
              </p>
            </Card>
          ) : (
            <>
              <NewTaskForm
                key={activeList.id}
                defaultDate={today}
                labels={labels}
                onSubmit={handleAddTask}
              />

              <div className="mb-3">
                <h2 className="font-semibold">{activeList.name}</h2>
                <p className="text-muted text-xs">
                  {done} of {total} done
                </p>
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

              {mode === "board" ? (
                <TaskBoard
                  columns={activeList.columns}
                  todos={visible}
                  labels={labels}
                  today={today}
                  onOpen={setOpenTodoId}
                  onMove={(id, columnId) => act(() => todoService.updateTodo(id, { columnId }))}
                  onAddTask={(columnId, title) =>
                    act(() =>
                      todoService.createTodo(activeList.id, {
                        title,
                        columnId,
                        priority: "normal",
                        dueDate: null,
                        labelIds: [],
                      }),
                    )
                  }
                  onAddColumn={(name) => act(() => todoService.addColumn(activeList.id, name))}
                  onRenameColumn={(columnId, name) =>
                    act(() => todoService.renameColumn(activeList.id, columnId, name))
                  }
                  onSetColumnDone={(columnId, isDone) =>
                    act(() => todoService.setColumnDone(activeList.id, columnId, isDone))
                  }
                  onMoveColumn={(columnId, direction) =>
                    act(() => todoService.moveColumn(activeList.id, columnId, direction))
                  }
                  onDeleteColumn={(columnId) =>
                    act(() => todoService.deleteColumn(activeList.id, columnId))
                  }
                />
              ) : visible.length === 0 ? (
                <Card className="py-8 text-center">
                  <p className="font-semibold">Nothing to do here</p>
                  <p className="text-muted mt-1 text-sm">
                    {scope === "all" && filterId === null
                      ? "Add your first task above."
                      : "No tasks match. Add one or change the filters."}
                  </p>
                </Card>
              ) : (
                <TaskChecklist
                  todos={visible}
                  labels={labels}
                  today={today}
                  onToggle={(todo) =>
                    run(() => todoService.updateTodo(todo.id, { done: !todo.done }))
                  }
                  onOpen={setOpenTodoId}
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
      )}

      {openTodo && openList && (
        <TaskSheet
          key={openTodo.id}
          todo={openTodo}
          list={openList}
          labels={labels}
          onSave={(patch) => act(() => todoService.updateTodo(openTodo.id, patch))}
          onDelete={() => act(() => todoService.deleteTodo(openTodo.id))}
          onClose={() => setOpenTodoId(null)}
        />
      )}

      {managingLabels && (
        <LabelManager
          labels={labels}
          onCreate={async (name, color) => {
            await act(() => todoService.createLabel(name, color));
          }}
          onUpdate={(id, change) => act(() => todoService.updateLabel(id, change))}
          onDelete={(id) => act(() => todoService.deleteLabel(id))}
          onClose={() => setManagingLabels(false)}
        />
      )}
    </>
  );
}
