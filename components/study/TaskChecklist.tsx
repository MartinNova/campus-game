"use client";

import { Check, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { toggleDone } from "@/lib/todo/todos";
import type { Todo, TodoStatus } from "@/types/todo";
import { TaskMeta } from "./TaskMeta";

interface TaskChecklistProps {
  todos: Todo[];
  today: string;
  onStatus: (todoId: string, status: TodoStatus) => void;
  onDelete: (todoId: string) => void;
}

/** Classic checklist: tick a task to mark it done. */
export function TaskChecklist({ todos, today, onStatus, onDelete }: TaskChecklistProps) {
  return (
    <ul className="grid gap-2">
      {todos.map((todo) => {
        const done = todo.status === "done";
        return (
          <li key={todo.id}>
            <Card className="flex items-start gap-3 p-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={done}
                aria-label={done ? `Mark "${todo.title}" as open` : `Mark "${todo.title}" as done`}
                onClick={() => onStatus(todo.id, toggleDone(todo.status))}
                className={`focus-visible:outline-brand mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors focus-visible:outline-2 ${
                  done ? "border-brand bg-brand text-brand-foreground" : "border-border"
                }`}
              >
                {done && <Check className="size-4" aria-hidden />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`break-words ${done ? "text-muted line-through" : "font-medium"}`}>
                  {todo.title}
                </p>
                <div className="mt-1.5">
                  <TaskMeta todo={todo} today={today} />
                </div>
                {todo.status === "doing" && (
                  <p className="text-brand mt-1 text-xs font-medium">In progress</p>
                )}
              </div>
              <button
                type="button"
                aria-label={`Delete "${todo.title}"`}
                onClick={() => onDelete(todo.id)}
                className="text-muted hover:text-foreground focus-visible:outline-brand rounded-lg p-1.5 focus-visible:outline-2"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
