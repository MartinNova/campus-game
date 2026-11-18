import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { dueLabel, isOverdue } from "@/lib/todo/todos";
import type { Todo, TodoLabel } from "@/types/todo";
import { LabelChip } from "./LabelChip";

interface TaskMetaProps {
  todo: Todo;
  today: string;
  /** All labels. The ones the task uses are shown. */
  labels: TodoLabel[];
}

/** Labels, due date and priority of one task. Shared by checklist, board and calendar. */
export function TaskMeta({ todo, today, labels }: TaskMetaProps) {
  const overdue = isOverdue(todo, today);
  const taskLabels = labels.filter((l) => todo.labelIds.includes(l.id));
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {taskLabels.map((label) => (
        <LabelChip key={label.id} label={label} />
      ))}
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
