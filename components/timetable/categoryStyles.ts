import type { EventCategory } from "@/types/timetable";

/** Colours per category, used by the filter chips and the event rows. */
export const CATEGORY_STYLE: Record<EventCategory, { dot: string; border: string; chip: string }> =
  {
    lecture: {
      dot: "bg-brand",
      border: "border-l-brand",
      chip: "bg-brand text-brand-foreground border-brand",
    },
    exam: {
      dot: "bg-red-500",
      border: "border-l-red-500",
      chip: "bg-red-500 text-white border-red-500",
    },
    deadline: {
      dot: "bg-amber-500",
      border: "border-l-amber-500",
      chip: "bg-amber-500 text-white border-amber-500",
    },
    holiday: {
      dot: "bg-green-600",
      border: "border-l-green-600",
      chip: "bg-green-600 text-white border-green-600",
    },
  };
