"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/timetable/Sheet";
import { Button } from "@/components/ui/Button";
import {
  TODO_PRIORITIES,
  type Todo,
  type TodoLabel,
  type TodoList,
  type TodoPatch,
  type TodoPriority,
} from "@/types/todo";
import { LabelPicker } from "./LabelPicker";

interface TaskSheetProps {
  todo: Todo;
  list: TodoList;
  labels: TodoLabel[];
  onSave: (patch: TodoPatch) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

const fieldClass =
  "border-border bg-surface focus-visible:outline-brand mt-1 h-10 w-full rounded-xl border px-3 text-sm focus-visible:outline-2";

/** Card detail, like opening a card in Trello: edit title, date, priority, column and labels. */
export function TaskSheet({ todo, list, labels, onSave, onDelete, onClose }: TaskSheetProps) {
  const [title, setTitle] = useState(todo.title);
  const [dueDate, setDueDate] = useState(todo.dueDate ?? "");
  const [priority, setPriority] = useState<TodoPriority>(todo.priority);
  const [columnId, setColumnId] = useState(todo.columnId);
  const [done, setDone] = useState(todo.done);
  const [labelIds, setLabelIds] = useState(todo.labelIds);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleColumn(id: string) {
    setColumnId(id);
    // Moving to a "done" column ticks the task, moving out unticks it.
    const column = list.columns.find((c) => c.id === id);
    if (column) setDone(column.isDone);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title,
        dueDate: dueDate === "" ? null : dueDate,
        priority,
        columnId,
        done,
        labelIds,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the task.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the task.");
    }
  }

  return (
    <Sheet title="Edit task" subtitle={`In list “${list.name}”`} onClose={onClose}>
      <form onSubmit={handleSave} className="grid gap-4">
        <label className="text-sm font-medium">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className={fieldClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="text-sm font-medium">
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TodoPriority)}
              className={fieldClass}
            >
              {TODO_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {dueDate !== "" && (
          <button
            type="button"
            onClick={() => setDueDate("")}
            className="text-brand -mt-2 w-fit text-xs underline"
          >
            Remove due date
          </button>
        )}

        <label className="text-sm font-medium">
          Column
          <select
            value={columnId}
            onChange={(e) => handleColumn(e.target.value)}
            className={fieldClass}
          >
            {list.columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={done}
            onChange={(e) => setDone(e.target.checked)}
            className="size-4"
          />
          Mark as done
        </label>

        <div>
          <p className="text-sm font-medium">Labels</p>
          <LabelPicker
            labels={labels}
            selected={labelIds}
            onToggle={(id) =>
              setLabelIds((current) =>
                current.includes(id) ? current.filter((l) => l !== id) : [...current, id],
              )
            }
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={saving}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {confirmDelete ? (
            <span className="ml-auto flex items-center gap-2 text-sm">
              Delete?
              <Button variant="secondary" className="h-8 px-3" onClick={handleDelete}>
                Yes
              </Button>
              <Button variant="ghost" className="h-8 px-3" onClick={() => setConfirmDelete(false)}>
                No
              </Button>
            </span>
          ) : (
            <Button variant="ghost" className="ml-auto" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" aria-hidden /> Delete
            </Button>
          )}
        </div>
      </form>
    </Sheet>
  );
}
