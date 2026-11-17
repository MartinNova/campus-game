"use client";

import { useState } from "react";
import { formatDay, weekday } from "@/lib/timetable/dates";
import type { NewEvent, NewLecture } from "@/types/timetable";
import { EventForm } from "./EventForm";
import { LectureForm } from "./LectureForm";
import { Sheet } from "./Sheet";

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

  return (
    <Sheet
      title="Add to timetable"
      subtitle={
        <>
          {formatDay(draft.date, { weekday: "long", day: "numeric", month: "long" })}
          {start && ` · ${start}`}
        </>
      }
      onClose={onClose}
    >
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
    </Sheet>
  );
}
