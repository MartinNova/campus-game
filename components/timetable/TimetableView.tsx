"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { timetableService } from "@/lib/services/timetable.service";
import { readJSON, writeJSON } from "@/lib/storage";
import { addDays, formatDay, startOfWeek, todayInLisbon } from "@/lib/timetable/dates";
import { eventsBetween, filterByCategory } from "@/lib/timetable/schedule";
import { suggestTerm } from "@/lib/timetable/terms";
import type { EventCategory, NewLecture, TimetableData } from "@/types/timetable";
import { CategoryFilter } from "./CategoryFilter";
import { EventRow } from "./EventRow";
import { ManagePanel } from "./ManagePanel";
import { WeekAgenda } from "./WeekAgenda";

const FILTER_KEY = "timetable:filter";
const ALL: EventCategory[] = ["lecture", "exam", "deadline", "holiday"];
type Tab = "schedule" | "manage";

/** Timetable page body: week agenda with filters, plus a tab to manage lectures and files. */
export function TimetableView() {
  const [data, setData] = useState<TimetableData | null>(null);
  const [today, setToday] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [visible, setVisible] = useState<EventCategory[]>(ALL);
  const [tab, setTab] = useState<Tab>("schedule");

  // Load after hydration: the data lives in this browser only.
  useEffect(() => {
    timetableService.load().then((loaded) => {
      setData(loaded);
      setToday(todayInLisbon());
      setVisible(readJSON<EventCategory[]>(FILTER_KEY, ALL));
    });
  }, []);

  const weekStart = today ? addDays(startOfWeek(today), weekOffset * 7) : null;

  const weekEvents = useMemo(
    () =>
      data && weekStart
        ? filterByCategory(eventsBetween(data, weekStart, addDays(weekStart, 6)), visible)
        : [],
    [data, weekStart, visible],
  );

  const upcoming = useMemo(
    () =>
      data && today
        ? filterByCategory(eventsBetween(data, today, addDays(today, 30)), [
            "exam",
            "deadline",
          ]).slice(0, 3)
        : [],
    [data, today],
  );

  if (!data || !today || !weekStart) {
    return <div className="bg-border h-64 animate-pulse rounded-2xl" aria-busy="true" />;
  }

  function toggle(category: EventCategory) {
    const next = visible.includes(category)
      ? visible.filter((c) => c !== category)
      : [...visible, category];
    setVisible(next);
    writeJSON(FILTER_KEY, next);
  }

  const handlers = {
    onAddLecture: async (lecture: NewLecture) =>
      setData(await timetableService.addLecture(lecture)),
    onRemoveLecture: async (id: string) => setData(await timetableService.removeLecture(id)),
    onImport: async (name: string, category: "exam" | "deadline", text: string) =>
      setData(await timetableService.importCalendar(name, category, text)),
    onRemoveCalendar: async (id: string) => setData(await timetableService.removeCalendar(id)),
  };

  const isEmpty = data.lectures.length === 0 && data.calendars.length === 0;

  return (
    <>
      <div role="tablist" aria-label="Timetable" className="bg-border/60 mb-4 flex rounded-xl p-1">
        {(["schedule", "manage"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`focus-visible:outline-brand flex-1 rounded-lg py-2 text-sm font-medium transition-colors focus-visible:outline-2 ${
              tab === id ? "bg-surface shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {id === "schedule" ? "Schedule" : "Add & import"}
          </button>
        ))}
      </div>

      {tab === "manage" ? (
        <ManagePanel data={data} defaultTermId={suggestTerm(today).id} {...handlers} />
      ) : (
        <>
          {isEmpty && (
            <Card className="mb-4 text-sm">
              <p className="font-semibold">Set up your timetable</p>
              <p className="text-muted mt-1">
                Add your lectures once and upload your exam and Moodle calendar files under{" "}
                <button
                  type="button"
                  onClick={() => setTab("manage")}
                  className="text-brand font-medium underline"
                >
                  Add & import
                </button>
                .
              </p>
            </Card>
          )}

          {upcoming.length > 0 && (
            <section aria-label="Coming up" className="mb-5">
              <h2 className="text-muted mb-2 text-sm font-semibold tracking-wide uppercase">
                Coming up
              </h2>
              <div className="space-y-1.5">
                {upcoming.map((event) => (
                  <div key={event.id}>
                    <p className="text-muted mb-0.5 text-xs">
                      {formatDay(event.date, { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    <ul>
                      <EventRow event={event} />
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          <CategoryFilter visible={visible} onToggle={toggle} />
          <WeekAgenda
            weekStart={weekStart}
            today={today}
            events={weekEvents}
            onPrev={() => setWeekOffset((w) => w - 1)}
            onNext={() => setWeekOffset((w) => w + 1)}
            onToday={() => setWeekOffset(0)}
          />
          <p className="text-muted mt-5 text-xs">
            Your timetable is stored on this device only. Lectures follow the Nova SBE academic
            calendar 2026/27 and are skipped on Portuguese public holidays.
          </p>
        </>
      )}
    </>
  );
}
