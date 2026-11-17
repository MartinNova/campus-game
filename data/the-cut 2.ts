import type { CutMenuCategory } from "@/types/the-cut";

// Transcribed from the five user-supplied photos taken on 17 November 2026.
// Pizzas/snacks/combo: photos 2, 4, 5. Extras: photo 1 (dedicated sign).
// Drinks/sweets: photos 3, 4, cross-checked against photo 2 where legible.
// Deliberately excludes daily dishes, pasta, social menus and general food court coffee variants.
// The Cut protein extras use the dedicated sign (€2.35); the food court lists the same
// proteins without a legible separate price. Burrata and nectar remain unresolved.
export const THE_CUT_MENU = [
  {
    id: "pizzas",
    title: "Pizzas",
    subtitle: "The Cut classics · ingredients as listed on the photographed menu",
    items: [
      {
        name: "Margherita",
        priceCents: 895,
        description: "Mozzarella and oregano",
      },
      {
        name: "Rustica",
        priceCents: 895,
        description: "Turkey ham, mushrooms and oregano",
      },
      {
        name: "Diavola",
        priceCents: 925,
        description: "Pepperoni, olives and oregano",
      },
      {
        name: "Funghi",
        priceCents: 925,
        description: "Mushrooms, cheddar cheese and mushrooms sauce",
      },
      {
        name: "Mediterrânea",
        priceCents: 995,
        description: "Pumpkin, courgette, red onion, parmesan and thyme",
      },
      {
        name: "Uovo",
        priceCents: 995,
        description: "Turkey ham, egg, mushrooms and basil",
      },
      {
        name: "Carbonara",
        priceCents: 995,
        description: "Cream, bacon, courgette and lemon thyme",
      },
      {
        name: "Pesto",
        priceCents: 1050,
        description: "Chicken, bacon, ricotta, basil and rocket pesto",
      },
      {
        name: "Caprese",
        priceCents: 1095,
        description: "Fresh mozzarella, tomato, basil and olive oil w/ garlic",
      },
      {
        name: "Burrata",
        priceCents: 1240,
        description: "Burrata, prosciutto and rocket",
      },
    ],
  },
  {
    id: "snacks",
    title: "Snacks",
    subtitle: "Something small on the side",
    items: [
      {
        name: "Garlic bread triangles w/ cheese",
        priceCents: 265,
        description: "Triângulos de pão de alho c/ queijo",
      },
      {
        name: "Mini salad w/ cherry tomato, ricotta, cheese, rocket and basil",
        priceCents: 265,
        description: "Mini salada c/ tomate cereja, ricotta e manjericão",
      },
    ],
  },
  {
    id: "combo",
    title: "Happy hour",
    subtitle: "Every day, 3 p.m. – 5 p.m. · photographed offer",
    items: [
      {
        name: "Pizza Calzone + drink",
        priceCents: 550,
        description: "Pizza Calzone + Bebida",
        review: "Included drink options and calzone filling are not specified. Confirm in store.",
      },
    ],
  },
  {
    id: "extras",
    title: "Extras",
    subtitle: "Extra ingredients · confirm conflicting prices with The Cut",
    items: [
      {
        name: "Extra mozzarella",
        priceCents: 185,
        description: "Extra mozzarella",
      },
      {
        name: "Cheddar",
        priceCents: 185,
        description: "Cheddar",
      },
      {
        name: "Fresh mozzarella",
        priceCents: 185,
        description: "Mozzarella fresca",
      },
      {
        name: "Ricotta",
        priceCents: 185,
        description: "Ricotta",
      },
      {
        name: "Capers",
        priceCents: 185,
        description: "Alcaparras",
      },
      {
        name: "Olives",
        priceCents: 185,
        description: "Azeitonas",
      },
      {
        name: "Mushrooms",
        priceCents: 185,
        description: "Cogumelos",
      },
      {
        name: "Courgette",
        priceCents: 185,
        description: "Courgette salteada",
      },
      {
        name: "Red peppers",
        priceCents: 185,
        description: "Pimentos salteados",
      },
      {
        name: "Rocket",
        priceCents: 185,
        description: "Rúcula",
      },
      {
        name: "Tomato",
        priceCents: 185,
        description: "Tomate laminado",
      },
      {
        name: "Mushrooms sauce",
        priceCents: 185,
        description: "Molho de cogumelos",
      },
      {
        name: "Egg",
        priceCents: 185,
        description: "Ovo",
      },
      {
        name: "Basil and rocket pesto",
        priceCents: 185,
        description: "Pesto de rúcula e manjericão",
      },
      {
        name: "Basil",
        priceCents: 185,
        description: "Manjericão",
      },
      {
        name: "Bacon",
        priceCents: 235,
        description: "Bacon tostado",
      },
      {
        name: "Turkey ham",
        priceCents: 235,
        description: "Fiambre de perú",
      },
      {
        name: "Chicken",
        priceCents: 235,
        description: "Peito de frango",
      },
      {
        name: "Pepperoni",
        priceCents: 235,
        description: "Pepperoni",
      },
      {
        name: "Prosciutto",
        priceCents: 235,
        description: "Presunto",
      },
      {
        name: "Burrata",
        priceCents: null,
        review:
          "Conflicting extra prices: €3.45 on the countertop sign and €4.45 on the food court board. Please confirm.",
      },
    ],
  },
  {
    id: "drinks",
    title: "Drinks & coffee",
    subtitle: "Items also shown on the drinks board beside The Cut snacks",
    items: [
      {
        name: "Água 50cl",
        priceCents: 110,
        description: "Still water",
      },
      {
        name: "Refrigerante de lata 33cl",
        priceCents: 190,
        description: "Soda can",
      },
      {
        name: "Super Bock 33cl",
        priceCents: 170,
        description: "Beer",
      },
      {
        name: "Néctar 20cl",
        priceCents: null,
        description: "Fruit nectar",
        review:
          "The dedicated drinks photo is not clear enough to confirm its price; the combined food court board lists €1.60.",
      },
      {
        name: "Limonadas",
        priceCents: 140,
        description: "Lemonade",
      },
      {
        name: "Morangada de alecrim",
        priceCents: 140,
        description: "Strawberry lemonade w/ rosemary",
      },
      {
        name: "Café / Descafeinado",
        priceCents: 90,
        description: "Coffee / decaf",
      },
    ],
  },
  {
    id: "sweets",
    title: "Sweets",
    subtitle: "From The Cut’s adjacent sweets board",
    items: [
      {
        name: "Nutella Roll",
        priceCents: 310,
        description: "Rolinho de Nutella",
      },
    ],
  },
] satisfies readonly CutMenuCategory[];

export const THE_CUT_REVIEW_NOTES = [
  "Burrata extra: €3.45 on the countertop sign, €4.45 on the food court board. No single price is asserted.",
  "Néctar 20cl: dedicated drinks-board price needs review; food court board lists €1.60. No single price is asserted.",
  "Protein extras: €2.35 on the dedicated extras sign; the food court board does not clearly show a separate price for that row.",
  "Mini salad: the English listing includes cheese and rocket; the Portuguese listing is shorter. Both are retained as photographed.",
  "Caprese: fresh mozzarella is explicitly listed in English although omitted from the shorter Portuguese wall text.",
  "Happy hour: the €5.50 calzone-and-drink offer is legible, but filling and eligible drinks are unspecified.",
] as const;
