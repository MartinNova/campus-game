"use client";

import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Todo, TodoLabel } from "@/types/todo";
import { TaskMeta } from "./TaskMeta";

interface TaskChecklistProps {
  todos: Todo[];
  labels: TodoLabel[];
  today: string;
  onToggle: (todo: Todo) => void;
  onOpen: (todoId: string) => void;
}

/** Classic checklist: tick a task to mark it done, tap the title to edit it. */
export function TaskChecklist({ todos, labels, today, onToggle, onOpen }: TaskChecklistProps) {
  return (
    <ul className="grid gap-2">
      {todos.map((todo) => (
        <li key={todo.id}>
          <Card className="flex items-start gap-3 p-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={todo.done}
              aria-label={
                todo.done ? `Mark "${todo.title}" as open` : `Mark "${todo.title}" as done`
              }
              onClick={() => onToggle(todo)}
              className={`focus-visible:outline-brand mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors focus-visible:outline-2 ${
                todo.done ? "border-brand bg-brand text-brand-foreground" : "border-border"
              }`}
            >
              {todo.done && <Check className="size-4" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => onOpen(todo.id)}
              className="focus-visible:outline-brand min-w-0 flex-1 rounded-lg text-left focus-visible:outline-2"
            >
              <span
                className={`block break-words ${todo.done ? "text-muted line-through" : "font-medium"}`}
              >
                {todo.title}
              </span>
              <span className="mt-1.5 block">
                <TaskMeta todo={todo} today={today} labels={labels} />
              </span>
            </button>
          </Card>
        </li>
      ))}
    </ul>
  );
}
