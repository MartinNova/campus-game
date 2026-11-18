"use client";

import { Car, Footprints, MapPin, Navigation, TrainFront } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CAMPUS, directionsUrl, mapEmbedUrl, uberUrl } from "@/lib/transport/links";
import { formatMinutesAway, nextTrains, travelMinutes } from "@/lib/transport/trains";
import type { Direction, StationId } from "@/types/transport";
import { AfterClassCard } from "./AfterClassCard";
import { linkClass, readClock, Segmented, subscribeToClock, TRAINS } from "./shared";

/** CP page about replacement buses on the Linha de Cascais. */
const CP_BUS_INFO_URL = "https://www.cp.pt/info/pt/w/linha-de-cascais-servico-rodoviario";

const DIRECTIONS: { id: Direction; label: string }[] = [
  { id: "toCampus", label: "To campus" },
  { id: "toLisbon", label: "To Lisbon" },
  { id: "toCascais", label: "To Cascais" },
];

function TrainBoard() {
  // The clock is only known in the browser (the page is prerendered).
  const clock = useSyncExternalStore(subscribeToClock, readClock, () => null);
  const [station, setStation] = useState<StationId>("carcavelos");
  const [direction, setDirection] = useState<Direction>("toCampus");

  const stationName = TRAINS.stations[station].name;
  const [date, time] = clock?.split(" ") ?? [];
  const trains = clock ? nextTrains(TRAINS, station, direction, date, time, 5) : null;

  return (
    <Card className="grid gap-3">
      <h2 className="flex items-center gap-2 font-semibold">
        <TrainFront className="text-brand size-5" aria-hidden /> Trains · Linha de Cascais
      </h2>
      <Segmented
        label="Station"
        value={station}
        onChange={setStation}
        options={(Object.keys(TRAINS.stations) as StationId[]).map((id) => ({
          id,
          label: TRAINS.stations[id].name,
        }))}
      />
      <Segmented label="Direction" value={direction} onChange={setDirection} options={DIRECTIONS} />
      <p className="text-muted text-sm">
        {direction === "toCampus"
          ? `From Cais do Sodré to ${stationName}`
          : direction === "toLisbon"
            ? `From ${stationName} to Cais do Sodré`
            : `From ${stationName} towards Cascais`}
      </p>

      {!clock ? (
        <div className="bg-border h-48 animate-pulse rounded-xl" />
      ) : !trains ? (
        <p className="text-sm">
          The timetable needs an update. Check the CP app for now (see the README to refresh it).
        </p>
      ) : (
        <ul>
          {trains.map((t) => (
            <li
              key={`${t.time}-${t.minutesAway}`}
              className="border-border flex items-center gap-3 border-b py-2.5 last:border-0"
            >
              <span className="w-14 text-lg font-bold tabular-nums">{t.time}</span>
              <span className="text-muted min-w-0 flex-1 text-sm">
                {direction === "toCascais"
                  ? `to ${t.info}`
                  : `arr. ${t.info} · ${travelMinutes(t.time, t.info)} min`}
              </span>
              <Badge tone={t.minutesAway <= 10 ? "medium" : "neutral"}>
                {formatMinutesAway(t.minutesAway)}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      {trains && trains[0] && trains[0].minutesAway > 60 && (
        <p className="rounded-xl bg-amber-500/15 p-3 text-sm text-amber-800 dark:text-amber-300">
          No train in the next hour. During night works CP runs replacement buses:{" "}
          <a href={CP_BUS_INFO_URL} target="_blank" rel="noreferrer" className="underline">
            check CP
          </a>
          .
        </p>
      )}

      <a
        href={directionsUrl(TRAINS.stations[station], "walking", CAMPUS)}
        target="_blank"
        rel="noreferrer"
        className={linkClass}
      >
        <Footprints className="size-4" aria-hidden /> Walking route to {stationName}
      </a>
      <p className="text-muted text-xs">
        Official CP timetable, holidays included. Delays are not shown.
      </p>
    </Card>
  );
}

/** Map, Uber and the next trains: everything to get to and from the Carcavelos campus. */
export function GettingThereView() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <AfterClassCard />

      <Card className="grid gap-3 p-0">
        <iframe
          title="Map of the Nova SBE campus"
          src={mapEmbedUrl(CAMPUS)}
          className="h-56 w-full rounded-t-2xl border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="grid gap-3 px-4 pb-4">
          <p className="flex items-start gap-2 text-sm">
            <MapPin className="text-brand mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <span className="font-semibold">Nova SBE Carcavelos</span>
              <br />
              <span className="text-muted">{CAMPUS.address}</span>
            </span>
          </p>
          <a
            href={directionsUrl(CAMPUS, "transit")}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            <Navigation className="size-4" aria-hidden /> Route to campus in Google Maps
          </a>
        </div>
      </Card>

      <Card className="grid gap-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <Car className="text-brand size-5" aria-hidden /> Take a ride
        </h2>
        <a
          href={uberUrl(CAMPUS)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white hover:opacity-90 dark:bg-white dark:text-black"
        >
          Uber to Nova SBE
        </a>
        <p className="text-muted text-xs">
          Opens the Uber app with Nova SBE as destination. You see the live price there and confirm
          the ride yourself.
        </p>
      </Card>

      <TrainBoard />
    </div>
  );
}
