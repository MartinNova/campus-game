import type { SurfSpot } from "@/types/surf";

/**
 * Surf spots near Lisbon.
 *
 * offshoreWindDirection = compass direction the wind comes FROM when it blows
 * from land to sea (offshore). Offshore wind keeps waves clean, onshore wind
 * makes them messy. Values are approximate for the main beach orientation.
 *
 * Note: Open-Meteo's marine model uses a ~5 km grid and picks the nearest sea
 * cell, so sheltered spots (e.g. Carcavelos in the Tagus mouth) can show
 * slightly bigger waves than on the beach.
 */
export const SURF_SPOTS: SurfSpot[] = [
  {
    id: "carcavelos",
    name: "Carcavelos",
    latitude: 38.677,
    longitude: -9.336,
    offshoreWindDirection: 0, // faces south -> offshore from north
  },
  {
    id: "costa-da-caparica",
    name: "Costa da Caparica",
    latitude: 38.635,
    longitude: -9.245,
    offshoreWindDirection: 90, // faces west -> offshore from east
  },
  {
    id: "guincho",
    name: "Guincho",
    latitude: 38.73,
    longitude: -9.475,
    offshoreWindDirection: 90, // faces west -> offshore from east
  },
  {
    id: "ericeira",
    name: "Ericeira (Ribeira d'Ilhas)",
    latitude: 38.988,
    longitude: -9.421,
    offshoreWindDirection: 90, // faces west -> offshore from east
  },
];

export const DEFAULT_SPOT_ID = SURF_SPOTS[0].id;

export function getSpot(id: string): SurfSpot | undefined {
  return SURF_SPOTS.find((spot) => spot.id === id);
}
