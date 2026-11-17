"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { surfSchoolService } from "@/lib/services/surf-school.service";
import { googleMapsSearchUrl } from "@/lib/surf/maps";
import { getSpot } from "@/lib/surf/spots";
import type { SurfSchool } from "@/types/surf";

function SchoolCard({ school }: { school: SurfSchool }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold">{school.name}</h3>
        {school.studentDiscount && <Badge tone="good">{school.studentDiscount}</Badge>}
      </div>
      <p className="text-muted mt-1 text-sm">{school.description}</p>
      {school.priceInfo && <p className="mt-2 text-sm font-medium">{school.priceInfo}</p>}
      <a
        href={googleMapsSearchUrl(school.mapsQuery)}
        target="_blank"
        rel="noreferrer"
        className="border-border bg-surface hover:border-brand focus-visible:outline-brand mt-3 inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium focus-visible:outline-2"
      >
        <MapPin className="size-4" aria-hidden />
        Open in Google Maps
      </a>
    </Card>
  );
}

/** Surf schools at the selected spot. */
export function SurfSchoolList({ spotId }: { spotId: string }) {
  const [result, setResult] = useState<{ spotId: string; schools: SurfSchool[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    surfSchoolService.listSchools(spotId).then((schools) => {
      if (!cancelled) setResult({ spotId, schools });
    });
    return () => {
      cancelled = true;
    };
  }, [spotId]);

  const schools = result?.spotId === spotId ? result.schools : null;
  const spotName = getSpot(spotId)?.name ?? "this spot";

  return (
    <>
      {schools === null ? (
        <div className="grid gap-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-border h-32 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : schools.length === 0 ? (
        <Card className="text-muted text-center text-sm">
          No surf schools listed for {spotName}.
        </Card>
      ) : (
        <div className="grid gap-3">
          {schools.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      )}

      <p className="text-muted mt-4 text-xs">
        Compiled from public listings. Prices are indicative; check with the school before booking.
      </p>
    </>
  );
}
