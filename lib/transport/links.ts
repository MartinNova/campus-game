/** Nova SBE Carcavelos campus (OpenStreetMap). */
export const CAMPUS = {
  name: "Nova SBE",
  address: "Rua da Holanda 1, 2775-405 Carcavelos",
  lat: 38.6782,
  lon: -9.3259,
};

interface Place {
  lat: number;
  lon: number;
}

/** Small embedded Google map (no API key needed). */
export function mapEmbedUrl({ lat, lon }: Place, zoom = 15): string {
  return `https://www.google.com/maps?q=${lat},${lon}&z=${zoom}&output=embed`;
}

/** Opens Google Maps (app or web) with a route to `to`. */
export function directionsUrl(
  to: Place,
  mode: "transit" | "walking" | "driving",
  from?: Place,
): string {
  const params = new URLSearchParams({
    api: "1",
    destination: `${to.lat},${to.lon}`,
    travelmode: mode,
  });
  if (from) params.set("origin", `${from.lat},${from.lon}`);
  return `https://www.google.com/maps/dir/?${params}`;
}

/**
 * Uber universal link: opens the Uber app with pickup = current location and the
 * destination already filled in. The rider sees the live price and confirms in Uber.
 */
export function uberUrl(to: Place & { name: string; address: string }): string {
  const params = new URLSearchParams({
    action: "setPickup",
    pickup: "my_location",
    "dropoff[latitude]": String(to.lat),
    "dropoff[longitude]": String(to.lon),
    "dropoff[nickname]": to.name,
    "dropoff[formatted_address]": to.address,
  });
  return `https://m.uber.com/ul/?${params}`;
}
