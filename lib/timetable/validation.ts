import { EVENT_CATEGORIES, type NewEvent, type NewLecture } from "@/types/timetable";
import { getTerm } from "./terms";

export const MAX_TITLE_LENGTH = 100;
export const MAX_LOCATION_LENGTH = 100;
/** Calendar exports are a few hundred KB at most; anything bigger is the wrong file. */
export const MAX_ICS_BYTES = 2 * 1024 * 1024;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function checkTitle(title: string): string | null {
  if (!title.trim()) return "Please enter a title.";
  if (title.trim().length > MAX_TITLE_LENGTH)
    return `The title can have at most ${MAX_TITLE_LENGTH} characters.`;
  return null;
}

function checkLocation(location: string | undefined): string | null {
  return location && location.trim().length > MAX_LOCATION_LENGTH
    ? `The room can have at most ${MAX_LOCATION_LENGTH} characters.`
    : null;
}

/** Returns an error message, or null if the weekly lecture can be saved. */
export function validateLecture(lecture: NewLecture): string | null {
  return (
    checkTitle(lecture.title) ??
    (!Number.isInteger(lecture.weekday) || lecture.weekday < 1 || lecture.weekday > 7
      ? "Pick a weekday."
      : null) ??
    (!TIME.test(lecture.start) || !TIME.test(lecture.end) ? "Pick a start and end time." : null) ??
    (lecture.end <= lecture.start ? "End time must be after start time." : null) ??
    (!getTerm(lecture.termId) ? "Pick a term." : null) ??
    checkLocation(lecture.location)
  );
}

/** Returns an error message, or null if the one-time event can be saved. */
export function validateEvent(event: NewEvent): string | null {
  return (
    checkTitle(event.title) ??
    (!(event.category in EVENT_CATEGORIES) ? "Pick a type." : null) ??
    (!DATE.test(event.date) ? "Pick a date." : null) ??
    (event.start && !TIME.test(event.start) ? "Pick a valid start time." : null) ??
    (event.end && !event.start ? "Add a start time too." : null) ??
    (event.end && !TIME.test(event.end) ? "Pick a valid end time." : null) ??
    (event.start && event.end && event.end <= event.start
      ? "End time must be after start time."
      : null) ??
    checkLocation(event.location)
  );
}

/** Returns an error message, or null if the file looks like a calendar export. */
export function validateIcsFile(file: { name: string; size: number }): string | null {
  if (!/\.ics$/i.test(file.name)) return "Please choose an .ics calendar file.";
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_ICS_BYTES) return "This file is too big for a calendar export (max. 2 MB).";
  return null;
}
