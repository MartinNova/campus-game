/**
 * Getting to campus: data contract.
 * Times are local Lisbon times "HH:MM". GTFS times after midnight can be "24:10" and
 * belong to the previous service day.
 */

export type StationId = "carcavelos" | "oeiras";

/**
 * toCampus = from Cais do Sodré to the station, toLisbon = from the station to Cais do Sodré,
 * toCascais = from the station towards Cascais / São Pedro do Estoril.
 */
export type Direction = "toCampus" | "toLisbon" | "toCascais";

/**
 * One departure: [departure time, info]. Info is the arrival time at the station (toCampus),
 * the arrival at Cais do Sodré (toLisbon) or the name of the last stop (toCascais).
 */
export type Departure = [string, string];

/** All departures of one station on one kind of day, per direction. */
export type StationDay = Record<Direction, Departure[]>;

export interface TrainTimetable {
  source: string;
  /** When the GTFS feed was downloaded, "YYYY-MM-DD". */
  fetched: string;
  stations: Record<StationId, { name: string; lat: number; lon: number }>;
  /** Distinct day schedules. */
  patterns: Record<StationId, StationDay>[];
  /** "YYYY-MM-DD" -> index into `patterns`. Dates missing here have no data. */
  days: Record<string, number>;
}

export interface NextTrain {
  time: string;
  /** Arrival time (toCampus, toLisbon) or the last stop (toCascais). */
  info: string;
  minutesAway: number;
}
