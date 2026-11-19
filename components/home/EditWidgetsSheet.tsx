"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Sheet } from "@/components/timetable/Sheet";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_WIDGET_PREFS,
  moveWidget,
  toggleWidget,
  visibleWidgets,
  WIDGET_NAMES,
  type WidgetPrefs,
} from "@/lib/home/widgets";
import { WIDGET_META, WIDGET_TONE } from "./widgets";

interface EditWidgetsSheetProps {
  prefs: WidgetPrefs;
  onChange: (next: WidgetPrefs) => void;
  onClose: () => void;
}

/** Choose which widgets show on Home and in which order. Changes apply right away. */
export function EditWidgetsSheet({ prefs, onChange, onClose }: EditWidgetsSheetProps) {
  const onlyOneLeft = visibleWidgets(prefs).length <= 1;

  return (
    <Sheet
      title="Edit widgets"
      subtitle="Choose what you see at the top of Home."
      onClose={onClose}
    >
      <ul className="bg-background overflow-hidden rounded-2xl">
        {prefs.order.map((id, i) => {
          const { icon: Icon, tone } = WIDGET_META[id];
          const on = !prefs.hidden.includes(id);
          const locked = on && onlyOneLeft;
          return (
            <li
              key={id}
              className="border-border flex min-h-14 items-center gap-3 border-b pl-3 last:border-b-0"
            >
              <span
                className={`${WIDGET_TONE[tone]} flex size-[30px] shrink-0 items-center justify-center rounded-lg transition-opacity ${on ? "" : "opacity-40"}`}
              >
                <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
              </span>
              <span
                className={`flex-1 text-[17px] transition-opacity ${on ? "" : "opacity-50"}`}
                id={`widget-${id}`}
              >
                {WIDGET_NAMES[id]}
              </span>
              <span className="flex">
                <button
                  type="button"
                  onClick={() => onChange(moveWidget(prefs, id, -1))}
                  disabled={i === 0}
                  aria-label={`Move ${WIDGET_NAMES[id]} up`}
                  className="text-muted flex size-11 items-center justify-center active:opacity-50 disabled:opacity-25"
                >
                  <ChevronUp className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(moveWidget(prefs, id, 1))}
                  disabled={i === prefs.order.length - 1}
                  aria-label={`Move ${WIDGET_NAMES[id]} down`}
                  className="text-muted flex size-11 items-center justify-center active:opacity-50 disabled:opacity-25"
                >
                  <ChevronDown className="size-5" aria-hidden />
                </button>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-labelledby={`widget-${id}`}
                disabled={locked}
                title={locked ? "Keep at least one widget" : undefined}
                onClick={() => onChange(toggleWidget(prefs, id))}
                className="flex h-11 items-center pr-3 pl-1 disabled:opacity-50"
              >
                <span
                  className={`relative h-[31px] w-[51px] rounded-full transition-colors duration-200 ${on ? "bg-brand" : "bg-muted/30"}`}
                >
                  <span
                    className={`absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)] transition-transform duration-300 ease-[cubic-bezier(0.3,1.4,0.6,1)] ${on ? "translate-x-5" : ""}`}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onChange(DEFAULT_WIDGET_PREFS)}
          className="text-brand h-11 px-1 text-[15px] font-medium active:opacity-60"
        >
          Reset
        </button>
        <Button onClick={onClose}>Done</Button>
      </div>
    </Sheet>
  );
}
