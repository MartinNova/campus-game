"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TODO_PRIORITIES, type NewTodo, type TodoPriority } from "@/types/todo";

interface NewTaskFormProps {
  /** Pre-filled due date (usually today). */
  defaultDate: string;
  onSubmit: (input: NewTodo) => Promise<void>;
}

const fieldClass =
  "border-border bg-surface focus-visible:outline-brand mt-1 h-10 w-full rounded-xl border px-3 text-sm focus-visible:outline-2";

/** Adds a task to the open list. */
export function NewTaskForm({ defaultDate, onSubmit }: NewTaskFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(defaultDate);
  const [priority, setPriority] = useState<TodoPriority>("normal");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ title, priority, dueDate: dueDate === "" ? null : dueDate });
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit} className="grid gap-3">
        <label className="text-sm font-medium">
          New task
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            maxLength={120}
            placeholder="e.g. Read chapter 4"
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
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          <Plus className="size-4" aria-hidden /> Add task
        </Button>
      </form>
    </Card>
  );
}
