"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { monthGrid, monthSummary, monthTitle, shiftMonth, todosByDate } from "@/lib/todo/calendar";
import { WEEKDAYS, formatDay, startOfMonth } from "@/lib/timetable/dates";
import { isOverdue, sortTodos } from "@/lib/todo/todos";
import type { Todo, TodoLabel, TodoList } from "@/types/todo";
import { LABEL_STYLES } from "./labelStyles";
import { TaskMeta } from "./TaskMeta";

interface TaskCalendarProps {
  /** Tasks of all lists. */
  todos: Todo[];
  lists: TodoList[];
  labels: TodoLabel[];
  today: string;
  onOpen: (todoId: string) => void;
}

const MAX_DOTS = 3;

/** Month calendar of all deadlines. Tap a day to see its tasks, tap a task to edit it. */
export function TaskCalendar({ todos, lists, labels, today, onOpen }: TaskCalendarProps) {
  const [month, setMonth] = useState(startOfMonth(today));
  const [selected, setSelected] = useState(today);

  const byDate = useMemo(() => todosByDate(todos), [todos]);
  const weeks = useMemo(() => monthGrid(month), [month]);
  const summary = monthSummary(todos, month);
  const dayTodos = sortTodos(byDate[selected] ?? []);

  function dotClass(todo: Todo): string {
    if (isOverdue(todo, today)) return "bg-red-500";
    const label = labels.find((l) => todo.labelIds.includes(l.id));
    return label ? LABEL_STYLES[label.color].dot : "bg-brand";
  }

  return (
    <>
      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonth(shiftMonth(month, -1))}
            className="hover:bg-border/60 focus-visible:outline-brand rounded-lg p-2 focus-visible:outline-2"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <div className="text-center">
            <h2 className="font-semibold" aria-live="polite">
              {monthTitle(month)}
            </h2>
            <p className="text-muted text-xs">
              {summary.due === 0
                ? "No deadlines"
                : `${summary.due} deadline${summary.due === 1 ? "" : "s"}, ${summary.done} done`}
            </p>
          </div>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setMonth(shiftMonth(month, 1))}
            className="hover:bg-border/60 focus-visible:outline-brand rounded-lg p-2 focus-visible:outline-2"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>

        <div className="text-muted mb-1 grid grid-cols-7 text-center text-xs">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map(({ iso, inMonth }) => {
            const items = sortTodos(byDate[iso] ?? []);
            const isSelected = iso === selected;
            const isToday = iso === today;
            return (
              <button
                key={iso}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${formatDay(iso, { weekday: "long", day: "numeric", month: "long" })}, ${items.length} deadline${items.length === 1 ? "" : "s"}`}
                onClick={() => {
                  setSelected(iso);
                  if (!inMonth) setMonth(startOfMonth(iso));
                }}
                className={`focus-visible:outline-brand flex h-14 flex-col items-center rounded-xl border py-1 text-sm transition-colors focus-visible:outline-2 ${
                  isSelected ? "border-brand bg-brand/10" : "hover:border-brand border-transparent"
                } ${inMonth ? "" : "opacity-40"}`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full ${
                    isToday ? "bg-brand text-brand-foreground font-semibold" : ""
                  }`}
                >
                  {Number(iso.slice(8))}
                </span>
                <span className="mt-1 flex items-center gap-0.5" aria-hidden>
                  {items.slice(0, MAX_DOTS).map((t) => (
                    <span
                      key={t.id}
                      className={`size-1.5 rounded-full ${dotClass(t)} ${t.done ? "opacity-30" : ""}`}
                    />
                  ))}
                  {items.length > MAX_DOTS && (
                    <span className="text-muted text-[9px]">+{items.length - MAX_DOTS}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-muted mt-3 text-xs">
          Dot colour = first label of a task. Red = overdue. Faded = done.
        </p>
      </Card>

      <h2 className="mb-2 font-semibold">
        {formatDay(selected, { weekday: "long", day: "numeric", month: "long" })}
      </h2>
      {dayTodos.length === 0 ? (
        <Card className="py-6 text-center">
          <p className="font-semibold">No deadlines on this day</p>
          <p className="text-muted mt-1 text-sm">Add a due date to a task to see it here.</p>
        </Card>
      ) : (
        <ul className="grid gap-2">
          {dayTodos.map((todo) => (
            <li key={todo.id}>
              <button
                type="button"
                onClick={() => onOpen(todo.id)}
                className="border-border bg-surface hover:border-brand focus-visible:outline-brand block w-full rounded-2xl border p-3 text-left shadow-sm focus-visible:outline-2"
              >
                <span className="flex items-start justify-between gap-2">
                  <span
                    className={`break-words ${todo.done ? "text-muted line-through" : "font-medium"}`}
                  >
                    {todo.title}
                  </span>
                  <Badge>{lists.find((l) => l.id === todo.listId)?.name ?? "List"}</Badge>
                </span>
                <span className="mt-1.5 block">
                  <TaskMeta todo={todo} today={today} labels={labels} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
