import { describe, expect, it } from "vitest";
import type { NewEvent, NewLecture } from "@/types/timetable";
import { MAX_ICS_BYTES, validateEvent, validateIcsFile, validateLecture } from "./validation";

const lecture = (changes: Partial<NewLecture> = {}): NewLecture => ({
  title: "Corporate Finance",
  weekday: 2,
  start: "09:30",
  end: "11:00",
  termId: "2026-t2",
  ...changes,
});

const event = (changes: Partial<NewEvent> = {}): NewEvent => ({
  title: "Group meeting",
  category: "deadline",
  date: "2026-11-20",
  start: "14:00",
  end: "15:00",
  ...changes,
});

describe("validateLecture", () => {
  it("accepts a normal lecture", () => {
    expect(validateLecture(lecture())).toBeNull();
  });

  it("rejects blank or long titles, bad times and unknown terms", () => {
    expect(validateLecture(lecture({ title: "   " }))).toMatch(/title/);
    expect(validateLecture(lecture({ title: "x".repeat(100) }))).toBeNull();
    expect(validateLecture(lecture({ title: "x".repeat(101) }))).toMatch(/100/);
    expect(validateLecture(lecture({ end: "09:30" }))).toMatch(/after start/);
    expect(validateLecture(lecture({ start: "25:00" }))).toMatch(/time/);
    expect(validateLecture(lecture({ weekday: 8 }))).toMatch(/weekday/);
    expect(validateLecture(lecture({ termId: "2099-t9" }))).toMatch(/term/);
    expect(validateLecture(lecture({ location: "x".repeat(101) }))).toMatch(/room/);
  });
});

describe("validateEvent", () => {
  it("accepts timed and all-day events", () => {
    expect(validateEvent(event())).toBeNull();
    expect(validateEvent(event({ start: undefined, end: undefined }))).toBeNull();
  });

  it("rejects blank titles, missing dates and wrong times", () => {
    expect(validateEvent(event({ title: "" }))).toMatch(/title/);
    expect(validateEvent(event({ date: "" }))).toMatch(/date/);
    expect(validateEvent(event({ end: "13:00" }))).toMatch(/after start/);
    expect(validateEvent(event({ start: undefined }))).toMatch(/start time/);
    expect(validateEvent(event({ category: "party" as never }))).toMatch(/type/);
  });
});

describe("validateIcsFile", () => {
  it("accepts .ics files up to 2 MB", () => {
    expect(validateIcsFile({ name: "exams.ics", size: 1000 })).toBeNull();
    expect(validateIcsFile({ name: "EXAMS.ICS", size: MAX_ICS_BYTES })).toBeNull();
  });

  it("rejects other files, empty and huge files", () => {
    expect(validateIcsFile({ name: "photo.jpg", size: 1000 })).toMatch(/\.ics/);
    expect(validateIcsFile({ name: "exams.ics", size: 0 })).toMatch(/empty/);
    expect(validateIcsFile({ name: "exams.ics", size: MAX_ICS_BYTES + 1 })).toMatch(/too big/);
  });
});
