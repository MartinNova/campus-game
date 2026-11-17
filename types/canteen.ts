export const MEAL_CATEGORIES = ["soup", "main", "plant-based"] as const;
export type MealCategory = (typeof MEAL_CATEGORIES)[number];
export interface MenuDay {
  date: string;
  meals: { category: MealCategory; dishes: string[] }[];
}
export interface WeeklyMenu {
  weekStart: string;
  weekEnd: string;
  days: MenuDay[];
  source: {
    kind: "demo" | "authorized";
    label: string;
    updatedAt: string;
  };
}
export type Freshness = "demo" | "fresh" | "outdated";
export interface CanteenResult {
  status: "available" | "empty" | "unavailable" | "incomplete";
  menu: WeeklyMenu | null;
  freshness: Freshness | null;
  selectedDate: string;
}
/** An authorized adapter can implement this contract without changing the UI. */
export interface CanteenProvider {
  getWeek(weekStart: string): Promise<unknown>;
}
