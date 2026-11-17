/**
 * Gym module: data contract.
 *
 * IMPORTANT: placeholder only. Use mock data in data/gym.mock.ts.
 * No scraping of the Viva Gym website and no unofficial APIs. Real data is
 * added only after the usage rights are cleared.
 */

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface GymLocation {
  id: string;
  name: string;
  address: string;
  /** e.g. { mon: "06:30-23:00", sun: "closed" } */
  openingHours: Partial<Record<Weekday, string>>;
  classTypes: string[];
}

export interface GymService {
  listLocations(): Promise<GymLocation[]>;
}
