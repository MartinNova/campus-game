import type { Term } from "@/types/timetable";

/**
 * Nova SBE Master's academic calendar 2026/27.
 * Source: "Incoming MSc Factsheet 2026/27" (novasbe.unl.pt). The school notes the calendar
 * may change. Update these dates every academic year.
 *
 * Semester courses (S1/S2) run 12 weeks, trimester courses (T1-T4) 6 weeks.
 * Classes on national holidays are cancelled (the school schedules make-up days).
 */
export const NOVA_TERMS: Term[] = [
  { id: "2026-s1", name: "S1 · Fall 2026 (semester)", start: "2026-08-31", end: "2026-12-04" },
  { id: "2026-t1", name: "T1 · Fall 2026", start: "2026-08-31", end: "2026-10-12" },
  { id: "2026-t2", name: "T2 · Fall 2026", start: "2026-10-22", end: "2026-12-04" },
  { id: "2027-s2", name: "S2 · Spring 2027 (semester)", start: "2027-02-01", end: "2027-05-14" },
  { id: "2027-t3", name: "T3 · Spring 2027", start: "2027-02-01", end: "2027-03-16" },
  { id: "2027-t4", name: "T4 · Spring 2027", start: "2027-04-05", end: "2027-05-14" },
];

export function getTerm(id: string): Term | undefined {
  return NOVA_TERMS.find((t) => t.id === id);
}

/** The term running on `date`, preferring trimesters; otherwise the next one to start. */
export function suggestTerm(date: string): Term {
  const running = NOVA_TERMS.filter((t) => t.start <= date && date <= t.end);
  const trimester = running.find((t) => t.id.includes("-t"));
  if (trimester) return trimester;
  if (running[0]) return running[0];
  return NOVA_TERMS.find((t) => t.start > date) ?? NOVA_TERMS[NOVA_TERMS.length - 1];
}
