"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MEAL_CATEGORIES, type CanteenResult } from "@/types/canteen";

const LABELS = { soup: "Soup", main: "Main dish", "plant-based": "Plant-based" };
function dateLabel(date: string, weekday = false) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    ...(weekday ? { weekday: "short" as const } : {}),
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00Z`));
}
const MESSAGES = {
  available: "",
  empty: "No dishes have been published for this week.",
  unavailable: "The menu is unavailable. Please check the official menu below.",
  incomplete: "This menu is incomplete. Some days or meal categories have no dishes.",
};
export function WeeklyMenu({ result }: { result: CanteenResult }) {
  const [selected, setSelected] = useState(result.selectedDate);
  const { menu } = result;
  const demo = menu?.source.kind === "demo";
  const day = menu?.days.find((item) => item.date === selected);
  const dates = menu
    ? Array.from({ length: 5 }, (_, i) => {
        const value = new Date(`${menu.weekStart}T12:00:00Z`);
        value.setUTCDate(value.getUTCDate() + i);
        return value.toISOString().slice(0, 10);
      })
    : [];
  return (
    <div className="space-y-5">
      <Card className="border-brand bg-brand/10 space-y-3">
        <Badge tone="brand">{demo ? "DEMO DATA ONLY" : "Official menu"}</Badge>
        <h2 className="text-lg font-semibold">
          {demo ? "Example dishes — not the Mon Bistrot menu" : "Check the real Mon Bistrot menu"}
        </h2>
        <p className="text-muted text-sm">
          {demo
            ? "These synthetic dishes demonstrate NOVA Life. They do not describe meals served this week. No live menu integration is connected."
            : "Use Mon Bistrot’s website for the real menu and confirm availability with restaurant staff."}
        </p>
        <a
          href="https://monbistrot.pt/novasbe"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand focus-visible:outline-brand inline-block rounded font-semibold underline underline-offset-4 focus-visible:outline-2"
        >
          Open the real Mon Bistrot menu ↗ <span className="sr-only">(opens in a new tab)</span>
        </a>
      </Card>
      {MESSAGES[result.status] && <Card role="status">{MESSAGES[result.status]}</Card>}
      {menu && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mr-auto font-semibold">
              {demo ? "Demo week" : "Menu week"}: {dateLabel(menu.weekStart)} –{" "}
              {dateLabel(menu.weekEnd)} {menu.weekStart.slice(0, 4)}
            </h2>
            <Badge tone={result.freshness === "outdated" ? "medium" : "neutral"}>
              {result.freshness === "demo"
                ? "Synthetic fixture"
                : result.freshness === "outdated"
                  ? "Outdated"
                  : "Up to date"}
            </Badge>
          </div>
          {result.freshness === "outdated" && (
            <Card role="status">
              This menu is outside its valid week or has not been verified recently. Check the
              official menu before planning your meal.
            </Card>
          )}
          <div
            role="group"
            aria-label="Choose a menu day"
            className="grid grid-cols-2 gap-2 sm:grid-cols-5"
          >
            {dates.map((date) => (
              <Button
                key={date}
                variant={selected === date ? "primary" : "secondary"}
                aria-pressed={selected === date}
                onClick={() => setSelected(date)}
              >
                {dateLabel(date, true)}
              </Button>
            ))}
          </div>
          <section
            aria-live="polite"
            aria-atomic="true"
            aria-label="Selected day menu"
            className="space-y-3"
          >
            <h3 className="font-semibold">
              {dateLabel(selected, true)}
              {demo ? " · Demo dishes" : ""}
            </h3>
            {!day && <p className="text-muted">No menu has been provided for this day.</p>}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MEAL_CATEGORIES.map((category) => {
                const dishes = day?.meals.find((meal) => meal.category === category)?.dishes ?? [];
                return (
                  <Card key={category} className="space-y-3">
                    <h4 className="font-semibold">{LABELS[category]}</h4>
                    {dishes.length ? (
                      <ul className="space-y-2 text-sm">
                        {dishes.map((dish, index) => (
                          <li key={index}>
                            {dish}
                            {demo && <span className="text-muted"> (demo)</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted text-sm">No dish provided.</p>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
          <p className="text-muted text-xs">
            Source: {menu.source.label}. {demo ? "Fixture created" : "Source updated"}:{" "}
            {menu.source.updatedAt}. Dietary and allergen details must be confirmed with restaurant
            staff.
          </p>
        </>
      )}
    </div>
  );
}
