import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Canteen" };

export default function CanteenPage() {
  return (
    <section aria-labelledby="canteen-title" className="space-y-5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/9]">
        <Image
          src="/images/nova-canteen.png"
          alt="Lunch on a terrace overlooking the Nova SBE campus courtyard."
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          preload
          className="object-cover object-center"
        />
      </div>
      <Card className="space-y-5 p-6 sm:p-8">
        <Badge tone="brand">
          <UtensilsCrossed className="mr-1.5 size-3" aria-hidden />
          Canteen
        </Badge>
        <div className="space-y-3">
          <h1
            id="canteen-title"
            className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Your Campus, Your Lunch.
          </h1>
          <p className="text-muted max-w-lg leading-relaxed">
            Take a break, grab a seat, and make time for lunch. Explore what’s on the menu at Mon
            Bistrot.
          </p>
        </div>
        <a
          href="https://monbistrot.pt/novasbe"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand text-brand-foreground focus-visible:outline-brand inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto"
        >
          View the official menu
          <ArrowUpRight className="size-4" aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <p className="text-muted text-xs leading-relaxed">
          Opens Mon Bistrot’s official website for its latest published menu and availability.
        </p>
      </Card>
    </section>
  );
}
