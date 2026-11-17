export interface FoodVenue {
  id: string;
  name: string;
  subtitle: string;
  icon: "meal" | "pizza" | "bowl" | "fruit";
  destination:
    | { kind: "external"; href: `https://${string}` }
    | { kind: "internal"; href: `/canteen/${string}` };
}
