import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { dueLabel, isOverdue } from "@/lib/todo/todos";
import type { Todo } from "@/types/todo";

/** Due date and priority labels of one task. Shared by the checklist and the board. */
export function TaskMeta({ todo, today }: { todo: Todo; today: string }) {
  const overdue = isOverdue(todo, today);
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {todo.dueDate && (
        <Badge tone={overdue ? "bad" : todo.dueDate === today ? "brand" : "neutral"}>
          <CalendarDays className="mr-1 size-3" aria-hidden />
          {overdue ? "Overdue · " : ""}
          {dueLabel(todo.dueDate, today)}
        </Badge>
      )}
      {todo.priority === "high" && <Badge tone="medium">High priority</Badge>}
      {todo.priority === "low" && <Badge>Low priority</Badge>}
    </span>
  );
}
