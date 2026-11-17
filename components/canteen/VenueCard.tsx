import Link from "next/link";
import { ArrowRight, ArrowUpRight, Cherry, Pizza, Salad, UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { FoodVenue } from "@/types/food-options";

const ICONS = { meal: UtensilsCrossed, pizza: Pizza, bowl: Salad, fruit: Cherry };
export function VenueCard({ venue }: { venue: FoodVenue }) {
  const Icon = ICONS[venue.icon];
  const external = venue.destination.kind === "external";
  const content = (
    <Card className="group-hover:border-brand h-full space-y-5 p-5 transition-colors sm:p-6">
      <div className="flex items-center justify-between">
        <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-2xl">
          <Icon className="size-6" aria-hidden />
        </span>
        {external ? (
          <ArrowUpRight className="text-muted size-5" aria-hidden />
        ) : (
          <ArrowRight className="text-muted size-5" aria-hidden />
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{venue.name}</h3>
        <p className="text-muted mt-1 text-sm">{venue.subtitle}</p>
      </div>
      <p className="text-brand text-xs font-medium">
        {external ? "Official menu" : "Explore"}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </p>
    </Card>
  );
  const className =
    "group focus-visible:outline-brand block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4";
  return external ? (
    <a
      className={className}
      href={venue.destination.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
  ) : (
    <Link className={className} href={venue.destination.href}>
      {content}
    </Link>
  );
}
