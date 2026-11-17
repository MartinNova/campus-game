import type { FoodVenue } from "@/types/food-options";

export const FOOD_VENUES = [
  {
    id: "mon-bistrot",
    name: "Mon Bistrot",
    subtitle: "Daily meals & weekly menu",
    icon: "meal",
    destination: { kind: "external", href: "https://monbistrot.pt/novasbe" },
  },
  {
    id: "the-cut",
    name: "The Cut",
    subtitle: "Pizza, snacks & drinks",
    icon: "pizza",
    destination: { kind: "internal", href: "/canteen/the-cut" },
  },
  {
    id: "poke-house",
    name: "Poke House",
    subtitle: "Fresh bowls & salads",
    icon: "bowl",
    destination: { kind: "external", href: "https://poke-house.com/pt-pt/menu/" },
  },
  {
    id: "acai-natura",
    name: "Açaí Natura",
    subtitle: "Açaí bowls & smoothies",
    icon: "fruit",
    destination: { kind: "internal", href: "/canteen/acai-natura" },
  },
] as const satisfies readonly FoodVenue[];
