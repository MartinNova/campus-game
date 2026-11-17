"use client";

import { EVENT_CATEGORIES, type EventCategory } from "@/types/timetable";
import { CATEGORY_STYLE } from "./categoryStyles";

interface CategoryFilterProps {
  visible: EventCategory[];
  onToggle: (category: EventCategory) => void;
}

/** Toggle chips: show/hide lectures, exams, deadlines and holidays. */
export function CategoryFilter({ visible, onToggle }: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter"
      className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1"
    >
      {(Object.keys(EVENT_CATEGORIES) as EventCategory[]).map((category) => {
        const on = visible.includes(category);
        return (
          <button
            key={category}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(category)}
            className={`focus-visible:outline-brand flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 ${
              on ? CATEGORY_STYLE[category].chip : "border-border bg-surface text-muted"
            }`}
          >
            {!on && (
              <span className={`size-2 rounded-full ${CATEGORY_STYLE[category].dot}`} aria-hidden />
            )}
            {EVENT_CATEGORIES[category]}
          </button>
        );
      })}
    </div>
  );
}
