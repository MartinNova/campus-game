"use client";

import { useEffect, useState } from "react";
import { dueTodos, nextLecture, nowInLisbon, openMatches } from "@/lib/home/today";
import { padelService } from "@/lib/services/padel.service";
import { timetableService } from "@/lib/services/timetable.service";
import { todoService } from "@/lib/services/todo.service";
import { todayInLisbon } from "@/lib/timetable/dates";
import { eventsBetween } from "@/lib/timetable/schedule";
import type { PadelMatch } from "@/types/padel";
import type { TimetableEvent } from "@/types/timetable";
import type { Todo } from "@/types/todo";

export interface Today {
  time: string;
  lecture: TimetableEvent | null;
  matches: PadelMatch[];
  todos: Todo[];
}

/** Today's snapshot from the other modules. `null` while loading. */
export function useToday(): Today | null {
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

  return today;
}
