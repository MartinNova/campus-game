"use client";

import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { WEEKDAYS } from "@/lib/timetable/dates";
import { getTerm } from "@/lib/timetable/terms";
import type { ImportedCalendar, Lecture, NewLecture, TimetableData } from "@/types/timetable";
import { CalendarUpload } from "./CalendarUpload";
import { LectureForm } from "./LectureForm";

interface ManagePanelProps {
  data: TimetableData;
  defaultTermId: string;
  onAddLecture: (lecture: NewLecture) => Promise<void>;
  onRemoveLecture: (id: string) => void;
  onImport: (name: string, category: ImportedCalendar["category"], text: string) => Promise<void>;
  onRemoveCalendar: (id: string) => void;
}

function DeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="text-muted rounded-lg p-2 hover:bg-red-500/10 hover:text-red-600"
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}

function lectureSummary(l: Lecture) {
  return `${WEEKDAYS[l.weekday - 1]} ${l.start}–${l.end} · ${getTerm(l.termId)?.name ?? "Unknown term"}`;
}

/** Add lectures, upload calendar files and remove both. */
export function ManagePanel(props: ManagePanelProps) {
  const { data } = props;

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 font-semibold">Add a lecture</h2>
        <LectureForm defaultTermId={props.defaultTermId} onSubmit={props.onAddLecture} />
      </Card>

      <Card>
        <h2 className="mb-1 font-semibold">Import a calendar file</h2>
        <p className="text-muted mb-3 text-sm">
          Exam calendar export or Moodle (Calendar → Export calendar). Stays on this device.
        </p>
        <CalendarUpload onImport={props.onImport} />
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold">Your lectures</h2>
        {data.lectures.length === 0 ? (
          <p className="text-muted text-sm">No lectures yet.</p>
        ) : (
          <ul className="divide-border divide-y">
            {data.lectures.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 py-2">
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{l.title}</span>
                  <span className="text-muted block text-xs">{lectureSummary(l)}</span>
                </span>
                <DeleteButton
                  label={`Delete ${l.title}`}
                  onClick={() => props.onRemoveLecture(l.id)}
                />
              </li>
            ))}
          </ul>
        )}

        <h2 className="mt-4 mb-2 font-semibold">Imported calendars</h2>
        {data.calendars.length === 0 ? (
          <p className="text-muted text-sm">No files imported yet.</p>
        ) : (
          <ul className="divide-border divide-y">
            {data.calendars.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{c.name}</span>
                  <span className="text-muted block text-xs">
                    {c.category === "exam" ? "Exams" : "Deadlines"} · {c.events.length} events
                  </span>
                </span>
                <DeleteButton
                  label={`Remove ${c.name}`}
                  onClick={() => props.onRemoveCalendar(c.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
