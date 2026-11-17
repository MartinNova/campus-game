import type { GymLocation } from "@/types/gym";

/**
 * Viva Gym on the Nova SBE campus (Carcavelos).
 * Opening hours as shown by the gym, checked in November 2026.
 * Hours can change (e.g. on holidays), so always check the website.
 */
export const VIVA_GYM: GymLocation = {
  id: "viva-gym-carcavelos",
  name: "Viva Gym Carcavelos",
  address: "Campus de Carcavelos, R. da Holanda 1, 2775-405 Carcavelos",
  website: "https://www.vivagym.pt",
  scheduleUrl:
    "https://www.vivagym.com/pt-pt/ginasios/lisboa/lisboa-linha-cascais/clube-carcavelos/activity-calendar/",
  openingHours: {
    mon: { open: "06:00", close: "23:00" },
    tue: { open: "06:00", close: "23:00" },
    wed: { open: "06:00", close: "23:00" },
    thu: { open: "06:00", close: "23:00" },
    fri: { open: "06:00", close: "23:00" },
    sat: { open: "08:00", close: "21:00" },
    sun: { open: "08:00", close: "21:00" },
  },
};
