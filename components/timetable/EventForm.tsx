"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { EventCategory, NewEvent } from "@/types/timetable";

const INPUT =
  "border-border bg-surface focus-visible:outline-brand h-10 w-full rounded-xl border px-3 text-sm focus-visible:outline-2";

const TYPES: { value: Exclude<EventCategory, "holiday">; label: string }[] = [
  { value: "lecture", label: "Class / meeting" },
  { value: "exam", label: "Exam" },
  { value: "deadline", label: "Deadline" },
];

interface EventFormProps {
  defaultDate: string;
  defaultStart?: string;
  defaultEnd?: string;
  onSubmit: (event: NewEvent) => Promise<void>;
}

/** Add a one-time event on a specific date (e.g. extra class, group meeting, exam). */
export function EventForm({ defaultDate, defaultStart, defaultEnd, onSubmit }: EventFormProps) {
  const [allDay, setAllDay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const start = allDay ? undefined : String(f.get("start")) || undefined;
    const end = allDay ? undefined : String(f.get("end")) || undefined;
    if (start && end && end <= start) {
      setError("End time must be after start time.");
      return;
    }
    setError(null);
    await onSubmit({
      title: String(f.get("title")).trim(),
      category: f.get("category") as NewEvent["category"],
      date: String(f.get("date")),
      start,
      end,
      location: String(f.get("location")).trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Title</span>
        <input name="title" required placeholder="e.g. Group project meeting" className={INPUT} />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Type</span>
        <select name="category" defaultValue="lecture" className={INPUT}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Date</span>
        <input name="date" type="date" required defaultValue={defaultDate} className={INPUT} />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
        All day
      </label>

      {!allDay && (
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">From</span>
            <input
              name="start"
              type="time"
              required
              defaultValue={defaultStart ?? "09:00"}
              className={INPUT}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">To (optional)</span>
            <input name="end" type="time" defaultValue={defaultEnd ?? ""} className={INPUT} />
          </label>
        </div>
      )}

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Place (optional)</span>
        <input name="location" placeholder="e.g. Library, room B-201" className={INPUT} />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full">
        Add to timetable
      </Button>
    </form>
  );
}
