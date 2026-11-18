"use client";

import { GraduationCap, ListChecks, Trophy, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { GroupedList, ListRow } from "@/components/ui/GroupedList";
import { FOOD_VENUES } from "@/data/food-options";
import { dueTodos, nextLecture, nowInLisbon, openMatches, startsIn } from "@/lib/home/today";
import { padelService } from "@/lib/services/padel.service";
import { timetableService } from "@/lib/services/timetable.service";
import { todoService } from "@/lib/services/todo.service";
import { eventsBetween } from "@/lib/timetable/schedule";
import { todayInLisbon } from "@/lib/timetable/dates";
import type { PadelMatch } from "@/types/padel";
import type { TimetableEvent } from "@/types/timetable";
import type { Todo } from "@/types/todo";

interface Today {
  time: string;
  lecture: TimetableEvent | null;
  matches: PadelMatch[];
  todos: Todo[];
}

const ICON = "size-[19px]";

/** "Up next" and "Today on campus": one glance at the day, built from the other modules. */
export function TodayView() {
  const [today, setToday] = useState<Today | null>(null);

  useEffect(() => {
    let cancelled = false;
    const date = todayInLisbon();
    const time = nowInLisbon();
    // Each module may fail on its own (e.g. Supabase offline); the rest still shows.
    Promise.all([
      timetableService
        .load()
        .then((data) => nextLecture(eventsBetween(data, date, date), time))
        .catch(() => null),
      padelService
        .listMatches({ date })
        .then((m) => openMatches(m, time))
        .catch(() => []),
      todoService
        .listTodos()
        .then((t) => dueTodos(t, date))
        .catch(() => []),
    ]).then(([lecture, matches, todos]) => {
      if (!cancelled) setToday({ time, lecture, matches, todos });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!today) {
    return (
      <div aria-busy className="flex flex-col gap-6">
        <div className="bg-surface h-[72px] animate-pulse rounded-3xl" />
        <div className="bg-surface h-[168px] animate-pulse rounded-3xl" />
      </div>
    );
  }

  const { lecture, matches, todos, time } = today;

  return (
    <div className="flex flex-col gap-6">
      <GroupedList title="Up next">
        {lecture ? (
          <ListRow
            href="/timetable"
            icon={<GraduationCap className={ICON} strokeWidth={2} aria-hidden />}
            title={lecture.title}
            subtitle={[`${lecture.start}–${lecture.end}`, lecture.location]
              .filter(Boolean)
              .join(" · ")}
            detail={
              <span className="bg-brand/10 text-brand rounded-full px-2.5 py-1 text-[13px] font-semibold">
                {startsIn(lecture.start!, time)}
              </span>
            }
          />
        ) : (
          <ListRow
            href="/timetable"
            icon={<GraduationCap className={ICON} strokeWidth={2} aria-hidden />}
            title="No more lectures today"
            subtitle="Open your timetable"
          />
        )}
      </GroupedList>

      <GroupedList title="Today on campus">
        <ListRow
          href="/canteen"
          tone="food"
          icon={<UtensilsCrossed className={ICON} strokeWidth={2} aria-hidden />}
          title="Food Options"
          detail={`${FOOD_VENUES.length} places`}
        />
        <ListRow
          href="/sport/padel"
          tone="sport"
          icon={<Trophy className={ICON} strokeWidth={2} aria-hidden />}
          title="Padel"
          detail={matches.length > 0 ? `${matches.length} open` : "None today"}
        />
        <ListRow
          href="/study/todos"
          tone="task"
          icon={<ListChecks className={ICON} strokeWidth={2} aria-hidden />}
          title="To-dos due"
          detail={todos.length > 0 ? String(todos.length) : "All done"}
        />
      </GroupedList>
    </div>
  );
}
