import { Check } from "lucide-react";
import type { TodoLabel } from "@/types/todo";
import { LABEL_STYLES } from "./labelStyles";

interface LabelPickerProps {
  labels: TodoLabel[];
  selected: string[];
  onToggle: (labelId: string) => void;
}

/** Tap labels to add or remove them (used when creating and editing a task). */
export function LabelPicker({ labels, selected, onToggle }: LabelPickerProps) {
  if (labels.length === 0) {
    return <p className="text-muted mt-1 text-xs">No labels yet. Create some under “Labels”.</p>;
  }
  return (
    <div role="group" aria-label="Labels" className="mt-1 flex flex-wrap gap-1.5">
      {labels.map((label) => {
        const on = selected.includes(label.id);
        return (
          <button
            key={label.id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(label.id)}
            className={`focus-visible:outline-brand inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium focus-visible:outline-2 ${
              on ? LABEL_STYLES[label.color].chip : "border-border text-muted border"
            }`}
          >
            <span className={`size-2 rounded-full ${LABEL_STYLES[label.color].dot}`} aria-hidden />
            {label.name}
            {on && <Check className="size-3" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}
