import type { WeeklyMenu } from "@/types/canteen";

/** Fixed synthetic examples. Never roll their dates forward or call them live data. */
export const DEMO_MENU: WeeklyMenu = {
  weekStart: "2026-11-16",
  weekEnd: "2026-11-20",
  source: {
    kind: "demo",
    label: "NOVA Life synthetic demo fixtures — not Mon Bistrot data",
    updatedAt: "2026-11-16T09:00:00Z",
  },
  days: [
    ["Tomato soup", "Lemon chicken with rice", "Chickpea and spinach stew"],
    ["Carrot soup", "Baked fish with potatoes", "Roasted vegetable couscous"],
    ["Pumpkin soup", "Turkey with mashed potatoes", "Lentil and mushroom pasta"],
    ["Vegetable soup", "Herb chicken with pasta", "Tofu and vegetable rice"],
    ["Pea soup", "Fish with vegetable rice", "Bean and sweet potato bowl"],
  ].map((dishes, index) => ({
    date: `2026-11-${16 + index}`,
    meals: (["soup", "main", "plant-based"] as const).map((category, meal) => ({
      category,
      dishes: [dishes[meal]],
    })),
  })),
};
