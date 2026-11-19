"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { WEEKDAYS } from "@/lib/timetable/dates";
import { normalizeUrl } from "@/lib/timetable/links";
import { NOVA_TERMS } from "@/lib/timetable/terms";
import { validateLecture } from "@/lib/timetable/validation";
import type { NewLecture } from "@/types/timetable";

const INPUT =
  "border-border bg-surface focus-visible:outline-brand h-10 w-full rounded-xl border px-3 text-sm focus-visible:outline-2";

interface LectureFormProps {
  defaultTermId: string;
  /** Optional pre-fill, e.g. when tapping a slot in the week grid. */
  defaultWeekday?: number;
  defaultStart?: string;
  defaultEnd?: string;
  onSubmit: (lecture: NewLecture) => Promise<void>;
}

/** Add a weekly lecture. It repeats every week of the chosen term. */
export function LectureForm({
  defaultTermId,
  defaultWeekday = 1,
  defaultStart = "09:30",
  defaultEnd = "11:00",
  onSubmit,
}: LectureFormProps) {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const lecture: NewLecture = {
      title: String(f.get("title")).trim(),
      weekday: Number(f.get("weekday")),
      start: String(f.get("start")),
      end: String(f.get("end")),
      location: String(f.get("location")).trim() || undefined,
      termId: String(f.get("termId")),
    };
    const moodleInput = String(f.get("moodleUrl") ?? "").trim();
    if (moodleInput) {
      const url = normalizeUrl(moodleInput);
      if (!url) {
        setError("Moodle link must be a web address, e.g. https://moodle.novasbe.pt/…");
        return;
      }
      lecture.moodleUrl = url;
    }
    const problem = validateLecture(lecture);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    try {
      await onSubmit(lecture);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the lecture.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Course</span>
        <input
          name="title"
          required
          maxLength={100}
          placeholder="e.g. Corporate Finance"
          className={INPUT}
        />
      </label>

      <div className="grid grid-cols-3 gap-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Day</span>
          <select name="weekday" defaultValue={String(defaultWeekday)} className={INPUT}>
            {WEEKDAYS.map((day, i) => (
              <option key={day} value={i + 1}>
                {day}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">From</span>
          <input name="start" type="time" required defaultValue={defaultStart} className={INPUT} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">To</span>
          <input name="end" type="time" required defaultValue={defaultEnd} className={INPUT} />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Room (optional)</span>
        <input name="location" maxLength={100} placeholder="e.g. B-201" className={INPUT} />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Moodle link (optional)</span>
        <input
          name="moodleUrl"
          type="url"
          inputMode="url"
          placeholder="https://moodle.novasbe.pt/course/view.php?id=…"
          className={INPUT}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Repeats weekly during</span>
        <select name="termId" defaultValue={defaultTermId} className={INPUT}>
          {NOVA_TERMS.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full">
        Add lecture
      </Button>
    </form>
  );
}
