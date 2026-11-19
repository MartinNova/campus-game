"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { validateIcsFile } from "@/lib/timetable/validation";
import type { ImportedCalendar } from "@/types/timetable";

interface CalendarUploadProps {
  onImport: (name: string, category: ImportedCalendar["category"], text: string) => Promise<void>;
}

/** Upload an .ics file (exam export, Moodle deadlines). The file is read in the browser only. */
export function CalendarUpload({ onImport }: CalendarUploadProps) {
  const [category, setCategory] = useState<ImportedCalendar["category"]>("exam");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const problem = validateIcsFile(file);
    if (problem) {
      setMessage({ ok: false, text: problem });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    try {
      await onImport(file.name.replace(/\.ics$/i, ""), category, await file.text());
      setMessage({ ok: true, text: `Imported "${file.name}".` });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Import failed." });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <fieldset className="flex gap-2">
        <legend className="mb-1 text-sm font-medium">This file contains</legend>
        {(["exam", "deadline"] as const).map((value) => (
          <label
            key={value}
            className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-medium ${
              category === value ? "border-brand bg-brand/10 text-brand" : "border-border"
            }`}
          >
            <input
              type="radio"
              name="category"
              value={value}
              checked={category === value}
              onChange={() => setCategory(value)}
              className="sr-only"
            />
            {value === "exam" ? "Exams" : "Deadlines (Moodle)"}
          </label>
        ))}
      </fieldset>

      <label className="border-border hover:border-brand flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed p-5 text-center text-sm">
        <Upload className="text-brand size-5" aria-hidden />
        <span className="font-medium">Choose .ics file</span>
        <span className="text-muted text-xs">Uploading a file with the same name replaces it.</span>
        <input
          ref={inputRef}
          type="file"
          accept=".ics,text/calendar"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {message && (
        <p
          className={`text-sm ${message.ok ? "text-green-700 dark:text-green-400" : "text-red-600"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
