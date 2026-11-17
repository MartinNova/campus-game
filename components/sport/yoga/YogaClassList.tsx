import { CalendarDays, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { YOGA_WEEK_OF } from "@/data/yoga.mock";
import { yogaService } from "@/lib/services/yoga.service";
import type { YogaClass } from "@/types/yoga";

function ClassCard({ item }: { item: YogaClass }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold">Yoga</h3>
        <Badge tone="brand">Donation-based</Badge>
      </div>
      <ul className="text-muted mt-2 grid gap-1 text-sm">
        <li className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          {item.weekday}, {item.time}
        </li>
        <li className="flex items-center gap-2">
          <User className="size-4 shrink-0" aria-hidden />
          {item.teacher}
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" aria-hidden />
          {item.location}
        </li>
      </ul>
    </Card>
  );
}

/** Yoga classes of the current schedule snapshot. */
export async function YogaClassList() {
  const classes = await yogaService.listClasses();

  return (
    <section aria-labelledby="yoga-classes-heading">
      <h2 id="yoga-classes-heading" className="mb-2 text-sm font-semibold">
        Week of {YOGA_WEEK_OF}
      </h2>
      {classes.length === 0 ? (
        <Card className="text-muted text-center text-sm">No yoga classes listed this week.</Card>
      ) : (
        <div className="grid gap-3">
          {classes.map((item) => (
            <ClassCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
