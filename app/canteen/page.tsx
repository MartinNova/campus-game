import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { VenueCard } from "@/components/canteen/VenueCard";
import { FOOD_VENUES } from "@/data/food-options";

export const metadata: Metadata = { title: "Food Options" };
export default function FoodOptionsPage() {
  return (
    <>
      <PageHeader
        title="Food Options"
        subtitle="From quick bites to long lunch breaks – discover what's cooking on campus."
      />
      <div className="relative mb-8 aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/9]">
        <Image
          src="/images/nova-canteen.png"
          alt="Lunch on a terrace overlooking the Nova SBE campus courtyard."
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          preload
          className="object-cover"
        />
      </div>
      <section aria-labelledby="food-venues" className="space-y-4">
        <h2 id="food-venues" className="text-xl font-semibold tracking-tight">
          Explore campus food
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FOOD_VENUES.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>
    </>
  );
}
