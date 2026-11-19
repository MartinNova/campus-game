"use client";

import { GraduationCap, ListChecks, Trophy, UtensilsCrossed } from "lucide-react";
import { GroupedList, ListRow } from "@/components/ui/GroupedList";
import { FOOD_VENUES } from "@/data/food-options";
import { startsIn } from "@/lib/home/today";
import type { Today } from "./useToday";

const ICON = "size-[19px]";

/** "Up next" and "Today on campus": one glance at the day, built from the other modules. */
export function TodayView({ today }: { today: Today | null }) {
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
