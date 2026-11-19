"use client";

import { TodayView } from "./TodayView";
import { useToday } from "./useToday";
import { WidgetStack } from "./WidgetStack";

/** Home content: the widget stack, then today's list. Both share one load of today's data. */
export function HomeView() {
  const today = useToday();
  return (
    <div className="flex flex-col gap-4">
      <WidgetStack today={today} />
      <TodayView today={today} />
    </div>
  );
}
