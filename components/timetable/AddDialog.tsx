"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDay, weekday } from "@/lib/timetable/dates";
import type { NewEvent, NewLecture } from "@/types/timetable";
import { EventForm } from "./EventForm";
import { LectureForm } from "./LectureForm";

export interface AddDraft {
  date: string;
  /** Hour that was tapped in the week grid, if any. */
  hour?: number;
}

interface AddDialogProps {
  draft: AddDraft;
  defaultTermId: string;
  onClose: () => void;
  onAddEvent: (event: NewEvent) => Promise<void>;
  onAddLecture: (lecture: NewLecture) => Promise<void>;
}

const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;

/** Bottom sheet to add a one-time event or a weekly lecture, pre-filled with the tapped day/time. */
export function AddDialog({
  draft,
  defaultTermId,
  onClose,
  onAddEvent,
  onAddLecture,
}: AddDialogProps) {
  const [mode, setMode] = useState<"once" | "weekly">("once");
  const start = draft.hour !== undefined ? pad(draft.hour) : undefined;
  const end =
    draft.hour === undefined ? undefined : draft.hour >= 23 ? "23:59" : pad(draft.hour + 1);

  // Close with Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-dialog-title"
        className="bg-surface relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="add-dialog-title" className="text-lg font-semibold">
              Add to timetable
            </h2>
            <p className="text-muted text-sm">
              {formatDay(draft.date, { weekday: "long", day: "numeric", month: "long" })}
              {start && ` · ${start}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:bg-border/60 rounded-lg p-1.5"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div role="tablist" aria-label="Kind" className="bg-border/60 mb-4 flex rounded-xl p-1">
          {(
            [
              ["once", "One-time"],
              ["weekly", "Weekly lecture"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => setMode(value)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
                mode === value ? "bg-surface shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "once" ? (
          <EventForm
            defaultDate={draft.date}
            defaultStart={start}
            defaultEnd={end}
            onSubmit={async (event) => {
              await onAddEvent(event);
              onClose();
            }}
          />
        ) : (
          <LectureForm
            defaultTermId={defaultTermId}
            defaultWeekday={weekday(draft.date)}
            defaultStart={start}
            defaultEnd={end}
            onSubmit={async (lecture) => {
              await onAddLecture(lecture);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}
