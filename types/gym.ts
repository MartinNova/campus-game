/**
 * Gym module: data contract.
 *
 * The occupancy shown in the app is SIMULATED (see lib/gym/occupancy.ts), because
 * there are no real sensor or check-in data. No scraping of the Viva Gym website and
 * no unofficial APIs. Real data is added only after the usage rights are cleared.
 */

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** Opening hours of one day as "HH:MM". */
export interface DayHours {
  open: string;
  close: string;
}

export interface GymLocation {
  id: string;
  name: string;
  address: string;
  /** Link to the gym's own website. */
  website: string;
  openingHours: Record<Weekday, DayHours>;
  /** Rough number of people that fit in the gym at once (used by the simulation). */
  capacity: number;
}

/** green = quiet, yellow = moderate, red = busy */
export type OccupancyLevel = "low" | "medium" | "high";

export interface OccupancyReading {
  /** 0 to 100 */
  percent: number;
  level: OccupancyLevel;
  /** Estimated number of people in the gym. */
  people: number;
}
