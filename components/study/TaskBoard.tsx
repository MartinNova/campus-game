"use client";

import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { groupByStatus } from "@/lib/todo/todos";
import { TODO_STATUSES, type Todo, type TodoStatus } from "@/types/todo";
import { TaskMeta } from "./TaskMeta";

interface TaskBoardProps {
  todos: Todo[];
  today: string;
  onStatus: (todoId: string, status: TodoStatus) => void;
  onDelete: (todoId: string) => void;
}

/** Trello-style board: one column per status. Move cards with the arrows or drag them. */
export function TaskBoard({ todos, today, onStatus, onDelete }: TaskBoardProps) {
  const groups = groupByStatus(todos);

  function handleDrop(e: React.DragEvent, status: TodoStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) onStatus(id, status);
  }

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
      {TODO_STATUSES.map(({ value, label }, columnIndex) => (
        <section
          key={value}
          aria-label={label}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, value)}
          className="bg-muted/10 w-[78%] max-w-xs shrink-0 snap-start rounded-2xl p-3 sm:w-72"
        >
          <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
            {label}
            <span className="text-muted text-xs font-normal">{groups[value].length}</span>
          </h3>
          <ul className="grid min-h-16 gap-2">
            {groups[value].map((todo) => (
              <li
                key={todo.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", todo.id)}
                className="border-border bg-surface cursor-grab rounded-xl border p-3 shadow-sm active:cursor-grabbing"
              >
                <p
                  className={`text-sm break-words ${value === "done" ? "text-muted line-through" : "font-medium"}`}
                >
                  {todo.title}
                </p>
                <div className="mt-2">
                  <TaskMeta todo={todo} today={today} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={columnIndex === 0}
                      aria-label={`Move "${todo.title}" to ${TODO_STATUSES[columnIndex - 1]?.label ?? ""}`}
                      onClick={() => onStatus(todo.id, TODO_STATUSES[columnIndex - 1].value)}
                      className="border-border hover:border-brand focus-visible:outline-brand rounded-lg border p-1 focus-visible:outline-2 disabled:opacity-30"
                    >
                      <ChevronLeft className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      disabled={columnIndex === TODO_STATUSES.length - 1}
                      aria-label={`Move "${todo.title}" to ${TODO_STATUSES[columnIndex + 1]?.label ?? ""}`}
                      onClick={() => onStatus(todo.id, TODO_STATUSES[columnIndex + 1].value)}
                      className="border-border hover:border-brand focus-visible:outline-brand rounded-lg border p-1 focus-visible:outline-2 disabled:opacity-30"
                    >
                      <ChevronRight className="size-4" aria-hidden />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete "${todo.title}"`}
                    onClick={() => onDelete(todo.id)}
                    className="text-muted hover:text-foreground focus-visible:outline-brand rounded-lg p-1 focus-visible:outline-2"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
