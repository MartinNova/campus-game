import { CalendarClock, ExternalLink, MapPin, Route } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RUN_CLUBS } from "@/data/running-clubs";

/** Overview of the Lisbon run clubs with links to their own pages. */
export function RunClubList() {
  return (
    <div className="grid gap-3">
      <p className="text-muted text-sm">
        Club schedules change often. Check the club&apos;s own page before you go.
      </p>
      {RUN_CLUBS.map((club) => (
        <Card key={club.id}>
          <h2 className="font-semibold">{club.name}</h2>
          <p className="mt-1 text-sm">{club.description}</p>
          <ul className="text-muted mt-3 grid gap-1.5 text-sm">
            <li className="flex items-center gap-1.5">
              <CalendarClock className="size-4 shrink-0" aria-hidden /> {club.schedule}
            </li>
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden /> {club.meetingPoint}
            </li>
            {club.distance && (
              <li className="flex items-center gap-1.5">
                <Route className="size-4 shrink-0" aria-hidden /> {club.distance}
              </li>
            )}
          </ul>
          <div className="mt-3 flex flex-wrap gap-3">
            {club.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand inline-flex items-center gap-1 text-sm underline"
              >
                {link.label} <ExternalLink className="size-3.5" aria-hidden />
              </a>
            ))}
          </div>
          {club.weeklyRuns && (
            <p className="text-muted mt-2 text-xs">Its weekly runs are listed in the Runs tab.</p>
          )}
        </Card>
      ))}
    </div>
  );
}
