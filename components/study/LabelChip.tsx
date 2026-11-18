import type { TodoLabel } from "@/types/todo";
import { LABEL_STYLES } from "./labelStyles";

/** A coloured label tag, like in Trello or Notion. */
export function LabelChip({ label }: { label: TodoLabel }) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-md px-2 py-0.5 text-xs font-medium ${LABEL_STYLES[label.color].chip}`}
    >
      <span className="truncate">{label.name}</span>
    </span>
  );
}
