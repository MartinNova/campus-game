import { DEMO_MENU } from "@/data/canteen.mock";
import {
  MEAL_CATEGORIES,
  type CanteenProvider,
  type CanteenResult,
  type Freshness,
  type WeeklyMenu,
} from "@/types/canteen";

export function lisbonDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function weekStart(date: string): string {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  return addDays(date, -(day === 0 ? 6 : day - 1));
}
export function selectDate(start: string, today: string): string {
  return today >= start && today <= addDays(start, 4) ? today : start;
}
function isDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T12:00:00Z`)) &&
    addDays(value, 0) === value
  );
}
/** Reject malformed data; valid missing days/categories are handled as incomplete. */
export function isWeeklyMenu(value: unknown): value is WeeklyMenu {
  if (!value || typeof value !== "object") return false;
  const menu = value as WeeklyMenu;
  if (
    !isDate(menu.weekStart) ||
    weekStart(menu.weekStart) !== menu.weekStart ||
    menu.weekEnd !== addDays(menu.weekStart, 4) ||
    !Array.isArray(menu.days)
  )
    return false;
  const source = menu.source;
  if (
    !source ||
    !["demo", "authorized"].includes(source.kind) ||
    typeof source.label !== "string" ||
    !source.label.trim() ||
    typeof source.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(source.updatedAt))
  )
    return false;
  const dates = new Set<string>();
  return menu.days.every((day) => {
    if (
      !day ||
      !isDate(day.date) ||
      day.date < menu.weekStart ||
      day.date > menu.weekEnd ||
      dates.has(day.date) ||
      !Array.isArray(day.meals)
    )
      return false;
    dates.add(day.date);
    const categories = new Set<string>();
    return day.meals.every((meal) => {
      if (
        !meal ||
        !MEAL_CATEGORIES.includes(meal.category) ||
        categories.has(meal.category) ||
        !Array.isArray(meal.dishes) ||
        !meal.dishes.every((dish) => typeof dish === "string" && dish.trim().length > 0)
      )
        return false;
      categories.add(meal.category);
      return true;
    });
  });
}
/** Demo is never fresh. Authorized menus expire after 24 hours or outside their week. */
export function menuFreshness(menu: WeeklyMenu, now: Date): Freshness {
  if (menu.source.kind === "demo") return "demo";
  const age = now.getTime() - Date.parse(menu.source.updatedAt);
  const today = lisbonDate(now);
  return today < menu.weekStart || today > menu.weekEnd || age < 0 || age > 86400000
    ? "outdated"
    : "fresh";
}
export const demoProvider: CanteenProvider = {
  async getWeek() {
    return DEMO_MENU;
  },
};
export async function getCanteenMenu(
  now = new Date(),
  provider: CanteenProvider = demoProvider,
): Promise<CanteenResult> {
  const today = lisbonDate(now);
  const fallback: CanteenResult = {
    status: "unavailable",
    menu: null,
    freshness: null,
    selectedDate: selectDate(weekStart(today), today),
  };
  try {
    const menu = await provider.getWeek(weekStart(today));
    if (menu === null) return { ...fallback, status: "empty" };
    if (!isWeeklyMenu(menu)) return fallback;
    const empty = menu.days.every((day) => day.meals.every((meal) => meal.dishes.length === 0));
    const complete =
      menu.days.length === 5 &&
      menu.days.every((day) =>
        MEAL_CATEGORIES.every((category) =>
          day.meals.some((meal) => meal.category === category && meal.dishes.length > 0),
        ),
      );
    return {
      status: empty ? "empty" : complete ? "available" : "incomplete",
      menu,
      freshness: menuFreshness(menu, now),
      selectedDate: selectDate(menu.weekStart, today),
    };
  } catch {
    return fallback;
  }
}
