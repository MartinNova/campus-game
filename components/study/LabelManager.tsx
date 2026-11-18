"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/timetable/Sheet";
import { Button } from "@/components/ui/Button";
import { LABEL_COLORS, type LabelColor, type TodoLabel } from "@/types/todo";
import { LABEL_STYLES } from "./labelStyles";

interface LabelManagerProps {
  labels: TodoLabel[];
  onCreate: (name: string, color: LabelColor) => Promise<void>;
  onUpdate: (labelId: string, change: { name?: string; color?: LabelColor }) => Promise<void>;
  onDelete: (labelId: string) => Promise<void>;
  onClose: () => void;
}

const inputClass =
  "border-border bg-surface focus-visible:outline-brand h-9 w-full rounded-lg border px-2.5 text-sm focus-visible:outline-2";

function ColorSwatches({
  value,
  onChange,
}: {
  value: LabelColor;
  onChange: (color: LabelColor) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Colour" className="flex flex-wrap gap-1.5">
      {LABEL_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          role="radio"
          aria-checked={value === c.value}
          aria-label={c.label}
          onClick={() => onChange(c.value)}
          className={`focus-visible:outline-brand flex size-7 items-center justify-center rounded-full focus-visible:outline-2 ${LABEL_STYLES[c.value].dot} ${
            value === c.value ? "ring-foreground ring-2 ring-offset-2" : ""
          }`}
        >
          {value === c.value && <Check className="size-4 text-white" aria-hidden />}
        </button>
      ))}
    </div>
  );
}

/** Create, rename, recolour and delete labels. Labels are shared by all lists. */
export function LabelManager({ labels, onCreate, onUpdate, onDelete, onClose }: LabelManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<LabelColor>("yellow");
  const [error, setError] = useState<string | null>(null);

  async function attempt(action: () => Promise<void>): Promise<boolean> {
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      return false;
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (await attempt(() => onCreate(name, color))) setName("");
  }

  return (
    <Sheet
      title="Labels"
      subtitle="Colour-code your tasks, e.g. one label per course."
      onClose={onClose}
    >
      <ul className="grid gap-4">
        {labels.map((label) => (
          <li key={label.id} className="grid gap-2">
            <div className="flex items-center gap-2">
              <input
                // Remount when the saved name changes, so the field shows the stored value.
                key={label.name}
                aria-label={`Name of label ${label.name}`}
                defaultValue={label.name}
                maxLength={20}
                onBlur={(e) => {
                  const next = e.target.value;
                  if (next.trim() !== label.name) {
                    void attempt(() => onUpdate(label.id, { name: next })).then((ok) => {
                      if (!ok) e.target.value = label.name;
                    });
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                className={inputClass}
              />
              <button
                type="button"
                aria-label={`Delete label ${label.name}`}
                onClick={() => void attempt(() => onDelete(label.id))}
                className="text-muted hover:text-foreground focus-visible:outline-brand rounded-lg p-1.5 focus-visible:outline-2"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
            <ColorSwatches
              value={label.color}
              onChange={(c) => void attempt(() => onUpdate(label.id, { color: c }))}
            />
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreate} className="border-border mt-5 grid gap-2 border-t pt-4">
        <label className="text-sm font-medium">
          New label
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            maxLength={20}
            placeholder="e.g. Finance"
            className={`${inputClass} mt-1`}
          />
        </label>
        <ColorSwatches value={color} onChange={setColor} />
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit">
            <Plus className="size-4" aria-hidden /> Add label
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
