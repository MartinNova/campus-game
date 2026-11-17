/**
 * Yoga module: data contract.
 * Classes are offered by the student club Nova MindSpace on campus.
 * Implement `YogaService` in lib/services/yoga.service.ts (static data first, Supabase later).
 */

export type YogaWeekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface YogaClass {
  id: string;
  weekday: YogaWeekday;
  /** 24h time range, e.g. "11:10-12:00". */
  time: string;
  teacher: string;
  location: string;
}

export interface YogaService {
  listClasses(): Promise<YogaClass[]>;
}
