import type { FoodVenue } from "@/types/food-options";

export const FOOD_VENUES = [
  {
    id: "mon-bistrot",
    image: {
      src: "/images/food/mon-bistrot.png",
      alt: "AI-generated illustration of salmon, rice, soup and lemonade on a cafeteria tray.",
    },
    name: "Mon Bistrot",
    subtitle: "Daily meals & weekly menu",
    icon: "meal",
    destination: { kind: "external", href: "https://monbistrot.pt/novasbe" },
  },
  {
    id: "the-cut",
    image: {
      src: "/images/food/the-cut.png",
      alt: "AI-generated illustration of mozzarella pizza with garlic bread and a drink.",
    },
    name: "The Cut",
    subtitle: "Pizza, snacks & drinks",
    icon: "pizza",
    destination: { kind: "internal", href: "/canteen/the-cut" },
  },
  {
    id: "poke-house",
    image: {
      src: "/images/food/poke-house.png",
      alt: "AI-generated illustration of a salmon poke bowl with avocado, edamame and mango.",
    },
    name: "Poke House",
    subtitle: "Fresh bowls & salads",
    icon: "bowl",
    destination: { kind: "external", href: "https://poke-house.com/pt-pt/menu/" },
  },
  {
    id: "acai-natura",
    image: {
      src: "/images/food/acai-natura.png",
      alt: "AI-generated illustration of an açaí bowl with banana, berries and granola beside a smoothie.",
    },
    name: "Açaí Natura",
    subtitle: "Açaí bowls & smoothies",
    icon: "fruit",
    linkLabel: "Official website",
    destination: { kind: "external", href: "https://acainatura.com/" },
  },
] as const satisfies readonly FoodVenue[];
