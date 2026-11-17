import { toISODate } from "@/lib/padel/dates";
import { MAX_PADEL_PLAYERS, type PadelMatch } from "@/types/padel";

/**
 * Example matches so the calendar isn't empty on first start.
 * Dates are relative to `today`, so the demo always shows upcoming games.
 * Players are the fictional demo accounts from data/users.mock.ts.
 */
export function createMockMatches(today: Date): PadelMatch[] {
  const inDays = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return toISODate(d);
  };
  const base = {
    maxPlayers: MAX_PADEL_PLAYERS,
    durationMinutes: 90,
    createdAt: today.toISOString(),
  };

  return [
    {
      ...base,
      id: "mock-1",
      date: inDays(0),
      time: "18:30",
      location: "Padel CIF",
      level: 2.5,
      playerIds: ["demo-1"],
      guestCount: 1,
      description: "Relaxed game after class, all good players welcome.",
      createdBy: "demo-1",
    },
    {
      ...base,
      id: "mock-2",
      date: inDays(1),
      time: "08:00",
      location: "Clube de Padel Alcântara",
      level: 1.5,
      playerIds: ["demo-2", "demo-5"],
      guestCount: 0,
      description: "Early morning beginners' game. Rackets can be rented at the club.",
      createdBy: "demo-2",
    },
    {
      ...base,
      id: "mock-3",
      date: inDays(3),
      time: "20:00",
      location: "LX Indoor Padel",
      level: 3.5,
      durationMinutes: 60,
      playerIds: ["demo-4"],
      guestCount: 0,
      description: "Looking for 3 competitive players.",
      createdBy: "demo-4",
    },
  ];
}
