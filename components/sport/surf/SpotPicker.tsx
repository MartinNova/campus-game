"use client";

import { SURF_SPOTS } from "@/lib/surf/spots";

interface SpotPickerProps {
  value: string;
  onChange: (spotId: string) => void;
}

/** Horizontally scrollable chips to choose a surf spot. */
export function SpotPicker({ value, onChange }: SpotPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Surf spot"
      className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1"
    >
      {SURF_SPOTS.map((spot) => {
        const selected = spot.id === value;
        return (
          <button
            key={spot.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(spot.id)}
            className={`focus-visible:outline-brand shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 ${
              selected
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-surface hover:border-brand"
            }`}
          >
            {spot.name}
          </button>
        );
      })}
    </div>
  );
}
