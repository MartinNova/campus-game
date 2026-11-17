"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SPOT_ID, getSpot } from "@/lib/surf/spots";
import { readJSON, writeJSON } from "@/lib/storage";
import { SpotPicker } from "./SpotPicker";
import { SurfForecastView } from "./SurfForecastView";
import { SurfSchoolList } from "./SurfSchoolList";

const SPOT_KEY = "surf:spot";

const TABS = [
  { id: "forecast", label: "Forecast" },
  { id: "schools", label: "Surf schools" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Surf page body: tabs + spot picker shared by both tabs. */
export function SurfView() {
  const [tab, setTab] = useState<TabId>("forecast");
  const [spotId, setSpotId] = useState(DEFAULT_SPOT_ID);

  // Remember the last chosen spot (per browser).
  useEffect(() => {
    const saved = readJSON<string>(SPOT_KEY, DEFAULT_SPOT_ID);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore from storage after hydration
    if (getSpot(saved)) setSpotId(saved);
  }, []);

  function selectSpot(id: string) {
    setSpotId(id);
    writeJSON(SPOT_KEY, id);
  }

  return (
    <>
      <div role="tablist" aria-label="Surf" className="bg-border/60 mb-4 flex rounded-xl p-1">
        {TABS.map(({ id, label }) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              id={`surf-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`surf-panel-${id}`}
              onClick={() => setTab(id)}
              className={`focus-visible:outline-brand flex-1 rounded-lg py-2 text-sm font-medium transition-colors focus-visible:outline-2 ${
                selected ? "bg-surface shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <SpotPicker value={spotId} onChange={selectSpot} />

      <div role="tabpanel" id={`surf-panel-${tab}`} aria-labelledby={`surf-tab-${tab}`}>
        {tab === "forecast" ? (
          <SurfForecastView spotId={spotId} />
        ) : (
          <SurfSchoolList spotId={spotId} />
        )}
      </div>
    </>
  );
}
