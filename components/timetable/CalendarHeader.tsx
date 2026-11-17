"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type CalendarView = "week" | "month";

interface CalendarHeaderProps {
  title: string;
  view: CalendarView;
  showToday: boolean;
  onViewChange: (view: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

/** Period title with prev/next arrows, a "Today" button and the Week/Month switch. */
export function CalendarHeader(props: CalendarHeaderProps) {
  const { title, view } = props;

  return (
    <div className="mb-3 space-y-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          onClick={props.onPrev}
          aria-label={`Previous ${view}`}
          className="px-2"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Button>
        <p className="flex-1 text-center font-semibold">{title}</p>
        <Button variant="ghost" onClick={props.onNext} aria-label={`Next ${view}`} className="px-2">
          <ChevronRight className="size-5" aria-hidden />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div
          role="tablist"
          aria-label="Calendar view"
          className="bg-border/60 flex flex-1 rounded-xl p-1"
        >
          {(["week", "month"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => props.onViewChange(v)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium capitalize transition-colors ${
                view === v ? "bg-surface shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          onClick={props.onToday}
          disabled={!props.showToday}
          className="h-9"
        >
          Today
        </Button>
      </div>
    </div>
  );
}
